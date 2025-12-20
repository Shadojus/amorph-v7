/**
 * AMORPH v7 - Sparkline Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

export const sparkline = createUnifiedMorph(
  'sparkline',
  (value) => {
    const data = Array.isArray(value) ? value.map(Number) : [];
    if (data.length === 0) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 24;
    const step = width / (data.length - 1 || 1);
    
    const points = data.map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <svg class="morph-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    `;
  },
  // Compare: Overlapping sparklines with grid, legend, and stats
  (values) => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    let maxLen = 0;
    
    values.forEach(({ value }) => {
      const data = Array.isArray(value) ? value.map(Number) : [];
      maxLen = Math.max(maxLen, data.length);
      data.forEach(val => {
        if (val < globalMin) globalMin = val;
        if (val > globalMax) globalMax = val;
      });
    });
    
    if (!isFinite(globalMin)) globalMin = 0;
    if (!isFinite(globalMax)) globalMax = 100;
    const globalRange = globalMax - globalMin || 1;
    const width = 100;
    const height = 50;
    const padding = 2;
    
    // Calculate averages for each series
    const seriesStats = values.map(({ item, value, color }) => {
      const data = Array.isArray(value) ? value.map(Number) : [];
      const validData = data.filter(n => !isNaN(n));
      const avg = validData.length > 0 ? validData.reduce((a, b) => a + b, 0) / validData.length : 0;
      const seriesMin = validData.length > 0 ? Math.min(...validData) : 0;
      const seriesMax = validData.length > 0 ? Math.max(...validData) : 0;
      return { item, color, avg, min: seriesMin, max: seriesMax };
    });
    
    // Grid lines at 25%, 50%, 75%
    const gridLines = [0.25, 0.5, 0.75].map(pct => {
      const y = height - (pct * (height - 2 * padding)) - padding;
      const val = globalMin + pct * globalRange;
      return { y, val };
    });
    
    return `
      <div class="morph-sparkline-compare">
        <svg class="sparkline-overlay" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <!-- Grid lines -->
          ${gridLines.map(({ y }) => `
            <line x1="0" y1="${y}" x2="${width}" y2="${y}" class="sparkline-grid" />
          `).join('')}
          
          <!-- Series lines -->
          ${values.map(({ value, color }) => {
            const data = Array.isArray(value) ? value.map(Number) : [];
            if (data.length === 0) return '';
            
            const step = width / (data.length - 1 || 1);
            const points = data.map((val, idx) => {
              const x = idx * step;
              const y = height - padding - ((val - globalMin) / globalRange) * (height - 2 * padding);
              return `${x},${y}`;
            }).join(' ');
            
            return `<polyline points="${points}" fill="none" stroke="${escapeHtml(color)}" stroke-width="2" opacity="0.85" />`;
          }).join('')}
        </svg>
        
        <div class="sparkline-scale">
          <span class="scale-max">${formatNumber(globalMax)}</span>
          <span class="scale-mid">${formatNumber(globalMin + globalRange / 2)}</span>
          <span class="scale-min">${formatNumber(globalMin)}</span>
        </div>
        
        <div class="sparkline-legend">
          ${seriesStats.map(({ item, color, avg }) => `
            <span class="sparkline-legend-item" style="--item-color: ${escapeHtml(color)}">
              ${escapeHtml(item.name)} <span class="legend-avg">Ø ${formatNumber(avg)}</span>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }
);
