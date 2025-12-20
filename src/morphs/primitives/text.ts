/**
 * AMORPH v7 - Text Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const text = createUnifiedMorph(
  'text',
  (value) => `<span class="morph-text">${escapeHtml(value)}</span>`,
  // Compare: Show differences or grouped view
  (values) => {
    const texts = values.map(({ item, value, color }) => ({
      item,
      color,
      text: String(value)
    }));
    
    // Check if all same
    const allSame = texts.every(t => t.text === texts[0].text);
    
    if (allSame) {
      return `
        <div class="morph-text-compare text-same">
          <span class="morph-text">${escapeHtml(texts[0].text)}</span>
          <span class="text-match">✓ Identisch</span>
        </div>
      `;
    }
    
    // Group by value
    const groups = new Map<string, { color: string; items: string[] }>();
    texts.forEach(({ item, color, text }) => {
      const existing = groups.get(text) || { color, items: [] };
      existing.items.push(item.name);
      groups.set(text, existing);
    });
    
    // Calculate similarity (simple character overlap)
    const allChars = new Set(texts.flatMap(t => t.text.split('')));
    const commonChars = [...allChars].filter(c => 
      texts.every(t => t.text.includes(c))
    ).length;
    const similarity = allChars.size > 0 ? Math.round((commonChars / allChars.size) * 100) : 0;
    
    return `
      <div class="morph-text-compare">
        ${[...groups.entries()].map(([text, { color, items }]) => `
          <div class="text-variant" style="--item-color: ${escapeHtml(color)}">
            <span class="morph-text">${escapeHtml(text)}</span>
            <span class="text-sources">${items.length > 1 ? `${items.length}×` : escapeHtml(items[0])}</span>
          </div>
        `).join('')}
        <div class="text-stats">
          <span class="text-variants">${groups.size} Varianten</span>
        </div>
      </div>
    `;
  }
);
