/**
 * AMORPH v7 - Tag Morph
 * 
 * Renders tags, with special handling for month numbers (1-12)
 * which get converted to readable month names.
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

// Month names in German
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

const MONTH_NAMES_FULL = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

/**
 * Check if value looks like month numbers (1-12)
 */
function isMonthArray(arr: unknown[], fieldName?: string): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const fieldLower = (fieldName || '').toLowerCase();
  // Field name hint: contains "month" or "monat"
  const hasMonthHint = fieldLower.includes('month') || fieldLower.includes('monat');
  // All values are numbers 1-12
  const allMonthNums = arr.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 12);
  return hasMonthHint && allMonthNums;
}

/**
 * Format month numbers as readable range or list
 * e.g., [2, 3, 4, 5, 6, 7, 8] → "Feb - Aug"
 * e.g., [3, 7, 11] → "Mär, Jul, Nov"
 */
function formatMonthRange(months: number[]): string {
  if (months.length === 0) return '';
  if (months.length === 1) return MONTH_NAMES[months[0] - 1];
  
  // Sort months
  const sorted = [...months].sort((a, b) => a - b);
  
  // Check if consecutive (allowing wrap-around like 11, 12, 1, 2)
  const isConsecutive = (arr: number[]): boolean => {
    for (let i = 1; i < arr.length; i++) {
      const diff = arr[i] - arr[i-1];
      if (diff !== 1) return false;
    }
    return true;
  };
  
  // Check for wrap-around (e.g., [10, 11, 12, 1, 2, 3])
  const checkWrapAround = (arr: number[]): { isWrap: boolean; start: number; end: number } => {
    // Find where the sequence wraps (transition from 12 to 1)
    const sorted12 = arr.filter(m => m >= 10);
    const sorted1 = arr.filter(m => m <= 3);
    if (sorted12.length > 0 && sorted1.length > 0) {
      const allMonths = [...sorted12.sort((a,b) => a-b), ...sorted1.sort((a,b) => a-b)];
      // Check if it's consecutive with wrap
      for (let i = 1; i < allMonths.length; i++) {
        const prev = allMonths[i-1];
        const curr = allMonths[i];
        const diff = prev === 12 ? (curr === 1 ? 1 : 0) : curr - prev;
        if (diff !== 1) return { isWrap: false, start: 0, end: 0 };
      }
      return { isWrap: true, start: sorted12[0], end: sorted1[sorted1.length - 1] };
    }
    return { isWrap: false, start: 0, end: 0 };
  };
  
  if (isConsecutive(sorted)) {
    // Simple consecutive range
    return `${MONTH_NAMES[sorted[0] - 1]} – ${MONTH_NAMES[sorted[sorted.length - 1] - 1]}`;
  }
  
  const wrap = checkWrapAround(sorted);
  if (wrap.isWrap) {
    return `${MONTH_NAMES[wrap.start - 1]} – ${MONTH_NAMES[wrap.end - 1]}`;
  }
  
  // Non-consecutive: show as comma-separated list (max 4, then abbreviate)
  if (sorted.length <= 4) {
    return sorted.map(m => MONTH_NAMES[m - 1]).join(', ');
  }
  return `${MONTH_NAMES[sorted[0] - 1]} – ${MONTH_NAMES[sorted[sorted.length - 1] - 1]} (${sorted.length})`;
}

export const tag = createUnifiedMorph(
  'tag',
  (value, ctx) => {
    const tags = Array.isArray(value) ? value : [value];
    
    // Special handling for month numbers
    if (isMonthArray(tags, ctx?.fieldName)) {
      const monthNums = tags.map(Number);
      const formatted = formatMonthRange(monthNums);
      return `
        <div class="morph-tags morph-months">
          <span class="tag tag-months" title="${monthNums.map(m => MONTH_NAMES_FULL[m-1]).join(', ')}">
            📅 ${escapeHtml(formatted)}
          </span>
        </div>
      `;
    }
    
    return `
      <div class="morph-tags">
        ${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    `;
  },
  // Compare: Clean tag list with counts
  (values, ctx) => {
    // Special handling for month numbers in compare mode
    const allAreMonths = values.every(({ value }) => isMonthArray(Array.isArray(value) ? value : [value], ctx?.fieldName));
    
    if (allAreMonths) {
      return `
        <div class="morph-months-compare">
          ${values.map(({ value, color }) => {
            const months = (Array.isArray(value) ? value : [value]).map(Number);
            const formatted = formatMonthRange(months);
            return `
              <div class="cmp-text-row" style="--item-color: ${color}">
                <span class="cmp-dot"></span>
                <span class="cmp-text" title="${months.map(m => MONTH_NAMES_FULL[m-1]).join(', ')}">📅 ${escapeHtml(formatted)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    // Regular tag compare
    const tagCounts = new Map<string, number>();
    const totalItems = values.length;
    
    values.forEach(({ value }) => {
      const tags = Array.isArray(value) ? value : [value];
      const seen = new Set<string>();
      
      tags.forEach(t => {
        const tagStr = String(t);
        if (seen.has(tagStr)) return;
        seen.add(tagStr);
        tagCounts.set(tagStr, (tagCounts.get(tagStr) || 0) + 1);
      });
    });
    
    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    
    return `
      <div class="morph-tags-compare">
        ${sorted.map(([tagStr, count]) => {
          const isCommon = count === totalItems;
          return `
            <span class="tag ${isCommon ? 'tag-common' : 'tag-partial'}">
              ${escapeHtml(tagStr)}${!isCommon ? ` <span class="tag-count">${count}</span>` : ''}
            </span>
          `;
        }).join('')}
      </div>
    `;
  }
);
