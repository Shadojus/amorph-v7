/**
 * AMORPH v7 - Boolean Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

function parseBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1' || value === 'ja' || value === 'yes';
}

export const boolean = createUnifiedMorph(
  'boolean',
  (value) => {
    const bool = parseBoolean(value);
    return `
      <span class="morph-boolean morph-boolean-${bool ? 'true' : 'false'}" role="img" aria-label="${bool ? 'Yes' : 'No'}">
        <span class="bool-icon" aria-hidden="true">${bool ? '✓' : '✗'}</span>
      </span>
    `;
  },
  // Compare: Clean grid with colored indicators
  (values) => {
    const bools = values.map(({ value, color }) => ({ 
      bool: parseBoolean(value), 
      color 
    }));
    
    const allSame = bools.every(b => b.bool === bools[0].bool);
    
    if (allSame) {
      return `
        <div class="boolean-compare-wrapper boolean-all-same">
          <span class="bool-result ${bools[0].bool ? 'bool-true' : 'bool-false'}">
            ${bools[0].bool ? '✓ Alle ja' : '✗ Alle nein'}
          </span>
        </div>
      `;
    }
    
    return `
      <div class="boolean-compare-wrapper">
        ${bools.map(({ bool, color }) => `
          <div class="bool-row" style="--item-color: ${escapeHtml(color)}">
            <span class="cmp-dot"></span>
            <span class="bool-icon ${bool ? 'bool-true' : 'bool-false'}">${bool ? '✓' : '✗'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
);
