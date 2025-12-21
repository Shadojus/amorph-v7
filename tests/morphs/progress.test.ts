/**
 * Progress Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { progress } from '../../src/morphs/primitives/progress.js';
import { singleContext, compareContext, createCompareContextWithValues } from './_setup.js';

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
  
  it('should use correct CSS classes', () => {
    const html = progress(50, singleContext);
    expect(html).toContain('class="morph-progress"');
    expect(html).toContain('class="morph-progress-bar"');
    expect(html).toContain('class="morph-progress-fill"');
    expect(html).toContain('class="morph-progress-value"');
  });

  it('should render in compare context', () => {
    const html = progress(75, compareContext);
    expect(html).toContain('morph-progress');
    expect(html).toContain('75%');
  });
});

describe('progress compare', () => {
  it('should render bar visualization', () => {
    const ctx = createCompareContextWithValues('completion', [80, 60]);
    const html = progress(null, ctx);
    expect(html).toContain('progress-compare-wrapper');
    expect(html).toContain('progress-bars');
    expect(html).toContain('bar-row');
  });

  it('should show average line', () => {
    const ctx = createCompareContextWithValues('completion', [80, 60]);
    const html = progress(null, ctx);
    expect(html).toContain('bar-avg-line');
  });

  it('should show bar values', () => {
    const ctx = createCompareContextWithValues('completion', [90, 30]);
    const html = progress(null, ctx);
    expect(html).toContain('bar-val');
    expect(html).toContain('90%');
    expect(html).toContain('30%');
  });

  it('should show fill tracks', () => {
    const ctx = createCompareContextWithValues('completion', [80, 40]);
    const html = progress(null, ctx);
    expect(html).toContain('bar-fill-track');
    expect(html).toContain('bar-fill');
  });
});
