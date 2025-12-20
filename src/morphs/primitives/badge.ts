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
  }
);
