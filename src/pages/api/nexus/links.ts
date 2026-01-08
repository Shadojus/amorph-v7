/**
 * BIFRÖST NEXUS - External Links API
 * GET /api/nexus/links - List external links
 * POST /api/nexus/links - Create new link
 * 
 * Query params (GET):
 *   entityId - Filter by entity
 *   domain - Filter by domain slug
 *   type - Filter by link type (youtube, wikipedia, pubmed, etc.)
 *   page, limit - Pagination
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';
import { checkRateLimit, logSecurityEvent } from '../../../core/security';

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = url.searchParams;
    
    const entityId = params.get('entityId');
    const domainSlug = params.get('domain');
    const linkType = params.get('type');
    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
    
    const where: any = {};
    
    if (entityId) {
      where.entityId = entityId;
    }
    
    if (domainSlug) {
      const domain = await prisma.domain.findUnique({ where: { slug: domainSlug } });
      if (domain) {
        const entities = await prisma.entity.findMany({
          where: { domainId: domain.id },
          select: { id: true }
        });
        where.entityId = { in: entities.map(e => e.id) };
      }
    }
    
    if (linkType) {
      where.type = linkType;
    }
    
    const total = await prisma.externalLink.count({ where });
    
    const links = await prisma.externalLink.findMany({
      where,
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        entity: {
          select: {
            slug: true,
            name: true,
            domain: { select: { slug: true, name: true, color: true } }
          }
        }
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      links: links.map(l => ({
        id: l.id,
        url: l.url,
        title: l.title,
        description: l.description,
        type: l.type,
        thumbnail: l.thumbnail,
        score: l.score,
        isVerified: l.isVerified,
        entity: l.entity,
        createdAt: l.createdAt
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Nexus/Links] GET Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch links'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { entityId, url, title, description, type, thumbnail } = body;

    // Validation
    if (!entityId || !url || !title || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: entityId, url, title, type'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid URL format'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check entity exists
    const entity = await prisma.entity.findUnique({ where: { id: entityId } });
    if (!entity) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Entity not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Check duplicate
    const existing = await prisma.externalLink.findFirst({
      where: { entityId, url }
    });
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Link already exists'
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Create link
    const link = await prisma.externalLink.create({
      data: {
        entityId,
        url,
        title: title.slice(0, 500),
        description: description?.slice(0, 2000),
        type,
        thumbnail,
        score: 0
      }
    });

    logSecurityEvent('LINK_CREATED', { linkId: link.id, entityId, type });

    return new Response(JSON.stringify({
      success: true,
      link: {
        id: link.id,
        url: link.url,
        title: link.title,
        type: link.type
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Nexus/Links] POST Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create link'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
