/**
 * AMORPH v7 - Range Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

interface RangeValue {
  min?: number;
  von?: number;
  from?: number;
  max?: number;
  bis?: number;
  to?: number;
  value?: number;
  wert?: number;
  current?: number;
}

function parseRange(value: unknown): { min: number; max: number; current: number } | null {
  if (typeof value !== 'object' || value === null) return null;
  
  const obj = value as RangeValue;
  const min = Number(obj.min ?? obj.von ?? obj.from ?? 0);
  const max = Number(obj.max ?? obj.bis ?? obj.to ?? 100);
  const current = Number(obj.value ?? obj.wert ?? obj.current ?? min);
  
  return { min, max, current };
}

export const range = createUnifiedMorph(
  'range',
  (value) => {
    const r = parseRange(value);
    if (!r) return `<span class="morph-range">${escapeHtml(value)}</span>`;
    
    const pct = r.max > r.min ? ((r.current - r.min) / (r.max - r.min)) * 100 : 0;
    
    return `
      <div class="morph-range">
        <div class="range-track">
          <div class="range-fill" style="width: ${pct}%"></div>
          <div class="range-marker" style="left: ${pct}%"></div>
        </div>
        <div class="range-labels">
          <span class="range-min">${formatNumber(r.min)}</span>
          <span class="range-current">${formatNumber(r.current)}</span>
          <span class="range-max">${formatNumber(r.max)}</span>
        </div>
      </div>
    `;
  },
  // Compare: Overlapping ranges
  (values) => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    const ranges = values.map(({ value }) => {
      const r = parseRange(value);
      if (r) {
        globalMin = Math.min(globalMin, r.min);
        globalMax = Math.max(globalMax, r.max);
      }
      return r;
    });
    
    if (!isFinite(globalMin)) globalMin = 0;
    if (!isFinite(globalMax)) globalMax = 100;
    const globalRange = globalMax - globalMin || 1;
    
    return `
      <div class="morph-range-compare">
        <div class="range-compare-track">
          ${values.map(({ item, color }, idx) => {
            const r = ranges[idx];
            if (!r) return '';
            const left = ((r.min - globalMin) / globalRange) * 100;
            const width = ((r.max - r.min) / globalRange) * 100;
            return `
              <div class="range-bar" style="
                left: ${left}%;
                width: ${width}%;
                --item-color: ${escapeHtml(color)};
              " title="${escapeHtml(item.name)}: ${formatNumber(r.min)} – ${formatNumber(r.max)}"></div>
            `;
          }).join('')}
        </div>
        <div class="range-scale">
          <span>${formatNumber(globalMin)}</span>
          <span>${formatNumber(globalMax)}</span>
        </div>
      </div>
    `;
  }
);
