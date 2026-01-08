/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Detect link metadata
 * 
 * JSON-based version - fetches URL metadata without database
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Detect source type from URL
    const hostname = parsedUrl.hostname.toLowerCase();
    let sourceType = 'webpage';
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      sourceType = 'video';
    } else if (hostname.includes('vimeo.com')) {
      sourceType = 'video';
    } else if (hostname.includes('arxiv.org')) {
      sourceType = 'academic_paper';
    } else if (hostname.includes('doi.org') || hostname.includes('pubmed')) {
      sourceType = 'academic_paper';
    } else if (hostname.includes('github.com')) {
      sourceType = 'repository';
    } else if (hostname.includes('wikipedia.org')) {
      sourceType = 'encyclopedia';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      sourceType = 'social';
    }

    return new Response(
      JSON.stringify({
        url,
        detected: {
          source_type: sourceType,
          hostname: parsedUrl.hostname,
          protocol: parsedUrl.protocol.replace(':', '')
        },
        metadata: {
          title: null,
          description: null,
          authors: null,
          published_date: null
        },
        note: 'Full metadata extraction requires database configuration'
      }),
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
