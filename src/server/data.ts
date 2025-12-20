/**
 * AMORPH v7 - Server Data
 * 
 * Lädt JSON-Daten aus data/ Verzeichnis.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ItemData, Perspective } from '../core/types';
import { getConfig, getAllPerspectives } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../data');

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════════

let cachedItems: ItemData[] | null = null;
let cachedIndex: Record<string, ItemData> | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// DATA LOADER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt alle Items aus dem data/ Verzeichnis.
 * 
 * Struktur:
 *   data/{kingdom}/index.json         -> { species: [{ slug, name, ... }] }
 *   data/{kingdom}/{slug}/index.json  -> Item-Metadaten
 *   data/{kingdom}/{slug}/{perspektive}.json -> Perspektiven-Daten
 */
export async function loadAllItems(forceReload = false): Promise<ItemData[]> {
  if (cachedItems && !forceReload) {
    return cachedItems;
  }
  
  const items: ItemData[] = [];
  
  console.log(`[Data] DATA_PATH: ${DATA_PATH}`);
  console.log(`[Data] DATA_PATH exists: ${existsSync(DATA_PATH)}`);
  
  // Durchsuche Kingdoms
  const kingdoms = ['fungi', 'plantae', 'animalia', 'bacteria'];
  
  for (const kingdom of kingdoms) {
    const kingdomPath = join(DATA_PATH, kingdom);
    console.log(`[Data] Checking kingdom: ${kingdom} at ${kingdomPath}`);
    if (!existsSync(kingdomPath)) {
      console.log(`[Data] Kingdom path does not exist: ${kingdomPath}`);
      continue;
    }
    
    // Prüfe auf index.json
    const indexPath = join(kingdomPath, 'index.json');
    if (existsSync(indexPath)) {
      try {
        const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
        
        // Neue Struktur: species Array
        const speciesList = indexData.species || [];
        
        for (const speciesEntry of speciesList) {
          const slug = speciesEntry.slug;
          if (!slug) continue;
          
          // Lade Item aus Unterordner
          const speciesPath = join(kingdomPath, slug);
          const speciesIndexPath = join(speciesPath, 'index.json');
          
          if (existsSync(speciesIndexPath)) {
            try {
              const itemBase = JSON.parse(readFileSync(speciesIndexPath, 'utf-8'));
              
              // Merge mit species entry Daten
              const item: ItemData = {
                ...itemBase,
                ...speciesEntry,  // Überschreibt mit index.json Daten
                _kingdom: kingdom,
                id: itemBase.id || slug,
                slug: slug,
                _perspectives: {},
                _loadedPerspectives: [] as string[]  // Track which perspectives are loaded
              };
              
              // Lade Perspektiven und merge Felder ins Item
              const perspectiveFiles = (speciesEntry.perspectives || []) as string[];
              for (const perspName of perspectiveFiles) {
                const perspPath = join(speciesPath, `${perspName}.json`);
                if (existsSync(perspPath)) {
                  try {
                    const perspData = JSON.parse(readFileSync(perspPath, 'utf-8'));
                    item._perspectives![perspName] = perspData;
                    (item._loadedPerspectives as string[]).push(perspName);
                    
                    // Merge perspective fields into main item (for display)
                    // Skip internal fields and already existing fields
                    let mergedCount = 0;
                    for (const [key, value] of Object.entries(perspData)) {
                      if (!key.startsWith('_') && item[key] === undefined) {
                        item[key] = value;
                        mergedCount++;
                      }
                    }
                    console.log(`[Data] Merged ${mergedCount}/${Object.keys(perspData).length} fields from ${perspName} into ${slug}`);
                  } catch (e) {
                    console.error(`Error loading perspective ${perspName}:`, e);
                  }
                }
              }
              
              items.push(item);
            } catch (error) {
              console.error(`Error loading ${kingdom}/${slug}/index.json:`, error);
            }
          }
        }
        
        // Alte Struktur: dateien/files Array
        const files = indexData.dateien || indexData.files || [];
        for (const file of files) {
          const filePath = join(kingdomPath, file);
          if (existsSync(filePath)) {
            const item = JSON.parse(readFileSync(filePath, 'utf-8'));
            items.push({
              ...item,
              _kingdom: kingdom,
              id: item.id || item.slug || file.replace('.json', ''),
              slug: item.slug || file.replace('.json', '')
            });
          }
        }
      } catch (error) {
        console.error(`Error loading ${kingdom}/index.json:`, error);
      }
    } else {
      // Direkt JSON-Dateien laden
      const files = readdirSync(kingdomPath).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        try {
          const filePath = join(kingdomPath, file);
          const item = JSON.parse(readFileSync(filePath, 'utf-8'));
          items.push({
            ...item,
            _kingdom: kingdom,
            id: item.id || item.slug || file.replace('.json', ''),
            slug: item.slug || file.replace('.json', '')
          });
        } catch (error) {
          console.error(`Error loading ${kingdom}/${file}:`, error);
        }
      }
    }
  }
  
  cachedItems = items;
  
  // Build index
  cachedIndex = {};
  for (const item of items) {
    cachedIndex[item.slug] = item;
    if (item.id !== item.slug) {
      cachedIndex[item.id] = item;
    }
  }
  
  console.log(`[Data] Loaded ${items.length} items`);
  
  return items;
}

