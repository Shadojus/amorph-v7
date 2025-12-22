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
    expect(html).toContain('morph-boolean-true');
  });

  it('should show X for false', () => {
    const html = boolean(false, singleContext);
    expect(html).toContain('✗');
    expect(html).toContain('morph-boolean-false');
  });

  it('should handle string "ja"', () => {
    const html = boolean('ja', singleContext);
    expect(html).toContain('✓');
  });
});

describe('boolean compare', () => {
  it('should show all-same when unanimous', () => {
    const ctx = createCompareContextWithValues('active', [true, true]);
    const html = boolean(null, ctx);
    expect(html).toContain('boolean-compare-wrapper');
    expect(html).toContain('boolean-all-same');
    expect(html).toContain('Alle ja');
  });

  it('should show bool-rows when different', () => {
    const ctx = createCompareContextWithValues('active', [true, false]);
    const html = boolean(null, ctx);
    expect(html).toContain('boolean-compare-wrapper');
    expect(html).toContain('bool-row');
    expect(html).toContain('bool-true');
    expect(html).toContain('bool-false');
  });

  it('should include colored dots per item', () => {
    const ctx = createCompareContextWithValues('active', [true, false]);
    const html = boolean(null, ctx);
    expect(html).toContain('cmp-dot');
    expect(html).toContain('--item-color');
  });
});
