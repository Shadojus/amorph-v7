/**
 * AMORPH v7 - Search API
 * 
 * GET /api/search?q=query&p=perspective1,perspective2
 * 
 * Security:
 * - Input validation
 * - Rate limiting
 * - XSS-safe HTML output
 */

import type { APIRoute } from 'astro';
import { loadConfig } from '../../server/config';
import { searchItems } from '../../server/data';
import { renderValue } from '../../morphs';
import type { RenderContext } from '../../core/types';
import { 
  validateQuery, 
  validatePerspectives, 
  validateNumber,
  escapeHtml,
  escapeAttribute,
  checkRateLimit,
  addSecurityHeaders,
  logSecurityEvent
} from '../../core/security';

export const GET: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress });
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000))
      }
    });
  }

  const url = new URL(request.url);
  
  // Validate inputs
  const query = validateQuery(url.searchParams.get('q'));
  const perspectives = validatePerspectives(url.searchParams.get('p'));
  const limit = validateNumber(url.searchParams.get('limit'), 1, 100, 50);
  const offset = validateNumber(url.searchParams.get('offset'), 0, 10000, 0);
  
  try {
    await loadConfig();
    
    const result = await searchItems({
      query,
      perspectives,
      limit,
      offset
    });
    
    // Render items as HTML with escaped values
    const gridContext: RenderContext = {
      mode: 'grid',
      itemCount: 1,
      compact: true
    };
    
    const html = result.items.map(item => {
      // Standard-Felder (ohne Perspektiven)
      const fields = Object.entries(item)
        .filter(([k]) => !['id', 'slug', 'name', 'bild', 'wissenschaftlich'].includes(k) && !k.startsWith('_'))
        .slice(0, 6)
        .map(([key, value]) => {
          const morphHtml = renderValue(value, key, gridContext);
          return `<div class="amorph-field" data-field="${escapeAttribute(key)}" data-item="${escapeAttribute(item.slug)}">
            <span class="field-label">${escapeHtml(key)}</span>
            <span class="field-value">${morphHtml}</span>
            <button class="field-select" aria-label="Feld zum Vergleich hinzufügen">+</button>
          </div>`;
        })
        .join('');
      
      // Perspektiven-Daten (aus _perspectives)
      let perspectiveHtml = '';
      if (item._perspectives && Object.keys(item._perspectives).length > 0) {
        const perspEntries = Object.entries(item._perspectives as Record<string, unknown>)
          .map(([perspId, perspData]) => {
            if (!perspData || typeof perspData !== 'object') return '';
            const perspFields = Object.entries(perspData as Record<string, unknown>)
              .slice(0, 4)
              .map(([key, value]) => {
                const morphHtml = renderValue(value, key, gridContext);
                return `<div class="persp-field" data-field="${escapeAttribute(key)}" data-perspective="${escapeAttribute(perspId)}">
                  <span class="persp-field-label">${escapeHtml(key)}</span>
                  <span class="persp-field-value">${morphHtml}</span>
                </div>`;
              })
              .join('');
            return perspFields ? `<div class="persp-section" data-perspective="${escapeAttribute(perspId)}">
              <h4 class="persp-section-title">${escapeHtml(perspId)}</h4>
              ${perspFields}
            </div>` : '';
          })
          .filter(Boolean)
          .join('');
        
        if (perspEntries) {
          perspectiveHtml = `<div class="item-perspectives">${perspEntries}</div>`;
        }
      }
      
      return `
        <article class="amorph-item" data-slug="${escapeAttribute(item.slug)}" data-id="${escapeAttribute(item.id)}" data-name="${escapeAttribute(item.name)}">
          <div class="item-header">
            ${item.bild ? `<div class="item-image"><img src="${escapeAttribute(item.bild)}" alt="${escapeAttribute(item.name)}" loading="lazy" /></div>` : ''}
            <h2 class="item-name">${escapeHtml(item.name)}</h2>
            ${item.wissenschaftlich ? `<span class="item-scientific">${escapeHtml(item.wissenschaftlich)}</span>` : ''}
          </div>
          <div class="item-body">${fields}</div>
          ${perspectiveHtml}
          <button class="item-select" aria-label="Auswählen">
            <span class="select-icon"></span>
          </button>
        </article>
      `;
    }).join('');
    
    const response = new Response(JSON.stringify({
      items: result.items,
      total: result.total,
      perspectivesWithData: result.perspectivesWithData,
      matchedPerspectives: result.matchedPerspectives,  // NEW
      html
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    addSecurityHeaders(response.headers);
    return response;
    
  } catch (error) {
    console.error('Search API error:', error);
    // Don't expose internal error details
    return new Response(JSON.stringify({
      error: 'Search failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
