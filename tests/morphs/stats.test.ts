/**
 * Stats Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { stats } from '../../src/morphs/primitives/stats.js';
import { singleContext, compareContext, createCompareContextWithValues } from './_setup.js';

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

  it('should render with compare context', () => {
    const html = stats({ min: 5, avg: 15, max: 30 }, compareContext);
    expect(html).toContain('morph-stats');
  });
});

describe('stats compare', () => {
  it('should render table with all keys', () => {
    const ctx = createCompareContextWithValues('metrics', [
      { size: 10, weight: 50 },
      { size: 15, weight: 30 }
    ]);
    const html = stats(null, ctx);
    expect(html).toContain('morph-stats-compare');
    expect(html).toContain('stats-table');
    expect(html).toContain('size');
    expect(html).toContain('weight');
  });

  it('should highlight max and min values', () => {
    const ctx = createCompareContextWithValues('metrics', [
      { score: 100 },
      { score: 50 }
    ]);
    const html = stats(null, ctx);
    expect(html).toContain('stats-max');
    expect(html).toContain('stats-min');
  });

  it('should show avg and diff for numeric values', () => {
    const ctx = createCompareContextWithValues('metrics', [
      { num: 20 },
      { num: 10 }
    ]);
    const html = stats(null, ctx);
    expect(html).toContain('Ø'); // Average
    expect(html).toContain('Δ'); // Difference
  });
});
