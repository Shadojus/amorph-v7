/**
 * AMORPH v8.5 - Database Data Layer Integration Tests
 * ====================================================
 * Echte Tests für data-db.ts - die zentrale DB-Schnittstelle.
 * 
 * KEINE MOCKS! Testet echte PostgreSQL-Daten.
 * 
 * @since v8.5.0 - PostgreSQL-Only
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/server/db';

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════

let testDomainId: string;
let testEntityId: string;

beforeAll(async () => {
  // Ensure DB connection works
  const domains = await prisma.domain.findMany({ take: 1 });
  if (domains.length === 0) {
    throw new Error('Database has no domains - cannot run tests');
  }
  testDomainId = domains[0].id;
  
  const entities = await prisma.entity.findMany({ take: 1 });
  if (entities.length > 0) {
    testEntityId = entities[0].id;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Database Connection', () => {
  it('can connect to PostgreSQL', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('connects to bifroest database', async () => {
    const result = await prisma.$queryRaw`SELECT current_database() as name`;
    expect(result[0].name).toBe('bifroest');
  });

  it('authenticates as bifroest user', async () => {
    const result = await prisma.$queryRaw`SELECT current_user as name`;
    expect(result[0].name).toBe('bifroest');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN TESTS - Expected: 17 Domains
// ═══════════════════════════════════════════════════════════════════════════════

describe('Domains (17 expected)', () => {
  it('has exactly 17 domains', async () => {
    const count = await prisma.domain.count();
    expect(count).toBe(17);
  });

  it('has all required domain slugs', async () => {
    const domains = await prisma.domain.findMany();
    const slugs = domains.map(d => d.slug);
    
    const required = [
      'fungi', 'phyto', 'drako', 'bakterio', 'viro',
      'geno', 'anato', 'chemo', 'physi', 'kosmo',
      'paleo', 'tekto', 'mine', 'netzo', 'cognito',
      'biotech', 'socio'
    ];
    
    for (const req of required) {
      expect(slugs).toContain(req);
    }
  });

  it('all domains have name and slug', async () => {
    const domains = await prisma.domain.findMany();
    
    for (const domain of domains) {
      expect(domain.name).toBeTruthy();
      expect(domain.slug).toBeTruthy();
    }
  });

  it('all domains have valid categories', async () => {
    const domains = await prisma.domain.findMany();
    const validCategories = ['biology', 'biomedical', 'physchem', 'geology', 'technology', null];
    
    for (const domain of domains) {
      if (domain.category) {
        expect(validCategories).toContain(domain.category);
      }
    }
  });

  it('most domains have colors defined', async () => {
    const domains = await prisma.domain.findMany();
    const withColors = domains.filter(d => d.color);
    
    expect(withColors.length).toBeGreaterThanOrEqual(10);
  });

  it('domain slugs are unique', async () => {
    const domains = await prisma.domain.findMany();
    const slugs = domains.map(d => d.slug);
    const uniqueSlugs = [...new Set(slugs)];
    
    expect(slugs.length).toBe(uniqueSlugs.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY TESTS - Validates entity data quality
// ═══════════════════════════════════════════════════════════════════════════════

describe('Entities', () => {
  it('has at least 1 entity (DB not empty)', async () => {
    const count = await prisma.entity.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('all entities have name and slug', async () => {
    const entities = await prisma.entity.findMany({ take: 50 });
    
    for (const entity of entities) {
      expect(entity.name).toBeTruthy();
      expect(entity.slug).toBeTruthy();
    }
  });

  it('entity slugs are unique', async () => {
    const entities = await prisma.entity.findMany({ select: { slug: true } });
    const slugs = entities.map(e => e.slug);
    const uniqueSlugs = [...new Set(slugs)];
    
    expect(slugs.length).toBe(uniqueSlugs.length);
  });

  it('all entities have valid primaryDomainId (using raw query)', async () => {
    // Use raw SQL since Prisma doesn't allow null on required fields
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM entities WHERE "domainId" IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('can fetch entity with domain relation', async () => {
    const entity = await prisma.entity.findFirst({
      include: { primaryDomain: true }
    });
    
    if (entity) {
      expect(entity.primaryDomain).toBeTruthy();
      expect(entity.primaryDomain.slug).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT TESTS - Expected: 10 Experts (CRITICAL: with fieldExpertise!)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Experts (10 expected)', () => {
  it('has at least 10 experts', async () => {
    const count = await prisma.expert.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  it('has at least 8 active experts', async () => {
    const count = await prisma.expert.count({ where: { isActive: true } });
    expect(count).toBeGreaterThanOrEqual(8);
  });

  it('all experts have name and slug', async () => {
    const experts = await prisma.expert.findMany();
    
    for (const expert of experts) {
      expect(expert.name).toBeTruthy();
      expect(expert.slug).toBeTruthy();
    }
  });

  // 🔴 CRITICAL TEST - This was broken before!
  it('at least 8 experts have fieldExpertise populated', async () => {
    const experts = await prisma.expert.findMany();
    const withExpertise = experts.filter(
      e => Array.isArray(e.fieldExpertise) && e.fieldExpertise.length > 0
    );
    
    expect(withExpertise.length).toBeGreaterThanOrEqual(8);
  });

  // 🔴 CRITICAL TEST - Check fieldExpertise is not empty strings
  it('experts have valid (non-empty) fieldExpertise entries', async () => {
    const experts = await prisma.expert.findMany();
    
    for (const expert of experts) {
      if (expert.fieldExpertise && expert.fieldExpertise.length > 0) {
        for (const field of expert.fieldExpertise) {
          expect(typeof field).toBe('string');
          expect(field.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  // 🔴 CRITICAL TEST - Unique expertise fields exist
  it('has at least 5 unique expertise fields across all experts', async () => {
    const experts = await prisma.expert.findMany();
    const allExpertise = new Set<string>();
    
    for (const expert of experts) {
      if (expert.fieldExpertise) {
        for (const field of expert.fieldExpertise) {
          allExpertise.add(field);
        }
      }
    }
    
    expect(allExpertise.size).toBeGreaterThanOrEqual(5);
  });

  it('all experts have valid domainId (using raw query)', async () => {
    // Use raw SQL since Prisma doesn't allow null on required fields
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM experts WHERE "domainId" IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('can fetch expert with domain relation', async () => {
    const expert = await prisma.expert.findFirst({
      include: { domain: true }
    });
    
    expect(expert).toBeTruthy();
    expect(expert?.domain).toBeTruthy();
    expect(expert?.domain.slug).toBeTruthy();
  });

  it('expert slugs are unique', async () => {
    const experts = await prisma.expert.findMany({ select: { slug: true } });
    const slugs = experts.map(e => e.slug);
    const uniqueSlugs = [...new Set(slugs)];
    
    expect(slugs.length).toBe(uniqueSlugs.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY FACETS TESTS - Tests cross-domain functionality
// ═══════════════════════════════════════════════════════════════════════════════

describe('EntityFacets', () => {
  it('facets (if any) have valid relevance (0-1)', async () => {
    const count = await prisma.entityFacet.count();
    if (count === 0) return; // Skip if no facets
    
    const invalidFacets = await prisma.entityFacet.findMany({
      where: {
        OR: [
          { relevance: { lt: 0 } },
          { relevance: { gt: 1 } }
        ]
      }
    });
    
    expect(invalidFacets.length).toBe(0);
  });

  it('entity-domain combinations are unique', async () => {
    const facets = await prisma.entityFacet.findMany({
      select: { entityId: true, domainId: true }
    });
    
    if (facets.length === 0) return; // Skip if no facets
    
    const combinations = facets.map(f => `${f.entityId}-${f.domainId}`);
    const uniqueCombinations = [...new Set(combinations)];
    
    expect(combinations.length).toBe(uniqueCombinations.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL LINKS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('ExternalLinks', () => {
  it('all links have valid URL format', async () => {
    const links = await prisma.externalLink.findMany({ take: 100 });
    
    for (const link of links) {
      expect(link.url).toBeTruthy();
      expect(link.url.startsWith('http')).toBe(true);
    }
  });

  it('all links reference existing entities', async () => {
    const linksWithEntity = await prisma.externalLink.findMany({
      include: { entity: true },
      take: 50
    });
    
    for (const link of linksWithEntity) {
      expect(link.entity).toBeTruthy();
      expect(link.entity.id).toBe(link.entityId);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA CONSISTENCY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Data Consistency', () => {
  it('no orphaned entity facets', async () => {
    const orphaned = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM entity_facets ef 
      LEFT JOIN entities e ON ef."entityId" = e.id 
      WHERE e.id IS NULL
    `;
    
    expect(Number(orphaned[0]?.count || 0)).toBe(0);
  });

  it('no duplicate entity slugs', async () => {
    const duplicates = await prisma.$queryRaw<{slug: string; count: bigint}[]>`
      SELECT slug, COUNT(*) as count 
      FROM entities 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `;
    
    expect(duplicates.length).toBe(0);
  });

  it('no duplicate expert slugs', async () => {
    const duplicates = await prisma.$queryRaw<{slug: string; count: bigint}[]>`
      SELECT slug, COUNT(*) as count 
      FROM experts 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `;
    
    expect(duplicates.length).toBe(0);
  });

  it('no duplicate domain slugs', async () => {
    const duplicates = await prisma.$queryRaw<{slug: string; count: bigint}[]>`
      SELECT slug, COUNT(*) as count 
      FROM domains 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `;
    
    expect(duplicates.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CRUD Operations', () => {
  const testSlug = `vitest-entity-${Date.now()}`;
  let createdEntityId: string | null = null;

  afterAll(async () => {
    // Cleanup
    if (createdEntityId) {
      try {
        await prisma.entity.delete({ where: { id: createdEntityId } });
      } catch {}
    }
  });

  it('can CREATE entity', async () => {
    const domain = await prisma.domain.findFirst();
    expect(domain).toBeTruthy();
    
    const entity = await prisma.entity.create({
      data: {
        slug: testSlug,
        name: 'Vitest Test Entity',
        description: 'Created by Vitest integration test',
        primaryDomainId: domain!.id,
        isActive: false
      }
    });
    
    createdEntityId = entity.id;
    expect(entity.id).toBeTruthy();
    expect(entity.name).toBe('Vitest Test Entity');
  });

  it('can READ entity by slug', async () => {
    const entity = await prisma.entity.findUnique({
      where: { slug: testSlug }
    });
    
    expect(entity).toBeTruthy();
    expect(entity?.name).toBe('Vitest Test Entity');
  });

  it('can UPDATE entity', async () => {
    const updated = await prisma.entity.update({
      where: { slug: testSlug },
      data: { description: 'Updated by Vitest' }
    });
    
    expect(updated.description).toBe('Updated by Vitest');
  });

  it('can DELETE entity', async () => {
    await prisma.entity.delete({
      where: { slug: testSlug }
    });
    
    const deleted = await prisma.entity.findUnique({
      where: { slug: testSlug }
    });
    
    expect(deleted).toBeNull();
    createdEntityId = null; // Already deleted
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Query Performance', () => {
  it('can load all entities in < 2 seconds', async () => {
    const start = Date.now();
    await prisma.entity.findMany({ include: { primaryDomain: true } });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });

  it('can load all experts in < 1 second', async () => {
    const start = Date.now();
    await prisma.expert.findMany({ include: { domain: true } });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });

  it('can search entities by name in < 500ms', async () => {
    const start = Date.now();
    await prisma.entity.findMany({
      where: {
        name: { contains: 'a', mode: 'insensitive' }
      },
      take: 20
    });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
});
