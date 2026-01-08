/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: List external links with filtering
 * 
 * PostgreSQL/Prisma Version
 */

import type { APIRoute } from 'astro';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;

    // Filter parameters
    const entityId = searchParams.get('entityId');
    const sourceType = searchParams.get('source_type');
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);

    // Sorting
    const sortParam = searchParams.get('sort') || '-createdAt';
    const sortField = sortParam.startsWith('-') ? sortParam.slice(1) : sortParam;
    const sortDir = sortParam.startsWith('-') ? 'desc' as const : 'asc' as const;

    // Build where clause
    const where: Prisma.ExternalLinkWhereInput = {
      isAlive: true
    };

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Count total
    const total = await prisma.externalLink.count({ where });

    // Fetch links
    const links = await prisma.externalLink.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip: (page - 1) * perPage,
      take: perPage
    });

    // Filter by entityId if provided (JSON array search)
    let filteredLinks = links;
    if (entityId) {
      filteredLinks = links.filter(link => {
        try {
          const entityIds = JSON.parse(link.entityIds as unknown as string || '[]');
          return Array.isArray(entityIds) && entityIds.includes(entityId);
        } catch {
          return false;
        }
      });
    }

    // Filter by domain if provided (JSON array search)
    if (domain) {
      filteredLinks = filteredLinks.filter(link => {
        try {
          const domains = JSON.parse(link.domains as unknown as string || '[]');
          return Array.isArray(domains) && domains.includes(domain);
        } catch {
          return false;
        }
      });
    }

    // Calculate relevance scores
    const linksWithRelevance = filteredLinks.map(link => {
      let relevanceScore = 0.5;
      const matchReasons: string[] = [];

      // Boost for entity match
      if (entityId) {
        try {
          const entityIds = JSON.parse(link.entityIds as unknown as string || '[]');
          if (Array.isArray(entityIds) && entityIds.includes(entityId)) {
            relevanceScore += 0.2;
            matchReasons.push(`entity:${entityId}`);
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Boost for positive votes
      const netVotes = (link.upvotes || 0) - (link.downvotes || 0);
      if (netVotes > 0) {
        relevanceScore += Math.min(netVotes * 0.02, 0.1);
        matchReasons.push(`votes:+${netVotes}`);
      }

      // Boost for expert verification
      if (link.expertVerified) {
        relevanceScore += 0.15;
        matchReasons.push('expert_verified');
      }

      return {
        id: link.id,
        url: link.url,
        title: link.title,
        description: link.description,
        sourceType: link.sourceType,
        authors: link.authors,
        publishedDate: link.publishedDate,
        thumbnailUrl: link.thumbnailUrl,
        language: link.language,
        domains: link.domains,
        perspectives: link.perspectives,
        entityIds: link.entityIds,
        upvotes: link.upvotes,
        downvotes: link.downvotes,
        expertVerified: link.expertVerified,
        isAlive: link.isAlive,
        lastChecked: link.lastChecked,
        addedBy: link.addedBy,
        createdAt: link.createdAt,
        relevance_score: Math.min(relevanceScore, 1),
        match_reason: matchReasons
      };
    });

    // Get facets
    const facetData = await prisma.externalLink.groupBy({
      by: ['sourceType'],
      where: { isAlive: true },
      _count: true
    });

    const facets = {
      source_types: facetData.reduce((acc, item) => {
        acc[item.sourceType] = item._count;
        return acc;
      }, {} as Record<string, number>)
    };

    return new Response(
      JSON.stringify({
        total: filteredLinks.length,
        page,
        per_page: perPage,
        total_pages: Math.ceil(filteredLinks.length / perPage),
        links: linksWithRelevance,
        facets
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[API] list error:', error);

    return new Response(
      JSON.stringify({
        total: 0,
        page: 1,
        per_page: 20,
        total_pages: 0,
        links: [],
        facets: { source_types: {} },
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
