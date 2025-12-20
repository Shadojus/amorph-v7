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
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  },
  // Compare: Highlight common/unique items
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
      <div class="morph-list-compare">
        ${common.length > 0 ? `
          <div class="list-group list-common">
            <span class="list-group-label">✓ Gemeinsam (${common.length})</span>
            <ul>
              ${common.map(([item]) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${partial.length > 0 ? `
          <div class="list-group list-partial">
            <span class="list-group-label">◐ Teilweise (${partial.length})</span>
            <ul>
              ${partial.map(([item, { count, sources }]) => `
                <li title="${sources.join(', ')}">${escapeHtml(item)} <span class="list-count">${count}/${totalSources}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        ${unique.length > 0 ? `
          <div class="list-group list-unique">
            <span class="list-group-label">○ Einzigartig (${unique.length})</span>
            <ul>
              ${unique.map(([item, { sources }]) => `
                <li title="${sources[0]}">${escapeHtml(item)} <span class="list-source">${escapeHtml(sources[0])}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
);
