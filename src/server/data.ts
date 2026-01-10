/**
 * AMORPH v8 - Server Data
 * 
 * Lädt Daten aus PostgreSQL via Prisma.
 * Bilder werden aus public/images/ geladen.
 * 
 * PostgreSQL-Only Edition - No local JSON fallback
 */

import type { ItemData, Perspective } from '../core/types';
import { getConfig, getAllPerspectives } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════════

let cachedItems: ItemData[] | null = null;
let cachedIndex: Record<string, ItemData> | null = null;
let loadErrors: { path: string; error: string }[] = [];

/**
 * Gibt die letzten Ladefehler zurück (für Debugging).
 */
export function getLoadErrors(): { path: string; error: string }[] {
  return [...loadErrors];
}

/**
 * Invalidiert den Cache (z.B. nach Datenänderung).
 */
export function invalidateCache(): void {
  cachedItems = null;
  cachedIndex = null;
  loadErrors = [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA LOADER - PostgreSQL Only
// ═══════════════════════════════════════════════════════════════════════════════

// Import database loader
import { loadAllItemsFromDB, loadItemsFromAllDomains, getItemBySlugFromDB, searchItemsInDB, invalidateDBCache } from './data-db';

/**
 * Lädt alle Items aus PostgreSQL für die aktuelle Domain.
 * Keine lokalen Fallbacks - nur Datenbank.
 */
export async function loadAllItems(forceReload = false): Promise<ItemData[]> {
  // Return cached if available
  if (cachedItems && !forceReload) {
    return cachedItems;
  }

  console.log('[Data] Loading from PostgreSQL (DB-only mode)');
  
  try {
    const dbItems = await loadAllItemsFromDB(forceReload);
    cachedItems = dbItems;
    cachedIndex = {};
    for (const item of dbItems) {
      cachedIndex[item.slug] = item;
    }
    
    if (dbItems.length === 0) {
      console.warn('[Data] Database returned 0 items - ensure data is seeded');
    } else {
      console.log(`[Data] Loaded ${dbItems.length} items from database`);
    }
    
    return dbItems;
  } catch (error) {
    console.error('[Data] Database error:', error);
    loadErrors.push({ path: 'database', error: String(error) });
    // Return empty array instead of falling back to local files
    return [];
  }
}

/**
 * Lädt Items aus ALLEN Domains (für Landing Page).
 * Keine Domain-Filterung - alle 17 Domains.
 */
export async function loadGlobalItems(forceReload = false): Promise<ItemData[]> {
  console.log('[Data] Loading items from ALL domains');
  
  try {
    const allItems = await loadItemsFromAllDomains(forceReload);
    console.log(`[Data] Loaded ${allItems.length} items from all domains`);
    return allItems;
  } catch (error) {
    console.error('[Data] Database error loading global items:', error);
    return [];
  }
}

/**
 * Holt ein Item nach Slug.
 * Nutzt DB direkt, mit lokalem Cache.
 */
export async function getItem(slug: string): Promise<ItemData | null> {
  // Check cache first
  if (cachedIndex?.[slug]) {
    return cachedIndex[slug];
  }
  
  // Try database
  try {
    const item = await getItemBySlugFromDB(slug);
    if (item) {
      // Cache it
      if (!cachedIndex) cachedIndex = {};
      cachedIndex[slug] = item;
      return item;
    }
  } catch (error) {
    console.error('[Data] DB getItem error:', error);
  }
  
  // If not in cache, load all items and try again
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
// LAZY LOADING FOR PERSPECTIVES (DB-backed)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt eine spezifische Perspektive für ein Item.
 * In DB-only mode sind Perspektiven bereits im Item eingebettet.
 */
export async function loadPerspective(
  slug: string,
  perspectiveName: string
): Promise<Record<string, unknown> | null> {
  const item = await getItem(slug);
  if (!item) return null;
  
  // Perspektiven sind bereits im Item geladen (DB enthält alles)
  const cached = item._perspectives?.[perspectiveName];
  if (cached && typeof cached === 'object') {
    return cached as Record<string, unknown>;
  }
  
  return null;
}

/**
 * Lädt mehrere Perspektiven für ein Item (Batch).
 */
export async function loadPerspectives(
  slug: string,
  perspectiveNames: string[]
): Promise<Map<string, Record<string, unknown>>> {
  const results = new Map<string, Record<string, unknown>>();
  
  for (const name of perspectiveNames) {
    const data = await loadPerspective(slug, name);
    if (data) {
      results.set(name, data);
    }
  }
  
  return results;
}

/**
 * Prüft ob eine Perspektive für ein Item verfügbar ist.
 */
export async function hasPerspective(slug: string, perspectiveName: string): Promise<boolean> {
  const item = await getItem(slug);
  if (!item) return false;
  
  // Check if perspective exists in loaded data
  return !!item._perspectives?.[perspectiveName];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH - Uses Database
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Levenshtein-Distanz für Fuzzy Matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Fuzzy Match - Prüft ob Term im Text vorkommt
 */
function fuzzyMatch(term: string, text: string): { matches: boolean; score: number } {
  const termLower = term.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower === termLower) {
    return { matches: true, score: 100 };
  }
  
  // Starts with
  if (textLower.startsWith(termLower)) {
    return { matches: true, score: 90 };
  }
  
  // Contains
  if (textLower.includes(termLower)) {
    const position = textLower.indexOf(termLower);
    const positionScore = Math.max(50, 80 - position);
    return { matches: true, score: positionScore };
  }
  
  // Fuzzy match for longer terms
  if (termLower.length >= 4) {
    const words = textLower.split(/\s+/);
    for (const word of words) {
      const distance = levenshteinDistance(termLower, word);
      const maxAllowedDistance = Math.floor(termLower.length / 3);
      
      if (distance <= maxAllowedDistance) {
        const score = 40 - (distance * 10);
        return { matches: true, score: Math.max(10, score) };
      }
    }
  }
  
  return { matches: false, score: 0 };
}

/**
 * Berechnet Relevanz-Score für ein Item
 */
function calculateRelevanceScore(item: ItemData, searchTerms: string[]): number {
  if (searchTerms.length === 0) return 0;
  
  let totalScore = 0;
  let matchedTerms = 0;
  
  const name = item.name || '';
  const scientific = (item.wissenschaftlich || item.scientific_name) ? String(item.wissenschaftlich || item.scientific_name) : '';
  
  for (const term of searchTerms) {
    let termScore = 0;
    
    // Name (höchste Priorität)
    const nameMatch = fuzzyMatch(term, name);
    if (nameMatch.matches) {
      termScore = Math.max(termScore, nameMatch.score);
    }
    
    // Wissenschaftlicher Name
    const sciMatch = fuzzyMatch(term, scientific);
    if (sciMatch.matches) {
      termScore = Math.max(termScore, sciMatch.score * 0.8);
    }
    
    // Andere Felder
    if (termScore === 0) {
      for (const [key, value] of Object.entries(item)) {
        if (key.startsWith('_') || key === 'name' || key === 'wissenschaftlich' || key === 'scientific_name') continue;
        if (searchInKeyValue(key, value, term.toLowerCase())) {
          termScore = 20;
          break;
        }
      }
    }
    
    if (termScore > 0) {
      matchedTerms++;
      totalScore += termScore;
    }
  }
  
  // Bonus für mehrere Treffer
  if (searchTerms.length > 1 && matchedTerms > 0) {
    const matchRatio = matchedTerms / searchTerms.length;
    totalScore *= (1 + matchRatio * 0.5);
  }
  
  return Math.round(totalScore);
}

/**
 * Tokenisiert Suchanfrage
 */
function tokenizeQuery(query: string): { orGroups: string[][], allTerms: string[] } {
  const orParts = query.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  const orGroups: string[][] = [];
  const allTerms: string[] = [];
  
  for (const part of orParts) {
    const terms = part.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (terms.length > 0) {
      orGroups.push(terms);
      allTerms.push(...terms);
    }
  }
  
  return { orGroups, allTerms: [...new Set(allTerms)] };
}

/**
 * Sucht rekursiv in einem Wert
 */
function searchInValue(value: unknown, searchLower: string): boolean {
  if (typeof value === 'string') {
    return value.toLowerCase().includes(searchLower);
  }
  if (typeof value === 'number') {
    return String(value).includes(searchLower);
  }
  if (Array.isArray(value)) {
    return value.some(v => searchInValue(v, searchLower));
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(v => searchInValue(v, searchLower));
  }
  return false;
}

/**
 * Sucht in Key UND Value
 */
function searchInKeyValue(key: string, value: unknown, searchLower: string): boolean {
  if (key.toLowerCase().includes(searchLower)) {
    return true;
  }
  return searchInValue(value, searchLower);
}

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
  matchedPerspectives: string[];
}

/**
 * Durchsucht Items.
 * Nutzt PostgreSQL für die Suche.
 */
export async function searchItems(options: SearchOptions = {}): Promise<SearchResult> {
  const { query = '', perspectives = [], limit = 50, offset = 0 } = options;
  
  // Try database search first
  if (query.length >= 2) {
    try {
      const dbResults = await searchItemsInDB(query, limit);
      if (dbResults.length > 0) {
        const perspectivesWithData = getPerspectivesWithData(dbResults);
        return {
          items: dbResults,
          total: dbResults.length,
          perspectivesWithData,
          matchedPerspectives: []
        };
      }
    } catch (error) {
      console.error('[Data] DB search error:', error);
    }
  }
  
  // Fall back to in-memory search on cached items
  let items = await loadAllItems();
  
  const matchedPerspectivesSet = new Set<string>();
  const { orGroups, allTerms } = query ? tokenizeQuery(query) : { orGroups: [], allTerms: [] };
  
  // Find perspectives with matches
  if (allTerms.length > 0 && allTerms.some(t => t.length >= 3)) {
    for (const item of items) {
      if (item._perspectives) {
        for (const [perspId, perspData] of Object.entries(item._perspectives as Record<string, unknown>)) {
          if (!perspData || typeof perspData !== 'object') continue;
          
          for (const [key, value] of Object.entries(perspData as Record<string, unknown>)) {
            if (allTerms.some(term => searchInKeyValue(key, value, term))) {
              matchedPerspectivesSet.add(perspId);
              break;
            }
          }
        }
      }
    }
  }
  
  const matchedPerspectives = [...matchedPerspectivesSet];
  
  // Filter and score by query
  if (orGroups.length > 0) {
    const scoredItems = items.map(item => {
      let bestScore = 0;
      
      for (const groupTerms of orGroups) {
        const score = calculateRelevanceScore(item, groupTerms);
        bestScore = Math.max(bestScore, score);
      }
      
      return { item, score: bestScore };
    });
    
    items = scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }
  
  const perspectivesWithData = getPerspectivesWithData(items);
  
  // Filter by perspectives
  if (perspectives.length > 0) {
    const allPerspectives = getAllPerspectives();
    const perspectiveFields = new Set<string>();
    
    for (const pId of perspectives) {
      const p = allPerspectives.find(p => p.id === pId);
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
  items = items.slice(offset, offset + limit);
  
  return {
    items,
    total,
    perspectivesWithData,
    matchedPerspectives
  };
}

/**
 * Ermittelt welche Perspektiven Daten in den Items haben.
 */
function getPerspectivesWithData(items: ItemData[]): string[] {
  const allPerspectives = getAllPerspectives();
  const result: string[] = [];
  
  for (const perspective of allPerspectives) {
    const pFields = perspective.fields || perspective.felder;
    if (!pFields) continue;
    
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
