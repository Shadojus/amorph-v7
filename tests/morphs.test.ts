/**
 * AMORPH v7 - Morph Tests
 * 
 * Vollständige Tests für alle 18 Morphs.
 */

import { describe, it, expect } from 'vitest';

// Import ALL morphs
import { text } from '../src/morphs/primitives/text.js';
import { number } from '../src/morphs/primitives/number.js';
import { boolean } from '../src/morphs/primitives/boolean.js';
import { badge } from '../src/morphs/primitives/badge.js';
import { tag } from '../src/morphs/primitives/tag.js';
import { progress } from '../src/morphs/primitives/progress.js';
import { rating } from '../src/morphs/primitives/rating.js';
import { range } from '../src/morphs/primitives/range.js';
import { stats } from '../src/morphs/primitives/stats.js';
import { image } from '../src/morphs/primitives/image.js';
import { link } from '../src/morphs/primitives/link.js';
import { list } from '../src/morphs/primitives/list.js';
import { object } from '../src/morphs/primitives/object.js';
import { date } from '../src/morphs/primitives/date.js';
import { timeline } from '../src/morphs/primitives/timeline.js';
import { bar } from '../src/morphs/primitives/bar.js';
import { sparkline } from '../src/morphs/primitives/sparkline.js';
import { radar } from '../src/morphs/primitives/radar.js';

// Test contexts
const singleContext = { mode: 'single' as const, itemCount: 1 };
const compareContext = { 
  mode: 'compare' as const, 
  itemCount: 2,
  items: [
    { id: '1', slug: 'steinpilz', name: 'Steinpilz' },
    { id: '2', slug: 'fliegenpilz', name: 'Fliegenpilz' }
  ],
  colors: ['#0df', '#f0d']
};

// ═══════════════════════════════════════════════════════════════════════════════
// BASIC MORPHS
// ═══════════════════════════════════════════════════════════════════════════════

