/**
 * AMORPH v7 - Image Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';
import { validateUrl } from '../../core/security.js';

function extractSrc(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return String(obj.src || obj.url || '');
  }
  return String(value);
}

function sanitizeImageSrc(src: string): string {
  // Use validateUrl to block javascript:, data:, vbscript: URLs
  const validated = validateUrl(src);
  if (validated) return validated;
  
  // For image files, also allow relative paths without /
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(src)) {
    return src;
  }
  
  // Block dangerous URLs
  return '';
}

/**
 * Generiert WebP-Version einer Bild-URL (falls verfügbar)
 */
function getWebPSrc(src: string): string | null {
  if (/\.(jpg|jpeg|png)$/i.test(src)) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return null;
}

export const image = createUnifiedMorph(
  'image',
  (value) => {
    const src = sanitizeImageSrc(extractSrc(value));
    if (!src) return '<span class="morph-image-blocked" role="img" aria-label="Image blocked">[Blocked URL]</span>';
    
    const webpSrc = getWebPSrc(src);
    
    // PERFORMANCE: <picture> mit WebP-Fallback
    if (webpSrc) {
      return `<picture class="morph-image">
        <source srcset="${escapeHtml(webpSrc)}" type="image/webp">
        <img src="${escapeHtml(src)}" alt="Image" loading="lazy" decoding="async" />
      </picture>`;
    }
    
    return `<img class="morph-image" src="${escapeHtml(src)}" alt="Image" loading="lazy" decoding="async" />`;
  },
  // Compare: Grid of images
  (values) => `
    <div class="morph-image-compare">
      ${values.map(({ item, value, color }) => {
        const src = sanitizeImageSrc(extractSrc(value));
        if (!src) return `<div class="morph-image-cell morph-image-blocked">[Blocked]</div>`;
        
        const webpSrc = getWebPSrc(src);
        
        if (webpSrc) {
          return `
            <div class="morph-image-cell" style="--item-color: ${escapeHtml(color)}">
              <picture>
                <source srcset="${escapeHtml(webpSrc)}" type="image/webp">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />
              </picture>
            </div>
          `;
        }
        
        return `
          <div class="morph-image-cell" style="--item-color: ${escapeHtml(color)}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />
          </div>
        `;
      }).join('')}
    </div>
  `
);
