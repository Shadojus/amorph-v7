/**
 * BIFRÖST NEXUS - External Links API
 * GET /api/nexus/links - List external links
 * POST /api/nexus/links - Create new link
 * 
 * Query params (GET):
 *   entityId - Filter by entity
 *   domain - Filter by domain slug
 *   perspective - Filter by perspective
 *   type - Filter by link type (youtube, wikipedia, pubmed, etc.)
 *   verified - Filter verified only (true/false)
 *   page, limit - Pagination
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';
import { checkRateLimit, logSecurityEvent } from '../../../core/security';
import { detectSourceType, fetchMetadata } from '../../../../../shared/external-links/sources/index';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = url.searchParams;
    
    const entityId = params.get('entityId');
    const domainSlug = params.get('domain');
    const perspective = params.get('perspective');
    const linkType = params.get('type');
    const verified = params.get('verified');
    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
    
    const where: any = {
      isAlive: true  // Default: nur aktive Links
    };
    
    // Entity-Filter
    if (entityId) {
      where.entityId = entityId;
    }
    
    // Domain-Filter (über domains Array ODER über Entity)
    if (domainSlug) {
      where.OR = [
        { domains: { has: domainSlug } },
        { entity: { primaryDomain: { slug: domainSlug } } }
      ];
    }
    
    // Perspective-Filter
    if (perspective) {
      where.perspectives = { has: perspective };
    }
    
    // Type-Filter
    if (linkType) {
      where.type = linkType;
    }
    
    // Verified-Filter
    if (verified === 'true') {
      where.isVerified = true;
    }
    
    const total = await prisma.externalLink.count({ where });
    
    const links = await prisma.externalLink.findMany({
      where,
      orderBy: [
        { isVerified: 'desc' },
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
            primaryDomain: { select: { slug: true, name: true, color: true } }
          }
        },
        _count: {
          select: { votes: true }
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
        externalId: l.externalId,
        language: l.language,
        score: l.score,
        isVerified: l.isVerified,
        isAlive: l.isAlive,
        domains: l.domains,
        perspectives: l.perspectives,
        fields: l.fields,
        entity: l.entity,
        voteCount: l._count.votes,
        createdAt: l.createdAt,
        lastChecked: l.lastChecked
      }))
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (error) {
    console.error('[Nexus/Links] GET Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch links'
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  try {
    const body = await request.json();
    let { 
      entityId,       // Optional - für entity-spezifische Links
      url, 
      title, 
      description, 
      type, 
      thumbnail,
      externalId,
      language,
      domains,        // String[] - Domain-Slugs
      perspectives,   // String[] - Perspektiven
      fields,         // String[]
      autoDetect      // Boolean - automatisch Metadaten holen
    } = body;

    // Validation: URL ist required
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: url'
      }), { status: 400, headers: CORS_HEADERS });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid URL format'
      }), { status: 400, headers: CORS_HEADERS });
    }

    // Auto-detect metadata if requested or if title is missing
    if (autoDetect || !title) {
      const detectedType = detectSourceType(url);
      if (detectedType && !type) {
        type = detectedType;
      }
      
      const metadata = await fetchMetadata(url);
      if (metadata) {
        if (!title) title = metadata.title;
        if (!description) description = metadata.description;
        if (!thumbnail) thumbnail = metadata.thumbnail_url;
        if (!externalId) externalId = metadata.external_id;
        if (!language) language = metadata.language;
        if (!type) type = metadata.source_type;
      }
    }

    // Nach Auto-Detection: Title muss existieren
    if (!title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not determine title. Please provide one manually.'
      }), { status: 400, headers: CORS_HEADERS });
    }

    // Type muss existieren (default: website)
    if (!type) {
      type = 'website';
    }

    // Mindestens entityId ODER domains muss angegeben sein
    if (!entityId && (!domains || domains.length === 0)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Either entityId or domains[] must be provided'
      }), { status: 400, headers: CORS_HEADERS });
    }

    // Validate entityId if provided
    if (entityId) {
      const entity = await prisma.entity.findUnique({ where: { id: entityId } });
      if (!entity) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Entity not found'
        }), { status: 404, headers: CORS_HEADERS });
      }
    }

    // Validate domains if provided
    if (domains && domains.length > 0) {
      const validDomains = await prisma.domain.findMany({
        where: { slug: { in: domains } },
        select: { slug: true }
      });
      domains = validDomains.map(d => d.slug);
    }

    // Check duplicate by URL (and optionally externalId)
    const duplicateWhere: any = { url };
    if (externalId) {
      duplicateWhere.OR = [
        { url },
        { externalId }
      ];
      delete duplicateWhere.url;
    }
    
    const existing = await prisma.externalLink.findFirst({ where: duplicateWhere });
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Link already exists',
        existingId: existing.id
      }), { status: 409, headers: CORS_HEADERS });
    }

    // Create link
    const link = await prisma.externalLink.create({
      data: {
        entityId: entityId || null,
        url,
        title: title.slice(0, 500),
        description: description?.slice(0, 2000),
        type,
        thumbnail,
        externalId,
        language,
        domains: domains || [],
        perspectives: perspectives || [],
        fields: fields || [],
        score: 0,
        isVerified: false,
        isAlive: true
      }
    });

    logSecurityEvent('LINK_CREATED', { linkId: link.id, entityId, type, domains });

    return new Response(JSON.stringify({
      success: true,
      link: {
        id: link.id,
        url: link.url,
        title: link.title,
        description: link.description,
        type: link.type,
        thumbnail: link.thumbnail,
        externalId: link.externalId,
        domains: link.domains,
        perspectives: link.perspectives
      }
    }), {
      status: 201,
      headers: CORS_HEADERS
    });

  } catch (error) {
    console.error('[Nexus/Links] POST Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create link'
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};

// CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};
