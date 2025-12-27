# AMORPH v7 - Data

> JSON-Daten für biologische Spezies mit Perspektiven-System.

## 📁 Struktur (aktuell)

```
data/
├── universe-index.json     # Haupt-Index aller Kingdoms (SEO-optimiert)
├── bifroest-experts.json   # Bifröst Experten-Datenbank (NEU)
└── fungi/
    ├── index.json          # Kingdom-Index mit allen Species + Perspektiven
    └── {species-slug}/     # Ein Ordner pro Spezies (27 Pilze)
        ├── index.json      # Core-Daten (Name, Slug, Description)
        ├── identification.json
        ├── ecology.json
        ├── safety.json
        ├── medicine.json
        ├── culinary.json
        ├── cultivation.json
        ├── culture.json
        └── ... (weitere Perspektiven)
```

## 📊 Aktuelle Daten

- **27 Pilz-Spezies** (z.B. hericium-erinaceus, trametes-versicolor, psilocybe-*)
- **196 JSON-Dateien** validiert (0 Errors)
- **~12 Perspektiven** pro Spezies im Durchschnitt

## 🔗 Bifröst Attribution System

Das Bifröst-System trackt Datenquellen und Experten für Attribution:

### Datenquellen (Bilder)
```json
{
  "_source": {
    "name": "iNaturalist",
    "url": "https://www.inaturalist.org/...",
    "license": "CC BY-NC 4.0",
    "author": "MushroomObserver"
  }
}
```

### Experten (Datenfelder)
Experten werden pro Perspektive definiert und im Frontend via `data-field-experts` Attribut übergeben:

```json
{
  "_experts": {
    "medicine": ["Paul Stamets", "Christopher Hobbs"],
    "identification": ["Alan Rockefeller", "Michael Kuo"]
  }
}
```

### Bekannte Mykologen & Kontakte
| Name | Spezialisierung | Kontakt |
|------|-----------------|---------|
| Paul Stamets | Medizinische Pilze, Kultivierung | fungi.com, info@fungi.com |
| Alan Rockefeller | Psilocybe-Bestimmung, Fotografie | alanrockefeller@gmail.com, @alan_rockefeller |
| Michael Kuo | Pilz-Identifikation, Morcheln | mushroomexpert.com |
| Christopher Hobbs | TCM & Heilpilze | christopherhobbs.com |
| Tradd Cotter | Pilz-Kultivierung, Mykoremediation | mushroommountain.com |
| Michael Wood | Kalifornische Pilze | mykoweb.com, webmaster@mykoweb.com |
| David Arora | Feldführer-Autor | (Mushrooms Demystified) |
| Gary Lincoff † | Audubon Field Guide | (Legacy) |

### Organisationen
| Organisation | Kontakt |
|--------------|---------|
| NAMA (North American Mycological Association) | namyco.org, COO@namyco.org |
| iNaturalist | inaturalist.org |
| Mushroom Observer | mushroomobserver.org |
| MSSF (Mycological Society of San Francisco) | mssf.org |

### Vollständige Experten-Datenbank
Siehe `data/bifroest-experts.json` für:
- Detaillierte Kontaktinformationen
- Social Media Links
- Publikationslisten
- Perspektiven-Zuordnung
- Bild-Quellen mit Lizenzinfos

## 📦 Daten-Hierarchie

### universe-index.json (v2.0 SEO-optimiert)
```json
{
  "version": "2.0",
  "generated": "2025-12-25T...",
  "total": 27,
  "kingdoms": {
    "fungi": { 
      "name": "Fungi", 
      "icon": "🍄", 
      "count": 27,
      "featured": ["hericium-erinaceus", "ganoderma-lucidum"]
    }
  },
  "species": [
    { 
      "slug": "hericium-erinaceus",
      "name": "Igelstachelbart",
      "kingdom": "fungi",
      "tagline": "Neuroregeneration, Alzheimer-Unterstützung",
      "badges": ["Vitalpilz", "essbar"],
      "quick_facts": { "edibility": "essbar", "medicinal": true },
      "engagement_score": 95
    }
  ]
}
```

