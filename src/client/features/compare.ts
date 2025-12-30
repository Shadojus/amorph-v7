/**
 * AMORPH v7 - Client Compare
 * 
 * Compare-Panel Management.
 */

import { debug } from './debug';
import { getSelectedItems, canCompare, getSelectedFields, getSelectedFieldsGrouped, canCompareFields, deselectField, selectField, isFieldSelected } from './selection';

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
  
  // Copy button
  const copyBtn = panel.querySelector('.compare-copy');
  copyBtn?.addEventListener('click', handleCopyData);
  
  // Autocomplete button
  const autocompleteBtn = panel.querySelector('.compare-autocomplete');
  autocompleteBtn?.addEventListener('click', handleAutocomplete);
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      hideCompare();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COPY FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════════════════

async function handleCopyData(): Promise<void> {
  if (!comparePanel) return;
  
  const copyBtn = comparePanel.querySelector('.compare-copy');
  const selectedFields = getSelectedFields();
  
  // Debug: Log what we have
  console.log('[Copy] Selected fields:', selectedFields.length, selectedFields);
  
  // Baue strukturierten Text für Clipboard
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '  AMORPH Data Export',
    '  Free License – Bei Nutzung bitte Quelle angeben',
    '  Quelle: https://funginomi.de',
    '═══════════════════════════════════════════════════════════════',
    ''
  ];
  
  // Gruppiere nach Item - Map.entries() für korrektes Iterieren
  const grouped = getSelectedFieldsGrouped();
  
  for (const [itemSlug, fields] of grouped.entries()) {
    const itemName = fields[0]?.itemName || itemSlug;
    lines.push(`── ${itemName} ──`);
    
    for (const field of fields) {
      const valueStr = formatValueForExport(field.value);
      lines.push(`  ${field.fieldName}: ${valueStr}`);
    }
    lines.push('');
  }
  
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('Exportiert am: ' + new Date().toLocaleString('de-DE'));
  
  const textContent = lines.join('\n');
  
  try {
    await navigator.clipboard.writeText(textContent);
    
    // Visuelles Feedback
    if (copyBtn) {
      copyBtn.classList.add('is-copied');
      const label = copyBtn.querySelector('.copy-label');
      const originalText = label?.textContent;
      if (label) label.textContent = 'Kopiert!';
      
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        if (label && originalText) label.textContent = originalText;
      }, 2000);
    }
    
    debug.compare('Data copied to clipboard', { fields: selectedFields.length });
  } catch (err) {
    debug.compare('Copy failed', err);
    console.error('Copy to clipboard failed:', err);
  }
}

