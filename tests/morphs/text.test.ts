/**
 * Text Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { text } from '../../src/morphs/primitives/text.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('text morph', () => {
  it('should render string values', () => {
    const html = text('Hello World', singleContext);
    expect(html).toContain('Hello World');
    expect(html).toContain('morph-text');
  });

  it('should escape HTML entities', () => {
    const html = text('<script>alert("xss")</script>', singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should handle null/undefined', () => {
    const html1 = text(null, singleContext);
    const html2 = text(undefined, singleContext);
    expect(html1).toContain('morph-text');
    expect(html2).toContain('morph-text');
  });
});

describe('text compare', () => {
  it('should show identical indicator when same', () => {
    const ctx = createCompareContextWithValues('description', ['Same Text', 'Same Text']);
    const html = text(null, ctx);
    expect(html).toContain('morph-text-compare');
    expect(html).toContain('text-same');
    expect(html).toContain('Identisch');
  });

  it('should show variants when different', () => {
    const ctx = createCompareContextWithValues('description', ['Text A', 'Text B']);
    const html = text(null, ctx);
    expect(html).toContain('text-variant');
    expect(html).toContain('2 Varianten');
  });
});
