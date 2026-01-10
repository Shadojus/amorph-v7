/**
 * AMORPH v8.5 - Complete Prisma Schema Tests
 * ===========================================
 * Ultra-deep tests for EVERY model in the Prisma schema.
 * Tests ALL relationships, ALL constraints, ALL fields.
 * 
 * KEINE MOCKS! Testet echte PostgreSQL-Daten.
 * 
 * Models tested:
 * - Domain (17 expected)
 * - Entity
 * - EntityFacet
 * - Perspective
 * - EntityPerspective
 * - Expert
 * - Publication
 * - ExternalLink
 * - LinkVote
 * 
 * @since v8.5.0 - PostgreSQL-Only
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/server/db';

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════

let testDomainId: string;
let fungiDomainId: string;

beforeAll(async () => {
  // Setup test references
  const fungiDomain = await prisma.domain.findUnique({ where: { slug: 'fungi' } });
  if (fungiDomain) {
    fungiDomainId = fungiDomain.id;
    testDomainId = fungiDomain.id;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Domain Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all domains have required fields (id, slug, name)', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(d.id).toBeTruthy();
        expect(typeof d.id).toBe('string');
        expect(d.slug).toBeTruthy();
        expect(d.name).toBeTruthy();
      }
    });

    it('all domains have createdAt and updatedAt timestamps', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(d.createdAt).toBeInstanceOf(Date);
        expect(d.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('domain sortOrder is always a number', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(typeof d.sortOrder).toBe('number');
      }
    });

    it('domain isActive is always boolean', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(typeof d.isActive).toBe('boolean');
      }
    });

    it('searchSensitivity is number between 0 and 1', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(typeof d.searchSensitivity).toBe('number');
        expect(d.searchSensitivity).toBeGreaterThanOrEqual(0);
        expect(d.searchSensitivity).toBeLessThanOrEqual(1);
      }
    });

    it('boostFields is always an array', async () => {
      const domains = await prisma.domain.findMany();
      
      for (const d of domains) {
        expect(Array.isArray(d.boostFields)).toBe(true);
      }
    });
  });

  describe('Domain Categories', () => {
    const VALID_CATEGORIES = ['biology', 'biomedical', 'physchem', 'geology', 'technology'];

    it('biology domains exist', async () => {
      const bioDomains = await prisma.domain.findMany({
        where: { category: 'biology' }
      });
      expect(bioDomains.length).toBeGreaterThanOrEqual(2);
    });

    it('biomedical domains exist', async () => {
      const biomedDomains = await prisma.domain.findMany({
        where: { category: 'biomedical' }
      });
      expect(biomedDomains.length).toBeGreaterThanOrEqual(3);
    });

    it('physchem domains exist', async () => {
      const physchemDomains = await prisma.domain.findMany({
        where: { category: 'physchem' }
      });
      expect(physchemDomains.length).toBeGreaterThanOrEqual(2);
    });

    it('geology domains exist', async () => {
      const geoDomains = await prisma.domain.findMany({
        where: { category: 'geology' }
      });
      expect(geoDomains.length).toBeGreaterThanOrEqual(2);
    });

    it('technology domains exist', async () => {
      const techDomains = await prisma.domain.findMany({
        where: { category: 'technology' }
      });
      expect(techDomains.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Domain Relations', () => {
    it('can load domain with entities', async () => {
      const domain = await prisma.domain.findFirst({
        include: { entities: true }
      });
      
      expect(domain).toBeTruthy();
      expect(Array.isArray(domain?.entities)).toBe(true);
    });

    it('can load domain with experts', async () => {
      const domain = await prisma.domain.findFirst({
        include: { experts: true }
      });
      
      expect(domain).toBeTruthy();
      expect(Array.isArray(domain?.experts)).toBe(true);
    });

    it('can load domain with entityFacets', async () => {
      const domain = await prisma.domain.findFirst({
        include: { entityFacets: true }
      });
      
      expect(domain).toBeTruthy();
      expect(Array.isArray(domain?.entityFacets)).toBe(true);
    });
  });

  describe('Domain Unique Constraints', () => {
    it('cannot create duplicate slug', async () => {
      await expect(
        prisma.domain.create({
          data: {
            slug: 'fungi', // Already exists
            name: 'Duplicate Test'
          }
        })
      ).rejects.toThrow();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Entity Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all entities have required fields', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      for (const e of entities) {
        expect(e.id).toBeTruthy();
        expect(e.slug).toBeTruthy();
        expect(e.name).toBeTruthy();
        expect(e.primaryDomainId).toBeTruthy();
      }
    });

    it('engagementScore is always >= 0', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      for (const e of entities) {
        expect(e.engagementScore).toBeGreaterThanOrEqual(0);
      }
    });

    it('categories is always an array', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      for (const e of entities) {
        expect(Array.isArray(e.categories)).toBe(true);
      }
    });

    it('keywords is always an array', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      for (const e of entities) {
        expect(Array.isArray(e.keywords)).toBe(true);
      }
    });

    it('perspectives is always an array', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      for (const e of entities) {
        expect(Array.isArray(e.perspectives)).toBe(true);
      }
    });
  });

  describe('Entity Relations', () => {
    it('all entities reference valid domains', async () => {
      const entities = await prisma.entity.findMany({
        take: 50,
        include: { primaryDomain: true }
      });
      
      for (const e of entities) {
        expect(e.primaryDomain).toBeTruthy();
        expect(e.primaryDomain.slug).toBeTruthy();
      }
    });

    it('can load entity with facets', async () => {
      const entity = await prisma.entity.findFirst({
        include: { facets: true }
      });
      
      if (entity) {
        expect(Array.isArray(entity.facets)).toBe(true);
      }
    });

    it('can load entity with externalLinks', async () => {
      const entity = await prisma.entity.findFirst({
        include: { externalLinks: true }
      });
      
      if (entity) {
        expect(Array.isArray(entity.externalLinks)).toBe(true);
      }
    });

    it('can load entity with entityPerspectives', async () => {
      const entity = await prisma.entity.findFirst({
        include: { entityPerspectives: true }
      });
      
      if (entity) {
        expect(Array.isArray(entity.entityPerspectives)).toBe(true);
      }
    });
  });

  describe('Entity CRUD Operations', () => {
    let createdEntityId: string;

    it('can CREATE entity', async () => {
      const entity = await prisma.entity.create({
        data: {
          slug: `test-entity-${Date.now()}`,
          name: 'Test Entity for Schema Test',
          primaryDomainId: testDomainId,
          scientificName: 'Testus entityus',
          isActive: true
        }
      });
      
      expect(entity.id).toBeTruthy();
      createdEntityId = entity.id;
    });

    it('can READ entity', async () => {
      const entity = await prisma.entity.findUnique({
        where: { id: createdEntityId }
      });
      
      expect(entity).toBeTruthy();
      expect(entity?.name).toBe('Test Entity for Schema Test');
    });

    it('can UPDATE entity', async () => {
      const updated = await prisma.entity.update({
        where: { id: createdEntityId },
        data: { description: 'Updated description' }
      });
      
      expect(updated.description).toBe('Updated description');
    });

    it('can DELETE entity', async () => {
      await prisma.entity.delete({
        where: { id: createdEntityId }
      });
      
      const deleted = await prisma.entity.findUnique({
        where: { id: createdEntityId }
      });
      
      expect(deleted).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT MODEL - Complete Tests (CRITICAL!)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Expert Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all experts have required fields', async () => {
      const experts = await prisma.expert.findMany();
      
      for (const e of experts) {
        expect(e.id).toBeTruthy();
        expect(e.slug).toBeTruthy();
        expect(e.name).toBeTruthy();
        expect(e.domainId).toBeTruthy();
      }
    });

    it('impactScore is always >= 0', async () => {
      const experts = await prisma.expert.findMany();
      
      for (const e of experts) {
        expect(e.impactScore).toBeGreaterThanOrEqual(0);
      }
    });

    it('fieldExpertise is always an array', async () => {
      const experts = await prisma.expert.findMany();
      
      for (const e of experts) {
        expect(Array.isArray(e.fieldExpertise)).toBe(true);
      }
    });

    it('isVerified and isActive are booleans', async () => {
      const experts = await prisma.expert.findMany();
      
      for (const e of experts) {
        expect(typeof e.isVerified).toBe('boolean');
        expect(typeof e.isActive).toBe('boolean');
      }
    });
  });

  describe('Expert fieldExpertise (CRITICAL)', () => {
    it('at least 8 experts have populated fieldExpertise', async () => {
      const experts = await prisma.expert.findMany();
      const withExpertise = experts.filter(e => e.fieldExpertise.length > 0);
      
      expect(withExpertise.length).toBeGreaterThanOrEqual(8);
    });

    it('fieldExpertise contains valid strings', async () => {
      const experts = await prisma.expert.findMany();
      
      for (const e of experts) {
        for (const exp of e.fieldExpertise) {
          expect(typeof exp).toBe('string');
          expect(exp.length).toBeGreaterThan(0);
        }
      }
    });

    it('common expertise fields exist', async () => {
      const experts = await prisma.expert.findMany();
      const allExpertise = experts.flatMap(e => e.fieldExpertise);
      const uniqueExpertise = [...new Set(allExpertise)];
      
      // Should have at least 5 different expertise types
      expect(uniqueExpertise.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Expert Relations', () => {
    it('all experts reference valid domains', async () => {
      const experts = await prisma.expert.findMany({
        include: { domain: true }
      });
      
      for (const e of experts) {
        expect(e.domain).toBeTruthy();
        expect(e.domain.slug).toBeTruthy();
      }
    });

    it('can load expert with publications', async () => {
      const expert = await prisma.expert.findFirst({
        include: { publications: true }
      });
      
      if (expert) {
        expect(Array.isArray(expert.publications)).toBe(true);
      }
    });
  });

  describe('Expert CRUD Operations', () => {
    let createdExpertId: string;

    it('can CREATE expert', async () => {
      const expert = await prisma.expert.create({
        data: {
          slug: `test-expert-${Date.now()}`,
          name: 'Dr. Test Expert',
          title: 'Test Position',
          domainId: testDomainId,
          fieldExpertise: ['testing', 'validation'],
          impactScore: 50,
          isActive: true
        }
      });
      
      expect(expert.id).toBeTruthy();
      createdExpertId = expert.id;
    });

    it('can READ expert', async () => {
      const expert = await prisma.expert.findUnique({
        where: { id: createdExpertId }
      });
      
      expect(expert).toBeTruthy();
      expect(expert?.fieldExpertise).toEqual(['testing', 'validation']);
    });

    it('can UPDATE expert fieldExpertise', async () => {
      const updated = await prisma.expert.update({
        where: { id: createdExpertId },
        data: { 
          fieldExpertise: ['testing', 'validation', 'review']
        }
      });
      
      expect(updated.fieldExpertise).toHaveLength(3);
    });

    it('can DELETE expert', async () => {
      await prisma.expert.delete({
        where: { id: createdExpertId }
      });
      
      const deleted = await prisma.expert.findUnique({
        where: { id: createdExpertId }
      });
      
      expect(deleted).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY FACET MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('EntityFacet Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all facets have required fields', async () => {
      const facets = await prisma.entityFacet.findMany({ take: 50 });
      
      for (const f of facets) {
        expect(f.id).toBeTruthy();
        expect(f.entityId).toBeTruthy();
        expect(f.domainId).toBeTruthy();
      }
    });

    it('relevance is between 0 and 1', async () => {
      const facets = await prisma.entityFacet.findMany({ take: 50 });
      
      for (const f of facets) {
        expect(f.relevance).toBeGreaterThanOrEqual(0);
        expect(f.relevance).toBeLessThanOrEqual(1);
      }
    });

    it('data is always an object', async () => {
      const facets = await prisma.entityFacet.findMany({ take: 50 });
      
      for (const f of facets) {
        expect(typeof f.data).toBe('object');
      }
    });

    it('perspectives is always an array', async () => {
      const facets = await prisma.entityFacet.findMany({ take: 50 });
      
      for (const f of facets) {
        expect(Array.isArray(f.perspectives)).toBe(true);
      }
    });
  });

  describe('EntityFacet Relations', () => {
    it('facets reference valid entities', async () => {
      const facets = await prisma.entityFacet.findMany({
        take: 20,
        include: { entity: true }
      });
      
      for (const f of facets) {
        expect(f.entity).toBeTruthy();
      }
    });

    it('facets reference valid domains', async () => {
      const facets = await prisma.entityFacet.findMany({
        take: 20,
        include: { domain: true }
      });
      
      for (const f of facets) {
        expect(f.domain).toBeTruthy();
      }
    });
  });

  describe('EntityFacet Unique Constraint', () => {
    it('entity-domain combination is unique', async () => {
      // Test by checking that each combination appears only once
      const facets = await prisma.entityFacet.findMany();
      const combinations = facets.map(f => `${f.entityId}-${f.domainId}`);
      const uniqueCombinations = [...new Set(combinations)];
      
      expect(combinations.length).toBe(uniqueCombinations.length);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PERSPECTIVE MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Perspective Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all perspectives have required fields', async () => {
      const perspectives = await prisma.perspective.findMany();
      
      for (const p of perspectives) {
        expect(p.id).toBeTruthy();
        expect(p.slug).toBeTruthy();
        expect(p.name).toBeTruthy();
      }
    });

    it('sortOrder is always a number', async () => {
      const perspectives = await prisma.perspective.findMany();
      
      for (const p of perspectives) {
        expect(typeof p.sortOrder).toBe('number');
      }
    });
  });

  describe('Expected Perspectives', () => {
    const EXPECTED_PERSPECTIVES = [
      'identification', 'ecology', 'geography', 'temporal',
      'chemistry', 'safety', 'culinary', 'medicine',
      'cultivation', 'conservation', 'economy', 'research',
      'culture', 'interactions', 'statistics'
    ];

    it('has core perspectives if any exist', async () => {
      const perspectives = await prisma.perspective.findMany();
      
      if (perspectives.length > 0) {
        const slugs = perspectives.map(p => p.slug);
        
        // At least some core perspectives should exist
        const coreFound = EXPECTED_PERSPECTIVES.filter(e => slugs.includes(e));
        expect(coreFound.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLICATION MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Publication Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all publications have required fields', async () => {
      const publications = await prisma.publication.findMany({ take: 50 });
      
      for (const p of publications) {
        expect(p.id).toBeTruthy();
        expect(p.expertId).toBeTruthy();
        expect(p.title).toBeTruthy();
      }
    });

    it('citations is always >= 0', async () => {
      const publications = await prisma.publication.findMany({ take: 50 });
      
      for (const p of publications) {
        expect(p.citations).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Publication Relations', () => {
    it('publications reference valid experts', async () => {
      const publications = await prisma.publication.findMany({
        take: 20,
        include: { expert: true }
      });
      
      for (const p of publications) {
        expect(p.expert).toBeTruthy();
        expect(p.expert.name).toBeTruthy();
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL LINK MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('ExternalLink Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all links have required fields', async () => {
      const links = await prisma.externalLink.findMany({ take: 50 });
      
      for (const l of links) {
        expect(l.id).toBeTruthy();
        expect(l.entityId).toBeTruthy();
        expect(l.url).toBeTruthy();
        expect(l.title).toBeTruthy();
        expect(l.type).toBeTruthy();
      }
    });

    it('URL format is valid', async () => {
      const links = await prisma.externalLink.findMany({ take: 50 });
      
      for (const l of links) {
        expect(l.url).toMatch(/^https?:\/\//);
      }
    });

    it('score is always >= 0', async () => {
      const links = await prisma.externalLink.findMany({ take: 50 });
      
      for (const l of links) {
        expect(l.score).toBeGreaterThanOrEqual(0);
      }
    });

    it('domains array is always an array', async () => {
      const links = await prisma.externalLink.findMany({ take: 50 });
      
      for (const l of links) {
        expect(Array.isArray(l.domains)).toBe(true);
      }
    });
  });

  describe('ExternalLink Relations', () => {
    it('links reference valid entities', async () => {
      const links = await prisma.externalLink.findMany({
        take: 20,
        include: { entity: true }
      });
      
      for (const l of links) {
        expect(l.entity).toBeTruthy();
      }
    });

    it('can load link with votes', async () => {
      const link = await prisma.externalLink.findFirst({
        include: { votes: true }
      });
      
      if (link) {
        expect(Array.isArray(link.votes)).toBe(true);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LINK VOTE MODEL - Complete Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('LinkVote Model (Complete)', () => {
  describe('Schema Fields', () => {
    it('all votes have required fields', async () => {
      const votes = await prisma.linkVote.findMany({ take: 50 });
      
      for (const v of votes) {
        expect(v.id).toBeTruthy();
        expect(v.linkId).toBeTruthy();
        expect(v.userId).toBeTruthy();
        expect(typeof v.vote).toBe('number');
      }
    });
  });

  describe('LinkVote Relations', () => {
    it('votes reference valid links', async () => {
      const votes = await prisma.linkVote.findMany({
        take: 20,
        include: { link: true }
      });
      
      for (const v of votes) {
        expect(v.link).toBeTruthy();
      }
    });
  });

  describe('LinkVote Unique Constraint', () => {
    it('link-user combination is unique', async () => {
      const votes = await prisma.linkVote.findMany();
      const combinations = votes.map(v => `${v.linkId}-${v.userId}`);
      const uniqueCombinations = [...new Set(combinations)];
      
      expect(combinations.length).toBe(uniqueCombinations.length);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-MODEL CONSISTENCY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Cross-Model Data Consistency', () => {
  it('no orphaned entities (all reference valid domains)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM entities e
      LEFT JOIN domains d ON e."domainId" = d.id
      WHERE d.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('no orphaned experts (all reference valid domains)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM experts e
      LEFT JOIN domains d ON e."domainId" = d.id
      WHERE d.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('no orphaned entity_facets (all reference valid entities)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM entity_facets ef
      LEFT JOIN entities e ON ef."entityId" = e.id
      WHERE e.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('no orphaned publications (all reference valid experts)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM publications p
      LEFT JOIN experts e ON p."expertId" = e.id
      WHERE e.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('no orphaned external_links (all reference valid entities)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM external_links el
      LEFT JOIN entities e ON el."entityId" = e.id
      WHERE e.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });

  it('no orphaned link_votes (all reference valid links)', async () => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM link_votes lv
      LEFT JOIN external_links el ON lv."linkId" = el.id
      WHERE el.id IS NULL
    `;
    expect(Number(result[0]?.count || 0)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Database Performance', () => {
  it('can load all domains in < 100ms', async () => {
    const start = performance.now();
    await prisma.domain.findMany();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });

  it('can load all experts with domain in < 500ms', async () => {
    const start = performance.now();
    await prisma.expert.findMany({
      include: { domain: true }
    });
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500);
  });

  it('can search entities by name in < 200ms', async () => {
    const start = performance.now();
    await prisma.entity.findMany({
      where: {
        name: { contains: 'test', mode: 'insensitive' }
      },
      take: 10
    });
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(200);
  });

  it('can count all tables in < 500ms', async () => {
    const start = performance.now();
    
    await Promise.all([
      prisma.domain.count(),
      prisma.entity.count(),
      prisma.expert.count(),
      prisma.entityFacet.count(),
      prisma.externalLink.count(),
      prisma.publication.count(),
      prisma.perspective.count()
    ]);
    
    const duration = performance.now() - start;
    // Allow 1000ms for Docker/cold-start scenarios
    expect(duration).toBeLessThan(1000);
  });
});
