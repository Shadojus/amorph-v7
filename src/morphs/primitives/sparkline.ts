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
    // Größere ViewBox für bessere Darstellung
    const width = 120;
    const height = 32;
    const padding = 4;
    const step = (width - padding * 2) / (data.length - 1 || 1);
    
    const points = data.map((val, idx) => {
      const x = padding + idx * step;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });
    
    const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    
    // Lichtkugel am letzten Datenpunkt
    const lastPoint = points[points.length - 1];
    
    const last = data[data.length - 1];
    const first = data[0];
    const trend = last > first ? '↑' : last < first ? '↓' : '→';
    
    return `
      <div class="morph-sparkline-single">
        <svg class="morph-sparkline" viewBox="0 0 ${width} ${height}">
          <polyline class="sparkline-path" points="${polylinePoints}" />
          <circle class="sparkline-point" cx="${lastPoint.x.toFixed(1)}" cy="${lastPoint.y.toFixed(1)}" r="3" />
        </svg>
        <span class="sparkline-value">${formatNumber(last)}</span>
        <span class="sparkline-trend sparkline-trend--${trend === '↑' ? 'up' : trend === '↓' ? 'down' : 'flat'}">${trend}</span>
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
            return `<polyline class="sparkline-line" points="${points}" style="--item-color: ${escapeHtml(color)}" />`;
          }).join('')}
        </svg>
        <div class="sparkline-legend">
          ${datasets.map(({ color, name, last, first }) => {
            const trend = last > first ? '↑' : last < first ? '↓' : '→';
            return `
              <div class="sparkline-legend-item" style="--item-color: ${escapeHtml(color)}">
                <span class="cmp-dot"></span>
                <span class="sparkline-val">${formatNumber(last)} ${trend}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
);
