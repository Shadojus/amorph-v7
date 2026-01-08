/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: List external links with filtering
 * 
 * Database-based Version (PostgreSQL/Prisma)
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;

    // Filter parameters
    const entityId = searchParams.get('entityId');
    const sourceType = searchParams.get('source_type') || searchParams.get('type');
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);

    // Build where clause dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (entityId) {
      where.entityId = entityId;
    }
    
    if (sourceType) {
      where.type = sourceType;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If domain is provided, get entities for that domain first
    if (domain && !entityId) {
      const entities = await prisma.entity.findMany({
        where: { domainId: domain },
        select: { id: true }
      });
      if (entities.length > 0) {
        where.entityId = { in: entities.map(e => e.id) };
      }
    }

    // Count total
    const total = await prisma.externalLink.count({ where });

    // Fetch links with sorting by score
    const links = await prisma.externalLink.findMany({
      where,
      orderBy: { score: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        entity: {
          select: { name: true, domainId: true }
        }
      }
    });

    // Map to response format with relevance scores
    const linksWithRelevance = links.map(link => {
      let relevanceScore = 0.5;
      const matchReasons: string[] = [];

      if (entityId && link.entityId === entityId) {
        relevanceScore += 0.2;
        matchReasons.push(`entity:${entityId}`);
      }

      if (link.score > 0) {
        relevanceScore += Math.min(link.score * 0.02, 0.1);
        matchReasons.push(`votes:+${link.score}`);
      }

      return {
        id: link.id,
        url: link.url,
        title: link.title,
        description: link.description,
        type: link.type,
        thumbnail: link.thumbnail,
        score: link.score,
        isVerified: link.isVerified,
        entityId: link.entityId,
        entityName: link.entity?.name,
        domain: link.entity?.domainId,
        createdAt: link.createdAt,
        relevance_score: Math.min(relevanceScore, 1),
        match_reason: matchReasons
      };
    });

    // Get facets (link type counts)
    const typeCounts = await prisma.externalLink.groupBy({
      by: ['type'],
      _count: { _all: true }
    });
    
    const sourceTypes: Record<string, number> = {};
    for (const tc of typeCounts) {
      sourceTypes[tc.type] = tc._count._all;
    }

    return new Response(
      JSON.stringify({
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        links: linksWithRelevance,
        facets: { source_types: sourceTypes }
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
