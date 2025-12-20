/**
 * AMORPH v7 - Unified Morph Base
 * 
 * Basis-Klasse und Utilities für alle Morphs.
 * Jeder Morph rendert automatisch Single oder Compare basierend auf Context.
 */

import type { RenderContext, MorphFunction, ItemData } from '../core/types';
import { isCompareMode, isSingleMode } from '../core/types';

// ═══════════════════════════════════════════════════════════════════════════════
// HTML UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;'
};

export function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char);
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD LABEL FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════

const UNIT_MAP: Record<string, string> = {
  '_g': ' (g)',
  '_mg': ' (mg)',
  '_ug': ' (µg)',
  '_um': ' (µm)',
  '_mm': ' (mm)',
  '_cm': ' (cm)',
  '_m': ' (m)',
  '_kg': ' (kg)',
  '_l': ' (L)',
  '_ml': ' (ml)',
  '_pct': ' (%)',
  '_percent': ' (%)'
};

export function formatFieldLabel(key: string): string {
  let label = String(key || '');
  
  // Remove leading underscore
  if (label.startsWith('_')) {
    label = label.slice(1);
  }
  
  let unit = '';
  
  // Check for unit suffix
  for (const [suffix, unitStr] of Object.entries(UNIT_MAP)) {
    if (label.toLowerCase().endsWith(suffix)) {
      unit = unitStr;
      label = label.slice(0, -suffix.length);
      break;
    }
  }
  
  // snake_case to Title Case
  label = label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  
  return label + unit;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extrahiert Werte aus mehreren Items für ein Feld.
 */
export function extractFieldValues(
  items: ItemData[],
  fieldName: string
): { item: ItemData; value: unknown; color: string }[] {
  const colors = [
    '#0df', '#f0d', '#fd0', '#0fd', '#d0f', '#df0',
    '#0af', '#fa0', '#a0f', '#f0a', '#af0', '#0fa'
  ];
  
  return items.map((item, idx) => ({
    item,
    value: item[fieldName],
    color: colors[idx % colors.length]
  }));
}

/**
 * Berechnet Min/Max für numerische Vergleiche.
 */
export function getNumericRange(values: number[]): { min: number; max: number; range: number } {
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return { min: 0, max: 100, range: 100 };
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  return { min, max, range: max - min || 1 };
}

/**
 * Erstellt Item-Header für Compare-Ansicht.
 */
export function createCompareHeader(items: ItemData[], colors: string[]): string {
  return `
    <div class="compare-header">
      ${items.map((item, idx) => `
        <div class="compare-item-label" style="--item-color: ${colors[idx]}">
          <span class="color-dot"></span>
          <span class="item-name">${escapeHtml(item.name)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED MORPH FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Erstellt einen Unified Morph der automatisch Single/Compare erkennt.
 * 
 * @param name - Morph-Name
 * @param renderSingle - Render-Funktion für Einzelwerte
 * @param renderCompare - Render-Funktion für Vergleich (optional, nutzt sonst Multi-Single)
 */
export function createUnifiedMorph(
  name: string,
  renderSingle: (value: unknown, ctx: RenderContext) => string,
  renderCompare?: (values: { item: ItemData; value: unknown; color: string }[], ctx: RenderContext) => string
): MorphFunction {
  return (value: unknown | unknown[], context: RenderContext): string => {
    // Auto-Detect: Compare-Modus wenn mehrere Items
    if (isCompareMode(context) && context.items && context.fieldName) {
      const fieldValues = extractFieldValues(context.items, context.fieldName);
      
      // Wenn Custom Compare-Renderer existiert, nutze ihn
      if (renderCompare) {
        return renderCompare(fieldValues, context);
      }
      
      // Fallback: Side-by-Side Single Renders
      return `
        <div class="morph-compare morph-compare-${name}">
          ${fieldValues.map(({ item, value: val, color }) => `
            <div class="compare-cell" style="--item-color: ${color}">
              ${renderSingle(val, { ...context, itemCount: 1 })}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Single-Modus
    return renderSingle(value, context);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRAPPER FOR FIELD OUTPUT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wraps Morph-Output in ein Feld-Container.
 * Speichert auch die originalen Daten für clientseitige Extraktion.
 */
export function wrapInField(
  content: string,
  morphType: string,
  fieldName?: string,
  className?: string,
  rawValue?: unknown
): string {
  const label = fieldName ? formatFieldLabel(fieldName) : '';
  const fieldAttr = fieldName ? `data-field="${escapeHtml(fieldName)}"` : '';
  const extraClass = className ? ` ${className}` : '';
  
  // Store raw value for client-side extraction (used by Compare feature)
  // Use Base64 encoding to avoid HTML escaping issues with JSON
  let valueAttr = '';
  if (rawValue !== undefined && rawValue !== null) {
    try {
      const jsonStr = JSON.stringify(rawValue);
      // Limit size to avoid massive attributes (>10KB)
      if (jsonStr.length <= 10000) {
        // Base64 encode for safe transport
        const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
        valueAttr = ` data-raw-value="${base64}"`;
      } else {
        console.log(`[wrapInField] Skipping raw value for ${fieldName}: too large (${jsonStr.length} bytes)`);
      }
    } catch (e) {
      console.warn(`[wrapInField] Failed to serialize raw value for ${fieldName}:`, e);
    }
  }
  
  return `
    <div class="amorph-field${extraClass}" data-morph="${morphType}" ${fieldAttr}${valueAttr}>
      ${label ? `<span class="amorph-field-label">${escapeHtml(label)}</span>` : ''}
      <div class="amorph-field-value">${content}</div>
    </div>
  `;
}
