/**
 * BIFROEST DATA-DRIVEN CORE FUNCTIONALITY TESTS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Diese Tests validieren die KERNFUNKTIONALITÄT des Systems:
 * 
 * 1. DATENGETRIEBENHEIT: ALLES muss aus PostgreSQL kommen
 * 2. KEINE JSON FALLBACKS: Keine lokalen Dateien außer Bildern
 * 3. API ENDPOINTS: Müssen Datenbankdaten zurückgeben
 * 4. FRONTEND INTEGRATION: Seiten müssen DB-Daten rendern
 * 
 * Expected Database State:
 * - 17 Domains
 * - ~118+ Entities (62 Production + 56 Mock)
 * - 6 Perspectives
 * - 10+ Experts
 * 
 * @version 1.0.0
 * @date 2025-01-27
 */

import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../src/server/db';
import { loadAllItemsFromDB, getItemBySlugFromDB } from '../src/server/data-db';
import { loadAllItems, getItem } from '../src/server/data';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DATABASE CONNECTION & STATE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Database Connection & State', () => {
  it('should connect to PostgreSQL successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
  });

  it('should have exactly 17 domains', async () => {
    const count = await prisma.domain.count();
    expect(count).toBe(17);
  });

  it('should have all expected domain slugs', async () => {
    const expectedDomains = [
      'fungi', 'phyto', 'drako', 'bakterio', 'viro', 'geno', 'anato',
      'chemo', 'physi', 'kosmo', 'paleo', 'tekto', 'mine', 'netzo',
      'cognito', 'biotech', 'socio'
    ];
    
    const domains = await prisma.domain.findMany({ select: { slug: true } });
    const slugs = domains.map(d => d.slug).sort();
    
    expect(slugs).toEqual(expectedDomains.sort());
  });

  it('should have at least 100 entities (production + mock)', async () => {
    const count = await prisma.entity.count();
    expect(count).toBeGreaterThanOrEqual(100);
  });

  it('should have 6 perspectives', async () => {
    const count = await prisma.perspective.count();
    expect(count).toBe(6);
  });

  it('should have at least 10 experts', async () => {
    const count = await prisma.expert.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DATA-DRIVEN ENTITY LOADING (CORE FUNCTIONALITY)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Data-Driven Entity Loading', () => {
  describe('Direct Database Queries (data-db.ts)', () => {
    it('should load items directly from PostgreSQL', async () => {
      const items = await loadAllItemsFromDB(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return items with _fromDatabase=true marker', async () => {
      const items = await loadAllItemsFromDB(true);
      const firstItem = items[0];
      
      expect(firstItem._fromDatabase).toBe(true);
    });

    it('should return items with database IDs', async () => {
      const items = await loadAllItemsFromDB(true);
      const firstItem = items[0];
      
      expect(firstItem._dbId).toBeDefined();
      expect(typeof firstItem._dbId).toBe('string');
    });

    it('should get individual item by slug from DB', async () => {
      // Get a known entity from DB first
      const entity = await prisma.entity.findFirst();
      expect(entity).toBeDefined();
      
      if (entity) {
        const item = await getItemBySlugFromDB(entity.slug);
        expect(item).toBeDefined();
        expect(item?.slug).toBe(entity.slug);
        expect(item?._fromDatabase).toBe(true);
      }
    });
  });

  describe('Data Layer (data.ts) - PostgreSQL Only', () => {
    it('should load all items through data layer', async () => {
      const items = await loadAllItems(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should NOT use any JSON fallback', async () => {
      // Force reload to ensure fresh data
      const items = await loadAllItems(true);
      
      // ALL items must come from database
      for (const item of items) {
        expect(item._fromDatabase).toBe(true);
      }
    });

    it('should get single item by slug', async () => {
      const entity = await prisma.entity.findFirst();
      if (entity) {
        const item = await getItem(entity.slug);
        expect(item).toBeDefined();
        expect(item?._fromDatabase).toBe(true);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ENTITY DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Entity Data Integrity', () => {
  it('should have entities with valid required fields', async () => {
    const entities = await prisma.entity.findMany({
      include: { primaryDomain: true }
    });
    
    for (const entity of entities) {
      expect(entity.slug).toBeDefined();
      expect(entity.name).toBeDefined();
      expect(entity.primaryDomainId).toBeDefined();
      expect(entity.primaryDomain).toBeDefined();
    }
  });

  it('should have production entities from data-local', async () => {
    // Known production entities from universe-index.json
    const productionSlugs = [
      'agaricus-subrufescens',
      'hericium-erinaceus',
      'ganoderma-lucidum',
      'trametes-versicolor',
      'aloe-vera',
      'camellia-sinensis'
    ];
    
    let found = 0;
    for (const slug of productionSlugs) {
      const entity = await prisma.entity.findUnique({ where: { slug } });
      if (entity) found++;
    }
    
    expect(found).toBeGreaterThanOrEqual(4); // At least 4 of 6 should exist
  });

  it('should have mock entities for non-production domains', async () => {
    // Mock entities for domains without production data
    const mockDomains = ['drako', 'bakterio', 'viro', 'physi', 'kosmo'];
    
    for (const domainSlug of mockDomains) {
      const domain = await prisma.domain.findUnique({ where: { slug: domainSlug } });
      if (domain) {
        const entities = await prisma.entity.findMany({
          where: { primaryDomainId: domain.id }
        });
        expect(entities.length).toBeGreaterThan(0);
      }
    }
  });

  it('should link entities to correct domains', async () => {
    const fungiDomain = await prisma.domain.findUnique({ where: { slug: 'fungi' } });
    expect(fungiDomain).toBeDefined();
    
    if (fungiDomain) {
      const fungiEntities = await prisma.entity.findMany({
        where: { primaryDomainId: fungiDomain.id }
      });
      expect(fungiEntities.length).toBeGreaterThan(20); // Production fungi
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DOMAIN DATA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Domain Data Validation', () => {
  it('should have domains with icons', async () => {
    const domains = await prisma.domain.findMany();
    
    for (const domain of domains) {
      expect(domain.icon).toBeDefined();
      expect(domain.icon.length).toBeGreaterThan(0);
    }
  });

  it('should have domains with colors', async () => {
    const domains = await prisma.domain.findMany();
    
    for (const domain of domains) {
      expect(domain.color).toBeDefined();
      expect(domain.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('should have sortOrder for all domains', async () => {
    const domains = await prisma.domain.findMany({ orderBy: { sortOrder: 'asc' } });
    
    for (let i = 0; i < domains.length; i++) {
      expect(typeof domains[i].sortOrder).toBe('number');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERSPECTIVE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Perspective Validation', () => {
  const expectedPerspectives = [
    'taxonomy', 'biochemistry', 'ecology', 'medicine', 'culture', 'research'
  ];

  it('should have all required perspectives', async () => {
    for (const slug of expectedPerspectives) {
      const perspective = await prisma.perspective.findUnique({ where: { slug } });
      expect(perspective).toBeDefined();
    }
  });

  it('should have perspectives with names and descriptions', async () => {
    const perspectives = await prisma.perspective.findMany();
    
    for (const persp of perspectives) {
      expect(persp.name).toBeDefined();
      expect(persp.description).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EXPERT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Expert Validation', () => {
  it('should have experts with required fields', async () => {
    const experts = await prisma.expert.findMany();
    expect(experts.length).toBeGreaterThanOrEqual(10);
    
    for (const expert of experts) {
      expect(expert.slug).toBeDefined();
      expect(expert.name).toBeDefined();
      expect(expert.domainId).toBeDefined();
    }
  });

  it('should link experts to valid domains', async () => {
    const experts = await prisma.expert.findMany();
    
    for (const expert of experts) {
      const domain = await prisma.domain.findUnique({
        where: { id: expert.domainId }
      });
      expect(domain).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. NO JSON FALLBACK VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('No JSON Fallback Validation', () => {
  it('should load ALL items from database without fallback', async () => {
    const items = await loadAllItems(true);
    
    // Count items that come from database
    const dbItems = items.filter(item => item._fromDatabase === true);
    
    // 100% of items must come from database
    expect(dbItems.length).toBe(items.length);
    expect(items.every(item => item._fromDatabase === true)).toBe(true);
  });

  it('should not have any items without _fromDatabase marker', async () => {
    const items = await loadAllItems(true);
    
    const itemsWithoutMarker = items.filter(item => item._fromDatabase !== true);
    expect(itemsWithoutMarker.length).toBe(0);
  });

  it('should not have any items with _fromLocal marker', async () => {
    const items = await loadAllItems(true);
    
    // Check no item has _fromLocal
    const localItems = items.filter((item: any) => item._fromLocal === true);
    expect(localItems.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. DATA TRANSFORMATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Data Transformation Validation', () => {
  it('should transform database entities to ItemData format', async () => {
    const items = await loadAllItemsFromDB(true);
    
    if (items.length > 0) {
      const item = items[0];
      
      // Required fields
      expect(item.id).toBeDefined();
      expect(item.slug).toBeDefined();
      expect(item.name).toBeDefined();
      
      // Domain fields
      expect(item.kingdom).toBeDefined();
      expect(item._domainSlug).toBeDefined();
      
      // Database markers
      expect(item._dbId).toBeDefined();
      expect(item._fromDatabase).toBe(true);
    }
  });

  it('should include domain metadata in items', async () => {
    const items = await loadAllItemsFromDB(true);
    
    for (const item of items.slice(0, 10)) {
      expect(item._domainSlug).toBeDefined();
      expect(item._domainColor).toBeDefined();
      expect(item.kingdom_icon).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. CROSS-DOMAIN COVERAGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Cross-Domain Coverage', () => {
  it('should have entities in at least 10 different domains', async () => {
    const entityCounts = await prisma.entity.groupBy({
      by: ['primaryDomainId'],
      _count: true
    });
    
    expect(entityCounts.length).toBeGreaterThanOrEqual(10);
  });

  it('should have significant entity count in production domains', async () => {
    const productionDomains = ['fungi', 'phyto'];
    
    for (const slug of productionDomains) {
      const domain = await prisma.domain.findUnique({ where: { slug } });
      if (domain) {
        const count = await prisma.entity.count({
          where: { primaryDomainId: domain.id }
        });
        expect(count).toBeGreaterThanOrEqual(15);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. DATABASE QUERY PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Database Query Performance', () => {
  it('should load all items in under 2 seconds', async () => {
    const start = Date.now();
    await loadAllItemsFromDB(true);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });

  it('should load single item in under 500ms', async () => {
    const entity = await prisma.entity.findFirst();
    if (entity) {
      const start = Date.now();
      await getItemBySlugFromDB(entity.slug);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    }
  });
});
