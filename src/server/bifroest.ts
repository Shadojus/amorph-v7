/**
 * AMORPH - BIFROEST Species Client v3
 * 
 * Lädt Species-Daten von der BIFROEST Pocketbase.
 * Unterstützt separate Biology- und Geology-Collections.
 * 
 * Collections:
 * - Biology: fungi, plantae, therion
 * - Geology: paleontology, mineralogy, tectonics
 * 
 * Features:
 * - Multi-domain support (biology/geology)
 * - Site-specific loading (FUNGINOMI, PALEONOMI, etc.)
 * - Domain-specific perspectives
 * - In-memory caching with configurable TTL
 * - Health check for connection monitoring
 */

import type { ItemData } from '../core/types';
import { cachedFetch, invalidateSpeciesCache } from './cache';
import { getSiteType, getSiteDomain, SITE_META, SITE_DOMAIN, type SiteType, type Domain } from './config';

// API Configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '5000', 10);
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);

// Connection state
let lastHealthCheck = 0;
let isConnected = true;

// ============================================================================
// COLLECTION CONFIGURATION
// ============================================================================

// Collection types (map to Pocketbase collection names)
type BiologyCollection = 'fungi' | 'plantae' | 'therion';
type GeologyCollection = 'paleontology' | 'mineralogy' | 'tectonics';
type Collection = BiologyCollection | GeologyCollection;

const BIOLOGY_COLLECTIONS: BiologyCollection[] = ['fungi', 'plantae', 'therion'];
const GEOLOGY_COLLECTIONS: GeologyCollection[] = ['paleontology', 'mineralogy', 'tectonics'];
const ALL_COLLECTIONS: Collection[] = [...BIOLOGY_COLLECTIONS, ...GEOLOGY_COLLECTIONS];

// Map collection to domain (uses SITE_DOMAIN from config for consistency)
function getCollectionDomain(collection: Collection): Domain {
  // Find site type by collection
  for (const [siteType, meta] of Object.entries(SITE_META)) {
    if (meta.collection === collection) {
      return SITE_DOMAIN[siteType as SiteType];
    }
  }
  return 'biology'; // default
}

// Map legacy category names to collections
const CATEGORY_TO_COLLECTION: Record<string, Collection> = {
  'Fungi': 'fungi',
  'Plantae': 'plantae',
  'Therion': 'therion',
  'fungi': 'fungi',
  'plantae': 'plantae',
  'therion': 'therion'
};

// ============================================================================
// PERSPECTIVES PER DOMAIN
// ============================================================================

// Biology: 15 perspectives
const BIOLOGY_PERSPECTIVES = [
  'identification', 'ecology', 'chemistry', 'medicine', 'safety',
  'culinary', 'cultivation', 'conservation', 'culture', 'economy',
  'geography', 'interactions', 'research', 'statistics', 'temporal'
] as const;

// Paleontology: 11 perspectives
const PALEONTOLOGY_PERSPECTIVES = [
  'taxonomy_paleo', 'morphology', 'chronology', 'paleoecology', 'taphonomy',
  'biogeography', 'extinction', 'discoveries', 'reconstruction', 'museum', 'research'
] as const;

// Mineralogy: 11 perspectives
const MINERALOGY_PERSPECTIVES = [
  'classification', 'chemistry', 'crystallography', 'physical', 'optical',
  'formation', 'occurrence', 'economic_mineral', 'collecting', 'gemology', 'research'
] as const;

// Tectonics: 6 perspectives
const TECTONICS_PERSPECTIVES = [
  'chronology', 'stratigraphy', 'plate_tectonics', 'structural', 'deformation', 'research'
] as const;

function getPerspectivesForCollection(collection: Collection): readonly string[] {
  switch (collection) {
    case 'fungi':
    case 'plantae':
    case 'therion':
      return BIOLOGY_PERSPECTIVES;
    case 'paleontology':
      return PALEONTOLOGY_PERSPECTIVES;
    case 'mineralogy':
      return MINERALOGY_PERSPECTIVES;
    case 'tectonics':
      return TECTONICS_PERSPECTIVES;
    default:
      return BIOLOGY_PERSPECTIVES;
  }
}

