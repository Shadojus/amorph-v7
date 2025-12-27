/**
 * AMORPH v7 - Unified Morph Base
 * 
 * Basis-Klasse und Utilities für alle Morphs.
 * Jeder Morph rendert automatisch Single oder Compare basierend auf Context.
 */

import type { RenderContext, MorphFunction, ItemData, FieldSource } from '../core/types';
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
 * WICHTIG: Farben werden nach dem GLOBALEN Item-Index zugewiesen,
 * damit dieselbe Spezies in verschiedenen Feldern dieselbe Farbe behält.
 */
export function extractFieldValues(
  items: ItemData[],
  fieldName: string,
  contextColors?: string[]
): { item: ItemData; value: unknown; color: string; globalIndex: number }[] {
  // Bio-Lumineszenz Palette
  const colors = contextColors || [
    '#00ffc8', // Foxfire Grün
    '#a78bfa', // Myzel Violett
    '#fbbf24', // Sporen Amber
    '#22d3ee', // Tiefsee Cyan
    '#f472b6', // Rhodotus Rosa
    '#a3e635', // Chlorophyll Grün
    '#fb923c', // Carotin Orange
    '#c4b5fd'  // Lavendel
  ];
  
  return items.map((item, idx) => ({
    item,
    value: item[fieldName],
    color: colors[idx % colors.length],
    globalIndex: idx  // Globaler Index für konsistente Farbzuweisung
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
      // Farben aus Context nutzen für konsistente Zuweisung
      const fieldValues = extractFieldValues(context.items, context.fieldName, context.colors);
      
      // Filter out items without values for this field
      // WICHTIG: Farbe bleibt erhalten (wird nicht neu zugewiesen!)
      const validValues = fieldValues.filter(fv => fv.value !== undefined && fv.value !== null);
      
      // Wenn Custom Compare-Renderer existiert UND mindestens 2 Items mit Werten, nutze ihn
      if (renderCompare && validValues.length >= 2) {
        return renderCompare(validValues, context);
      }
      
      // Wenn nur 1 Item den Wert hat, render single
      if (validValues.length === 1) {
        return renderSingle(validValues[0].value, { ...context, itemCount: 1 });
      }
      
      // Wenn kein Wert, return leer
      if (validValues.length === 0) {
        return '';
      }
      
      // Fallback: Side-by-Side Single Renders (wenn kein renderCompare)
      return `
        <div class="morph-compare morph-compare-${name}">
          ${validValues.map(({ item, value: val, color }) => `
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
 * Generiert Copyright-HTML für Bifroest-System.
 * Zeigt © Symbol mit optionalem Namen, expandiert zu vollem Copyright bei Klick.
 */
export function renderCopyrightBadge(sources?: FieldSource[], hideCopyright?: boolean): string {
  // Debug
  if (sources && sources.length > 0) {
    console.log(`[Bifroest Badge] Rendering © for ${sources.length} source(s): ${sources[0]?.name || 'unknown'}, hideCopyright: ${hideCopyright}`);
  }
  
  // Im Compare-View: kein Copyright anzeigen
  if (hideCopyright) {
    console.log(`[Bifroest Badge] Hidden due to hideCopyright`);
    return '';
  }
  
  if (!sources || sources.length === 0) {
    return '';
  }
  
  const primarySource = sources[0];
  const hasMultiple = sources.length > 1;
  const multiLabel = hasMultiple ? ' +' + (sources.length - 1) : '';
  
  // Daten für das Popup als JSON (Base64 encoded)
  const sourcesJson = Buffer.from(JSON.stringify(sources), 'utf-8').toString('base64');
  
  return `
    <button 
      class="bifroest-copyright" 
      type="button"
      data-sources="${sourcesJson}"
      aria-label="Quelle: ${escapeHtml(primarySource.name)}"
      title="${escapeHtml(primarySource.name)}"
    >
      <span class="bifroest-symbol">©</span>
      <span class="bifroest-name">${escapeHtml(primarySource.name)}${multiLabel}</span>
    </button>
  `;
}

/**
 * Wraps Morph-Output in ein Feld-Container.
 * Speichert auch die originalen Daten für clientseitige Extraktion.
 * NEU: Enthält © Symbol für Bifroest-System.
 */
export function wrapInField(
  content: string,
  morphType: string,
  fieldName?: string,
  className?: string,
  rawValue?: unknown,
  context?: RenderContext
): string {
  const label = fieldName ? formatFieldLabel(fieldName) : '';
  const fieldAttr = fieldName ? `data-field="${escapeHtml(fieldName)}"` : '';
  const extraClass = className ? ` ${className}` : '';
  
  // Copyright Badge (Bifroest System)
  const copyrightHtml = context 
    ? renderCopyrightBadge(context.sources, context.hideCopyright || context.mode === 'compare')
    : '';
  
  // Store raw value for client-side extraction (used by Compare feature)
  // Use Base64 encoding to avoid HTML escaping issues with JSON
  let valueAttr = '';
  if (rawValue !== undefined && rawValue !== null) {
    try {
      // Check for circular references before stringify
      const seen = new WeakSet();
      const jsonStr = JSON.stringify(rawValue, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
      
      // Limit size to avoid massive attributes (>10KB)
      if (jsonStr.length <= 10000) {
        // Base64 encode for safe transport
        const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
        valueAttr = ` data-raw-value="${base64}"`;
      }
    } catch (e) {
      // Silently skip - not critical for rendering
    }
  }
  
  return `
    <div class="amorph-field${extraClass}" data-morph="${morphType}" ${fieldAttr}${valueAttr}>
      ${label ? `<span class="amorph-field-label">${escapeHtml(label)}${copyrightHtml}</span>` : copyrightHtml}
      <div class="amorph-field-value">${content}</div>
    </div>
  `;
}
