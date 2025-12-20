/**
 * AMORPH v7 - Text Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const text = createUnifiedMorph(
  'text',
  (value) => `<span class="morph-text">${escapeHtml(value)}</span>`
);
