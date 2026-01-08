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
// COLLECTION CONFIGURATION - V2 (Domain-Specific Collections)
// ============================================================================

// 17 Domain Types (matching amorph-* blueprint folders)
type DomainCollection = 
  // Biology
  | 'fungi_entities' | 'phyto_entities' | 'drako_entities'
  // Geology  
  | 'paleo_entities' | 'tekto_entities' | 'mine_entities'
  // Biomedical
  | 'bakterio_entities' | 'viro_entities' | 'geno_entities' | 'anato_entities'
  // Physics & Chemistry
  | 'chemo_entities' | 'physi_entities' | 'kosmo_entities'
  // Technology
  | 'netzo_entities' | 'cognito_entities' | 'biotech_entities' | 'socio_entities';

// Legacy collection type for backward compatibility
type Collection = DomainCollection;

// All 17 domain collections
const ALL_COLLECTIONS: DomainCollection[] = [
  // Biology
  'fungi_entities', 'phyto_entities', 'drako_entities',
  // Geology
  'paleo_entities', 'tekto_entities', 'mine_entities',
  // Biomedical
  'bakterio_entities', 'viro_entities', 'geno_entities', 'anato_entities',
  // Physics & Chemistry
  'chemo_entities', 'physi_entities', 'kosmo_entities',
  // Technology
  'netzo_entities', 'cognito_entities', 'biotech_entities', 'socio_entities'
];

// Extract domain name from collection name (e.g., 'fungi_entities' → 'fungi')
function getDomainFromCollection(collection: DomainCollection): string {
  return collection.replace('_entities', '');
}

// Map collection to domain category
function getCollectionDomain(collection: DomainCollection): Domain {
  const domain = getDomainFromCollection(collection);
  // Find site type by domain name
  for (const [siteType, meta] of Object.entries(SITE_META)) {
    if (meta.collection === collection) {
      return SITE_DOMAIN[siteType as SiteType];
    }
  }
  return 'biology'; // default
}

