/**
 * BIFRÖST NEXUS - Index/Health API
 * GET /api/nexus - API index and health check
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async () => {
  try {
    // Quick health check
    const startTime = Date.now();
    const domainCount = await prisma.domain.count();
    const dbLatency = Date.now() - startTime;

    return new Response(JSON.stringify({
      name: 'BIFRÖST NEXUS API',
      version: '1.0.0',
      status: 'healthy',
      database: {
        connected: true,
        latency: `${dbLatency}ms`,
        domains: domainCount
      },
      endpoints: {
        domains: '/api/nexus/domains',
        entities: '/api/nexus/entities',
        experts: '/api/nexus/experts',
        links: '/api/nexus/links',
        vote: '/api/nexus/vote',
        perspectives: '/api/nexus/perspectives',
        stats: '/api/nexus/stats'
      },
      documentation: 'https://github.com/Shadojus/bifroest',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[Nexus] Health check failed:', error);
    return new Response(JSON.stringify({
      name: 'BIFRÖST NEXUS API',
      version: '1.0.0',
      status: 'unhealthy',
      database: {
        connected: false,
        error: String(error)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
