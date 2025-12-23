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
  document.body.classList.add('compare-active');
  
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
    
    // Insert HTML
    const content = comparePanel.querySelector('.compare-content');
    if (content && data.html) {
      content.innerHTML = data.html;
      
      // Initialize species highlight interactions
      initSpeciesHighlight(content);
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
  document.body.classList.remove('compare-active');
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
// SPECIES HIGHLIGHT SYSTEM
// Interaktive Verknüpfung - Hover/Click auf Spezies highlightet alle zugehörigen Daten
// ═══════════════════════════════════════════════════════════════════════════════

let activeSpecies: string | null = null;

function initSpeciesHighlight(container: Element): void {
  // Find all elements with data-species attribute
  const speciesElements = container.querySelectorAll('[data-species]');
  
  speciesElements.forEach(el => {
    // Hover events
    el.addEventListener('mouseenter', handleSpeciesHover);
    el.addEventListener('mouseleave', handleSpeciesLeave);
    
    // Click for sticky highlight (toggle)
    el.addEventListener('click', handleSpeciesClick);
  });
  
  // Legend items already have data-species from server, but add cursor styling
  const legendItems = container.querySelectorAll('.legend-item[data-species], .radar-legend-item[data-species], .compare-item-header[data-species]');
  legendItems.forEach(item => {
    (item as HTMLElement).style.cursor = 'pointer';
  });
  
  debug.compare('Species highlight initialized', { count: speciesElements.length });
}

function handleSpeciesHover(e: Event): void {
  if (activeSpecies) return; // Don't override sticky highlight
  const species = (e.currentTarget as HTMLElement).dataset.species;
  if (species) highlightSpecies(species);
}

function handleSpeciesLeave(): void {
  if (activeSpecies) return; // Keep sticky highlight
  clearHighlight();
}

function handleSpeciesClick(e: Event): void {
  e.stopPropagation();
  const species = (e.currentTarget as HTMLElement).dataset.species;
  if (species) toggleStickyHighlight(species);
}

function toggleStickyHighlight(species: string): void {
  if (activeSpecies === species) {
    // Clear sticky
    activeSpecies = null;
    clearHighlight();
  } else {
    // Set new sticky
    activeSpecies = species;
    highlightSpecies(species);
  }
}

function highlightSpecies(species: string): void {
  const container = comparePanel?.querySelector('.compare-content');
  if (!container) return;
  
  // Add active class to container
  container.classList.add('species-highlight-active');
  
  // Clear previous highlights
  container.querySelectorAll('.species-highlighted').forEach(el => {
    el.classList.remove('species-highlighted');
  });
  
  // Highlight all elements of this species (data-species already includes legend items)
  container.querySelectorAll(`[data-species="${species}"]`).forEach(el => {
    el.classList.add('species-highlighted');
  });
  
  debug.compare('Species highlighted', { species });
}

function clearHighlight(): void {
  const container = comparePanel?.querySelector('.compare-content');
  if (!container) return;
  
  container.classList.remove('species-highlight-active');
  container.querySelectorAll('.species-highlighted').forEach(el => {
    el.classList.remove('species-highlighted');
  });
}

// Clear highlight when clicking outside
document.addEventListener('click', (e) => {
  if (activeSpecies && comparePanel) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-species]') && !target.closest('[data-species-legend]')) {
      activeSpecies = null;
      clearHighlight();
    }
  }
});

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
