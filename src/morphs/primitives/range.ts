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
        <div class="morph-range-track">
          <div class="morph-range-fill" style="width: ${pct}%"></div>
          <div class="morph-range-marker" style="left: ${pct}%"></div>
        </div>
        <div class="morph-range-labels">
          <span class="morph-range-min">${formatNumber(r.min)}</span>
          <span class="morph-range-current">${formatNumber(r.current)}</span>
          <span class="morph-range-max">${formatNumber(r.max)}</span>
        </div>
      </div>
    `;
  },
  // Compare: Bar-style range visualization
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
      <div class="range-compare-wrapper">
        <div class="range-scale">
          <span class="range-scale-min">${formatNumber(globalMin)}</span>
          <span class="range-scale-max">${formatNumber(globalMax)}</span>
        </div>
        <div class="range-bars">
          ${values.map(({ color }, idx) => {
            const r = ranges[idx];
            if (!r) return '';
            const left = ((r.min - globalMin) / globalRange) * 100;
            const width = Math.max(((r.max - r.min) / globalRange) * 100, 2);
            return `
              <div class="range-row" style="--item-color: ${escapeHtml(color)}">
                <div class="range-track">
                  <div class="range-fill" style="left: ${left}%; width: ${width}%"></div>
                </div>
                <span class="range-val">${formatNumber(r.min)}–${formatNumber(r.max)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
);
