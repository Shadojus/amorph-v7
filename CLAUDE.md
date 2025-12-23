# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für **biologische Daten** (Pilze, Pflanzen, Tiere, Mikroorganismen) mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready

- **421 Tests** bestanden (Detection, Security, Morphs, Observer, Integration, Real-Data, API, Error-Handling)
- **18 Morph Primitives** implementiert (45+ MorphTypes definiert für Erweiterbarkeit)
- **Struktur-basierte Detection** - Typ-Erkennung rein aus Datenstruktur, nicht Feldnamen
- **Object-Parsing in Morphs** - Badge/Rating/Progress parsen strukturierte Objekte
- **Compare-Optimierung** - Vereinheitlichtes Design mit bar-row/bar-fill-track Pattern
- **Bio-Lumineszenz Farbsystem** - 8 leuchtende Farben für Compare (Foxfire, Myzel, Sporen, etc.)

### Multi-Site System
Drei Bio-Spezies Sites mit eigenem Farbsystem:
- **Funginomi** (Psychedelic Blue) - Pilze & Fungi
- **Phytonomi** (Jade Green) - Pflanzen & Flora  
- **Therionomi** (Magenta Pink) - Tiere & Fauna

### Design Features
- **Black Glass Morphism** - Einheitliches Design für alle Komponenten
- **Site-Switcher Header** mit Bifröst-Portal und Nebel-Animation
- **Lichtkugel-Design** - Steps, Lifecycle, Calendar mit leuchtenden aktiven Elementen
- **Perspektiven: Matte Pastell-Töne** - Klar unterscheidbar von Bio-Lumineszenz
- **Sticky Suchleiste** - Unter dem Header, durchsucht auch Compare-View
- **Compare mit Copy-Button** - Daten exportieren mit License-Hinweis

### Technologie
- **Astro 5.16** mit SSR auf Port 4323
- **TypeScript** durchgängig
- **Mobile-First** responsive Layout mit Touch-optimierten Interaktionen
- **XSS-Schutz** in Image-Morph via validateUrl
- **SVG-Schutz** - Search-Highlighting modifiziert keine SVG-Text-Elemente

## 🎯 Kernkonzept

**Ein Morph, zwei Modi**: Jeder Morph erkennt automatisch ob er einen Einzelwert oder mehrere Werte zum Vergleich rendern soll - basierend auf dem `RenderContext`.

```typescript
const context: RenderContext = {
  mode: 'compare',      // oder 'single', 'grid'
  itemCount: 3,         // Anzahl der Items
  items: [...]          // Die Items selbst
};

badge(value, context);  // Single ODER Compare je nach Context
```

## 🚀 Quick Start

```bash
cd amorph-v7
npm install
npm run dev          # Port 4323
npm test             # 421 Tests im Watch-Modus
npm run test:run     # Einmalig ohne Watch
```

## 📁 Projektstruktur

```
amorph-v7/
├── config/              → Symlink zu ../config (YAML)
├── data/                → Symlink zu ../data (JSON)
│
├── src/
│   ├── core/            # Types, Detection, Security
│   ├── morphs/          # Unified Morph System (18 Primitives)
│   ├── observer/        # Debug & Analytics System
│   ├── server/          # SSR: Config + Data Loader
│   ├── client/          # Browser: Features + Styles
│   │   └── features/    # app, search, grid, compare, selection, debug
│   ├── layouts/         # Base.astro
│   └── pages/           # index, [slug], api/
│
├── public/
│   └── styles/          # base.css, components.css, morphs.css
│
└── tests/               # 28 Test-Suites
```

## 🐛 Debug Mode (Standardmäßig AN)

```javascript
window.amorphDebug.disable()    // Debug-Logging deaktivieren
window.morphDebug.enable()      // Morph-Debugging aktivieren
window.getAmorphStats()         // Observer Statistiken

localStorage.setItem('amorph:debug', 'false')      // Debug-Logs aus
localStorage.setItem('amorph:observers', 'false')  // Observer aus
```

