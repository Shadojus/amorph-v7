/**
 * AMORPH v7 - Stats Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

export const stats = createUnifiedMorph(
  'stats',
  (value) => {
    if (typeof value !== 'object' || value === null) return '';
    
    const entries = Object.entries(value as Record<string, unknown>);
    
    return `
      <div class="morph-stats">
        ${entries.map(([key, val]) => `
          <div class="morph-stat">
            <span class="morph-stat-value">${escapeHtml(val)}</span>
            <span class="morph-stat-label">${escapeHtml(key)}</span>
          </div>
        `).join('')}
      </div>
    `;
  },
  // Compare: Compact cards with bar visualization
  (values) => {
    // Collect all keys
    const allKeys = new Set<string>();
    values.forEach(({ value }) => {
      if (typeof value === 'object' && value !== null) {
        Object.keys(value as Record<string, unknown>).forEach(k => allKeys.add(k));
      }
    });
    
    // Build data map with ranges
    const stats: { key: string; vals: (number | string | null)[]; isNumeric: boolean; min: number; max: number; range: number }[] = [];
    
    [...allKeys].forEach(key => {
      const vals = values.map(({ value }) => {
        if (typeof value !== 'object' || value === null) return null;
        const v = (value as Record<string, unknown>)[key];
        return v !== undefined ? v : null;
      });
      
      const numericVals = vals.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      const isNumeric = numericVals.length === vals.filter(v => v !== null).length && numericVals.length > 0;
      
      let min = 0, max = 100, range = 100;
      if (isNumeric) {
        const nums = vals.map(v => v !== null ? parseFloat(String(v)) : NaN).filter(n => !isNaN(n));
        if (nums.length > 0) {
          min = Math.min(...nums);
          max = Math.max(...nums);
          range = max - min || 1;
        }
      }
      
      stats.push({ key, vals: vals as (number | string | null)[], isNumeric, min, max, range });
    });
    
    return `
      <div class="stats-compare-wrapper">
        ${stats.map(({ key, vals, isNumeric, min, range }) => `
          <div class="stats-row">
            <span class="stats-label">${escapeHtml(key.replace(/_/g, ' '))}</span>
            <div class="stats-values">
              ${vals.map((v, idx) => {
                const color = values[idx]?.color || '#888';
                if (v === null) return `<span class="stats-val stats-empty">–</span>`;
                
                const itemName = values[idx]?.item?.name || '';
                if (isNumeric) {
                  const num = parseFloat(String(v));
                  const pct = range > 0 ? ((num - min) / range) * 100 : 50;
                  return `
                    <div class="stats-bar-item" data-species="${escapeHtml(itemName)}" style="--item-color: ${escapeHtml(color)}">
                      <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width: ${Math.max(pct, 3)}%"></div>
                      </div>
                      <span class="stats-bar-val">${formatNumber(num)}</span>
                    </div>
                  `;
                }
                return `
                  <div class="stats-text-item" data-species="${escapeHtml(itemName)}" style="--item-color: ${escapeHtml(color)}">
                    <span class="cmp-dot"></span>
                    <span class="stats-text-val">${escapeHtml(v)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
);
