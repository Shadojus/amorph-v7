/**
 * AMORPH v7 - Object Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const object = createUnifiedMorph(
  'object',
  (value) => {
    if (typeof value !== 'object' || value === null) {
      return `<span class="morph-text">${escapeHtml(value)}</span>`;
    }
    
    if (Array.isArray(value)) {
      return `
        <ul class="morph-list">
          ${value.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      `;
    }
    
    const entries = Object.entries(value as Record<string, unknown>);
    return `
      <dl class="morph-object">
        ${entries.map(([key, val]) => `
          <div class="object-row">
            <dt>${escapeHtml(key)}</dt>
            <dd>${escapeHtml(val)}</dd>
          </div>
        `).join('')}
      </dl>
    `;
  }
);
