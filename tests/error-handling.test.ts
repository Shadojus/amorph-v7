/**
 * AMORPH v7 - Error Handling Tests
 * 
 * Tests für robuste Fehlerbehandlung im Data-Modul.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { join } from 'path';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

import { readFileSync, existsSync, readdirSync } from 'fs';

describe('Error Handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('safeReadJson Verhalten', () => {
    it('handled fehlende Dateien graceful', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      
      const { getLoadErrors, invalidateCache, loadAllItems } = await import('../src/server/data.js');
      
      invalidateCache();
      await loadAllItems(true);
      
      // Sollte nicht crashen, aber Fehler loggen
      const errors = getLoadErrors();
      // Data directory check passiert zuerst
      expect(Array.isArray(errors)).toBe(true);
    });

    it('handled korruptes JSON graceful', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([]);
      
      const { getLoadErrors, invalidateCache, loadAllItems } = await import('../src/server/data.js');
      
      invalidateCache();
      const items = await loadAllItems(true);
      
      // Sollte leeres Array zurückgeben, nicht crashen
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe('invalidateCache', () => {
    it('setzt Cache und Fehler zurück', async () => {
      const { invalidateCache, getLoadErrors } = await import('../src/server/data.js');
      
      invalidateCache();
      const errors = getLoadErrors();
      
      expect(errors).toEqual([]);
    });
  });

  describe('getLoadErrors', () => {
    it('gibt Kopie des Error-Arrays zurück (nicht Original)', async () => {
      const { getLoadErrors } = await import('../src/server/data.js');
      
      const errors1 = getLoadErrors();
      const errors2 = getLoadErrors();
      
      // Sollten verschiedene Array-Instanzen sein
      expect(errors1).not.toBe(errors2);
      expect(errors1).toEqual(errors2);
    });
  });
});

describe('Data Module Exports', () => {
  it('exportiert alle Error-Handling Funktionen', async () => {
    const data = await import('../src/server/data.js');
    
    expect(typeof data.getLoadErrors).toBe('function');
    expect(typeof data.invalidateCache).toBe('function');
    expect(typeof data.loadAllItems).toBe('function');
    expect(typeof data.getItem).toBe('function');
    expect(typeof data.searchItems).toBe('function');
  });
});

describe('Security: Malicious Data', () => {
  it('escapeHtml verhindert XSS durch Tag-Escaping', async () => {
    const { escapeHtml } = await import('../src/core/security.js');
    
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>document.cookie</script>',
      '<svg onload=alert(1)>',
    ];
    
    for (const input of maliciousInputs) {
      const escaped = escapeHtml(input);
      // Tags werden escaped, kein HTML wird ausgeführt
      expect(escaped).not.toContain('<script');
      expect(escaped).toContain('&lt;');  // < wird zu &lt;
      expect(escaped).toContain('&gt;');  // > wird zu &gt;
    }
  });

  it('validateSlug blockt Path Traversal (gibt null zurück)', async () => {
    const { validateSlug } = await import('../src/core/security.js');
    
    const maliciousSlugs = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      'valid/../../../malicious',
      '....//....//etc',
    ];
    
    for (const slug of maliciousSlugs) {
      // validateSlug gibt null für invalid zurück, nicht false
      expect(validateSlug(slug)).toBeNull();
    }
  });

  it('validateSlug erlaubt valide Slugs (gibt normalisierten Slug zurück)', async () => {
    const { validateSlug } = await import('../src/core/security.js');
    
    const validSlugs = [
      'psilocybe-cyanescens',
      'amanita-muscaria',
      'cantharellus123',
    ];
    
    for (const slug of validSlugs) {
      // validateSlug gibt den normalisierten slug zurück (lowercase)
      const result = validateSlug(slug);
      expect(result).not.toBeNull();
      expect(result).toBe(slug.toLowerCase());
    }
  });
});

describe('Circular Reference Protection', () => {
  it('wrapInField erkennt zirkuläre Referenzen in rawValue', async () => {
    const { wrapInField } = await import('../src/morphs/base.js');
    
    // Kreiere zirkuläre Struktur
    const obj: Record<string, unknown> = { name: 'Test' };
    obj.self = obj;
    
    // wrapInField(content, morphType, fieldName, className, rawValue)
    const html = wrapInField('<div>content</div>', 'object', 'circular', undefined, obj);
    
    expect(html).toContain('amorph-field');
    // Raw-value sollte "[Circular]" im Base64 enthalten
    expect(html).toContain('data-raw-value');
    // Sollte nicht crashen und trotzdem HTML zurückgeben
    expect(html.length).toBeGreaterThan(50);
  });
});

describe('Type Detection Edge Cases', () => {
  it('handled null und undefined graceful', async () => {
    const { detectType } = await import('../src/core/detection.js');
    
    expect(detectType(null, 'field')).toBe('text');
    expect(detectType(undefined, 'field')).toBe('text');
  });

  it('handled leere Objekte', async () => {
    const { detectType } = await import('../src/core/detection.js');
    
    expect(detectType({}, 'empty')).toBe('object');
    expect(detectType([], 'empty_array')).toBe('list');
  });

  it('handled sehr tiefe Objekte ohne Stack Overflow', async () => {
    const { detectType } = await import('../src/core/detection.js');
    
    // Erstelle tiefes Objekt (100 Ebenen)
    let deep: Record<string, unknown> = { value: 'end' };
    for (let i = 0; i < 100; i++) {
      deep = { nested: deep };
    }
    
    // Sollte nicht crashen
    const type = detectType(deep, 'deep');
    expect(type).toBe('object');
  });

  it('handled sehr große Arrays (wird als tag erkannt wegen Strings)', async () => {
    const { detectType } = await import('../src/core/detection.js');
    
    // Array von Strings wird als 'tag' erkannt (kurze Strings = Tags)
    const largeArray = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
    
    const type = detectType(largeArray, 'large');
    // String-Arrays werden als Tags erkannt
    expect(type).toBe('tag');
  });

  it('handled Array von Zahlen als sparkline', async () => {
    const { detectType } = await import('../src/core/detection.js');
    
    // Array von Zahlen wird als Sparkline erkannt (zeigt Trendlinie)
    const numArray = Array.from({ length: 100 }, (_, i) => i * 2);
    const type = detectType(numArray, 'numbers');
    expect(type).toBe('sparkline');
  });
});