interface PocketbaseResponse {
  items: PocketbaseSpecies[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

// Generic record with any perspective field
interface PocketbaseSpecies {
  id: string;
  collectionId: string;
  collectionName: string;
  // Core fields
  slug: string;
  name: string;
  scientific_name: string;
  description: string;
  category?: string; // Optional, inferred from collection
  image: string;
  // All possible perspective fields as dynamic
  [key: string]: unknown;
}

/**
 * Konvertiert Pocketbase Species zu AMORPH ItemData Format
 * @param species - Raw species record from Pocketbase
 * @param collectionName - Name of the collection (for perspective detection)
 */
function toItemData(species: PocketbaseSpecies, collectionName: Collection): ItemData {
  const domain = getCollectionDomain(collectionName);
  const perspectives = getPerspectivesForCollection(collectionName);
  
  // Derive kingdom from collection name (capitalize first letter)
  const kingdom = species.category || 
    collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  
  const item: ItemData = {
    id: species.id,
    slug: species.slug,
    name: species.name,
    scientificName: species.scientific_name,
    description: species.description,
    image: species.image as string,
    _kingdom: kingdom,
    _collection: collectionName,
    _domain: domain,
    _fieldPerspective: {} as Record<string, string>,
    _perspectives: {},
    _loadedPerspectives: [],
    _sources: (species.sources || {}) as ItemData['_sources']
  };
  
  // Extract perspective fields based on collection type
  for (const perspective of perspectives) {
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

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch records from a specific collection
 */
async function fetchFromCollection(
  collection: Collection,
  options: { slug?: string; perPage?: number } = {}
): Promise<ItemData[]> {
  const { slug, perPage = 100 } = options;
  
  try {
    const url = new URL(`${POCKETBASE_URL}/api/collections/${collection}/records`);
    url.searchParams.set('perPage', perPage.toString());
    
    if (slug) {
      url.searchParams.set('filter', `slug="${slug}"`);
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
    return data.items.map(item => toItemData(item, collection));
    
  } catch (error) {
    console.error(`[BIFROEST] Failed to fetch from ${collection}:`, error);
    throw error;
  }
}

/**
 * Lädt alle Records aus einer Collection (mit Caching)
 */
export async function loadByCollection(collection: Collection): Promise<ItemData[]> {
  console.log(`[BIFROEST] Loading collection: ${collection}`);
  
  try {
    const items = await cachedFetch(
      `collection:${collection}:all`,
      () => fetchFromCollection(collection),
      CACHE_TTL
    );
    console.log(`[BIFROEST] ✅ Loaded ${items.length} items from ${collection}`);
    isConnected = true;
    return items;
  } catch (error) {
    console.error(`[BIFROEST] ❌ Failed to load ${collection}`);
    isConnected = false;
    return [];
  }
}

/**
 * Lädt alle Records für eine Domain (biology/geology)
 */
export async function loadByDomain(domain: Domain): Promise<ItemData[]> {
  console.log(`[BIFROEST] Loading domain: ${domain}`);
  
  const collections = domain === 'biology' ? BIOLOGY_COLLECTIONS : GEOLOGY_COLLECTIONS;
  const results: ItemData[] = [];
  
  for (const collection of collections) {
    try {
      const items = await loadByCollection(collection);
      results.push(...items);
    } catch (error) {
      console.error(`[BIFROEST] Failed to load ${collection}`);
    }
  }
  
  console.log(`[BIFROEST] ✅ Loaded ${results.length} total items from ${domain}`);
  return results;
}

/**
 * Lädt alle Biology-Species (fungi, plantae, therion)
 * Backward compatible with old loadSpeciesByCategory
 */
export async function loadSpeciesByCategory(category: string): Promise<ItemData[]> {
  console.log(`[BIFROEST] Loading by category: ${category}`);
  
  // Map legacy category to collection
  const collection = CATEGORY_TO_COLLECTION[category];
  
  if (collection) {
    return loadByCollection(collection);
  }
  
  // If no mapping found, try as collection name
  if (ALL_COLLECTIONS.includes(category as Collection)) {
    return loadByCollection(category as Collection);
  }
  
  console.warn(`[BIFROEST] Unknown category: ${category}`);
  return [];
}

/**
 * Lädt einzelne Species/Item by Slug (sucht in allen Collections)
 */
export async function loadSpeciesBySlug(slug: string): Promise<ItemData | null> {
  console.log(`[BIFROEST] Loading by slug: ${slug}`);
  
  // Search in all collections
  for (const collection of ALL_COLLECTIONS) {
    try {
      const items = await cachedFetch(
        `${collection}:slug:${slug}`,
        () => fetchFromCollection(collection, { slug }),
        CACHE_TTL
      );
      if (items.length > 0) {
        console.log(`[BIFROEST] ✅ Found ${items[0].name} in ${collection}`);
        isConnected = true;
        return items[0];
      }
    } catch {
      // Continue searching other collections
    }
  }
  
  console.log(`[BIFROEST] ❌ Not found: ${slug}`);
  return null;
}

/**
 * Lädt einzelnes Item by Slug aus einer bestimmten Collection
 */
export async function loadItemBySlug(
  collection: Collection, 
  slug: string
): Promise<ItemData | null> {
  console.log(`[BIFROEST] Loading ${collection}/${slug}`);
  
  try {
    const items = await cachedFetch(
      `${collection}:slug:${slug}`,
      () => fetchFromCollection(collection, { slug }),
      CACHE_TTL
    );
    if (items.length > 0) {
      console.log(`[BIFROEST] ✅ Loaded ${items[0].name}`);
      isConnected = true;
      return items[0];
    }
    return null;
  } catch {
    console.error(`[BIFROEST] ❌ Failed to load ${collection}/${slug}`);
    isConnected = false;
    return null;
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use loadByCollection or loadByDomain instead
 */
export async function fetchSpeciesFromPocketbase(options: {
  category?: string;
  slug?: string;
  perPage?: number;
}): Promise<ItemData[]> {
  const { category, slug } = options;
  
  if (slug) {
    const item = await loadSpeciesBySlug(slug);
    return item ? [item] : [];
  }
  
  if (category) {
    return loadSpeciesByCategory(category);
  }
  
  // Load all biology items by default
  return loadByDomain('biology');
}

/**
 * Prüft ob BIFROEST API erreichbar ist (mit Caching)
 */
export async function checkBifroestConnection(): Promise<boolean> {
  const now = Date.now();
  
  // Nur alle 10 Sekunden prüfen
  if (now - lastHealthCheck < 10000) {
    return isConnected;
  }
  
  lastHealthCheck = now;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${POCKETBASE_URL}/api/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    isConnected = response.ok;
    return isConnected;
  } catch {
    isConnected = false;
    return false;
  }
}

/**
 * Get connection status without making a request
 */
export function getBifroestStatus(): { connected: boolean; url: string; lastCheck: number } {
  return {
    connected: isConnected,
    url: POCKETBASE_URL,
    lastCheck: lastHealthCheck
  };
}

/**
 * Invalidate cache (for admin operations)
 */
export function invalidateBifroestCache(category?: string): void {
  invalidateSpeciesCache(category);
}

// ============================================================================
// SITE-SPECIFIC LOADING
// ============================================================================

/**
 * Lädt alle Items für die aktuelle Site (basierend auf SITE_TYPE env)
 * Jede Site hat ihre eigene Collection:
 * - fungi → FUNGINOMI
 * - plantae → PHYTONOMI
 * - therion → THERIONOMI
 * - paleontology → PALEONOMI
 * - tectonics → TEKTONOMI
 * - mineralogy → MINENOMI
 */
export async function loadSiteItems(): Promise<ItemData[]> {
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const collection = siteMeta.collection as Collection;
  
  console.log(`[BIFROEST] Loading items for site: ${siteMeta.name} (collection: ${collection})`);
  
  return loadByCollection(collection);
}

/**
 * Get the collection name for the current site
 */
export function getSiteCollection(): Collection {
  const siteType = getSiteType();
  return SITE_META[siteType].collection as Collection;
}
