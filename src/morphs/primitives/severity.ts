/**
 * AMORPH v7 - Severity Morph
 * 
 * Zeigt Schweregrade mit farbiger Kategorisierung.
 * Struktur: [{level: "", typ: "", beschreibung: ""}]
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface SeverityItem {
  level?: string;
  severity?: string;
  typ?: string;
  type?: string;
  beschreibung?: string;
  description?: string;
}

// All severity levels use blue with varying intensity for unified design
const SEVERITY_LEVELS: Record<string, { color: string; icon: string; opacity: number }> = {
  critical: { color: 'var(--morph-accent)', icon: '⬤', opacity: 1 },
  severe: { color: 'var(--morph-accent)', icon: '◉', opacity: 0.95 },
  high: { color: 'var(--morph-accent)', icon: '◉', opacity: 0.9 },
  moderate: { color: 'var(--morph-accent)', icon: '◎', opacity: 0.7 },
  medium: { color: 'var(--morph-accent)', icon: '◎', opacity: 0.7 },
  low: { color: 'var(--morph-accent)', icon: '○', opacity: 0.5 },
  minimal: { color: 'var(--morph-accent)', icon: '○', opacity: 0.35 },
  none: { color: 'var(--morph-accent)', icon: '·', opacity: 0.2 }
};

function parseSeverity(item: unknown): { level: string; type: string; description: string } {
  if (typeof item !== 'object' || item === null) {
    return { level: String(item), type: '', description: '' };
  }
  
  const obj = item as SeverityItem;
  return {
    level: String(obj.level || obj.severity || '').toLowerCase(),
    type: String(obj.typ || obj.type || ''),
    description: String(obj.beschreibung || obj.description || '')
  };
}

function getSeverityStyle(level: string): { color: string; icon: string; opacity: number } {
  const lowerLevel = level.toLowerCase();
  
  // Exact match
  if (SEVERITY_LEVELS[lowerLevel]) {
    return SEVERITY_LEVELS[lowerLevel];
  }
  
  // Partial match
  for (const [key, style] of Object.entries(SEVERITY_LEVELS)) {
    if (lowerLevel.includes(key)) {
      return style;
    }
  }
  
  return { color: 'var(--morph-accent)', icon: '○', opacity: 0.4 };
}

export const severity = createUnifiedMorph(
  'severity',
  (value) => {
    const items = Array.isArray(value) ? value : [value];
    const parsed = items.map(parseSeverity);
    
    return `
      <div class="morph-severity">
        ${parsed.map(item => {
          const style = getSeverityStyle(item.level);
          
          return `
            <div class="morph-severity-item" style="--severity-color: ${style.color}">
              <span class="morph-severity-dot"></span>
              <div class="morph-severity-content">
                <div class="morph-severity-header">
                  <span class="morph-severity-level">${escapeHtml(item.level || 'Unbekannt')}</span>
                  ${item.type ? `<span class="morph-severity-type">${escapeHtml(item.type)}</span>` : ''}
                </div>
                ${item.description ? `<span class="morph-severity-desc">${escapeHtml(item.description)}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  // Compare: Severity levels per item
  (values) => {
    return `
      <div class="morph-severity-compare">
        ${values.map(({ item, value, color }) => {
          const items = Array.isArray(value) ? value : [value];
          const parsed = items.map(parseSeverity);
          const name = item.name || item.id;
          
          return `
            <div class="severity-cell" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
              ${parsed.map(item => `<span class="severity-label">${escapeHtml(item.level)}</span>`).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
