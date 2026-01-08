/**
 * BIFROEST - Client-Side Expert Attribution System
 * 
 * Die Regenbogenbrücke zwischen Daten und ihren Quellen.
 * 
 * DYNAMISCHES EXPERTEN-MATCHING:
 * - Lädt Experten von lokaler JSON-Datei (bifroest-experts.json)
 * - Matcht Experten zu Feldern über field_expertise Array
 * - Nutzt data-field-experts Attribute als Fallback
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

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
  domain: string;              // fungi, phyto, drako, etc.
  field_expertise: string[];   // Array of field names this expert covers
  tags: string[];
  impact_score: number;
  verified: boolean;
  contact?: string;
  url?: string;
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
}

interface CachedExperts {
  timestamp: number;
  domain: string;
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
    // Toggle button ist optional - nur auf Seiten mit Bottom-Nav
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
 * Ermittelt die Domain aus der aktuellen Site oder data-Attribut.
 * Domains matchen die Blueprint-Ordner: fungi, phyto, drako, etc.
 */
function getCurrentDomain(): string {
  // 1. Aus data-Attribut (neues Format)
  const domainAttr = document.body.dataset.domain || document.body.dataset.siteType;
  if (domainAttr) return domainAttr;
  
  // 2. Aus Domain-Name
  const hostname = window.location.hostname;
  if (hostname.includes('funginomi')) return 'fungi';
  if (hostname.includes('phytonomi')) return 'phyto';
  if (hostname.includes('drakonomi')) return 'drako';
  if (hostname.includes('bakterionomi')) return 'bakterio';
  if (hostname.includes('vironomi')) return 'viro';
  if (hostname.includes('genonomi')) return 'geno';
  if (hostname.includes('anatonomi')) return 'anato';
  if (hostname.includes('chemonomi')) return 'chemo';
  if (hostname.includes('biotechnomi')) return 'biotech';
  if (hostname.includes('paleonomi')) return 'paleo';
  if (hostname.includes('tektonomi')) return 'tekto';
  if (hostname.includes('minenomi')) return 'mine';
  if (hostname.includes('physinomi')) return 'physi';
  if (hostname.includes('kosmonomi')) return 'kosmo';
  if (hostname.includes('netzonomi')) return 'netzo';
  if (hostname.includes('cognitonomi')) return 'cognito';
  if (hostname.includes('socionomi')) return 'socio';
  
  // 3. Default
  return 'fungi';
}

/**
 * Lädt Experten aus dem Cache.
 */
function getCachedExperts(domain: string): BifroestExpert[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedExperts = JSON.parse(cached);
    if (data.domain !== domain) return null;
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    
    return data.experts;
  } catch {
    return null;
  }
}

/**
 * Speichert Experten im Cache.
 */
function cacheExperts(domain: string, experts: BifroestExpert[]): void {
  try {
    const data: CachedExperts = {
      timestamp: Date.now(),
      domain,
      experts,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore storage errors */ }
}

/**
 * Lädt Experten von lokaler JSON-Datei.
 */
async function fetchExperts(domain: string): Promise<BifroestExpert[]> {
  // Lade von lokaler JSON-Datei
  const response = await fetch('/data/bifroest-experts.json', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load experts: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform local experts to BifroestExpert format
  const experts: BifroestExpert[] = [];
  
  if (data.experts) {
    for (const [slug, expert] of Object.entries(data.experts) as [string, any][]) {
      experts.push({
        id: slug,
        name: expert.name,
        slug: slug,
        title: expert.title,
        bio: expert.bio,
        image: expert.image,
        domain: domain,
        field_expertise: expert.perspectives || expert.specialization || [],
        tags: expert.specialization || [],
        impact_score: expert.stats?.inat_observations || 50,
        verified: true,
        contact: expert.contact?.email,
        url: expert.contact?.website,
      });
    }
  }
  
  return experts;
}

/**
 * Hauptfunktion: Lädt Experten und zeigt sie an.
 */
async function loadAndDisplayExperts(): Promise<void> {
  const domain = getCurrentDomain();
  
  console.log('[Bifroest] 🌈 Starting expert load...', { domain });
  
  // 1. Versuche aus Cache
  const cached = getCachedExperts(domain);
  if (cached && cached.length > 0) {
    console.log('[Bifroest] ✅ Using CACHED experts:', cached.length);
    loadedExperts = cached;
    expertsLoaded = true;
    applyExpertsToFields();
    return;
  }
  
  // 2. Lade von lokaler JSON-Datei
  try {
    console.log('[Bifroest] 📡 Fetching from local JSON...');
    loadedExperts = await fetchExperts(domain);
    expertsLoaded = true;
    cacheExperts(domain, loadedExperts);
    console.log(`[Bifroest] ✅ Loaded ${loadedExperts.length} experts from local JSON:`, 
      loadedExperts.map(e => `${e.name} (${e.field_expertise?.join(', ') || 'no expertise'})`));
    applyExpertsToFields();
  } catch (error) {
    console.warn('[Bifroest] ⚠️ Local JSON not available, using fallback (_sources):', error);
    // Fallback: Lokale _sources verwenden (alte Methode)
    addExpertButtonsFromLocalSources();
  }
}

/**
 * Wendet geladene Experten auf Felder an basierend auf field_expertise Matching.
 * Direkte Feld-zu-Experte Zuordnung über field_expertise Array.
 */
function applyExpertsToFields(): void {
  if (!expertsLoaded || loadedExperts.length === 0) {
    console.log('[Bifroest] No experts loaded, using local fallback');
    addExpertButtonsFromLocalSources();
    return;
  }
  
  console.log('[Bifroest] 🔗 Applying experts to fields...');
  
  const items = document.querySelectorAll('.amorph-item, .amorph-detail, .detail-perspectives');
  let totalMatches = 0;
  
  items.forEach(item => {
    // Für jedes Feld: Finde passende Experten über field_expertise
    const fields = item.querySelectorAll('.amorph-field');
    
    fields.forEach(field => {
      const fieldKey = (field as HTMLElement).dataset.field;
      if (!fieldKey) return;
      
      // Finde Experten die dieses Feld in ihrer field_expertise haben
      const matchingExperts = loadedExperts.filter(expert => 
        expert.field_expertise && expert.field_expertise.includes(fieldKey)
      );
      
      if (matchingExperts.length === 0) return;
      
      totalMatches++;
      
      // Container bereits vorhanden?
      if (field.querySelector('.bifroest-experts')) return;
      
      // Experten-Container erstellen
      const expertsContainer = document.createElement('div');
      expertsContainer.className = 'bifroest-experts bifroest-experts-dynamic';
      
      // Max 3 Experten pro Feld anzeigen (nach Impact-Score sortiert)
      const topExperts = matchingExperts
        .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
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
        };
        btn.dataset.expert = JSON.stringify(expertData);
        btn.innerHTML = `<span class="bifroest-expert-name">${escapeHtml(expert.name)}</span>`;
        expertsContainer.appendChild(btn);
      });
      
      field.appendChild(expertsContainer);
    });
  });
  
  console.log(`[Bifroest] ✅ Applied experts to ${totalMatches} fields`);
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
