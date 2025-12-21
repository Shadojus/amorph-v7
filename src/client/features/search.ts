/**
 * AMORPH v7 - Client Search
 * 
 * Suche und Perspektiven-Filter.
 */

import { debug } from './debug';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let searchInput: HTMLInputElement | null = null;
let gridContainer: HTMLElement | null = null;
let activePerspectives: Set<string> = new Set();
let activePerspectivesOrder: string[] = []; // FIFO order tracking
let activePerspectivesContainer: HTMLElement | null = null;
let searchTimeout: number | null = null;
let lastMatchedPerspectives: string[] = []; // Track for counter display
let perspectiveMatchCounts: Map<string, number> = new Map(); // Count per perspective
let isSearchInitialized = false; // Guard gegen doppelte Initialisierung

// Highlight Navigation State
let currentHighlightIndex = 0;
let highlightElements: HTMLElement[] = [];
let searchNavContainer: HTMLElement | null = null;

const DEBOUNCE_MS = 300;
const MAX_ACTIVE_PERSPECTIVES = 99; // Praktisch unbegrenzt

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchConfig {
  input: HTMLInputElement;
  grid: HTMLElement;
  activePerspectivesContainer?: HTMLElement;
}

export function initSearch(config: SearchConfig): void {
  // Guard gegen doppelte Initialisierung
  if (isSearchInitialized) {
    return;
  }
  isSearchInitialized = true;
  
  searchInput = config.input;
  gridContainer = config.grid;
  activePerspectivesContainer = config.activePerspectivesContainer || null;
  
  // Search Navigation Container
  searchNavContainer = document.querySelector('.search-nav');
  
  // Search Navigation Buttons
  document.querySelector('.search-nav-prev')?.addEventListener('click', () => navigateHighlight(-1));
  document.querySelector('.search-nav-next')?.addEventListener('click', () => navigateHighlight(1));
  
  // Search input handler
  searchInput.addEventListener('input', () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(performSearch, DEBOUNCE_MS);
  });
  
  // Enter key - navigate to next highlight
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightElements.length > 0) {
        navigateHighlight(e.shiftKey ? -1 : 1);
      } else {
        if (searchTimeout) clearTimeout(searchTimeout);
        performSearch();
      }
    }
  });
  
  // Initialize active perspective UI
  updateActivePerspectivesUI();
  
  debug.amorph('Search initialized');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

