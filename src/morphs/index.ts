/**
 * AMORPH v7 - Morph Registry
 * 
 * Zentrale Registry für alle Morphs.
 * Ermöglicht dynamisches Laden und Erweitern.
 */

import type { MorphFunction, RenderContext } from '../core/types';
import { detectType } from '../core/detection';
import { primitives } from './primitives/index.js';
import { escapeHtml, wrapInField } from './base.js';
import { morphDebug } from './debug.js';

// Re-export debug for external use
export { morphDebug } from './debug.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MORPH REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const morphRegistry = new Map<string, MorphFunction>();

// Register primitives
Object.entries(primitives).forEach(([name, morph]) => {
  morphRegistry.set(name, morph);
});

/**
 * Registriert einen neuen Morph.
 */
export function registerMorph(name: string, morph: MorphFunction): void {
  morphRegistry.set(name, morph);
}

/**
 * Holt einen Morph aus der Registry.
 */
export function getMorph(name: string): MorphFunction {
  return morphRegistry.get(name) || primitives.text;
}

/**
 * Prüft ob ein Morph existiert.
 */
export function hasMorph(name: string): boolean {
  return morphRegistry.has(name);
}

/**
 * Listet alle registrierten Morphs.
 */
export function listMorphs(): string[] {
  return [...morphRegistry.keys()];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Erstellt einen Single-Render-Context.
 */
export function createSingleContext(options: Partial<RenderContext> = {}): RenderContext {
  return {
    mode: 'single',
    itemCount: 1,
    ...options
  };
}

/**
 * Erstellt einen Grid-Render-Context.
 */
export function createGridContext(options: Partial<RenderContext> = {}): RenderContext {
  return {
    mode: 'grid',
    itemCount: 1,
    compact: true,
    ...options
  };
}

/**
 * Erstellt einen Compare-Render-Context.
 */
export function createCompareContext(itemCount: number, options: Partial<RenderContext> = {}): RenderContext {
  return {
    mode: 'compare',
    itemCount,
    ...options
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rendert einen Wert mit automatischer Typ-Erkennung.
 */
export function renderValue(
  value: unknown,
  fieldName: string,
  context: RenderContext
): string {
  // Skip null/undefined/empty
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value) && value.length === 0) return '';
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return '';
  
  // Detect type
  const morphType = detectType(value, fieldName);
  
  // Debug: Log detection
  morphDebug.logDetection(fieldName, value, morphType);
  
  // Get morph
  const morph = getMorph(morphType);
  
  // Render
  const content = morph(value, { ...context, fieldName });
  
  // Debug: Log render result
  morphDebug.logRender(fieldName, morphType, content.length);
  
  // Wrap in field container with raw value for client-side extraction
  return wrapInField(content, morphType, fieldName, undefined, value);
}

/**
 * Rendert ein komplettes Item.
 */
export function renderItem(
  item: Record<string, unknown>,
  context: RenderContext
): string {
  const fields: string[] = [];
  
  // Internal fields to skip
  const internalFields = new Set([
    '_baseUrl', '_loadedPerspectives', '_perspektiven', '_kingdom',
    '_collection', '_indexData', '_cacheKey', '_timestamp',
    'id', 'slug'
  ]);
  
  for (const [key, value] of Object.entries(item)) {
    // Skip internal fields
    if (internalFields.has(key) || key.startsWith('_')) continue;
    
    const html = renderValue(value, key, context);
    if (html) fields.push(html);
  }
  
  return fields.join('\n');
}

/**
 * Rendert mehrere Items im Compare-Modus.
 * Organisiert Felder horizontal mit allen Item-Werten.
 */
export function renderCompare(
  items: Record<string, unknown>[],
  context: RenderContext
): string {
  // Sammle alle Felder
  const allFields = new Set<string>();
  const internalFields = new Set([
    '_baseUrl', '_loadedPerspectives', '_perspektiven', '_kingdom',
    '_collection', '_indexData', '_cacheKey', '_timestamp',
    'id', 'slug'
  ]);
  
  items.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!internalFields.has(key) && !key.startsWith('_')) {
        allFields.add(key);
      }
    });
  });
  
  // Bio-Lumineszenz Palette
  const colors = context.colors || [
    '#00ffc8', // Foxfire Grün
    '#a78bfa', // Myzel Violett
    '#fbbf24', // Sporen Amber
    '#22d3ee', // Tiefsee Cyan
    '#f472b6', // Rhodotus Rosa
    '#a3e635', // Chlorophyll Grün
    '#fb923c', // Carotin Orange
    '#c4b5fd'  // Lavendel
  ];
  
  // Header mit Item-Namen (mit data-species für Highlight-System)
  const header = `
    <div class="compare-header">
      ${items.map((item, idx) => {
        const name = (item as any).name || `Item ${idx + 1}`;
        return `
        <div class="compare-item-header" data-species="${escapeHtml(name)}" style="--item-color: ${colors[idx % colors.length]}">
          <span class="item-color-dot"></span>
          <span class="item-name">${escapeHtml(name)}</span>
        </div>
      `;}).join('')}
    </div>
  `;
  
  // Felder
  const fields: string[] = [];
  
  for (const fieldName of allFields) {
    // Hole Werte für alle Items
    const values = items.map(item => item[fieldName]);
    
    // Skip wenn alle leer
    if (values.every(v => v === null || v === undefined || v === '')) continue;
    
    // Detect type from first non-null value
    const firstValue = values.find(v => v !== null && v !== undefined);
    if (!firstValue) continue;
    
    const morphType = detectType(firstValue, fieldName);
    const morph = getMorph(morphType);
    
    // Render mit Compare-Context
    const compareContext: RenderContext = {
      ...context,
      mode: 'compare',
      itemCount: items.length,
      items: items as any[],
      fieldName,
      colors
    };
    
    // Der Morph entscheidet selbst wie er Compare rendert
    const content = morph(firstValue, compareContext);
    
    fields.push(wrapInField(content, morphType, fieldName, 'compare-field'));
  }
  
  return `
    <div class="compare-view">
      ${header}
      <div class="compare-fields">
        ${fields.join('\n')}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { primitives } from './primitives/index.js';
export * from './base.js';
