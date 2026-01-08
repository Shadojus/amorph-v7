/**
 * BIFRÖST NEXUS - Perspectives API
 * GET /api/nexus/perspectives - List all perspectives
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async () => {
  try {
    const perspectives = await prisma.perspective.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return new Response(JSON.stringify({
      success: true,
      count: perspectives.length,
      perspectives: perspectives.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        icon: p.icon
      }))
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('[Nexus/Perspectives] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch perspectives'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
