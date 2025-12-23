/**
 * AMORPH v7 - Text Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const text = createUnifiedMorph(
  'text',
  (value) => `<span class="morph-text">${escapeHtml(value)}</span>`,
  // Compare: Clean list with color dots
  (values) => {
    const texts = values
      .map(({ value, color, item }) => ({
        color,
        text: String(value ?? ''),
        name: item.name || item.id
      }))
      .filter(t => t.text && t.text.trim() !== ''); // Filter out empty values
    
    if (texts.length === 0) return '<span class="no-value">–</span>';
    
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
        ${texts.map(({ color, text, name }) => `
          <div class="text-row" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
            <span class="cmp-dot"></span>
            <span class="text-value">${escapeHtml(text)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
);
