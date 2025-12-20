/**
 * Sparkline Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { sparkline } from '../../src/morphs/primitives/sparkline.js';
import { singleContext, compareContext, createCompareContextWithValues } from './_setup.js';

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

  it('should render with compare context', () => {
    const html = sparkline([10, 20, 30, 40, 50], compareContext);
    expect(html).toContain('morph-sparkline');
    expect(html).toContain('<svg');
  });
});

describe('sparkline compare', () => {
  it('should overlay multiple lines', () => {
    const ctx = createCompareContextWithValues('trend', [
      [10, 20, 30, 40],
      [15, 25, 35, 45]
    ]);
    const html = sparkline(null, ctx);
    expect(html).toContain('morph-sparkline-compare');
    expect(html).toContain('sparkline-overlay');
    // Should have 2 polylines
    expect((html.match(/<polyline/g) || []).length).toBe(2);
  });

  it('should show grid lines', () => {
    const ctx = createCompareContextWithValues('trend', [
      [10, 50, 90],
      [20, 60, 80]
    ]);
    const html = sparkline(null, ctx);
    expect(html).toContain('sparkline-grid');
  });

  it('should show legend with averages', () => {
    const ctx = createCompareContextWithValues('trend', [
      [10, 20, 30],
      [20, 30, 40]
    ]);
    const html = sparkline(null, ctx);
    expect(html).toContain('sparkline-legend');
    expect(html).toContain('Steinpilz');
    expect(html).toContain('Fliegenpilz');
    expect(html).toContain('legend-avg');
  });

  it('should show scale', () => {
    const ctx = createCompareContextWithValues('trend', [
      [0, 100],
      [25, 75]
    ]);
    const html = sparkline(null, ctx);
    expect(html).toContain('sparkline-scale');
  });
});
