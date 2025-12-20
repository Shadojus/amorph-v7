/**
 * Number Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { number } from '../../src/morphs/primitives/number.js';
import { singleContext, compareContext, createCompareContextWithValues } from './_setup.js';

describe('number morph', () => {
  it('should format numbers with German locale', () => {
    const html = number(1234.56, singleContext);
    expect(html).toContain('morph-number');
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

describe('number compare', () => {
  it('should render bar visualization with names', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('morph-number-compare');
    expect(html).toContain('number-bars');
    expect(html).toContain('Steinpilz');
    expect(html).toContain('Fliegenpilz');
  });

  it('should show average line', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('number-avg-line');
  });

  it('should highlight min and max', () => {
    const ctx = createCompareContextWithValues('value', [200, 10]);
    const html = number(null, ctx);
    expect(html).toContain('number-max');
    expect(html).toContain('number-min');
  });

  it('should show statistics', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('number-stats');
    expect(html).toContain('Ø'); // Average
    expect(html).toContain('Min');
    expect(html).toContain('Max');
    expect(html).toContain('Δ'); // Difference
  });

  it('should show scale with min and max', () => {
    const ctx = createCompareContextWithValues('value', [10, 90]);
    const html = number(null, ctx);
    expect(html).toContain('number-scale');
  });
});
