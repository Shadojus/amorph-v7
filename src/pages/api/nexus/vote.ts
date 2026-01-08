/**
 * BIFRÖST NEXUS - Vote API
 * POST /api/nexus/vote - Vote on an external link
 * 
 * Body: { linkId, vote: 1|-1, sessionId }
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';
import { checkRateLimit } from '../../../core/security';

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
    const { linkId, vote, sessionId } = body;

    // Validation
    if (!linkId || vote === undefined || !sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: linkId, vote, sessionId'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const voteValue = vote > 0 ? 1 : -1;

    // Check link exists
    const link = await prisma.externalLink.findUnique({ where: { id: linkId } });
    if (!link) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Link not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Upsert vote (update if exists, create if not)
    const existingVote = await prisma.linkVote.findUnique({
      where: { linkId_userId: { linkId, userId: sessionId } }
    });

    let oldVote = 0;
    if (existingVote) {
      oldVote = existingVote.vote;
      if (existingVote.vote === voteValue) {
        // Same vote - remove it
        await prisma.linkVote.delete({
          where: { id: existingVote.id }
        });
        await prisma.externalLink.update({
          where: { id: linkId },
          data: { score: { decrement: voteValue } }
        });
        
        const updatedLink = await prisma.externalLink.findUnique({ where: { id: linkId } });
        return new Response(JSON.stringify({
          success: true,
          action: 'removed',
          newScore: updatedLink?.score || 0
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Different vote - update
      await prisma.linkVote.update({
        where: { id: existingVote.id },
        data: { vote: voteValue }
      });
      // Adjust score: remove old vote, add new vote
      await prisma.externalLink.update({
        where: { id: linkId },
        data: { score: { increment: voteValue - oldVote } }
      });
    } else {
      // New vote
      await prisma.linkVote.create({
        data: { linkId, userId: sessionId, vote: voteValue }
      });
      await prisma.externalLink.update({
        where: { id: linkId },
        data: { score: { increment: voteValue } }
      });
    }

    const updatedLink = await prisma.externalLink.findUnique({ where: { id: linkId } });

    return new Response(JSON.stringify({
      success: true,
      action: existingVote ? 'updated' : 'created',
      vote: voteValue,
      newScore: updatedLink?.score || 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Nexus/Vote] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process vote'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
