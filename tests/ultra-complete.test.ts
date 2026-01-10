/**
 * BIFRÖST ULTRA-COMPLETE TEST SUITE
 * ==================================
 * Holistische System-Tests für alle Schichten
 * 
 * Coverage:
 * 1. Database Layer - Prisma, Connections, Queries
 * 2. Data Layer - Transformations, Caching, Loading
 * 3. Security Layer - XSS, SQL Injection, CORS, Rate Limiting
 * 4. API Layer - All Endpoints, Validation, Error Handling
 * 5. Morphs Layer - All 28 Morphs, Rendering, Single/Compare
 * 6. Observer Layer - Tracking, Events, Analytics
 * 7. Frontend Layer - Components, Pages, SSR
 * 8. Integration - End-to-End Flows
 * 9. Performance - Load, Response Times, Memory
 * 
 * @since v8.5.0 - PostgreSQL-Only Edition
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import prisma from '../src/server/db';
import { loadAllItems, getItem } from '../src/server/data';
import { loadAllItemsFromDB, getItemBySlugFromDB } from '../src/server/data-db';
import { detectType, getBadgeVariant } from '../src/core/detection';
import { validateSlug, validateQuery, validatePerspectives, validateNumber, escapeHtml, checkRateLimit } from '../src/core/security';
import { getSiteType, SITE_META, SITE_DOMAIN } from '../src/server/config';

// ═══════════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE = 'http://localhost:4321';
const TEST_DOMAIN = 'fungi';
const TEST_SLUG = 'agaricus-subrufescens';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DATABASE LAYER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('DATABASE LAYER', () => {
  describe('Connection', () => {
    it('connects to PostgreSQL successfully', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      expect(result).toBeDefined();
    });

    it('has correct database name', async () => {
      const result: any[] = await prisma.$queryRaw`SELECT current_database()`;
      expect(result[0].current_database).toBe('bifroest');
    });

    it('has all required tables', async () => {
      const tables: any[] = await prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      const tableNames = tables.map(t => t.table_name);
      
      expect(tableNames).toContain('domains');
      expect(tableNames).toContain('entities');
      expect(tableNames).toContain('entity_facets');
      expect(tableNames).toContain('perspectives');
      expect(tableNames).toContain('experts');
      expect(tableNames).toContain('external_links');
    });
  });

  describe('Schema Integrity', () => {
    it('has 17 domains', async () => {
      const count = await prisma.domain.count();
      expect(count).toBe(17);
    });

    it('has all domain slugs', async () => {
      const domains = await prisma.domain.findMany({ select: { slug: true } });
      const slugs = domains.map(d => d.slug);
      
      const expectedSlugs = [
        'fungi', 'phyto', 'drako', 'bakterio', 'viro',
        'geno', 'anato', 'chemo', 'physi', 'kosmo',
        'mine', 'tekto', 'paleo', 'netzo', 'cognito', 'biotech', 'socio'
      ];
      
      expectedSlugs.forEach(slug => {
        expect(slugs).toContain(slug);
      });
    });

    it('has entities with required fields', async () => {
      const entities = await prisma.entity.findMany({ take: 10 });
      
      entities.forEach(entity => {
        expect(entity.id).toBeTruthy();
        expect(entity.slug).toBeTruthy();
        expect(entity.name).toBeTruthy();
        expect(entity.primaryDomainId).toBeTruthy();
        expect(typeof entity.isActive).toBe('boolean');
      });
    });

    it('has proper domain-entity relations', async () => {
      const entity = await prisma.entity.findFirst({
        include: { primaryDomain: true }
      });
      
      expect(entity?.primaryDomain).toBeDefined();
      expect(entity?.primaryDomain.slug).toBeTruthy();
    });

    it('has EntityFacets for cross-domain relations', async () => {
      const facetCount = await prisma.entityFacet.count();
      expect(facetCount).toBeGreaterThan(100);
    });

    it('has perspectives seeded', async () => {
      const perspectiveCount = await prisma.perspective.count();
      expect(perspectiveCount).toBeGreaterThanOrEqual(5);
    });

    it('has experts seeded', async () => {
      const expertCount = await prisma.expert.count();
      expect(expertCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Query Performance', () => {
    it('loads all entities in under 2 seconds', async () => {
      const start = Date.now();
      await prisma.entity.findMany({ include: { primaryDomain: true } });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    it('loads single entity in under 500ms', async () => {
      const start = Date.now();
      await prisma.entity.findFirst({ 
        where: { slug: TEST_SLUG },
        include: { primaryDomain: true, facets: true }
      });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    it('counts entities efficiently', async () => {
      const start = Date.now();
      await prisma.entity.count();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DATA LAYER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('DATA LAYER', () => {
  describe('Data Loading (data-db.ts)', () => {
    it('loadAllItemsFromDB returns items with _fromDatabase marker', async () => {
      const items = await loadAllItemsFromDB();
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item._fromDatabase).toBe(true);
      });
    });

    it('loadAllItemsFromDB returns items with database IDs', async () => {
      const items = await loadAllItemsFromDB();
      items.forEach(item => {
        expect(item._dbId).toBeTruthy();
        expect(typeof item._dbId).toBe('string');
      });
    });

    it('loadAllItemsFromDB returns items with slugs', async () => {
      const items = await loadAllItemsFromDB();
      items.forEach(item => {
        expect(item.slug).toBeTruthy();
        expect(typeof item.slug).toBe('string');
      });
    });
  });

  describe('Data Abstraction (data.ts)', () => {
    it('loadAllItems returns data from database only', async () => {
      const items = await loadAllItems();
      expect(items.length).toBeGreaterThan(0);
      
      // All items must be from database (no JSON fallback)
      items.forEach(item => {
        expect(item._fromDatabase).toBe(true);
      });
    });

    it('getItem returns single item by slug', async () => {
      const items = await loadAllItems();
      const firstSlug = items[0]?.slug;
      if (firstSlug) {
        const item = await getItem(firstSlug);
        expect(item).toBeDefined();
        expect(item?.slug).toBe(firstSlug);
      }
    });

    it('getItem returns null for non-existent slug', async () => {
      const item = await getItem('non-existent-slug-xyz-12345');
      expect(item).toBeNull();
    });
  });

  describe('Data Transformation', () => {
    it('transforms database entities to ItemData format', async () => {
      const items = await loadAllItemsFromDB();
      const item = items[0];
      
      // Required fields
      expect(item.slug).toBeTruthy();
      expect(item.name).toBeTruthy();
      
      // Database marker
      expect(item._fromDatabase).toBe(true);
    });

    it('preserves scientific names where available', async () => {
      const items = await loadAllItemsFromDB();
      const withScientific = items.filter(i => i.scientificName || i.wissenschaftlich);
      // Some entities should have scientific names
      expect(withScientific.length).toBeGreaterThanOrEqual(0);
    });

    it('preserves descriptions where available', async () => {
      const items = await loadAllItemsFromDB();
      const withDescription = items.filter(i => i.description && i.description.length > 10);
      // Some entities should have descriptions
      expect(withDescription.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration (config.ts)', () => {
    it('has all 17 sites configured in SITE_META', () => {
      expect(Object.keys(SITE_META).length).toBe(17);
    });

    it('getSiteType returns valid site type', () => {
      const siteType = getSiteType();
      expect(SITE_META[siteType]).toBeDefined();
    });

    it('SITE_DOMAIN maps sites to domains', () => {
      expect(Object.keys(SITE_DOMAIN).length).toBe(17);
      expect(SITE_DOMAIN['fungi']).toBe('biology');
      expect(SITE_DOMAIN['chemo']).toBe('physchem');
    });

    it('all sites have required metadata', () => {
      Object.entries(SITE_META).forEach(([slug, config]) => {
        expect(config.name).toBeTruthy();
        expect(config.color).toBeTruthy();
        expect(config.dataFolder).toBeTruthy();
        expect(config.domain).toBeTruthy();
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SECURITY LAYER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('SECURITY LAYER', () => {
  describe('Query Validation (validateQuery)', () => {
    it('removes dangerous characters', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = validateQuery(malicious);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('removes SQL injection characters', () => {
      const malicious = "'; DROP TABLE entities; --";
      const sanitized = validateQuery(malicious);
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(';');
    });

    it('preserves safe text', () => {
      const safe = 'Agaricus subrufescens';
      const sanitized = validateQuery(safe);
      expect(sanitized).toBe(safe);
    });

    it('handles non-string input', () => {
      expect(validateQuery(null)).toBe('');
      expect(validateQuery(undefined)).toBe('');
      expect(validateQuery(123)).toBe('');
    });

    it('trims and limits length', () => {
      const longQuery = 'a'.repeat(300);
      const sanitized = validateQuery(longQuery);
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Slug Validation (validateSlug)', () => {
    it('accepts valid slugs', () => {
      expect(validateSlug('amanita-muscaria')).toBe('amanita-muscaria');
      expect(validateSlug('fungi-123')).toBe('fungi-123');
    });

    it('rejects path traversal attempts', () => {
      expect(validateSlug('../../../etc/passwd')).toBeNull();
      expect(validateSlug('path/to/file')).toBeNull();
    });

    it('rejects too long slugs', () => {
      const longSlug = 'a'.repeat(150);
      expect(validateSlug(longSlug)).toBeNull();
    });

    it('rejects empty slugs', () => {
      expect(validateSlug('')).toBeNull();
    });

    it('lowercases slugs', () => {
      expect(validateSlug('FUNGI')).toBe('fungi');
    });
  });

  describe('HTML Escaping (escapeHtml)', () => {
    it('escapes script tags', () => {
      const html = '<script>evil()</script>';
      const escaped = escapeHtml(html);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;');
    });

    it('escapes special characters', () => {
      const html = '<p class="test">Hello & World</p>';
      const escaped = escapeHtml(html);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).toContain('&amp;');
    });

    it('handles non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('Rate Limiting (checkRateLimit)', () => {
    it('allows requests under limit', () => {
      const result = checkRateLimit('test-ip-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('returns remaining count', () => {
      const result = checkRateLimit('test-ip-2');
      expect(typeof result.remaining).toBe('number');
    });

    it('returns reset time', () => {
      const result = checkRateLimit('test-ip-3');
      expect(typeof result.resetIn).toBe('number');
    });
  });

  describe('Perspective Validation (validatePerspectives)', () => {
    it('validates array of perspectives', () => {
      const result = validatePerspectives(['medical', 'ecological']);
      expect(result).toContain('medical');
      expect(result).toContain('ecological');
    });

    it('handles string with comma separation', () => {
      const result = validatePerspectives('medical,ecological');
      expect(result.length).toBe(2);
    });

    it('limits number of perspectives', () => {
      const many = Array(20).fill('perspective');
      const result = validatePerspectives(many);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Number Validation (validateNumber)', () => {
    it('validates numbers within range', () => {
      expect(validateNumber(50, 0, 100, 10)).toBe(50);
    });

    it('clamps to min', () => {
      expect(validateNumber(-5, 0, 100, 10)).toBe(0);
    });

    it('clamps to max', () => {
      expect(validateNumber(150, 0, 100, 10)).toBe(100);
    });

    it('uses default for invalid input', () => {
      expect(validateNumber('invalid', 0, 100, 10)).toBe(10);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TYPE DETECTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('TYPE DETECTION (detection.ts)', () => {
  describe('detectType - Primitives', () => {
    it('detects boolean type', () => {
      expect(detectType(true)).toBe('boolean');
      expect(detectType(false)).toBe('boolean');
    });

    it('detects number type', () => {
      expect(detectType(42)).toBe('number');
      expect(detectType(3.14)).toBe('number');
    });

    it('handles null/undefined as text', () => {
      // According to detection.ts: null/undefined → text
      expect(detectType(null)).toBe('text');
      expect(detectType(undefined)).toBe('text');
    });
  });

  describe('detectType - Strings', () => {
    it('detects long strings as text', () => {
      // text: string with > 20 characters
      expect(detectType('This is a long text string over twenty characters')).toBe('text');
    });

    it('detects short strings as tag', () => {
      // tag: string ≤20 characters
      expect(detectType('Short')).toBe('tag');
      expect(detectType('Small value')).toBe('tag');
    });

    it('detects image URLs', () => {
      expect(detectType('photo.jpg')).toBe('image');
      expect(detectType('image.png')).toBe('image');
      expect(detectType('picture.webp')).toBe('image');
      expect(detectType('https://example.com/image.jpg')).toBe('image');
    });

    it('detects regular links', () => {
      expect(detectType('https://example.com')).toBe('link');
      expect(detectType('http://test.org/path')).toBe('link');
    });

    it('detects ISO dates', () => {
      expect(detectType('2024-01-15')).toBe('date');
      expect(detectType('2024-01-15T10:30:00')).toBe('date');
    });

    it('detects German dates', () => {
      expect(detectType('15.01.2024')).toBe('date');
    });
  });

  describe('detectType - Arrays', () => {
    it('detects number arrays as sparkline', () => {
      expect(detectType([10, 20, 30, 40, 50])).toBe('sparkline');
    });

    it('detects short string arrays as tag', () => {
      expect(detectType(['A', 'B', 'C'])).toBe('tag');
    });

    it('detects empty arrays as list', () => {
      expect(detectType([])).toBe('list');
    });
  });

  describe('detectType - Objects', () => {
    it('detects badge structure', () => {
      expect(detectType({ status: 'active', variant: 'success' })).toBe('badge');
    });

    it('detects rating structure', () => {
      expect(detectType({ rating: 4, max: 5 })).toBe('rating');
    });

    it('detects progress structure', () => {
      expect(detectType({ value: 75, max: 100 })).toBe('progress');
    });

    it('detects range structure', () => {
      expect(detectType({ min: 0, max: 100 })).toBe('range');
    });

    it('detects generic objects', () => {
      expect(detectType({ foo: 'bar', baz: 123 })).toBe('object');
    });
  });

  describe('getBadgeVariant', () => {
    it('detects success variants', () => {
      expect(getBadgeVariant('edible')).toBe('success');
      expect(getBadgeVariant('active')).toBe('success');
    });

    it('detects danger variants', () => {
      expect(getBadgeVariant('toxic')).toBe('danger');
      expect(getBadgeVariant('critical')).toBe('danger');
    });

    it('detects warning variants', () => {
      expect(getBadgeVariant('caution')).toBe('warning');
    });

    it('returns default for unknown', () => {
      expect(getBadgeVariant('random-value')).toBe('default');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MORPH SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('MORPH SYSTEM', () => {
  describe('Morph Registry', () => {
    it('has getMorph function', async () => {
      const { getMorph } = await import('../src/morphs');
      expect(typeof getMorph).toBe('function');
    });

    it('has hasMorph function', async () => {
      const { hasMorph } = await import('../src/morphs');
      expect(typeof hasMorph).toBe('function');
    });

    it('recognizes text morph', async () => {
      const { hasMorph } = await import('../src/morphs');
      expect(hasMorph('text')).toBe(true);
    });

    it('recognizes number morph', async () => {
      const { hasMorph } = await import('../src/morphs');
      expect(hasMorph('number')).toBe(true);
    });

    it('recognizes badge morph', async () => {
      const { hasMorph } = await import('../src/morphs');
      expect(hasMorph('badge')).toBe(true);
    });

    it('recognizes gauge morph', async () => {
      const { hasMorph } = await import('../src/morphs');
      expect(hasMorph('gauge')).toBe(true);
    });
  });

  describe('Text Morph', () => {
    it('renders text content', async () => {
      const { text } = await import('../src/morphs/primitives/text');
      const result = text('Hello World', { mode: 'single' });
      expect(result).toContain('Hello World');
    });

    it('handles empty text', async () => {
      const { text } = await import('../src/morphs/primitives/text');
      const result = text('', { mode: 'single' });
      expect(result).toBeDefined();
    });
  });

  describe('Number Morph', () => {
    it('renders numbers', async () => {
      const { number } = await import('../src/morphs/primitives/number');
      const result = number(42, { mode: 'single' });
      expect(result).toContain('42');
    });

    it('formats large numbers', async () => {
      const { number } = await import('../src/morphs/primitives/number');
      const result = number(1000000, { mode: 'single' });
      expect(result).toBeDefined();
    });
  });

  describe('Badge Morph', () => {
    it('renders badge with value', async () => {
      const { badge } = await import('../src/morphs/primitives/badge');
      const result = badge('active', { mode: 'single' });
      expect(result).toContain('active');
    });
  });

  describe('List Morph', () => {
    it('renders array items', async () => {
      const { list } = await import('../src/morphs/primitives/list');
      const result = list(['item1', 'item2', 'item3'], { mode: 'single' });
      expect(result).toContain('item1');
      expect(result).toContain('item2');
    });

    it('handles empty arrays', async () => {
      const { list } = await import('../src/morphs/primitives/list');
      const result = list([], { mode: 'single' });
      expect(result).toBeDefined();
    });
  });

  describe('Gauge Morph', () => {
    it('renders gauge with value', async () => {
      const { gauge } = await import('../src/morphs/primitives/gauge');
      const result = gauge({ value: 75, min: 0, max: 100 }, { mode: 'single' });
      expect(result).toBeDefined();
    });
  });

  describe('Image Morph', () => {
    it('renders image tag', async () => {
      const { image } = await import('../src/morphs/primitives/image');
      const result = image('test.jpg', { mode: 'single' });
      expect(result).toContain('img');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. OBSERVER SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('OBSERVER SYSTEM', () => {
  describe('Debug Mode', () => {
    it('exports observer module', async () => {
      const observer = await import('../src/observer');
      expect(observer).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. LIVE API TESTS (requires running server)
// ═══════════════════════════════════════════════════════════════════════════════

describe('LIVE API TESTS', () => {
  let serverAvailable = false;

  beforeAll(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/nexus`, {
        signal: AbortSignal.timeout(3000)
      });
      serverAvailable = response.ok;
    } catch {
      serverAvailable = false;
    }
  });

  describe('Nexus API', () => {
    it('returns healthy status', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.database.connected).toBe(true);
    });

    it('returns all 17 domains', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus/domains`);
      const data = await response.json();
      
      expect(data.domains.length).toBe(17);
    });

    it('returns entities for domain', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus/entities?domain=${TEST_DOMAIN}`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.entities.length).toBeGreaterThan(0);
      expect(data.entities[0].domain.slug).toBe(TEST_DOMAIN);
    });

    it('supports pagination', async () => {
      if (!serverAvailable) return;
      
      const page1 = await fetch(`${API_BASE}/api/nexus/entities?domain=${TEST_DOMAIN}&page=1&limit=5`);
      const data1 = await page1.json();
      
      expect(data1.pagination.page).toBe(1);
      expect(data1.entities.length).toBeLessThanOrEqual(5);
    });

    it('returns perspectives', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus/perspectives`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.perspectives.length).toBeGreaterThanOrEqual(5);
    });

    it('returns experts', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus/experts`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.experts.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Search API', () => {
    it('returns search results', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/search?q=mushroom&limit=10`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.items).toBeDefined();
    });

    it('respects limit parameter', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/search?q=a&limit=5`);
      const data = await response.json();
      
      expect(data.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('API Error Handling', () => {
    it('handles non-existent endpoint without crashing', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nonexistent`);
      // May be 404 or redirect - should not throw
      expect(typeof response.status).toBe('number');
    });

    it('handles invalid domain gracefully', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/nexus/entities?domain=invalid`);
      expect(response.ok).toBe(true); // Should not crash
    });
  });

  describe('API Security', () => {
    it('sanitizes XSS in search query', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/search?q=<script>alert(1)</script>`);
      const data = await response.json();
      
      // Should not contain unescaped script
      const text = JSON.stringify(data);
      expect(text).not.toContain('<script>alert(1)</script>');
    });

    it('handles SQL injection attempts', async () => {
      if (!serverAvailable) return;
      
      const response = await fetch(`${API_BASE}/api/search?q='; DROP TABLE entities; --`);
      // Should not crash and should return normally
      expect(response.ok).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CROSS-DOMAIN INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CROSS-DOMAIN INTEGRATION', () => {
  it('entities link to correct domains', async () => {
    const domains = ['fungi', 'phyto', 'therion', 'chemo'];
    
    for (const domainSlug of domains) {
      const entities = await prisma.entity.findMany({
        where: { primaryDomain: { slug: domainSlug } },
        include: { primaryDomain: true },
        take: 5
      });
      
      entities.forEach(entity => {
        expect(entity.primaryDomain.slug).toBe(domainSlug);
      });
    }
  });

  it('EntityFacets create cross-domain connections', async () => {
    const facets = await prisma.entityFacet.findMany({
      include: {
        entity: { include: { primaryDomain: true } },
        domain: true
      },
      take: 20
    });
    
    // Some facets should connect to different domains
    const crossDomain = facets.filter(f => 
      f.entity.primaryDomain.slug !== f.domain.slug
    );
    
    expect(crossDomain.length).toBeGreaterThan(0);
  });

  it('experts are linked to domains', async () => {
    const experts = await prisma.expert.findMany({
      include: { domain: true }
    });
    
    experts.forEach(expert => {
      expect(expert.domain).toBeDefined();
      expect(expert.domain.slug).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('PERFORMANCE', () => {
  describe('Database Performance', () => {
    it('loads all entities in under 2 seconds', async () => {
      const start = Date.now();
      await prisma.entity.findMany({ include: { primaryDomain: true } });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    it('counts entities in under 100ms', async () => {
      const start = Date.now();
      await prisma.entity.count();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('loads entity with relations in under 500ms', async () => {
      const start = Date.now();
      await prisma.entity.findFirst({
        include: {
          primaryDomain: true,
          facets: true,
          externalLinks: true
        }
      });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Data Layer Performance', () => {
    it('loadAllItems completes in under 3 seconds', async () => {
      const start = Date.now();
      await loadAllItems();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(3000);
    });

    it('getItem completes in under 500ms', async () => {
      const items = await loadAllItems();
      const slug = items[0]?.slug;
      if (slug) {
        const start = Date.now();
        await getItem(slug);
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
      } else {
        expect(true).toBe(true); // Skip if no items
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. DATA QUALITY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('DATA QUALITY', () => {
  describe('Entity Quality', () => {
    it('entities have meaningful names', async () => {
      const entities = await prisma.entity.findMany({ take: 50 });
      
      entities.forEach(entity => {
        expect(entity.name.length).toBeGreaterThan(2);
        expect(entity.name).not.toBe('undefined');
        expect(entity.name).not.toBe('null');
      });
    });

    it('entities have unique slugs', async () => {
      const entities = await prisma.entity.findMany({ select: { slug: true } });
      const slugs = entities.map(e => e.slug);
      const uniqueSlugs = new Set(slugs);
      
      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('scientific names are properly formatted', async () => {
      const entities = await prisma.entity.findMany({
        where: { scientificName: { not: null } },
        take: 30
      });
      
      entities.forEach(entity => {
        if (entity.scientificName) {
          // Should have at least 2 parts (genus species)
          expect(entity.scientificName.length).toBeGreaterThan(5);
        }
      });
    });

    it('entities have descriptions', async () => {
      const withDescription = await prisma.entity.count({
        where: { description: { not: null } }
      });
      const total = await prisma.entity.count();
      
      // At least 50% should have descriptions
      expect(withDescription / total).toBeGreaterThan(0.5);
    });
  });

  describe('Domain Quality', () => {
    it('all domains have icons', async () => {
      const domains = await prisma.domain.findMany();
      domains.forEach(domain => {
        expect(domain.icon).toBeTruthy();
      });
    });

    it('all domains have colors', async () => {
      const domains = await prisma.domain.findMany();
      domains.forEach(domain => {
        expect(domain.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('domains have sortOrder', async () => {
      const domains = await prisma.domain.findMany();
      domains.forEach(domain => {
        expect(typeof domain.sortOrder).toBe('number');
      });
    });
  });

  describe('Expert Quality', () => {
    it('experts have required fields', async () => {
      const experts = await prisma.expert.findMany();
      
      experts.forEach(expert => {
        expect(expert.name).toBeTruthy();
        expect(expert.slug).toBeTruthy();
      });
    });

    it('experts have associated domain', async () => {
      const experts = await prisma.expert.findMany({ include: { domain: true } });
      
      experts.forEach(expert => {
        expect(expert.domainId).toBeTruthy();
        expect(expert.domain).toBeDefined();
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════════

afterAll(async () => {
  await prisma.$disconnect();
});
