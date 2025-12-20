/**
 * AMORPH v7 - Structure-Based Detection Tests
 * 
 * Tests für das datengetriebene Typ-Erkennungssystem.
 * Basiert auf Blueprint-Strukturen in config/schema/perspektiven/blueprints/
 */

import { describe, it, expect } from 'vitest';
import { detectType, getBadgeVariant } from '../src/core/detection.js';

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Primitive Detection', () => {
  describe('null/undefined', () => {
    it('should detect null as text', () => {
      expect(detectType(null)).toBe('text');
    });

    it('should detect undefined as text', () => {
      expect(detectType(undefined)).toBe('text');
    });
  });

  describe('boolean', () => {
    it('should detect true as boolean', () => {
      expect(detectType(true)).toBe('boolean');
    });

    it('should detect false as boolean', () => {
      expect(detectType(false)).toBe('boolean');
    });
  });

  describe('number', () => {
    it('should detect integers as number', () => {
      expect(detectType(42)).toBe('number');
    });

    it('should detect floats as number', () => {
      expect(detectType(3.14)).toBe('number');
    });

    it('should detect negative numbers as number', () => {
      expect(detectType(-10)).toBe('number');
    });

    it('should detect zero as number', () => {
      expect(detectType(0)).toBe('number');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRING TYPES
// Blueprint: text="", tag=""(≤20), image=URL, link=URL, date=ISO
// ═══════════════════════════════════════════════════════════════════════════════

describe('String Detection', () => {
  describe('text', () => {
    it('should detect long strings as text', () => {
      expect(detectType('This is a longer description text')).toBe('text');
    });

    it('should detect empty string as text', () => {
      expect(detectType('')).toBe('text');
    });

    it('should detect multiline strings as text', () => {
      expect(detectType('Line 1\nLine 2')).toBe('text');
    });
  });

  describe('tag (≤20 chars)', () => {
    it('should detect short strings as tag', () => {
      expect(detectType('essbar')).toBe('tag');
    });

    it('should detect 20-char strings as tag', () => {
      expect(detectType('12345678901234567890')).toBe('tag');
    });

    it('should detect 21-char strings as text', () => {
      expect(detectType('123456789012345678901')).toBe('text');
    });
  });

  describe('image (URL with image extension)', () => {
    it('should detect .jpg URLs as image', () => {
      expect(detectType('/images/photo.jpg')).toBe('image');
    });

    it('should detect .png URLs as image', () => {
      expect(detectType('https://example.com/pic.png')).toBe('image');
    });

    it('should detect .webp URLs as image', () => {
      expect(detectType('/assets/hero.webp')).toBe('image');
    });

    it('should detect .svg URLs as image', () => {
      expect(detectType('/icons/logo.svg')).toBe('image');
    });

    it('should detect URLs with query params as image', () => {
      expect(detectType('/images/photo.jpg?w=200')).toBe('image');
    });

    it('should detect /images/ paths as image', () => {
      expect(detectType('/images/fungi/boletus.webp')).toBe('image');
    });
  });

  describe('link (http/https URLs)', () => {
    it('should detect https URLs as link', () => {
      expect(detectType('https://example.com')).toBe('link');
    });

    it('should detect http URLs as link', () => {
      expect(detectType('http://test.org/page')).toBe('link');
    });

    it('should NOT detect image URLs as link', () => {
      expect(detectType('https://example.com/photo.jpg')).toBe('image');
    });
  });

  describe('date (ISO format)', () => {
    it('should detect ISO dates as date', () => {
      expect(detectType('2024-12-20')).toBe('date');
    });

    it('should detect ISO datetime as date', () => {
      expect(detectType('2024-12-20T10:30:00')).toBe('date');
    });

    it('should detect German dates as date', () => {
      expect(detectType('20.12.2024')).toBe('date');
    });

    it('should detect German dates with month name as date', () => {
      expect(detectType('1. Mai 2016')).toBe('date');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY TYPES
// Blueprint: sparkline=[0], list=[""], tag=["short"], bar=[{label,value}], etc.
// ═══════════════════════════════════════════════════════════════════════════════

describe('Array Detection', () => {
  describe('sparkline (array of numbers)', () => {
    it('should detect number arrays as sparkline', () => {
      expect(detectType([1, 2, 3, 4, 5])).toBe('sparkline');
    });

    it('should detect float arrays as sparkline', () => {
      expect(detectType([0.5, 1.2, 0.8, 1.5])).toBe('sparkline');
    });
  });

  describe('tag (array of short strings)', () => {
    it('should detect short string arrays as tag', () => {
      expect(detectType(['essbar', 'häufig', 'Herbst'])).toBe('tag');
    });

    it('should detect single-item short arrays as tag', () => {
      expect(detectType(['edible'])).toBe('tag');
    });
  });

  describe('list (array of strings or mixed)', () => {
    it('should detect long string arrays as list', () => {
      expect(detectType(['This is a long description', 'Another long text'])).toBe('list');
    });

    it('should detect empty arrays as list', () => {
      expect(detectType([])).toBe('list');
    });
  });

  describe('bar [{label, value}]', () => {
    it('should detect label/value arrays as bar', () => {
      expect(detectType([
        { label: 'Protein', value: 25 },
        { label: 'Fat', value: 10 }
      ])).toBe('bar');
    });
  });

  describe('radar [{axis, value}]', () => {
    it('should detect axis/value arrays as radar', () => {
      expect(detectType([
        { axis: 'Psilocybin', value: 95 },
        { axis: 'Psilocin', value: 35 },
        { axis: 'Baeocystin', value: 15 }
      ])).toBe('radar');
    });
  });

  describe('timeline [{date, event}]', () => {
    it('should detect date/event arrays as timeline', () => {
      expect(detectType([
        { date: '2024-01', event: 'Sporen bilden' },
        { date: '2024-06', event: 'Wachstum' }
      ])).toBe('timeline');
    });
  });

  describe('steps [{step, label, status}]', () => {
    it('should detect step/label arrays as timeline', () => {
      expect(detectType([
        { step: 1, label: 'Kochen', status: 'done' },
        { step: 2, label: 'Servieren', status: 'pending' }
      ])).toBe('timeline');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECT TYPES
// Blueprint: badge={status,variant}, rating={rating,max}, progress={value,max}, etc.
// ═══════════════════════════════════════════════════════════════════════════════

describe('Object Detection', () => {
  describe('badge {status, variant}', () => {
    it('should detect status/variant objects as badge', () => {
      expect(detectType({ status: 'Least Concern', variant: 'success' })).toBe('badge');
    });

    it('should detect empty badge structure as badge', () => {
      expect(detectType({ status: '', variant: '' })).toBe('badge');
    });
  });

  describe('rating {rating, max}', () => {
    it('should detect rating/max objects as rating', () => {
      expect(detectType({ rating: 8, max: 10 })).toBe('rating');
    });

    it('should detect rating-only objects as rating', () => {
      expect(detectType({ rating: 4.5 })).toBe('rating');
    });
  });

  describe('progress {value, max}', () => {
    it('should detect value/max objects as progress', () => {
      expect(detectType({ value: 75, max: 100 })).toBe('progress');
    });

    it('should detect progress with unit as progress', () => {
      expect(detectType({ value: 50, max: 100, unit: '%' })).toBe('progress');
    });
  });

  describe('gauge {value, max, zones}', () => {
    it('should detect gauge structure as progress', () => {
      expect(detectType({
        value: 7.2,
        min: 0,
        max: 14,
        zones: [
          { start: 0, end: 6, color: 'red' },
          { start: 6, end: 8, color: 'green' }
        ]
      })).toBe('progress');
    });
  });

  describe('range {min, max}', () => {
    it('should detect min/max objects as range', () => {
      expect(detectType({ min: 800, max: 3200 })).toBe('range');
    });

    it('should detect range with unit as range', () => {
      expect(detectType({ min: 15, max: 25, unit: '°C' })).toBe('range');
    });

    it('should detect German von/bis as range', () => {
      expect(detectType({ von: 5, bis: 20 })).toBe('range');
    });
  });

  describe('stats {min, max, avg}', () => {
    it('should detect min/max/avg objects as stats', () => {
      expect(detectType({ min: 5, max: 30, avg: 15 })).toBe('stats');
    });

    it('should detect full stats structure as stats', () => {
      expect(detectType({ total: 100, count: 10, min: 5, max: 15, avg: 10 })).toBe('stats');
    });
  });

  describe('radar from object (3+ numeric keys)', () => {
    it('should detect objects with 3+ numeric values as radar', () => {
      expect(detectType({ kraft: 80, ausdauer: 60, geschwindigkeit: 70 })).toBe('radar');
    });

    it('should NOT detect objects with <3 numeric values as radar', () => {
      expect(detectType({ a: 1, b: 2 })).toBe('object');
    });
  });

  describe('object (generic fallback)', () => {
    it('should detect unknown structures as object', () => {
      expect(detectType({ foo: 'bar', baz: 123 })).toBe('object');
    });

    it('should detect empty objects as object', () => {
      expect(detectType({})).toBe('object');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE VARIANT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('getBadgeVariant', () => {
  describe('success variants', () => {
    it('should detect "edible" as success', () => {
      expect(getBadgeVariant('edible')).toBe('success');
    });

    it('should detect "essbar" as success', () => {
      expect(getBadgeVariant('essbar')).toBe('success');
    });

    it('should detect "Least Concern" as success', () => {
      expect(getBadgeVariant('Least Concern')).toBe('success');
    });

    it('should detect "LC" as success', () => {
      expect(getBadgeVariant('LC')).toBe('success');
    });
  });

  describe('danger variants', () => {
    it('should detect "toxic" as danger', () => {
      expect(getBadgeVariant('toxic')).toBe('danger');
    });

    it('should detect "giftig" as danger', () => {
      expect(getBadgeVariant('giftig')).toBe('danger');
    });

    it('should detect "Critically Endangered" as danger', () => {
      expect(getBadgeVariant('Critically Endangered')).toBe('danger');
    });
  });

  describe('warning variants', () => {
    it('should detect "caution" as warning', () => {
      expect(getBadgeVariant('caution')).toBe('warning');
    });

    it('should detect "Vulnerable" as warning', () => {
      expect(getBadgeVariant('Vulnerable')).toBe('warning');
    });
  });

  describe('muted variants', () => {
    it('should detect "unknown" as muted', () => {
      expect(getBadgeVariant('unknown')).toBe('muted');
    });

    it('should detect "Data Deficient" as muted', () => {
      expect(getBadgeVariant('Data Deficient')).toBe('muted');
    });
  });

  describe('default fallback', () => {
    it('should return default for unknown values', () => {
      expect(getBadgeVariant('something random')).toBe('default');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REAL-WORLD BLUEPRINT STRUCTURES
// Testing actual data structures from chemistry.blueprint.yaml, etc.
// ═══════════════════════════════════════════════════════════════════════════════

describe('Real Blueprint Structures', () => {
  describe('chemistry.blueprint.yaml', () => {
    it('alkaloid_content_by_part should be bar', () => {
      expect(detectType([
        { label: 'Hut (Pileus)', value: 1.68 },
        { label: 'Stiel (Stipe)', value: 0.75 },
        { label: 'Gesamter Fruchtkörper', value: 1.2 }
      ])).toBe('bar');
    });

    it('sample_type (badge structure) should be badge', () => {
      expect(detectType({
        status: 'fruiting_body',
        variant: 'info'
      })).toBe('badge');
    });

    it('sample_storage_duration (range) should be range', () => {
      expect(detectType({
        min: 0,
        max: 365,
        unit: 'days'
      })).toBe('range');
    });

    it('sample_dry_mass_percent (progress) should be progress', () => {
      expect(detectType({
        value: 85,
        max: 100
      })).toBe('progress');
    });

    it('sample_quality_score (rating) should be rating', () => {
      expect(detectType({
        rating: 8,
        max: 10
      })).toBe('rating');
    });
  });

  describe('ecology.blueprint.yaml', () => {
    it('trophic_flexibility (badge) should be badge', () => {
      expect(detectType({
        status: 'high',
        variant: 'success'
      })).toBe('badge');
    });

    it('enzyme_laccase_activity (gauge) should be progress', () => {
      expect(detectType({
        value: 75,
        min: 0,
        max: 100,
        unit: '%'
      })).toBe('progress');
    });

    it('secondary_ecosystem_functions (list) should be tag or list', () => {
      expect(detectType(['Decomposition', 'Mycorrhiza'])).toBe('tag');
    });
  });

  describe('culinary.blueprint.yaml', () => {
    it('sensory (radar with axis/value) should be radar', () => {
      expect(detectType([
        { axis: 'Umami', value: 80 },
        { axis: 'Sweetness', value: 20 },
        { axis: 'Bitterness', value: 10 },
        { axis: 'Earthiness', value: 60 },
        { axis: 'Nuttiness', value: 40 }
      ])).toBe('radar');
    });

    it('edibility_status (badge) should be badge', () => {
      expect(detectType({
        status: 'choice_edible',
        variant: 'success'
      })).toBe('badge');
    });

    it('edibility_rating (rating) should be rating', () => {
      expect(detectType({
        rating: 9,
        max: 10
      })).toBe('rating');
    });

    it('edibility_steps (steps) should be timeline', () => {
      expect(detectType([
        { step: 1, label: 'Thoroughly cook', status: 'pending' },
        { step: 2, label: 'Remove tough parts', status: 'pending' }
      ])).toBe('timeline');
    });
  });

  describe('conservation.blueprint.yaml', () => {
    it('iucn_status should be badge', () => {
      expect(detectType({
        status: 'Least Concern',
        variant: 'success'
      })).toBe('badge');
    });

    it('population_trend (sparkline) should be sparkline', () => {
      expect(detectType([100, 95, 92, 88, 85, 82])).toBe('sparkline');
    });
  });

  describe('temporal.blueprint.yaml', () => {
    it('lifecycle events should be timeline', () => {
      expect(detectType([
        { date: '2024-03', event: 'Spore germination' },
        { date: '2024-06', event: 'Mycelium growth' },
        { date: '2024-09', event: 'Fruiting body formation' }
      ])).toBe('timeline');
    });
  });
});
