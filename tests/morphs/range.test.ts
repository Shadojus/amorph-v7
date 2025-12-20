/**
 * Range Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { range } from '../../src/morphs/primitives/range.js';
import { singleContext, compareContext } from './_setup.js';

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

  it('should render with compare context', () => {
    const html = range({ min: 0, max: 100 }, compareContext);
    expect(html).toContain('morph-range');
  });
});
