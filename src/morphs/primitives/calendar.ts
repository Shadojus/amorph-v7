/**
 * AMORPH v7 - Calendar Morph
 * 
 * Zeigt 12-Monats-Aktivität als Heatmap.
 * Struktur: [{month: 1, active: false}, ...] oder [{monat: 1, aktiv: true}, ...]
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface CalendarMonth {
  month?: number;
  monat?: number;
  active?: boolean;
  aktiv?: boolean;
  value?: number;
  wert?: number;
}

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

function parseMonth(item: unknown, idx: number): { month: number; active: boolean; value: number } {
  if (typeof item === 'boolean') {
    return { month: idx + 1, active: item, value: item ? 1 : 0 };
  }
  if (typeof item === 'number') {
    return { month: idx + 1, active: item > 0, value: item };
  }
  if (typeof item !== 'object' || item === null) {
    return { month: idx + 1, active: false, value: 0 };
  }
  
  const obj = item as CalendarMonth;
  const active = Boolean(obj.active ?? obj.aktiv ?? false);
  const value = Number(obj.value ?? obj.wert ?? (active ? 1 : 0));
  
  return {
    month: Number(obj.month ?? obj.monat ?? idx + 1),
    active: active || value > 0,
    value
  };
}

export const calendar = createUnifiedMorph(
  'calendar',
  (value) => {
    const items = Array.isArray(value) ? value : [];
    
    // Build 12-month array
    const months = Array.from({ length: 12 }, (_, idx) => {
      const monthNum = idx + 1;
      const found = items.find(item => {
        const parsed = parseMonth(item, idx);
        return parsed.month === monthNum;
      });
      return found ? parseMonth(found, idx) : { month: monthNum, active: false, value: 0 };
    });
    
    // Calculate max for intensity
    const maxValue = Math.max(...months.map(m => m.value), 1);
    const activeCount = months.filter(m => m.active).length;
    
    return `
      <div class="morph-calendar">
        <div class="calendar-strip">
          ${months.map((m, idx) => {
            const intensity = m.value > 0 ? Math.max(0.4, m.value / maxValue) : 0;
            return `
              <div class="calendar-month ${m.active ? 'calendar-month--active' : ''}" 
                   style="--intensity: ${intensity}"
                   title="${MONTH_NAMES[idx]}">
                <span class="calendar-label">${MONTH_LABELS[idx]}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${activeCount > 0 ? `<span class="calendar-summary">${activeCount} Monate aktiv</span>` : ''}
      </div>
    `;
  },
  // Compare: Calendar rows per item
  (values) => {
    return `
      <div class="morph-calendar-compare">
        ${values.map(({ value, color }) => {
          const items = Array.isArray(value) ? value : [];
          const months = Array.from({ length: 12 }, (_, idx) => {
            const monthNum = idx + 1;
            const found = items.find(item => {
              const parsed = parseMonth(item, idx);
              return parsed.month === monthNum;
            });
            return found ? parseMonth(found, idx) : { month: monthNum, active: false, value: 0 };
          });
          
          return `
            <div class="calendar-row" style="--item-color: ${escapeHtml(color)}">
              ${months.map(m => `
                <div class="calendar-cell ${m.active ? 'calendar-cell--active' : ''}"></div>
              `).join('')}
            </div>
          `;
        }).join('')}
        <div class="calendar-labels">
          ${MONTH_LABELS.map(l => `<span class="calendar-label">${l}</span>`).join('')}
        </div>
      </div>
    `;
  }
);