export async function performSearch(): Promise<void> {
  const query = searchInput?.value.trim() || '';
  const perspectives = [...activePerspectives];
  
  debug.api('Search', { query, perspectives });
  
  // Build URL
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (perspectives.length) params.set('p', perspectives.join(','));
  
  try {
    const response = await fetch(`/api/search?${params}`);
    if (!response.ok) throw new Error(`Search error: ${response.status}`);
    
    const data = await response.json();
    
    // Update grid
    if (gridContainer && data.html) {
      gridContainer.innerHTML = data.html;
    }
    
    // Update highlight navigation
    updateHighlightNavigation(query);
    
    // Update perspective buttons with data status
    updatePerspectiveStatus(data.perspectivesWithData || []);
    
    // Speichere matched perspectives für Counter-Anzeige
    lastMatchedPerspectives = data.matchedPerspectives || [];
    updatePerspectiveCounters(lastMatchedPerspectives);
    
    // Auto-activate matched perspectives (nur wenn unter Limit, ab 4 Zeichen)
    if (query.length >= 4 && data.matchedPerspectives?.length > 0) {
      for (const pId of data.matchedPerspectives) {
        if (!activePerspectives.has(pId)) {
          activatePerspectiveById(pId);
        }
      }
    }
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('amorph:search-complete', {
      detail: { query, perspectives, count: data.total }
    }));
    
    debug.api('Search complete', { count: data.total, matchedPerspectives: data.matchedPerspectives });
    
  } catch (error) {
    debug.api('Search error', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSPECTIVES
// ═══════════════════════════════════════════════════════════════════════════════

export function togglePerspective(btn: HTMLElement): void {
  const id = btn.dataset.perspektive || btn.dataset.perspective;
  if (!id) return;
  
  if (activePerspectives.has(id)) {
    // Deaktivieren
    activePerspectives.delete(id);
    activePerspectivesOrder = activePerspectivesOrder.filter(p => p !== id);
    btn.classList.remove('is-active');
  } else {
    // Aktivieren mit FIFO Limit
    if (activePerspectives.size >= MAX_ACTIVE_PERSPECTIVES) {
      // Älteste entfernen (FIFO)
      const oldest = activePerspectivesOrder.shift();
      if (oldest) {
        activePerspectives.delete(oldest);
        const oldBtn = document.querySelector(`.persp-btn[data-perspektive="${oldest}"]`);
        oldBtn?.classList.remove('is-active');
      }
    }
    activePerspectives.add(id);
    activePerspectivesOrder.push(id);
    btn.classList.add('is-active');
  }
  
  // Update active perspectives in search bar
  updateActivePerspectivesUI();
  
  debug.amorph('Perspective toggled', { id, active: activePerspectives.has(id), count: activePerspectives.size });
  
  // Trigger search
  performSearch();
}

// Activate a perspective by ID (respects FIFO limit)
function activatePerspectiveById(id: string): void {
  const btn = document.querySelector(`.persp-btn[data-perspektive="${id}"]`) as HTMLElement;
  if (btn && !activePerspectives.has(id)) {
    // Nur aktivieren wenn unter dem Limit
    if (activePerspectives.size < MAX_ACTIVE_PERSPECTIVES) {
      activePerspectives.add(id);
      activePerspectivesOrder.push(id);
      btn.classList.add('is-active');
      updateActivePerspectivesUI();
    }
  }
}

// NEW: Update the active perspectives display in search bar
function updateActivePerspectivesUI(): void {
  if (!activePerspectivesContainer) return;
  
  activePerspectivesContainer.innerHTML = '';
  
  for (const id of activePerspectives) {
    const btn = document.querySelector(`.persp-btn[data-perspektive="${id}"]`) as HTMLElement;
    const name = btn?.dataset.name || id;
    
    const pill = document.createElement('button');
    pill.className = 'active-persp-pill';
    pill.dataset.perspektive = id;
    pill.innerHTML = `<span>${name}</span><span class="remove">×</span>`;
    pill.addEventListener('click', () => {
      if (btn) togglePerspective(btn);
    });
    
    activePerspectivesContainer.appendChild(pill);
  }
}

export function setActivePerspectives(ids: string[]): void {
  // Respektiere FIFO Limit
  const limitedIds = ids.slice(0, MAX_ACTIVE_PERSPECTIVES);
  activePerspectives = new Set(limitedIds);
  activePerspectivesOrder = [...limitedIds];
  
  // Update active perspectives display
  updateActivePerspectivesUI();
}

export function getActivePerspectives(): string[] {
  return [...activePerspectives];
}

// Update counters - nur für interne Verwendung (keine DOM-Buttons mehr)
function updatePerspectiveCounters(matchedPerspectives: string[]): void {
  perspectiveMatchCounts.clear();
  for (const id of matchedPerspectives) {
    perspectiveMatchCounts.set(id, 1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// URL STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function getSearchFromURL(): { query: string; perspectives: string[] } {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') || '',
    perspectives: params.get('p')?.split(',').filter(Boolean) || []
  };
}

export function updateURLWithSearch(): void {
  const url = new URL(window.location.href);
  const query = searchInput?.value.trim() || '';
  const perspectives = [...activePerspectives];
  
  if (query) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  
  if (perspectives.length) {
    url.searchParams.set('p', perspectives.join(','));
  } else {
    url.searchParams.delete('p');
  }
  
  window.history.replaceState({}, '', url.toString());
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESTORE FROM URL
// ═══════════════════════════════════════════════════════════════════════════════

export function restoreFromURL(): void {
  const { query, perspectives } = getSearchFromURL();
  
  if (searchInput && query) {
    searchInput.value = query;
  }
  
  if (perspectives.length) {
    setActivePerspectives(perspectives);
  }
  
  if (query || perspectives.length) {
    performSearch();
  }
}
// ═══════════════════════════════════════════════════════════════════════════════
// HIGHLIGHT NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

function updateHighlightNavigation(query: string): void {
  // Wende Highlighting auf den Content an
  applyHighlighting(query);
  
  // Sammle alle Highlight-Elemente
  highlightElements = Array.from(document.querySelectorAll('.search-highlight')) as HTMLElement[];
  currentHighlightIndex = 0;
  
  // Zeige/verstecke Navigation
  if (searchNavContainer) {
    if (highlightElements.length > 0 && query.length >= 2) {
      searchNavContainer.style.display = 'flex';
      updateHighlightCounter();
      // Scrolle zum ersten Treffer
      if (highlightElements[0]) {
        scrollToHighlight(0);
      }
    } else {
      searchNavContainer.style.display = 'none';
    }
  }
}

// Client-side Text Highlighting
function applyHighlighting(query: string): void {
  if (!gridContainer || !query || query.length < 2) return;
  
  const lowerQuery = query.toLowerCase();
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // Finde alle Textknoten im Grid
  const walker = document.createTreeWalker(
    gridContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Überspringe leere Knoten und bereits markierte
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('mark')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('script')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('style')) return NodeFilter.FILTER_REJECT;
        // Nur Knoten die den Suchbegriff enthalten
        if (!node.textContent.toLowerCase().includes(lowerQuery)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }
  
  // Ersetze Textknoten mit Highlights
  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    if (!regex.test(text)) continue;
    
    // Reset regex
    regex.lastIndex = 0;
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(text)) !== null) {
      // Text vor dem Match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      // Highlight
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[1];
      fragment.appendChild(mark);
      
      lastIndex = regex.lastIndex;
    }
    
    // Rest nach dem letzten Match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    // Ersetze den Textknoten
    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}

function navigateHighlight(direction: number): void {
  if (highlightElements.length === 0) return;
  
  // Entferne aktuelle Markierung
  highlightElements[currentHighlightIndex]?.classList.remove('is-current');
  
  // Berechne neuen Index
  currentHighlightIndex += direction;
  if (currentHighlightIndex >= highlightElements.length) {
    currentHighlightIndex = 0;
  } else if (currentHighlightIndex < 0) {
    currentHighlightIndex = highlightElements.length - 1;
  }
  
  // Setze neue Markierung und scrolle
  scrollToHighlight(currentHighlightIndex);
  updateHighlightCounter();
}

function scrollToHighlight(index: number): void {
  const element = highlightElements[index];
  if (!element) return;
  
  // Markiere als aktuell
  highlightElements.forEach(el => el.classList.remove('is-current'));
  element.classList.add('is-current');
  
  // Scrolle Element in den sichtbaren Bereich
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function updateHighlightCounter(): void {
  const countEl = document.querySelector('.search-nav-count');
  if (countEl) {
    countEl.textContent = `${currentHighlightIndex + 1}/${highlightElements.length}`;
  }
}