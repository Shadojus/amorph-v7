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

const DEBOUNCE_MS = 300;
const MAX_ACTIVE_PERSPECTIVES = 4; // FIFO limit

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchConfig {
  input: HTMLInputElement;
  grid: HTMLElement;
  perspectiveButtons?: NodeListOf<Element>;
  activePerspectivesContainer?: HTMLElement;
}

export function initSearch(config: SearchConfig): void {
  searchInput = config.input;
  gridContainer = config.grid;
  activePerspectivesContainer = config.activePerspectivesContainer || null;
  
  // Search input handler
  searchInput.addEventListener('input', () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(performSearch, DEBOUNCE_MS);
  });
  
  // Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (searchTimeout) clearTimeout(searchTimeout);
      performSearch();
    }
  });
  
  // Perspective buttons
  config.perspectiveButtons?.forEach(btn => {
    btn.addEventListener('click', () => togglePerspective(btn as HTMLElement));
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
    
    // Update perspective buttons with data status
    updatePerspectiveStatus(data.perspectivesWithData || []);\n    \n    // Speichere matched perspectives für Counter-Anzeige\n    lastMatchedPerspectives = data.matchedPerspectives || [];\n    updatePerspectiveCounters(lastMatchedPerspectives);\n    \n    // Auto-activate matched perspectives (nur wenn unter Limit, ab 4 Zeichen)\n    if (query.length >= 4 && data.matchedPerspectives?.length > 0) {\n      for (const pId of data.matchedPerspectives) {\n        if (!activePerspectives.has(pId)) {\n          activatePerspectiveById(pId);\n        }\n      }\n    }
    
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
  
  // Update UI
  document.querySelectorAll('.persp-btn').forEach(btn => {
    const id = (btn as HTMLElement).dataset.perspektive || (btn as HTMLElement).dataset.perspective;
    btn.classList.toggle('is-active', id ? activePerspectives.has(id) : false);
  });
  
  // Update active perspectives display
  updateActivePerspectivesUI();
}

export function getActivePerspectives(): string[] {
  return [...activePerspectives];
}

function updatePerspectiveStatus(withData: string[]): void {
  const dataSet = new Set(withData);
  
  document.querySelectorAll('.persp-btn').forEach(btn => {
    const id = (btn as HTMLElement).dataset.perspektive || (btn as HTMLElement).dataset.perspective;
    btn.classList.toggle('has-data', id ? dataSet.has(id) : false);
  });
}

// Update counters on perspective buttons for matched (but not active) perspectives
function updatePerspectiveCounters(matchedPerspectives: string[]): void {
  document.querySelectorAll('.persp-btn').forEach(btn => {
    const id = (btn as HTMLElement).dataset.perspektive || (btn as HTMLElement).dataset.perspective;
    if (!id) return;
    
    // Entferne bestehenden Counter
    const existingCounter = btn.querySelector('.persp-counter');
    existingCounter?.remove();
    
    // Counter nur für nicht-aktive Perspektiven mit Matches
    if (matchedPerspectives.includes(id) && !activePerspectives.has(id)) {
      const counter = document.createElement('span');
      counter.className = 'persp-counter';
      counter.textContent = '!';
      btn.appendChild(counter);
      btn.classList.add('has-match');
    } else {
      btn.classList.remove('has-match');
    }
  });
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
