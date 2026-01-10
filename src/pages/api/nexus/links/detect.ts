/**
 * BIFRÖST NEXUS - Link Detection API
 * GET /api/nexus/links/detect?url=<url>
 * 
 * Erkennt automatisch den Quellentyp und holt Metadaten
 * für eine gegebene URL.
 */

import type { APIRoute } from 'astro';
import { detectSourceType, fetchMetadata } from '../../../../../../shared/external-links/sources/index';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameter: url'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }
    
    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid URL format'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }
    
    // Detect source type
    const sourceType = detectSourceType(targetUrl);
    
    if (!sourceType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not detect source type for this URL'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }
    
    // Fetch metadata
    const metadata = await fetchMetadata(targetUrl);
    
    if (!metadata) {
      return new Response(JSON.stringify({
        success: true,
        detected: {
          sourceType,
          url: targetUrl
        },
        metadata: null,
        message: 'Source type detected but could not fetch metadata'
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      detected: {
        sourceType: metadata.source_type,
        url: targetUrl,
        externalId: metadata.external_id
      },
      metadata: {
        title: metadata.title,
        description: metadata.description,
        authors: metadata.authors,
        publishedDate: metadata.published_date,
        thumbnail: metadata.thumbnail_url,
        language: metadata.language,
        extra: metadata.metadata
      }
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
    
  } catch (error) {
    console.error('[Nexus/Links/Detect] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to detect link metadata'
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