function formatValueForExport(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  if (Array.isArray(value)) {
    return value.map(v => formatValueForExport(v)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOCOMPLETE FUNCTIONALITY
// Ergänzt fehlende Felder bei allen Spezies im Vergleich
// ═══════════════════════════════════════════════════════════════════════════════

async function handleAutocomplete(): Promise<void> {
  if (!comparePanel) return;
  
  const autocompleteBtn = comparePanel.querySelector('.compare-autocomplete');
  const selectedFields = getSelectedFields();
  
  if (selectedFields.length === 0) {
    debug.compare('Autocomplete: No fields selected');
    return;
  }
  
  // 1. Sammle alle einzigartigen Feld-Namen
  const uniqueFieldNames = new Set<string>();
  selectedFields.forEach(f => uniqueFieldNames.add(f.fieldName));
  
  // 2. Sammle alle einzigartigen Spezies (itemSlugs)
  const uniqueItemSlugs = new Set<string>();
  selectedFields.forEach(f => uniqueItemSlugs.add(f.itemSlug));
  
  debug.compare('Autocomplete starting', { 
    fieldNames: [...uniqueFieldNames], 
    itemSlugs: [...uniqueItemSlugs] 
  });
  
  // 3. Hole Daten für alle Spezies via API
  try {
    autocompleteBtn?.classList.add('is-loading');
    
    const response = await fetch('/api/autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemSlugs: [...uniqueItemSlugs],
        fieldNames: [...uniqueFieldNames]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.status}`);
    }
    
    const data = await response.json();
    // data.fields: Array<{ itemSlug, itemName, fieldName, value, perspectiveId }>
    
    let addedCount = 0;
    
    // 4. Füge fehlende Felder hinzu
    for (const field of data.fields) {
      if (!isFieldSelected(field.itemSlug, field.fieldName)) {
        selectField(
          field.itemSlug, 
          field.itemName, 
          field.fieldName, 
          field.value, 
          field.perspectiveId
        );
        addedCount++;
      }
    }
    
    debug.compare('Autocomplete completed', { added: addedCount });
    
    // Visual feedback
    if (autocompleteBtn) {
      autocompleteBtn.classList.remove('is-loading');
      autocompleteBtn.classList.add('is-success');
      const label = autocompleteBtn.querySelector('.autocomplete-label');
      const originalText = label?.textContent;
      if (label) label.textContent = addedCount > 0 ? `+${addedCount} fields` : 'Complete';
      
      setTimeout(() => {
        autocompleteBtn.classList.remove('is-success');
        if (label && originalText) label.textContent = originalText;
      }, 2000);
    }
    
    // Refresh compare view if fields were added
    if (addedCount > 0) {
      showCompare(true); // seamless update
    }
    
  } catch (err) {
    debug.compare('Autocomplete failed', err);
    console.error('Autocomplete failed:', err);
    autocompleteBtn?.classList.remove('is-loading');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export async function showCompare(seamless = false): Promise<void> {
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
    count: useFieldMode ? selectedFields.length : selectedItems.length,
    seamless
  });
  
  isOpen = true;
  isLoading = true;
  comparePanel.classList.add('active');
  document.body.classList.add('compare-active');
  
  // Only show loading state for initial load, not seamless updates
  if (!seamless) {
    comparePanel.classList.add('is-loading');
  }
  
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
    
    // Insert HTML with smooth transition for seamless updates
    const content = comparePanel.querySelector('.compare-content');
    if (content && data.html) {
      if (seamless) {
        // Diff-based update: only add/remove changed fields
        // Legend wird nicht mehr im Compare Panel angezeigt - Pills sind jetzt über der Bottom Bar
        const newItemCount = String(data.itemCount);
        
        // Create temp container to parse new HTML
        const temp = document.createElement('div');
        temp.innerHTML = data.html;
        const newFieldsContainer = temp.querySelector('.compare-fields');
        
        // Entferne jede existierende Legend (falls alte cached Response)
        const existingLegend = content.querySelector('.compare-legend');
        if (existingLegend) {
          existingLegend.remove();
        }
        
        // Update fields
        const existingFields = content.querySelector('.compare-fields');
        if (existingFields && newFieldsContainer) {
          await updateFieldsDiff(existingFields, newFieldsContainer);
        } else if (newFieldsContainer) {
          // Create fields container if needed
          let fieldsContainer = content.querySelector('.compare-fields');
          if (!fieldsContainer) {
            fieldsContainer = document.createElement('div');
            fieldsContainer.className = 'compare-fields';
            content.appendChild(fieldsContainer);
          }
          // Copy new rows
          newFieldsContainer.querySelectorAll('.compare-field-row').forEach(row => {
            row.classList.add('is-adding');
            fieldsContainer!.appendChild(row);
          });
          void content.offsetHeight;
          requestAnimationFrame(() => {
            fieldsContainer!.querySelectorAll('.is-adding').forEach(el => el.classList.remove('is-adding'));
          });
        }
      } else {
        content.innerHTML = data.html;
        
        // Entferne jede Legend aus dem Response (falls alte cached Response)
        const legacyLegend = content.querySelector('.compare-legend');
        if (legacyLegend) {
          legacyLegend.remove();
        }
      }
      
      // Initialize species highlight interactions
      initSpeciesHighlight(content);
    }
    
    debug.compare('Compare loaded', { fields: data.fieldCount });
    
  } catch (error) {
    debug.compare('Compare error', error);
    if (!seamless) {
      showError('Vergleich konnte nicht geladen werden');
    }
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
// COMPARE SEARCH
// Durchsucht den Compare-Content und highlightet Treffer
// ═══════════════════════════════════════════════════════════════════════════════

let compareHighlightElements: HTMLElement[] = [];
let compareHighlightIndex = 0;

export function searchInCompare(query: string): { count: number; elements: HTMLElement[] } {
  if (!comparePanel || !isOpen) {
    return { count: 0, elements: [] };
  }
  
  const content = comparePanel.querySelector('.compare-content');
  if (!content) {
    return { count: 0, elements: [] };
  }
  
  // Clear previous highlights
  clearCompareHighlights();
  
  if (!query || query.length < 2) {
    return { count: 0, elements: [] };
  }
  
  const queryLower = query.toLowerCase();
  compareHighlightElements = [];
  compareHighlightIndex = 0;
  
  // Walk through all text nodes and highlight matches
  const walker = document.createTreeWalker(
    content,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('mark.compare-highlight')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('script, style, svg')) return NodeFilter.FILTER_REJECT;
        if (node.textContent.toLowerCase().includes(queryLower)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }
  
  // Highlight matches
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent || '';
    if (!regex.test(text)) return;
    regex.lastIndex = 0;
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      // Highlighted match
      const mark = document.createElement('mark');
      mark.className = 'compare-highlight';
      mark.textContent = match[1];
      fragment.appendChild(mark);
      compareHighlightElements.push(mark);
      
      lastIndex = regex.lastIndex;
    }
    
    // Remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    textNode.parentNode?.replaceChild(fragment, textNode);
  });
  
  // Scroll to first highlight
  if (compareHighlightElements.length > 0) {
    scrollToCompareHighlight(0);
  }
  
  debug.compare('Search in compare', { query, matches: compareHighlightElements.length });
  
  return { count: compareHighlightElements.length, elements: compareHighlightElements };
}

export function navigateCompareHighlight(direction: 1 | -1): void {
  if (compareHighlightElements.length === 0) return;
  
  compareHighlightIndex = (compareHighlightIndex + direction + compareHighlightElements.length) % compareHighlightElements.length;
  scrollToCompareHighlight(compareHighlightIndex);
}

function scrollToCompareHighlight(index: number): void {
  compareHighlightElements.forEach((el, i) => {
    el.classList.toggle('is-current', i === index);
  });
  
  const element = compareHighlightElements[index];
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function clearCompareHighlights(): void {
  if (!comparePanel) return;
  
  const content = comparePanel.querySelector('.compare-content');
  if (!content) return;
  
  content.querySelectorAll('mark.compare-highlight').forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
  });
  
  compareHighlightElements = [];
  compareHighlightIndex = 0;
}

export function getCompareHighlightInfo(): { current: number; total: number } {
  return {
    current: compareHighlightElements.length > 0 ? compareHighlightIndex + 1 : 0,
    total: compareHighlightElements.length
  };
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
  
  // Field value items - klickbar machen für Highlight
  const fieldValueItems = container.querySelectorAll('.field-value-item');
  fieldValueItems.forEach(item => {
    const label = item.querySelector('.item-label');
    if (label) {
      const species = label.textContent?.trim();
      if (species) {
        (item as HTMLElement).style.cursor = 'pointer';
        item.addEventListener('mouseenter', () => {
          if (!activeSpecies) highlightSpecies(species);
        });
        item.addEventListener('mouseleave', () => {
          if (!activeSpecies) clearHighlight();
        });
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleStickyHighlight(species);
        });
      }
    }
  });
  
  // Radar legend items - klickbar machen
  const radarLegendItems = container.querySelectorAll('.radar-legend-item');
  radarLegendItems.forEach(item => {
    const species = (item as HTMLElement).dataset.species || 
                    item.querySelector('.radar-legend-label')?.textContent?.trim();
    if (species) {
      (item as HTMLElement).style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => {
        if (!activeSpecies) highlightSpecies(species);
      });
      item.addEventListener('mouseleave', () => {
        if (!activeSpecies) clearHighlight();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStickyHighlight(species);
      });
    }
  });
  
  // Sparkline legend items - klickbar machen
  const sparklineLegendItems = container.querySelectorAll('.sparkline-legend-item');
  sparklineLegendItems.forEach(item => {
    const species = (item as HTMLElement).dataset.species || item.textContent?.trim();
    if (species) {
      (item as HTMLElement).style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => {
        if (!activeSpecies) highlightSpecies(species);
      });
      item.addEventListener('mouseleave', () => {
        if (!activeSpecies) clearHighlight();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStickyHighlight(species);
      });
    }
  });
  
  // Timeline legend items - klickbar machen
  const timelineLegendItems = container.querySelectorAll('.timeline-legend-item');
  timelineLegendItems.forEach(item => {
    const species = item.textContent?.trim();
    if (species) {
      (item as HTMLElement).style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => {
        if (!activeSpecies) highlightSpecies(species);
      });
      item.addEventListener('mouseleave', () => {
        if (!activeSpecies) clearHighlight();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStickyHighlight(species);
      });
    }
  });
  
  // Add remove button handlers for legend items (species-level removal)
  const removeButtons = container.querySelectorAll('.legend-remove[data-slug]');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', handleRemoveFromCompare);
  });
  
  // Add remove button handlers for individual field rows
  const fieldRemoveButtons = container.querySelectorAll('.field-remove[data-field-key]');
  fieldRemoveButtons.forEach(btn => {
    btn.addEventListener('click', handleRemoveField);
  });
  
  debug.compare('Species highlight initialized', { 
    speciesElements: speciesElements.length, 
    fieldValueItems: fieldValueItems.length,
    radarLegendItems: radarLegendItems.length,
    removeButtons: removeButtons.length 
  });
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

/**
 * Handle click on remove button in compare legend
 * Removes all fields of that species from selection and refreshes compare view
 */
function handleRemoveFromCompare(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  
  const btn = e.currentTarget as HTMLElement;
  const slug = btn.dataset.slug;
  
  if (!slug) return;
  
  // Get all selected fields and remove those from this item
  const selectedFields = getSelectedFields();
  const fieldsToRemove = selectedFields.filter(f => f.itemSlug === slug);
  
  debug.compare('Removing from compare', { slug, fieldCount: fieldsToRemove.length });
  
  // Remove each field
  fieldsToRemove.forEach(field => {
    deselectField(field.itemSlug, field.fieldName);
  });
  
  // Refresh compare view if still open and we have remaining fields
  const remainingFields = getSelectedFields();
  if (remainingFields.length > 0) {
    showCompare();  // Refresh
  } else {
    hideCompare();  // Nothing left to compare
  }
}

/**
 * Handle click on remove button for individual field row
 * Removes specific fields from selection and refreshes compare view
 */
function handleRemoveField(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  
  const btn = e.currentTarget as HTMLElement;
  const fieldKey = btn.dataset.fieldKey;
  
  if (!fieldKey) return;
  
  // Parse field key: "itemSlug:fieldName|itemSlug:fieldName|..."
  const fieldParts = fieldKey.split('|');
  
  debug.compare('Removing field row', { fieldKey, parts: fieldParts.length });
  
  // Remove each field in this row
  fieldParts.forEach(part => {
    const [itemSlug, fieldName] = part.split(':');
    if (itemSlug && fieldName) {
      deselectField(itemSlug, fieldName);
    }
  });
  
  // Refresh compare view if still open and we have remaining fields
  const remainingFields = getSelectedFields();
  if (remainingFields.length > 0) {
    showCompare(true);  // Seamless refresh
  } else {
    hideCompare();  // Nothing left to compare
  }
}

export function toggleStickyHighlight(species: string): void {
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

// ═══════════════════════════════════════════════════════════════════════════════
// DIFF-BASED FIELD UPDATES
// Only add/remove changed fields for smooth transitions
// ═══════════════════════════════════════════════════════════════════════════════

async function updateFieldsDiff(existing: Element, incoming: Element): Promise<void> {
  const existingRows = existing.querySelectorAll('.compare-field-row[data-field-key]');
  const incomingRows = incoming.querySelectorAll('.compare-field-row[data-field-key]');
  
  // Build maps of field keys
  const existingKeys = new Map<string, Element>();
  existingRows.forEach(row => {
    const key = row.getAttribute('data-field-key');
    if (key) existingKeys.set(key, row);
  });
  
  const incomingKeys = new Map<string, Element>();
  incomingRows.forEach(row => {
    const key = row.getAttribute('data-field-key');
    if (key) incomingKeys.set(key, row);
  });
  
  // Find fields to remove (in existing but not in incoming)
  const toRemove: Element[] = [];
  existingKeys.forEach((row, key) => {
    if (!incomingKeys.has(key)) {
      toRemove.push(row);
    }
  });
  
  // Find fields to add (in incoming but not in existing)
  const toAdd: Element[] = [];
  incomingKeys.forEach((row, key) => {
    if (!existingKeys.has(key)) {
      toAdd.push(row);
    }
  });
  
  // Instant removal - no animation delay
  toRemove.forEach(row => row.remove());
  
  // Add new fields instantly with brief fade
  for (const row of toAdd) {
    row.classList.add('is-adding');
    existing.appendChild(row);
  }
  
  // Quick reflow and remove class
  if (toAdd.length > 0) {
    void existing.offsetHeight;
    requestAnimationFrame(() => {
      existing.querySelectorAll('.is-adding').forEach(el => {
        el.classList.remove('is-adding');
      });
    });
  }
  
  debug.compare('Fields diff update', { removed: toRemove.length, added: toAdd.length });
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
  
  // Highlight all elements of this species
  // 1. Elements with data-species attribute
  container.querySelectorAll(`[data-species="${species}"]`).forEach(el => {
    el.classList.add('species-highlighted');
  });
  
  // 2. Field value items - match by item-label text content
  container.querySelectorAll('.field-value-item').forEach(el => {
    const label = el.querySelector('.item-label');
    if (label && label.textContent?.trim() === species) {
      el.classList.add('species-highlighted');
    }
  });
  
  // 3. Radar legend items
  container.querySelectorAll('.radar-legend-item').forEach(el => {
    const labelEl = el.querySelector('.radar-legend-label');
    if (labelEl && labelEl.textContent?.trim() === species) {
      el.classList.add('species-highlighted');
    }
    // Auch data-species prüfen
    if (el.getAttribute('data-species') === species) {
      el.classList.add('species-highlighted');
    }
  });
  
  // 4. Sparkline legend items
  container.querySelectorAll('.sparkline-legend-item').forEach(el => {
    if (el.getAttribute('data-species') === species || el.textContent?.trim() === species) {
      el.classList.add('species-highlighted');
    }
  });
  
  // 5. Timeline legend items
  container.querySelectorAll('.timeline-legend-item').forEach(el => {
    if (el.textContent?.trim() === species) {
      el.classList.add('species-highlighted');
    }
  });
  
  // Auch die Selection Pills dimmen
  updateSelectionPillsHighlight(species);
  
  debug.compare('Species highlighted', { species });
}

function clearHighlight(): void {
  const container = comparePanel?.querySelector('.compare-content');
  if (!container) return;
  
  container.classList.remove('species-highlight-active');
  container.querySelectorAll('.species-highlighted').forEach(el => {
    el.classList.remove('species-highlighted');
  });
  
  // Selection Pills zurücksetzen
  updateSelectionPillsHighlight(null);
}

// Update selection pills dimming based on active species
function updateSelectionPillsHighlight(activeSpeciesName: string | null): void {
  const pills = document.querySelectorAll('.selection-pill');
  pills.forEach(pill => {
    const pillSpecies = pill.getAttribute('data-species');
    if (activeSpeciesName === null) {
      // Kein Highlight aktiv - alle Pills normal
      pill.classList.remove('is-dimmed');
    } else if (pillSpecies === activeSpeciesName) {
      // Diese Spezies ist aktiv - nicht dimmen
      pill.classList.remove('is-dimmed');
    } else {
      // Andere Spezies - dimmen
      pill.classList.add('is-dimmed');
    }
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
    return;
  }
  
  // Live update: seamlessly refresh compare view if open and selection changed
  if (isOpen && canShow && !isLoading) {
    showCompare(true);  // Seamless update without loading indicator
  }
});
