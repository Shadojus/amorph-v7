/**
 * AMORPH v7 - Tag Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const tag = createUnifiedMorph(
  'tag',
  (value) => {
    const tags = Array.isArray(value) ? value : [value];
    return `
      <div class="morph-tags">
        ${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    `;
  }
);
