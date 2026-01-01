/**
 * Suche Morph
 * Transformiert Suche-Config zu Suchleisten-Element
 * Inkl. Highlight-Navigation (Pfeile zum Springen zwischen Treffern)
 * Navigation wechselt auch Perspektiven, damit versteckte Highlights sichtbar werden
 */

import { debug } from '../observer/debug.js';

export function suche(config, morphConfig = {}) {
  debug.search('Morph created', config);
  
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  
  const input = document.createElement('input');
  input.type = 'text';  // Kein 'search' - damit kein X-Button erscheint
  input.placeholder = config.placeholder || 'Suchen...';
  input.setAttribute('aria-label', 'Suche');
  input.setAttribute('autocomplete', 'off');
  
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'amorph-suche-btn';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Suchen');
  
  // Highlight-Navigation Container (versteckt wenn keine Treffer)
  const highlightNav = document.createElement('div');
  highlightNav.className = 'amorph-highlight-nav';
  highlightNav.style.display = 'none';
  
  // Pfeil hoch (vorheriger Treffer)
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'amorph-highlight-nav-btn';
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', 'Vorheriger Treffer');
  prevBtn.title = 'Vorheriger (Shift+Enter)';
  
  // Counter (z.B. "3/12")
  const counter = document.createElement('span');
  counter.className = 'amorph-highlight-counter';
  counter.textContent = '';
  
  // Pfeil runter (nächster Treffer)
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'amorph-highlight-nav-btn';
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', 'Nächster Treffer');
  nextBtn.title = 'Nächster (Enter)';
  
  highlightNav.appendChild(prevBtn);
  highlightNav.appendChild(counter);
  highlightNav.appendChild(nextBtn);
  
  form.appendChild(input);
  form.appendChild(highlightNav);
  form.appendChild(button);
  
  // === Highlight Navigation Logik ===
  let currentHighlightIndex = -1; // Start bei -1, erster Klick geht zu 0
  let highlights = [];
  
  function getAllHighlights() {
    // Alle Highlights finden, auch versteckte
    // Sortiert nach DOM-Position (oben nach unten)
    return Array.from(document.querySelectorAll('.amorph-highlight'));
  }
  
  function updateHighlights() {
    highlights = getAllHighlights();
    const count = highlights.length;
    
    if (count > 0) {
      highlightNav.style.display = 'flex';
      // Reset Index bei neuer Suche
      currentHighlightIndex = -1;
      counter.textContent = `0/${count}`;
    } else {
      highlightNav.style.display = 'none';
      currentHighlightIndex = -1;
      counter.textContent = '';
    }
  }
  
  /**
   * Findet die Perspektive für ein Feld und aktiviert sie (ohne Toggle)
   */
  function ensureHighlightVisible(highlight) {
    // Finde das data-field Container des Highlights
    const fieldContainer = highlight.closest('amorph-container[data-field]');
    if (!fieldContainer) {
      debug.search('ensureHighlightVisible: Kein fieldContainer gefunden');
      return false;
    }
    
    const fieldName = fieldContainer.dataset.field;
    if (!fieldName) return false;
    
    // Basisfelder sind immer sichtbar
    const basisFelder = ['name', 'image', 'bild', 'scientific_name', 'wissenschaftlich', 'description', 'beschreibung'];
    if (basisFelder.includes(fieldName)) return false;
    
    // Prüfe ob das Feld gerade sichtbar ist (hat data-perspektive-sichtbar oder keine Perspektive aktiv)
    const appContainer = document.querySelector('[data-amorph-container]');
    const perspektivenAktiv = appContainer?.classList.contains('perspektiven-aktiv');
    
    if (!perspektivenAktiv) return false; // Alle Felder sichtbar
    
    const istSichtbar = fieldContainer.hasAttribute('data-perspektive-sichtbar');
    debug.search('ensureHighlightVisible: Feld-Check', { 
      fieldName, 
      istSichtbar,
      hatPerspektiveAttr: fieldContainer.hasAttribute('data-perspektive-sichtbar')
    });
    
    if (istSichtbar) return false; // Feld schon sichtbar
    
    // Feld ist versteckt - finde und aktiviere passende Perspektive
    debug.search('ensureHighlightVisible: Feld versteckt, suche Perspektive', { fieldName });
    
    const perspektivenNav = document.querySelector('.amorph-perspektiven');
    if (!perspektivenNav) return false;
    
    const buttons = perspektivenNav.querySelectorAll('.amorph-perspektive-btn');
    for (const btn of buttons) {
      try {
        const felder = JSON.parse(btn.dataset.felder || '[]');
        if (felder.includes(fieldName)) {
          // Nur klicken wenn NICHT bereits aktiv
          if (!btn.classList.contains('aktiv')) {
            debug.search('ensureHighlightVisible: Aktiviere Perspektive', { 
              fieldName, 
              perspektive: btn.dataset.perspektive 
            });
            btn.click();
            return true; // Signal dass Perspektive gewechselt wurde
          }
          debug.search('ensureHighlightVisible: Perspektive schon aktiv', { 
            fieldName, 
            perspektive: btn.dataset.perspektive 
          });
          return false;
        }
      } catch (e) {
        debug.error('Fehler beim Parsen der Felder', e);
      }
    }
    
    debug.search('ensureHighlightVisible: Keine passende Perspektive gefunden!', { fieldName });
    return false;
    return false;
  }
  
  function scrollToHighlight(index) {
    const current = highlights[index];
    debug.search('scrollToHighlight', { 
      index, 
      total: highlights.length,
      element: current?.textContent?.substring(0, 20),
      field: current?.closest('amorph-container[data-field]')?.dataset?.field
    });
    
    if (!current) {
      debug.search('scrollToHighlight: Element nicht gefunden!', { index });
      return;
    }
    
    // Erst Perspektive wechseln wenn nötig
    const switched = ensureHighlightVisible(current);
    
    // Warten bis CSS-Transition und DOM-Update fertig sind
    const delay = switched ? 150 : 0;
    
    setTimeout(() => {
      // Entferne alte Markierung
      document.querySelectorAll('.amorph-highlight-current').forEach(h => 
        h.classList.remove('amorph-highlight-current')
      );
      
      current.classList.add('amorph-highlight-current');
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      debug.search('scrollToHighlight: Gescrollt zu', { index, text: current.textContent });
    }, delay);
  }
  
  function goToNext() {
    highlights = getAllHighlights();
    debug.search('goToNext', { 
      vorher: currentHighlightIndex, 
      total: highlights.length,
      highlightTexts: highlights.map(h => h.textContent).slice(0, 5)
    });
    
    if (highlights.length === 0) return;
    
    // Von -1 (kein aktuelles) zu 0 (erstes), dann zyklisch
    currentHighlightIndex = (currentHighlightIndex + 1) % highlights.length;
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    debug.search('goToNext: Neuer Index', { nachher: currentHighlightIndex });
    scrollToHighlight(currentHighlightIndex);
  }
  
  function goToPrev() {
    highlights = getAllHighlights();
    if (highlights.length === 0) return;
    
    // Von -1 oder 0 zum letzten, sonst eins zurück
    if (currentHighlightIndex <= 0) {
      currentHighlightIndex = highlights.length - 1;
    } else {
      currentHighlightIndex = currentHighlightIndex - 1;
    }
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    scrollToHighlight(currentHighlightIndex);
  }
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToNext();
  });
  
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToPrev();
  });
  
  // Keyboard Navigation (Enter = next, Shift+Enter = prev)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      highlights = getAllHighlights();
      if (highlights.length > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    }
  });
  
  // Event-Listener für Highlight-Updates
  document.addEventListener('amorph:highlights-updated', updateHighlights);
  
  // Expose update function
  form.updateHighlights = updateHighlights;
  
  // Events werden vom Feature-System gesteuert
  form.dataset.live = config.live ? 'true' : 'false';
  form.dataset.debounce = config.debounce || 300;
  form.dataset.limit = config.limit || 50;
  form.dataset.erlaubeLeer = config.erlaubeLeer ? 'true' : 'false';
  
  return form;
}
