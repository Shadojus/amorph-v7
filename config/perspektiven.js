/**
 * Perspektiven Morph
 * Transformiert Perspektiven-Config zu Button-Leiste
 * Liest Perspektiven aus Schema (config/schema.yaml) als Single Source of Truth
 */

import { debug } from '../observer/debug.js';
import { getPerspektivenListe } from '../util/semantic.js';

export function perspektiven(config, morphConfig = {}) {
  debug.perspectives('Morph created', config);
  
  // Perspektiven aus Schema laden (Single Source of Truth)
  // Falls in Config überschrieben, diese nutzen
  const schemaListe = getPerspektivenListe();
  const liste = config.liste?.length > 0 ? config.liste : schemaListe;
  
  debug.perspectives('List source', { 
    fromSchema: schemaListe.length, 
    used: liste.length,
    source: config.liste?.length > 0 ? 'config' : 'schema',
    firstPerspective: liste[0] // Debug: What's in the list?
  });
  
  const nav = document.createElement('nav');
  nav.className = 'amorph-perspektiven';
  nav.setAttribute('role', 'toolbar');
  
  for (const p of liste) {
    const btn = document.createElement('button');
    btn.className = 'amorph-perspektive-btn';
    btn.dataset.perspektive = p.id;
    btn.dataset.felder = JSON.stringify(p.felder || []);
    btn.setAttribute('aria-pressed', 'false');
    
    // Symbol und Name getrennt für besseres Styling
    if (p.symbol) {
      const symbolSpan = document.createElement('span');
      symbolSpan.className = 'btn-symbol';
      symbolSpan.textContent = p.symbol;
      btn.appendChild(symbolSpan);
    }
    const nameSpan = document.createElement('span');
    nameSpan.className = 'btn-name';
    nameSpan.textContent = p.name;
    btn.appendChild(nameSpan);
    
    // Farben-Grid unterstützen (Array mit 4 Farben)
    // Fallback auf einzelne farbe für Kompatibilität
    const farben = p.farben || (p.farbe ? [p.farbe] : ['#3b82f6']);
    debug.perspectives('Button colors', { id: p.id, colors: farben, hasColors: !!p.farben, hasColor: !!p.farbe });
    
    // CSS Custom Properties: --p-farbe (Hauptfarbe), --p-farbe-2, --p-farbe-3, --p-farbe-4
    btn.style.setProperty('--p-farbe', farben[0]); // Hauptfarbe
    if (farben[1]) btn.style.setProperty('--p-farbe-2', farben[1]);
    if (farben[2]) btn.style.setProperty('--p-farbe-3', farben[2]);
    if (farben[3]) btn.style.setProperty('--p-farbe-4', farben[3]);
    
    nav.appendChild(btn);
  }
  
  nav.dataset.maxAktiv = config.maxAktiv || 4;
  
  return nav;
}
