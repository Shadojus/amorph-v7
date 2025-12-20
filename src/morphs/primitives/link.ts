/**
 * AMORPH v7 - Link Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const link = createUnifiedMorph(
  'link',
  (value) => {
    const href = String(value);
    const display = href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<a class="morph-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
  }
);
