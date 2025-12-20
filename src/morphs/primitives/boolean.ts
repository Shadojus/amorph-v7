/**
 * AMORPH v7 - Boolean Morph
 */

import { createUnifiedMorph } from '../base.js';

export const boolean = createUnifiedMorph(
  'boolean',
  (value) => {
    const bool = value === true || value === 'true' || value === 1 || value === '1' || value === 'ja' || value === 'yes';
    return `<span class="morph-boolean" data-value="${bool}">${bool ? '✓' : '✗'}</span>`;
  }
);
