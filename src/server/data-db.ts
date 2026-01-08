/**
 * BIFROEST Database Data Loader
 * Loads entity data directly from PostgreSQL via Prisma
 * 
 * Used when DATA_SOURCE=database
 */

import prisma from './db';
import type { ItemData } from '../core/types';
import { getSiteType, SITE_META } from './config';

// Domain slug mapping for database queries
const KINGDOM_TO_DOMAIN: Record<string, string> = {
  'fungi': 'fungi',
  'plantae': 'phyto',
  'animalia': 'drako',
  'bacteria': 'bakterio'
};

const DOMAIN_TO_KINGDOM: Record<string, string> = {
  'fungi': 'fungi',
  'phyto': 'plantae',
  'drako': 'animalia',
  'bakterio': 'bacteria'
};

// Cache
let dbCache: {
  items: ItemData[] | null;
  index: Record<string, ItemData> | null;
  lastLoad: number;
} = {
  items: null,
  index: null,
  lastLoad: 0
};

const CACHE_TTL = 60000; // 1 minute

/**
 * Load all entities from database for current site/domain
 */
export async function loadAllItemsFromDB(forceReload = false): Promise<ItemData[]> {
  // Check cache
  const now = Date.now();
  if (!forceReload && dbCache.items && (now - dbCache.lastLoad) < CACHE_TTL) {
    return dbCache.items;
  }

  console.log('[Data] Loading from DATABASE');

  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const currentKingdom = siteMeta.dataFolder; // 'fungi', 'plantae', etc.
  const domainSlug = KINGDOM_TO_DOMAIN[currentKingdom] || currentKingdom;

  try {
    // Get domain ID
    const domain = await prisma.domain.findFirst({
      where: { slug: domainSlug }
    });

    if (!domain) {
      console.error(`[Data] Domain not found: ${domainSlug}`);
      return [];
    }

    // Load all entities for this domain
    const entities = await prisma.entity.findMany({
      where: { 
        domainId: domain.id,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });

    console.log(`[Data] Loaded ${entities.length} entities from DB for domain ${domainSlug}`);

    // Transform to ItemData format
    const items: ItemData[] = entities.map(entity => {
      const item: ItemData = {
        id: entity.slug,
        slug: entity.slug,
        name: entity.name,
        scientific_name: entity.scientificName || undefined,
        description: entity.description || undefined,
        image: entity.image || undefined,
        tagline: entity.tagline || undefined,
        kingdom: DOMAIN_TO_KINGDOM[domainSlug] || domainSlug,
        kingdom_icon: domain.icon || '🔬',
        _kingdom: currentKingdom,
        categories: entity.categories || [],
        keywords: entity.keywords || [],
        
        // JSON fields
        quick_facts: entity.quickFacts as ItemData['quick_facts'],
        highlights: entity.highlights as ItemData['highlights'],
        badges: entity.badges as ItemData['badges'],
        
        // Internal fields
        _perspectives: {},
        _loadedPerspectives: entity.perspectives || [],
        _fieldPerspective: {},
        _sources: {},
        
        // Database metadata
        _dbId: entity.id,
        _fromDatabase: true
      };

      return item;
    });

    // Update cache
    dbCache.items = items;
    dbCache.index = {};
    for (const item of items) {
      dbCache.index[item.slug] = item;
    }
    dbCache.lastLoad = now;

    return items;

  } catch (error) {
    console.error('[Data] Database error:', error);
    return [];
  }
}

/**
 * Get single entity by slug from database
 */
export async function getItemBySlugFromDB(slug: string): Promise<ItemData | null> {
  // Check cache first
  if (dbCache.index && dbCache.index[slug]) {
    return dbCache.index[slug];
  }

  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const currentKingdom = siteMeta.dataFolder;
  const domainSlug = KINGDOM_TO_DOMAIN[currentKingdom] || currentKingdom;

  try {
    const domain = await prisma.domain.findFirst({
      where: { slug: domainSlug }
    });

    if (!domain) return null;

    const entity = await prisma.entity.findFirst({
      where: { 
        domainId: domain.id,
        slug,
        isActive: true 
      }
    });

    if (!entity) return null;

    const item: ItemData = {
      id: entity.slug,
      slug: entity.slug,
      name: entity.name,
      scientific_name: entity.scientificName || undefined,
      description: entity.description || undefined,
      image: entity.image || undefined,
      tagline: entity.tagline || undefined,
      kingdom: DOMAIN_TO_KINGDOM[domainSlug] || domainSlug,
      kingdom_icon: domain.icon || '🔬',
      _kingdom: currentKingdom,
      categories: entity.categories || [],
      keywords: entity.keywords || [],
      quick_facts: entity.quickFacts as ItemData['quick_facts'],
      highlights: entity.highlights as ItemData['highlights'],
      badges: entity.badges as ItemData['badges'],
      _perspectives: {},
      _loadedPerspectives: entity.perspectives || [],
      _fieldPerspective: {},
      _sources: {},
      _dbId: entity.id,
      _fromDatabase: true
    };

    return item;

  } catch (error) {
    console.error('[Data] Database error getting item:', error);
    return null;
  }
}

/**
 * Search entities in database
 */
export async function searchItemsInDB(query: string, limit = 20): Promise<ItemData[]> {
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  const currentKingdom = siteMeta.dataFolder;
  const domainSlug = KINGDOM_TO_DOMAIN[currentKingdom] || currentKingdom;

  try {
    const domain = await prisma.domain.findFirst({
      where: { slug: domainSlug }
    });

    if (!domain) return [];

    const entities = await prisma.entity.findMany({
      where: {
        domainId: domain.id,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { scientificName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query.toLowerCase() } }
        ]
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    return entities.map(entity => ({
      id: entity.slug,
      slug: entity.slug,
      name: entity.name,
      scientific_name: entity.scientificName || undefined,
      description: entity.description || undefined,
      image: entity.image || undefined,
      kingdom: DOMAIN_TO_KINGDOM[domainSlug] || domainSlug,
      _kingdom: currentKingdom,
      _fromDatabase: true
    } as ItemData));

  } catch (error) {
    console.error('[Data] Database search error:', error);
    return [];
  }
}

/**
 * Get database stats
 */
export async function getDBStats(): Promise<{
  domains: number;
  entities: number;
  perspectives: number;
  links: number;
}> {
  try {
    const [domains, entities, perspectives, links] = await Promise.all([
      prisma.domain.count(),
      prisma.entity.count(),
      prisma.perspective.count(),
      prisma.externalLink.count()
    ]);

    return { domains, entities, perspectives, links };
  } catch (error) {
    console.error('[Data] Database stats error:', error);
    return { domains: 0, entities: 0, perspectives: 0, links: 0 };
  }
}

/**
 * Invalidate database cache
 */
export function invalidateDBCache(): void {
  dbCache.items = null;
  dbCache.index = null;
  dbCache.lastLoad = 0;
}

export default {
  loadAllItemsFromDB,
  getItemBySlugFromDB,
  searchItemsInDB,
  getDBStats,
  invalidateDBCache
};