### {species}/index.json (Core)
```json
{
  "id": "hericium-erinaceus",
  "slug": "hericium-erinaceus",
  "name": "Igelstachelbart",
  "scientific_name": "Hericium erinaceus",
  "description": "Der Igelstachelbart..."
}
```

### {species}/{perspective}.json
```json
{
  "primary_medicinal_uses": ["Neuroregeneration", "Alzheimer-Unterstuetzung"],
  "traditional_medicine_systems": ["TCM", "Japanische Medizin"],
  "active_compounds": [
    {"name": "Erinacine", "effects": ["Nervenwachstumsfaktor-Stimulation"]}
  ]
}
```

## 🔄 Build-Pipeline

```bash
npm run validate      # Zod-Schema-Validierung aller JSONs
npm run build:index   # SEO-Index regenerieren (build-index.js v2.0)
```

## 🔄 SSR-Integration

```typescript
import { getItem, searchItems, loadAllItems } from './server/data';

// Alle Items laden (mit gemergten Perspektiven-Feldern)
const items = await loadAllItems();

// Einzelnes Item  
const item = await getItem('hericium-erinaceus');

// Suche
const results = await searchItems({ query: 'vitalpilz', limit: 20 });
```

## 📐 Perspektiven-Schema

Jede Perspektive hat ein Blueprint in `config/schema/perspektiven/blueprints/`:

| Perspektive | Typische Felder |
|-------------|-----------------|
| medicine | primary_medicinal_uses, active_compounds, clinical_evidence_level |
| safety | edibility_status, toxicity_level, confusion_risk_level |
| culinary | culinary_rating, flavor_profile, best_cooking_methods |
| ecology | ecological_role, habitat_primary, fruiting_season |
| identification | cap_shape, spore_print_color, key_differentiating_features |
const chemistry = await loadPerspective('steinpilz', 'chemistry');
```

## 📊 Daten-Typen für Morphs

Die Datenstruktur bestimmt automatisch welcher Morph verwendet wird:

| Struktur | → Morph |
|----------|---------|
| `{status, variant}` | badge |
| `{rating, max}` | rating |
| `{value, max}` | progress |
| `{min, max}` | range |
| `[{axis, value}]` | radar |
| `[{label, value}]` | bar |
| `[{date, event}]` | timeline |
| `[numbers...]` | sparkline |

```json
{
  "id": "animalia-001",
  "slug": "alpine-marmot",
  "name": "Alpenmurmeltier",
  "scientific_name": "Marmota marmota",
  "image": "data/animalia/alpine-marmot/hauptbild.jpg",
  "description": "Das Alpenmurmeltier ist ein Nagetier...",
  "perspectives": [
    "conservation",
    "ecology",
    "identification"
  ]
}
```

---

## Perspektiven-Datei Format

Jede Perspektive ist eine JSON-Datei mit Feldern die dem Blueprint entsprechen:

```json
// alpine-marmot/ecology.json
{
  "habitat_types": ["alpine meadows", "rocky slopes"],
  "elevation_range": { "min": 800, "max": 3200, "unit": "m" },
  "diet_composition": [
    { "label": "Grasses", "value": 60 },
    { "label": "Herbs", "value": 30 },
    { "label": "Insects", "value": 10 }
  ],
  "predators": ["golden eagle", "red fox", "wolf"]
}
```

---

## Workflow

### 1. Neue Spezies erstellen

```bash
# Ordner erstellen
mkdir data/fungi/steinpilz

# index.json erstellen
echo '{"id":"fungi-001","slug":"steinpilz","name":"Steinpilz",...}' > data/fungi/steinpilz/index.json

