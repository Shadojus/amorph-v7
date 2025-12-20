/**
 * AMORPH v7 - Progress Morph
 */

import { createUnifiedMorph, escapeHtml, formatPercent, formatNumber } from '../base.js';

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
  // Compare: Overlapping bars with average line and stats
  (values) => {
    const nums = values.map(({ value }) => {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return Math.min(100, Math.max(0, isNaN(num) ? 0 : num));
    });
    
    // Calculate statistics
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const diff = max - min;
    
    return `
      <div class="morph-progress-compare">
        <div class="progress-stack">
          ${values.map(({ item, color }, idx) => {
            const pct = nums[idx];
            const isMin = pct === min && diff > 0;
            const isMax = pct === max && diff > 0;
            return `
              <div class="progress-row ${isMin ? 'progress-min' : ''} ${isMax ? 'progress-max' : ''}" 
                   style="--item-color: ${escapeHtml(color)}">
                <span class="progress-item-name">${escapeHtml(item.name)}</span>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
                <span class="progress-value">${formatPercent(pct)}</span>
              </div>
            `;
          }).join('')}
          <div class="progress-avg-line" style="left: ${avg}%"></div>
        </div>
        <div class="progress-stats">
          <span class="stat"><span class="stat-label">Ø</span> ${formatPercent(avg)}</span>
          <span class="stat"><span class="stat-label">Min</span> ${formatPercent(min)}</span>
          <span class="stat"><span class="stat-label">Max</span> ${formatPercent(max)}</span>
          <span class="stat"><span class="stat-label">Δ</span> ${formatNumber(diff)} pp</span>
        </div>
      </div>
    `;
  }
);
