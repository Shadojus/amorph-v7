/**
 * BIFRÖST NEXUS - Experts API
 * GET /api/nexus/experts - List experts with filtering
 * 
 * Query params:
 *   domain - Filter by domain slug
 *   search - Search in name/bio/expertise
 *   field - Filter by field expertise
 *   page - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 100)
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = url.searchParams;
    
    const domainSlug = params.get('domain');
    const search = params.get('search') || params.get('q');
    const field = params.get('field');
    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
    
    // Build where clause
    const where: any = { isActive: true };
    
    // Filter by domain
    if (domainSlug) {
      const domain = await prisma.domain.findUnique({
        where: { slug: domainSlug }
      });
      if (domain) {
        where.domainId = domain.id;
      }
    }
    
    // Filter by field expertise
    if (field) {
      where.fieldExpertise = { has: field };
    }
    
    // Search
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const total = await prisma.expert.count({ where });
    
    // Fetch experts
    const experts = await prisma.expert.findMany({
      where,
      orderBy: [
        { impactScore: 'desc' },
        { name: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        domain: {
          select: { slug: true, name: true, color: true, icon: true }
        },
        publications: {
          take: 3,
          orderBy: { citations: 'desc' }
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
      experts: experts.map(e => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        title: e.title,
        bio: e.bio,
        image: e.image,
        url: e.url,
        domain: e.domain.slug,
        domainName: e.domain.name,
        domainColor: e.domain.color,
        domainIcon: e.domain.icon,
        fieldExpertise: e.fieldExpertise,
        impactScore: e.impactScore,
        isVerified: e.isVerified,
        publications: e.publications.map(p => ({
          title: p.title,
          journal: p.journal,
          year: p.year,
          doi: p.doi,
          url: p.url,
          citations: p.citations
        }))
      }))
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
    
  } catch (error) {
    console.error('[Nexus] Experts API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch experts',
      message: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
