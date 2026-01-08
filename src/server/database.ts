/**
 * AMORPH - BIFROEST Data Client v4
 * 
 * PostgreSQL-basierter Data Client für AMORPH.
 * Ersetzt PocketBase vollständig.
 * 
 * Collections:
 * - Biology: fungi, plantae, therion
 * - Geology: paleontology, mineralogy, tectonics
 * - Alle 17 wissenschaftlichen Domänen
 * 
 * Features:
 * - Multi-domain support (biology/geology)
 * - Site-specific loading (FUNGINOMI, PALEONOMI, etc.)
 * - Domain-specific perspectives
 * - In-memory caching with configurable TTL
 * - Health check for connection monitoring
 * - PostgreSQL via Prisma ORM
 */

import type { ItemData } from '../core/types';
import { cachedFetch, invalidateSpeciesCache } from './cache';
import { getSiteType, getSiteDomain, SITE_META, SITE_DOMAIN, type SiteType, type Domain } from './config';

// Database Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bifroest:bifroest2024@localhost:5432/bifroest';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '5000', 10);
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);

// Connection state
let lastHealthCheck = 0;
let isConnected = true;

// Dynamic import for database (to avoid build issues if DB not ready)
let db: unknown = null;

async function getDatabase(): Promise<unknown> {
  if (!db) {
    try {
      // Database module will be used when PostgreSQL is available
      // For now, we use local JSON data via data.ts
      console.log('[Database] Using local data source');
      db = null;
    } catch (e) {
      console.warn('[Data] Database module not available, using fallback');
      db = null;
    }
  }
  return db;
}

// ============================================================================
// COLLECTION CONFIGURATION - V3 (PostgreSQL-based)
// ============================================================================

// 17 Domain Types (matching amorph-* blueprint folders)
type DomainSlug = 
  // Biology
  | 'fungi' | 'phyto' | 'drako'
  // Geology  
  | 'paleo' | 'tekto' | 'mine'
  // Biomedical
  | 'bakterio' | 'viro' | 'geno' | 'anato'
  // Physics & Chemistry
  | 'chemo' | 'physi' | 'kosmo'
  // Technology
  | 'netzo' | 'cognito' | 'biotech' | 'socio';

// Legacy collection type mapping
type DomainCollection = `${DomainSlug}_entities`;

// All 17 domain slugs
const ALL_DOMAINS: DomainSlug[] = [
  // Biology
  'fungi', 'phyto', 'drako',
  // Geology
  'paleo', 'tekto', 'mine',
  // Biomedical
  'bakterio', 'viro', 'geno', 'anato',
  // Physics & Chemistry
  'chemo', 'physi', 'kosmo',
  // Technology
  'netzo', 'cognito', 'biotech', 'socio'
];

// Map collection to domain category
function getCollectionDomain(domainSlug: DomainSlug): Domain {
  const domainMap: Record<DomainSlug, Domain> = {
    fungi: 'biology', phyto: 'biology', drako: 'biology',
    paleo: 'geology', tekto: 'geology', mine: 'geology',
    bakterio: 'biomedical', viro: 'biomedical', geno: 'biomedical', anato: 'biomedical',
    chemo: 'physchem', physi: 'physchem', kosmo: 'physchem',
    netzo: 'technology', cognito: 'technology', biotech: 'technology', socio: 'technology'
  };
  return domainMap[domainSlug] || 'biology';
}

// Map legacy category names to new domain slugs
const CATEGORY_TO_DOMAIN: Record<string, DomainSlug> = {
  // Biology (legacy)
  'Fungi': 'fungi', 'fungi': 'fungi',
  'Plantae': 'phyto', 'plantae': 'phyto', 'phyto': 'phyto',
  'Therion': 'drako', 'therion': 'drako', 'drako': 'drako',
  // Geology
  'paleontology': 'paleo', 'paleo': 'paleo',
  'tectonics': 'tekto', 'tekto': 'tekto',
  'mineralogy': 'mine', 'mine': 'mine',
  // Biomedical
  'microbiology': 'bakterio', 'bakterio': 'bakterio',
  'virology': 'viro', 'viro': 'viro',
  'genetics': 'geno', 'geno': 'geno',
  'anatomy': 'anato', 'anato': 'anato',
  // Physics & Chemistry
  'chemistry': 'chemo', 'chemo': 'chemo',
  'physics': 'physi', 'physi': 'physi',
  'astronomy': 'kosmo', 'kosmo': 'kosmo',
  // Technology
  'informatics': 'netzo', 'netzo': 'netzo',
  'ai': 'cognito', 'cognito': 'cognito',
  'biotech': 'biotech',
  'sociology': 'socio', 'socio': 'socio'
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

function getPerspectivesForDomain(domain: DomainSlug): readonly string[] {
  switch (domain) {
    case 'fungi':
    case 'phyto':
    case 'drako':
      return BIOLOGY_PERSPECTIVES;
    case 'paleo':
      return PALEONTOLOGY_PERSPECTIVES;
    case 'mine':
      return MINERALOGY_PERSPECTIVES;
    case 'tekto':
      return TECTONICS_PERSPECTIVES;
    default:
      return BIOLOGY_PERSPECTIVES;
  }
}

// ============================================================================
// DATABASE ENTITY TO ITEMDATA CONVERSION
// ============================================================================

interface DatabaseEntity {
  id: string;
  domainId: string;
  slug: string;
  scientificName: string;
  commonName?: string;
  commonNameDe?: string;
  description?: string;
  descriptionDe?: string;
  images?: any[];
  primaryImage?: string;
  tags?: string[];
  properties?: Record<string, unknown>;
  taxonomy?: Record<string, string>;
  domain?: {
    slug: string;
    name: string;
  };
  perspectives?: Array<{
    content: Record<string, unknown>;
    perspective: { slug: string };
  }>;
}

/**
 * Konvertiert Database Entity zu AMORPH ItemData Format
 */
function toItemData(entity: DatabaseEntity, domainSlug: DomainSlug): ItemData {
  const domainCategory = getCollectionDomain(domainSlug);
  
  // Derive kingdom/category from domain name
  const kingdom = domainSlug.charAt(0).toUpperCase() + domainSlug.slice(1);
  
  // Handle image
  let image = '';
  if (entity.primaryImage) {
    image = entity.primaryImage;
  } else if (Array.isArray(entity.images) && entity.images.length > 0) {
    image = typeof entity.images[0] === 'string' ? entity.images[0] : entity.images[0]?.url || '';
  }

  // Build tags array
  const tags = Array.isArray(entity.tags) ? entity.tags : [];
  
  // Extract perspective data
  const perspectiveData: Record<string, unknown> = {};
  if (entity.perspectives) {
    for (const ep of entity.perspectives) {
      perspectiveData[ep.perspective.slug] = ep.content;
    }
  }
  
  // Also check properties for perspective data (legacy format)
  if (entity.properties) {
    Object.assign(perspectiveData, entity.properties);
  }

  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.commonName || entity.scientificName,
    scientificName: entity.scientificName,
    description: entity.description || '',
    image,
    tags,
    category: kingdom,
    kingdom,
    // Include all perspective data at root level
    ...perspectiveData,
  };
}