### Debug-Kategorien
- 🍄 `amorph` - Allgemeine System-Logs
- ✓ `selection` - Feld/Item Selektion  
- 🔬 `compare` - Compare-Panel
- 📐 `layout` - Grid/Layout Events

## 🎨 Design System

### Z-Index Hierarchie
1. **z-index: 10000** - Suchleiste (immer über allem)
2. **z-index: 9999** - Compare-Panel
3. **z-index: 400** - Bottom Navigation
4. **z-index: 200** - Header

### Farb-System
| System | Verwendung | Farben |
|--------|------------|--------|
| **Site Colors** | Multi-Site Branding | Funginomi Blue, Phytonomi Jade, Therionomi Magenta |
| **Perspektiven** | Datenkategorien | 15 matte Pastell-Töne |
| **Bio-Lumineszenz** | Compare-Ansicht | 8 leuchtende Farben (Foxfire, Myzel, Sporen, etc.) |

### CSS Variables
```css
--system-rgb: 77, 136, 255;           /* Active Site Color */
--site-funginomi-rgb: 77, 136, 255;   /* Psychedelic Blue */
--site-phytonomi-rgb: 51, 179, 128;   /* Jade Green */
--site-therionomi-rgb: 235, 77, 180;  /* Magenta Pink */
```

## 📱 Features

### Feld-basierte Selektion
Einzelne Datenfelder aus beliebigen Spezies auswählen und vergleichen:
- Klick auf Feld zum Auswählen
- Farbe basierend auf Perspektive
- sessionStorage Persistenz
- Compare-View mit allen ausgewählten Feldern

### Sticky Suchleiste
- Bleibt unter dem Header beim Scrollen
- Durchsucht auch den Compare-View wenn aktiv
- Perspektiven-Pills unter der Suchleiste

### Compare mit Data Export
- Copy-Button im Compare-Header
- Formatierter Text-Export
- License-Hinweis: "Free License – Bei Nutzung bitte Quelle angeben"

## 🔧 API Endpoints

### GET /api/search
```
/api/search?q=pilz&p=culinary,safety&limit=20
```

### POST /api/compare
```json
{ "fields": [...selectedFields] }
```

## 🎨 Implementierte Morphs (18)

| Morph | Single | Compare | Auto-Detect |
|-------|--------|---------|-------------|
| `text` | ✅ | Side-by-side | String >20 chars |
| `number` | ✅ | Balken | Number |
| `boolean` | ✅ | Side-by-side | Boolean |
| `badge` | ✅ | Highlight-Diff | `{status, variant}` |
| `tag` | ✅ | Common/Unique | String ≤20 chars |
| `progress` | ✅ | Stacked bars | `{value, max}` |
| `rating` | ✅ | Horizontal bars | `{rating, max?}` |
| `range` | ✅ | Overlap visual | `{min, max}` |
| `stats` | ✅ | Side-by-side | `{min, avg, max}` |
| `image` | ✅ | Side-by-side | URL mit Extension |
| `link` | ✅ | Side-by-side | http/https URL |
| `list` | ✅ | Side-by-side | `["strings"]` |
| `bar` | ✅ | Grouped + Stats | `[{label, value}]` |
| `sparkline` | ✅ | Side-by-side | `[numbers]` |
| `radar` | ✅ | Overlay + Insights | `[{axis, value}]` |
| `timeline` | ✅ | Side-by-side | `[{date, event}]` |
| `date` | ✅ | Side-by-side | ISO date string |
| `object` | ✅ | Tabelle + Δ | Generic objects |

## 🔑 Architektur-Entscheidungen

1. **Symlinks** - Config/Data aus Root-Projekt verlinkt
2. **Unified Morphs** - Ein Morph-Typ, eine Datei, beide Modi
3. **TypeScript** - Typsicherheit durchgängig
4. **Modulares Layout** - Base.astro ~50 Zeilen
5. **CSS in public/** - Statisch und cachefreundlich