// Map legacy category names to new collections
const CATEGORY_TO_COLLECTION: Record<string, DomainCollection> = {
  // Biology (legacy)
  'Fungi': 'fungi_entities', 'fungi': 'fungi_entities',
  'Plantae': 'phyto_entities', 'plantae': 'phyto_entities', 'phyto': 'phyto_entities',
  'Therion': 'drako_entities', 'therion': 'drako_entities', 'drako': 'drako_entities',
  // Geology
  'paleontology': 'paleo_entities', 'paleo': 'paleo_entities',
  'tectonics': 'tekto_entities', 'tekto': 'tekto_entities',
  'mineralogy': 'mine_entities', 'mine': 'mine_entities',
  // Biomedical
  'microbiology': 'bakterio_entities', 'bakterio': 'bakterio_entities',
  'virology': 'viro_entities', 'viro': 'viro_entities',
  'genetics': 'geno_entities', 'geno': 'geno_entities',
  'anatomy': 'anato_entities', 'anato': 'anato_entities',
  // Physics & Chemistry
  'chemistry': 'chemo_entities', 'chemo': 'chemo_entities',
  'physics': 'physi_entities', 'physi': 'physi_entities',
  'astronomy': 'kosmo_entities', 'kosmo': 'kosmo_entities',
  // Technology
  'informatics': 'netzo_entities', 'netzo': 'netzo_entities',
  'ai': 'cognito_entities', 'cognito': 'cognito_entities',
  'biotech': 'biotech_entities',
  'sociology': 'socio_entities', 'socio': 'socio_entities'
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
interface PocketbaseEntity {
  id: string;
  collectionId: string;
  collectionName: string;
  // Core fields (V2 schema)
  slug: string;
  scientific_name: string;
  common_name?: string;  // V2 uses common_name instead of name
  name?: string;         // Legacy field
  description?: string;
  image?: string;
  images?: string[]; // File field for images
  tags?: string[];   // V2 tags field (JSON array)
  data?: Record<string, unknown>; // JSON field with all perspective data
  // Domain-specific fields may exist
  [key: string]: unknown;
}

// Alias for backward compatibility
type PocketbaseSpecies = PocketbaseEntity;

/**
 * Konvertiert Pocketbase Entity zu AMORPH ItemData Format
 * @param entity - Raw entity record from Pocketbase
 * @param collectionName - Name of the collection (for perspective detection)
 */
function toItemData(entity: PocketbaseEntity, collectionName: DomainCollection): ItemData {
  const domain = getCollectionDomain(collectionName);
  const domainName = getDomainFromCollection(collectionName);
  
  // Derive kingdom/category from collection name
  const kingdom = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  
  // Handle image: can be single string, array from files, or empty
  let image = '';
  if (typeof entity.image === 'string' && entity.image) {
    image = entity.image;
  } else if (Array.isArray(entity.images) && entity.images.length > 0) {
    // Build PocketBase file URL
    image = `${POCKETBASE_URL}/api/files/${entity.collectionId}/${entity.id}/${entity.images[0]}`;
  }
  
  // V2 uses common_name, legacy uses name
  const displayName = entity.common_name || entity.name || entity.scientific_name;
  
  const item: ItemData = {
    id: entity.id,
    slug: entity.slug,
    name: displayName,
    scientificName: entity.scientific_name,
    description: entity.description || '',
    image: image,
    _kingdom: kingdom,
    _collection: collectionName,
    _domain: domain,
    _fieldPerspective: {} as Record<string, string>,
    _perspectives: {},
    _loadedPerspectives: [],
    _sources: (entity.sources || {}) as ItemData['_sources']
  };
  
  // Copy domain-specific fields to item
  const systemFields = ['id', 'collectionId', 'collectionName', 'slug', 'scientific_name', 
    'common_name', 'name', 'description', 'image', 'images', 'data', 'created', 'updated', 'tags'];
  for (const [key, value] of Object.entries(entity)) {
    if (!systemFields.includes(key) && !key.startsWith('_') && item[key] === undefined) {
      item[key] = value;
    }
  }
  
  // Handle tags
  if (Array.isArray(entity.tags)) {
    item.tags = entity.tags;
  }
  
  // Extract perspective data from the "data" JSON field (new unified format)
  const perspectiveData = entity.data || {};
  for (const [perspectiveName, perspectiveContent] of Object.entries(perspectiveData)) {
    if (perspectiveContent && typeof perspectiveContent === 'object') {
      // Store in _perspectives
      item._perspectives![perspectiveName] = perspectiveContent;
      (item._loadedPerspectives as string[]).push(perspectiveName);
      
      // Merge fields into main item for direct access
      for (const [fieldKey, fieldValue] of Object.entries(perspectiveContent as Record<string, unknown>)) {
        if (!fieldKey.startsWith('_') && item[fieldKey] === undefined) {
          item[fieldKey] = fieldValue;
        }
      }
      
      // Map field to perspective
      for (const fieldKey of Object.keys(perspectiveContent as Record<string, unknown>)) {
        (item._fieldPerspective as Record<string, string>)[fieldKey] = perspectiveName;
      }
    }
  }
  
  // Legacy format support removed - all data now in "data" JSON field
  
  return item;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

// Available perspective tables in the normalized schema
const PERSPECTIVE_TABLES = [
  // Fungi
  'fungal_intelligence', 'chemical_ecology', 'mycelial_networks', 
  'ecosystem_engineering', 'spore_dispersal', 'bioluminescence',
  // Microbiology
  'antibiotic_resistance', 'metabolic_networks', 'biofilm_networks', 'bacterial_communication',
  // Virology
  'taxonomy_viro', 'pathogenesis', 'evolution_viro', 'epidemiology', 'vaccines',
  // Genetics
  'gene_structure', 'mutations', 'gene_regulation', 'diseases_genetic',
  // Anatomy
  'gross_anatomy', 'physiology', 'clinical',
  // Chemistry
  'atomic_structure', 'bonding', 'thermodynamics',
  // Physics
  'quantum', 'particle',
  // Astronomy
  'classification_astro', 'orbital', 'composition_astro',
  // AI
  'model_architecture', 'capabilities', 'benchmarks'
] as const;

/**
 * Fetch perspective data for a species from normalized tables
 */
async function fetchPerspectivesForSpecies(speciesId: string): Promise<Record<string, unknown>> {
  const perspectives: Record<string, unknown> = {};
  
  // Fetch all perspectives in parallel
  const fetchPromises = PERSPECTIVE_TABLES.map(async (perspectiveName) => {
    try {
      const url = `${POCKETBASE_URL}/api/collections/perspective_${perspectiveName}/records?filter=(species='${speciesId}')`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Short timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data: PocketbaseResponse = await response.json();
        if (data.items?.length > 0) {
          // Remove system fields from perspective data
          const perspData = { ...data.items[0] };
          delete perspData.id;
          delete perspData.collectionId;
          delete perspData.collectionName;
          delete perspData.species;
          delete perspData.created;
          delete perspData.updated;
          perspectives[perspectiveName] = perspData;
        }
      }
    } catch {
      // Perspective table doesn't exist or fetch failed - ignore silently
    }
  });
  
  await Promise.all(fetchPromises);
  return perspectives;
}

/**
 * Fetch records from domain-specific entity collection
 * 
 * V2 Architecture:
 * - {domain}_entities: Domain-specific entity table (e.g., fungi_entities)
 * - {domain}_{perspective}: Perspective tables linked to domain entity
 * 
 * Each domain has its own collection with domain-specific fields!
 */
async function fetchFromCollection(
  collection: DomainCollection,
  options: { slug?: string; perPage?: number; loadPerspectives?: boolean } = {}
): Promise<ItemData[]> {
  const { slug, perPage = 100, loadPerspectives = true } = options;
  const domainName = getDomainFromCollection(collection);
  
  try {
    // Fetch directly from domain-specific collection (e.g., fungi_entities)
    const url = new URL(`${POCKETBASE_URL}/api/collections/${collection}/records`);
    url.searchParams.set('perPage', perPage.toString());
    
    // Filter by slug if provided
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
      const errorText = await response.text();
      console.error(`[BIFROEST] HTTP ${response.status} for ${collection}: ${errorText}`);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: PocketbaseResponse = await response.json();
    console.log(`[BIFROEST] Raw fetch: ${data.items?.length || 0} items from ${collection}`);
    
    // Convert to ItemData and optionally load perspectives
    const items = await Promise.all(data.items.map(async (entity) => {
      // Fetch perspectives from domain-specific perspective tables if enabled
      let perspectiveData: Record<string, unknown> = {};
      
      if (loadPerspectives) {
        perspectiveData = await fetchPerspectivesForEntity(domainName, entity.id);
        if (Object.keys(perspectiveData).length > 0) {
          console.log(`[BIFROEST] Loaded ${Object.keys(perspectiveData).length} perspectives for ${entity.name || entity.scientific_name}`);
        }
      }
      
      // Also check for embedded data field (fallback/legacy)
      const embeddedData = entity.data || {};
      
      // Merge: normalized tables take precedence over embedded data
      const mergedPerspectives = { ...embeddedData, ...perspectiveData };
      
      // Create item with merged perspective data
      return toItemData({ ...entity, data: mergedPerspectives }, collection);
    }));
    
    return items;
    
  } catch (error) {
    console.error(`[BIFROEST] Failed to fetch from ${collection}:`, error);
    throw error;
  }
}

/**
 * Fetch perspective data for an entity from domain-specific perspective tables
 * Tables follow naming: {domain}_{perspective} (e.g., fungi_fungal_holobiont)
 */
async function fetchPerspectivesForEntity(domain: string, entityId: string): Promise<Record<string, unknown>> {
  const perspectives: Record<string, unknown> = {};
  
  // Try to fetch from domain-specific perspective tables
  // Note: Perspective tables are named {domain}_{perspective_name}
  const perspectiveTablePrefix = `${domain}_`;
  
  // We don't know all perspective names ahead of time, so we'll rely on 
  // the embedded data field for now. In the future, we could query the 
  // schema-mapping-v3.json to get the list of perspectives for each domain.
  
  return perspectives;
}

// Domain to collections mapping
const DOMAIN_COLLECTIONS: Record<Domain, DomainCollection[]> = {
  biology: ['fungi_entities', 'phyto_entities', 'drako_entities'],
  geology: ['paleo_entities', 'tekto_entities', 'mine_entities'],
  biomedical: ['bakterio_entities', 'viro_entities', 'geno_entities', 'anato_entities'],
  physchem: ['chemo_entities', 'physi_entities', 'kosmo_entities'],
  technology: ['netzo_entities', 'cognito_entities', 'biotech_entities', 'socio_entities']
};

/**
 * Lädt alle Records aus einer Collection (mit Caching)
 */
export async function loadByCollection(collection: DomainCollection): Promise<ItemData[]> {
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
    console.error(`[BIFROEST] ❌ Failed to load ${collection}`, error);
    isConnected = false;
    return [];
  }
}