// ============================================================================
// DATA LOADING FUNCTIONS
// ============================================================================

/**
 * Lädt alle Items für eine Domain aus PostgreSQL
 * @deprecated Verwende loadItems() aus data.ts für lokale Daten
 */
export async function loadItemsFromDatabase(_options: {
  domain?: DomainSlug;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
} = {}): Promise<ItemData[]> {
  // PostgreSQL noch nicht vollständig integriert - verwende data.ts
  console.warn('[Database] loadItemsFromDatabase deprecated - use loadItems() from data.ts');
  return [];
}

/**
 * Lädt ein einzelnes Item
 * @deprecated Verwende loadItem() aus data.ts für lokale Daten
 */
export async function loadItemFromDatabase(
  _slugOrId: string, 
  _domainSlug?: DomainSlug
): Promise<ItemData | null> {
  // PostgreSQL noch nicht vollständig integriert - verwende data.ts
  console.warn('[Database] loadItemFromDatabase deprecated - use loadItem() from data.ts');
  return null;
}

/**
 * Sucht nach Items
 * @deprecated Verwende searchItems() aus data.ts für lokale Daten
 */
export async function searchItemsFromDatabase(
  _query: string,
  _options: { domain?: DomainSlug; limit?: number } = {}
): Promise<ItemData[]> {
  // PostgreSQL noch nicht vollständig integriert - verwende data.ts
  console.warn('[Database] searchItemsFromDatabase deprecated - use searchItems() from data.ts');
  return [];
}

// ============================================================================
// SITE-SPECIFIC LOADING (Legacy API)
// ============================================================================

/**
 * Lädt alle Species für den aktuellen Site Type
 * @deprecated Use loadItemsFromDatabase instead
 */
export async function fetchSpeciesFromPocketbase(options: {
  siteType?: SiteType;
  page?: number;
  perPage?: number;
  search?: string;
} = {}): Promise<ItemData[]> {
  const siteType = options.siteType || getSiteType();
  const siteMeta = SITE_META[siteType];
  
  // Convert legacy collection to domain slug
  const domainSlug = siteMeta.collection.replace('_entities', '') as DomainSlug;
  
  return loadItemsFromDatabase({
    domain: domainSlug,
    page: options.page,
    perPage: options.perPage,
    search: options.search,
  });
}

/**
 * Lädt eine einzelne Species
 * @deprecated Use loadItemFromDatabase instead  
 */
export async function loadSpeciesBySlug(
  slug: string, 
  siteType?: SiteType
): Promise<ItemData | null> {
  const site = siteType || getSiteType();
  const siteMeta = SITE_META[site];
  const domainSlug = siteMeta.collection.replace('_entities', '') as DomainSlug;
  
  return loadItemFromDatabase(slug, domainSlug);
}

// ============================================================================
// HEALTH CHECK & CONNECTION
// ============================================================================

export interface HealthCheckResult {
  healthy: boolean;
  latency: number;
  database: 'postgresql';
  error?: string;
}

export async function checkHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  // PostgreSQL noch nicht vollständig integriert
  // Für jetzt: immer als "nicht verbunden" markieren, da wir lokale Daten verwenden
  isConnected = false;
  lastHealthCheck = Date.now();
  
  return {
    healthy: false,
    latency: Date.now() - start,
    database: 'postgresql',
    error: 'Using local data source - PostgreSQL not connected',
  };
}

export function getConnectionStatus(): { connected: boolean; lastCheck: number } {
  return { connected: isConnected, lastCheck: lastHealthCheck };
}

// ============================================================================
// EXPORTS (Legacy API compatibility)
// ============================================================================

// Re-export for backward compatibility
export { invalidateSpeciesCache };

export const bifroestConfig = {
  url: DATABASE_URL,
  timeout: API_TIMEOUT,
  cacheTTL: CACHE_TTL,
};

// Domain utilities
export function getDomainSlug(category: string): DomainSlug {
  return CATEGORY_TO_DOMAIN[category] || 'fungi';
}

export function getAllDomains(): DomainSlug[] {
  return [...ALL_DOMAINS];
}

export function getPerspectives(domain: DomainSlug): readonly string[] {
  return getPerspectivesForDomain(domain);
}
