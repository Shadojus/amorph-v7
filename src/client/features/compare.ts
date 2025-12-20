/**
 * AMORPH v7 - Client Compare
 * 
 * Compare-Panel Management.
 */

import { debug } from './debug';
import { getSelectedItems, canCompare, getSelectedFields, getSelectedFieldsGrouped, canCompareFields } from './selection';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let comparePanel: HTMLElement | null = null;
let isOpen = false;
let isLoading = false;

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export function initCompare(panel: HTMLElement): void {
  comparePanel = panel;
  debug.compare('Compare panel initialized');
  
  // Close button
  const closeBtn = panel.querySelector('.compare-close');
  closeBtn?.addEventListener('click', hideCompare);
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      hideCompare();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export async function showCompare(): Promise<void> {
  if (!comparePanel) {
    debug.compare('No compare panel');
    return;
  }
  
  // Check if we have field-based selection or item-based
  const selectedFields = getSelectedFields();
  const selectedItems = getSelectedItems();
  
  // Prefer field-based comparison if we have fields selected
  const useFieldMode = selectedFields.length > 0;
  
  // Debug: log what we're sending
  console.log('[Compare] Selected fields:', selectedFields.map(f => ({
    field: f.fieldName,
    item: f.itemName,
    valueType: typeof f.value,
    value: f.value
  })));
  
  if (!useFieldMode && !canCompare()) {
    debug.compare('Cannot show compare', { canCompare: canCompare(), fieldCount: selectedFields.length });
    return;
  }
  
  debug.compare('Showing compare', { 
    mode: useFieldMode ? 'fields' : 'items',
    count: useFieldMode ? selectedFields.length : selectedItems.length 
  });
  
  isOpen = true;
  isLoading = true;
  comparePanel.classList.add('active');
  comparePanel.classList.add('is-loading');
  
  try {
    // Prepare request body based on mode
    const body = useFieldMode
      ? { fields: selectedFields }
      : { items: selectedItems.map(i => i.slug) };
    
    // Fetch compare HTML from API
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Compare API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Debug: Log server response
    if (data._debug) {
      console.log('[Compare] Server debug:', data._debug);
    }
    
    // Insert HTML
    const content = comparePanel.querySelector('.compare-content');
    if (content && data.html) {
      content.innerHTML = data.html;
    }
    
    debug.compare('Compare loaded', { fields: data.fieldCount });
    
  } catch (error) {
    debug.compare('Compare error', error);
    showError('Vergleich konnte nicht geladen werden');
  } finally {
    isLoading = false;
    comparePanel?.classList.remove('is-loading');
  }
}

export function hideCompare(): void {
  if (!comparePanel) return;
  
  isOpen = false;
  comparePanel.classList.remove('active');
  debug.compare('Compare hidden');
}

export function toggleCompare(): void {
  if (isOpen) {
    hideCompare();
  } else {
    showCompare();
  }
}

export function isCompareOpen(): boolean {
  return isOpen;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

function showError(message: string): void {
  const content = comparePanel?.querySelector('.compare-content');
  if (content) {
    content.innerHTML = `
      <div class="compare-error">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Listen for selection changes
document.addEventListener('amorph:selection-changed', (e: Event) => {
  const detail = (e as CustomEvent).detail;
  
  // Update compare button state - enable if we can compare items OR fields
  const canShow = detail.canCompare || detail.canCompareFields;
  const count = detail.fieldCount > 0 ? detail.fieldCount : detail.count;
  
  const compareBtn = document.querySelector('.compare-trigger');
  if (compareBtn) {
    (compareBtn as HTMLButtonElement).disabled = !canShow;
    compareBtn.classList.toggle('is-active', canShow);
    const countEl = compareBtn.querySelector('.count');
    if (countEl) {
      countEl.textContent = String(count);
    }
  }
  
  // Auto-close if nothing selected
  if (isOpen && !canShow) {
    hideCompare();
  }
});