/**
 * Lädt alle Records für eine Domain (biology/geology/biomedical/physchem/technology)
 */
export async function loadByDomain(domain: Domain): Promise<ItemData[]> {
  console.log(`[BIFROEST] Loading domain: ${domain}`);
  
  const collections = DOMAIN_COLLECTIONS[domain] || [];
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
 * Lädt alle Entities für eine Kategorie
 * Backward compatible with old loadSpeciesByCategory
 */
export async function loadSpeciesByCategory(category: string): Promise<ItemData[]> {
  console.log(`[BIFROEST] Loading by category: ${category}`);
  
  // Map legacy category to collection
  const collection = CATEGORY_TO_COLLECTION[category];
  
  if (collection) {
    return loadByCollection(collection);
  }
  
  // If no mapping found, try as collection name (with _entities suffix)
  const collectionWithSuffix = category.includes('_entities') ? category : `${category}_entities`;
  if (ALL_COLLECTIONS.includes(collectionWithSuffix as DomainCollection)) {
    return loadByCollection(collectionWithSuffix as DomainCollection);
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
  collection: DomainCollection, 
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
 * - fungi → fungi_entities → FUNGINOMI
 * - phyto → phyto_entities → PHYTONOMI  
 * - drako → drako_entities → DRAKONOMI
 * - paleo → paleo_entities → PALEONOMI
 * - etc.
 */
export async function loadSiteItems(): Promise<ItemData[]> {
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const collection = siteMeta.collection as DomainCollection;
  
  console.log(`[BIFROEST] Loading items for site: ${siteMeta.name} (collection: ${collection})`);
  
  return loadByCollection(collection);
}

/**
 * Get the collection name for the current site
 */
export function getSiteCollection(): DomainCollection {
  const siteType = getSiteType();
  return SITE_META[siteType].collection as DomainCollection;
}
