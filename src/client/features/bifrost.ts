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

let bifrostActive = false;

/**
 * Initialisiert das Bifroest-System.
 */
export function initBifrost(): void {
  // Nur initialisieren wenn nicht im Compare-Mode
  if (document.body.dataset.mode === 'compare') {
    return;
  }
  
  createToggleButton();
  attachCopyrightListeners();
  createPopupContainer();
  
  // Restore state from localStorage
  const savedState = localStorage.getItem('bifrost-active');
  if (savedState === 'true') {
    toggleBifrost(true);
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
  const button = document.querySelector('.bifrost-toggle');
  if (!button) {
    console.warn('[Bifrost] Toggle button not found in DOM');
    return;
  }
  
  button.addEventListener('click', () => toggleBifrost());
}

/**
 * Aktiviert/Deaktiviert den Bifroest-Mode.
 */
export function toggleBifrost(forceState?: boolean): void {
  bifrostActive = forceState !== undefined ? forceState : !bifrostActive;
  
  document.body.classList.toggle('bifrost-active', bifrostActive);
  
  const button = document.querySelector('.bifrost-toggle');
  if (button) {
    button.classList.toggle('active', bifrostActive);
    button.setAttribute('aria-pressed', String(bifrostActive));
  }
  
  // Save state
  localStorage.setItem('bifrost-active', String(bifrostActive));
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
  popupContainer.className = 'bifrost-overlay';
  popupContainer.innerHTML = `
    <div class="bifrost-popup" role="dialog" aria-modal="true">
      <div class="bifrost-popup-header">
        <div class="bifrost-popup-title">
          <span class="bifrost-symbol">©</span>
          <span>Quellenangabe</span>
        </div>
        <button class="bifrost-popup-close" aria-label="Schließen">✕</button>
      </div>
      <div class="bifrost-sources"></div>
    </div>
  `;
  
  // Close handlers
  popupContainer.addEventListener('click', (e) => {
    if (e.target === popupContainer) {
      closePopup();
    }
  });
  
  const closeBtn = popupContainer.querySelector('.bifrost-popup-close');
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
  const titleElement = popupContainer.querySelector('.bifrost-popup-title');
  if (titleElement) {
    titleElement.innerHTML = `
      <span class="bifrost-symbol">©</span>
      <span>Quellenangabe</span>
    `;
  }
  
  const sourcesContainer = popupContainer.querySelector('.bifrost-sources');
  if (!sourcesContainer) return;
  
  sourcesContainer.innerHTML = sources.map(source => `
    <div class="bifrost-source">
      <div class="bifrost-source-name">${escapeHtml(source.name)}</div>
      <div class="bifrost-source-details">
        ${source.author ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Autor:</span>
            <span class="bifrost-source-value">${escapeHtml(source.author)}</span>
          </div>
        ` : ''}
        ${source.copyright ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Copyright:</span>
            <span class="bifrost-source-value">${escapeHtml(source.copyright)}</span>
          </div>
        ` : ''}
        ${source.license ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Lizenz:</span>
            <span class="bifrost-source-value">${escapeHtml(source.license)}</span>
          </div>
        ` : ''}
        ${source.url ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">URL:</span>
            <span class="bifrost-source-value">
              <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.url)}</a>
            </span>
          </div>
        ` : ''}
        ${source.contact ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Kontakt:</span>
            <span class="bifrost-source-value">
              <a href="mailto:${escapeHtml(source.contact)}">${escapeHtml(source.contact)}</a>
            </span>
          </div>
        ` : ''}
        ${source.date ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Datum:</span>
            <span class="bifrost-source-value">${escapeHtml(source.date)}</span>
          </div>
        ` : ''}
        ${source.notes ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Notizen:</span>
            <span class="bifrost-source-value">${escapeHtml(source.notes)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  popupContainer.classList.add('visible');
  
  // Focus trap
  const closeBtn = popupContainer.querySelector<HTMLElement>('.bifrost-popup-close');
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
    const copyrightBtn = target.closest('.bifrost-copyright') as HTMLElement | null;
    if (copyrightBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const sourcesData = copyrightBtn.dataset.sources;
      if (sourcesData) {
        try {
          const sources: FieldSource[] = JSON.parse(sourcesData);
          showPopup(sources, 'copyright');
        } catch (err) {
          console.error('[Bifrost] Failed to parse sources:', err);
        }
      }
      return;
    }
    
    // Experten Button (schwebende Namen bei Feldern)
    const expertBtn = target.closest('.bifrost-expert') as HTMLElement | null;
    if (expertBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const expertData = expertBtn.dataset.expert;
      if (expertData) {
        try {
          const expert: Expert = JSON.parse(expertData);
          showExpertPopup(expert);
        } catch (err) {
          console.error('[Bifrost] Failed to parse expert:', err);
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
  const titleElement = popupContainer.querySelector('.bifrost-popup-title');
  if (titleElement) {
    titleElement.innerHTML = `
      <span class="bifrost-symbol">🎓</span>
      <span>Bifröst Experte</span>
    `;
  }
  
  const sourcesContainer = popupContainer.querySelector('.bifrost-sources');
  if (!sourcesContainer) return;
  
  sourcesContainer.innerHTML = `
    <div class="bifrost-source bifrost-expert-card">
      <div class="bifrost-source-name">${escapeHtml(expert.name)}</div>
      <div class="bifrost-source-details">
        ${expert.title ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Position:</span>
            <span class="bifrost-source-value">${escapeHtml(expert.title)}</span>
          </div>
        ` : ''}
        ${expert.url ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Website:</span>
            <span class="bifrost-source-value">
              <a href="${escapeHtml(expert.url)}" target="_blank" rel="noopener">${escapeHtml(expert.url)}</a>
            </span>
          </div>
        ` : ''}
        ${expert.contact ? `
          <div class="bifrost-source-row">
            <span class="bifrost-source-label">Kontakt:</span>
            <span class="bifrost-source-value">
              ${expert.contact.includes('@') 
                ? `<a href="mailto:${escapeHtml(expert.contact)}">${escapeHtml(expert.contact)}</a>`
                : escapeHtml(expert.contact)
              }
            </span>
          </div>
        ` : ''}
      </div>
      <div class="bifrost-expert-link">
        <a href="https://bifroest.io/expert/${encodeURIComponent(expert.name)}" target="_blank" rel="noopener">
          Auf Bifröst ansehen →
        </a>
      </div>
    </div>
  `;
  
  popupContainer.classList.add('visible');
  
  // Focus trap
  const closeBtn = popupContainer.querySelector<HTMLElement>('.bifrost-popup-close');
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