# Perspektiven-JSONs erstellen (siehe Blueprints)
```

### 2. Validieren

```bash
npm run validate
```

### 3. Index aktualisieren

```bash
npm run build:index
```

---

## 15 Perspektiven

| ID | Symbol | Fokus |
|----|--------|-------|
| chemistry | 🧪 | Inhaltsstoffe, Metabolite |
| conservation | 🛡️ | Schutzstatus, Bedrohungen |
| culinary | 🍳 | Essbarkeit, Zubereitung |
| cultivation | 🌱 | Anbau, Zucht |
| culture | 📜 | Mythologie, Geschichte |
| ecology | 🌿 | Habitat, Symbiosen |
| economy | 💰 | Markt, Handel |
| geography | 🗺️ | Verbreitung, Klima |
| identification | 🔍 | Bestimmungsmerkmale |
| interactions | 🔗 | Interaktionen |
| medicine | 💊 | Medizinische Nutzung |
| research | 📚 | Wissenschaft |
| safety | ⚠️ | Gefahren, Toxine |
| statistics | 📊 | Statistiken |
| temporal | ⏰ | Zeitliche Aspekte |

---

## Blueprints

Blueprints definieren die Struktur jeder Perspektive:

```
config/schema/perspektiven/blueprints/
├── chemistry.blueprint.yaml
├── conservation.blueprint.yaml
├── culinary.blueprint.yaml
├── ...
└── temporal.blueprint.yaml
```

Jedes Feld hat einen Morph-Typ Kommentar:

```yaml
habitat_types:  # morph: list
  - ""
elevation_range:  # morph: range
  min: 0
  max: 0
  unit: ""
```

---

## Lazy Loading (Skaliert bis 1000+ Einträge)

Das Frontend lädt Daten on-demand:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. App-Start                                                        │
│     └── universe-index.json (~10KB für 100 Spezies)                 │
│         ✓ name, slug, description, tags, perspectives[]             │
│         ✗ Keine Perspektiven-Daten                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Suche "Steinpilz"                                                │
│     └── Durchsucht NUR Index (0 zusätzliche Requests)               │
│         → Ergebnis: 3 Treffer                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Perspektive "safety" aktiviert                                   │
│     └── ensureFullData(['safety'])                                  │
│         ✓ Lädt safety.json für 3 Treffer (3 Requests)              │
│         ✗ NICHT: ecology.json, cultivation.json etc.                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Weitere Perspektive "cultivation" hinzugefügt                    │
│     └── ensureFullData(['safety', 'cultivation'])                   │
│         ✓ safety bereits gecached (0 Requests)                     │
│         ✓ Lädt nur cultivation.json (3 neue Requests)              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Einzelansicht für "Steinpilz"                                    │
│     └── getBySlug('steinpilz')                                      │
│         ✓ Lädt ALLE Perspektiven für EINE Spezies                  │
│         ✓ Cache wird genutzt für bereits geladene                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Request-Vergleich

| Szenario | Naiver Ansatz | Optimiert |
|----------|---------------|-----------|
| 100 Items, Suche ohne Perspektive | 700 Requests | 0 Requests |
| 100 Items, 2 Perspektiven aktiv | 700 Requests | 200 Requests |
| 500 Items, 3 Perspektiven aktiv | 3500 Requests | 1500 Requests |
| Perspektive hinzufügen (gecached) | Alles neu | Nur neue Perspektive |

### API

```javascript
// Suche - nur Index, keine Perspektiven
const results = await dataSource.query({ search: 'pilz' });

// Selektiv Perspektiven nachladen (für Grid + Compare)
await dataSource.ensureFullData(['safety', 'cultivation']);

// Einzelansicht - alle Perspektiven einer Spezies
const full = await dataSource.getBySlug('steinpilz');

// Pagination für Infinite Scroll
const { items, hasMore } = await dataSource.loadMore(offset, limit);
```

---

## Typ-Erkennung (Data → Morph)

| Datenstruktur | Morph |
|---------------|-------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `[{label, value}]` | bar/pie |
| `[{axis, value}]` | radar |
| `[{date, event}]` | timeline |
| `{lat, lng}` | map |
| `{status, variant}` | badge |

---

## Siehe auch

- `scripts/CLAUDE.md` - Validierung und Index-Generierung
- `config/schema/perspektiven/blueprints/` - Perspektiven-Schemas
- `docs/DATEN_ERSTELLEN.md` - Ausführliche Anleitung
