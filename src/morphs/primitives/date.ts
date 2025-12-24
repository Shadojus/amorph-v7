/**
 * AMORPH v7 - Date Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

function parseDate(value: unknown): { date: Date | null; formatted: string; raw: string } {
  const dateStr = String(value);
  let formatted = dateStr;
  let parsed: Date | null = null;
  
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      parsed = d;
      formatted = d.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch {
    // Keep original
  }
  
  return { date: parsed, formatted, raw: dateStr };
}

export const date = createUnifiedMorph(
  'date',
  (value) => {
    const { formatted, raw } = parseDate(value);
    return `<time class="morph-date" datetime="${escapeHtml(raw)}">${escapeHtml(formatted)}</time>`;
  },
  // Compare: Timeline with date markers
  (values) => {
    const dates = values.map(({ item, value, color }) => {
      const parsed = parseDate(value);
      return { item, color, ...parsed };
    });
    
    // Filter valid dates and find range
    const validDates = dates.filter(d => d.date !== null);
    if (validDates.length === 0) {
      return `<div class="morph-date-compare">${dates.map(d => `<span>${escapeHtml(d.formatted)}</span>`).join(' / ')}</div>`;
    }
    
    const timestamps = validDates.map(d => d.date!.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const range = maxTime - minTime || 1;
    
    // Calculate day difference
    const dayDiff = Math.round(range / (1000 * 60 * 60 * 24));
    
    return `
      <div class="morph-date-compare">
        <div class="date-timeline">
          ${validDates.map(({ item, color, date, formatted }) => {
            const pct = ((date!.getTime() - minTime) / range) * 100;
            const name = item.name || item.id;
            return `
              <div class="date-marker" data-species="${escapeHtml(name)}" style="left: ${pct}%; --item-color: ${escapeHtml(color)}" 
                   title="${escapeHtml(item.name)}: ${formatted}">
                <span class="date-label">${escapeHtml(formatted)}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="date-summary">
          ${dayDiff > 0 
            ? `<span class="date-span">Δ ${dayDiff} Tag${dayDiff !== 1 ? 'e' : ''}</span>`
            : '<span class="date-same">Gleicher Tag</span>'
          }
        </div>
      </div>
    `;
  }
);
