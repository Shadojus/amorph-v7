/**
 * AMORPH v7 - Stats Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const stats = createUnifiedMorph(
  'stats',
  (value) => {
    if (typeof value !== 'object' || value === null) return '';
    
    const entries = Object.entries(value as Record<string, unknown>);
    
    return `
      <div class="morph-stats">
        ${entries.map(([key, val]) => `
          <div class="stat">
            <span class="stat-value">${escapeHtml(val)}</span>
            <span class="stat-label">${escapeHtml(key)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
);
