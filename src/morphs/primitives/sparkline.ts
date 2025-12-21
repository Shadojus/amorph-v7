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
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x},${y}`;
    }).join(' ');
    
    const last = data[data.length - 1];
    const first = data[0];
    const trend = last > first ? '↑' : last < first ? '↓' : '→';
    
    return `
      <div class="morph-sparkline-single">
        <svg class="morph-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <span class="sparkline-trend">${trend} ${formatNumber(last)}</span>
      </div>
    `;
  },
  // Compare: Overlapping lines with legend
  (values) => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    const datasets = values.map(({ value, color, item }) => {
      const data = Array.isArray(value) ? value.map(Number) : [];
      data.forEach(val => {
        if (val < globalMin) globalMin = val;
        if (val > globalMax) globalMax = val;
      });
      const last = data[data.length - 1] ?? 0;
      const first = data[0] ?? 0;
      return { data, color, name: item.name || item.id, last, first };
    });
    
    if (!isFinite(globalMin)) globalMin = 0;
    if (!isFinite(globalMax)) globalMax = 100;
    const globalRange = globalMax - globalMin || 1;
    const width = 100;
    const height = 40;
    const padding = 3;
    
    return `
      <div class="sparkline-compare-wrapper">
        <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          ${datasets.map(({ data, color }) => {
            if (data.length === 0) return '';
            const step = width / (data.length - 1 || 1);
            const points = data.map((val, idx) => {
              const x = idx * step;
              const y = height - padding - ((val - globalMin) / globalRange) * (height - 2 * padding);
              return `${x},${y}`;
            }).join(' ');
            return `<polyline points="${points}" fill="none" stroke="${escapeHtml(color)}" stroke-width="1.5" opacity="0.9" />`;
          }).join('')}
        </svg>
        <div class="sparkline-legend">
          ${datasets.map(({ color, name, last, first }) => {
            const trend = last > first ? '↑' : last < first ? '↓' : '→';
            return `
              <div class="sparkline-legend-item" style="--item-color: ${escapeHtml(color)}">
                <span class="sparkline-dot"></span>
                <span class="sparkline-val">${formatNumber(last)} ${trend}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
);
