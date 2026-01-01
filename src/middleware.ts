/**
 * AMORPH Global Middleware
 * 
 * Applies security headers and logging to all requests.
 * Rate limiting is handled per-endpoint for flexibility.
 */

import { defineMiddleware } from 'astro:middleware';
import { getSecurityHeaders, handleCORS, createPreflightResponse } from './server/security';
import { logger, logRequest } from './server/logger';

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  const url = new URL(request.url);
  
  // Start request logging
  const requestLog = logRequest(request);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    requestLog.end(204);
    return createPreflightResponse(request);
  }

  // Process request
  let response: Response;
  let status = 200;
  
  try {
    response = await next();
    status = response.status;
  } catch (error) {
    logger.error('Request failed', error);
    status = 500;
    response = new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Log request completion
  requestLog.end(status);

  // Apply security headers to API routes
  if (url.pathname.startsWith('/api/')) {
    const securityHeaders = getSecurityHeaders();
    const { headers: corsHeaders } = handleCORS(request);
    
    const newHeaders = new Headers(response.headers);
    Object.entries({ ...securityHeaders, ...corsHeaders }).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  return response;
});
