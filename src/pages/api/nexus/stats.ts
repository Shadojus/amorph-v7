/**
 * BIFRÖST NEXUS - Statistics API
 * GET /api/nexus/stats - Get system-wide statistics
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async () => {
  try {
    // Parallel queries for stats
    const [
      domainCount,
      entityCount,
      linkCount,
      perspectiveCount,
      expertCount,
      facetCount,
      topDomains,
    ] = await Promise.all([
      prisma.domain.count({ where: { isActive: true } }),
      prisma.entity.count({ where: { isActive: true } }),
      prisma.externalLink.count(),
      prisma.perspective.count({ where: { isActive: true } }),
      prisma.expert.count({ where: { isActive: true } }),
      prisma.entityFacet.count(),
      // Top domains by entity count
      prisma.domain.findMany({
        where: { isActive: true },
        include: { _count: { select: { entities: true } } },
        orderBy: { entities: { _count: 'desc' } },
        take: 5
      }),
    ]);

    // Get recent links safely (may be empty)
    let recentLinks: any[] = [];
    try {
      if (linkCount > 0) {
        recentLinks = await prisma.externalLink.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            entity: {
              select: { name: true, domain: { select: { name: true, color: true } } }
            }
          }
        });
      }
    } catch {
      // Links table might have issues, continue without them
    }

    return new Response(JSON.stringify({
      success: true,
      stats: {
        domains: domainCount,
        entities: entityCount,
        links: linkCount,
        perspectives: perspectiveCount,
        experts: expertCount,
        facets: facetCount
      },
      topDomains: topDomains.map(d => ({
        slug: d.slug,
        name: d.name,
        color: d.color,
        entityCount: d._count.entities
      })),
      recentLinks: recentLinks.map(l => ({
        id: l.id,
        title: l.title,
        type: l.type,
        entityName: l.entity?.name || 'Unknown',
        domain: l.entity?.domain || null,
        createdAt: l.createdAt
      })),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('[Nexus/Stats] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch stats'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
