/**
 * Boolean Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { boolean } from '../../src/morphs/primitives/boolean.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('boolean morph', () => {
  it('should show checkmark for true', () => {
    const html = boolean(true, singleContext);
    expect(html).toContain('✓');
    expect(html).toContain('data-value="true"');
  });

  it('should show X for false', () => {
    const html = boolean(false, singleContext);
    expect(html).toContain('✗');
    expect(html).toContain('data-value="false"');
  });

  it('should handle string "ja"', () => {
    const html = boolean('ja', singleContext);
    expect(html).toContain('✓');
  });
});

describe('boolean compare', () => {
  it('should show unanimous when all same', () => {
    const ctx = createCompareContextWithValues('active', [true, true]);
    const html = boolean(null, ctx);
    expect(html).toContain('morph-boolean-compare');
    expect(html).toContain('bool-unanimous');
    expect(html).toContain('Einstimmig');
  });

  it('should show split counts when different', () => {
    const ctx = createCompareContextWithValues('active', [true, false]);
    const html = boolean(null, ctx);
    expect(html).toContain('bool-split');
    expect(html).toContain('✓ 1 / ✗ 1');
  });

  it('should highlight outliers', () => {
    const ctx = createCompareContextWithValues('active', [true, false]);
    const html = boolean(null, ctx);
    expect(html).toContain('bool-outlier');
  });
});
