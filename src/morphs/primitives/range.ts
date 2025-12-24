/**
 * AMORPH v7 - Range Morph
 * 
 * Intelligente Skalierung für kleine UND große Zahlen
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
  avg?: number;
  durchschnitt?: number;
  unit?: string;
  einheit?: string;
}

function parseRange(value: unknown): { min: number; max: number; current: number; avg?: number; unit?: string } | null {
  if (typeof value !== 'object' || value === null) return null;
  
  const obj = value as RangeValue;
  const min = Number(obj.min ?? obj.von ?? obj.from ?? 0);
  const max = Number(obj.max ?? obj.bis ?? obj.to ?? 100);
  const current = Number(obj.value ?? obj.wert ?? obj.current ?? min);
  const avg = obj.avg ?? obj.durchschnitt;
  const unit = obj.unit ?? obj.einheit;
  
  return { min, max, current, avg: avg !== undefined ? Number(avg) : undefined, unit };
}

/**
 * Smart number formatting based on magnitude
 */
function smartFormat(num: number): string {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  
  // Very small numbers (< 0.01) - show more decimals
  if (abs < 0.01) return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  // Small numbers (< 1) - show 2-3 decimals
  if (abs < 1) return num.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 3 });
  // Numbers < 10 - show 1-2 decimals
  if (abs < 10) return num.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  // Larger numbers - standard formatting
  return formatNumber(num);
}

export const range = createUnifiedMorph(
  'range',
  (value) => {
    const r = parseRange(value);
    if (!r) return `<span class="morph-range">${escapeHtml(value)}</span>`;
    
    const pct = r.max > r.min ? ((r.current - r.min) / (r.max - r.min)) * 100 : 0;
    const unitStr = r.unit ? `<span class="morph-range-unit">${escapeHtml(r.unit)}</span>` : '';
    
    return `
      <div class="morph-range">
        <div class="morph-range-track">
          <div class="morph-range-fill" style="width: ${pct}%"></div>
          <div class="morph-range-marker" style="left: ${pct}%"></div>
        </div>
        <div class="morph-range-labels">
          <span class="morph-range-min">${smartFormat(r.min)}</span>
          <span class="morph-range-current">${smartFormat(r.current)}${unitStr}</span>
          <span class="morph-range-max">${smartFormat(r.max)}</span>
        </div>
      </div>
    `;
  },
  // Compare: Enhanced with stats display
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
    
    // Get unit from first valid range
    const firstRange = ranges.find(r => r?.unit);
    const unitStr = firstRange?.unit ? ` ${firstRange.unit}` : '';
    
    return `
      <div class="range-compare-wrapper">
        <div class="range-scale">
          <span class="range-scale-min">${smartFormat(globalMin)}</span>
          <span class="range-scale-max">${smartFormat(globalMax)}${unitStr}</span>
        </div>
        <div class="range-bars">
          ${values.map(({ color, item }, idx) => {
            const r = ranges[idx];
            if (!r) return '';
            const left = ((r.min - globalMin) / globalRange) * 100;
            const width = Math.max(((r.max - r.min) / globalRange) * 100, 2);
            // Show avg if available
            const avgStr = r.avg !== undefined ? ` (Ø ${smartFormat(r.avg)})` : '';
            return `
              <div class="range-row" data-species="${escapeHtml(item.name)}" style="--item-color: ${escapeHtml(color)}">
                <div class="range-track">
                  <div class="range-fill" style="left: ${left}%; width: ${width}%"></div>
                </div>
                <span class="range-val">${smartFormat(r.min)}–${smartFormat(r.max)}${avgStr}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
);
