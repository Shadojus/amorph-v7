/**
 * List Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { list } from '../../src/morphs/primitives/list.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('list morph', () => {
  it('should render array as list', () => {
    const html = list(['Eins', 'Zwei', 'Drei'], singleContext);
    expect(html).toContain('morph-list');
    expect(html).toContain('morph-list-item');
    expect(html).toContain('Eins');
    expect(html).toContain('Zwei');
    expect(html).toContain('Drei');
  });
  
  it('should wrap single value in list', () => {
    const html = list('Single Item', singleContext);
    expect(html).toContain('morph-list-item');
    expect(html).toContain('Single Item');
  });
  
  it('should escape HTML in list items', () => {
    const html = list(['<b>Bold</b>'], singleContext);
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;');
  });
});

describe('list compare', () => {
  it('should group items into common/partial/unique', () => {
    const ctx = createCompareContextWithValues('items', [
      ['A', 'B', 'C'],
      ['A', 'C', 'D']
    ]);
    const html = list(null, ctx);
    expect(html).toContain('list-compare-wrapper');
    expect(html).toContain('list-common'); // A, C
    expect(html).toContain('list-unique'); // B, D
  });

  it('should show section labels', () => {
    const ctx = createCompareContextWithValues('items', [
      ['gemeinsam', 'nur-hier'],
      ['gemeinsam', 'anders']
    ]);
    const html = list(null, ctx);
    expect(html).toContain('Gemeinsam');
    expect(html).toContain('Einzigartig');
  });
});
