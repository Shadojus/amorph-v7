/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Create external link
 * 
 * POST /api/external-links/create
 * Body: { entityId, url, title, description?, type, thumbnail? }
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';
import { checkRateLimit, logSecurityEvent } from '../../../core/security';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'external-links/create' });
    return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) }
    });
  }

  try {
    const body = await request.json();
    const { entityId, url, title, description, type, thumbnail, submittedBy } = body;

    // Validation
    if (!entityId || !url || !title || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: entityId, url, title, type'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid URL format'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if entity exists
    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    });

    if (!entity) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Entity not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Check for duplicate URL on same entity
    const existing = await prisma.externalLink.findFirst({
      where: { entityId, url }
    });

    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Link already exists for this entity'
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Create the link
    const link = await prisma.externalLink.create({
      data: {
        entityId,
        url,
        title: title.slice(0, 500),
        description: description?.slice(0, 2000),
        type,
        thumbnail,
        submittedBy: submittedBy || 'anonymous',
        score: 0
      }
    });

    logSecurityEvent('EXTERNAL_LINK_CREATED', { linkId: link.id, entityId, type });

    return new Response(JSON.stringify({
      success: true,
      link: {
        id: link.id,
        url: link.url,
        title: link.title,
        type: link.type,
        createdAt: link.createdAt
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[External Links Create] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create link'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};