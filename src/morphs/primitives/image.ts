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

export const image = createUnifiedMorph(
  'image',
  (value) => {
    const src = sanitizeImageSrc(extractSrc(value));
    if (!src) return '<span class="morph-image-blocked">[Blocked URL]</span>';
    return `<img class="morph-image" src="${escapeHtml(src)}" alt="" loading="lazy" />`;
  },
  // Compare: Grid of images
  (values) => `
    <div class="morph-image-compare">
      ${values.map(({ item, value, color }) => {
        const src = sanitizeImageSrc(extractSrc(value));
        if (!src) return `<div class="image-cell blocked">[Blocked]</div>`;
        return `
          <div class="image-cell" style="--item-color: ${escapeHtml(color)}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}" loading="lazy" />
          </div>
        `;
      }).join('')}
    </div>
  `
);
