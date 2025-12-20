/**
 * AMORPH v7 - Date Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const date = createUnifiedMorph(
  'date',
  (value) => {
    const dateStr = String(value);
    let formatted = dateStr;
    
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        formatted = d.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch {
      // Keep original
    }
    
    return `<time class="morph-date" datetime="${escapeHtml(dateStr)}">${escapeHtml(formatted)}</time>`;
  }
);
