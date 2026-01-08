/**
 * AMORPH v7 - Client Grid
 * 
 * Grid-Interaktionen und Feld-Auswahl für Compare.
 */

import { debug } from './debug';
import { selectField, deselectField, isFieldSelected, getFieldColor } from './selection';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let gridContainer: HTMLElement | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export function initGrid(container: HTMLElement): void {
  gridContainer = container;
  
  // Event delegation for item clicks
  container.addEventListener('click', handleGridClick);
  
  // Update selection state on existing items
  updateSelectionUI();
  
  debug.layout('Grid initialized');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

function handleGridClick(e: Event): void {
  const target = e.target as HTMLElement;
  
  debug.layout('Grid click', { target: target.className, tagName: target.tagName });
  
  // WICHTIG: Bifroest-Elemente haben eigene Handler - nicht als Field-Selection behandeln
  if (target.closest('.bifroest-expert') || target.closest('.bifroest-copyright') || target.closest('.bifroest-experts')) {
    debug.layout('Grid click - Bifroest element, ignoring for field selection');
    return;
  }
  
  // Check if clicked on a field (or child of field) - direct selection
  const field = target.closest('.amorph-field') as HTMLElement;
  if (field) {
    e.preventDefault();
    e.stopPropagation();
    handleFieldSelect(field);
    return;
  }
  
  debug.layout('Grid click - not on a selectable field');
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function applySelectionColor(field: HTMLElement, color: string): void {
  // Parse RGBA and create variants with different opacities
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  
  // Synchron anwenden - das Batching erfolgt jetzt in updateSelectionUI
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    field.style.setProperty('--selection-color', `rgba(${r}, ${g}, ${b}, 0.9)`);
    field.style.setProperty('--selection-bg', `rgba(${r}, ${g}, ${b}, 0.04)`);
    field.style.setProperty('--selection-border', `rgba(${r}, ${g}, ${b}, 0.64)`);
  } else {
    // Fallback for other color formats (hex, hsl, etc.)
    field.style.setProperty('--selection-color', color);
    field.style.setProperty('--selection-bg', color);
    field.style.setProperty('--selection-border', color);
  }
}

// Handle field selection for compare
function handleFieldSelect(field: HTMLElement): void {
  const item = field.closest('.amorph-item') as HTMLElement;
  if (!item) return;
  
  const fieldName = field.dataset.field || '';
  const itemSlug = item.dataset.slug || item.dataset.id || '';
  const itemName = item.dataset.name || item.querySelector('.item-name')?.textContent || itemSlug;
  
  // Get perspective for this field from item's data attribute
  let perspectiveId: string | undefined;
  try {
    const fieldPerspectives = JSON.parse(item.dataset.fieldPerspectives || '{}');
    perspectiveId = fieldPerspectives[fieldName];
  } catch (e) {
    // Ignore parse errors
  }
  
  // WICHTIG: Prüfe Selection-State SYNCHRON bevor wir etwas ändern
  // isFieldSelected ist die einzige Wahrheitsquelle!
  const wasSelected = isFieldSelected(itemSlug, fieldName);
  
  debug.selection(`Field ${fieldName} on ${itemSlug}`, { wasSelected, perspectiveId });
  
  if (wasSelected) {
    // DESELECT: Erst State ändern, dann UI
    deselectField(itemSlug, fieldName);
    // UI update wird durch Event getriggert (updateSelectionUI)
  } else {
    // SELECT: Erst State ändern, dann UI
    const value = getFieldValue(field);
    selectField(itemSlug, itemName, fieldName, value, perspectiveId);
    // UI update wird durch Event getriggert (updateSelectionUI)
  }
}

// Get the value from a field element
function getFieldValue(field: HTMLElement): unknown {
  const fieldName = field.dataset.field || 'unknown';
  
  // FIRST: Try to get raw value from data attribute (Base64 encoded)
  let rawValueStr = field.dataset.rawValue;
  if (rawValueStr) {
    try {
      // Remove any whitespace that may have been introduced by HTML formatting
      rawValueStr = rawValueStr.replace(/\s/g, '');
      
      // Decode Base64 and parse JSON
      const jsonStr = atob(rawValueStr);
      const parsed = JSON.parse(jsonStr);
      console.log(`[getFieldValue] SUCCESS Base64 for ${fieldName}:`, typeof parsed, Array.isArray(parsed) ? `array[${parsed.length}]` : '');
      return parsed;
    } catch (e) {
      console.warn(`[getFieldValue] Failed to decode raw value for ${fieldName}:`, e);
    }
  } else {
    console.log(`[getFieldValue] NO data-raw-value for ${fieldName}`);
  }
  
  // FALLBACK: The correct class is .amorph-field-value (from wrapInField in base.ts)
  const valueEl = field.querySelector('.amorph-field-value');
  if (!valueEl) return null;
  
  // Try to get morph type and extract structured data
  const morphType = field.dataset.morph;
  
  // For arrays (bar, list, tag, timeline, sparkline, radar)
  // Try to extract from DOM structure
  if (morphType === 'bar') {
    const items: Array<{label: string, value: number}> = [];
    valueEl.querySelectorAll('.morph-bar-item').forEach(item => {
      const label = item.querySelector('.morph-bar-label')?.textContent || '';
      const valueText = item.querySelector('.morph-bar-value')?.textContent || '0';
      items.push({ label, value: parseFloat(valueText) || 0 });
    });
    if (items.length > 0) return items;
  }
  
  if (morphType === 'range' || morphType === 'stats') {
    const minEl = valueEl.querySelector('.morph-range-min, .morph-stats-min');
    const maxEl = valueEl.querySelector('.morph-range-max, .morph-stats-max');
    if (minEl && maxEl) {
      return {
        min: parseFloat(minEl.textContent || '0'),
        max: parseFloat(maxEl.textContent || '0')
      };
    }
  }
  
  if (morphType === 'list' || morphType === 'tag') {
    const items: string[] = [];
    valueEl.querySelectorAll('.morph-list-item, .morph-tag').forEach(item => {
      items.push(item.textContent?.trim() || '');
    });
    if (items.length > 0) return items;
  }
  
  // For simple values, return text content
  return valueEl.textContent?.trim() || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI UPDATES
// ═══════════════════════════════════════════════════════════════════════════════

// Debounce flag to prevent rapid UI updates
let updateScheduled = false;

export function updateSelectionUI(): void {
  if (!gridContainer) return;
  
  // Debounce: Schedule update for next frame if not already scheduled
  if (updateScheduled) return;
  updateScheduled = true;
  
  requestAnimationFrame(() => {
    updateScheduled = false;
    performSelectionUIUpdate();
  });
}

function performSelectionUIUpdate(): void {
  if (!gridContainer) return;
  
  // Batch all DOM reads first
  const updates: Array<{field: HTMLElement; selected: boolean; color: string | null}> = [];
  
  gridContainer.querySelectorAll('.amorph-item').forEach(item => {
    const itemSlug = (item as HTMLElement).dataset.slug || (item as HTMLElement).dataset.id || '';
    
    item.querySelectorAll('.amorph-field').forEach(fieldEl => {
      const field = fieldEl as HTMLElement;
      const fieldName = field.dataset.field || '';
      const selected = isFieldSelected(itemSlug, fieldName);
      const color = selected ? getFieldColor(itemSlug, fieldName) : null;
      
      updates.push({ field, selected, color });
    });
  });
  
  // Then batch all DOM writes
  updates.forEach(({ field, selected, color }) => {
    const wasSelected = field.classList.contains('is-selected');
    
    // Only update if state actually changed
    if (wasSelected !== selected) {
      field.classList.toggle('is-selected', selected);
      
      if (selected && color) {
        applySelectionColor(field, color);
      } else if (!selected) {
        field.style.removeProperty('--selection-color');
        field.style.removeProperty('--selection-bg');
        field.style.removeProperty('--selection-border');
      }
    }
  });
  
  debug.layout('Selection UI updated', { fieldCount: updates.filter(u => u.selected).length });
}

// Listen for selection changes
document.addEventListener('amorph:selection-changed', updateSelectionUI);
