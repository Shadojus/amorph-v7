/**
 * Rating Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { rating } from '../../src/morphs/primitives/rating.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('rating morph', () => {
  it('should render stars', () => {
    const html = rating(4, singleContext);
    expect(html).toContain('morph-rating');
    expect(html).toContain('★');
  });

  it('should handle object format', () => {
    const html = rating({ rating: 7, max: 10 }, singleContext);
    expect(html).toContain('7/10');
    expect(html).toContain('★');
  });
});

describe('rating compare', () => {
  it('should render bar chart', () => {
    const ctx = createCompareContextWithValues('quality', [4.5, 3.0]);
    const html = rating(null, ctx);
    expect(html).toContain('rating-compare-wrapper');
    expect(html).toContain('rating-bars');
    expect(html).toContain('bar-row');
  });

  it('should show average line', () => {
    const ctx = createCompareContextWithValues('quality', [4.5, 3.5]);
    const html = rating(null, ctx);
    expect(html).toContain('bar-avg-line');
  });

  it('should show bar values with stars', () => {
    const ctx = createCompareContextWithValues('quality', [4, 3]);
    const html = rating(null, ctx);
    expect(html).toContain('bar-val');
    expect(html).toContain('★');
  });

  it('should show fill tracks', () => {
    const ctx = createCompareContextWithValues('quality', [5, 2]);
    const html = rating(null, ctx);
    expect(html).toContain('bar-fill-track');
    expect(html).toContain('bar-fill');
  });
});
