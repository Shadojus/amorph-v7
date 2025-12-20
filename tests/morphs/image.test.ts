/**
 * Image Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { image } from '../../src/morphs/primitives/image.js';
import { singleContext } from './_setup.js';

describe('image morph', () => {
  it('should render image tag', () => {
    const html = image('/images/steinpilz.jpg', singleContext);
    expect(html).toContain('morph-image');
    expect(html).toContain('src="/images/steinpilz.jpg"');
    expect(html).toContain('loading="lazy"');
  });
  
  it('should handle object with src', () => {
    const html = image({ src: '/img/test.png' }, singleContext);
    expect(html).toContain('src="/img/test.png"');
  });
  
  it('should block javascript: URLs to prevent XSS', () => {
    const html = image('javascript:alert(1)', singleContext);
    expect(html).not.toContain('javascript:');
    expect(html).toContain('Blocked');
  });
  
  it('should block data: URLs', () => {
    const html = image('data:image/svg+xml;base64,PHN2Zz4=', singleContext);
    expect(html).not.toContain('data:');
    expect(html).toContain('Blocked');
  });
  
  it('should allow relative image paths starting with /', () => {
    const html = image('/images/photo.jpg', singleContext);
    expect(html).toContain('src="/images/photo.jpg"');
  });
  
  it('should convert bare image filenames to https', () => {
    const html = image('photo.jpg', singleContext);
    expect(html).toContain('src="https://photo.jpg"');
  });
  
  it('should allow https image URLs', () => {
    const html = image('https://example.com/image.png', singleContext);
    expect(html).toContain('src="https://example.com/image.png"');
  });
});
