/**
 * AMORPH v7 - Number Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber, getNumericRange } from '../base.js';

export const number = createUnifiedMorph(
  'number',
  (value) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) return `<span class="morph-number">–</span>`;
    return `<span class="morph-number">${formatNumber(num)}</span>`;
  },
  // Compare: Bar-Visualisierung
  (values) => {
    const nums = values.map(v => typeof v.value === 'number' ? v.value : parseFloat(String(v.value)));
    const validNums = nums.filter(n => !isNaN(n));
    if (validNums.length === 0) return '';
    
    const { min, range } = getNumericRange(validNums);
    
    return `
      <div class="morph-number-compare">
        ${values.map(({ color }, idx) => {
          const num = nums[idx];
          if (isNaN(num)) return `<div class="morph-number-cell morph-number-empty">–</div>`;
          const pct = range > 0 ? ((num - min) / range) * 100 : 50;
          return `
            <div class="morph-number-cell" style="--item-color: ${escapeHtml(color)}">
              <div class="morph-number-bar" style="width: ${pct}%"></div>
              <span class="morph-number-value">${formatNumber(num)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
