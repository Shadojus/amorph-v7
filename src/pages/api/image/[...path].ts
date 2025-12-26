/**
 * AMORPH v7 - Image API
 * 
 * Serviert Bilder aus den data/ Verzeichnissen.
 * Route: /api/image/{kingdom}/{slug}/{filename}
 * 
 * Beispiel: /api/image/fungi/hericium-erinaceus/Hericium_erinaceus.jpg
 */

import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { getSiteType, SITE_META } from '../../../server/config';

// MIME types for images
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Base data path
const BASE_DATA_PATH = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'data')
  : join(process.cwd(), 'data');

export const GET: APIRoute = async ({ params }) => {
  try {
    const pathParts = params.path?.split('/') || [];
    
    if (pathParts.length < 3) {
      return new Response('Invalid path: need kingdom/slug/filename', { status: 400 });
    }
    
    const [kingdom, slug, ...filenameParts] = pathParts;
    const filename = filenameParts.join('/'); // Support subfolders
    
    // Security: validate path components
    const validPattern = /^[a-zA-Z0-9_\-\s©().]+$/;
    if (!validPattern.test(kingdom) || !validPattern.test(slug)) {
      return new Response('Invalid path characters', { status: 400 });
    }
    
    // Build file path
    const filePath = join(BASE_DATA_PATH, kingdom, slug, decodeURIComponent(filename));
    
    // Security: prevent path traversal
    const resolvedPath = join(BASE_DATA_PATH, kingdom, slug, decodeURIComponent(filename));
    if (!resolvedPath.startsWith(BASE_DATA_PATH)) {
      return new Response('Path traversal not allowed', { status: 403 });
    }
    
    if (!existsSync(filePath)) {
      console.log(`[Image API] Not found: ${filePath}`);
      return new Response('Image not found', { status: 404 });
    }
    
    // Get MIME type
    const ext = extname(filename).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read and return image
    const imageBuffer = readFileSync(filePath);
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      },
    });
  } catch (error) {
    console.error('[Image API] Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
