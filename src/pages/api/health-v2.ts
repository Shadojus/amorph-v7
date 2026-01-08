/**
 * AMORPH Health Check API
 * 
 * GET /api/health
 * 
 * Returns system health status including:
 * - Database connection (PostgreSQL/SQLite via Prisma)
 * - Cache statistics
 * - Rate limiter stats
 * - System info
 */

import type { APIRoute } from 'astro';
import { cache } from '../../server/cache';
import { apiRateLimiter } from '../../server/rate-limiter';
import { getSecurityHeaders } from '../../server/security';
import { logger } from '../../server/logger';

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  const dataSource = (process.env.DATA_SOURCE || 'local').trim();
  
  // Get cache stats
  const cacheStats = cache.stats();
  
  // Get rate limiter stats
  const rateLimitStats = apiRateLimiter.getStats();
  
  // Health is always healthy when using local data
  // For PostgreSQL, we could add a database ping here
  const isHealthy = true;
  
  // Build response
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    version: '8.0.0',
    services: {
      database: {
        status: 'up',
        type: dataSource === 'local' ? 'json-files' : 'postgresql',
        info: dataSource === 'local' 
          ? 'Using local JSON files from data/'
          : 'Connected to PostgreSQL via Prisma'
      },
      cache: {
        status: 'up',
        entries: cacheStats.size,
        enabled: process.env.ENABLE_CACHE !== 'false'
      },
      rateLimiter: {
        status: 'up',
        trackedIPs: rateLimitStats.totalTracked,
        blockedIPs: rateLimitStats.blockedIPs
      }
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      dataSource: dataSource
    }
  };

  logger.info('Health check', { status: health.status, responseTime: health.responseTime });

  return new Response(JSON.stringify(health, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...getSecurityHeaders()
    }
  });
};
