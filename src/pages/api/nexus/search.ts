/**
 * NEXUS Search API - Faceted Entity Search
 * 
 * GET /api/nexus/search
 *   ?domain=fungi         - Required: Domain-Kontext
 *   ?q=rose               - Suchbegriff
 *   ?minRelevance=0.3     - Mindest-Relevanz (default: domain.searchSensitivity)
 *   ?perspectives=p1,p2   - Filter nach Perspektiven
 *   ?limit=50             - Max Ergebnisse
 *   ?offset=0             - Pagination
 * 
 * Gibt Entities zurück, sortiert nach Relevanz in der angefragten Domain.
 * 
 * @since v8.1.0 - Faceted Entity Graph
 */

import type { APIRoute } from 'astro';
import { searchEntitiesInDomain, loadDomains } from '@bifroest/database/data-access';
import { 
  validateQuery, 
  validatePerspectives, 
  validateNumber,
  checkRateLimit,
  logSecurityEvent
} from '../../../core/security';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=60'
};

export const GET: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'nexus/search' });
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 
        ...CORS_HEADERS,
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000))
      }
    });
  }

  const url = new URL(request.url);
  
  // Parse parameters
  const domain = url.searchParams.get('domain');
  const query = validateQuery(url.searchParams.get('q') || '');
  const perspectivesParam = url.searchParams.get('perspectives');
  const perspectives = perspectivesParam ? validatePerspectives(perspectivesParam) : undefined;
  const limit = validateNumber(url.searchParams.get('limit'), 1, 100, 50);
  const offset = validateNumber(url.searchParams.get('offset'), 0, 10000, 0);
  const minRelevanceParam = url.searchParams.get('minRelevance');
  const minRelevance = minRelevanceParam ? parseFloat(minRelevanceParam) : undefined;

  // Domain ist required
  if (!domain) {
    // Wenn keine Domain, gib Liste aller Domains zurück
    try {
      const domains = await loadDomains();
      return new Response(JSON.stringify({
        error: 'Domain parameter required',
        hint: 'Use ?domain=<slug> to search within a specific domain',
        availableDomains: domains.map(d => ({
          slug: d.slug,
          name: d.name,
          searchSensitivity: d.searchSensitivity
        }))
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Domain parameter required' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }
  }

  try {
    const results = await searchEntitiesInDomain({
      domain,
      query: query || undefined,
      minRelevance,
      perspectives,
      limit,
      offset
    });

    // Response formatieren
    const response = {
      success: true,
      domain,
      query: query || null,
      minRelevance: minRelevance ?? 'domain_default',
      total: results.length,
      hasMore: results.length === limit,
      results: results.map(r => ({
        // Core Entity Data
        id: r.entity.id,
        slug: r.entity.slug,
        name: r.entity.name,
        scientificName: r.entity.scientificName,
        description: r.entity.description,
        image: r.entity.image,
        
        // Domain Info
        primaryDomain: {
          slug: r.entity.primaryDomain.slug,
          name: r.entity.primaryDomain.name,
          color: r.entity.primaryDomain.color
        },
        
        // Relevanz für angefragte Domain
        relevance: r.relevance,
        matchReasons: r.matchReasons,
        
        // Facet-Daten für diese Domain (wenn vorhanden)
        facet: r.facet ? {
          perspectives: r.facet.perspectives,
          data: r.facet.data,
          relevanceSource: r.facet.relevanceSource
        } : null
      }))
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: CORS_HEADERS
    });

  } catch (error) {
    console.error('[Nexus Search] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};
