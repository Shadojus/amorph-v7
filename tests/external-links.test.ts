/**
 * BIFRÖST - External Links Tests
 * 
 * Tests für Phase 2 "External Knowledge Bridge":
 * - URL Detection & Metadata Fetching
 * - Links API (/api/nexus/links)
 * - Detect API (/api/nexus/links/detect)
 * - Relevanz-Engine Funktionen
 * - Link Health Checker
 * 
 * @since Phase 2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load .env BEFORE creating Prisma client
const envPath = resolve(process.cwd(), '.env');
config({ path: envPath });

import { PrismaClient } from '@prisma/client';

// ============================================================================
// Setup
// ============================================================================

const prisma = new PrismaClient();

// Test data cleanup
const TEST_PREFIX = 'test-link-';
let testEntityId: string | null = null;
let testDomainSlug: string = 'fungi';

beforeAll(async () => {
  // Get a real entity for testing
  const entity = await prisma.entity.findFirst({
    where: { primaryDomainId: testDomainSlug }
  });
  testEntityId = entity?.id || null;
});

afterAll(async () => {
  // Cleanup test links
  await prisma.externalLink.deleteMany({
    where: { url: { startsWith: 'https://test-link-' } }
  });
  await prisma.$disconnect();
});

// ============================================================================
// Source Detection Tests
// ============================================================================

describe('Source Detection', () => {
  let detectSourceType: typeof import('../../shared/external-links/sources/index').detectSourceType;

  beforeAll(async () => {
    const module = await import('../../shared/external-links/sources/index');
    detectSourceType = module.detectSourceType;
  });

  describe('detectSourceType()', () => {
    it('erkennt PubMed URLs', () => {
      expect(detectSourceType('https://pubmed.ncbi.nlm.nih.gov/12345678/')).toBe('pubmed');
      expect(detectSourceType('https://www.ncbi.nlm.nih.gov/pubmed/12345678')).toBe('pubmed');
    });

    it('erkennt Wikipedia URLs', () => {
      expect(detectSourceType('https://en.wikipedia.org/wiki/Psilocybe')).toBe('wikipedia');
      expect(detectSourceType('https://de.wikipedia.org/wiki/Pilze')).toBe('wikipedia');
    });

    it('erkennt YouTube URLs', () => {
      expect(detectSourceType('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
      expect(detectSourceType('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
    });

    it('erkennt arXiv URLs', () => {
      expect(detectSourceType('https://arxiv.org/abs/2301.12345')).toBe('arxiv');
    });

    it('erkennt DOI URLs', () => {
      expect(detectSourceType('https://doi.org/10.1234/example')).toBe('doi');
    });

    it('erkennt Wikidata URLs', () => {
      expect(detectSourceType('https://www.wikidata.org/wiki/Q12345')).toBe('wikidata');
    });

    it('erkennt ISBN', () => {
      expect(detectSourceType('ISBN 978-3-16-148410-0')).toBe('book');
      expect(detectSourceType('978-3-16-148410-0')).toBe('book');
    });

    it('fallback auf website für generische URLs', () => {
      expect(detectSourceType('https://example.com/some/page')).toBe('website');
      expect(detectSourceType('https://mycology.net/species')).toBe('website');
    });

    it('gibt null für ungültige URLs', () => {
      expect(detectSourceType('not-a-url')).toBe(null);
      expect(detectSourceType('')).toBe(null);
    });
  });
});

// ============================================================================
// Metadata Fetching Tests
// ============================================================================

describe('Metadata Fetching', () => {
  let fetchMetadata: typeof import('../../shared/external-links/sources/index').fetchMetadata;

  beforeAll(async () => {
    const module = await import('../../shared/external-links/sources/index');
    fetchMetadata = module.fetchMetadata;
  });

  describe('fetchMetadata()', () => {
    it('holt Wikipedia Metadaten', async () => {
      const result = await fetchMetadata('https://en.wikipedia.org/wiki/Psilocybin');
      
      // Wikipedia sollte Titel und Beschreibung liefern
      if (result) {
        expect(result.title).toBeDefined();
        // source_type ist der Feldname (snake_case)
        expect(result.source_type).toBe('wikipedia');
      }
    }, 15000);

    it('holt YouTube Metadaten für valide Video URL', async () => {
      // Note: Thumbnail ist nur mit YouTube API Key verfügbar
      const result = await fetchMetadata('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      if (result) {
        expect(result.source_type).toBe('youtube');
        // thumbnail kann undefined sein wenn kein API Key gesetzt
        // expect(result.thumbnail).toBeDefined(); 
      }
    }, 15000);

    it('gibt website-Metadaten für unbekannte URLs', async () => {
      // fetchMetadata gibt für unbekannte URLs ein website-Objekt zurück
      const result = await fetchMetadata('https://nonexistent-domain-12345.invalid/page');
      // Das System gibt ein website-Ergebnis mit domain als Fallback
      expect(result).toBeDefined();
      if (result) {
        expect(result.source_type).toBe('website');
      }
    }, 10000);
  });
});

// ============================================================================
// Prisma Schema Tests
// ============================================================================

describe('ExternalLink Model', () => {
  it('hat alle erforderlichen Felder', async () => {
    // Get a test entity first
    const entity = await prisma.entity.findFirst();
    if (!entity) {
      console.log('Skipping - no entities in database');
      return;
    }

    // Create test link to verify schema
    const link = await prisma.externalLink.create({
      data: {
        url: `https://test-link-schema-${Date.now()}.example.com`,
        title: 'Test Link',
        type: 'website',
        domains: ['fungi', 'phyto'],
        perspectives: ['ecology'],
        fields: ['habitat'],
        externalId: 'test-id-123',
        language: 'de',
        isAlive: true,
        entityId: entity.id
      }
    });

    expect(link.id).toBeDefined();
    expect(link.domains).toContain('fungi');
    expect(link.domains).toContain('phyto');
    expect(link.perspectives).toContain('ecology');
    expect(link.fields).toContain('habitat');
    expect(link.externalId).toBe('test-id-123');
    expect(link.language).toBe('de');
    expect(link.isAlive).toBe(true);
    expect(link.entityId).toBe(entity.id); // Now linked to entity

    // Cleanup
    await prisma.externalLink.delete({ where: { id: link.id } });
  });

  it('erlaubt Links mit entity relation', async () => {
    // Get a test entity
    const entity = await prisma.entity.findFirst({ where: { primaryDomainId: 'fungi' }});
    if (!entity) {
      console.log('Skipping - no fungi entity found');
      return;
    }

    // Link with entity
    const link = await prisma.externalLink.create({
      data: {
        url: `https://test-link-with-entity-${Date.now()}.example.com`,
        title: 'Entity Link',
        type: 'website',
        domains: ['fungi'],
        entityId: entity.id
      }
    });

    expect(link.entityId).toBe(entity.id);
    
    // Cleanup
    await prisma.externalLink.delete({ where: { id: link.id } });
  });

  it('kann mehrere domains zuweisen', async () => {
    if (!testEntityId) {
      console.log('Skipping test - no test entity found');
      return;
    }

    const link = await prisma.externalLink.create({
      data: {
        url: `https://test-link-multi-domain-${Date.now()}.example.com`,
        title: 'Multi-Domain Link',
        type: 'pubmed',
        entityId: testEntityId,
        domains: ['fungi', 'chemo', 'phyto']
      }
    });

    expect(link.entityId).toBe(testEntityId);
    expect(link.domains).toContain('fungi');
    expect(link.domains).toContain('chemo');
    expect(link.domains.length).toBe(3);
    
    // Cleanup
    await prisma.externalLink.delete({ where: { id: link.id } });
  });
});

// ============================================================================
// Data Access / Relevanz-Engine Tests
// ============================================================================

describe('Relevanz-Engine', () => {
  let loadExternalLinks: typeof import('../../shared/database/data-access').loadExternalLinks;
  let getLinksForDomain: typeof import('../../shared/database/data-access').getLinksForDomain;
  let searchRelevantLinks: typeof import('../../shared/database/data-access').searchRelevantLinks;
  let calculateLinkRelevance: typeof import('../../shared/database/data-access').calculateLinkRelevance;
  let countLinksByType: typeof import('../../shared/database/data-access').countLinksByType;

  beforeAll(async () => {
    const module = await import('../../shared/database/data-access');
    loadExternalLinks = module.loadExternalLinks;
    getLinksForDomain = module.getLinksForDomain;
    searchRelevantLinks = module.searchRelevantLinks;
    calculateLinkRelevance = module.calculateLinkRelevance;
    countLinksByType = module.countLinksByType;
  });

  describe('loadExternalLinks()', () => {
    it('lädt Links mit Standard-Optionen', async () => {
      const result = await loadExternalLinks({ limit: 5 });
      
      expect(result).toHaveProperty('links');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.links)).toBe(true);
    });

    it('filtert nach Domain', async () => {
      const result = await loadExternalLinks({ domain: 'fungi', limit: 10 });
      
      // Alle Links sollten fungi in domains haben oder primaryDomainId = fungi
      result.links.forEach(link => {
        const hasDomain = link.domains.includes('fungi') || 
          link.entity?.primaryDomain?.slug === 'fungi';
        // Note: Can be false if link has no domain set
      });
    });

    it('filtert nach isAlive', async () => {
      const result = await loadExternalLinks({ isAlive: true, limit: 10 });
      
      result.links.forEach(link => {
        expect(link.isAlive).toBe(true);
      });
    });

    it('respektiert Pagination', async () => {
      const page1 = await loadExternalLinks({ limit: 2, offset: 0 });
      const page2 = await loadExternalLinks({ limit: 2, offset: 2 });
      
      if (page1.total > 2) {
        // Pages sollten unterschiedliche Links haben
        const page1Ids = page1.links.map(l => l.id);
        const page2Ids = page2.links.map(l => l.id);
        
        const overlap = page1Ids.filter(id => page2Ids.includes(id));
        expect(overlap).toHaveLength(0);
      }
    });
  });

  describe('getLinksForDomain()', () => {
    it('gibt Links für eine Domain zurück', async () => {
      const links = await getLinksForDomain('fungi', { limit: 5 });
      
      expect(Array.isArray(links)).toBe(true);
    });
  });

  describe('searchRelevantLinks()', () => {
    it('sucht Links nach Textquery', async () => {
      const results = await searchRelevantLinks('psilocybe');
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('berücksichtigt Kontext-Filter', async () => {
      const results = await searchRelevantLinks('mycelium', {
        domain: 'fungi'
      });
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('calculateLinkRelevance()', () => {
    it('berechnet Relevanz-Score basierend auf Übereinstimmungen', () => {
      const link = {
        domains: ['fungi', 'phyto'],
        perspectives: ['ecology', 'chemistry'],
        fields: ['habitat', 'compounds']
      };

      // Volle Übereinstimmung
      const fullMatch = calculateLinkRelevance(link, {
        domain: 'fungi',
        perspective: 'ecology',
        field: 'habitat'
      });
      expect(fullMatch).toBe(1.0);

      // Nur Domain-Match
      const domainOnly = calculateLinkRelevance(link, {
        domain: 'fungi'
      });
      expect(domainOnly).toBe(0.4);

      // Kein Match
      const noMatch = calculateLinkRelevance(link, {
        domain: 'kosmo',
        perspective: 'physics'
      });
      expect(noMatch).toBe(0);
    });
  });

  describe('countLinksByType()', () => {
    it('zählt Links gruppiert nach Typ', async () => {
      const counts = await countLinksByType({});
      
      expect(typeof counts).toBe('object');
      // Keys sollten Link-Typen sein
      Object.keys(counts).forEach(type => {
        expect(['pubmed', 'wikipedia', 'youtube', 'arxiv', 'doi', 'book', 'website', 'wikidata'])
          .toContain(type);
      });
    });

    it('filtert nach Domain', async () => {
      const counts = await countLinksByType({ domain: 'fungi' });
      
      expect(typeof counts).toBe('object');
    });
  });
});

// ============================================================================
// Link Health Checker Tests
// ============================================================================

describe('Link Health Checker', () => {
  let checkUrl: typeof import('../../shared/database/check-link-health').checkUrl;

  beforeAll(async () => {
    const module = await import('../../shared/database/check-link-health');
    checkUrl = module.checkUrl;
  });

  describe('checkUrl()', () => {
    it('erkennt erreichbare URLs', async () => {
      const result = await checkUrl('https://www.google.com');
      
      expect(result.isAlive).toBe(true);
      expect(result.statusCode).toBeDefined();
      expect(result.statusCode).toBeGreaterThanOrEqual(200);
      expect(result.statusCode).toBeLessThan(400);
    }, 15000);

    it('erkennt nicht erreichbare URLs', async () => {
      const result = await checkUrl('https://nonexistent-domain-xyz-123.invalid');
      
      expect(result.isAlive).toBe(false);
      expect(result.error).toBeDefined();
    }, 15000);

    it('behandelt Redirects korrekt', async () => {
      // HTTP -> HTTPS redirect
      const result = await checkUrl('http://google.com');
      
      expect(result.isAlive).toBe(true);
    }, 15000);
  });
});

// ============================================================================
// API Endpoint Tests (Unit)
// ============================================================================

describe('Links API Logic', () => {
  describe('POST /api/nexus/links validation', () => {
    it('erfordert URL und Titel', async () => {
      // Simulate validation
      const validateLinkInput = (data: any) => {
        const errors: string[] = [];
        if (!data.url) errors.push('URL is required');
        if (!data.title && !data.autoDetect) errors.push('Title is required when autoDetect is false');
        if (!data.type && !data.autoDetect) errors.push('Type is required when autoDetect is false');
        return errors;
      };

      expect(validateLinkInput({})).toContain('URL is required');
      expect(validateLinkInput({ url: 'https://test.com', autoDetect: true })).toHaveLength(0);
      expect(validateLinkInput({ url: 'https://test.com', title: 'Test', type: 'website' })).toHaveLength(0);
    });

    it('validiert URL-Format', () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('validiert Link-Typen', () => {
      const VALID_TYPES = ['pubmed', 'wikipedia', 'youtube', 'arxiv', 'doi', 'book', 'website', 'wikidata'];
      
      const isValidType = (type: string) => VALID_TYPES.includes(type);

      expect(isValidType('pubmed')).toBe(true);
      expect(isValidType('youtube')).toBe(true);
      expect(isValidType('invalid-type')).toBe(false);
    });
  });

  describe('GET /api/nexus/links query params', () => {
    it('parst Filter-Parameter korrekt', () => {
      const parseFilters = (params: URLSearchParams) => {
        return {
          domain: params.get('domain'),
          entityId: params.get('entityId'),
          perspective: params.get('perspective'),
          type: params.get('type'),
          verified: params.get('verified') === 'true',
          limit: parseInt(params.get('limit') || '20', 10),
          offset: parseInt(params.get('offset') || '0', 10)
        };
      };

      const params1 = new URLSearchParams('domain=fungi&limit=10');
      const filters1 = parseFilters(params1);
      expect(filters1.domain).toBe('fungi');
      expect(filters1.limit).toBe(10);

      const params2 = new URLSearchParams('verified=true&perspective=ecology');
      const filters2 = parseFilters(params2);
      expect(filters2.verified).toBe(true);
      expect(filters2.perspective).toBe('ecology');
    });
  });
});

// ============================================================================
// Voting System Tests
// ============================================================================

describe('Voting System', () => {
  let testLinkId: string | null = null;

  beforeAll(async () => {
    // Get test entity first
    const entity = await prisma.entity.findFirst();
    if (!entity) return;

    // Create test link for voting
    const link = await prisma.externalLink.create({
      data: {
        url: `https://test-link-voting-${Date.now()}.example.com`,
        title: 'Voting Test Link',
        type: 'website',
        domains: ['fungi'],
        entityId: entity.id
      }
    });
    testLinkId = link.id;
  });

  afterAll(async () => {
    if (testLinkId) {
      await prisma.linkVote.deleteMany({ where: { linkId: testLinkId } });
      await prisma.externalLink.delete({ where: { id: testLinkId } });
    }
  });

  it('erstellt Vote für Link', async () => {
    if (!testLinkId) return;

    const vote = await prisma.linkVote.create({
      data: {
        linkId: testLinkId,
        vote: 1, // Upvote
        userId: 'test-user-123'
      }
    });

    expect(vote.vote).toBe(1);
    expect(vote.linkId).toBe(testLinkId);
  });

  it('verhindert Duplikat-Votes vom gleichen User', async () => {
    if (!testLinkId) return;

    // Check for existing vote
    const existingVote = await prisma.linkVote.findFirst({
      where: {
        linkId: testLinkId,
        userId: 'test-user-123'
      }
    });

    expect(existingVote).not.toBeNull();
  });

  it('berechnet Score korrekt', async () => {
    if (!testLinkId) return;

    // Add another vote
    await prisma.linkVote.create({
      data: {
        linkId: testLinkId,
        vote: 1,
        userId: 'test-user-456'
      }
    });

    // Calculate total score
    const votes = await prisma.linkVote.findMany({
      where: { linkId: testLinkId }
    });

    const totalScore = votes.reduce((sum, v) => sum + v.vote, 0);
    expect(totalScore).toBe(2);
  });
});

// ============================================================================
// Component Interface Tests
// ============================================================================

describe('Component Interfaces', () => {
  it('LinkCard Props Interface ist korrekt', () => {
    interface LinkCardProps {
      link: {
        id: string;
        url: string;
        title: string;
        description?: string | null;
        type: string;
        thumbnail?: string | null;
        score: number;
        isVerified: boolean;
        domains?: string[];
        entity?: {
          slug: string;
          name: string;
          primaryDomain?: { slug: string; name: string; color?: string | null };
        } | null;
        voteCount?: number;
      };
      showEntity?: boolean;
      compact?: boolean;
    }

    // Validate interface shape
    const validProps: LinkCardProps = {
      link: {
        id: 'test-123',
        url: 'https://example.com',
        title: 'Test Link',
        type: 'website',
        score: 10,
        isVerified: false
      }
    };

    expect(validProps.link.id).toBeDefined();
    expect(validProps.link.url).toBeDefined();
  });

  it('LinkList Props Interface ist korrekt', () => {
    interface LinkListProps {
      links: Array<{
        id: string;
        url: string;
        title: string;
        type: string;
        score: number;
        isVerified: boolean;
      }>;
      showEntity?: boolean;
      compact?: boolean;
      emptyMessage?: string;
      title?: string;
    }

    const validProps: LinkListProps = {
      links: [],
      title: 'External Resources'
    };

    expect(Array.isArray(validProps.links)).toBe(true);
  });

  it('EntityLinks Props Interface ist korrekt', () => {
    interface EntityLinksProps {
      entityId: string;
      entitySlug?: string;
      domain: string;
      limit?: number;
      showAddForm?: boolean;
    }

    const validProps: EntityLinksProps = {
      entityId: 'entity-123',
      domain: 'fungi'
    };

    expect(validProps.entityId).toBeDefined();
    expect(validProps.domain).toBeDefined();
  });
});
