/**
 * AMORPH v7 - Autocomplete API
 * 
 * POST /api/autocomplete
 * Body: { itemSlugs: ['slug1', 'slug2'], fieldNames: ['field1', 'field2'] }
 * 
 * Returns all fields that exist in the given items with the given field names.
 * Used to "autocomplete" missing fields when comparing species.
 */

import type { APIRoute } from 'astro';
import { loadConfig, getAllPerspectives } from '../../server/config';
import { getItems } from '../../server/data';
import {
  checkRateLimit,
  logSecurityEvent,
  validateSlugs
} from '../../core/security';

interface AutocompleteRequest {
  itemSlugs: string[];
  fieldNames: string[];
}

interface AutocompleteField {
  itemSlug: string;
  itemName: string;
  fieldName: string;
  value: unknown;
  perspectiveId?: string;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const rateCheck = checkRateLimit(clientAddress || 'unknown');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT', { ip: clientAddress, endpoint: 'autocomplete' });
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000))
      }
    });
  }

  try {
    const body: AutocompleteRequest = await request.json();
    
    // Validate input
    if (!body.itemSlugs || !Array.isArray(body.itemSlugs) || body.itemSlugs.length === 0) {
      return new Response(JSON.stringify({ error: 'itemSlugs required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!body.fieldNames || !Array.isArray(body.fieldNames) || body.fieldNames.length === 0) {
      return new Response(JSON.stringify({ error: 'fieldNames required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate and sanitize slugs
    const validatedSlugs = validateSlugs(body.itemSlugs);
    if (validatedSlugs.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid slugs provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Load config and data
    await loadConfig();
    const perspectives = getAllPerspectives();
    
    // Get items by validated slugs
    const items = await getItems(validatedSlugs);
    
    // Get field-to-perspective mapping from config
    const fieldPerspectives: Record<string, string> = {};
    for (const persp of perspectives) {
      const fields = persp.fields || persp.felder || [];
      for (const fieldName of fields) {
        fieldPerspectives[fieldName] = persp.id;
      }
    }
    
    // Build result: all fields that exist in items
    const fields: AutocompleteField[] = [];
    
    for (const item of items) {
      // Get item name - try various fields
      const itemName = (item.name as string) || 
                       (item.common_names as string[])?.[0] || 
                       (item.scientific as string) ||
                       item.slug;
      
      for (const fieldName of body.fieldNames) {
        // Check if the field exists in this item (direct access, not item.data)
        if (fieldName in item) {
          const value = item[fieldName];
          
          // Only include non-null, non-undefined values
          if (value !== null && value !== undefined) {
            fields.push({
              itemSlug: item.slug,
              itemName: itemName,
              fieldName: fieldName,
              value: value,
              perspectiveId: fieldPerspectives[fieldName] || undefined
            });
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      fields,
      count: fields.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return new Response(JSON.stringify({
      error: 'Autocomplete failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
