/**
 * AMORPH v7 - Rating Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

function normalizeRating(num: number): number {
  if (num > 10) return (num / 100) * 5; // percentage
  if (num > 5) return (num / 10) * 5;   // out of 10
  return num;
}

export const rating = createUnifiedMorph(
  'rating',
  (value) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    const maxStars = 5;
    
    if (isNaN(num)) return `<span class="morph-rating">–</span>`;
    
    const normalized = normalizeRating(num);
    const fullStars = Math.floor(normalized);
    const hasHalf = normalized - fullStars >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
    
    return `
      <div class="morph-rating" title="${normalized.toFixed(1)} von ${maxStars}">
        ${'★'.repeat(fullStars)}
        ${hasHalf ? '⯪' : ''}
        ${'☆'.repeat(emptyStars)}
        <span class="morph-rating-value">${normalized.toFixed(1)}</span>
      </div>
    `;
  },
  // Compare: Bar chart with average line
  (values) => {
    const maxStars = 5;
    const ratings = values.map(({ item, value, color }) => {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      const normalized = isNaN(num) ? 0 : normalizeRating(num);
      return { item, color, value: normalized };
    });
    
    const validRatings = ratings.filter(r => r.value > 0);
    const avg = validRatings.length > 0
      ? validRatings.reduce((a, r) => a + r.value, 0) / validRatings.length
      : 0;
    const min = Math.min(...validRatings.map(r => r.value));
    const max = Math.max(...validRatings.map(r => r.value));
    const avgPct = (avg / maxStars) * 100;
    
    return `
      <div class="morph-rating-compare">
        <div class="rating-bars">
          ${ratings.map(({ item, color, value }) => {
            const pct = (value / maxStars) * 100;
            const isMin = value === min && max > min;
            const isMax = value === max && max > min;
            return `
              <div class="rating-bar-row ${isMin ? 'rating-min' : ''} ${isMax ? 'rating-max' : ''}" 
                   style="--item-color: ${escapeHtml(color)}">
                <span class="rating-item-name">${escapeHtml(item.name)}</span>
                <div class="rating-track">
                  <div class="rating-fill" style="width: ${pct}%"></div>
                </div>
                <span class="rating-value">${value.toFixed(1)} ★</span>
              </div>
            `;
          }).join('')}
          <div class="rating-avg-line" style="left: ${avgPct}%"></div>
        </div>
        <div class="rating-scale">
          ${[1, 2, 3, 4, 5].map(n => `<span class="scale-mark">${n}</span>`).join('')}
        </div>
        <div class="rating-stats">
          <span class="stat"><span class="stat-label">Ø</span> ${formatNumber(avg)} ★</span>
          <span class="stat"><span class="stat-label">Δ</span> ${formatNumber(max - min)}</span>
        </div>
      </div>
    `;
  }
);
