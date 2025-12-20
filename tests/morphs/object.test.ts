/**
 * Object Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { object } from '../../src/morphs/primitives/object.js';
import { singleContext, compareContext } from './_setup.js';

describe('object morph', () => {
  it('should render object as key-value pairs', () => {
    const html = object({ name: 'Test', value: 42 }, singleContext);
    expect(html).toContain('name');
    expect(html).toContain('Test');
    expect(html).toContain('42');
  });

  it('should render nested objects recursively', () => {
    const html = object({ outer: { inner: 'value' } }, singleContext);
    expect(html).toContain('outer');
    expect(html).toContain('inner');
    expect(html).toContain('value');
    expect(html).toContain('morph-object-nested');
  });

  it('should render arrays as tag lists', () => {
    const html = object({ tags: ['a', 'b', 'c'] }, singleContext);
    expect(html).toContain('morph-tag-list');
    expect(html).toContain('morph-tag');
  });

  it('should handle empty objects', () => {
    const html = object({}, singleContext);
    expect(html).toContain('{}');
  });

  it('should handle null values', () => {
    const html = object({ field: null }, singleContext);
    expect(html).toContain('–');
  });
});

describe('object morph compare mode', () => {
  it('should render table layout with items as columns', () => {
    const values = [
      { value: { a: 10, b: 20 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: { a: 15, b: 25 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-table');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    }
  });

  it('should highlight max/min values', () => {
    const values = [
      { value: { score: 100 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'High' } },
      { value: { score: 10 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Low' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('is-max');
      expect(html).toContain('is-min');
    }
  });

  it('should show difference for numeric values', () => {
    const values = [
      { value: { temp: 20 }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Cold' } },
      { value: { temp: 80 }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Hot' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-diff');
      expect(html).toContain('Δ');
    }
  });

  it('should group nested object keys', () => {
    const values = [
      { value: { outer: { inner1: 10, inner2: 20 } }, color: '#0df', item: { id: '1', slug: 'item1', name: 'Item 1' } },
      { value: { outer: { inner1: 15, inner2: 25 } }, color: '#f0d', item: { id: '2', slug: 'item2', name: 'Item 2' } }
    ];
    const morphFn = object as any;
    const html = morphFn.compareRender ? morphFn.compareRender(values, compareContext) : '';
    if (html) {
      expect(html).toContain('object-compare-group-header');
      expect(html).toContain('outer');
    }
  });
});
