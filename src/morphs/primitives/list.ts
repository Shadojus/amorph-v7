/**
 * AMORPH v7 - List Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const list = createUnifiedMorph(
  'list',
  (value) => {
    const items = Array.isArray(value) ? value : [value];
    return `
      <ul class="morph-list">
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  }
);
