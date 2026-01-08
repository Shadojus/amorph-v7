/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Create external link in PostgreSQL/SQLite
 * 
 * PostgreSQL/Prisma Version
 */

import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, metadata, domains, perspectives, fields, entity_ids } = await request.json();

    // Validation
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one domain is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!metadata || !metadata.source_type) {
      return new Response(
        JSON.stringify({ error: 'Metadata with source_type is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if link already exists
    const existing = await prisma.externalLink.findFirst({
      where: { url: url }
    });

    if (existing) {
      // Parse existing JSON fields
      const existingDomains = JSON.parse(existing.domains as unknown as string || '[]');
      const existingPerspectives = JSON.parse(existing.perspectives as unknown as string || '[]');
      const existingFields = JSON.parse(existing.fields as unknown as string || '[]');
      
      // Merge with new values
      const updatedDomains = [...new Set([...existingDomains, ...domains])];
      const updatedPerspectives = [...new Set([...existingPerspectives, ...(perspectives || [])])];
      const updatedFields = [...new Set([...existingFields, ...(fields || [])])];

      const updated = await prisma.externalLink.update({
        where: { id: existing.id },
        data: {
          domains: JSON.stringify(updatedDomains),
          perspectives: JSON.stringify(updatedPerspectives),
          fields: JSON.stringify(updatedFields),
          entityIds: entity_ids ? JSON.stringify(entity_ids) : existing.entityIds
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          updated: true,
          id: updated.id,
          message: 'Link updated with new associations'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new link
    const record = await prisma.externalLink.create({
      data: {
        sourceType: metadata.source_type,
        url: url,
        externalId: metadata.external_id || null,
        title: metadata.title,
        description: metadata.description || null,
        authors: JSON.stringify(metadata.authors || []),
        publishedDate: metadata.published_date ? new Date(metadata.published_date) : null,
        thumbnailUrl: metadata.thumbnail_url || null,
        language: metadata.language || null,
        domains: JSON.stringify(domains),
        perspectives: JSON.stringify(perspectives || []),
        fields: JSON.stringify(fields || []),
        entityIds: JSON.stringify(entity_ids || []),
        upvotes: 0,
        downvotes: 0,
        expertVerified: false,
        isAlive: true,
        lastChecked: new Date(),
        metadata: JSON.stringify(metadata.metadata || {})
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        created: true,
        id: record.id,
        message: 'Link created successfully'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[API] create error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
