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
      <div class="morph-bar" role="img" aria-label="Bar chart with ${parsed.length} items">
        ${parsed.map(({ label, value: val }) => {
          const pct = (val / max) * 100;
          return `
            <div class="morph-bar-item" role="listitem" aria-label="${escapeHtml(label || 'Value')}: ${formatNumber(val)}">
              ${label ? `<span class="morph-bar-label">${escapeHtml(label)}</span>` : ''}
              <div class="morph-bar-track" role="progressbar" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="${max}">
                <div class="morph-bar-fill" style="width: ${pct}%"></div>
              </div>
              <span class="morph-bar-value">${formatNumber(val)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  // Compare: Compact inline bars with values
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
        ${[...allLabels].map(label => {
          const valuesForLabel = values.map(({ item }) => 
            itemData.get(item.id)?.get(label) ?? 0
          );
          const validValues = valuesForLabel.filter(v => v > 0);
          
          // Skip labels where no species has data
          if (validValues.length === 0) return '';
          
          const avg = validValues.length > 0 
            ? validValues.reduce((a, b) => a + b, 0) / validValues.length 
            : 0;
          const avgPct = (avg / max) * 100;
          
          return `
            <div class="bar-group">
              <span class="bar-group-label">${escapeHtml(label)}</span>
              <div class="bar-group-track">
                ${values.map(({ item, color }) => {
                  const val = itemData.get(item.id)?.get(label) ?? 0;
                  // Skip species with no value for this label
                  if (val === 0) return '';
                  const pct = (val / max) * 100;
                  const name = item.name || item.id;
                  return `
                    <div class="bar-row" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
                      <div class="bar-fill-track">
                        <div class="bar-fill" style="width: ${pct}%"></div>
                      </div>
                      <span class="bar-val">${formatNumber(val)}</span>
                    </div>
                  `;
                }).join('')}
                ${validValues.length > 1 ? `<div class="bar-avg-line" style="left: calc(${avgPct}% * 0.75)"></div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
