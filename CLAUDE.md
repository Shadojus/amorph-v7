# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für **biologische Daten** (Pilze, Pflanzen, Tiere, Mikroorganismen) mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready (Dezember 2025)

- **28 Morph Primitives** implementiert (badge, bar, boolean, calendar, citation, currency, date, dosage, gauge, image, lifecycle, link, list, number, object, pie, progress, radar, range, rating, severity, sparkline, stats, steps, tag, text, timeline)
- **Struktur-basierte Detection** - Typ-Erkennung rein aus Datenstruktur
- **Field-basierte Selektion** - Einzelne Felder aus beliebigen Spezies auswählen
- **Live Compare Updates** - Diff-basierte Aktualisierung ohne Reload
- **Autocomplete Feature** - Fehlende Felder automatisch bei anderen Spezies ergänzen
- **Bio-Lumineszenz Farbsystem** - 8 leuchtende Farben (Foxfire, Myzel, Sporen, etc.)
- **HIGH_VALUE_FIELDS Priorisierung** - "Knaller"-Daten zuerst (Healing, WOW-Faktor, Kulinarik)
- **SEO-optimierte Index-Generierung** - Taglines, Badges, Quick Facts pro Species
- **Bifröst Attribution System** - © Copyright-Badges + Experten-Buttons mit Popup
- **Nebel-Drift Animation** - Sanftes Cyan-Glow ohne Blinken (kein Weiß)
- **English UI Labels** - Search, Compare, Complete, Copy (international)

### 🚀 Performance-Optimierungen (Dezember 2025)
- **CSS Bundling** - 60+ CSS → `all.min.css` (154KB, 47% kleiner, 1 HTTP Request)
- **WebP Bilder** - 96.65 MB eingespart durch automatische Konvertierung
- **Observer Dynamic Import** - 87KB eingespart, nur bei `?observe=true` geladen
- **Pagination** - Initial 12 Items statt 52, "Mehr laden" Button
- **Backdrop-filter entfernt** - Kein GPU-Overhead auf Raspberry Pi
- **DOM Reduktion** - ~1290 → ~400 Nodes (69% weniger)

### Multi-Site System
Drei Bio-Spezies Sites mit eigenem Farbsystem:
- **Funginomi** (Psychedelic Blue) - Pilze & Fungi
- **Phytonomi** (Jade Green) - Pflanzen & Flora  
- **Drakonomi** (Magenta Pink) - Tiere & Fauna

### Design Features
- **Black Glass Morphism** - Transparentes Schwarz mit blauen Kanten
- **Nachthimmel-Prinzip** - Dunkler Hintergrund, leuchtende Datenpunkte
- **Lichtkugel-Design** - 6px Dots mit Glow-Effekt
- **Perspektiven: Matte Pastell-Töne** - 15 Kategorien, klar von Bio-Lumineszenz unterscheidbar
- **Sticky Suchleiste** - z-index 10000, durchsucht auch Compare-View
- **Compare mit Autocomplete** - Fehlende Felder automatisch ergänzen + Copy-Button
- **Compare-Toggle Footer** - Button wechselt zwischen "Compare" und "Close"
- **Engagement-optimierte Feld-Anzeige** - WOW-Felder vor technischen Daten
- **Bifröst-Mode** - Cyan-Nebel-Glow für Copyright/Experten-Attribution (kein Weiß, Drift-Animation)

