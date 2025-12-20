/**
 * Badge Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { badge } from '../../src/morphs/primitives/badge.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('badge morph', () => {
  it('should detect danger variant', () => {
    const html = badge('giftig', singleContext);
    expect(html).toContain('badge-danger');
  });

  it('should detect success variant', () => {
    const html = badge('essbar', singleContext);
    expect(html).toContain('badge-success');
  });

  it('should default to neutral', () => {
    const html = badge('neutral text', singleContext);
    expect(html).toContain('badge-default');
  });
  
  it('should escape HTML in badge content', () => {
    const html = badge('<script>xss</script>', singleContext);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('badge compare', () => {
  it('should show unanimous match when all same', () => {
    const ctx = createCompareContextWithValues('status', ['giftig', 'giftig']);
    const html = badge(null, ctx);
    expect(html).toContain('morph-badge-compare');
    expect(html).toContain('badge-match');
    expect(html).toContain('Übereinstimmend');
  });

  it('should show different values with counts', () => {
    const ctx = createCompareContextWithValues('status', ['essbar', 'giftig']);
    const html = badge(null, ctx);
    expect(html).toContain('badge-diff');
    expect(html).toContain('2 verschiedene');
    expect(html).toContain('1/2');
  });
});
