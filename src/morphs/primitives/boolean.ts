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
    return `<span class="morph-boolean" data-value="${bool}">${bool ? '✓' : '✗'}</span>`;
  },
  // Compare: Matrix showing agreement/disagreement
  (values) => {
    const bools = values.map(({ value }) => parseBoolean(value));
    const trueCount = bools.filter(b => b).length;
    const falseCount = bools.length - trueCount;
    const allSame = trueCount === 0 || falseCount === 0;
    const majority = trueCount >= falseCount;
    
    return `
      <div class="morph-boolean-compare">
        <div class="boolean-matrix">
          ${values.map(({ item, color }, idx) => {
            const bool = bools[idx];
            const isOutlier = bool !== majority && !allSame;
            return `
              <div class="boolean-cell ${bool ? 'bool-true' : 'bool-false'} ${isOutlier ? 'bool-outlier' : ''}" 
                   style="--item-color: ${escapeHtml(color)}"
                   title="${escapeHtml(item.name)}">
                ${bool ? '✓' : '✗'}
              </div>
            `;
          }).join('')}
        </div>
        <div class="boolean-summary">
          ${allSame 
            ? `<span class="bool-unanimous">${majority ? '✓' : '✗'} Einstimmig</span>`
            : `<span class="bool-split">✓ ${trueCount} / ✗ ${falseCount}</span>`
          }
        </div>
      </div>
    `;
  }
);
