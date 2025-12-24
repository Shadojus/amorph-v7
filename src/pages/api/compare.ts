/**
 * AMORPH v7 - Compare API
 * 
 * POST /api/compare
 * Body: { items: ['slug1', 'slug2'], perspectives?: ['id1'] }
 * OR
 * Body: { fields: [{ itemSlug, itemName, fieldName, value }, ...] }
 * 
 * Security:
 * - Input validation
 * - Rate limiting  
 * - Slug sanitization
 */

import type { APIRoute } from 'astro';
import { loadConfig } from '../../server/config';
import { getItems } from '../../server/data';
import { renderCompare, renderValue } from '../../morphs';
import type { RenderContext, ItemData } from '../../core/types';
import {
  validateSlugs,
  validatePerspectives,
  checkRateLimit,
  addSecurityHeaders,
  logSecurityEvent,
  escapeHtml,
  escapeAttribute
} from '../../core/security';

// Field selection type
interface SelectedField {
  itemSlug: string;
  itemName: string;
  fieldName: string;
  value: unknown;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'compare' });
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000))
      }
    });
  }

  try {
    const body = await request.json();
    await loadConfig();
    
    // Check if this is field-based comparison (NEW)
    if (body.fields && Array.isArray(body.fields) && body.fields.length > 0) {
      return handleFieldCompare(body.fields as SelectedField[]);
    }
    
    // Otherwise, use item-based comparison (original)
    return handleItemCompare(body);
    
  } catch (error) {
    console.error('Compare API error:', error);
    return new Response(JSON.stringify({
      error: 'Compare failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// NEW: Handle field-based comparison
async function handleFieldCompare(fields: SelectedField[]): Promise<Response> {
  if (fields.length < 1) {
    return new Response(JSON.stringify({
      error: 'At least 1 field required for comparison'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Group fields by fieldName
  const grouped = new Map<string, SelectedField[]>();
  for (const field of fields) {
    if (!grouped.has(field.fieldName)) {
      grouped.set(field.fieldName, []);
    }
    grouped.get(field.fieldName)!.push(field);
  }
  
  // Get unique items
  const uniqueItems = [...new Set(fields.map(f => f.itemSlug))];
  // Bio-Lumineszenz Palette
  const colors = [
    '#00ffc8', // Foxfire Grün
    '#a78bfa', // Myzel Violett
    '#fbbf24', // Sporen Amber
    '#22d3ee', // Tiefsee Cyan
    '#f472b6', // Rhodotus Rosa
    '#a3e635', // Chlorophyll Grün
    '#fb923c', // Carotin Orange
    '#c4b5fd'  // Lavendel
  ];
  const itemColors = new Map<string, string>();
  uniqueItems.forEach((slug, i) => itemColors.set(slug, colors[i % colors.length]));
  
  // Build items array for compare context
  const itemsData = uniqueItems.map(slug => {
    const field = fields.find(f => f.itemSlug === slug);
    return {
      id: slug,
      slug: slug,
      name: field?.itemName || slug,
      color: itemColors.get(slug) || '#fff'
    };
  });
  
  // Render structure: Fields only (Legend/Pills sind jetzt über der Bottom Bar)
  let html = '';
  
  // Legend wird NICHT mehr gerendert - Pills sind in der Selection Bar über der Bottom Nav
  // Die Farben-Zuordnung bleibt aber für die Feld-Darstellung erhalten
  
  // Add fields container
  html += '<div class="compare-fields">';
  
  // Add each field row with proper Compare rendering
  // Include unique key for diff-based updates
  for (const [fieldName, fieldValues] of grouped) {
    const fieldKey = fieldValues.map(f => `${f.itemSlug}:${f.fieldName}`).sort().join('|');
    html += `<div class="compare-field-row" data-field-key="${escapeAttribute(fieldKey)}">`;
    html += `<div class="field-name">
      <span class="field-name-text">${escapeHtml(fieldName)}</span>
      <button class="field-remove" data-field-key="${escapeAttribute(fieldKey)}" title="Feld entfernen">×</button>
    </div>`;
    html += `<div class="field-values">`;
    
    // Multiple items for this field - use overlay Compare mode
    if (fieldValues.length > 1) {
      // Build items with field values for Compare context
      // WICHTIG: Farben aus der globalen itemColors Map verwenden!
      const compareItems = fieldValues.map(field => ({
        id: field.itemSlug,
        slug: field.itemSlug,
        name: field.itemName,
        color: itemColors.get(field.itemSlug) || '#fff',
        [fieldName]: field.value
      }));
      
      // Build compare context mit ALLEN Item-Farben (für konsistente Zuordnung)
      // Die Farben-Reihenfolge muss der Items-Reihenfolge im compareContext entsprechen
      const compareContext: RenderContext = {
        mode: 'compare',
        itemCount: fieldValues.length,
        items: compareItems as any,
        fieldName: fieldName,
        colors: compareItems.map(item => item.color)
      };
      
      // Use renderValue which will detect Compare mode and use overlay rendering
      const firstValue = fieldValues[0].value;
      const renderedValue = renderValue(firstValue, fieldName, compareContext);
      
      html += `<div class="field-compare-overlay">${renderedValue || '<span class="no-value">–</span>'}</div>`;
    } else {
      // Single item - render without species label (cleaner design)
      const field = fieldValues[0];
      const color = itemColors.get(field.itemSlug) || '#fff';
      
      // Use single mode context but pass the item color for consistent coloring
      const singleContext: RenderContext = {
        mode: 'single',
        itemCount: 1,
        colors: [color]  // Pass color for morphs that need it
      };
      const renderedValue = renderValue(field.value, field.fieldName, singleContext);
      const displayValue = renderedValue || `<span class="no-value">–</span>`;
      
      // Simplified: no left border line, no species label (already shown in legend)
      html += `<div class="field-value-single" data-species="${escapeAttribute(field.itemName)}" style="--item-color: ${color}">
        <div class="value-content">${displayValue}</div>
      </div>`;
    }
    
    html += '</div></div>';
  }
  
  html += '</div>';
  
  const response = new Response(JSON.stringify({
    html,
    itemCount: uniqueItems.length,
    fieldCount: grouped.size,
    mode: 'fields'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  addSecurityHeaders(response.headers);
  return response;
}

// Original item-based comparison
async function handleItemCompare(body: { items?: string[]; perspectives?: string[] }): Promise<Response> {
    // Validate inputs
    const slugs = validateSlugs(body.items);
    const perspectives = validatePerspectives(body.perspectives);
    
    if (slugs.length < 2) {
      return new Response(JSON.stringify({
        error: 'At least 2 valid items required for comparison'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (slugs.length > 10) {
      return new Response(JSON.stringify({
        error: 'Maximum 10 items for comparison'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Load items
    const items = await getItems(slugs);
    
    if (items.length < 2) {
      return new Response(JSON.stringify({
        error: 'Not enough items found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Build compare context - Bio-Lumineszenz Palette
    const colors = [
      '#00ffc8', // Foxfire Grün
      '#a78bfa', // Myzel Violett
      '#fbbf24', // Sporen Amber
      '#22d3ee', // Tiefsee Cyan
      '#f472b6', // Rhodotus Rosa
      '#a3e635', // Chlorophyll Grün
      '#fb923c', // Carotin Orange
      '#c4b5fd'  // Lavendel
    ];
    const compareContext: RenderContext = {
      mode: 'compare',
      itemCount: items.length,
      items: items as ItemData[],
      colors: colors.slice(0, items.length),
      perspectives
    };
    
    // Render compare view
    const html = renderCompare(items as Record<string, unknown>[], compareContext);
    
    // Count fields
    const allFields = new Set<string>();
    items.forEach(item => {
      Object.keys(item).forEach(k => {
        if (!k.startsWith('_') && !['id', 'slug'].includes(k)) {
          allFields.add(k);
        }
      });
    });
    
    const response = new Response(JSON.stringify({
      html,
      itemCount: items.length,
      fieldCount: allFields.size,
      mode: 'items'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    addSecurityHeaders(response.headers);
    return response;
}
