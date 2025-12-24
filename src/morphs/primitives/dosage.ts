/**
 * AMORPH v7 - Dosage Morph
 * 
 * Zeigt Dosierungsangaben in Tabellenform.
 * Struktur: [{amount: 0, unit: "", frequency: "", route?: ""}]
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

interface DosageItem {
  amount?: number;
  menge?: number;
  unit?: string;
  einheit?: string;
  frequency?: string;
  frequenz?: string;
  route?: string;
  verabreichung?: string;
}

function parseDosage(item: unknown): { amount: number; unit: string; frequency: string; route: string } {
  if (typeof item !== 'object' || item === null) {
    return { amount: 0, unit: '', frequency: '', route: '' };
  }
  
  const obj = item as DosageItem;
  return {
    amount: Number(obj.amount ?? obj.menge ?? 0),
    unit: String(obj.unit || obj.einheit || ''),
    frequency: String(obj.frequency || obj.frequenz || ''),
    route: String(obj.route || obj.verabreichung || '')
  };
}

export const dosage = createUnifiedMorph(
  'dosage',
  (value) => {
    const items = Array.isArray(value) ? value : [value];
    const parsed = items.map(parseDosage);
    
    return `
      <div class="morph-dosage">
        ${parsed.map(item => `
          <div class="morph-dosage-item">
            <span class="morph-dosage-amount">${formatNumber(item.amount)} ${escapeHtml(item.unit)}</span>
            ${item.frequency ? `<span class="morph-dosage-frequency">${escapeHtml(item.frequency)}</span>` : ''}
            ${item.route ? `<span class="morph-dosage-route">${escapeHtml(item.route)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },
  // Compare: Dosage table
  (values) => {
    return `
      <div class="morph-dosage-compare">
        <div class="dosage-header">
          <span>Menge</span>
          <span>Frequenz</span>
          <span>Route</span>
        </div>
        ${values.map(({ item, value, color }) => {
          const items = Array.isArray(value) ? value : [value];
          const parsed = items.map(parseDosage);
          const name = item.name || item.id;
          
          return parsed.map(pItem => `
            <div class="dosage-row" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
              <span class="dosage-amount">${formatNumber(pItem.amount)} ${escapeHtml(pItem.unit)}</span>
              <span class="dosage-freq">${escapeHtml(pItem.frequency) || '-'}</span>
              <span class="dosage-route">${escapeHtml(pItem.route) || '-'}</span>
            </div>
          `).join('');
        }).join('')}
      </div>
    `;
  }
);
