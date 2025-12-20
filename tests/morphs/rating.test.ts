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

  it('should normalize percentage to 5-star', () => {
    const html = rating(80, singleContext);
    expect(html).toContain('4.0');
  });
});

describe('rating compare', () => {
  it('should render bar chart', () => {
    const ctx = createCompareContextWithValues('quality', [4.5, 3.0]);
    const html = rating(null, ctx);
    expect(html).toContain('morph-rating-compare');
    expect(html).toContain('rating-bars');
    expect(html).toContain('Steinpilz');
    expect(html).toContain('Fliegenpilz');
  });

  it('should show average line', () => {
    const ctx = createCompareContextWithValues('quality', [4.5, 3.5]);
    const html = rating(null, ctx);
    expect(html).toContain('rating-avg-line');
  });

  it('should show scale 1-5', () => {
    const ctx = createCompareContextWithValues('quality', [4, 3]);
    const html = rating(null, ctx);
    expect(html).toContain('rating-scale');
    expect(html).toContain('>1<');
    expect(html).toContain('>5<');
  });

  it('should highlight min and max', () => {
    const ctx = createCompareContextWithValues('quality', [5, 2]);
    const html = rating(null, ctx);
    expect(html).toContain('rating-max');
    expect(html).toContain('rating-min');
  });
});
