/**
 * AMORPH v7 - Rating Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

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
        <span class="rating-number">${normalized.toFixed(1)}</span>
      </div>
    `;
  },
  // Compare: Side-by-side ratings
  (values) => `
    <div class="morph-rating-compare">
      ${values.map(({ value, color }) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(num)) return `<div class="rating-cell">–</div>`;
        
        const normalized = normalizeRating(num);
        const fullStars = Math.floor(normalized);
        const hasHalf = normalized - fullStars >= 0.5;
        
        return `
          <div class="rating-cell" style="--item-color: ${escapeHtml(color)}">
            ${'★'.repeat(fullStars)}${hasHalf ? '⯪' : ''}
            <span class="rating-value">${normalized.toFixed(1)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `
);
