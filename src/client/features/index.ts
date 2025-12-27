/**
 * AMORPH v7 - Client Features Index
 * 
 * Re-Exports für Client-Module.
 */

export { debug } from './debug';
export { initApp } from './app';
export { initSearch, performSearch, getActivePerspectives, restoreFromURL } from './search';
export { initGrid, updateSelectionUI } from './grid';
export { 
  initCompare, 
  showCompare,
  toggleStickyHighlight, 
  hideCompare, 
  toggleCompare, 
  isCompareOpen,
  searchInCompare,
  navigateCompareHighlight,
  clearCompareHighlights,
  getCompareHighlightInfo
} from './compare';
export {
  selectItem,
  deselectItem,
  toggleItem,
  clearSelection,
  isSelected,
  getSelectedItems,
  getSelectedCount,
  canCompare,
  subscribe,
  loadFromStorage,
  // NEW: Field selection
  selectField,
  deselectField,
  isFieldSelected,
  getFieldColor,
  getSelectedFields,
  getSelectedFieldsGrouped,
  getSelectedFieldCount,
  canCompareFields
} from './selection';

// Bifroest Copyright System
export { initBifroest, toggleBifroest } from './bifroest';
