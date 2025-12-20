/**
 * Tag Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { tag } from '../../src/morphs/primitives/tag.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('tag morph', () => {
  it('should render single tag', () => {
    const html = tag('Waldpilz', singleContext);
    expect(html).toContain('morph-tags');
    expect(html).toContain('Waldpilz');
  });
  
  it('should render array of tags', () => {
    const html = tag(['essbar', 'häufig', 'Herbst'], singleContext);
    expect(html).toContain('morph-tags');
    expect(html).toContain('essbar');
    expect(html).toContain('häufig');
    expect(html).toContain('Herbst');
  });
  
  it('should escape HTML in tags', () => {
    const html = tag(['<script>xss</script>'], singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('tag compare', () => {
  it('should highlight common and unique tags', () => {
    const ctx = createCompareContextWithValues('tags', [
      ['essbar', 'Wald'],
      ['giftig', 'Wald']
    ]);
    const html = tag(null, ctx);
    expect(html).toContain('morph-tags-compare');
    expect(html).toContain('tag-common'); // Wald
    expect(html).toContain('tag-unique'); // essbar, giftig
    expect(html).toContain('tag-legend');
  });

  it('should show frequency counts for partial tags', () => {
    const ctx = createCompareContextWithValues('tags', [
      ['A', 'B', 'C'],
      ['A', 'C', 'D']
    ]);
    const html = tag(null, ctx);
    expect(html).toContain('1/2'); // B and D
  });
});
