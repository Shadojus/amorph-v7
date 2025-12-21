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
        <div class="morph-progress-bar">
          <div class="morph-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="morph-progress-value">${formatPercent(pct)}</span>
      </div>
    `;
  },
  // Compare: Bar-style layout matching bar chart
  (values) => {
    const nums = values.map(({ value }) => {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return Math.min(100, Math.max(0, isNaN(num) ? 0 : num));
    });
    
    // Calculate average
    const validNums = nums.filter(n => !isNaN(n));
    const avg = validNums.length > 0 ? validNums.reduce((a, b) => a + b, 0) / validNums.length : 0;
    
    return `
      <div class="progress-compare-wrapper">
        <div class="progress-bars">
          ${values.map(({ color }, idx) => {
            const pct = nums[idx];
            return `
              <div class="bar-row" style="--item-color: ${escapeHtml(color)}">
                <div class="bar-fill-track">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-val">${formatPercent(pct)}</span>
              </div>
            `;
          }).join('')}
          ${validNums.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avg}% * 0.75)"></div>` : ''}
        </div>
      </div>
    `;
  }
);
