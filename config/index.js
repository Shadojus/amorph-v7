// ============================================================================
// PRIMITIVES - Domänenunabhängige Basis-Morphs
// ============================================================================
import { text } from '../morphs/primitives/text/text.js';
import { number } from '../morphs/primitives/number/number.js';
import { boolean } from '../morphs/primitives/boolean/boolean.js';
import { tag } from '../morphs/primitives/tag/tag.js';
import { range } from '../morphs/primitives/range/range.js';
import { list } from '../morphs/primitives/list/list.js';
import { object } from '../morphs/primitives/object/object.js';
import { image } from '../morphs/primitives/image/image.js';
import { link } from '../morphs/primitives/link/link.js';
import { pie } from '../morphs/primitives/pie/pie.js';
import { bar } from '../morphs/primitives/bar/bar.js';
import { radar } from '../morphs/primitives/radar/radar.js';
import { progress } from '../morphs/primitives/progress/progress.js';
import { stats } from '../morphs/primitives/stats/stats.js';
import { timeline } from '../morphs/primitives/timeline/timeline.js';
import { badge } from '../morphs/primitives/badge/badge.js';
import { lifecycle } from '../morphs/primitives/lifecycle/lifecycle.js';

// ============================================================================
// FEATURE-MORPHS - Systemweite Features
// ============================================================================
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';
import { header } from './header.js';

// ============================================================================
// COMPARE - Generische Compare-Wrapper (aus primitives/)
// ============================================================================
import { 
  compareByType,
  compareBar as compareBarMorph, 
  compareTag as compareTagMorph, 
  compareList as compareListMorph, 
  compareImage, 
  compareRadar as compareRadarMorph, 
  comparePie as comparePieMorph, 
  compareText as compareTextMorph,
  compareTimeline as compareTimelineMorph,
  compareRange as compareRangeMorph,
  compareProgress as compareProgressMorph,
  compareStats as compareStatsMorph,
  compareBoolean as compareBooleanMorph,
  compareObject as compareObjectMorph
} from '../morphs/compare/primitives/index.js';
import { erstelleFarben, detectType, createSection, createHeader, setAktivePerspektivenFarben } from '../morphs/compare/base.js';

// Smart Composites - Intelligente Morph-Kombinationen
import { 
  smartCompare, 
  diffCompare, 
  analyzeItems, 
  findRelatedFields 
} from '../morphs/compare/composites.js';

// compareByData aus compare/index.js
import { compareByData } from '../morphs/compare/index.js';

// Legacy-Alias für compareMorph (wird von vergleich/index.js genutzt)
const compareMorph = (feldName, typ, items, config) => {
  // Container mit Feldname als Header + Abwahl-Button
  const container = document.createElement('div');
  container.className = 'compare-section';
  container.dataset.feldName = feldName;
  
  const header = document.createElement('div');
  header.className = 'compare-section-header';
  
  // Label
  const label = document.createElement('span');
  label.className = 'compare-section-label';
  label.textContent = config?.label || feldName;
  header.appendChild(label);
  
  // Abwahl-Button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'compare-section-remove';
  removeBtn.type = 'button';
  removeBtn.title = `${config?.label || feldName} abwählen`;
  removeBtn.innerHTML = '×';
  removeBtn.dataset.feldName = feldName;
  header.appendChild(removeBtn);
  
  container.appendChild(header);
  
  // Items werden direkt durchgereicht - vergleich/index.js baut sie korrekt
  // mit: {id, name, wert, farbe, textFarbe, farbKlasse, lineFarbe, bgFarbe, glowFarbe}
  const content = compareByType(typ, items, config);
  
  container.appendChild(content);
  return container;
};

// Aliase für Abwärtskompatibilität
const compareBar = compareBarMorph;
const compareTag = compareTagMorph;
const compareList = compareListMorph;
const compareRadar = compareRadarMorph;
const comparePie = comparePieMorph;
const compareText = compareTextMorph;
const compareTimeline = compareTimelineMorph;
const compareRange = compareRangeMorph;
const compareProgress = compareProgressMorph;
const compareStats = compareStatsMorph;
const compareBoolean = compareBooleanMorph;
const compareObject = compareObjectMorph;

import { debug } from '../observer/debug.js';

// ============================================================================
// REGISTRY - Alle verfügbaren Morphs
// ============================================================================
export const morphs = {
  // Basis-Morphs (Primitives)
  text,
  string: text,  // Alias: Schema nutzt 'string', Morph heißt 'text'
  number,
  boolean,
  tag,
  range,
  list,
  object,
  image,
  link,
  
  // Feature-Morphs
  suche,
  perspektiven,
  header,
  
  // Visuelle Morphs
  pie,      // Kreisdiagramm für Verteilungen
  bar,      // Balkendiagramm für Vergleiche
  radar,    // Radar-Chart für Profile (3+ Achsen)
  progress, // Fortschrittsbalken
  stats,    // statistics-Karte (min/max/avg)
  timeline, // Zeitliche Abfolge
  badge,    // Farbige Status-Labels
  lifecycle, // Lebenszyklen / Phasen
  
  // Compare-Morphs (Vergleich) - Alle Typen
  compareMorph,
  compareBar,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareRange,
  compareProgress,
  compareBoolean,
  compareStats,
  compareObject,
  
  // Compare-Composites (Intelligente Kombinations-Morphs)
  smartCompare,
  diffCompare,
  
  // Compare-Utilities
  erstelleFarben,
  setAktivePerspektivenFarben,
  compareByType,
  compareByData,
  detectType,
  createSection,
  createHeader
};

// Log registrierte Morphs
debug.morphs('registry', { 
  primitives: ['text', 'number', 'boolean', 'tag', 'range', 'list', 'object', 'image', 'link', 'pie', 'bar', 'radar', 'progress', 'stats', 'timeline', 'badge', 'lifecycle'],
  features: ['suche', 'perspektiven', 'header'],
  compare: ['compareMorph', 'compareBar', 'compareTag', 'compareList', 'compareImage', 'compareRadar', 'comparePie', 'compareText', 'compareTimeline', 'compareRange', 'compareProgress', 'compareBoolean', 'compareStats', 'compareObject'],
  composites: ['smartCompare', 'diffCompare']
});

// ============================================================================
// EXPORTS
// ============================================================================
export { 
  // Primitives
  text, number, boolean, tag, range, list, object, image, link, 
  pie, bar, radar, progress, stats, timeline, badge, lifecycle,
  
  // Features
  suche, perspektiven, header,
  
  // Compare Morphs - Alle
  compareMorph, compareBar, compareTag, compareList, 
  compareImage, compareRadar, comparePie, compareText, compareTimeline,
  compareRange, compareProgress, compareBoolean, compareStats, compareObject,
  
  // Composites
  smartCompare, diffCompare,
  
  // Compare Utilities
  erstelleFarben, setAktivePerspektivenFarben, detectType, createSection, createHeader, compareByType, compareByData
};
