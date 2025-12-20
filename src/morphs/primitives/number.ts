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
  // Compare: Bar visualization with average line and statistics
  (values) => {
    const nums = values.map(v => typeof v.value === 'number' ? v.value : parseFloat(String(v.value)));
    const validNums = nums.filter(n => !isNaN(n));
    if (validNums.length === 0) return '';
    
    const { min, max, range } = getNumericRange(validNums);
    const avg = validNums.reduce((a, b) => a + b, 0) / validNums.length;
    const avgPct = range > 0 ? ((avg - min) / range) * 100 : 50;
    
    return `
      <div class="morph-number-compare">
        <div class="number-bars">
          ${values.map(({ item, color }, idx) => {
            const num = nums[idx];
            if (isNaN(num)) return `<div class="morph-number-row morph-number-empty">–</div>`;
            
            const pct = range > 0 ? ((num - min) / range) * 100 : 50;
            const isMin = num === min && range > 0;
            const isMax = num === max && range > 0;
            
            return `
              <div class="number-row ${isMin ? 'number-min' : ''} ${isMax ? 'number-max' : ''}" 
                   style="--item-color: ${escapeHtml(color)}">
                <span class="number-item-name">${escapeHtml(item.name)}</span>
                <div class="number-track">
                  <div class="number-bar" style="width: ${Math.max(pct, 3)}%"></div>
                </div>
                <span class="number-value">${formatNumber(num)}</span>
              </div>
            `;
          }).join('')}
          <div class="number-avg-line" style="left: ${avgPct}%"></div>
        </div>
        <div class="number-scale">
          <span>${formatNumber(min)}</span>
          <span>${formatNumber(max)}</span>
        </div>
        <div class="number-stats">
          <span class="stat"><span class="stat-label">Ø</span> ${formatNumber(avg)}</span>
          <span class="stat"><span class="stat-label">Min</span> ${formatNumber(min)}</span>
          <span class="stat"><span class="stat-label">Max</span> ${formatNumber(max)}</span>
          <span class="stat"><span class="stat-label">Δ</span> ${formatNumber(range)}</span>
        </div>
      </div>
    `;
  }
);
