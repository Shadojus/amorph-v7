/**
 * AMORPH v7 - Pie Chart Morph
 * 
 * Zeigt Anteile als Tortendiagramm (CSS conic-gradient).
 * Struktur: [{label: "", value: 0}]
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

interface PieData {
  label?: string;
  name?: string;
  value?: number;
  wert?: number;
}

const PIE_COLORS = [
  'var(--pie-color-1)',  // 100% - Hauptblau
  'var(--pie-color-2)',  // 70%
  'var(--pie-color-3)',  // 50%
  'var(--pie-color-4)',  // 35%
  'var(--pie-color-5)',  // 20%
  'var(--pie-color-6)'   // Weiß-Akzent
];

function parsePieItem(d: unknown): { label: string; value: number } {
  if (typeof d === 'number') {
    return { label: '', value: d };
  }
  if (typeof d === 'object' && d !== null) {
    const obj = d as PieData;
    return {
      label: String(obj.label || obj.name || ''),
      value: Number(obj.value ?? obj.wert ?? 0)
    };
  }
  return { label: '', value: 0 };
}

/**
 * Build CSS conic-gradient string from parsed data
 */
function buildPieGradient(parsed: { label: string; value: number }[], total: number): string {
  let currentAngle = 0;
  const gradientStops: string[] = [];
  
  parsed.forEach((item, idx) => {
    const pct = (item.value / total) * 100;
    const color = PIE_COLORS[idx % PIE_COLORS.length];
    gradientStops.push(`${color} ${currentAngle}deg ${currentAngle + (pct * 3.6)}deg`);
    currentAngle += pct * 3.6;
  });
  
  return `conic-gradient(${gradientStops.join(', ')})`;
}

export const pie = createUnifiedMorph(
  'pie',
  (value) => {
    const data = Array.isArray(value) ? value : [value];
    const parsed = data.map(parsePieItem).filter(d => d.value > 0);
    const total = parsed.reduce((sum, d) => sum + d.value, 0);
    
    if (total === 0) {
      return '<div class="morph-pie morph-pie--empty">Keine Daten</div>';
    }
    
    const gradient = buildPieGradient(parsed, total);
    
    return `
      <div class="morph-pie">
        <div class="morph-pie-chart" style="--pie-gradient: ${gradient}"></div>
        <div class="morph-pie-legend">
          ${parsed.map((item, idx) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return `
              <div class="morph-pie-item" data-pie-idx="${idx}">
                <span class="morph-pie-dot"></span>
                <span class="morph-pie-label">${escapeHtml(item.label || `#${idx + 1}`)}</span>
                <span class="morph-pie-value">${pct}%</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
  // Compare: Multiple pie charts side-by-side
  (values) => {
    return `
      <div class="morph-pie-compare">
        ${values.map(({ item, value, color: itemColor }) => {
          const data = Array.isArray(value) ? value : [value];
          const parsed = data.map(parsePieItem).filter(d => d.value > 0);
          const total = parsed.reduce((sum, d) => sum + d.value, 0);
          
          if (total === 0) {
            return `<div class="pie-cell" style="--item-color: ${escapeHtml(itemColor)}">-</div>`;
          }
          
          const gradient = buildPieGradient(parsed, total);
          
          return `
            <div class="pie-cell" style="--item-color: ${escapeHtml(itemColor)}">
              <div class="pie-mini" style="--pie-gradient: ${gradient}"></div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
