/**
 * BIFROEST - Client-Side Expert Attribution System
 * 
 * Die Regenbogenbrücke zwischen Daten und ihren Quellen.
 * 
 * DYNAMISCHES EXPERTEN-MATCHING:
 * - Lädt Experten von BIFROEST API basierend auf Perspektiven
 * - Matcht Experten zu Feldern über _fieldPerspective Map
 * - Fallback auf lokale _sources.json wenn API nicht erreichbar
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// BIFROEST API URL - konfigurierbar via data-Attribut oder Environment
const BIFROEST_API_URL = (window as any).__BIFROEST_API_URL || 'https://bifroest.io/api';

// Cache für API-Responses (sessionStorage)
const CACHE_KEY = 'bifroest-experts-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

interface BifroestExpert {
  id: string;
  name: string;
  slug: string;
  title?: string;
  bio?: string;
  image?: string;
  category: 'fungi' | 'plants' | 'animals';
  perspectives: string[];  // Welche Perspektiven dieser Experte abdeckt
  species: string[];       // Spezifische Spezies (leer = alle)
  tags: string[];
  impactScore: number;
  verified: boolean;
  contact?: string;
  url?: string;
  profileUrl: string;
  bifroestUrl: string;
}

interface FieldSource {
  name: string;
  copyright?: string;
  license?: string;
  url?: string;
  contact?: string;
  author?: string;
  date?: string;
  notes?: string;
}

interface Expert {
  name: string;
  title?: string;
  url?: string;
  contact?: string;
  bifroestUrl?: string;
  perspectives?: string[];
}

interface CachedExperts {
  timestamp: number;
  category: string;
  experts: BifroestExpert[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROEST STATE
// ═══════════════════════════════════════════════════════════════════════════════

let bifroestActive = false;
let loadedExperts: BifroestExpert[] = [];
let expertsLoaded = false;

/**
 * Initialisiert das Bifroest-System.
 */
