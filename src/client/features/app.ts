/**
 * AMORPH v7 - Client App
 * 
 * Haupt-Initialisierung der Client-Anwendung.
 * PERFORMANCE OPTIMIERT: Observer nur bei Bedarf laden
 */

import { debug } from './debug';
import { initSearch, restoreFromURL } from './search';
import { initGrid } from './grid';
import { initCompare, toggleCompare, showCompare, hideCompare, isCompareOpen, toggleStickyHighlight } from './compare';
import { 
  loadFromStorage, 
  subscribe, 
  getSelectedItems, 
  getSelectedCount,
  clearSelection,
  deselectItem,
  getSelectedFieldCount,
  getSelectedFieldsGrouped,
  getSelectedFields,
  clearFields
} from './selection';
import { initBifroest } from './bifroest';
// PERFORMANCE: Observer wird nur bei Bedarf dynamisch importiert
import { morphDebug } from '../../morphs/debug';

// Expose morphDebug globally for console access
if (typeof window !== 'undefined') {
  (window as any).morphDebug = morphDebug;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

let isInitialized = false;

export function initApp(): void {
  // Guard gegen doppelte Initialisierung
  if (isInitialized) {
    debug.amorph('Already initialized, skipping...');
    return;
  }
  isInitialized = true;
  
  debug.amorph('AMORPH v7 initializing...');
  debug.amorph('💡 Tipp: morphDebug.enable() für Morph-Debugging, morphDebug.help() für Befehle');
  
  // Search - neue prominente Suchleiste
  const searchInput = document.querySelector<HTMLInputElement>('.search-input-main') ||
                      document.querySelector<HTMLInputElement>('.amorph-search input');
  const gridContainer = document.querySelector<HTMLElement>('.amorph-grid');
  const activePerspectivesContainer = document.querySelector<HTMLElement>('.search-bar-container .active-perspectives') ||
                                       document.querySelector<HTMLElement>('.active-perspectives');
  
  if (searchInput && gridContainer) {
    initSearch({
      input: searchInput,
      grid: gridContainer,
      activePerspectivesContainer: activePerspectivesContainer || undefined
    });
  }
  
  // Grid
  if (gridContainer) {
    initGrid(gridContainer);
  }
  
  // Compare
  const comparePanel = document.querySelector<HTMLElement>('.amorph-compare');
  if (comparePanel) {
    initCompare(comparePanel);
  }
  
  // Compare button (legacy - im Header, jetzt versteckt)
  const compareBtn = document.querySelector('.compare-trigger');
  compareBtn?.addEventListener('click', () => toggleCompare());
  
  // Bottom Navigation - MUSS vor loadFromStorage kommen, damit Subscribe aktiv ist
  initBottomNav();
  
  // Selection bar
  initSelectionBar();
  
  // JETZT erst Selection laden - damit alle Subscriber bereits registriert sind
  loadFromStorage();
  
  // Restore from URL
  restoreFromURL();
  
  // === OBSERVER SYSTEM ===
  initObservers();
  
  // === BIFROEST COPYRIGHT SYSTEM ===
  initBifroest();
  
  debug.amorph('AMORPH v7 ready');
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

function initBottomNav(): void {
  const bottomNav = document.querySelector<HTMLElement>('.bottom-nav');
  if (!bottomNav) return;
  
  const searchNavItem = bottomNav.querySelector<HTMLElement>('[data-nav="search"]');
  const compareNavItem = bottomNav.querySelector<HTMLElement>('[data-nav="compare"]');
  const badge = compareNavItem?.querySelector('.bottom-nav-badge');
  
  // Initial disabled state for Compare button
  compareNavItem?.classList.add('is-disabled');
  
  // Search button - focuses search input
  searchNavItem?.addEventListener('click', () => {
    const searchInput = document.querySelector<HTMLInputElement>('.search-input-main');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      // Smooth scroll to top where search is
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  // Compare button in bottom nav
  compareNavItem?.addEventListener('click', () => {
    // Don't open compare if no items selected
    if (compareNavItem.classList.contains('is-disabled')) {
      return;
    }
    toggleCompare();
    updateBottomNavState();
  });
  
  // Badge update function
  const updateBadge = () => {
    const itemCount = getSelectedCount();
    const fieldCount = getSelectedFieldCount();
    const totalCount = itemCount + fieldCount;
    
    if (badge) {
      badge.textContent = String(totalCount);
      badge.classList.toggle('has-items', totalCount > 0);
    }
  };
  
  // Subscribe to selection changes for badge
  subscribe(updateBadge);
  
  // WICHTIG: Initial badge update NACH loadFromStorage
  // Timeout um sicherzustellen dass Storage geladen ist
  setTimeout(updateBadge, 0);
  
  // Update nav state when compare panel changes
  const observer = new MutationObserver(() => {
    updateBottomNavState();
  });
  
  const comparePanel = document.querySelector('.amorph-compare');
  if (comparePanel) {
    observer.observe(comparePanel, { attributes: true, attributeFilter: ['class'] });
  }
  
  debug.amorph('Bottom navigation initialized');
}

function updateBottomNavState(): void {
  const bottomNav = document.querySelector<HTMLElement>('.bottom-nav');
  if (!bottomNav) return;
  
  const searchItem = bottomNav.querySelector('[data-nav="search"]');
  const homeItem = bottomNav.querySelector('[data-nav="home"]');
  const compareItem = bottomNav.querySelector('[data-nav="compare"]');
  
  const compareOpen = isCompareOpen();
  
  // Toggle active states
  searchItem?.classList.toggle('is-active', !compareOpen);
  homeItem?.classList.toggle('is-active', !compareOpen);
  compareItem?.classList.toggle('is-active', compareOpen);
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVER SYSTEM - PERFORMANCE: Dynamic Import
// ═══════════════════════════════════════════════════════════════════════════════

let activeObservers: any[] = [];

async function initObservers(): Promise<void> {
  // Production: Standardmäßig DEAKTIVIERT
  // Aktivieren mit: localStorage.setItem('amorph:observers', 'true')
  // Oder: ?observe=true in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlOverride = urlParams.get('observe');
  const localSetting = localStorage.getItem('amorph:observers');
  
  // URL-Parameter hat Priorität, dann localStorage, dann false als Default
  const isEnabled = urlOverride === 'true' || 
    (urlOverride !== 'false' && localSetting === 'true');
  
  if (!isEnabled) {
    debug.amorph('Observers disabled (enable with localStorage "amorph:observers" = true or ?observe=true)');
    return;
  }
  
  // PERFORMANCE: Nur wenn aktiviert, dann laden (87KB einsparen!)
  const { setupObservers, stopObservers, getObserverStats } = await import('../../observer');
  
  const container = document.body;
  const sessionId = getOrCreateSessionId();
  
  activeObservers = setupObservers(container, {
    interaction: { enabled: true },
    rendering: { enabled: true },
    session: { enabled: true }
  }, sessionId);
  
  debug.amorph('Observer system active', { count: activeObservers.length });
  
  // Expose stats to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).getAmorphStats = getObserverStats;
    (window as any).stopObservers = () => stopObservers(activeObservers);
  }
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('amorph:session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('amorph:session', sessionId);
  }
  return sessionId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION BAR - Shows species with selected fields
// ═══════════════════════════════════════════════════════════════════════════════

// Bio-Lumineszenz Farben für Spezies (EXAKT gleiche wie im Compare API!)
const BIO_COLORS = [
  '#00ffc8', // Foxfire Grün
  '#a78bfa', // Myzel Violett
  '#fbbf24', // Sporen Amber
  '#22d3ee', // Tiefsee Cyan
  '#f472b6', // Rhodotus Rosa
  '#a3e635', // Chlorophyll Grün
  '#fb923c', // Carotin Orange
  '#c4b5fd'  // Lavendel
];

// Track which species gets which color (persists during session)
const speciesColorMap = new Map<string, string>();
let colorIndex = 0;

function getSpeciesColor(slug: string): string {
  if (!speciesColorMap.has(slug)) {
    speciesColorMap.set(slug, BIO_COLORS[colorIndex % BIO_COLORS.length]);
    colorIndex++;
  }
  return speciesColorMap.get(slug)!;
}

function initSelectionBar(): void {
  const selectionBar = document.querySelector<HTMLElement>('.selection-bar');
  if (!selectionBar) return;
  
  const pillsContainer = selectionBar.querySelector('.selection-pills');
  const clearBtn = selectionBar.querySelector('.selection-clear');
  
  // Clear button - clears all fields
  clearBtn?.addEventListener('click', () => {
    clearFields();
  });
  
  // Subscribe to selection changes
  subscribe(() => {
    const fieldCount = getSelectedFieldCount();
    const grouped = getSelectedFieldsGrouped();
    
    // Show/hide bar based on field count
    selectionBar.classList.toggle('is-visible', fieldCount > 0);
    
    // Update Compare button disabled state (fallback for browsers without :has())
    const compareBtn = document.querySelector('.bottom-nav-item[data-nav="compare"]');
    if (compareBtn) {
      compareBtn.classList.toggle('is-disabled', fieldCount === 0);
    }
    
    // Update pills - one pill per species that has selected fields
    if (pillsContainer) {
      const pills: string[] = [];
      
      for (const [itemSlug, fields] of grouped.entries()) {
        if (fields.length === 0) continue;
        
        const itemName = fields[0]?.itemName || itemSlug;
        // Use consistent bio color for this species
        const color = getSpeciesColor(itemSlug);
        
        // Get image URL from the item element
        const itemElement = document.querySelector(`.amorph-item[data-slug="${itemSlug}"]`);
        const imgElement = itemElement?.querySelector('.item-image img') as HTMLImageElement | null;
        const imageUrl = imgElement?.src || '';
        
        // Use image if available, otherwise use colored dot
        const thumbnailHtml = imageUrl 
          ? `<img class="pill-image" src="${imageUrl}" alt="${itemName}" />`
          : `<span class="pill-dot"></span>`;
        
        pills.push(`
          <button class="selection-pill" data-slug="${itemSlug}" data-species="${itemName}" style="--pill-color: ${color}">
            ${thumbnailHtml}
            <span class="pill-name">${itemName}</span>
            <span class="pill-remove">×</span>
          </button>
        `);
      }
      
      pillsContainer.innerHTML = pills.join('');
      
      // Add click handlers for pills
      pillsContainer.querySelectorAll('.selection-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const slug = (pill as HTMLElement).dataset.slug;
          const species = (pill as HTMLElement).dataset.species;
          
          if (target.classList.contains('pill-remove')) {
            // Remove all fields for this species
            if (slug) {
              const fields = getSelectedFields().filter(f => f.itemSlug === slug);
              fields.forEach(f => {
                import('./selection').then(mod => mod.deselectField(f.itemSlug, f.fieldName));
              });
            }
          } else if (species) {
            // Toggle species highlight in compare view
            toggleStickyHighlight(species);
          }
        });
      });
    }
    
    // Update detail link colors for items with selected fields
    updateDetailLinkColors(grouped);
    
    // Update count text
    const countEl = selectionBar.querySelector('.selection-count');
    if (countEl) {
      const speciesCount = grouped.size;
      countEl.textContent = speciesCount === 1 
        ? `1 Spezies` 
        : `${speciesCount} Spezies`;
    }
  });
}

// Update detail link arrow colors based on selection
function updateDetailLinkColors(grouped: Map<string, Array<{itemSlug: string}>>): void {
  // Reset all detail links first
  document.querySelectorAll('.amorph-item').forEach(item => {
    const link = item.querySelector('.item-detail-link') as HTMLElement;
    if (link) {
      link.style.removeProperty('--link-color');
      link.classList.remove('has-selection');
    }
  });
  
  // Color the links for items with selected fields
  for (const [itemSlug] of grouped.entries()) {
    const item = document.querySelector(`.amorph-item[data-slug="${itemSlug}"]`);
    if (item) {
      const link = item.querySelector('.item-detail-link') as HTMLElement;
      if (link) {
        const color = getSpeciesColor(itemSlug);
        link.style.setProperty('--link-color', color);
        link.classList.add('has-selection');
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INIT
// ═══════════════════════════════════════════════════════════════════════════════

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
