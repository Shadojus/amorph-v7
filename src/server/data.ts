/**
 * AMORPH v7 - Server Data
 * 
 * Lädt JSON-Daten aus data/ Verzeichnis.
 * Mit robuster Fehlerbehandlung für korrupte/fehlende Dateien.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ItemData, Perspective } from '../core/types';
import { getConfig, getAllPerspectives } from './config';
import { loadSiteItems, checkBifroestConnection, getSiteCollection } from './bifroest';

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));

// In production (built), __dirname is /app/dist/server/chunks/
// In dev, __dirname is /app/src/server/
// Data is always at /app/data/ - use process.cwd() for reliability
const BASE_DATA_PATH = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'data')
  : join(__dirname, '../../data');

// Get site-specific data path based on SITE_TYPE
import { getSiteType, SITE_META } from './config';

function getDataPath(): string {
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  return join(BASE_DATA_PATH, siteMeta.dataFolder);
}

const DATA_PATH = getDataPath();

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
// SAFE JSON PARSER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Liest und parst JSON mit detaillierter Fehlerbehandlung.
 */
function safeReadJson<T>(filePath: string): { data: T | null; error: string | null } {
  try {
    if (!existsSync(filePath)) {
      return { data: null, error: `File not found: ${filePath}` };
    }
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as T;
    return { data, error: null };
  } catch (e) {
    const errorMsg = e instanceof SyntaxError 
      ? `Invalid JSON syntax: ${e.message}`
      : e instanceof Error 
        ? e.message 
        : 'Unknown error';
    return { data: null, error: `${filePath}: ${errorMsg}` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROEST API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt Daten von BIFROEST API für die aktuelle Site.
 * Jede Site hat ihre eigene Collection (fungi, paleontology, etc.)
 */
async function loadFromBifroest(): Promise<ItemData[] | null> {
  try {
    const isConnected = await checkBifroestConnection();
    if (!isConnected) {
      console.log('[Data] BIFROEST API not available, using local files');
      return null;
    }
    
    const collection = getSiteCollection();
    console.log(`[Data] Loading from BIFROEST collection: ${collection}`);
    
    const items = await loadSiteItems();
    if (items.length > 0) {
      console.log(`[Data] ✅ Loaded ${items.length} items from BIFROEST API (${collection})`);
      return items;
    }
    
    return null; // Fallback to local
  } catch (error) {
    console.error('[Data] BIFROEST API error:', error);
    return null; // Fallback to local
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA LOADER
// ═══════════════════════════════════════════════════════════════════════════════

// Control data source: 'pocketbase' | 'local' | 'auto' (try pocketbase first, fallback to local)
const DATA_SOURCE = process.env.DATA_SOURCE || 'pocketbase';

/**
 * Lädt alle Items - primär von BIFROEST Pocketbase.
 * Fallback auf lokale Dateien nur wenn DATA_SOURCE='auto' oder 'local'.
 * 
 * Schema: Core fields + 15 Perspective JSON fields (matching blueprints)
 */
export async function loadAllItems(forceReload = false): Promise<ItemData[]> {
  if (cachedItems && !forceReload) {
    return cachedItems;
  }
  
  const items: ItemData[] = [];
  loadErrors = [];
  
  // Get current site type for kingdom info
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const currentCollection = siteMeta.collection; // 'fungi', 'paleontology', etc.
  
  // 1. BIFROEST Pocketbase (primary data source)
  if (DATA_SOURCE === 'pocketbase' || DATA_SOURCE === 'auto') {
    const bifroestItems = await loadFromBifroest();
    if (bifroestItems && bifroestItems.length > 0) {
      console.log(`[Data] ✅ Loaded ${bifroestItems.length} items from Pocketbase (${currentCollection})`);
      cachedItems = bifroestItems;
      cachedIndex = {};
      for (const item of bifroestItems) {
        cachedIndex[item.slug] = item;
      }
      return bifroestItems;
    }
    
    if (DATA_SOURCE === 'pocketbase') {
      // Strict Pocketbase mode - no fallback
      console.error('[Data] ❌ Pocketbase not available and DATA_SOURCE=pocketbase (no fallback)');
      loadErrors.push({ path: 'pocketbase', error: 'BIFROEST API not available' });
      return items;
    }
  }
  
  // 2. Fallback: Lokale Dateien (only if DATA_SOURCE='local' or 'auto')
  if (DATA_SOURCE === 'local' || DATA_SOURCE === 'auto') {
    console.log('[Data] Using local files fallback');
    
    if (!existsSync(DATA_PATH)) {
      loadErrors.push({ path: DATA_PATH, error: 'Data directory not found' });
      console.error(`[Data] DATA_PATH does not exist: ${DATA_PATH}`);
      return items;
    }
    
    // DATA_PATH is now site-specific (e.g., data/fungi/)
    // Load items directly from this path
    const kingdomPath = DATA_PATH;
    
    // Prüfe auf index.json
    const indexPath = join(kingdomPath, 'index.json');
    const indexResult = safeReadJson<{ species?: Array<{ slug: string; perspectives?: string[] }>; dateien?: string[]; files?: string[] }>(indexPath);
    
    if (indexResult.data) {
    const indexData = indexResult.data;
    
    // Neue Struktur: species Array
    const speciesList = indexData.species || [];
    
    for (const speciesEntry of speciesList) {
      const slug = speciesEntry.slug;
      if (!slug) continue;
      
      // Lade Item aus Unterordner
      const speciesPath = join(kingdomPath, slug);
      const speciesIndexPath = join(speciesPath, 'index.json');
      
      const itemResult = safeReadJson<Record<string, unknown>>(speciesIndexPath);
      if (itemResult.error) {
        loadErrors.push({ path: speciesIndexPath, error: itemResult.error });
        continue;
      }
      
      if (itemResult.data) {
        const itemBase = itemResult.data;
        
        // Merge: speciesEntry als Basis, itemBase überschreibt (enthält Details wie image)
        const item: ItemData = {
          ...speciesEntry,  // Kingdom index.json als Basis
          ...itemBase,      // Species index.json überschreibt (hat image, description, etc.)
          _kingdom: currentKingdom,
          id: (itemBase.id as string) || slug,
          slug: slug,
          name: (itemBase.name as string) || slug,
          _perspectives: {},
          _loadedPerspectives: [] as string[],
          _fieldPerspective: {} as Record<string, string>,
          _sources: {}  // Bifroest: GOATn pro Feld
        };
        
        // Lade GOATn (_sources.json) für Bifroest-System
        const sourcesPath = join(speciesPath, '_sources.json');
        const sourcesResult = safeReadJson<Record<string, unknown[]>>(sourcesPath);
        if (sourcesResult.data) {
          item._sources = sourcesResult.data;
        }
        
        // Lade Perspektiven und merge Felder ins Item
        const perspectiveFiles = (speciesEntry.perspectives || []) as string[];
        for (const perspName of perspectiveFiles) {
          const perspPath = join(speciesPath, `${perspName}.json`);
          const perspResult = safeReadJson<Record<string, unknown>>(perspPath);
          
          if (perspResult.error) {
            loadErrors.push({ path: perspPath, error: perspResult.error });
            continue;
          }
          
          if (perspResult.data) {
            const perspData = perspResult.data;
            item._perspectives![perspName] = perspData;
            (item._loadedPerspectives as string[]).push(perspName);
            
            // Merge perspective fields into main item (exclude 'source' - that's metadata, not a field)
            for (const [key, value] of Object.entries(perspData)) {
              if (!key.startsWith('_') && key !== 'source' && item[key] === undefined) {
                item[key] = value;
                (item._fieldPerspective as Record<string, string>)[key] = perspName;
              }
            }
          }
        }
        
        items.push(item);
      }
    }
    
    // Alte Struktur: dateien/files Array
    const files = indexData.dateien || indexData.files || [];
    for (const file of files) {
      const filePath = join(kingdomPath, file);
      const fileResult = safeReadJson<Record<string, unknown>>(filePath);
      if (fileResult.data) {
        const item = fileResult.data;
        items.push({
          ...item,
          _kingdom: currentKingdom,
          id: (item.id as string) || (item.slug as string) || file.replace('.json', ''),
          slug: (item.slug as string) || file.replace('.json', ''),
          name: (item.name as string) || file.replace('.json', '')
        } as ItemData);
      } else if (fileResult.error) {
        loadErrors.push({ path: filePath, error: fileResult.error });
      }
    }
  } else if (indexResult.error && indexResult.error.includes('not found')) {
    // Direkt JSON-Dateien laden (keine index.json vorhanden)
    // Look for species directories with index.json inside
    const entries = readdirSync(kingdomPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const speciesPath = join(kingdomPath, entry.name);
        const speciesIndexPath = join(speciesPath, 'index.json');
        
        if (existsSync(speciesIndexPath)) {
          const itemResult = safeReadJson<Record<string, unknown>>(speciesIndexPath);
          if (itemResult.data) {
            const itemBase = itemResult.data;
            const slug = entry.name;
            
            const item: ItemData = {
              ...itemBase,
              _kingdom: currentKingdom,
              id: (itemBase.id as string) || slug,
              slug: slug,
              name: (itemBase.name as string) || slug,
              _perspectives: {},
              _loadedPerspectives: [] as string[],
              _fieldPerspective: {} as Record<string, string>
            };
            
            // Lade GOATn (_sources.json) für Bifroest-System
            const sourcesPath = join(speciesPath, '_sources.json');
            const sourcesResult = safeReadJson<Record<string, unknown[]>>(sourcesPath);
            if (sourcesResult.data) {
              item._sources = sourcesResult.data;
            }
            
            // Look for perspective JSON files
            const perspFiles = readdirSync(speciesPath)
              .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== '_sources.json')
              .map(f => f.replace('.json', ''));
            
            for (const perspName of perspFiles) {
              const perspPath = join(speciesPath, `${perspName}.json`);
              const perspResult = safeReadJson<Record<string, unknown>>(perspPath);
              
              if (perspResult.data) {
                const perspData = perspResult.data;
                item._perspectives![perspName] = perspData;
                (item._loadedPerspectives as string[]).push(perspName);
                
                // Merge perspective fields into main item (exclude 'source' - that's metadata, not a field)
                for (const [key, value] of Object.entries(perspData)) {
                  if (!key.startsWith('_') && key !== 'source' && item[key] === undefined) {
                    item[key] = value;
                    (item._fieldPerspective as Record<string, string>)[key] = perspName;
                  }
                }
              }
            }
            
            items.push(item);
          }
        }
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Fallback: direct JSON files
        const filePath = join(kingdomPath, entry.name);
        const fileResult = safeReadJson<Record<string, unknown>>(filePath);
        if (fileResult.data) {
          const item = fileResult.data;
          items.push({
            ...item,
            _kingdom: currentKingdom,
            id: (item.id as string) || (item.slug as string) || entry.name.replace('.json', ''),
            slug: (item.slug as string) || entry.name.replace('.json', ''),
            name: (item.name as string) || entry.name.replace('.json', '')
          } as ItemData);
        }
      }
    }
  } else if (indexResult.error) {
    loadErrors.push({ path: indexPath, error: indexResult.error });
  }
  } // End of: if (DATA_SOURCE === 'local' || DATA_SOURCE === 'auto')
  
  cachedItems = items;
  
  // Build index
  cachedIndex = {};
  for (const item of items) {
    cachedIndex[item.slug] = item;
    if (item.id !== item.slug) {
      cachedIndex[item.id] = item;
    }
  }
  
  // Log summary
  if (loadErrors.length > 0) {
    console.warn(`[Data] Loaded ${items.length} items with ${loadErrors.length} errors`);
  } else {
    console.log(`[Data] Loaded ${items.length} items successfully`);
  }
  
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
// LAZY LOADING FOR PERSPECTIVES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt eine spezifische Perspektive für ein Item (Lazy Loading).
 * Wenn bereits geladen, gibt gecachte Daten zurück.
 * 
 * @param slug - Item-Slug
 * @param perspectiveName - Name der Perspektive (z.B. 'chemistry')
 * @returns Perspektiven-Daten oder null wenn nicht vorhanden
 */
export async function loadPerspective(
  slug: string,
  perspectiveName: string
): Promise<Record<string, unknown> | null> {
  const item = await getItem(slug);
  if (!item) return null;
  
  // Prüfe ob bereits geladen
  const cached = item._perspectives?.[perspectiveName];
  if (cached && typeof cached === 'object') {
    return cached as Record<string, unknown>;
  }
  
  // Finde Kingdom und lade
  const kingdom = item._kingdom || 'fungi';
  const perspPath = join(DATA_PATH, kingdom, slug, `${perspectiveName}.json`);
  
  const result = safeReadJson<Record<string, unknown>>(perspPath);
  if (result.error || !result.data) {
    return null;
  }
  
  // Cache in Item
  if (!item._perspectives) {
    item._perspectives = {} as Record<string, Record<string, unknown>>;
  }
  item._perspectives[perspectiveName] = result.data;
  
  // Merge neue Felder ins Item
  for (const [key, value] of Object.entries(result.data)) {
    if (!key.startsWith('_') && item[key] === undefined) {
      item[key] = value;
      if (!item._fieldPerspective) {
        item._fieldPerspective = {} as Record<string, string>;
      }
      (item._fieldPerspective as Record<string, string>)[key] = perspectiveName;
    }
  }
  
  // Update _loadedPerspectives
  const loadedPersp = item._loadedPerspectives as string[] | undefined;
  if (!Array.isArray(loadedPersp)) {
    item._loadedPerspectives = [perspectiveName];
  } else if (!loadedPersp.includes(perspectiveName)) {
    loadedPersp.push(perspectiveName);
  }
  
  return result.data;
}

/**
 * Lädt mehrere Perspektiven für ein Item (Batch Lazy Loading).
 * 
 * @param slug - Item-Slug
 * @param perspectiveNames - Liste der Perspektiven
 * @returns Map von Perspektiv-Name zu Daten
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
 * Prüft ob eine Perspektive für ein Item verfügbar ist (ohne zu laden).
 */
export async function hasPerspective(slug: string, perspectiveName: string): Promise<boolean> {
  const item = await getItem(slug);
  if (!item) return false;
  
  // Bereits geladen?
  if (item._perspectives?.[perspectiveName]) {
    return true;
  }
  
  // Prüfe Dateisystem
  const kingdom = item._kingdom || 'fungi';
  const perspPath = join(DATA_PATH, kingdom, slug, `${perspectiveName}.json`);
  return existsSync(perspPath);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Levenshtein-Distanz für Fuzzy Matching
 * Misst wie viele Änderungen nötig sind um String A in B zu verwandeln
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
 * Prüft ob ein String fuzzy zu einem anderen passt
 * Erlaubt Tippfehler basierend auf Wortlänge
 */
function fuzzyMatch(search: string, target: string): { matches: boolean; score: number } {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exakter Match
  if (targetLower === searchLower) {
    return { matches: true, score: 100 };
  }
  
  // Starts with
  if (targetLower.startsWith(searchLower)) {
    return { matches: true, score: 90 };
  }
  
  // Contains
  if (targetLower.includes(searchLower)) {
    return { matches: true, score: 70 };
  }
  
  // Fuzzy nur für Begriffe >= 4 Zeichen (sonst zu viele false positives)
  if (search.length >= 4) {
    // Prüfe jedes Wort im Target
    const targetWords = targetLower.split(/\s+/);
    for (const word of targetWords) {
      if (word.length < 3) continue;
      
      const distance = levenshteinDistance(searchLower, word);
      // Erlaubte Distanz: 1 für kurze Wörter, 2 für längere
      const maxDistance = search.length <= 6 ? 1 : 2;
      
      if (distance <= maxDistance) {
        // Score basierend auf Ähnlichkeit (0 = perfekt)
        const similarity = 1 - (distance / Math.max(search.length, word.length));
        return { matches: true, score: Math.round(50 * similarity) };
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
    
    // Name (höchste Priorität) - mit Fuzzy
    const nameMatch = fuzzyMatch(term, name);
    if (nameMatch.matches) {
      termScore = Math.max(termScore, nameMatch.score);
    }
    
    // Wissenschaftlicher Name - mit Fuzzy
    const sciMatch = fuzzyMatch(term, scientific);
    if (sciMatch.matches) {
      termScore = Math.max(termScore, sciMatch.score * 0.8); // Etwas weniger als Name
    }
    
    // Andere Felder (nur exact/contains, kein fuzzy) - suche in Key UND Value!
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
  
  // Bonus wenn mehrere Begriffe matchen
  if (searchTerms.length > 1 && matchedTerms > 0) {
    // Prozentual wie viele Begriffe getroffen wurden
    const matchRatio = matchedTerms / searchTerms.length;
    totalScore *= (1 + matchRatio * 0.5);
  }
  
  return Math.round(totalScore);
}

/**
 * Tokenisiert Suchanfrage
 * - Komma trennt ODER-Gruppen (mehrere Spezies)
 * - Leerzeichen innerhalb einer Gruppe = zusammengehörig
 */
function tokenizeQuery(query: string): { orGroups: string[][], allTerms: string[] } {
  // Komma = mehrere Spezies (ODER)
  const orParts = query.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  const orGroups: string[][] = [];
  const allTerms: string[] = [];
  
  for (const part of orParts) {
    // Jeder Teil wird in Wörter aufgeteilt
    const terms = part.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (terms.length > 0) {
      orGroups.push(terms);
      allTerms.push(...terms);
    }
  }
  
  return { orGroups, allTerms: [...new Set(allTerms)] };
}

/**
 * Hilfsfunktion: Sucht rekursiv in einem Wert (String, Array, Objekt)
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
 * Hilfsfunktion: Sucht in Key UND Value
 */
function searchInKeyValue(key: string, value: unknown, searchLower: string): boolean {
  // Suche im Feldnamen (z.B. "annual_variation")
  if (key.toLowerCase().includes(searchLower)) {
    return true;
  }
  // Suche im Wert
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
  matchedPerspectives: string[];  // NEW: Perspektiven die zum Query passen
}

/**
 * Durchsucht Items.
 */
export async function searchItems(options: SearchOptions = {}): Promise<SearchResult> {
  const { query = '', perspectives = [], limit = 50, offset = 0 } = options;
  
  let items = await loadAllItems();
  
  // Track welche Perspektiven Treffer haben (über alle Items)
  const matchedPerspectivesSet = new Set<string>();
  
  // Tokenisiere Query - unterstützt Komma für mehrere Spezies
  const { orGroups, allTerms } = query ? tokenizeQuery(query) : { orGroups: [], allTerms: [] };
  
  // Filter by query und finde Perspektiven mit Treffern (ab 3 Zeichen)
  if (allTerms.length > 0 && allTerms.some(t => t.length >= 3)) {
    // Durchsuche alle Items nach Treffern in Perspektiven-Daten
    for (const item of items) {
      if (item._perspectives) {
        for (const [perspId, perspData] of Object.entries(item._perspectives as Record<string, unknown>)) {
          if (!perspData || typeof perspData !== 'object') continue;
          
          // Durchsuche alle Keys UND Values in dieser Perspektive
          for (const [key, value] of Object.entries(perspData as Record<string, unknown>)) {
            // Prüfe ob mindestens ein Suchbegriff in Key oder Value trifft
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
  
  // Filter und Score by query
  if (orGroups.length > 0) {
    // Für jedes Item: Prüfe ob es zu mindestens einer OR-Gruppe passt
    const scoredItems = items.map(item => {
      let bestScore = 0;
      
      // Prüfe jede OR-Gruppe (Komma-getrennte Teile)
      for (const groupTerms of orGroups) {
        const score = calculateRelevanceScore(item, groupTerms);
        bestScore = Math.max(bestScore, score);
      }
      
      return { item, score: bestScore };
    });
    
    // Filtere Items ohne Treffer und sortiere nach Relevanz
    items = scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
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
