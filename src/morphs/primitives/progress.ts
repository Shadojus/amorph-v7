/**
 * AMORPH v7 - Progress Morph
 */

import { createUnifiedMorph, escapeHtml, formatPercent } from '../base.js';

export const progress = createUnifiedMorph(
  'progress',
  (value) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    const pct = Math.min(100, Math.max(0, isNaN(num) ? 0 : num));
    
    return `
      <div class="morph-progress">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="progress-label">${formatPercent(pct)}</span>
      </div>
    `;
  },
  // Compare: Stacked bars
  (values) => `
    <div class="morph-progress-compare">
      ${values.map(({ value, color }) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        const pct = Math.min(100, Math.max(0, isNaN(num) ? 0 : num));
        return `
          <div class="progress-row" style="--item-color: ${escapeHtml(color)}">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
            <span class="progress-value">${formatPercent(pct)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `
);
