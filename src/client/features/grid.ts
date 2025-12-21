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
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    field.style.setProperty('--selection-color', `rgba(${r}, ${g}, ${b}, 0.9)`);
    field.style.setProperty('--selection-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
    field.style.setProperty('--selection-border', `rgba(${r}, ${g}, ${b}, 0.5)`);
  } else {
    // Fallback for other color formats
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
  
  // Toggle field selection
  if (field.classList.contains('is-selected')) {
    field.classList.remove('is-selected');
    field.style.removeProperty('--selection-color');
    field.style.removeProperty('--selection-bg');
    field.style.removeProperty('--selection-border');
    deselectField(itemSlug, fieldName);
  } else {
    selectField(itemSlug, itemName, fieldName, getFieldValue(field), perspectiveId);
    // Get the assigned color and apply it
    const color = getFieldColor(itemSlug, fieldName);
    if (color) {
      applySelectionColor(field, color);
    }
    field.classList.add('is-selected');
  }
  
  debug.selection(`Field ${fieldName} on ${itemSlug}`, { selected: field.classList.contains('is-selected'), perspectiveId });
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

export function updateSelectionUI(): void {
  if (!gridContainer) return;
  
  // Update field selection states and colors
  gridContainer.querySelectorAll('.amorph-item').forEach(item => {
    const itemSlug = (item as HTMLElement).dataset.slug || (item as HTMLElement).dataset.id || '';
    
    item.querySelectorAll('.amorph-field').forEach(fieldEl => {
      const field = fieldEl as HTMLElement;
      const fieldName = field.dataset.field || '';
      const selected = isFieldSelected(itemSlug, fieldName);
      
      field.classList.toggle('is-selected', selected);
      
      if (selected) {
        const color = getFieldColor(itemSlug, fieldName);
        if (color) {
          applySelectionColor(field, color);
        }
      } else {
        field.style.removeProperty('--selection-color');
        field.style.removeProperty('--selection-bg');
        field.style.removeProperty('--selection-border');
      }
    });
  });
}

// Listen for selection changes
document.addEventListener('amorph:selection-changed', updateSelectionUI);
