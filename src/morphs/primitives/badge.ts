/**
 * AMORPH v7 - Badge Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

const DANGER_KEYWORDS = ['giftig', 'toxic', 'gefährlich', 'danger', 'tödlich', 'deadly'];
const SUCCESS_KEYWORDS = ['essbar', 'edible', 'gut', 'good', 'sicher', 'safe'];
const WARNING_KEYWORDS = ['warnung', 'warning', 'vorsicht', 'caution'];
const INFO_KEYWORDS = ['info', 'hinweis', 'note'];

function detectVariant(str: string): string {
  const lower = str.toLowerCase();
  
  if (DANGER_KEYWORDS.some(k => lower.includes(k))) return 'danger';
  if (SUCCESS_KEYWORDS.some(k => lower.includes(k))) return 'success';
  if (WARNING_KEYWORDS.some(k => lower.includes(k))) return 'warning';
  if (INFO_KEYWORDS.some(k => lower.includes(k))) return 'info';
  
  return 'default';
}

export const badge = createUnifiedMorph(
  'badge',
  (value) => {
    const str = String(value);
    const variant = detectVariant(str);
    return `<span class="morph-badge badge-${variant}">${escapeHtml(str)}</span>`;
  },
  // Compare: Group badges by value, show frequency
  (values) => {
    // Group by badge value
    const badgeGroups = new Map<string, { variant: string; items: string[] }>();
    
    values.forEach(({ item, value }) => {
      const str = String(value);
      const variant = detectVariant(str);
      
      const existing = badgeGroups.get(str) || { variant, items: [] };
      existing.items.push(item.name);
      badgeGroups.set(str, existing);
    });
    
    // Sort: most common first
    const sorted = [...badgeGroups.entries()].sort((a, b) => b[1].items.length - a[1].items.length);
    const totalItems = values.length;
    
    // Check if all same
    const allSame = sorted.length === 1;
    
    return `
      <div class="morph-badge-compare">
        ${sorted.map(([badgeStr, { variant, items }]) => {
          const isUnanimous = items.length === totalItems;
          return `
            <div class="badge-group ${isUnanimous ? 'badge-unanimous' : ''}">
              <span class="morph-badge badge-${variant}">${escapeHtml(badgeStr)}</span>
              <span class="badge-frequency" title="${items.join(', ')}">${items.length}/${totalItems}</span>
            </div>
          `;
        }).join('')}
        ${allSame ? '<span class="badge-match">✓ Übereinstimmend</span>' : `<span class="badge-diff">⚡ ${sorted.length} verschiedene Werte</span>`}
      </div>
    `;
  }
);
