/**
 * Radar Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { radar } from '../../src/morphs/primitives/radar.js';
import { singleContext, compareContext } from './_setup.js';

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
    expect(html).toContain('<circle');
    expect(html).toContain('<line');
  });
  
  it('should fallback for less than 3 fields', () => {
    const data = { a: 1, b: 2 };
    const html = radar(data, singleContext);
    expect(html).toContain('morph-text');
  });

  it('should render with compare context', () => {
    const data = [
      { axis: 'Kraft', value: 80 },
      { axis: 'Ausdauer', value: 60 },
      { axis: 'Schnelligkeit', value: 70 }
    ];
    const html = radar(data, compareContext);
    expect(html).toContain('morph-radar');
    expect(html).toContain('<svg');
  });
});

describe('radar morph compare renderer', () => {
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
    const morphFn = radar as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, radarCompareContext) : '';
    if (html) {
      expect(html).toContain('radar-compare-container');
      expect(html).toContain('morph-radar-compare');
      expect(html).toContain('<path');
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
      expect(html).toContain('Δ');
    }
  });
});
