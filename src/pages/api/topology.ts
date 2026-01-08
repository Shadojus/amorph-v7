/**
 * BIFROEST NEXUS - Topology API
 *
 * GET /api/topology               - Vollständiger Graph
 * GET /api/topology?view=summary  - Nur Statistiken
 * GET /api/topology?view=intersections - Nur Überschneidungen
 * GET /api/topology?view=gaps     - Nur Lücken
 * GET /api/topology?domain=fungi  - Gefiltert nach Domain
 */

import type { APIRoute } from 'astro';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  checkRateLimit,
  logSecurityEvent
} from '../../core/security';

// Robuster Pfad: von amorph/ nach shared/topology/
function getTopologyPath(): string {
  // process.cwd() ist das amorph-Verzeichnis wenn dev läuft
  const cwd = process.cwd();

  // Prüfe ob wir in amorph sind
  if (cwd.endsWith('amorph')) {
    return join(cwd, '..', 'shared', 'topology');
  }

  // Fallback: Bifroest root
  return join(cwd, 'shared', 'topology');
}

interface TopologyStats {
  domainCount: number;
  perspectiveCount: number;
  fieldCount: number;
  intersectionCount: number;
  gapCount: number;
}

interface TopologyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  cached?: boolean;
}

// Simple in-memory cache
let cachedGraph: unknown = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

async function loadTopologyGraph(): Promise<unknown> {
  const now = Date.now();

  // Cache check
  if (cachedGraph && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedGraph;
  }

  try {
    const topologyDir = getTopologyPath();
    const graphPath = join(topologyDir, 'graph.json');
    console.log('[Topology API] Loading from:', graphPath);

    const content = await readFile(graphPath, 'utf-8');
    cachedGraph = JSON.parse(content);
    cacheTimestamp = now;
    return cachedGraph;
  } catch (error) {
    console.error('[Topology API] Failed to load graph:', error);
    return null;
  }
}

export const GET: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'topology' });
    return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000))
      }
    });
  }

  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'full';
  const domainFilter = url.searchParams.get('domain');

  try {
    const graph = await loadTopologyGraph() as {
      generatedAt: string;
      version: string;
      domains: string[];
      stats: TopologyStats;
      nodes: unknown[];
      intersections: unknown[];
      gaps: unknown[];
    } | null;

    if (!graph) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Topology graph not found. Run: node shared/topology/build-topology.mjs'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let responseData: TopologyResponse;

    switch (view) {
      case 'summary':
        responseData = {
          success: true,
          data: {
            generatedAt: graph.generatedAt,
            version: graph.version,
            domains: graph.domains,
            stats: graph.stats
          }
        };
        break;

      case 'intersections':
        let intersections = graph.intersections;
        if (domainFilter) {
          intersections = intersections.filter((i: { domains?: string[] }) =>
            i.domains?.includes(domainFilter)
          );
        }
        responseData = {
          success: true,
          data: {
            count: intersections.length,
            intersections
          }
        };
        break;

      case 'gaps':
        let gaps = graph.gaps;
        if (domainFilter) {
          gaps = gaps.filter((g: { domain?: string }) =>
            g.domain === domainFilter
          );
        }
        responseData = {
          success: true,
          data: {
            count: gaps.length,
            gaps
          }
        };
        break;

      case 'nodes':
        let nodes = graph.nodes;
        if (domainFilter) {
          nodes = nodes.filter((n: { domain?: string }) =>
            n.domain === domainFilter
          );
        }
        responseData = {
          success: true,
          data: {
            count: nodes.length,
            nodes
          }
        };
        break;

      case 'full':
      default:
        if (domainFilter) {
          responseData = {
            success: true,
            data: {
              ...graph,
              nodes: graph.nodes.filter((n: { domain?: string }) =>
                n.domain === domainFilter
              ),
              intersections: graph.intersections.filter((i: { domains?: string[] }) =>
                i.domains?.includes(domainFilter)
              ),
              gaps: graph.gaps.filter((g: { domain?: string }) =>
                g.domain === domainFilter
              )
            }
          };
        } else {
          responseData = {
            success: true,
            data: graph
          };
        }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('[Topology API] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
