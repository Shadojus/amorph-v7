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
  // Compare: Bar-style layout matching bar chart
  (values) => {
    const nums = values.map(v => typeof v.value === 'number' ? v.value : parseFloat(String(v.value)));
    const validNums = nums.filter(n => !isNaN(n));
    if (validNums.length === 0) return '';
    
    const { min, max, range } = getNumericRange(validNums);
    const avg = validNums.reduce((a, b) => a + b, 0) / validNums.length;
    const avgPct = range > 0 ? ((avg - min) / range) * 100 : 50;
    
    return `
      <div class="number-compare-wrapper">
        <div class="number-bars">
          ${values.map(({ color }, idx) => {
            const num = nums[idx];
            if (isNaN(num)) return `<div class="bar-row"><span class="bar-val">–</span></div>`;
            
            const pct = range > 0 ? ((num - min) / range) * 100 : 50;
            
            return `
              <div class="bar-row" style="--item-color: ${escapeHtml(color)}">
                <div class="bar-fill-track">
                  <div class="bar-fill" style="width: ${Math.max(pct, 3)}%"></div>
                </div>
                <span class="bar-val">${formatNumber(num)}</span>
              </div>
            `;
          }).join('')}
          ${validNums.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avgPct}% * 0.75)"></div>` : ''}
        </div>
      </div>
    `;
  }
);
