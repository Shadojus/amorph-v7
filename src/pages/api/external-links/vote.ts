/**
 * BIFROEST External Knowledge Bridge
 * API Endpoint: Vote on external link
 * 
 * POST /api/external-links/vote
 * Body: { linkId, vote: 1 | -1, userId }
 */

import type { APIRoute } from 'astro';
import prisma from '../../../server/db';
import { checkRateLimit, logSecurityEvent } from '../../../core/security';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'external-links/vote' });
    return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) }
    });
  }

  try {
    const body = await request.json();
    const { linkId, vote, userId } = body;

    // Validation
    if (!linkId || !userId || (vote !== 1 && vote !== -1)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or invalid fields: linkId, userId, vote (1 or -1)'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if link exists
    const link = await prisma.externalLink.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Link not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Upsert vote (update if exists, create if not)
    const existingVote = await prisma.linkVote.findUnique({
      where: { linkId_userId: { linkId, userId } }
    });

    let voteChange = vote;
    if (existingVote) {
      // If same vote, remove it (toggle off)
      if (existingVote.vote === vote) {
        await prisma.linkVote.delete({
          where: { id: existingVote.id }
        });
        voteChange = -vote; // Reverse the previous vote
      } else {
        // Change vote direction
        await prisma.linkVote.update({
          where: { id: existingVote.id },
          data: { vote }
        });
        voteChange = vote * 2; // Double change (removing old + adding new)
      }
    } else {
      // Create new vote
      await prisma.linkVote.create({
        data: { linkId, userId, vote }
      });
    }

    // Update link score
    const updatedLink = await prisma.externalLink.update({
      where: { id: linkId },
      data: { score: { increment: voteChange } }
    });

    logSecurityEvent('LINK_VOTED', { linkId, userId, vote });

    return new Response(JSON.stringify({
      success: true,
      newScore: updatedLink.score
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[External Links Vote] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to vote'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};