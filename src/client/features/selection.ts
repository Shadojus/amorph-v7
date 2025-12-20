/**
 * AMORPH v7 - Client Selection State
 * 
 * State-Management für Item-Auswahl.
 */

import { debug } from './debug';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SelectedItem {
  id: string;
  slug: string;
  name: string;
  data: Record<string, unknown>;
}

// NEW: Represents a selected field from an item
export interface SelectedField {
  itemSlug: string;
  itemName: string;
  fieldName: string;
  value: unknown;
}

export interface SelectionState {
  items: Map<string, SelectedItem>;
  fields: Map<string, SelectedField>;  // NEW: key = "itemSlug:fieldName"
  maxItems: number;
  maxFields: number;  // NEW
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const state: SelectionState = {
  items: new Map(),
  fields: new Map(),  // NEW
  maxItems: 6,
  maxFields: 24  // NEW: Allow more fields since they're smaller
};

const listeners: Set<() => void> = new Set();

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function selectItem(item: SelectedItem): boolean {
  if (state.items.size >= state.maxItems) {
    debug.selection(`Max items (${state.maxItems}) reached`);
    return false;
  }
  
  if (state.items.has(item.slug)) {
    debug.selection(`Item already selected: ${item.slug}`);
    return false;
  }
  
  state.items.set(item.slug, item);
  debug.selection(`Selected: ${item.name}`, { count: state.items.size });
  notifyListeners();
  return true;
}

export function deselectItem(slug: string): boolean {
  if (!state.items.has(slug)) {
    return false;
  }
  
  state.items.delete(slug);
  debug.selection(`Deselected: ${slug}`, { count: state.items.size });
  notifyListeners();
  return true;
}

export function toggleItem(item: SelectedItem): boolean {
  if (state.items.has(item.slug)) {
    return deselectItem(item.slug);
  }
  return selectItem(item);
}

export function clearSelection(): void {
  state.items.clear();
  state.fields.clear();  // NEW
  debug.selection('Selection cleared');
  notifyListeners();
}

export function isSelected(slug: string): boolean {
  return state.items.has(slug);
}

export function getSelectedItems(): SelectedItem[] {
  return [...state.items.values()];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD SELECTION (NEW)
// ═══════════════════════════════════════════════════════════════════════════════

function getFieldKey(itemSlug: string, fieldName: string): string {
  return `${itemSlug}:${fieldName}`;
}

export function selectField(itemSlug: string, itemName: string, fieldName: string, value: unknown): boolean {
  if (state.fields.size >= state.maxFields) {
    debug.selection(`Max fields (${state.maxFields}) reached`);
    return false;
  }
  
  const key = getFieldKey(itemSlug, fieldName);
  if (state.fields.has(key)) {
    debug.selection(`Field already selected: ${key}`);
    return false;
  }
  
  state.fields.set(key, { itemSlug, itemName, fieldName, value });
  debug.selection(`Selected field: ${fieldName} from ${itemName}`, { count: state.fields.size });
  notifyListeners();
  return true;
}

export function deselectField(itemSlug: string, fieldName: string): boolean {
  const key = getFieldKey(itemSlug, fieldName);
  if (!state.fields.has(key)) {
    return false;
  }
  
  state.fields.delete(key);
  debug.selection(`Deselected field: ${key}`, { count: state.fields.size });
  notifyListeners();
  return true;
}

export function isFieldSelected(itemSlug: string, fieldName: string): boolean {
  return state.fields.has(getFieldKey(itemSlug, fieldName));
}

export function getSelectedFields(): SelectedField[] {
  return [...state.fields.values()];
}

export function getSelectedFieldsGrouped(): Map<string, SelectedField[]> {
  const grouped = new Map<string, SelectedField[]>();
  
  for (const field of state.fields.values()) {
    if (!grouped.has(field.fieldName)) {
      grouped.set(field.fieldName, []);
    }
    grouped.get(field.fieldName)!.push(field);
  }
  
  return grouped;
}

export function getSelectedFieldCount(): number {
  return state.fields.size;
}

export function canCompareFields(): boolean {
  // Need at least 2 fields OR fields from at least 2 different items
  if (state.fields.size < 2) return false;
  
  const uniqueItems = new Set([...state.fields.values()].map(f => f.itemSlug));
  return uniqueItems.size >= 2 || state.fields.size >= 2;
}

export function getSelectedCount(): number {
  return state.items.size;
}

export function canCompare(): boolean {
  return state.items.size >= 2;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'amorph:selection';

export function saveToStorage(): void {
  try {
    const data = getSelectedItems();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    debug.selection('Failed to save selection', e);
  }
}

export function loadFromStorage(): void {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      const items: SelectedItem[] = JSON.parse(data);
      items.forEach(item => state.items.set(item.slug, item));
      notifyListeners();
    }
  } catch (e) {
    debug.selection('Failed to load selection', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// URL STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function getSelectionFromURL(): string[] {
  const params = new URLSearchParams(window.location.search);
  const items = params.get('items');
  return items ? items.split(',') : [];
}

export function updateURLWithSelection(): void {
  const slugs = getSelectedItems().map(i => i.slug);
  const url = new URL(window.location.href);
  
  if (slugs.length > 0) {
    url.searchParams.set('items', slugs.join(','));
  } else {
    url.searchParams.delete('items');
  }
  
  window.history.replaceState({}, '', url.toString());
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach(fn => fn());
  saveToStorage();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function dispatchSelectionEvent(): void {
  const event = new CustomEvent('amorph:selection-changed', {
    detail: {
      items: getSelectedItems(),
      fields: getSelectedFields(),  // NEW
      count: getSelectedCount(),
      fieldCount: getSelectedFieldCount(),  // NEW
      canCompare: canCompare(),
      canCompareFields: canCompareFields()  // NEW
    }
  });
  document.dispatchEvent(event);
}

// Auto-dispatch on change
subscribe(dispatchSelectionEvent);
