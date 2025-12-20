/**
 * Header Morph
 * Container für Suche + Perspektiven + Ansicht-Switch
 * Sticky am oberen Rand - Dark Glasmorphism Design
 * 
 * LAYOUT:
 * Zeile 0: [FUNGINOMI] .................................. [Part of Bifroest]
 * Zeile 1: [🔍 Suche .............. aktive Filter-Badges...] [⊞][▥]
 * Zeile 2: [Perspektiven-Buttons]
 * Zeile 3: [Ausgewählte Pilze] (nur wenn Auswahl)
 */

import { debug } from '../observer/debug.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';

export function header(config, morphConfig = {}) {
  debug.features('Header morph created', config);
  
  const container = document.createElement('div');
  container.className = 'amorph-header';
  
  // === BRANDING aus Config (oder Fallbacks) ===
  const branding = config.branding || {};
  const appTitel = branding.titel || config.appName || 'AMORPH';
  const appTitelUrl = branding.titelUrl || '/';
  const partner = branding.partner || {};
  const partnerText = partner.text || 'Part of the';
  const partnerName = partner.name || '';
  const partnerUrl = partner.url || '';
  
  // === ZEILE 0: Branding (Logo links, Partner rechts) ===
  const zeile0 = document.createElement('div');
  zeile0.className = 'amorph-header-row amorph-header-branding';
  
  // App-Titel/Logo (links)
  const titel = document.createElement('a');
  titel.className = 'amorph-header-titel';
  titel.href = appTitelUrl;
  titel.innerHTML = `<span class="titel-text">${appTitel}</span>`;
  zeile0.appendChild(titel);
  
  // Partner Link (rechts) - nur wenn konfiguriert
  if (partnerName && partnerUrl) {
    const partnerLink = document.createElement('a');
    partnerLink.className = 'amorph-header-bifroest';
    partnerLink.href = partnerUrl;
    partnerLink.target = '_blank';
    partnerLink.innerHTML = `${partnerText} <span class="bifroest-name">${partnerName}</span>`;
    zeile0.appendChild(partnerLink);
  }
  
  container.appendChild(zeile0);
  
  // === ZEILE 1: Suche (MIT aktiven Badges DRIN) + Ansicht-Switch ===
  const zeile1 = document.createElement('div');
  zeile1.className = 'amorph-header-row amorph-header-main';
  
  // Suche-Wrapper (enthält Input + aktive Filter-Badges)
  const sucheWrapper = document.createElement('div');
  sucheWrapper.className = 'amorph-suche-wrapper';
  
  if (config.suche) {
    const sucheContainer = document.createElement('amorph-container');
    sucheContainer.setAttribute('data-morph', 'suche');
    sucheContainer.setAttribute('data-field', 'suche');
    sucheContainer.appendChild(suche(config.suche));
    sucheWrapper.appendChild(sucheContainer);
  }
  
  // Container für aktive Filter-Badges (INNERHALB der Suchleiste!)
  const aktiveBadges = document.createElement('div');
  aktiveBadges.className = 'amorph-aktive-filter';
  sucheWrapper.appendChild(aktiveBadges);
  
  zeile1.appendChild(sucheWrapper);
  
  // Ansicht-Switch (Grid, Vergleich) - RECHTS
  if (config.ansicht !== false) {
    const ansichtSwitch = erstelleAnsichtSwitch(config.ansicht || {});
    zeile1.appendChild(ansichtSwitch);
  }
  
  container.appendChild(zeile1);
  
  // === ZEILE 2: Perspektiven-Grid (volle Breite, buntes Styling) ===
  if (config.perspektiven) {
    const zeile2 = document.createElement('div');
    zeile2.className = 'amorph-header-row amorph-header-perspektiven';
    
    const perspektivenContainer = document.createElement('amorph-container');
    perspektivenContainer.setAttribute('data-morph', 'perspektiven');
    perspektivenContainer.setAttribute('data-field', 'perspektiven');
    perspektivenContainer.appendChild(perspektiven(config.perspektiven));
    zeile2.appendChild(perspektivenContainer);
    
    container.appendChild(zeile2);
  }
  
  // === ZEILE 3: Ausgewählte Pilze (transparent, nur wenn Auswahl) ===
  const zeile3 = document.createElement('div');
  zeile3.className = 'amorph-header-row amorph-header-auswahl';
  zeile3.style.display = 'none'; // Initial versteckt
  
  const auswahlLabel = document.createElement('span');
  auswahlLabel.className = 'amorph-auswahl-label';
  auswahlLabel.textContent = 'Auswahl:';
  zeile3.appendChild(auswahlLabel);
  
  const auswahlListe = document.createElement('div');
  auswahlListe.className = 'amorph-auswahl-liste';
  zeile3.appendChild(auswahlListe);
  
  // Clear-Button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'amorph-auswahl-clear';
  clearBtn.innerHTML = '✕';
  clearBtn.title = 'Auswahl leeren';
  zeile3.appendChild(clearBtn);
  
  container.appendChild(zeile3);
  
  // Update-Funktion für ausgewählte Pilze
  container.updateAuswahlListe = (fungi) => {
    // fungi: Array von {id, name, slug, farbKlasse}
    if (!fungi || fungi.length === 0) {
      zeile3.style.display = 'none';
      return;
    }
    
    zeile3.style.display = 'flex';
    auswahlListe.innerHTML = '';
    
    for (const pilz of fungi) {
      const badge = document.createElement('span');
      badge.className = `amorph-auswahl-badge ${pilz.farbKlasse || ''}`;
      badge.dataset.pilzId = pilz.id;
      
      // Name als klickbarer Link
      const nameSpan = document.createElement('a');
      nameSpan.className = 'badge-name';
      nameSpan.href = `/${pilz.slug || pilz.id}`;
      nameSpan.textContent = pilz.name;
      nameSpan.title = `${pilz.name} öffnen`;
      nameSpan.addEventListener('click', (e) => {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('amorph:navigate-pilz', {
          detail: { slug: pilz.slug || pilz.id, id: pilz.id }
        }));
      });
      badge.appendChild(nameSpan);
      
      // × Button zum Entfernen
      const removeBtn = document.createElement('span');
      removeBtn.className = 'badge-icon';
      removeBtn.innerHTML = '×';
      removeBtn.title = `${pilz.name} aus Auswahl entfernen`;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Event für Entfernen dispatchen
        document.dispatchEvent(new CustomEvent('amorph:remove-from-selection', {
          detail: { id: pilz.id, name: pilz.name }
        }));
      });
      badge.appendChild(removeBtn);
      
      auswahlListe.appendChild(badge);
    }
    
    debug.features('Selection list updated', { count: fungi.length });
  };
  
  return container;
}