/**
 * Holt ein Item nach Slug.
 */
export async function getItem(slug: string): Promise<ItemData | null> {
  if (!cachedIndex) {
    await loadAllItems();
  }
  return cachedIndex?.[slug] || null;
}

/**
 * Holt mehrere Items nach Slugs.
 */
export async function getItems(slugs: string[]): Promise<ItemData[]> {
  if (!cachedIndex) {
    await loadAllItems();
  }
  return slugs.map(slug => cachedIndex?.[slug]).filter(Boolean) as ItemData[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchOptions {
  query?: string;
  perspectives?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  items: ItemData[];
  total: number;
  perspectivesWithData: string[];
  matchedPerspectives: string[];  // NEW: Perspektiven die zum Query passen
}

/**
 * Durchsucht Items.
 */
export async function searchItems(options: SearchOptions = {}): Promise<SearchResult> {
  const { query = '', perspectives = [], limit = 50, offset = 0 } = options;
  
  let items = await loadAllItems();
  const allPerspectives = getAllPerspectives();
  
  // NEW: Finde Perspektiven die zum Query matchen (erst ab 4 Buchstaben!)
  const matchedPerspectives: string[] = [];
  if (query && query.length >= 4) {
    const lower = query.toLowerCase();
    for (const p of allPerspectives) {
      if (p.name?.toLowerCase().includes(lower) || 
          p.id?.toLowerCase().includes(lower) ||
          p.beschreibung?.toLowerCase().includes(lower)) {
        matchedPerspectives.push(p.id);
      }
    }
  }
  
  // Filter by query
  if (query) {
    const lower = query.toLowerCase();
    items = items.filter(item => {
      // Search in name
      if (item.name?.toLowerCase().includes(lower)) return true;
      
      // Search in all string fields
      for (const [key, value] of Object.entries(item)) {
        if (key.startsWith('_')) continue;
        if (typeof value === 'string' && value.toLowerCase().includes(lower)) {
          return true;
        }
        if (Array.isArray(value)) {
          for (const v of value) {
            if (typeof v === 'string' && v.toLowerCase().includes(lower)) {
              return true;
            }
          }
        }
      }
      
      return false;
    });
  }
  
  // Determine which perspectives have data
  const perspectivesWithData = getPerspectivesWithData(items);
  
  // Filter by perspectives
  if (perspectives.length > 0) {
    const allPerspectives = getAllPerspectives();
    const perspectiveFields = new Set<string>();
    
    for (const pId of perspectives) {
      const p = allPerspectives.find(p => p.id === pId);
      // Support both 'fields' (YAML) and 'felder' (legacy)
      const pFields = p?.fields || p?.felder;
      if (pFields) {
        pFields.forEach(f => perspectiveFields.add(f));
      }
    }
    
    if (perspectiveFields.size > 0) {
      items = items.filter(item => {
        for (const field of perspectiveFields) {
          if (item[field] !== undefined && item[field] !== null) {
            return true;
          }
        }
        return false;
      });
    }
  }
  
  const total = items.length;
  
  // Pagination
  items = items.slice(offset, offset + limit);
  
  return {
    items,
    total,
    perspectivesWithData,
    matchedPerspectives  // NEW
  };
}

/**
 * Ermittelt welche Perspektiven Daten in den Items haben.
 */
function getPerspectivesWithData(items: ItemData[]): string[] {
  const allPerspectives = getAllPerspectives();
  const result: string[] = [];
  
  for (const perspective of allPerspectives) {
    // Support both 'fields' (YAML) and 'felder' (legacy)
    const pFields = perspective.fields || perspective.felder;
    if (!pFields) continue;
    
    // Prüfe ob mindestens ein Item ein Feld dieser Perspektive hat
    const hasData = items.some(item =>
      pFields.some(field =>
        item[field] !== undefined && item[field] !== null && item[field] !== ''
      )
    );
    
    if (hasData) {
      result.push(perspective.id);
    }
  }
  
  return result;
}
