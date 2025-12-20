/**
 * Link Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { link } from '../../src/morphs/primitives/link.js';
import { singleContext } from './_setup.js';

describe('link morph', () => {
  it('should render clickable link', () => {
    const html = link('https://example.com/steinpilz', singleContext);
    expect(html).toContain('morph-link');
    expect(html).toContain('href="https://example.com/steinpilz"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  
  it('should strip protocol from display text', () => {
    const html = link('https://example.com/path', singleContext);
    expect(html).toContain('>example.com/path<');
    expect(html).not.toContain('>https://');
  });
  
  it('should escape HTML in URL', () => {
    const html = link('https://example.com/<script>', singleContext);
    expect(html).not.toContain('<script>');
  });
});
