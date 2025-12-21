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
  it('should render bar visualization', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('number-compare-wrapper');
    expect(html).toContain('number-bars');
    expect(html).toContain('bar-row');
  });

  it('should show average line', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('bar-avg-line');
  });

  it('should show bar values', () => {
    const ctx = createCompareContextWithValues('value', [200, 10]);
    const html = number(null, ctx);
    expect(html).toContain('bar-val');
    expect(html).toContain('200');
    expect(html).toContain('10');
  });

  it('should show fill tracks', () => {
    const ctx = createCompareContextWithValues('value', [100, 50]);
    const html = number(null, ctx);
    expect(html).toContain('bar-fill-track');
    expect(html).toContain('bar-fill');
  });
});