### Technologie
- **Astro 5.16** mit SSR auf Port 4321-4323
- **TypeScript** durchgängig
- **Vitest** für Tests (421 Tests)
- **sessionStorage** für Selection-Persistenz
- **Zod** für Schema-Validierung
- **Sharp** für WebP-Konvertierung

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
npm test             # Tests im Watch-Modus
npm run test:run     # Einmalig ohne Watch
npm run build        # Production Build (inkl. CSS Bundling)
npm run optimize:images  # WebP-Konvertierung
```

## 📁 Projektstruktur

```
amorph-v7/
├── config/              # YAML-Konfiguration
│   ├── manifest.yaml    # App-Name, Version, Branding
│   ├── daten.yaml       # Datenquelle (json-universe-optimized)
│   ├── features.yaml    # Feature-Flags
│   └── schema/          # 15 Perspektiven + Blueprints
│
├── data/                # JSON-Daten (Kingdom/Species/Perspective)
│   └── fungi/           # 27 Pilz-Spezies mit 196 JSON-Dateien
│
├── scripts/             # Build & Validierung
│   ├── build-index.js   # v2.0 - SEO-optimierte Index-Generierung
│   ├── build-css.js     # CSS Bundler (60+ → 1 Datei)
│   ├── optimize-images.js # WebP-Konvertierung mit Sharp
│   ├── build-pages.js   # Static Page Generation (optional)
│   └── validate.js      # Zod-Schema-Validierung
│
├── src/
│   ├── core/            # types.ts, detection.ts, security.ts
│   ├── morphs/          # 28 Primitives + base.ts + debug.ts
│   ├── observer/        # Debug & Analytics (DYNAMIC IMPORT!)
│   ├── server/          # config.ts, data.ts (SSR)
│   ├── client/features/ # app, search, grid, compare, selection, bifrost, debug
│   ├── layouts/         # Base.astro (CSS Bundling)
│   └── pages/           # index.astro (Pagination), [slug].astro, api/
│
├── public/styles/       # CSS mit Bundled Outputs
│   ├── all.min.css      # Production Bundle (154KB)
│   ├── base.min.css     # Base Styles
│   ├── components.min.css # UI Components
│   └── morphs/          # Morph Styles (inkl. bifroest.css)
│
└── tests/               # 421 Tests - detection, security, morphs, observer, integration
```

## 🚀 Quick Start

```bash
cd amorph-v7
npm install
npm run dev          # Port 4321 (oder 4322/4323 wenn belegt)
npm test             # Tests im Watch-Modus
npm run test:run     # Einmalig ohne Watch (421 Tests)
npm run build:index  # SEO-Index regenerieren
npm run validate     # Schema-Validierung (0 Errors expected)
```
1. **z-index: 10001** - Bottom Navigation
2. **z-index: 10000** - Suchleiste
3. **z-index: 9999** - Compare-Panel
4. **z-index: 200** - Header

### Farb-System
| System | Verwendung | Farben |
|--------|------------|--------|
| **Site Colors** | Multi-Site Branding | Funginomi Blue, Phytonomi Jade, Drakonomi Magenta |
| **Perspektiven** | Datenkategorien | 15 matte Pastell-Töne |
| **Bio-Lumineszenz** | Compare-Ansicht | 8 leuchtende Farben |

### CSS Variables
```css
--system-rgb: 77, 136, 255;           /* Active Site Color */
--pilz-0-rgb bis --pilz-7-rgb         /* Bio-Lumineszenz Palette */
```

## 📱 Features

### Feld-basierte Selektion
- Klick auf Feld-Header zum Auswählen (+ Symbol)
- Farbe basierend auf Perspektive
- sessionStorage Persistenz (`amorph:selection:fields`)
- Compare-View mit Diff-basierter Aktualisierung

### Compare-Panel
- **Species-Highlight**: Hover/Click hebt alle Werte einer Spezies hervor
- **Remove from Selection**: X-Button in Legend
- **Search in Compare**: Durchsucht Compare-Content
- **Copy-Button**: Export mit License-Hinweis

## 🔧 API Endpoints

### GET /api/search
```
/api/search?q=pilz&p=culinary,safety&limit=20
```

### POST /api/compare
```json
{
  "fields": [
    {"itemSlug": "steinpilz", "itemName": "Steinpilz", "fieldName": "toxicity", "value": {...}}
  ]
}
```
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