/**
 * Erstellt den Ansicht-Switch (Karten, Detail, Vergleich)
 * Direktes Tab-Wechseln - kein Popup!
 * NEU: Vergleich-Button zeigt Auswahl-Anzahl!
 */
function erstelleAnsichtSwitch(config) {
  const ansichten = config.ansichten || [
    { id: 'karten', label: 'Karten', icon: '⊞', minAuswahl: 0 },
    { id: 'vergleich', label: 'Vergleich', icon: '▥', minAuswahl: 1 }
  ];
  
  const aktiv = config.default || 'karten';
  
  const switchContainer = document.createElement('div');
  switchContainer.className = 'amorph-ansicht-switch';
  switchContainer.setAttribute('role', 'tablist');
  switchContainer.setAttribute('aria-label', 'Ansicht wählen');
  
  for (const ansicht of ansichten) {
    const btn = document.createElement('button');
    btn.className = 'amorph-ansicht-btn';
    btn.dataset.ansicht = ansicht.id;
    // minAuswahl aus Config oder Fallback (vergleich braucht mindestens 1)
    const minAuswahl = ansicht.minAuswahl ?? (ansicht.id === 'vergleich' ? 1 : 0);
    btn.dataset.minAuswahl = minAuswahl;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', ansicht.id === aktiv ? 'true' : 'false');
    btn.setAttribute('title', ansicht.label);
    
    // Icon + Counter-Badge für Vergleich
    btn.innerHTML = `<span class="btn-icon">${ansicht.icon}</span>`;
    if (ansicht.id === 'vergleich') {
      btn.innerHTML += `<span class="btn-counter" data-count="0"></span>`;
    }
    
    if (ansicht.id === aktiv) {
      btn.classList.add('aktiv');
    }
    
    // Vergleich initial disabled bis Auswahl vorhanden
    if (minAuswahl > 0) {
      btn.disabled = true;
      btn.classList.add('disabled');
    }
    
    // Direkter Tab-Wechsel - kein Popup!
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      
      // Alle Buttons deaktivieren
      for (const b of switchContainer.querySelectorAll('.amorph-ansicht-btn')) {
        b.classList.remove('aktiv');
        b.setAttribute('aria-selected', 'false');
      }
      // Diesen aktivieren
      btn.classList.add('aktiv');
      btn.setAttribute('aria-selected', 'true');
      
      // Callback aufrufen statt document.dispatchEvent (Morph-Purity)
      if (typeof config.onAnsichtWechsel === 'function') {
        config.onAnsichtWechsel(ansicht.id);
      }
      
      debug.features('View changed', { view: ansicht.id });
    });
    
    switchContainer.appendChild(btn);
  }
  
  // Update-Funktion für externe Aufrufe
  switchContainer.updateAuswahl = (anzahl) => {
    // Vergleich-Button Counter aktualisieren
    const vergleichBtn = switchContainer.querySelector('[data-ansicht="vergleich"]');
    const counter = vergleichBtn?.querySelector('.btn-counter');
    if (counter) {
      counter.dataset.count = anzahl;
      counter.textContent = anzahl > 0 ? anzahl : '';
    }
    
    // Buttons enablen/disablen basierend auf Auswahl-Anzahl
    for (const btn of switchContainer.querySelectorAll('.amorph-ansicht-btn')) {
      const minAuswahl = parseInt(btn.dataset.minAuswahl || '0');
      if (anzahl >= minAuswahl) {
        btn.disabled = false;
        btn.classList.remove('disabled');
      } else {
        btn.disabled = true;
        btn.classList.add('disabled');
        // Wenn aktiv und nicht mehr genug Auswahl → zu Karten wechseln
        if (btn.classList.contains('aktiv')) {
          const kartenBtn = switchContainer.querySelector('[data-ansicht="karten"]');
          kartenBtn?.click();
        }
      }
    }
  };
  
  return switchContainer;
}

