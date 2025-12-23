/**
 * AMORPH v7 - Progress Morph
 */

import { createUnifiedMorph, escapeHtml, formatPercent } from '../base.js';

/**
 * Extrahiert Progress-Wert aus verschiedenen Datenformaten
 */
function extractProgressData(value: unknown): { value: number; max: number; unit: string } {
  // Objekt: {value: n, max: m, unit: "%"}
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const val = Number(obj.value ?? 0);
    const max = Number(obj.max ?? 100);
    const unit = String(obj.unit || '%');
    return { value: val, max, unit };
  }
  
  // Primitiver Number (0-100)
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return { value: isNaN(num) ? 0 : num, max: 100, unit: '%' };
}

export const progress = createUnifiedMorph(
  'progress',
  (value) => {
    const { value: rawValue, max, unit } = extractProgressData(value);
    const pct = max > 0 ? Math.min(100, Math.max(0, (rawValue / max) * 100)) : 0;
    
    return `
      <div class="morph-progress">
        <div class="morph-progress-bar">
          <div class="morph-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="morph-progress-value">${rawValue}${unit}</span>
      </div>
    `;
  },
  // Compare: Bar-style layout matching bar chart
  (values) => {
    const progressData = values.map(({ value }) => extractProgressData(value));
    const pcts = progressData.map(d => d.max > 0 ? (d.value / d.max) * 100 : 0);
    
    // Filter out items with no progress value
    const validItems = values.filter((_, idx) => progressData[idx].value > 0);
    if (validItems.length === 0) return '<span class="no-value">–</span>';
    
    // Calculate average
    const validPcts = pcts.filter(n => !isNaN(n) && n > 0);
    const avg = validPcts.length > 0 ? validPcts.reduce((a, b) => a + b, 0) / validPcts.length : 0;
    
    return `
      <div class="progress-compare-wrapper">
        <div class="progress-bars">
          ${values.map(({ color, item }, idx) => {
            const pct = pcts[idx];
            const data = progressData[idx];
            // Skip items with no value
            if (data.value === 0) return '';
            const name = item.name || item.id;
            return `
              <div class="bar-row" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
                <div class="bar-fill-track">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-val">${data.value}${data.unit}</span>
              </div>
            `;
          }).join('')}
          ${validPcts.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avg}% * 0.75)"></div>` : ''}
        </div>
      </div>
    `;
  }
);
