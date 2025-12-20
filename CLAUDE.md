# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready

- **154 Tests** bestanden (Detection, Security, Morphs, Observer, Integration)
- **18 Morph Primitives** implementiert (45+ MorphTypes definiert für Erweiterbarkeit)
- **Observer System** standardmäßig aktiviert
- **Debug-Logging** standardmäßig aktiviert für Entwicklung
- **Black Glass Morphism** Design mit Psychedelic Blue (#4d88ff)
- **Astro 5.16** mit SSR auf Port 4323
- **XSS-Schutz** in Image-Morph via validateUrl
- **Feld-basierte Selektion** für granularen Compare

## 🎯 Kernkonzept

**Ein Morph, zwei Modi**: Jeder Morph erkennt automatisch ob er einen Einzelwert oder mehrere Werte zum Vergleich rendern soll - basierend auf dem `RenderContext`.

```typescript
// Der Morph entscheidet selbst
const context: RenderContext = {
  mode: 'compare',      // oder 'single', 'grid'
  itemCount: 3,         // Anzahl der Items
  items: [...]          // Die Items selbst
};

// Gleicher Morph, unterschiedliche Ausgabe
badge(value, context);  // Single ODER Compare je nach Context
```

## 🚀 Quick Start

```bash
cd amorph-v7
npm install
npm run dev          # Port 4323
npm test             # 154 Tests
npm run test:run     # Einmalig ohne Watch
```

## 🐛 Debug Mode (Standardmäßig AN)

Debug-Logging und Observer sind **standardmäßig aktiviert** für Entwicklung.

```javascript
// Console Commands
window.amorphDebug              // Debug-Objekt
window.amorphDebug.disable()    // Debug-Logging deaktivieren
window.getAmorphStats()         // Observer Statistiken

// Deaktivieren via localStorage:
localStorage.setItem('amorph:debug', 'false')      // Debug-Logs aus
localStorage.setItem('amorph:observers', 'false')  // Observer aus
```

### Debug-Kategorien
- 🍄 `amorph` - Allgemeine System-Logs
- ✓ `selection` - Feld/Item Selektion  
- 🔬 `compare` - Compare-Panel
- 🌐 `api` - API Calls (Search, Compare)
- 🔗 `router` - Navigation
- 📱 `touch` - Touch Events
- 📐 `layout` - Grid/Layout Events
- 🔮 `morph` - Morph Rendering

## 📁 Projektstruktur

```
amorph-v7/
├── config/              → Symlink zu ../config (YAML Single Source of Truth)
├── data/                → Symlink zu ../data (JSON nach Kingdoms)
│
├── src/
│   ├── core/            # Types, Detection, Security (4 Dateien)
│   ├── morphs/          # Unified Morph System (18 Primitives)
│   ├── observer/        # Debug & Analytics System (6 Module)
│   ├── server/          # SSR: Config + Data Loader
│   ├── client/          # Browser: Features + Styles (7 Module)
│   ├── layouts/         # Base.astro (~50 Zeilen)
│   └── pages/           # index, [slug], api/
│
├── public/
│   ├── styles/          # base.css, components.css, morphs.css
│   └── icons/           # PWA Icons
│
└── tests/               # 5 Test-Suites, 154 Tests
```

## 🆕 Feld-basierte Selektion (NEU)

Statt ganze Items zu vergleichen, können einzelne **Datenfelder** ausgewählt werden:

```
┌─────────────────────────────────┐
│ Steinpilz                       │
├─────────────────────────────────┤
│ [+] essbarkeit: essbar          │  ← Klick auf + zum Auswählen
│ [✓] toxizität: keine            │  ← Ausgewählt (blau)
│ [+] saison: Herbst              │
└─────────────────────────────────┘
```

- Jedes Feld hat einen `+` Button
- Ausgewählte Felder zeigen `✓`
- Compare zeigt nur ausgewählte Felder
- Automatische Morph-Erkennung bleibt erhalten

## 🎨 Design System

- **Background**: Psychedelic Gradient (Black → Deep Purple → Blue)
- **System Color**: Psychedelic Blue #4d88ff
- **Glass Effect**: rgba(13, 13, 31, 0.85) + backdrop-blur
- **15 Perspektiven-Farben**: Für Filter-Buttons
- **8 Pilz-Farben**: Neon-Palette für Compare-Ansicht

## 🔧 Unified Morph API

### createUnifiedMorph

```typescript
import { createUnifiedMorph } from '../morphs/base';

export const badge = createUnifiedMorph(
  'badge',
  
  // Single-Render: Ein Wert
  (value, ctx) => `<span class="morph-badge">${value}</span>`,
  
  // Compare-Render: Mehrere Werte (optional)
  (values, ctx) => `
    <div class="morph-badge-compare">
      ${values.map(({ item, value, color }) => 
        `<span class="morph-badge" style="--item-color: ${color}">${value}</span>`
      ).join('')}
    </div>
  `
);
```

### RenderContext

```typescript
interface RenderContext {
  mode: 'single' | 'grid' | 'compare';
  itemCount: number;           // 1 = single, >1 = compare
  items?: ItemData[];          // Alle Items bei compare
  itemIndex?: number;          // Index des aktuellen Items
  colors?: string[];           // Farben für Items
  perspectives?: string[];     // Aktive Perspektiven
  fieldName?: string;          // Aktuelles Feld
  compact?: boolean;           // Grid-Modus = kompakt
}
```

## 🎨 Implementierte Morphs (19 Primitives)

| Morph | Single | Compare | Auto-Detect |
|-------|--------|---------|-------------|
| `text` | ✅ | Side-by-side | String |
| `number` | ✅ | Balken | Number |
| `boolean` | ✅ | Side-by-side | Boolean |
| `badge` | ✅ | Highlight-Diff | Keywords |
| `tag` | ✅ | Common/Unique | Short strings / Arrays |
| `progress` | ✅ | Stacked bars | 0-100 |
| `rating` | ✅ | Horizontal bars | 0-10 |
| `range` | ✅ | Overlap visual | {min, max} |
| `stats` | ✅ | Side-by-side | {min, avg, max} |
| `image` | ✅ | Side-by-side | URL ending in image ext |
| `link` | ✅ | Side-by-side | URL |
| `list` | ✅ | Side-by-side | Array of strings |
| `bar` | ✅ | Grouped bars | [{label, value}] |
| `sparkline` | ✅ | Side-by-side | Array of numbers |
| `radar` | ✅ | Overlay | Object with 3+ numeric fields |
| `timeline` | ✅ | Side-by-side | [{date, event}] |
| `date` | ✅ | Side-by-side | ISO date string |
| `object` | ✅ | Side-by-side | Generic objects |

## 📡 API Endpoints

### GET /api/search

```
/api/search?q=pilz&p=culinary,safety&limit=20
```

Response:
```json
{
  "items": [...],
  "total": 42,
  "perspectivesWithData": ["culinary", "safety", "ecology"],
  "html": "<article>..."
}
```

### POST /api/compare

```json
{
  "items": ["steinpilz", "fliegenpilz"],
  "perspectives": ["safety"]
}
```

Response:
```json
{
  "html": "<div class='compare-view'>...",
  "itemCount": 2,
  "fieldCount": 15
}
```

## 🚀 Entwicklung

```bash
cd amorph-v7
npm install
npm run dev     # Port 4323
```

## 🔑 Architektur-Entscheidungen

### 1. Symlinks statt Kopien
Config und Data werden aus dem Root-Projekt verlinkt → Single Source of Truth.

### 2. Unified Morphs
Ein Morph-Typ, eine Datei, beide Modi. Keine separaten `compare/` Morphs mehr.

### 3. TypeScript durchgängig
Typsicherheit von Core bis API.

### 4. Modulares Layout
Base.astro ist ~50 Zeilen, nicht 3600. Features sind in `/client/features/`.

### 5. CSS in public/
Styles sind statisch und cachefreundlich, nicht inline im Layout.

## 📊 Vergleich zu v5/v6

| Aspekt | v5 (Root) | v6 | **v7** |
|--------|-----------|----|----|
| Morphs | 43 Dateien + 44 Compare | Inline | **Unified: 19 Primitives** |
| Layout | Modular | Monolith (3600 Zeilen) | **Modular (~50 Zeilen)** |
| Config | Eigener Parser | yaml lib | **yaml lib** |
| Data | Dupliziert | Dupliziert | **Symlink** |
| Types | JSDoc | TypeScript | **TypeScript** |
| Detection | 4 Dateien | 1 Datei | **1 Datei** |
| Tests | - | - | **77 Tests** |
| Observer | - | - | **✅ Integriert** |

## 🔮 Erweiterung

Neuen Morph hinzufügen:

```typescript
// In src/morphs/primitives/index.ts

export const myMorph = createUnifiedMorph(
  'myMorph',
  (value, ctx) => `<div class="morph-my">${value}</div>`,
  // Optional: Custom Compare Renderer
  (values, ctx) => `<div class="morph-my-compare">...</div>`
);

// In primitives object registrieren
export const primitives = {
  // ...existing
  myMorph
};
```

Automatische Erkennung in `detection.ts` ergänzen falls nötig.
