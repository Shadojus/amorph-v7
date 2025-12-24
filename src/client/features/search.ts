/**
 * AMORPH v7 - Client Search
 * 
 * Suchmaschine mit automatischer Perspektiven-Aktivierung.
 * Perspektiven werden nicht manuell gewählt, sondern automatisch
 * basierend auf Suchbegriffen aktiviert (ab 3 Zeichen).
 */

import { debug } from './debug';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let searchInput: HTMLInputElement | null = null;
let gridContainer: HTMLElement | null = null;
let activePerspectives: Set<string> = new Set();
let activePerspectivesContainer: HTMLElement | null = null;
let searchTimeout: number | null = null;
let lastMatchedPerspectives: string[] = []; // Track for counter display
let perspectiveMatchCounts: Map<string, number> = new Map(); // Count per perspective
let isSearchInitialized = false; // Guard gegen doppelte Initialisierung
let lastSearchQuery = ''; // Track last query to detect changes

// Highlight Navigation State
let currentHighlightIndex = 0;
let highlightElements: HTMLElement[] = [];
let searchNavContainer: HTMLElement | null = null;

const DEBOUNCE_MS = 300;

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
  
  // Search Navigation Container - neue Position
  searchNavContainer = document.querySelector('.search-bar-container .search-nav') ||
                       document.querySelector('.search-nav');
  
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
  
  // Wenn Suchfeld komplett leer ist, Perspektiven zurücksetzen
  if (query === '') {
    activePerspectives.clear();
    updateActivePerspectivesUI();
  }
  // Reset Perspektiven nur wenn sich der Query geändert hat (neuer Suchbegriff)
  // Nicht wenn performSearch durch Perspektiven-Klick aufgerufen wird
  else if (query !== lastSearchQuery && query.length >= 1) {
    activePerspectives.clear();
    updateActivePerspectivesUI();
  }
  lastSearchQuery = query;
  
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
    
    // Speichere matched perspectives für Counter-Anzeige
    lastMatchedPerspectives = data.matchedPerspectives || [];
    updatePerspectiveCounters(lastMatchedPerspectives);
    
    // Auto-activate matched perspectives (ab 3 Zeichen, max 3 Perspektiven)
    // Nur aktivieren wenn es nicht zu viele Matches gibt (sonst zu unspezifisch)
    if (query.length >= 3 && data.matchedPerspectives?.length > 0 && data.matchedPerspectives.length <= 3) {
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
// PERSPECTIVES (Auto-Aktivierung durch Suche)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Aktiviert eine Perspektive automatisch (durch Suchtreffer).
 * Keine manuelle Aktivierung - reine Suchmaschinen-UX.
 */
function activatePerspectiveById(id: string): void {
  if (activePerspectives.has(id)) return;
  
  activePerspectives.add(id);
  updateActivePerspectivesUI();
  debug.amorph('Perspective auto-activated by search', { id, count: activePerspectives.size });
}

/**
 * Deaktiviert eine Perspektive (durch Klick auf Pill).
 */
function deactivatePerspective(id: string): void {
  if (!activePerspectives.has(id)) return;
  
  activePerspectives.delete(id);
  updateActivePerspectivesUI();
  
  // Suche erneut ausführen mit aktuellen Perspektiven
  // Aber lastSearchQuery nicht ändern, damit kein Reset passiert
  performSearchWithCurrentPerspectives();
  
  debug.amorph('Perspective deactivated', { id, count: activePerspectives.size });
}

/**
 * Suche ohne Perspektiven-Reset (für Perspektiven-Klicks)
 */
async function performSearchWithCurrentPerspectives(): Promise<void> {
  const query = searchInput?.value.trim() || '';
  const perspectives = [...activePerspectives];
  
  debug.api('Search (perspective change)', { query, perspectives });
  
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (perspectives.length) params.set('p', perspectives.join(','));
  
  try {
    const response = await fetch(`/api/search?${params}`);
    if (!response.ok) throw new Error(`Search error: ${response.status}`);
    
    const data = await response.json();
    
    if (gridContainer && data.html) {
      gridContainer.innerHTML = data.html;
    }
    
    updateHighlightNavigation(query);
    
    document.dispatchEvent(new CustomEvent('amorph:search-complete', {
      detail: { query, perspectives, count: data.total }
    }));
    
  } catch (error) {
    debug.api('Search error', error);
  }
}

// NEW: Update the active perspectives display
function updateActivePerspectivesUI(): void {
  if (!activePerspectivesContainer) return;
  
  // Hole Perspektiven-Daten vom Window-Objekt
  const perspectivesData = (window as any).AMORPH_PERSPECTIVES || [];
  
  activePerspectivesContainer.innerHTML = '';
  
  for (const id of activePerspectives) {
    // Finde Perspektive in globalen Daten
    const perspData = perspectivesData.find((p: any) => p.id === id);
    const name = perspData?.name || id;
    
    const pill = document.createElement('button');
    pill.className = 'active-persp-pill';
    pill.dataset.perspektive = id;
    pill.innerHTML = `<span>${name}</span><span class="remove">×</span>`;
    pill.addEventListener('click', () => {
      deactivatePerspective(id);
    });
    
    activePerspectivesContainer.appendChild(pill);
  }
}

export function setActivePerspectives(ids: string[]): void {
  activePerspectives = new Set(ids);
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
  console.log('[Highlight] updateHighlightNavigation called', { query });
  
  // Wende Highlighting auf den Content an
  applyHighlighting(query);
  
  // Sammle alle Highlight-Elemente
  highlightElements = Array.from(document.querySelectorAll('.search-highlight')) as HTMLElement[];
  currentHighlightIndex = 0;
  
  console.log('[Highlight] Found highlight elements:', highlightElements.length);
  console.log('[Highlight] searchNavContainer:', !!searchNavContainer);
  
  // Zeige/verstecke Navigation
  if (searchNavContainer) {
    if (highlightElements.length > 0 && query.length >= 3) {
      console.log('[Highlight] Showing navigation');
      searchNavContainer.style.display = 'flex';
      updateHighlightCounter();
      // Scrolle zum ersten Treffer
      if (highlightElements[0]) {
        scrollToHighlight(0);
      }
    } else {
      console.log('[Highlight] Hiding navigation');
      searchNavContainer.style.display = 'none';
    }
  }
}

// Client-side Text Highlighting
function applyHighlighting(query: string): void {
  console.log('[Highlight] applyHighlighting called', { query, gridContainer: !!gridContainer });
  
  if (!query || query.length < 3) {
    console.log('[Highlight] Early return - query too short');
    return;
  }
  
  // Prüfe ob Compare-Panel aktiv ist
  const comparePanel = document.querySelector<HTMLElement>('.amorph-compare');
  const isCompareActive = comparePanel?.classList.contains('active');
  const compareContent = document.querySelector<HTMLElement>('.compare-content');
  
  // Bestimme Such-Container basierend auf Compare-Status
  const searchContainers: HTMLElement[] = [];
  
  if (isCompareActive && compareContent && compareContent.innerHTML.trim()) {
    // Compare aktiv → NUR im Compare suchen
    searchContainers.push(compareContent);
    console.log('[Highlight] Searching in Compare only');
  } else if (gridContainer) {
    // Compare nicht aktiv → NUR im Grid suchen
    searchContainers.push(gridContainer);
    console.log('[Highlight] Searching in Grid only');
  }
  
  if (searchContainers.length === 0) return;
  
  // Normalisiere Query: Leerzeichen und Unterstriche sind äquivalent
  const lowerQuery = query.toLowerCase();
  
  // Für einfache Textsuche auch mit normalisiertem String
  const searchVariants = [
    lowerQuery,
    lowerQuery.replace(/\s+/g, '_'),
    lowerQuery.replace(/_/g, ' ')
  ];
  
  console.log('[Highlight] Looking for text nodes containing:', lowerQuery);
  
  // Durchsuche alle Container
  for (const container of searchContainers) {
    highlightInContainer(container, query, searchVariants);
  }
}

// Highlighting in einem Container - mit SVG-Schutz
function highlightInContainer(container: HTMLElement, query: string, searchVariants: string[]): void {
  const lowerQuery = query.toLowerCase();
  
  // Finde alle Textknoten im Container - KEINE SVG-Text-Elemente!
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Überspringe leere Knoten und bereits markierte
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('mark')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('script')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('style')) return NodeFilter.FILTER_REJECT;
        // WICHTIG: SVG-Text nicht modifizieren (zerstört das Rendering)
        if (node.parentElement?.closest('svg')) return NodeFilter.FILTER_REJECT;
        // Prüfe alle Varianten (mit/ohne Unterstriche)
        const textLower = node.textContent.toLowerCase();
        const textNormalized = textLower.replace(/_/g, ' ');
        const matches = searchVariants.some(v => textLower.includes(v) || textNormalized.includes(v.replace(/_/g, ' ')));
        if (!matches) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }
  
  console.log('[Highlight] Found text nodes with query:', textNodes.length);
  
  // Erstelle flexibles Regex das Leerzeichen UND Unterstriche matcht
  // "climate zones" matcht auch "climate_zones" und umgekehrt
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexiblePattern = escapedQuery.replace(/[\s_]+/g, '[\\s_]+');
  const flexibleRegex = new RegExp(`(${flexiblePattern})`, 'gi');
  
  // Ersetze Textknoten mit Highlights
  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    if (!flexibleRegex.test(text)) continue;
    
    // Reset regex
    flexibleRegex.lastIndex = 0;
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    while ((match = flexibleRegex.exec(text)) !== null) {
      // Text vor dem Match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      // Highlight
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[1];
      fragment.appendChild(mark);
      
      lastIndex = flexibleRegex.lastIndex;
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