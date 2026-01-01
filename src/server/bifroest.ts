/**
 * AMORPH - BIFRÖST Species Client
 * 
 * Lädt Species-Daten von der BIFRÖST Pocketbase.
 * Schema: Core fields + 15 Perspective JSON fields (matching blueprints)
 */

import type { ItemData } from '../core/types';

// API Configuration - use process.env for Node.js server context
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const API_TIMEOUT = 5000;

// 15 Perspectives matching blueprints
const PERSPECTIVES = [
  'identification', 'ecology', 'chemistry', 'medicine', 'safety',
  'culinary', 'cultivation', 'conservation', 'culture', 'economy',
  'geography', 'interactions', 'research', 'statistics', 'temporal'
] as const;

interface PocketbaseResponse {
  items: PocketbaseSpecies[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

interface PocketbaseSpecies {
  id: string;
  collectionId: string;
  collectionName: string;
  // Core fields
  slug: string;
  name: string;
  scientific_name: string;
  description: string;
  category: string;
  image: string;
  // 15 Perspective fields (each is JSON or null)
  identification: Record<string, unknown> | null;
  ecology: Record<string, unknown> | null;
  chemistry: Record<string, unknown> | null;
  medicine: Record<string, unknown> | null;
  safety: Record<string, unknown> | null;
  culinary: Record<string, unknown> | null;
  cultivation: Record<string, unknown> | null;
  conservation: Record<string, unknown> | null;
  culture: Record<string, unknown> | null;
  economy: Record<string, unknown> | null;
  geography: Record<string, unknown> | null;
  interactions: Record<string, unknown> | null;
  research: Record<string, unknown> | null;
  statistics: Record<string, unknown> | null;
  temporal: Record<string, unknown> | null;
  // Meta fields
  sources: Record<string, unknown> | null;
  status: string;
  featured: boolean;
  tags: string[];
}

/**
 * Konvertiert Pocketbase Species zu AMORPH ItemData Format
 */
function toItemData(species: PocketbaseSpecies): ItemData {
  const item: ItemData = {
    id: species.id,
    slug: species.slug,
    name: species.name,
    scientificName: species.scientific_name,
    description: species.description,
    image: species.image,
    _kingdom: species.category,
    _fieldPerspective: {} as Record<string, string>,
    _perspectives: {},
    _loadedPerspectives: [],
    _sources: (species.sources || {}) as ItemData['_sources']
  };
  
  // Extrahiere alle 15 Perspektiven-Felder
  for (const perspective of PERSPECTIVES) {
    const data = species[perspective];
    if (data && typeof data === 'object') {
      // Speichere in _perspectives
      item._perspectives![perspective] = data;
      (item._loadedPerspectives as string[]).push(perspective);
      
      // Merge Felder ins Haupt-Item für direkten Zugriff
      for (const [fieldKey, fieldValue] of Object.entries(data)) {
        if (!fieldKey.startsWith('_') && item[fieldKey] === undefined) {
          item[fieldKey] = fieldValue;
        }
      }
      
      // Map field to perspective
      for (const fieldKey of Object.keys(data)) {
        (item._fieldPerspective as Record<string, string>)[fieldKey] = perspective;
      }
    }
  }
  
  return item;
}

/**
 * Lädt Species-Daten direkt von Pocketbase
 */
export async function fetchSpeciesFromPocketbase(options: {
  category?: string;
  slug?: string;
  perPage?: number;
}): Promise<ItemData[]> {
  const { category, slug, perPage = 100 } = options;
  
  try {
    const url = new URL(`${POCKETBASE_URL}/api/collections/species/records`);
    url.searchParams.set('perPage', perPage.toString());
    
    const filters: string[] = [];
    if (category) {
      filters.push(`category="${category}"`);
    }
    if (slug) {
      filters.push(`slug="${slug}"`);
    }
    
    if (filters.length > 0) {
      url.searchParams.set('filter', filters.join(' && '));
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url.toString(), {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: PocketbaseResponse = await response.json();
    return data.items.map(toItemData);
    
  } catch (error) {
    console.error('[BIFRÖST] Failed to fetch from Pocketbase:', error);
    throw error;
  }
}

/**
 * Lädt alle Species für eine Kategorie
 */
export async function loadSpeciesByCategory(category: string): Promise<ItemData[]> {
  console.log(`[BIFRÖST] Loading species for category: ${category}`);
  
  try {
    const items = await fetchSpeciesFromPocketbase({ category });
    console.log(`[BIFRÖST] ✅ Loaded ${items.length} species from API`);
    return items;
  } catch (error) {
    console.error('[BIFRÖST] ❌ API unavailable, falling back to local data');
    return []; // Caller should handle fallback
  }
}

/**
 * Lädt einzelne Species by Slug
 */
export async function loadSpeciesBySlug(slug: string): Promise<ItemData | null> {
  console.log(`[BIFRÖST] Loading species: ${slug}`);
  
  try {
    const items = await fetchSpeciesFromPocketbase({ slug });
    if (items.length > 0) {
      console.log(`[BIFRÖST] ✅ Loaded ${items[0].name}`);
      return items[0];
    }
    return null;
  } catch (error) {
    console.error('[BIFRÖST] ❌ API unavailable');
    return null;
  }
}

/**
 * Prüft ob BIFRÖST API erreichbar ist
 */
export async function checkBifroestConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${POCKETBASE_URL}/api/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
