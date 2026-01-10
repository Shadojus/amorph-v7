/**
 * BIFRÖST NEXUS - Entities API
 * GET /api/nexus/entities - List entities with filtering
 * 
 * Query params:
 *   domain - Filter by domain slug
 *   search - Search in name/description
 *   page - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 100)
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = url.searchParams;
    
    const domainSlug = params.get('domain');
    const search = params.get('search') || params.get('q');
    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
    
    // Build where clause
    const where: any = { isActive: true };
    
    // Filter by domain
    if (domainSlug) {
      const domain = await prisma.domain.findUnique({
        where: { slug: domainSlug }
      });
      if (domain) {
        where.primaryDomainId = domain.id;
      }
    }
    
    // Search
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const total = await prisma.entity.count({ where });
    
    // Fetch entities
    const entities = await prisma.entity.findMany({
      where,
      orderBy: [
        { engagementScore: 'desc' },
        { name: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        primaryDomain: {
          select: { slug: true, name: true, color: true }
        },
        _count: {
          select: { externalLinks: true }
        }
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      entities: entities.map(e => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        scientificName: e.scientificName,
        description: e.description,
        image: e.image,
        domain: e.primaryDomain,
        linkCount: e._count.externalLinks,
        engagementScore: e.engagementScore
      }))
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('[Nexus/Entities] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch entities'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
