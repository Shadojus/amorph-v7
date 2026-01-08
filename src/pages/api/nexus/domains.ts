/**
 * BIFRÖST NEXUS - Domains API
 * GET /api/nexus/domains - List all 17 scientific domains
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const includeStats = url.searchParams.get('stats') === 'true';
    
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: includeStats ? {
        _count: {
          select: { entities: true }
        }
      } : undefined
    });

    const response = {
      success: true,
      count: domains.length,
      domains: domains.map(d => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        description: d.description,
        color: d.color,
        icon: d.icon,
        ...(includeStats && { entityCount: (d as any)._count?.entities || 0 })
      }))
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('[Nexus/Domains] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch domains'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
