# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für **wissenschaftliche Daten** mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready (Januar 2026)

- **🔗 BIFROEST Integration** - Daten aus Pocketbase (nicht mehr lokal!)
- **🌌 Aurora Nebula Animation** - Header-Animation wird in Bifroest als Fullscreen verwendet
- **17 Sites** - 6 Bio + 3 Geo + 11 Wissenschaftliche Domains
- **289 Experts** - In Pocketbase, extrahiert aus AMORPH _sources.json
- **100+ Perspektiven** - 15 Bio + 12 Paleo + 11 Mineral + 7 Tektonik + ~90 neue Domains
- **28 Morph Primitives** implementiert (badge, bar, boolean, calendar, citation, currency, date, dosage, gauge, image, lifecycle, link, list, number, object, pie, progress, radar, range, rating, severity, sparkline, stats, steps, tag, text, timeline)
- **Struktur-basierte Detection** - Typ-Erkennung rein aus Datenstruktur
- **Field-basierte Selektion** - Einzelne Felder aus beliebigen Spezies auswählen
- **Live Compare Updates** - Diff-basierte Aktualisierung ohne Reload
- **Autocomplete Feature** - Fehlende Felder automatisch bei anderen Spezies ergänzen
- **Bio-Lumineszenz Farbsystem** - 8 leuchtende Farben (Foxfire, Myzel, Sporen, etc.)
- **HIGH_VALUE_FIELDS Priorisierung** - "Knaller"-Daten zuerst (Healing, WOW-Faktor, Kulinarik)
- **Bifroest Attribution System** - © Copyright-Badges + Experten-Buttons mit Popup
- **Nebel-Drift Animation** - Sanftes Cyan-Glow ohne Blinken (kein Weiß)
- **English UI Labels** - Search, Compare, Complete, Copy (international)

### 🌐 Multi-Domain System (17 Sites)

| Port | Site | Domain | Farbe |
|------|------|--------|-------|
| 4321 | Funginomi | fungi | Psychedelic Blue |
| 4322 | Phytonomi | plantae | Jade Green |
| 4323 | Drakonomi | therion | Magenta Pink |
| 4324 | Paleonomi | paleontology | Amber |
| 4325 | Tektonomi | tectonics | Slate |
| 4326 | Minenomi | mineralogy | Crystal |
| 4327 | Bakterionomi | microbiology | Cyan |
| 4328 | Vironomi | virology | Red-Orange |
| 4329 | Genonomi | genetics | Purple |
| 4330 | Anatonomi | anatomy | Coral |
| 4331 | Chemonomi | chemistry | Yellow |
| 4332 | Physikonomi | physics | Electric Blue |
| 4333 | Kosmonomi | astronomy | Deep Purple |
| 4334 | Netzonomi | informatics | Teal |
| 4335 | Cognitonomi | ai | Violet |
| 4336 | Bionomi | biotech | Lime |
| 4337 | Socionomi | sociology | Orange |

### Design Features
- **Black Glass Morphism** - Transparentes Schwarz mit blauen Kanten
- **Nachthimmel-Prinzip** - Dunkler Hintergrund, leuchtende Datenpunkte
- **Lichtkugel-Design** - 6px Dots mit Glow-Effekt
- **Perspektiven: Matte Pastell-Töne** - 15 Kategorien, klar von Bio-Lumineszenz unterscheidbar
- **Sticky Suchleiste** - z-index 10000, durchsucht auch Compare-View
- **Compare mit Autocomplete** - Fehlende Felder automatisch ergänzen + Copy-Button
- **Compare-Toggle Footer** - Button wechselt zwischen "Compare" und "Close"
- **Engagement-optimierte Feld-Anzeige** - WOW-Felder vor technischen Daten
- **Bifroest-Mode** - Cyan-Nebel-Glow für Copyright/Experten-Attribution (kein Weiß, Drift-Animation)

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
│   ├── daten.yaml       # Datenquelle (pocketbase)
│   ├── features.yaml    # Feature-Flags
│   └── schema/          # 15 Perspektiven + Blueprints
│
├── data/                # Lokale Hilfsdateien (NICHT Species-Daten!)
│   ├── universe-index.json    # Index für Navigation
│   └── bifroest-experts.json  # Experten-Datenbank
│   # ⚠️ Species-Daten sind in POCKETBASE (http://localhost:8090)
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
│   ├── server/          # config.ts, data.ts, bifroest.ts (Pocketbase Client)
│   ├── client/features/ # app, search, grid, compare, selection, bifrost, debug
│   ├── layouts/         # Base.astro (CSS Bundling)
│   └── pages/           # index.astro (Pagination), [slug].astro, api/
│
├── public/
│   ├── styles/          # CSS mit Bundled Outputs
│   │   ├── all.min.css  # Production Bundle (154KB)
│   │   └── morphs/      # Morph Styles (inkl. bifroest.css)
│   └── images/species/  # Lokale Bilder (WebP)
│
└── tests/               # 421 Tests - detection, security, morphs, observer, integration
```

## 🔗 Pocketbase Integration

AMORPH lädt alle Species-Daten von der **BIFROEST Pocketbase**:

```
http://localhost:8090/api/collections/species/records
```

### Species Collection Schema (25 Felder)
- **Core**: name, slug, category, description, scientific_name, image
- **15 Perspektiven**: identification, ecology, chemistry, medicine, safety, culinary, cultivation, conservation, culture, economy, geography, interactions, research, statistics, temporal (JSON)
- **Meta**: created, updated, sources, expert_id

### Environment Variables
```bash
POCKETBASE_URL=http://localhost:8090   # Pocketbase API
DATA_SOURCE=pocketbase                  # 'pocketbase' | 'local' | 'auto'
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

