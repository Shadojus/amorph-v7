/**
 * AMORPH v7 - Client App
 * 
 * Haupt-Initialisierung der Client-Anwendung.
 * Mit integriertem Observer-System für Debugging.
 */

import { debug } from './debug';
import { initSearch, restoreFromURL } from './search';
import { initGrid } from './grid';
import { initCompare, toggleCompare, showCompare, hideCompare, isCompareOpen } from './compare';
import { 
  loadFromStorage, 
  subscribe, 
  getSelectedItems, 
  getSelectedCount,
  clearSelection,
  deselectItem,
  getSelectedFieldCount
} from './selection';
import { setupObservers, stopObservers, getObserverStats, debug as observerDebug } from '../../observer';
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
  
  // Load persisted selection
  loadFromStorage();
  
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
  
  // Bottom Navigation
  initBottomNav();
  
  // Selection bar
  initSelectionBar();
  
  // Restore from URL
  restoreFromURL();
  
  // === OBSERVER SYSTEM ===
  initObservers();
  
  debug.amorph('AMORPH v7 ready');
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

function initBottomNav(): void {
  const bottomNav = document.querySelector<HTMLElement>('.bottom-nav');
  if (!bottomNav) return;
  
  const compareNavItem = bottomNav.querySelector<HTMLElement>('[data-nav="compare"]');
  const badge = compareNavItem?.querySelector('.bottom-nav-badge');
  
  // Compare button in bottom nav
  compareNavItem?.addEventListener('click', () => {
    toggleCompare();
    updateBottomNavState();
  });
  
  // Subscribe to selection changes for badge
  subscribe(() => {
    const itemCount = getSelectedCount();
    const fieldCount = getSelectedFieldCount();
    const totalCount = itemCount + fieldCount;
    
    if (badge) {
      badge.textContent = String(totalCount);
      badge.classList.toggle('has-items', totalCount > 0);
    }
  });
  
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
  
  const homeItem = bottomNav.querySelector('[data-nav="home"]');
  const compareItem = bottomNav.querySelector('[data-nav="compare"]');
  
  const compareOpen = isCompareOpen();
  
  // Toggle active states
  homeItem?.classList.toggle('is-active', !compareOpen);
  compareItem?.classList.toggle('is-active', compareOpen);
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVER SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

let activeObservers: ReturnType<typeof setupObservers> = [];

function initObservers(): void {
  // Standardmäßig AKTIVIERT für Entwicklung
  // Deaktivieren mit: localStorage.setItem('amorph:observers', 'false')
  const isDisabled = localStorage.getItem('amorph:observers') === 'false';
  
  if (isDisabled) {
    debug.amorph('Observers disabled (localStorage "amorph:observers" = false)');
    return;
  }
  
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
// SELECTION BAR
// ═══════════════════════════════════════════════════════════════════════════════

function initSelectionBar(): void {
  const selectionBar = document.querySelector<HTMLElement>('.selection-bar');
  if (!selectionBar) return;
  
  const pillsContainer = selectionBar.querySelector('.selection-pills');
  const clearBtn = selectionBar.querySelector('.selection-clear');
  
  // Clear button
  clearBtn?.addEventListener('click', () => {
    clearSelection();
  });
  
  // Subscribe to selection changes
  subscribe(() => {
    const items = getSelectedItems();
    const count = getSelectedCount();
    
    // Show/hide bar
    selectionBar.classList.toggle('is-visible', count > 0);
    
    // Update pills
    if (pillsContainer) {
      pillsContainer.innerHTML = items.map(item => `
        <button class="selection-pill" data-slug="${item.slug}">
          <span class="pill-name">${item.name}</span>
          <span class="pill-remove">×</span>
        </button>
      `).join('');
      
      // Add remove handlers
      pillsContainer.querySelectorAll('.selection-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const slug = (pill as HTMLElement).dataset.slug;
          if (slug) {
            deselectItem(slug);
          }
        });
      });
    }
    
    // Update count
    const countEl = selectionBar.querySelector('.selection-count');
    if (countEl) {
      countEl.textContent = `${count} ausgewählt`;
    }
  });
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
