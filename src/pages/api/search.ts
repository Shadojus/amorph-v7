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
    
    // Helper: Check if a value contains the search query
    const searchLower = query.toLowerCase();
    const matchesQuery = (value: unknown): boolean => {
      if (!query || query.length < 3) return false;
      if (typeof value === 'string') return value.toLowerCase().includes(searchLower);
      if (typeof value === 'number') return String(value).includes(searchLower);
      if (Array.isArray(value)) return value.some(v => matchesQuery(v));
      if (value && typeof value === 'object') {
        return Object.values(value).some(v => matchesQuery(v));
      }
      return false;
    };
    
    // Render items as HTML with escaped values
    const gridContext: RenderContext = {
      mode: 'grid',
      itemCount: 1,
      compact: true
    };
    
    // Set der aktiven Perspektiven - inklusive der Perspektiven mit Treffern!
    // Wenn keine spezifischen Perspektiven gewählt, zeige die mit Treffern
    const activePerspectives = new Set(perspectives);
    if (activePerspectives.size === 0 && result.matchedPerspectives) {
      result.matchedPerspectives.forEach(p => activePerspectives.add(p));
    }
    
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
      // Priorisiere Felder die den Suchbegriff enthalten!
      const perspectiveFields: string[] = [];
      if (item._perspectives && activePerspectives.size > 0) {
        for (const [perspId, perspData] of Object.entries(item._perspectives as Record<string, unknown>)) {
          // Nur aktive Perspektiven anzeigen
          if (!activePerspectives.has(perspId) || !perspData || typeof perspData !== 'object') continue;
          
          // Get perspective config for symbol/name
          const perspConfig = getPerspective(perspId);
          const perspSymbol = perspConfig?.symbol || '●';
          
          // Perspektiven-Header - Farbe kommt via CSS über data-perspektive
          perspectiveFields.push(`<div class="persp-divider" data-perspektive="${escapeAttribute(perspId)}">
            <span class="persp-divider-icon">${perspSymbol}</span>
            <span class="persp-divider-label">${escapeHtml(perspConfig?.name || perspId)}</span>
          </div>`);
          
          // Filtere und sortiere Felder: Bei aktiver Query nur die die matchen!
          const entries = Object.entries(perspData as Record<string, unknown>);
          
          let filteredEntries = entries;
          if (query.length >= 3) {
            // Nur Felder zeigen die im Key ODER Value den Suchbegriff enthalten
            filteredEntries = entries.filter(([key, value]) => {
              const keyMatches = key.toLowerCase().includes(searchLower);
              const valMatches = matchesQuery(value);
              return keyMatches || valMatches;
            });
          }
          
          // Wenn keine Matches, zeige die ersten paar Standard-Felder
          if (filteredEntries.length === 0) {
            filteredEntries = entries.slice(0, 4);
          }
          
          for (const [key, value] of filteredEntries) {
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
            <div class="item-title-row">
              <h2 class="item-name">${escapeHtml(item.name)}</h2>
              <a href="/${escapeAttribute(item.slug)}" class="item-detail-link" title="Details anzeigen">→</a>
            </div>
            ${item.wissenschaftlich ? `<span class="item-scientific">${escapeHtml(String(item.wissenschaftlich))}</span>` : ''}
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
