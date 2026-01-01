/**
 * AMORPH - BIFRÖST Species Client
 * 
 * Lädt Species-Daten von der BIFRÖST API statt aus lokalen JSON-Dateien.
 * Fallback auf lokale Daten wenn API nicht erreichbar.
 */

import type { ItemData } from '../core/types';

// API Configuration
const BIFROEST_API_URL = import.meta.env.BIFROEST_API_URL || 'http://localhost:3004';
const POCKETBASE_URL = import.meta.env.POCKETBASE_URL || 'http://localhost:8090';
const API_TIMEOUT = 5000;

interface BifroestSpecies {
  id: string;
  name: string;
  scientificName: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  fieldPerspective: Record<string, string>;
  data: Record<string, unknown>;
  tags: string[];
  status: string;
  featured: boolean;
}

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
  name: string;
  scientificName: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  fieldPerspective: Record<string, string>;
  data: Record<string, unknown>;
  tags: string[];
  status: string;
  featured: boolean;
}

/**
 * Konvertiert Pocketbase Species zu AMORPH ItemData Format
 */
function toItemData(species: PocketbaseSpecies): ItemData {
  const item: ItemData = {
    id: species.id,
    slug: species.slug,
    name: species.name,
    scientificName: species.scientificName,
    description: species.description,
    image: species.image,
    _kingdom: species.category,
    _fieldPerspective: species.fieldPerspective || {},
    _perspectives: {},
    _loadedPerspectives: [],
    _sources: {}
  };
  
  // Extrahiere Perspektiven-Daten aus dem data-Feld
  if (species.data) {
    for (const [key, value] of Object.entries(species.data)) {
      // Speichere in _perspectives
      if (typeof value === 'object' && value !== null) {
        item._perspectives![key] = value as Record<string, unknown>;
        (item._loadedPerspectives as string[]).push(key);
        
        // Merge Felder ins Haupt-Item
        for (const [fieldKey, fieldValue] of Object.entries(value as Record<string, unknown>)) {
          if (!fieldKey.startsWith('_') && item[fieldKey] === undefined) {
            item[fieldKey] = fieldValue;
          }
        }
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
