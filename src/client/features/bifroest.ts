/**
 * BIFROEST - Client-Side Copyright System
 * 
 * Die Regenbogenbrücke zwischen Daten und ihren Quellen.
 * - Toggle Button für Bifroest-Mode
 * - Copyright Popup bei Klick auf ©
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROEST STATE
// ═══════════════════════════════════════════════════════════════════════════════

let bifroestActive = false;

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
    addExpertButtonsToGrid();
  } else {
    removeExpertButtonsFromGrid();
  }
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
      <div class="bifroest-expert-link">
        <a href="https://bifroest.io/expert/${encodeURIComponent(expert.name)}" target="_blank" rel="noopener">
          Auf Bifröst ansehen →
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

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRID VIEW EXPERTEN (dynamisch hinzugefügt)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fügt Experten-Buttons zu allen Feldern im Grid hinzu.
 * Liest die Experten-Daten aus data-field-experts des Items.
 */
function addExpertButtonsToGrid(): void {
  const items = document.querySelectorAll('.amorph-item');
  
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

/**
 * Entfernt alle dynamisch hinzugefügten Experten-Buttons aus dem Grid.
 */
function removeExpertButtonsFromGrid(): void {
  const dynamicExperts = document.querySelectorAll('.bifroest-experts-dynamic');
  dynamicExperts.forEach(el => el.remove());
}
