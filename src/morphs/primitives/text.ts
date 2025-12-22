/**
 * AMORPH v7 - Text Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const text = createUnifiedMorph(
  'text',
  (value) => `<span class="morph-text">${escapeHtml(value)}</span>`,
  // Compare: Clean list with color dots
  (values) => {
    const texts = values.map(({ value, color }) => ({
      color,
      text: String(value ?? '')
    }));
    
    // Check if all same
    const allSame = texts.every(t => t.text === texts[0].text);
    
    if (allSame) {
      return `
        <div class="text-compare-wrapper text-all-same">
          <span class="morph-text">${escapeHtml(texts[0].text)}</span>
        </div>
      `;
    }
    
    return `
      <div class="text-compare-wrapper">
        ${texts.map(({ color, text }) => `
          <div class="text-row" style="--item-color: ${escapeHtml(color)}">
            <span class="cmp-dot"></span>
            <span class="text-value">${escapeHtml(text)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
);
