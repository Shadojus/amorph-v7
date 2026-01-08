/**
 * AMORPH v7 - Image API
 * 
 * Serviert Bilder aus den data/ Verzeichnissen.
 * PERFORMANCE: Automatische WebP-Konvertierung wenn verfügbar!
 * 
 * Route: /api/image/{kingdom}/{slug}/{filename}
 * Beispiel: /api/image/fungi/hericium-erinaceus/Hericium_erinaceus.jpg
 *           → Serviert .webp wenn vorhanden und Browser es unterstützt
 */

import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
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

// Base data path - jetzt public/images für statische Assets
const BASE_DATA_PATH = join(process.cwd(), 'public', 'images');

export const GET: APIRoute = async ({ params, request }) => {
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
    const decodedFilename = decodeURIComponent(filename);
    let filePath = join(BASE_DATA_PATH, kingdom, slug, decodedFilename);
    
    // Security: prevent path traversal
    if (!filePath.startsWith(BASE_DATA_PATH)) {
      return new Response('Path traversal not allowed', { status: 403 });
    }
    
    // PERFORMANCE: Automatisch WebP servieren wenn verfügbar
    const acceptHeader = request.headers.get('Accept') || '';
    const browserSupportsWebP = acceptHeader.includes('image/webp');
    const ext = extname(decodedFilename).toLowerCase();
    
    // Wenn Browser WebP unterstützt und Datei ist JPG/PNG, prüfe ob WebP existiert
    if (browserSupportsWebP && ['.jpg', '.jpeg', '.png'].includes(ext)) {
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (existsSync(webpPath)) {
        // WebP existiert - serviere diese statt Original
        const imageBuffer = readFileSync(webpPath);
        return new Response(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept', // Wichtig für CDN Caching!
          },
        });
      }
    }
    
    // Fallback: Original-Datei servieren
    if (!existsSync(filePath)) {
      console.log(`[Image API] Not found: ${filePath}`);
      return new Response('Image not found', { status: 404 });
    }
    
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    const imageBuffer = readFileSync(filePath);
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    console.error('[Image API] Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
