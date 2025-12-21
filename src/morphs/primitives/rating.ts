/**
 * AMORPH v7 - Rating Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

function normalizeRating(num: number): number {
  if (num > 10) return (num / 100) * 5;
  if (num > 5) return (num / 10) * 5;
  return num;
}

function renderStars(rating: number, maxStars = 5): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
  return '★'.repeat(fullStars) + (hasHalf ? '⯪' : '') + '☆'.repeat(emptyStars);
}

export const rating = createUnifiedMorph(
  'rating',
  (value) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    const maxStars = 5;
    
    if (isNaN(num)) return `<span class="morph-rating">–</span>`;
    
    const normalized = normalizeRating(num);
    
    return `
      <div class="morph-rating" title="${normalized.toFixed(1)} von ${maxStars}">
        <span class="rating-stars">${renderStars(normalized)}</span>
        <span class="morph-rating-value">${normalized.toFixed(1)}</span>
      </div>
    `;
  },
  // Compare: Bar-style with star value
  (values) => {
    const maxStars = 5;
    const ratings = values.map(({ value, color }) => {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      const normalized = isNaN(num) ? 0 : normalizeRating(num);
      return { color, value: normalized };
    });
    
    // Calculate average
    const validRatings = ratings.filter(r => r.value > 0);
    const avg = validRatings.length > 0 ? validRatings.reduce((a, b) => a + b.value, 0) / validRatings.length : 0;
    const avgPct = (avg / maxStars) * 100;
    
    return `
      <div class="rating-compare-wrapper">
        <div class="rating-bars">
          ${ratings.map(({ color, value }) => {
            const pct = (value / maxStars) * 100;
            return `
              <div class="bar-row" style="--item-color: ${escapeHtml(color)}">
                <div class="bar-fill-track">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-val">${value.toFixed(1)} ★</span>
              </div>
            `;
          }).join('')}
          ${validRatings.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avgPct}% * 0.75)"></div>` : ''}
        </div>
      </div>
    `;
  }
);
