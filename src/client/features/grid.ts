/**
 * AMORPH v7 - Client Grid
 * 
 * Grid-Interaktionen und Item-Handling.
 */

import { debug } from './debug';
import { selectItem, deselectItem, isSelected, selectField, deselectField, type SelectedItem } from './selection';

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
  
  // Check for field select button (NEW)
  const fieldSelectBtn = target.closest('.field-select');
  if (fieldSelectBtn) {
    e.preventDefault();
    e.stopPropagation();
    debug.selection('Field select button clicked');
    handleFieldSelect(fieldSelectBtn as HTMLElement);
    return;
  }
  
  // Check for select-all button
  const selectAllBtn = target.closest('.item-select-all');
  if (selectAllBtn) {
    e.preventDefault();
    e.stopPropagation();
    debug.selection('Select-all button clicked');
    handleItemSelectAll(selectAllBtn as HTMLElement);
    return;
  }
  
  // Check for select button/checkbox (deprecated, but keep for compatibility)
  const selectBtn = target.closest('.item-select, .item-checkbox');
  if (selectBtn) {
    e.preventDefault();
    e.stopPropagation();
    handleItemSelect(selectBtn as HTMLElement);
    return;
  }
  
  // NO LONGER navigate on card click - let user select fields instead
  debug.layout('Card click - no navigation (field selection mode)');
}

function handleItemSelect(btn: HTMLElement): void {
  const item = btn.closest('.amorph-item') as HTMLElement;
  if (!item) return;
  
  const slug = item.dataset.slug || item.dataset.id || '';
  const name = item.dataset.name || item.querySelector('.item-name')?.textContent || slug;
  
  if (isSelected(slug)) {
    deselectItem(slug);
    item.classList.remove('is-selected');
  } else {
    const selectedItem: SelectedItem = {
      id: item.dataset.id || slug,
      slug,
      name,
      data: getItemData(item)
    };
    
    if (selectItem(selectedItem)) {
      item.classList.add('is-selected');
    }
  }
  
  updateSelectionUI();
}

// NEW: Handle field selection for compare
function handleFieldSelect(btn: HTMLElement): void {
  const field = btn.closest('.amorph-field') as HTMLElement;
  if (!field) return;
  
  const item = field.closest('.amorph-item') as HTMLElement;
  if (!item) return;
  
  const fieldName = field.dataset.field || '';
  const itemSlug = item.dataset.slug || item.dataset.id || '';
  const itemName = item.dataset.name || item.querySelector('.item-name')?.textContent || itemSlug;
  
  // Toggle field selection
  if (field.classList.contains('is-selected')) {
    field.classList.remove('is-selected');
    deselectField(itemSlug, fieldName);
  } else {
    field.classList.add('is-selected');
    selectField(itemSlug, itemName, fieldName, getFieldValue(field));
  }
  
  debug.selection(`Field ${fieldName} on ${itemSlug}`, { selected: field.classList.contains('is-selected') });
}

// NEW: Handle select all fields on an item
function handleItemSelectAll(btn: HTMLElement): void {
  const item = btn.closest('.amorph-item') as HTMLElement;
  if (!item) return;
  
  const fields = item.querySelectorAll('.amorph-field');
  const allSelected = Array.from(fields).every(f => f.classList.contains('is-selected'));
  
  if (allSelected) {
    // Deselect all
    fields.forEach(f => {
      f.classList.remove('is-selected');
      const fieldName = (f as HTMLElement).dataset.field || '';
      const itemSlug = item.dataset.slug || '';
      deselectField(itemSlug, fieldName);
    });
    item.classList.remove('is-selected');
  } else {
    // Select all
    const itemSlug = item.dataset.slug || item.dataset.id || '';
    const itemName = item.dataset.name || item.querySelector('.item-name')?.textContent || itemSlug;
    
    fields.forEach(f => {
      if (!f.classList.contains('is-selected')) {
        f.classList.add('is-selected');
        const fieldName = (f as HTMLElement).dataset.field || '';
        selectField(itemSlug, itemName, fieldName, getFieldValue(f as HTMLElement));
      }
    });
    item.classList.add('is-selected');
  }
}

// NEW: Get the value from a field element
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
// DATA EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function getItemData(item: HTMLElement): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  
  // Extract from data attributes
  for (const key of Object.keys(item.dataset)) {
    if (!key.startsWith('_')) {
      data[key] = item.dataset[key];
    }
  }
  
  // Extract from visible fields
  item.querySelectorAll('.amorph-field').forEach(field => {
    const fieldName = (field as HTMLElement).dataset.field;
    const value = field.querySelector('.amorph-field-value')?.textContent?.trim();
    if (fieldName && value) {
      data[fieldName] = value;
    }
  });
  
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI UPDATES
// ═══════════════════════════════════════════════════════════════════════════════

export function updateSelectionUI(): void {
  if (!gridContainer) return;
  
  gridContainer.querySelectorAll('.amorph-item').forEach(item => {
    const slug = (item as HTMLElement).dataset.slug || (item as HTMLElement).dataset.id || '';
    item.classList.toggle('is-selected', isSelected(slug));
  });
}

// Listen for selection changes
document.addEventListener('amorph:selection-changed', updateSelectionUI);
