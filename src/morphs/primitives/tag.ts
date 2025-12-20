/**
 * AMORPH v7 - Tag Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const tag = createUnifiedMorph(
  'tag',
  (value) => {
    const tags = Array.isArray(value) ? value : [value];
    return `
      <div class="morph-tags">
        ${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    `;
  },
  // Compare: Highlight common/unique tags with counts
  (values) => {
    // Count occurrences of each tag
    const tagCounts = new Map<string, { count: number; items: string[] }>();
    const totalItems = values.length;
    
    values.forEach(({ item, value }) => {
      const tags = Array.isArray(value) ? value : [value];
      const seen = new Set<string>();
      
      tags.forEach(t => {
        const tagStr = String(t);
        if (seen.has(tagStr)) return;
        seen.add(tagStr);
        
        const existing = tagCounts.get(tagStr) || { count: 0, items: [] };
        existing.count++;
        existing.items.push(item.name);
        tagCounts.set(tagStr, existing);
      });
    });
    
    // Sort: common first, then by name
    const sorted = [...tagCounts.entries()].sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return a[0].localeCompare(b[0]);
    });
    
    return `
      <div class="morph-tags-compare">
        ${sorted.map(([tagStr, { count, items }]) => {
          const isCommon = count === totalItems;
          const isUnique = count === 1;
          const classes = ['tag-compare'];
          if (isCommon) classes.push('tag-common');
          else if (isUnique) classes.push('tag-unique');
          else classes.push('tag-partial');
          
          return `
            <span class="${classes.join(' ')}" title="${items.join(', ')}">
              ${escapeHtml(tagStr)}
              ${!isCommon ? `<span class="tag-count">${count}/${totalItems}</span>` : ''}
            </span>
          `;
        }).join('')}
        <div class="tag-legend">
          <span class="tag-legend-item"><span class="tag-indicator tag-common"></span> Gemeinsam</span>
          <span class="tag-legend-item"><span class="tag-indicator tag-partial"></span> Teilweise</span>
          <span class="tag-legend-item"><span class="tag-indicator tag-unique"></span> Einzigartig</span>
        </div>
      </div>
    `;
  }
);
