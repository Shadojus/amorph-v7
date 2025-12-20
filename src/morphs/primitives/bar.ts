/**
 * AMORPH v7 - Bar Chart Morph
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

interface BarData {
  label?: string;
  name?: string;
  value?: number;
  wert?: number;
}

function parseBarItem(d: unknown): { label: string; value: number } {
  if (typeof d === 'number') {
    return { label: '', value: d };
  }
  if (typeof d === 'object' && d !== null) {
    const obj = d as BarData;
    return {
      label: String(obj.label || obj.name || ''),
      value: Number(obj.value ?? obj.wert ?? 0)
    };
  }
  return { label: '', value: 0 };
}

export const bar = createUnifiedMorph(
  'bar',
  (value) => {
    const data = Array.isArray(value) ? value : [value];
    const parsed = data.map(parseBarItem);
    const max = Math.max(...parsed.map(d => d.value), 1);
    
    return `
      <div class="morph-bar">
        ${parsed.map(({ label, value: val }) => {
          const pct = (val / max) * 100;
          return `
            <div class="morph-bar-item">
              ${label ? `<span class="morph-bar-label">${escapeHtml(label)}</span>` : ''}
              <div class="morph-bar-track">
                <div class="morph-bar-fill" style="width: ${pct}%">
                  <span class="morph-bar-value">${formatNumber(val)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  // Compare: Grouped bars
  (values) => {
    const allLabels = new Set<string>();
    const itemData = new Map<string, Map<string, number>>();
    
    values.forEach(({ item, value }) => {
      const data = Array.isArray(value) ? value : [value];
      const dataMap = new Map<string, number>();
      
      data.forEach((d, idx) => {
        const { label, value: val } = parseBarItem(d);
        const finalLabel = label || `#${idx + 1}`;
        allLabels.add(finalLabel);
        dataMap.set(finalLabel, val);
      });
      
      itemData.set(item.id, dataMap);
    });
    
    let max = 1;
    itemData.forEach(dataMap => {
      dataMap.forEach(val => {
        if (val > max) max = val;
      });
    });
    
    return `
      <div class="morph-bar-compare">
        ${[...allLabels].map(label => `
          <div class="bar-group">
            <span class="bar-group-label">${escapeHtml(label)}</span>
            <div class="bar-group-bars">
              ${values.map(({ item, color }) => {
                const val = itemData.get(item.id)?.get(label) ?? 0;
                const pct = (val / max) * 100;
                return `
                  <div class="bar-grouped" style="--item-color: ${escapeHtml(color)}; width: ${pct}%">
                    <span class="bar-value">${formatNumber(val)}</span>
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