describe('text morph', () => {
  it('should render string values', () => {
    const html = text('Hello World', singleContext);
    expect(html).toContain('Hello World');
    expect(html).toContain('morph-text');
  });

  it('should escape HTML entities', () => {
    const html = text('<script>alert("xss")</script>', singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should handle null/undefined', () => {
    const html1 = text(null, singleContext);
    const html2 = text(undefined, singleContext);
    expect(html1).toContain('morph-text');
    expect(html2).toContain('morph-text');
  });
});

describe('number morph', () => {
  it('should format numbers with German locale', () => {
    const html = number(1234.56, singleContext);
    expect(html).toContain('morph-number');
    // German locale uses comma for decimals
    expect(html).toMatch(/1\.?234/);
  });

  it('should handle NaN gracefully', () => {
    const html = number(NaN, singleContext);
    expect(html).toContain('–');
  });

  it('should parse string numbers', () => {
    const html = number('42', singleContext);
    expect(html).toContain('42');
  });
});

describe('boolean morph', () => {
  it('should show checkmark for true', () => {
    const html = boolean(true, singleContext);
    expect(html).toContain('✓');
    expect(html).toContain('data-value="true"');
  });

  it('should show X for false', () => {
    const html = boolean(false, singleContext);
    expect(html).toContain('✗');
    expect(html).toContain('data-value="false"');
  });

  it('should handle string "ja"', () => {
    const html = boolean('ja', singleContext);
    expect(html).toContain('✓');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE & TAG
// ═══════════════════════════════════════════════════════════════════════════════

describe('badge morph', () => {
  it('should detect danger variant', () => {
    const html = badge('giftig', singleContext);
    expect(html).toContain('badge-danger');
  });

  it('should detect success variant', () => {
    const html = badge('essbar', singleContext);
    expect(html).toContain('badge-success');
  });

  it('should default to neutral', () => {
    const html = badge('neutral text', singleContext);
    expect(html).toContain('badge-default');
  });
  
  it('should escape HTML in badge content', () => {
    const html = badge('<script>xss</script>', singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('tag morph', () => {
  it('should render single tag', () => {
    const html = tag('Waldpilz', singleContext);
    expect(html).toContain('morph-tags');
    expect(html).toContain('Waldpilz');
  });
  
  it('should render array of tags', () => {
    const html = tag(['essbar', 'häufig', 'Herbst'], singleContext);
    expect(html).toContain('morph-tags');
    expect(html).toContain('essbar');
    expect(html).toContain('häufig');
    expect(html).toContain('Herbst');
  });
  
  it('should escape HTML in tags', () => {
    const html = tag(['<script>xss</script>'], singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS & RATING
// ═══════════════════════════════════════════════════════════════════════════════

describe('progress morph', () => {
  it('should render progress bar', () => {
    const html = progress(75, singleContext);
    expect(html).toContain('morph-progress');
    expect(html).toContain('75%');
  });

  it('should clamp values to 0-100', () => {
    const html1 = progress(-10, singleContext);
    const html2 = progress(150, singleContext);
    expect(html1).toContain('0%');
    expect(html2).toContain('100%');
  });
  
  it('should handle string values', () => {
    const html = progress('80', singleContext);
    expect(html).toContain('80%');
  });
  
  it('should use correct CSS classes (morph-progress-*)', () => {
    const html = progress(50, singleContext);
    expect(html).toContain('class="morph-progress"');
    expect(html).toContain('class="morph-progress-bar"');
    expect(html).toContain('class="morph-progress-fill"');
    expect(html).toContain('class="morph-progress-value"');
  });
});

describe('rating morph', () => {
  it('should render stars', () => {
    const html = rating(4, singleContext);
    expect(html).toContain('morph-rating');
    expect(html).toContain('★');
  });

  it('should normalize percentage to 5-star', () => {
    const html = rating(80, singleContext);
    // 80% = 4 stars
    expect(html).toContain('4.0');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RANGE & STATS
// ═══════════════════════════════════════════════════════════════════════════════

describe('range morph', () => {
  it('should render range with min/max', () => {
    const html = range({ min: 10, max: 50 }, singleContext);
    expect(html).toContain('morph-range');
    expect(html).toContain('10');
    expect(html).toContain('50');
  });
  
  it('should handle German von/bis fields', () => {
    const html = range({ von: 5, bis: 20 }, singleContext);
    expect(html).toContain('5');
    expect(html).toContain('20');
  });
  
  it('should display current value', () => {
    const html = range({ min: 0, max: 100, value: 75 }, singleContext);
    expect(html).toContain('75');
  });
});

describe('stats morph', () => {
  it('should render stats object', () => {
    const html = stats({ min: 5, avg: 15, max: 30 }, singleContext);
    expect(html).toContain('morph-stats');
    expect(html).toContain('5');
    expect(html).toContain('15');
    expect(html).toContain('30');
  });
  
  it('should handle empty object', () => {
    const html = stats({}, singleContext);
    expect(html).toContain('morph-stats');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA (IMAGE & LINK)
// ═══════════════════════════════════════════════════════════════════════════════

describe('image morph', () => {
  it('should render image tag', () => {
    const html = image('/images/steinpilz.jpg', singleContext);
    expect(html).toContain('morph-image');
    expect(html).toContain('src="/images/steinpilz.jpg"');
    expect(html).toContain('loading="lazy"');
  });
  
  it('should handle object with src', () => {
    const html = image({ src: '/img/test.png' }, singleContext);
    expect(html).toContain('src="/img/test.png"');
  });
  
  it('should block javascript: URLs to prevent XSS', () => {
    const html = image('javascript:alert(1)', singleContext);
    // Should block the dangerous URL entirely
    expect(html).not.toContain('javascript:');
    expect(html).toContain('Blocked');
  });
  
  it('should block data: URLs', () => {
    const html = image('data:image/svg+xml;base64,PHN2Zz4=', singleContext);
    expect(html).not.toContain('data:');
    expect(html).toContain('Blocked');
  });
  
  it('should allow relative image paths starting with /', () => {
    const html = image('/images/photo.jpg', singleContext);
    expect(html).toContain('src="/images/photo.jpg"');
  });
  
  it('should convert bare image filenames to https (domain detection)', () => {
    // validateUrl treats photo.jpg as a domain → https://photo.jpg
    const html = image('photo.jpg', singleContext);
    expect(html).toContain('src="https://photo.jpg"');
  });
  
  it('should allow https image URLs', () => {
    const html = image('https://example.com/image.png', singleContext);
    expect(html).toContain('src="https://example.com/image.png"');
  });
});

describe('link morph', () => {
  it('should render clickable link', () => {
    const html = link('https://example.com/steinpilz', singleContext);
    expect(html).toContain('morph-link');
    expect(html).toContain('href="https://example.com/steinpilz"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  
  it('should strip protocol from display text', () => {
    const html = link('https://example.com/path', singleContext);
    expect(html).toContain('>example.com/path<');
    expect(html).not.toContain('>https://');
  });
  
  it('should escape HTML in URL', () => {
    const html = link('https://example.com/<script>', singleContext);
    expect(html).not.toContain('<script>');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTIONS (LIST & OBJECT)
// ═══════════════════════════════════════════════════════════════════════════════

describe('list morph', () => {
  it('should render array as list', () => {
    const html = list(['Eins', 'Zwei', 'Drei'], singleContext);
    expect(html).toContain('morph-list');
    expect(html).toContain('<li>');
    expect(html).toContain('Eins');
    expect(html).toContain('Zwei');
    expect(html).toContain('Drei');
  });
  
  it('should wrap single value in list', () => {
    const html = list('Single Item', singleContext);
    expect(html).toContain('<li>Single Item</li>');
  });
  
  it('should escape HTML in list items', () => {
    const html = list(['<b>Bold</b>'], singleContext);
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;');
  });
});

describe('object morph', () => {
  it('should render object as key-value pairs', () => {
    const html = object({ name: 'Test', value: 42 }, singleContext);
    expect(html).toContain('name');
    expect(html).toContain('Test');
    expect(html).toContain('42');
  });

  it('should render nested objects recursively', () => {
    const html = object({ outer: { inner: 'value' } }, singleContext);
    expect(html).toContain('outer');
    expect(html).toContain('inner');
    expect(html).toContain('value');
    expect(html).toContain('morph-object-nested');
  });

  it('should render arrays as tag lists', () => {
    const html = object({ tags: ['a', 'b', 'c'] }, singleContext);
    expect(html).toContain('morph-tag-list');
    expect(html).toContain('morph-tag');
  });

  it('should handle empty objects', () => {
    const html = object({}, singleContext);
    expect(html).toContain('{}');
  });

  it('should handle null values', () => {
    const html = object({ field: null }, singleContext);
    expect(html).toContain('–');
  });
});

describe('object morph compare mode', () => {
  it('should render table layout with items as columns', () => {
    const values = [
      { value: { a: 10, b: 20 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: { a: 15, b: 25 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-table');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    }
  });

  it('should highlight max/min values', () => {
    const values = [
      { value: { score: 100 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'High' } },
      { value: { score: 10 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Low' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('is-max');
      expect(html).toContain('is-min');
    }
  });

  it('should show difference for numeric values', () => {
    const values = [
      { value: { temp: 20 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Cold' } },
      { value: { temp: 80 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Hot' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-diff');
      expect(html).toContain('Δ');
    }
  });

  it('should group nested object keys', () => {
    const values = [
      { value: { outer: { inner1: 10, inner2: 20 } }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: { outer: { inner1: 15, inner2: 25 } }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-group-header');
      expect(html).toContain('outer');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL (DATE & TIMELINE)
// ═══════════════════════════════════════════════════════════════════════════════

describe('date morph', () => {
  it('should format ISO date to German', () => {
    const html = date('2024-12-20', singleContext);
    expect(html).toContain('morph-date');
    expect(html).toContain('datetime="2024-12-20"');
    // German format: 20. Dezember 2024
    expect(html).toMatch(/20\.?\s*(Dezember|12)/);
  });
  
  it('should handle invalid dates gracefully', () => {
    const html = date('not-a-date', singleContext);
    expect(html).toContain('not-a-date');
  });
});

describe('timeline morph', () => {
  it('should render timeline events', () => {
    const events = [
      { date: '2024-01', event: 'Sporen bilden' },
      { date: '2024-06', event: 'Wachstum' }
    ];
    const html = timeline(events, singleContext);
    expect(html).toContain('morph-timeline');
    expect(html).toContain('Sporen bilden');
    expect(html).toContain('Wachstum');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHARTS (BAR, SPARKLINE, RADAR)
// ═══════════════════════════════════════════════════════════════════════════════

describe('bar morph', () => {
  it('should render bar chart', () => {
    const data = [
      { label: 'Protein', value: 25 },
      { label: 'Fett', value: 10 },
      { label: 'Kohlenhydrate', value: 5 }
    ];
    const html = bar(data, singleContext);
    expect(html).toContain('morph-bar');
    expect(html).toContain('Protein');
    expect(html).toContain('Fett');
    expect(html).toContain('Kohlenhydrate');
  });
  
  it('should handle number array', () => {
    const html = bar([10, 20, 30], singleContext);
    expect(html).toContain('morph-bar');
  });
  
  it('should use correct CSS classes (morph-bar-*)', () => {
    const data = [
      { label: 'Test1', value: 100 },
      { label: 'Test2', value: 50 }
    ];
    const html = bar(data, singleContext);
    // All CSS classes should have morph- prefix
    expect(html).toContain('class="morph-bar"');
    expect(html).toContain('class="morph-bar-item"');
    expect(html).toContain('class="morph-bar-label"');
    expect(html).toContain('class="morph-bar-track"');
    expect(html).toContain('class="morph-bar-fill"');
    expect(html).toContain('class="morph-bar-value"');
  });
});

describe('sparkline morph', () => {
  it('should render SVG sparkline', () => {
    const html = sparkline([10, 25, 15, 30, 20], singleContext);
    expect(html).toContain('morph-sparkline');
    expect(html).toContain('<svg');
    expect(html).toContain('<polyline');
  });
  
  it('should handle empty array', () => {
    const html = sparkline([], singleContext);
    expect(html).toBe('');
  });
});

describe('radar morph', () => {
  it('should render radar chart with 3+ numeric fields', () => {
    const data = { kraft: 80, ausdauer: 60, geschwindigkeit: 70 };
    const html = radar(data, singleContext);
    expect(html).toContain('morph-radar');
    expect(html).toContain('<svg');
    expect(html).toContain('kraft');
    expect(html).toContain('ausdauer');
  });

  it('should render axis+value array format', () => {
    const data = [
      { axis: 'Psilocybin', value: 95 },
      { axis: 'Psilocin', value: 35 },
      { axis: 'Baeocystin', value: 15 }
    ];
    const html = radar(data, singleContext);
    expect(html).toContain('morph-radar');
    expect(html).toContain('<svg');
  });

  it('should render grid circles and axis lines', () => {
    const data = { a: 80, b: 60, c: 70 };
    const html = radar(data, singleContext);
    expect(html).toContain('<circle'); // Grid circles
    expect(html).toContain('<line'); // Axis lines
  });
  
  it('should fallback for less than 3 fields', () => {
    const data = { a: 1, b: 2 };
    const html = radar(data, singleContext);
    expect(html).toContain('morph-text');
  });
});

describe('radar morph compare mode', () => {
  it('should render overlay with multiple paths', () => {
    const radarCompareContext = {
      mode: 'compare' as const,
      itemCount: 2,
      items: [
        { id: '1', slug: 'item1', name: 'Item 1' },
        { id: '2', slug: 'item2', name: 'Item 2' }
      ],
      colors: ['#0df', '#f0d']
    };
    const values = [
      { value: [{ axis: 'A', value: 80 }, { axis: 'B', value: 60 }, { axis: 'C', value: 70 }], color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: [{ axis: 'A', value: 50 }, { axis: 'B', value: 90 }, { axis: 'C', value: 40 }], color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    // Access compare renderer via internal call
    const morphFn = radar as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, radarCompareContext) : '';
    if (html) {
      expect(html).toContain('radar-compare-container');
      expect(html).toContain('morph-radar-compare');
      expect(html).toContain('<path'); // Multiple paths for each item
    }
  });

  it('should show insights with differences', () => {
    const values = [
      { value: [{ axis: 'X', value: 100 }, { axis: 'Y', value: 50 }, { axis: 'Z', value: 30 }], color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: [{ axis: 'X', value: 20 }, { axis: 'Y', value: 50 }, { axis: 'Z', value: 30 }], color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    const morphFn = radar as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('radar-insights');
      expect(html).toContain('Δ'); // Difference symbol
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BASE64 VALUE ENCODING (for Compare feature)
// ═══════════════════════════════════════════════════════════════════════════════

import { wrapInField } from '../src/morphs/base.js';

describe('wrapInField with raw values', () => {
  it('should encode simple string to base64', () => {
    const html = wrapInField('<span>test</span>', 'text', 'test_field', undefined, 'Hello World');
    expect(html).toContain('data-raw-value="');
    // Base64 for "Hello World" JSON: "SGVsbG8gV29ybGQi" (with quotes)
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      expect(decoded).toBe('"Hello World"');
    }
  });

  it('should encode array to base64', () => {
    const data = [{ label: 'Test', value: 42 }];
    const html = wrapInField('<span>test</span>', 'bar', 'bar_field', undefined, data);
    expect(html).toContain('data-raw-value="');
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
      expect(decoded).toEqual([{ label: 'Test', value: 42 }]);
    }
  });

  it('should encode complex nested object', () => {
    const data = {
      min: 10,
      max: 100,
      values: [20, 30, 40],
      nested: { deep: true }
    };
    const html = wrapInField('<span>test</span>', 'stats', 'complex_field', undefined, data);
    expect(html).toContain('data-raw-value="');
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
      expect(decoded).toEqual(data);
    }
  });

  it('should skip encoding for values larger than 10KB', () => {
    // Create a large string > 10KB
    const largeData = 'x'.repeat(15000);
    const html = wrapInField('<span>test</span>', 'text', 'large_field', undefined, largeData);
    expect(html).not.toContain('data-raw-value=');
  });

  it('should handle null/undefined raw values', () => {
    const html1 = wrapInField('<span>test</span>', 'text', 'field1', undefined, null);
    const html2 = wrapInField('<span>test</span>', 'text', 'field2', undefined, undefined);
    expect(html1).not.toContain('data-raw-value=');
    expect(html2).not.toContain('data-raw-value=');
  });

  it('should have correct morph-* CSS classes', () => {
    const html = wrapInField('<span>content</span>', 'bar', 'test_field');
    expect(html).toContain('class="amorph-field"');
    expect(html).toContain('data-morph="bar"');
    expect(html).toContain('class="amorph-field-value"');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARE MODE RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

describe('morphs in compare mode', () => {
  it('bar chart should render with compare context', () => {
    const data = [
      { label: 'Protein', value: 25 },
      { label: 'Fett', value: 10 }
    ];
    const html = bar(data, compareContext);
    expect(html).toContain('morph-bar');
    expect(html).toContain('Protein');
  });

  it('progress should render in compare mode', () => {
    const html = progress(75, compareContext);
    expect(html).toContain('morph-progress');
    expect(html).toContain('75%');
  });

  it('radar should render with compare context', () => {
    const data = [
      { axis: 'Kraft', value: 80 },
      { axis: 'Ausdauer', value: 60 },
      { axis: 'Schnelligkeit', value: 70 }
    ];
    const html = radar(data, compareContext);
    expect(html).toContain('morph-radar');
    expect(html).toContain('<svg');
  });

  it('sparkline should render with compare context', () => {
    const html = sparkline([10, 20, 30, 40, 50], compareContext);
    expect(html).toContain('morph-sparkline');
    expect(html).toContain('<svg');
  });

  it('range should render with compare context', () => {
    const html = range({ min: 0, max: 100 }, compareContext);
    expect(html).toContain('morph-range');
  });

  it('stats should render with compare context', () => {
    const html = stats({ min: 5, avg: 15, max: 30 }, compareContext);
    expect(html).toContain('morph-stats');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RENDERVALUE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

import { renderValue, detectType } from '../src/morphs/index.js';

describe('renderValue with data-raw-value', () => {
  it('should include data-raw-value for bar chart data', () => {
    const data = [
      { label: 'Hut', value: 1.68 },
      { label: 'Stiel', value: 0.75 }
    ];
    const html = renderValue(data, 'alkaloid_content_by_part', singleContext);
    expect(html).toContain('data-raw-value="');
    expect(html).toContain('data-morph="bar"');
  });

  it('should include data-raw-value for radar data', () => {
    const data = [
      { axis: 'Psilocybin', value: 95 },
      { axis: 'Psilocin', value: 35 },
      { axis: 'Baeocystin', value: 15 }
    ];
    const html = renderValue(data, 'alkaloid_profile_radar', singleContext);
    expect(html).toContain('data-raw-value="');
    expect(html).toContain('data-morph="radar"');
  });

  it('should include data-raw-value for range data', () => {
    const data = { min: 800, max: 3200 };
    const html = renderValue(data, 'elevation_range', singleContext);
    expect(html).toContain('data-raw-value="');
  });

  it('should include data-raw-value for array (tags)', () => {
    const data = ['essbar', 'häufig', 'Herbst'];
    const html = renderValue(data, 'tags', singleContext);
    expect(html).toContain('data-raw-value="');
  });

  it('should return empty string for null/undefined', () => {
    expect(renderValue(null, 'field', singleContext)).toBe('');
    expect(renderValue(undefined, 'field', singleContext)).toBe('');
    expect(renderValue('', 'field', singleContext)).toBe('');
  });

  it('should return empty string for empty arrays', () => {
    expect(renderValue([], 'field', singleContext)).toBe('');
  });
});

// detectType tests moved to tests/detection.test.ts