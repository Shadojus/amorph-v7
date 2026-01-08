/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Vote on external links
 * 
 * PostgreSQL/Prisma Version
 */

import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const { link_id, vote, user_id } = await request.json();

    // Validation
    if (!link_id || typeof link_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'link_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!vote || !['up', 'down'].includes(vote)) {
      return new Response(
        JSON.stringify({ error: 'vote must be "up" or "down"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For now, use a simple user_id (later: auth)
    const finalUserId = user_id || 'anonymous_' + Math.random().toString(36).substr(2, 9);

    // Check if user already voted on this link
    const existingVote = await prisma.linkVote.findFirst({
      where: {
        linkId: link_id,
        userId: finalUserId
      }
    });

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Same vote - remove it (toggle)
        await prisma.linkVote.delete({
          where: { id: existingVote.id }
        });

        // Update link counts
        const link = await prisma.externalLink.findUnique({
          where: { id: link_id }
        });

        if (link) {
          await prisma.externalLink.update({
            where: { id: link_id },
            data: vote === 'up'
              ? { upvotes: Math.max(0, (link.upvotes || 0) - 1) }
              : { downvotes: Math.max(0, (link.downvotes || 0) - 1) }
          });
        }

        return new Response(
          JSON.stringify({ success: true, action: 'removed', vote: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // Different vote - update it
        await prisma.linkVote.update({
          where: { id: existingVote.id },
          data: { vote }
        });

        // Update link counts (swap votes)
        const link = await prisma.externalLink.findUnique({
          where: { id: link_id }
        });

        if (link) {
          await prisma.externalLink.update({
            where: { id: link_id },
            data: vote === 'up'
              ? {
                  upvotes: (link.upvotes || 0) + 1,
                  downvotes: Math.max(0, (link.downvotes || 0) - 1)
                }
              : {
                  upvotes: Math.max(0, (link.upvotes || 0) - 1),
                  downvotes: (link.downvotes || 0) + 1
                }
          });
        }

        return new Response(
          JSON.stringify({ success: true, action: 'changed', vote }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new vote
    await prisma.linkVote.create({
      data: {
        linkId: link_id,
        userId: finalUserId,
        vote
      }
    });

    // Update link counts
    const link = await prisma.externalLink.findUnique({
      where: { id: link_id }
    });

    if (link) {
      await prisma.externalLink.update({
        where: { id: link_id },
        data: vote === 'up'
          ? { upvotes: (link.upvotes || 0) + 1 }
          : { downvotes: (link.downvotes || 0) + 1 }
      });
    }

    return new Response(
      JSON.stringify({ success: true, action: 'created', vote }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[API] vote error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
