/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Detect URL and fetch metadata
 */

import type { APIRoute } from 'astro';
import { detectSourceType, fetchMetadata } from '@shared/external-links/sources';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanUrl = url.trim();

    // Detect source type
    const sourceType = detectSourceType(cleanUrl);

    if (!sourceType) {
      return new Response(
        JSON.stringify({ error: 'Could not detect source type for this URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch metadata
    const metadata = await fetchMetadata(cleanUrl);

    if (!metadata) {
      return new Response(
        JSON.stringify({
          source_type: sourceType,
          title: cleanUrl,
          error: 'Could not fetch metadata, but URL is valid'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(metadata),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[API] detect error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
