# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für **biologische Daten** (Pilze, Pflanzen, Tiere, Mikroorganismen) mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready

- **343 Tests** bestanden (Detection, Security, Morphs, Observer, Integration)
- **18 Morph Primitives** implementiert (45+ MorphTypes definiert für Erweiterbarkeit)
- **Struktur-basierte Detection** - Typ-Erkennung rein aus Datenstruktur, nicht Feldnamen
- **Object-Parsing in Morphs** - Badge/Rating/Progress parsen strukturierte Objekte
- **Compare-Optimierung** - Vereinheitlichtes Design mit bar-row/bar-fill-track Pattern
- **Search Showcase** - "First Load" Ansicht zeigt jeden Morph-Typ einmal mit Echtdaten
- **matchedPerspectives Auto-Activation** - Suchergebnisse zeigen automatisch relevante Felder
- **Observer System** standardmäßig aktiviert
- **Debug-Logging** standardmäßig aktiviert für Entwicklung
- **Black Glass Morphism** Design mit Psychedelic Blue (#4d88ff)
- **Mobile-First** responsive Layout mit Touch-optimierten Interaktionen
- **Astro 5.16** mit SSR auf Port 4323
- **XSS-Schutz** in Image-Morph via validateUrl
- **Feld-basierte Selektion** für granularen Compare
- **Base64 Raw Values** für Compare-Modus (bis 10KB)
- **Double-Init Guards** verhindern mehrfache Event-Registrierung

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
npm test             # 215 Tests
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
└── tests/               # 5 Test-Suites, 227 Tests
```

## 📱 Layout (Mobile-First)

### Touch-Optimierung
- **Min 44px Touch Targets** - Alle interaktiven Elemente (Buttons, Links)
- **Safe-Area Insets** - iOS Home-Indicator berücksichtigt
- **Tap Highlight deaktiviert** - Cleaner Touch-Feedback
- **Touch-Action: manipulation** - Schnellere Touch-Response

### Header (oben - kompakt)
- Logo (🍄) + Page Title + Compare Button
- Sticky, mit Safe-Area-Padding oben
- Compare-Button: Min 44px Touch Target

### Search Footer (unten - fixiert)
- **Perspektiven-Buttons**: 44px auf Mobile, 36px auf Desktop
- **Suchleiste**: Full-width Input mit Glass-Effekt
- Safe-Area für Mobile (iOS Home-Indicator) berücksichtigt

### Responsive Grid
- **Mobile (<520px)**: 1 Spalte
- **Small Tablet (520-767px)**: 2 Spalten
- **Tablet (768-1199px)**: Auto-fit, min 280px
- **Desktop (≥1200px)**: Auto-fit, min 300px

## 🆕 Feld-basierte Selektion

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

## 🔍 Perspektiven-System

### Max 4 aktive Perspektiven (FIFO)

- Maximal **4 Perspektiven** gleichzeitig aktivierbar
- Bei Überschreitung: **Älteste wird entfernt** (First In First Out)
- Aktive Perspektiven erscheinen als **Text-Pills** im Suchfeld

### Perspektiven-Suche (ab 4 Zeichen)

- Suche nach **"chem"** → Perspektive "Chemistry" matcht
- Gematchte (aber nicht aktive) Perspektiven bekommen **Glow + Counter**
- Auto-Aktivierung respektiert das 4er-Limit

### Perspektiven-Daten in Cards

- Cards zeigen **scrollbaren Content** für Perspektiven-Daten
- Jede Perspektive hat eigene **Section mit Symbol + Label**
- **Perspektiven-Farben** werden via `data-perspektive` Attribut und CSS Variable `--perspektive-rgb` weitergegeben
- Morph-Rendering für alle Datentypen (inkl. Radar-Charts, Sparklines, etc.)

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

## 🎨 Implementierte Morphs (18 Primitives)

| Morph | Single | Compare | Auto-Detect (Struktur) |
|-------|--------|---------|------------------------|
| `text` | ✅ | Side-by-side | String >20 chars |
| `number` | ✅ | Balken | Number |
| `boolean` | ✅ | Side-by-side | Boolean |
| `badge` | ✅ | Highlight-Diff | `{status, variant}` |
| `tag` | ✅ | Common/Unique | String ≤20 chars / `["short"]` |
| `progress` | ✅ | Stacked bars | `{value, max}` |
| `rating` | ✅ | Horizontal bars | `{rating, max?}` |
| `range` | ✅ | Overlap visual | `{min, max}` |
| `stats` | ✅ | Side-by-side | `{min, avg, max}` |
| `image` | ✅ | Side-by-side | URL mit .jpg/.png/.webp/.svg |
| `link` | ✅ | Side-by-side | http/https URL |
| `list` | ✅ | Side-by-side | `["longer strings"]` |
| `bar` | ✅ | Grouped + Ø/Δ Stats | `[{label, value}]` |
| `sparkline` | ✅ | Side-by-side | `[numbers]` |
| `radar` | ✅ | Overlay + Insights | `[{axis, value}]` oder Obj 3+ nums |
| `timeline` | ✅ | Side-by-side | `[{date, event}]` |
| `date` | ✅ | Side-by-side | ISO date string |
| `object` | ✅ | Tabelle + Max/Min/Δ | Generic objects |

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
| Morphs | 43 Dateien + 44 Compare | Inline | **Unified: 18 Primitives** |
| Layout | Modular | Monolith (3600 Zeilen) | **Modular (~50 Zeilen)** |
| Config | Eigener Parser | yaml lib | **yaml lib** |
| Data | Dupliziert | Dupliziert | **Symlink** |
| Types | JSDoc | TypeScript | **TypeScript** |
| Detection | 4 Dateien, Feldnamen | 1 Datei | **1 Datei, Struktur-basiert** |
| Tests | - | - | **227 Tests** |
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
