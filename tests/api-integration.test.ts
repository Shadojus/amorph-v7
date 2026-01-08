/**
 * AMORPH v7 - API Integration Tests
 * 
 * Tests für /api/search und /api/compare Endpoints.
 * Nutzt echte Daten aus dem data/ Verzeichnis.
 * 
 * NOTE: Tests die loadConfig() benötigen werden übersprungen
 * wenn keine Config-Dateien vorhanden sind (z.B. in CI).
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ============================================================================
// Config Detection - Skip tests if config not available
// ============================================================================

const CONFIG_DIR = process.env.CONFIG_DIR || 'config-local';
const configPath = resolve(process.cwd(), CONFIG_DIR, 'manifest.yaml');
const hasConfig = existsSync(configPath);

// Helper to conditionally run tests
const describeIfConfig = hasConfig ? describe : describe.skip;

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Helper um API-Handler Logik direkt zu testen.
 * (Ohne echten HTTP-Server zu starten)
 */

describeIfConfig('Search API Logic', () => {
  let searchItems: typeof import('../src/server/data.js').searchItems;
  let loadConfig: typeof import('../src/server/config.js').loadConfig;
  let validateQuery: typeof import('../src/core/security.js').validateQuery;
  let validatePerspectives: typeof import('../src/core/security.js').validatePerspectives;
  let configLoaded = false;

  beforeAll(async () => {
    if (!hasConfig) return; // Skip if no config
    
    try {
      const dataModule = await import('../src/server/data.js');
      const configModule = await import('../src/server/config.js');
      const securityModule = await import('../src/core/security.js');
      
      searchItems = dataModule.searchItems;
      loadConfig = configModule.loadConfig;
      validateQuery = securityModule.validateQuery;
      validatePerspectives = securityModule.validatePerspectives;
      
      await loadConfig();
      configLoaded = true;
    } catch (e) {
      console.warn('[Test] Config loading failed, tests will be skipped');
    }
  });

  describe('Query Validation', () => {
    it('validiert und normalisiert Suchanfragen', () => {
      // Leere Queries
      expect(validateQuery('')).toBe('');
      expect(validateQuery(null)).toBe('');
      
      // Kurze Queries werden durchgelassen (min-length wird in Search selbst geprüft)
      expect(validateQuery('ab')).toBe('ab');
      
      // Valide Queries
      expect(validateQuery('psilocybe')).toBe('psilocybe');
      expect(validateQuery('  spaced  ')).toBe('spaced'); // Trimmed
      
      // XSS Attempts werden escaped
      const dangerous = validateQuery('<script>alert(1)</script>');
      expect(dangerous).not.toContain('<script');
    });

    it('limitiert Query-Länge', () => {
      const longQuery = 'a'.repeat(300);
      const validated = validateQuery(longQuery);
      // Sollte gekürzt werden (max 200)
      expect(validated.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Perspective Validation', () => {
    it('parst Perspektiven-Liste', () => {
      expect(validatePerspectives(null)).toEqual([]);
      expect(validatePerspectives('')).toEqual([]);
      
      const single = validatePerspectives('chemistry');
      expect(single).toContain('chemistry');
      
      const multiple = validatePerspectives('chemistry,ecology,identification');
      expect(multiple).toHaveLength(3);
      expect(multiple).toContain('chemistry');
      expect(multiple).toContain('ecology');
    });

    it('blockt ungültige Perspektiven', () => {
      // Path traversal
      const malicious = validatePerspectives('../../../etc/passwd');
      expect(malicious).toHaveLength(0);
      
      // Zu viele Perspektiven werden limitiert
      const tooMany = validatePerspectives('a,b,c,d,e,f,g,h,i,j,k,l,m');
      expect(tooMany.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Search Function', () => {
    it('durchsucht Items nach Query', async () => {
      const result = await searchItems({
        query: 'psilocybe',
        limit: 10
      });
      
      expect(result.items).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('filtert nach Perspektiven', async () => {
      const result = await searchItems({
        query: '',
        perspectives: ['chemistry'],
        limit: 10
      });
      
      // Items sollten chemistry-Perspektive haben
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('respektiert Pagination', async () => {
      const page1 = await searchItems({
        query: '',
        limit: 5,
        offset: 0
      });
      
      const page2 = await searchItems({
        query: '',
        limit: 5,
        offset: 5
      });
      
      // Wenn genug Items existieren, sollten Pages unterschiedlich sein
      if (page1.total > 5) {
        expect(page1.items[0]?.slug).not.toBe(page2.items[0]?.slug);
      }
    });
  });
});

describeIfConfig('Compare API Logic', () => {
  let getItems: typeof import('../src/server/data.js').getItems;
  let loadConfig: typeof import('../src/server/config.js').loadConfig;
  let validateSlugs: typeof import('../src/core/security.js').validateSlugs;

  beforeAll(async () => {
    if (!hasConfig) return; // Skip if no config
    
    try {
      const dataModule = await import('../src/server/data.js');
      const configModule = await import('../src/server/config.js');
      const securityModule = await import('../src/core/security.js');
      
      getItems = dataModule.getItems;
      loadConfig = configModule.loadConfig;
      validateSlugs = securityModule.validateSlugs;
      
      await loadConfig();
    } catch (e) {
      console.warn('[Test] Config loading failed, tests will be skipped');
    }
  });

  describe('Slug Validation', () => {
    it('validiert Item-Slugs', () => {
      const valid = validateSlugs(['psilocybe-cyanescens', 'amanita-muscaria']);
      expect(valid).toHaveLength(2);
      
      const invalid = validateSlugs(['../../../etc', 'valid-slug']);
      expect(invalid).toHaveLength(1);
      expect(invalid[0]).toBe('valid-slug');
    });

    it('limitiert Anzahl der Slugs', () => {
      const tooMany = validateSlugs(Array.from({ length: 20 }, (_, i) => `slug-${i}`));
      expect(tooMany.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Item Loading', () => {
    it('lädt Items nach Slugs', async () => {
      const items = await getItems(['psilocybe-cyanescens']);
      
      expect(Array.isArray(items)).toBe(true);
      // Item sollte geladen werden wenn es existiert
      if (items.length > 0) {
        expect(items[0].slug).toBe('psilocybe-cyanescens');
      }
    });

    it('handled fehlende Items graceful', async () => {
      const items = await getItems(['non-existent-item-xyz']);
      
      // Sollte nicht crashen, sondern leeres Array zurückgeben
      expect(Array.isArray(items)).toBe(true);
    });

    it('lädt mehrere Items für Vergleich', async () => {
      const items = await getItems([
        'psilocybe-cyanescens',
        'psilocybe-cubensis'
      ]);
      
      expect(Array.isArray(items)).toBe(true);
      // Erwartet 0-2 Items je nach Datenbestand
    });
  });
});

describe('Morph Rendering für API', () => {
  let renderValue: typeof import('../src/morphs/index.js').renderValue;
  let renderCompare: typeof import('../src/morphs/index.js').renderCompare;

  beforeAll(async () => {
    const morphsModule = await import('../src/morphs/index.js');
    renderValue = morphsModule.renderValue;
    renderCompare = morphsModule.renderCompare;
  });

  describe('Grid Context Rendering', () => {
    it('rendert im Grid-Modus (compact)', () => {
      const gridContext = {
        mode: 'grid' as const,
        itemCount: 1,
        compact: true
      };
      
      const html = renderValue('Test Value', 'name', gridContext);
      
      expect(html).toContain('amorph-field');
      expect(html).toContain('Test Value');
    });

    it('rendert komplexe Daten für Grid', () => {
      const gridContext = {
        mode: 'grid' as const,
        itemCount: 1,
        compact: true
      };
      
      const badgeData = { status: 'Active', variant: 'success' };
      const html = renderValue(badgeData, 'status', gridContext);
      
      expect(html).toContain('Active');
      expect(html).toContain('badge');
    });
  });

  describe('Compare Rendering', () => {
    it('rendert Vergleich zwischen Items', () => {
      const items = [
        { id: '1', slug: 'item-1', name: 'Item 1', value: 100 },
        { id: '2', slug: 'item-2', name: 'Item 2', value: 200 }
      ];
      
      const context = {
        mode: 'compare' as const,
        itemCount: 2,
        colors: ['#0df', '#f0d']
      };
      
      const html = renderCompare(items, context);
      
      expect(html).toContain('100');
      expect(html).toContain('200');
    });

    it('handled fehlende Werte im Vergleich', () => {
      const items = [
        { id: '1', slug: 'item-1', name: 'Item 1', value: 100 },
        { id: '2', slug: 'item-2', name: 'Item 2' } // Kein value
      ];
      
      const context = {
        mode: 'compare' as const,
        itemCount: 2,
        colors: ['#0df', '#f0d']
      };
      
      // Sollte nicht crashen
      const html = renderCompare(items, context);
      expect(html).toBeDefined();
    });
  });
});

describe('Security Headers', () => {
  let addSecurityHeaders: typeof import('../src/core/security.js').addSecurityHeaders;
  let checkRateLimit: typeof import('../src/core/security.js').checkRateLimit;

  beforeAll(async () => {
    const securityModule = await import('../src/core/security.js');
    addSecurityHeaders = securityModule.addSecurityHeaders;
    checkRateLimit = securityModule.checkRateLimit;
  });

  describe('Rate Limiting', () => {
    it('erlaubt normale Anfragen', () => {
      const result = checkRateLimit('test-ip-1');
      expect(result.allowed).toBe(true);
    });

    it('limitiert zu viele Anfragen', () => {
      const testIp = `rate-limit-test-${Date.now()}`;
      
      // Simuliere viele Anfragen
      let blocked = false;
      for (let i = 0; i < 200; i++) {
        const result = checkRateLimit(testIp);
        if (!result.allowed) {
          blocked = true;
          break;
        }
      }
      
      // Nach vielen Anfragen sollte limitiert werden
      expect(blocked).toBe(true);
    });
  });

  describe('Response Headers', () => {
    it('fügt Security Headers hinzu', () => {
      const headers = new Headers();
      addSecurityHeaders(headers);
      
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headers.get('X-Frame-Options')).toBeDefined();
    });
  });
});

describeIfConfig('Lazy Loading für Perspektiven', () => {
  let loadPerspective: typeof import('../src/server/data.js').loadPerspective;
  let loadPerspectives: typeof import('../src/server/data.js').loadPerspectives;
  let hasPerspective: typeof import('../src/server/data.js').hasPerspective;
  let loadConfig: typeof import('../src/server/config.js').loadConfig;

  beforeAll(async () => {
    if (!hasConfig) return; // Skip if no config
    
    try {
      const dataModule = await import('../src/server/data.js');
      const configModule = await import('../src/server/config.js');
      
      loadPerspective = dataModule.loadPerspective;
      loadPerspectives = dataModule.loadPerspectives;
      hasPerspective = dataModule.hasPerspective;
      loadConfig = configModule.loadConfig;
      
      await loadConfig();
    } catch (e) {
      console.warn('[Test] Config loading failed, tests will be skipped');
    }
  });

  describe('loadPerspective', () => {
    it('lädt einzelne Perspektive für existierendes Item', async () => {
      const data = await loadPerspective('psilocybe-cyanescens', 'chemistry');
      
      // Falls Item/Perspektive existiert
      if (data) {
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
      }
    });

    it('gibt null für nicht-existierende Perspektive', async () => {
      const data = await loadPerspective('psilocybe-cyanescens', 'non-existent-perspective');
      expect(data).toBeNull();
    });

    it('gibt null für nicht-existierendes Item', async () => {
      const data = await loadPerspective('non-existent-item', 'chemistry');
      expect(data).toBeNull();
    });

    it('cached geladene Perspektiven', async () => {
      // Lade zweimal - zweiter Aufruf sollte gecachte Version sein
      const data1 = await loadPerspective('psilocybe-cyanescens', 'ecology');
      const data2 = await loadPerspective('psilocybe-cyanescens', 'ecology');
      
      // Beide sollten identisch sein (same reference wenn gecached)
      expect(data1).toEqual(data2);
    });
  });

  describe('loadPerspectives', () => {
    it('lädt mehrere Perspektiven in einem Batch', async () => {
      const perspMap = await loadPerspectives('psilocybe-cyanescens', ['chemistry', 'ecology']);
      
      expect(perspMap).toBeInstanceOf(Map);
    });

    it('ignoriert nicht-existierende Perspektiven graceful', async () => {
      const perspMap = await loadPerspectives('psilocybe-cyanescens', [
        'chemistry',
        'non-existent-1',
        'non-existent-2'
      ]);
      
      // Sollte nur existierende Perspektiven enthalten
      expect(perspMap).toBeInstanceOf(Map);
      expect(perspMap.has('non-existent-1')).toBe(false);
    });
  });

  describe('hasPerspective', () => {
    it('prüft ob Perspektive existiert ohne zu laden', async () => {
      const exists = await hasPerspective('psilocybe-cyanescens', 'chemistry');
      
      // Boolean zurückgeben, nicht crashen
      expect(typeof exists).toBe('boolean');
    });

    it('gibt false für nicht-existierende Perspektive', async () => {
      const exists = await hasPerspective('psilocybe-cyanescens', 'totally-fake-perspective');
      expect(exists).toBe(false);
    });
  });
});
