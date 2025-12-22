/**
 * AMORPH v7 - List Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const list = createUnifiedMorph(
  'list',
  (value) => {
    const items = Array.isArray(value) ? value : [value];
    return `
      <ul class="morph-list">
        ${items.map(item => `<li class="morph-list-item">${escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  },
  // Compare: Clean grouped display with icons
  (values) => {
    // Count occurrences of each item
    const itemCounts = new Map<string, { count: number; sources: string[] }>();
    const totalSources = values.length;
    
    values.forEach(({ item, value }) => {
      const items = Array.isArray(value) ? value : [value];
      const seen = new Set<string>();
      
      items.forEach(i => {
        const itemStr = String(i);
        if (seen.has(itemStr)) return;
        seen.add(itemStr);
        
        const existing = itemCounts.get(itemStr) || { count: 0, sources: [] };
        existing.count++;
        existing.sources.push(item.name);
        itemCounts.set(itemStr, existing);
      });
    });
    
    // Sort: common first, then alphabetically
    const sorted = [...itemCounts.entries()].sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return a[0].localeCompare(b[0]);
    });
    
    // Group by category
    const common = sorted.filter(([, { count }]) => count === totalSources);
    const partial = sorted.filter(([, { count }]) => count > 1 && count < totalSources);
    const unique = sorted.filter(([, { count }]) => count === 1);
    
    return `
      <div class="list-compare-wrapper">
        ${common.length > 0 ? `
          <div class="list-section list-common">
            <span class="list-section-label">✓ Gemeinsam</span>
            <div class="list-items">
              ${common.slice(0, 8).map(([item]) => `
                <span class="list-item">${escapeHtml(item)}</span>
              `).join('')}
              ${common.length > 8 ? `<span class="list-more">+${common.length - 8}</span>` : ''}
            </div>
          </div>
        ` : ''}
        ${partial.length > 0 ? `
          <div class="list-section list-partial">
            <span class="list-section-label">◐ Teilweise</span>
            <div class="list-items">
              ${partial.slice(0, 6).map(([item, { count }]) => `
                <span class="list-item" title="${count}/${totalSources}">${escapeHtml(item)} <span class="list-count">${count}</span></span>
              `).join('')}
              ${partial.length > 6 ? `<span class="list-more">+${partial.length - 6}</span>` : ''}
            </div>
          </div>
        ` : ''}
        ${unique.length > 0 ? `
          <div class="list-section list-unique">
            <span class="list-section-label">○ Einzigartig</span>
            <div class="list-items">
              ${unique.slice(0, 6).map(([item]) => `
                <span class="list-item">${escapeHtml(item)}</span>
              `).join('')}
              ${unique.length > 6 ? `<span class="list-more">+${unique.length - 6}</span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
);
