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
          <div class="stat">
            <span class="stat-value">${escapeHtml(val)}</span>
            <span class="stat-label">${escapeHtml(key)}</span>
          </div>
        `).join('')}
      </div>
    `;
  },
  // Compare: Table with bars and statistics
  (values) => {
    // Collect all keys
    const allKeys = new Set<string>();
    values.forEach(({ value }) => {
      if (typeof value === 'object' && value !== null) {
        Object.keys(value as Record<string, unknown>).forEach(k => allKeys.add(k));
      }
    });
    
    // Build data map
    const data = new Map<string, { values: (number | string | null)[]; isNumeric: boolean }>();
    
    [...allKeys].forEach(key => {
      const vals = values.map(({ value }) => {
        if (typeof value !== 'object' || value === null) return null;
        const v = (value as Record<string, unknown>)[key];
        return v !== undefined ? v : null;
      });
      
      const numericVals = vals.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      const isNumeric = numericVals.length === vals.filter(v => v !== null).length && numericVals.length > 0;
      
      data.set(key, { 
        values: vals as (number | string | null)[], 
        isNumeric 
      });
    });
    
    return `
      <div class="morph-stats-compare">
        <table class="stats-table">
          <thead>
            <tr>
              <th>Metrik</th>
              ${values.map(({ item, color }) => `
                <th style="--item-color: ${escapeHtml(color)}">${escapeHtml(item.name)}</th>
              `).join('')}
              <th class="stats-summary">Ø / Δ</th>
            </tr>
          </thead>
          <tbody>
            ${[...data.entries()].map(([key, { values: vals, isNumeric }]) => {
              // Calculate stats for numeric values
              let statsHtml = '–';
              let minIdx = -1, maxIdx = -1;
              
              if (isNumeric) {
                const nums = vals.map(v => v !== null ? parseFloat(String(v)) : NaN);
                const validNums = nums.filter(n => !isNaN(n));
                
                if (validNums.length > 1) {
                  const avg = validNums.reduce((a, b) => a + b, 0) / validNums.length;
                  const min = Math.min(...validNums);
                  const max = Math.max(...validNums);
                  minIdx = nums.findIndex(n => n === min);
                  maxIdx = nums.findIndex(n => n === max);
                  statsHtml = `<span class="avg">Ø ${formatNumber(avg)}</span><span class="diff">Δ ${formatNumber(max - min)}</span>`;
                }
              }
              
              return `
                <tr>
                  <td class="stats-key">${escapeHtml(key)}</td>
                  ${vals.map((v, idx) => {
                    if (v === null) return '<td class="stats-val stats-empty">–</td>';
                    
                    const classes = ['stats-val'];
                    if (idx === minIdx) classes.push('stats-min');
                    if (idx === maxIdx) classes.push('stats-max');
                    
                    const displayVal = typeof v === 'number' ? formatNumber(v) : escapeHtml(v);
                    return `<td class="${classes.join(' ')}">${displayVal}</td>`;
                  }).join('')}
                  <td class="stats-summary">${statsHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
);
