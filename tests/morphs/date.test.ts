/**
 * Date Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { date } from '../../src/morphs/primitives/date.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('date morph', () => {
  it('should format ISO date to German', () => {
    const html = date('2024-12-20', singleContext);
    expect(html).toContain('morph-date');
    expect(html).toContain('datetime="2024-12-20"');
    expect(html).toMatch(/20\.?\s*(Dezember|12)/);
  });
  
  it('should handle invalid dates gracefully', () => {
    const html = date('not-a-date', singleContext);
    expect(html).toContain('not-a-date');
  });
});

describe('date compare', () => {
  it('should show timeline with markers', () => {
    const ctx = createCompareContextWithValues('discovered', ['2024-01-01', '2024-06-15']);
    const html = date(null, ctx);
    expect(html).toContain('morph-date-compare');
    expect(html).toContain('date-timeline');
    expect(html).toContain('date-marker');
  });

  it('should show day difference', () => {
    const ctx = createCompareContextWithValues('discovered', ['2024-01-01', '2024-01-11']);
    const html = date(null, ctx);
    expect(html).toContain('Δ 10 Tag');
  });

  it('should show same day indicator', () => {
    const ctx = createCompareContextWithValues('discovered', ['2024-06-15', '2024-06-15']);
    const html = date(null, ctx);
    expect(html).toContain('Gleicher Tag');
  });
});