---

## 🚀 How to Add New System Parts

### A) Neue Perspektive zu existierender Domain

1. **Blueprint erstellen** in `config/schema/perspektiven/blueprints/`
```yaml
# newperspective.blueprint.yaml
id: newperspective
name: Neue Perspektive
symbol: 🔬

# morph: text
field_name: ""

# morph: tag
category: ""

_enums:
  category:
    - "Option1"
    - "Option2"
```

2. **Perspektive registrieren** in `config/schema/perspektiven/index.yaml`
```yaml
fungi:
  - identification
  - ecology
  - newperspective  # ← Hinzufügen
```

3. **Daten ergänzen** in den Species-JSON-Dateien oder PocketBase

---

### B) Neuer Morph-Typ

1. **Morph implementieren** in `src/morphs/primitives/`
```typescript
// newmorph.ts
import type { RenderContext, MorphOutput } from '../types';

export function newmorph(value: unknown, context: RenderContext): MorphOutput {
  // Single mode
  if (context.mode === 'single') {
    return { html: `<span class="morph-newmorph">${value}</span>` };
  }
  
  // Compare mode
  return { html: `<div class="morph-newmorph-compare">...</div>` };
}
```

2. **Export hinzufügen** in `src/morphs/index.ts`
```typescript
export { newmorph } from './primitives/newmorph';
```

3. **CSS erstellen** in `public/styles/morphs/`
```css
/* newmorph.css */
.morph-newmorph { /* ... */ }
.morph-newmorph-compare { /* ... */ }
```

4. **Detection hinzufügen** in `src/core/detection.ts`
```typescript
// In detectMorphType function
if (isNewMorphStructure(value)) return 'newmorph';
```

5. **Tests schreiben** in `tests/morphs/newmorph.test.ts`

---

### C) Neue Domain (kompletter Guide)

#### Step 1: Farbe definieren
```typescript
// src/server/config.ts
export const DOMAIN_COLORS: Record<string, string> = {
  newdomain: '#FF6B35',
};
```

#### Step 2: Perspektiven definieren
```yaml
# config/schema/perspektiven/index.yaml
newdomain:
  - perspective1
  - perspective2
  - perspective3
```

#### Step 3: Blueprints erstellen
```bash
# Für jede Perspektive eine Datei:
config/schema/perspektiven/blueprints/perspective1.blueprint.yaml
config/schema/perspektiven/blueprints/perspective2.blueprint.yaml
```

#### Step 4: Mockdata erstellen
```bash
# Ordnerstruktur:
data/newdomain/
├── item-1/
│   └── index.json
├── item-2/
│   └── index.json
└── item-3/
    └── index.json
```

```json
// data/newdomain/item-1/index.json
{
  "id": "item-1",
  "slug": "item-1",
  "name": "Item 1",
  "scientific_name": "Itemus primus",
  "kingdom": "newdomain",
  "kingdom_icon": "🔬",
  "description": "Beschreibung...",
  "perspectives": ["perspective1", "perspective2"],
  "quick_facts": [
    {"icon": "📏", "label": "Size", "value": "10 cm"}
  ],
  "badges": [
    {"icon": "✅", "label": "Status", "status": "Active", "variant": "success"}
  ]
}
```

#### Step 5: Docker Service hinzufügen
```yaml
# bifroest-platform/docker-compose.yml
amorph-newdomain:
  build:
    context: ../AMOPRH_funginomi_phytonomi_drakonomi
    args:
      - SITE_ID=newdomain
  container_name: bifroest-newdomain
  ports:
    - "4338:4321"
  environment:
    - POCKETBASE_URL=http://pocketbase:8090
  depends_on:
    pocketbase:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:4321/api/search"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - bifroest-network
```

#### Step 6: PocketBase Collection erstellen
```javascript
// In bifroest-platform/scripts/setup-new-domains.mjs
const DOMAINS = [
  // ... existing
  { id: 'newdomain_col', name: 'newdomain', displayName: 'New Domain', icon: '🔬' }
];
```

#### Step 7: Seeding
```javascript
// In bifroest-platform/scripts/seed-new-domains.mjs
const DOMAINS = [
  // ... existing
  { folder: 'newdomain', collection: 'newdomain', name: 'New Domain' }
];
```

#### Step 8: Rebuild & Deploy
```bash
cd bifroest-platform
node scripts/setup-new-domains.mjs
node scripts/seed-new-domains.mjs
docker compose up -d --build amorph-newdomain
```

---

### D) Neues Feature hinzufügen

1. **Feature-Flag** in `config/features.yaml`
```yaml
newfeature:
  enabled: true
  config:
    option1: value1
```

2. **Client-Modul** in `src/client/features/`
```typescript
// newfeature.ts
export function initNewFeature(config: NewFeatureConfig) {
  // Implementation
}
```

3. **Integration** in `src/client/features/app.ts`
```typescript
import { initNewFeature } from './newfeature';
// In initApp():
if (features.newfeature?.enabled) {
  initNewFeature(features.newfeature.config);
}
```
