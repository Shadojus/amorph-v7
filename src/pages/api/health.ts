/**
 * AMORPH Health Check API
 * 
 * GET /api/health
 * 
 * Returns system health status including:
 * - Pocketbase connection
 * - Cache statistics
 * - System info
 */

import type { APIRoute } from 'astro';
import { checkBifroestConnection, getBifroestStatus } from '../../server/bifroest';
import { cache } from '../../server/cache';

export const GET: APIRoute = async () => {
  const startTime = Date.now();
  
  // Check Pocketbase connection
  const pocketbaseHealthy = await checkBifroestConnection();
  const bifroestStatus = getBifroestStatus();
  
  // Get cache stats
  const cacheStats = cache.stats();
  
  // Build response
  const health = {
    status: pocketbaseHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    version: '7.0.0',
    services: {
      pocketbase: {
        status: pocketbaseHealthy ? 'up' : 'down',
        url: bifroestStatus.url,
        lastCheck: bifroestStatus.lastCheck ? new Date(bifroestStatus.lastCheck).toISOString() : null
      },
      cache: {
        status: 'up',
        entries: cacheStats.size,
        enabled: process.env.ENABLE_CACHE !== 'false'
      }
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      dataSource: process.env.DATA_SOURCE || 'pocketbase'
    }
  };

  const statusCode = pocketbaseHealthy ? 200 : 503;

  return new Response(JSON.stringify(health, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};
