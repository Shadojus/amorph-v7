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
import { loadConfig, getPerspective } from '../../server/config';
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
    
    // Set der aktiven Perspektiven
    const activePerspectives = new Set(perspectives);
    
    const html = result.items.map(item => {
      // Standard-Felder (ohne Perspektiven) - renderValue gibt bereits komplettes amorph-field zurück
      const standardFields = Object.entries(item)
        .filter(([k]) => !['id', 'slug', 'name', 'bild', 'wissenschaftlich'].includes(k) && !k.startsWith('_'))
        .slice(0, 4)  // Weniger Standard-Felder wenn Perspektiven aktiv
        .map(([key, value]) => {
          const morphHtml = renderValue(value, key, gridContext);
          return morphHtml; // Already wrapped with data-raw-value!
        })
        .filter(html => html); // Remove empty strings
      
      // Perspektiven-Felder NUR für aktive Perspektiven - als normale Felder!
      const perspectiveFields: string[] = [];
      if (item._perspectives && activePerspectives.size > 0) {
        for (const [perspId, perspData] of Object.entries(item._perspectives as Record<string, unknown>)) {
          // Nur aktive Perspektiven anzeigen
          if (!activePerspectives.has(perspId) || !perspData || typeof perspData !== 'object') continue;
          
          // Get perspective config for colors
          const perspConfig = getPerspective(perspId);
          const perspColor = perspConfig?.colors?.[0] || 'rgba(0, 255, 200, 0.75)';
          const perspSymbol = perspConfig?.symbol || '📊';
          
          // Perspektiven-Header mit Farbe
          perspectiveFields.push(`<div class="persp-divider" data-perspective="${escapeAttribute(perspId)}" style="--persp-color: ${perspColor}">
            <span class="persp-divider-icon">${perspSymbol}</span>
            <span class="persp-divider-label">${escapeHtml(perspConfig?.name || perspId)}</span>
          </div>`);
          
          // Felder als normale amorph-fields - renderValue gibt komplettes Feld zurück
          for (const [key, value] of Object.entries(perspData as Record<string, unknown>).slice(0, 5)) {
            const morphHtml = renderValue(value, key, gridContext);
            // Skip empty renders
            if (!morphHtml) continue;
            perspectiveFields.push(morphHtml); // Already has data-raw-value!
          }
        }
      }
      
      const allFields = [...standardFields, ...perspectiveFields].join('');
      
      // Build field-perspective mapping for client-side color selection
      const fieldPerspectiveMap: Record<string, string> = {};
      if (item._fieldPerspective) {
        Object.assign(fieldPerspectiveMap, item._fieldPerspective);
      }
      // Also add perspective fields from active perspectives
      if (item._perspectives && activePerspectives.size > 0) {
        for (const [perspId, perspData] of Object.entries(item._perspectives as Record<string, unknown>)) {
          if (!activePerspectives.has(perspId) || !perspData || typeof perspData !== 'object') continue;
          for (const key of Object.keys(perspData as Record<string, unknown>)) {
            fieldPerspectiveMap[key] = perspId;
          }
        }
      }
      const fieldPerspectiveJson = JSON.stringify(fieldPerspectiveMap);
      
      return `
        <article class="amorph-item" data-slug="${escapeAttribute(item.slug)}" data-id="${escapeAttribute(item.id)}" data-name="${escapeAttribute(item.name)}" data-field-perspectives="${escapeAttribute(fieldPerspectiveJson)}">
          <div class="item-header">
            ${item.bild ? `<div class="item-image"><img src="${escapeAttribute(item.bild)}" alt="${escapeAttribute(item.name)}" loading="lazy" /></div>` : ''}
            <h2 class="item-name">${escapeHtml(item.name)}</h2>
            ${item.wissenschaftlich ? `<span class="item-scientific">${escapeHtml(item.wissenschaftlich)}</span>` : ''}
          </div>
          <div class="item-body">${allFields}</div>
          <div class="item-actions">
            <button class="item-select-all" aria-label="Alle Felder auswählen">
              <span class="select-icon"></span>
            </button>
          </div>
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
