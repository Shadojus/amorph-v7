/**
 * AMORPH v7 - Object Morph
 * 
 * Rendert komplexe Objekte als Key-Value Paare.
 * Unterstützt verschachtelte Objekte rekursiv.
 * Compare-Modus zeigt Werte tabellarisch nebeneinander.
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

/**
 * Rekursives Rendering von Werten - CLEAN DESIGN
 */
function renderValue(val: unknown, depth = 0): string {
  // Schutz gegen zu tiefe Verschachtelung
  if (depth > 3) {
    return `<span class="morph-text morph-muted">…</span>`;
  }
  
  // Null/undefined
  if (val === null || val === undefined) {
    return `<span class="morph-text morph-muted">–</span>`;
  }
  
  // Primitive Typen
  if (typeof val !== 'object') {
    if (typeof val === 'number') {
      return `<span class="morph-object-num">${formatNumber(val as number)}</span>`;
    }
    return `<span class="morph-text">${escapeHtml(val)}</span>`;
  }
  
  // Arrays
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return `<span class="morph-text morph-muted">–</span>`;
    }
    // Prüfen ob Array von Primitiven oder Objekten
    const isPrimitiveArray = val.every(item => typeof item !== 'object' || item === null);
    if (isPrimitiveArray) {
      return `
        <span class="morph-tag-list">
          ${val.map(item => `<span class="morph-tag">${escapeHtml(item)}</span>`).join('')}
        </span>
      `;
    }
    // Array von Objekten - compact list
    return `
      <div class="morph-object-items">
        ${val.map(item => renderValue(item, depth + 1)).join('')}
      </div>
    `;
  }
  
  // Objekte - Clean Key-Value Layout
  const entries = Object.entries(val as Record<string, unknown>);
  if (entries.length === 0) {
    return `<span class="morph-text morph-muted">–</span>`;
  }
  
  return `
    <div class="morph-object${depth > 0 ? ' morph-object-nested' : ''}">
      ${entries.map(([key, v]) => `
        <div class="morph-object-row">
          <span class="morph-object-key">${escapeHtml(key.replace(/_/g, ' '))}</span>
          <span class="morph-object-value">${renderValue(v, depth + 1)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Alle Schlüssel aus einem verschachtelten Objekt sammeln
 */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      keys.push(...collectKeys(val as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Verschachtelten Wert per Punkt-Pfad abrufen
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Format value for compare table
 */
function formatCompareValue(val: unknown): string {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'number') return formatNumber(val);
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  if (Array.isArray(val)) return val.map(v => escapeHtml(String(v))).join(', ');
  return escapeHtml(String(val));
}

/**
 * Gruppiere Pfade nach erstem Segment
 */
function groupPaths(paths: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const path of paths) {
    const [first, ...rest] = path.split('.');
    if (!groups.has(first)) groups.set(first, []);
    groups.get(first)!.push(rest.length > 0 ? rest.join('.') : '');
  }
  return groups;
}

export const object = createUnifiedMorph(
  'object',
  (value) => renderValue(value, 0),
  // Compare: Tabellarische Darstellung mit Werten nebeneinander
  (values) => {
    // Alle Schlüssel sammeln
    const allKeys = new Set<string>();
    const objectValues: { obj: Record<string, unknown>; color: string; name: string }[] = [];
    
    for (const { value, color, item } of values) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        objectValues.push({ obj, color, name: item.name || item.id });
        collectKeys(obj).forEach(k => allKeys.add(k));
      }
    }
    
    if (objectValues.length === 0 || allKeys.size === 0) {
      return '<span class="morph-text morph-muted">Keine Objekt-Daten zum Vergleichen</span>';
    }
    
    const keys = [...allKeys].sort();
    const groups = groupPaths(keys);
    
    // Render table
    const rows: string[] = [];
    
    for (const [group, subPaths] of groups) {
      // Gruppen-Header wenn es verschachtelte Pfade gibt
      if (subPaths.some(p => p !== '')) {
        rows.push(`
          <tr class="object-compare-group-header">
            <th colspan="${objectValues.length + 1}">${escapeHtml(group)}</th>
          </tr>
        `);
        
        for (const subPath of subPaths.filter(p => p !== '')) {
          const fullPath = `${group}.${subPath}`;
          const vals = objectValues.map(({ obj }) => getNestedValue(obj, fullPath));
          const numericVals = vals.filter((v): v is number => typeof v === 'number');
          
          // Berechne Unterschied für numerische Werte
          let diff = '';
          if (numericVals.length > 1) {
            const maxVal = Math.max(...numericVals);
            const minVal = Math.min(...numericVals);
            if (maxVal !== minVal) {
              diff = ` <span class="object-compare-diff">Δ${formatNumber(maxVal - minVal)}</span>`;
            }
          }
          
          rows.push(`
            <tr class="object-compare-row">
              <td class="object-compare-key">${escapeHtml(subPath)}${diff}</td>
              ${objectValues.map(({ obj, color }, i) => {
                const val = getNestedValue(obj, fullPath);
                const isMax = typeof val === 'number' && numericVals.length > 1 && val === Math.max(...numericVals);
                const isMin = typeof val === 'number' && numericVals.length > 1 && val === Math.min(...numericVals);
                return `<td class="object-compare-value${isMax ? ' is-max' : ''}${isMin ? ' is-min' : ''}" style="--item-color: ${escapeHtml(color)}">${formatCompareValue(val)}</td>`;
              }).join('')}
            </tr>
          `);
        }
      } else {
        // Einfacher Schlüssel ohne Verschachtelung
        const vals = objectValues.map(({ obj }) => getNestedValue(obj, group));
        const numericVals = vals.filter((v): v is number => typeof v === 'number');
        
        let diff = '';
        if (numericVals.length > 1) {
          const maxVal = Math.max(...numericVals);
          const minVal = Math.min(...numericVals);
          if (maxVal !== minVal) {
            diff = ` <span class="object-compare-diff">Δ${formatNumber(maxVal - minVal)}</span>`;
          }
        }
        
        rows.push(`
          <tr class="object-compare-row">
            <td class="object-compare-key">${escapeHtml(group)}${diff}</td>
            ${objectValues.map(({ obj, color }) => {
              const val = getNestedValue(obj, group);
              const isMax = typeof val === 'number' && numericVals.length > 1 && val === Math.max(...numericVals);
              const isMin = typeof val === 'number' && numericVals.length > 1 && val === Math.min(...numericVals);
              return `<td class="object-compare-value${isMax ? ' is-max' : ''}${isMin ? ' is-min' : ''}" style="--item-color: ${escapeHtml(color)}">${formatCompareValue(val)}</td>`;
            }).join('')}
          </tr>
        `);
      }
    }
    
    return `
      <div class="object-compare-wrapper">
        <table class="object-compare-table">
          <thead>
            <tr>
              <th class="object-compare-header-key"></th>
              ${objectValues.map(({ color, name }) => `
                <th class="object-compare-header-item" style="--item-color: ${escapeHtml(color)}">
                  <span class="cmp-dot"></span>
                  ${escapeHtml(name)}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.join('')}
          </tbody>
        </table>
      </div>
    `;
  }
);
