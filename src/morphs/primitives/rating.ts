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

/**
 * Extrahiert Rating-Wert und Max aus verschiedenen Datenformaten
 */
function extractRatingData(value: unknown): { rating: number; max: number } {
  // Objekt: {rating: n, max: m}
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const rating = Number(obj.rating ?? obj.value ?? obj.score ?? 0);
    const max = Number(obj.max ?? obj.total ?? 10);
    return { rating, max };
  }
  
  // Primitiver Number
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return { rating: isNaN(num) ? 0 : num, max: 10 };
}

export const rating = createUnifiedMorph(
  'rating',
  (value) => {
    const { rating: rawRating, max: dataMax } = extractRatingData(value);
    const maxStars = 5;
    
    if (rawRating === 0 && dataMax === 0) return `<span class="morph-rating">–</span>`;
    
    // Normalisiere auf 5-Sterne-Skala
    const normalized = dataMax > 0 ? (rawRating / dataMax) * 5 : 0;
    
    return `
      <div class="morph-rating" role="img" aria-label="Rating: ${rawRating} von ${dataMax}" title="${rawRating} von ${dataMax}">
        <span class="rating-stars" aria-hidden="true">${renderStars(normalized)}</span>
        <span class="morph-rating-value">${rawRating}/${dataMax}</span>
      </div>
    `;
  },
  // Compare: Bar-style with star value
  (values) => {
    const maxStars = 5;
    const ratings = values.map(({ value, color }) => {
      const { rating: rawRating, max: dataMax } = extractRatingData(value);
      const normalized = dataMax > 0 ? (rawRating / dataMax) * 5 : 0;
      return { color, value: normalized, raw: rawRating, max: dataMax };
    });
    
    // Calculate average
    const validRatings = ratings.filter(r => r.value > 0);
    const avg = validRatings.length > 0 ? validRatings.reduce((a, b) => a + b.value, 0) / validRatings.length : 0;
    const avgPct = (avg / maxStars) * 100;
    
    return `
      <div class="rating-compare-wrapper">
        <div class="rating-bars">
          ${ratings.map(({ color, value, raw, max }) => {
            const pct = (value / maxStars) * 100;
            return `
              <div class="bar-row" style="--item-color: ${escapeHtml(color)}">
                <div class="bar-fill-track">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-val">${raw}/${max} ★</span>
              </div>
            `;
          }).join('')}
          ${validRatings.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avgPct}% * 0.75)"></div>` : ''}
        </div>
      </div>
    `;
  }
);
