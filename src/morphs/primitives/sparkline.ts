/**
 * AMORPH v7 - Sparkline Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

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
  // Compare: Overlapping sparklines
  (values) => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    values.forEach(({ value }) => {
      const data = Array.isArray(value) ? value.map(Number) : [];
      data.forEach(val => {
        if (val < globalMin) globalMin = val;
        if (val > globalMax) globalMax = val;
      });
    });
    
    if (!isFinite(globalMin)) globalMin = 0;
    if (!isFinite(globalMax)) globalMax = 100;
    const globalRange = globalMax - globalMin || 1;
    const width = 100;
    const height = 40;
    
    return `
      <svg class="morph-sparkline-compare" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${values.map(({ value, color }) => {
          const data = Array.isArray(value) ? value.map(Number) : [];
          if (data.length === 0) return '';
          
          const step = width / (data.length - 1 || 1);
          const points = data.map((val, idx) => {
            const x = idx * step;
            const y = height - ((val - globalMin) / globalRange) * height;
            return `${x},${y}`;
          }).join(' ');
          
          return `<polyline points="${points}" fill="none" stroke="${escapeHtml(color)}" stroke-width="1.5" opacity="0.8" />`;
        }).join('')}
      </svg>
    `;
  }
);
