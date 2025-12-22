/**
 * AMORPH v7 - Currency Morph
 * 
 * Zeigt Währungsbeträge formatiert an.
 * Struktur: {amount: 0, currency: "EUR"}
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface CurrencyData {
  amount?: number;
  betrag?: number;
  value?: number;
  currency?: string;
  waehrung?: string;
  währung?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
  BTC: '₿'
};

function parseCurrency(value: unknown): { amount: number; currency: string } {
  if (typeof value === 'number') {
    return { amount: value, currency: 'EUR' };
  }
  if (typeof value !== 'object' || value === null) {
    return { amount: 0, currency: 'EUR' };
  }
  
  const obj = value as CurrencyData;
  return {
    amount: Number(obj.amount ?? obj.betrag ?? obj.value ?? 0),
    currency: String(obj.currency || obj.waehrung || obj.währung || 'EUR').toUpperCase()
  };
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = amount.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // EUR and symbols go after the number in German format
  if (currency === 'EUR' || ['€', 'CHF'].includes(symbol)) {
    return `${formatted} ${symbol}`;
  }
  
  return `${symbol}${formatted}`;
}

export const currency = createUnifiedMorph(
  'currency',
  (value) => {
    const data = parseCurrency(value);
    const formatted = formatCurrency(data.amount, data.currency);
    
    // Color based on positive/negative
    const valueClass = data.amount < 0 ? 'morph-currency--negative' : 
                       data.amount > 0 ? 'morph-currency--positive' : '';
    
    return `
      <div class="morph-currency ${valueClass}">
        <span class="morph-currency-value">${escapeHtml(formatted)}</span>
      </div>
    `;
  },
  // Compare: Currency values side-by-side
  (values) => {
    const amounts = values.map(({ value }) => parseCurrency(value).amount);
    const max = Math.max(...amounts.map(Math.abs), 1);
    
    return `
      <div class="morph-currency-compare">
        ${values.map(({ value, color }) => {
          const data = parseCurrency(value);
          const formatted = formatCurrency(data.amount, data.currency);
          const pct = Math.abs(data.amount) / max * 100;
          const isNegative = data.amount < 0;
          
          return `
            <div class="currency-row ${isNegative ? 'currency-row--negative' : ''}" style="--item-color: ${escapeHtml(color)}">
              <div class="currency-bar" style="width: ${pct}%"></div>
              <span class="currency-val">${escapeHtml(formatted)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
