/**
 * AMORPH v7 - Object Morph
 * 
 * Rendert komplexe Objekte als Key-Value Paare.
 * Unterstützt verschachtelte Objekte rekursiv.
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

/**
 * Rekursives Rendering von Werten
 */
function renderValue(val: unknown, depth = 0): string {
  // Schutz gegen zu tiefe Verschachtelung
  if (depth > 3) {
    return `<span class="morph-text morph-muted">...</span>`;
  }
  
  // Null/undefined
  if (val === null || val === undefined) {
    return `<span class="morph-text morph-muted">–</span>`;
  }
  
  // Primitive Typen
  if (typeof val !== 'object') {
    return `<span class="morph-text">${escapeHtml(val)}</span>`;
  }
  
  // Arrays
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return `<span class="morph-text morph-muted">[]</span>`;
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
    // Array von Objekten
    return `
      <div class="morph-object-list">
        ${val.map((item, i) => `
          <div class="morph-object-list-item">
            <span class="morph-object-list-index">${i + 1}</span>
            ${renderValue(item, depth + 1)}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Objekte
  const entries = Object.entries(val as Record<string, unknown>);
  if (entries.length === 0) {
    return `<span class="morph-text morph-muted">{}</span>`;
  }
  
  return `
    <dl class="morph-object${depth > 0 ? ' morph-object-nested' : ''}">
      ${entries.map(([key, v]) => `
        <div class="morph-object-row">
          <dt>${escapeHtml(key)}</dt>
          <dd>${renderValue(v, depth + 1)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

export const object = createUnifiedMorph(
  'object',
  (value) => renderValue(value, 0)
);