export function initBifroest(): void {
  // Nur initialisieren wenn nicht im Compare-Mode
  if (document.body.dataset.mode === 'compare') {
    return;
  }
  
  createToggleButton();
  attachCopyrightListeners();
  createPopupContainer();
  
  // Restore state from localStorage
  const savedState = localStorage.getItem('bifroest-active');
  if (savedState === 'true') {
    toggleBifroest(true);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOGGLE BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialisiert den Bifroest-Toggle Button.
 * Verwendet den existierenden Button aus dem HTML.
 */
function createToggleButton(): void {
  const button = document.querySelector('.bifroest-toggle');
  if (!button) {
    console.warn('[Bifroest] Toggle button not found in DOM');
    return;
  }
  
  button.addEventListener('click', () => toggleBifroest());
}

/**
 * Aktiviert/Deaktiviert den Bifroest-Mode.
 */
export function toggleBifroest(forceState?: boolean): void {
  bifroestActive = forceState !== undefined ? forceState : !bifroestActive;
  
  document.body.classList.toggle('bifroest-active', bifroestActive);
  
  const button = document.querySelector('.bifroest-toggle');
  if (button) {
    button.classList.toggle('active', bifroestActive);
    button.setAttribute('aria-pressed', String(bifroestActive));
  }
  
  // Save state
  localStorage.setItem('bifroest-active', String(bifroestActive));
  
  // Experten-Buttons dynamisch hinzufügen/entfernen (für Grid-Ansicht)
  if (bifroestActive) {
    loadAndDisplayExperts();
  } else {
    removeExpertButtonsFromGrid();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROEST API - DYNAMISCHES EXPERTEN-LADEN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ermittelt die Kategorie aus der aktuellen Domain oder data-Attribut.
 */
function getCurrentCategory(): 'fungi' | 'plants' | 'animals' {
  // 1. Aus data-Attribut
  const categoryAttr = document.body.dataset.category;
  if (categoryAttr === 'fungi' || categoryAttr === 'plants' || categoryAttr === 'animals') {
    return categoryAttr;
  }
  
  // 2. Aus Domain
  const hostname = window.location.hostname;
  if (hostname.includes('funginomi')) return 'fungi';
  if (hostname.includes('phytonomi')) return 'plants';
  if (hostname.includes('drakonomi')) return 'animals';
  
  // 3. Default
  return 'fungi';
}

/**
 * Sammelt alle genutzten Perspektiven aus _fieldPerspective Map.
 */
function getUsedPerspectives(): string[] {
  const perspectives = new Set<string>();
  
  // Aus Item-Elementen mit data-field-perspectives (Plural!)
  document.querySelectorAll('[data-field-perspectives]').forEach(el => {
    const map = (el as HTMLElement).dataset.fieldPerspectives;
    if (map) {
      try {
        const parsed = JSON.parse(map) as Record<string, string>;
        Object.values(parsed).forEach(p => perspectives.add(p));
      } catch { /* ignore */ }
    }
  });
  
  // Fallback: Singular-Form
  document.querySelectorAll('[data-field-perspective]').forEach(el => {
    const map = (el as HTMLElement).dataset.fieldPerspective;
    if (map) {
      try {
        const parsed = JSON.parse(map) as Record<string, string>;
        Object.values(parsed).forEach(p => perspectives.add(p));
      } catch { /* ignore */ }
    }
  });
  
  // Aus Window-Objekt (Detail-Seite)
  if ((window as any).AMORPH_FIELD_PERSPECTIVE_MAP) {
    Object.values((window as any).AMORPH_FIELD_PERSPECTIVE_MAP as Record<string, string>)
      .forEach(p => perspectives.add(p));
  }
  
  // Aus einzelnen Feldern mit data-perspective
  document.querySelectorAll('.amorph-field[data-perspective]').forEach(el => {
    const p = (el as HTMLElement).dataset.perspective;
    if (p) perspectives.add(p);
  });
  
  return Array.from(perspectives);
}

/**
 * Holt den Spezies-Slug von der aktuellen Seite.
 */
function getCurrentSpecies(): string | null {
  // Aus URL: /{slug}
  const path = window.location.pathname;
  const match = path.match(/^\/([a-z0-9-]+)\/?$/i);
  if (match) return match[1];
  
  // Aus data-Attribut
  const speciesAttr = document.body.dataset.species || 
                      document.querySelector('[data-species]')?.getAttribute('data-species');
  return speciesAttr || null;
}

/**
 * Lädt Experten aus dem Cache.
 */
function getCachedExperts(category: string): BifroestExpert[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedExperts = JSON.parse(cached);
    if (data.category !== category) return null;
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    
    return data.experts;
  } catch {
    return null;
  }
}

/**
 * Speichert Experten im Cache.
 */
function cacheExperts(category: string, experts: BifroestExpert[]): void {
  try {
    const data: CachedExperts = {
      timestamp: Date.now(),
      category,
      experts,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore storage errors */ }
}

/**
 * Lädt Experten von BIFROEST API.
 */
async function fetchExpertsFromAPI(
  category: string,
  perspectives: string[],
  species: string | null
): Promise<BifroestExpert[]> {
  const params = new URLSearchParams();
  params.set('category', category);
  
  if (perspectives.length > 0) {
    params.set('perspectives', perspectives.join(','));
  }
  
  if (species) {
    params.set('species', species);
  }
  
  params.set('limit', '100');
  
  const response = await fetch(`${BIFROEST_API_URL}/experts?${params}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.items || [];
}

/**
 * Hauptfunktion: Lädt Experten und zeigt sie an.
 */
async function loadAndDisplayExperts(): Promise<void> {
  const category = getCurrentCategory();
  const perspectives = getUsedPerspectives();
  const species = getCurrentSpecies();
  
  console.log('[Bifroest] 🌈 Starting expert load...', { 
    apiUrl: BIFROEST_API_URL,
    category, 
    perspectives, 
    species 
  });
  
  // 1. Versuche aus Cache
  const cached = getCachedExperts(category);
  if (cached && cached.length > 0) {
    console.log('[Bifroest] ✅ Using CACHED experts from API:', cached.length);
    loadedExperts = cached;
    expertsLoaded = true;
    applyExpertsToFields();
    return;
  }
  
  // 2. Lade von API
  try {
    console.log('[Bifroest] 📡 Fetching from API:', `${BIFROEST_API_URL}/experts?category=${category}`);
    loadedExperts = await fetchExpertsFromAPI(category, perspectives, species);
    expertsLoaded = true;
    cacheExperts(category, loadedExperts);
    console.log(`[Bifroest] ✅ Loaded ${loadedExperts.length} experts from BIFROEST API:`, 
      loadedExperts.map(e => `${e.name} (${e.perspectives.join(', ')})`));
    applyExpertsToFields();
  } catch (error) {
    console.warn('[Bifroest] ⚠️ API not available, using LOCAL FALLBACK (_sources):', error);
    // Fallback: Lokale _sources verwenden (alte Methode)
    addExpertButtonsFromLocalSources();
  }
}

/**
 * Wendet geladene Experten auf Felder an basierend auf Perspektiven-Matching.
 */
function applyExpertsToFields(): void {
  if (!expertsLoaded || loadedExperts.length === 0) {
    addExpertButtonsFromLocalSources();
    return;
  }
  
  const items = document.querySelectorAll('.amorph-item, .amorph-detail, .detail-perspectives');
  
  items.forEach(item => {
    // Hole _fieldPerspective Map (ACHTUNG: Attribut heißt data-field-perspectives - Plural!)
    const perspectiveMapJson = (item as HTMLElement).dataset.fieldPerspectives || 
                               (item as HTMLElement).dataset.fieldPerspective;
    let fieldPerspectiveMap: Record<string, string> = {};
    
    if (perspectiveMapJson) {
      try {
        fieldPerspectiveMap = JSON.parse(perspectiveMapJson);
      } catch { /* ignore */ }
    }
    
    // Fallback: Aus Window-Objekt (Detail-Seite)
    if (Object.keys(fieldPerspectiveMap).length === 0 && (window as any).AMORPH_FIELD_PERSPECTIVE_MAP) {
      fieldPerspectiveMap = (window as any).AMORPH_FIELD_PERSPECTIVE_MAP;
    }
    
    // Für jedes Feld: Finde passende Experten
    const fields = item.querySelectorAll('.amorph-field');
    fields.forEach(field => {
      const fieldKey = (field as HTMLElement).dataset.field;
      if (!fieldKey) return;
      
      // Perspektive dieses Feldes
      const perspective = fieldPerspectiveMap[fieldKey] || 
                         (field as HTMLElement).dataset.perspective;
      if (!perspective) return;
      
      // Finde Experten die diese Perspektive abdecken
      const matchingExperts = loadedExperts.filter(expert => 
        expert.perspectives.includes(perspective)
      );
      
      if (matchingExperts.length === 0) return;
      
      // Container bereits vorhanden?
      if (field.querySelector('.bifroest-experts')) return;
      
      // Experten-Container erstellen
      const expertsContainer = document.createElement('div');
      expertsContainer.className = 'bifroest-experts bifroest-experts-dynamic';
      
      // Max 3 Experten pro Feld anzeigen (nach Impact-Score sortiert)
      const topExperts = matchingExperts
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3);
      
      topExperts.forEach(expert => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bifroest-expert';
        if (expert.verified) btn.classList.add('verified');
        
        const expertData: Expert = {
          name: expert.name,
          title: expert.title,
          url: expert.url,
          contact: expert.contact,
          bifroestUrl: expert.bifroestUrl,
          perspectives: expert.perspectives,
        };
        btn.dataset.expert = JSON.stringify(expertData);
        btn.innerHTML = `<span class="bifroest-expert-name">${escapeHtml(expert.name)}</span>`;
        expertsContainer.appendChild(btn);
      });
      
      field.appendChild(expertsContainer);
    });
  });
}

/**
 * Fallback: Verwendet lokale data-field-experts Attribute (aus _sources.json).
 * ACHTUNG: Dies wird NUR verwendet wenn die BIFROEST API nicht erreichbar ist!
 */
function addExpertButtonsFromLocalSources(): void {
  console.log('[Bifroest] 📂 FALLBACK: Using local _sources data (API not available)');
  
  const items = document.querySelectorAll('.amorph-item');
  let totalExperts = 0;
  
  items.forEach(item => {
    const expertsJson = (item as HTMLElement).dataset.fieldExperts;
    if (!expertsJson) return;
    
    let fieldExperts: Record<string, Expert[]>;
    try {
      fieldExperts = JSON.parse(expertsJson);
    } catch {
      return;
    }
    
    // Für jedes Feld im Item prüfen ob Experten vorhanden
    const fields = item.querySelectorAll('.amorph-field');
    fields.forEach(field => {
      const fieldKey = (field as HTMLElement).dataset.field;
      if (!fieldKey || !fieldExperts[fieldKey]) return;
      
      const experts = fieldExperts[fieldKey];
      if (!experts || experts.length === 0) return;
      
      // Container bereits vorhanden?
      if (field.querySelector('.bifroest-experts')) return;
      
      // Experten-Container erstellen
      const expertsContainer = document.createElement('div');
      expertsContainer.className = 'bifroest-experts bifroest-experts-dynamic';
      expertsContainer.dataset.experts = JSON.stringify(experts);
      
      experts.forEach(expert => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bifroest-expert';
        btn.dataset.expert = JSON.stringify(expert);
        btn.innerHTML = `<span class="bifroest-expert-name">${escapeHtml(expert.name)}</span>`;
        expertsContainer.appendChild(btn);
      });
      
      field.appendChild(expertsContainer);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COPYRIGHT POPUP
// ═══════════════════════════════════════════════════════════════════════════════

let popupContainer: HTMLElement | null = null;

/**
 * Erstellt den Popup-Container (einmal).
 */
function createPopupContainer(): void {
  if (popupContainer) return;
  
  popupContainer = document.createElement('div');
  popupContainer.className = 'bifroest-overlay';
  popupContainer.innerHTML = `
    <div class="bifroest-popup" role="dialog" aria-modal="true">
      <div class="bifroest-popup-header">
        <div class="bifroest-popup-title">
          <span class="bifroest-symbol">©</span>
          <span>GOAT</span>
        </div>
        <button class="bifroest-popup-close" aria-label="Schließen">✕</button>
      </div>
      <div class="bifroest-sources"></div>
    </div>
  `;
  
  // Close handlers
  popupContainer.addEventListener('click', (e) => {
    if (e.target === popupContainer) {
      closePopup();
    }
  });
  
  const closeBtn = popupContainer.querySelector('.bifroest-popup-close');
  closeBtn?.addEventListener('click', closePopup);
  
  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupContainer?.classList.contains('visible')) {
      closePopup();
    }
  });
  
  document.body.appendChild(popupContainer);
}

/**
 * Zeigt das Copyright-Popup.
 */
function showPopup(sources: FieldSource[], type: 'copyright' | 'expert' = 'copyright'): void {
  if (!popupContainer) return;
  
  // Update popup title
  const titleElement = popupContainer.querySelector('.bifroest-popup-title');
  if (titleElement) {
    titleElement.innerHTML = `
      <span class="bifroest-symbol">©</span>
      <span>GOAT</span>
    `;
  }
  
  const sourcesContainer = popupContainer.querySelector('.bifroest-sources');
  if (!sourcesContainer) return;
  
  sourcesContainer.innerHTML = sources.map(source => `
    <div class="bifroest-source">
      <div class="bifroest-source-name">${escapeHtml(source.name)}</div>
      <div class="bifroest-source-details">
        ${source.author ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Autor:</span>
            <span class="bifroest-source-value">${escapeHtml(source.author)}</span>
          </div>
        ` : ''}
        ${source.copyright ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Copyright:</span>
            <span class="bifroest-source-value">${escapeHtml(source.copyright)}</span>
          </div>
        ` : ''}
        ${source.license ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Lizenz:</span>
            <span class="bifroest-source-value">${escapeHtml(source.license)}</span>
          </div>
        ` : ''}
        ${source.url ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">URL:</span>
            <span class="bifroest-source-value">
              <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.url)}</a>
            </span>
          </div>
        ` : ''}
        ${source.contact ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Kontakt:</span>
            <span class="bifroest-source-value">
              <a href="mailto:${escapeHtml(source.contact)}">${escapeHtml(source.contact)}</a>
            </span>
          </div>
        ` : ''}
        ${source.date ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Datum:</span>
            <span class="bifroest-source-value">${escapeHtml(source.date)}</span>
          </div>
        ` : ''}
        ${source.notes ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Notizen:</span>
            <span class="bifroest-source-value">${escapeHtml(source.notes)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  popupContainer.classList.add('visible');
  
  // Focus trap
  const closeBtn = popupContainer.querySelector<HTMLElement>('.bifroest-popup-close');
  closeBtn?.focus();
}

/**
 * Schließt das Popup.
 */
function closePopup(): void {
  popupContainer?.classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fügt Event-Listener zu allen © Buttons und Experten hinzu.
 */
function attachCopyrightListeners(): void {
  // Event delegation for dynamically loaded content
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    // Copyright Button (© auf Bildern)
    const copyrightBtn = target.closest('.bifroest-copyright') as HTMLElement | null;
    if (copyrightBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const sourcesData = copyrightBtn.dataset.sources;
      if (sourcesData) {
        try {
          const sources: FieldSource[] = JSON.parse(sourcesData);
          showPopup(sources, 'copyright');
        } catch (err) {
          console.error('[Bifroest] Failed to parse sources:', err);
        }
      }
      return;
    }
    
    // Experten Button (schwebende Namen bei Feldern)
    const expertBtn = target.closest('.bifroest-expert') as HTMLElement | null;
    if (expertBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const expertData = expertBtn.dataset.expert;
      if (expertData) {
        try {
          const expert: Expert = JSON.parse(expertData);
          showExpertPopup(expert);
        } catch (err) {
          console.error('[Bifroest] Failed to parse expert:', err);
        }
      }
    }
  });
}

/**
 * Zeigt das Experten-Popup.
 */
function showExpertPopup(expert: Expert): void {
  if (!popupContainer) return;
  
  // Update popup title for experts
  const titleElement = popupContainer.querySelector('.bifroest-popup-title');
  if (titleElement) {
    titleElement.innerHTML = `
      <span class="bifroest-symbol">🎓</span>
      <span>GOAT</span>
    `;
  }
  
  const sourcesContainer = popupContainer.querySelector('.bifroest-sources');
  if (!sourcesContainer) return;
  
  // Perspektiven als Tags anzeigen
  const perspectiveTags = (expert.perspectives || [])
    .map(p => `<span class="bifroest-tag">${escapeHtml(p)}</span>`)
    .join('');
  
  sourcesContainer.innerHTML = `
    <div class="bifroest-source bifroest-expert-card">
      <div class="bifroest-source-name">${escapeHtml(expert.name)}</div>
      <div class="bifroest-source-details">
        ${expert.title ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Position:</span>
            <span class="bifroest-source-value">${escapeHtml(expert.title)}</span>
          </div>
        ` : ''}
        ${perspectiveTags ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Expertise:</span>
            <span class="bifroest-source-value bifroest-tags">${perspectiveTags}</span>
          </div>
        ` : ''}
        ${expert.url ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Website:</span>
            <span class="bifroest-source-value">
              <a href="${escapeHtml(expert.url)}" target="_blank" rel="noopener">${escapeHtml(expert.url)}</a>
            </span>
          </div>
        ` : ''}
        ${expert.contact ? `
          <div class="bifroest-source-row">
            <span class="bifroest-source-label">Kontakt:</span>
            <span class="bifroest-source-value">
              ${expert.contact.includes('@') 
                ? `<a href="mailto:${escapeHtml(expert.contact)}">${escapeHtml(expert.contact)}</a>`
                : escapeHtml(expert.contact)
              }
            </span>
          </div>
        ` : ''}
      </div>
      <div class="bifroest-expert-link">
        <a href="${expert.bifroestUrl || `https://bifroest.io/expert/${encodeURIComponent(expert.name)}`}" target="_blank" rel="noopener">
          Auf Bifroest ansehen →
        </a>
      </div>
    </div>
  `;
  
  popupContainer.classList.add('visible');
  
  // Focus trap
  const closeBtn = popupContainer.querySelector<HTMLElement>('.bifroest-popup-close');
  closeBtn?.focus();
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRID VIEW EXPERTEN (dynamisch hinzugefügt)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Entfernt alle dynamisch hinzugefügten Experten-Buttons aus dem Grid.
 */
function removeExpertButtonsFromGrid(): void {
  const dynamicExperts = document.querySelectorAll('.bifroest-experts-dynamic');
  dynamicExperts.forEach(el => el.remove());
}
