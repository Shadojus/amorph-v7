# AMORPH v7 - Data

> JSON-Daten für biologische Spezies.

## 📁 Struktur

```
data/
├── universe-index.json     # Haupt-Index
├── fungi/
│   ├── index.json          # Kingdom-Index
│   └── psilocybe-cyanescens/
│       ├── index.json      # Core-Daten
│       └── *.json          # Perspektiven
├── plantae/
│   ├── index.json
│   └── deadly-nightshade/
└── animalia/
    ├── index.json
    └── alpine-marmot/
```

## 📦 Daten-Hierarchie

### universe-index.json
```json
{
  "kingdoms": ["fungi", "plantae", "animalia"],
  "version": "7.0"
}
```

### {kingdom}/index.json
```json
{
  "kingdom": "fungi",
  "items": [
    {"id": "psilocybe-cyanescens", "name": "Blauender Kahlkopf"}
  ]
}
```

### {species}/index.json (Core)
```json
{
  "id": "psilocybe-cyanescens",
  "name": "Blauender Kahlkopf",
  "wissenschaftlich": "Psilocybe cyanescens",
  "bild": "https://..."
}
```

### {species}/{perspective}.json
```json
{
  "conservation_status": {"status": "LC", "variant": "success"},
  "habitat": ["Totholz", "Parks", "Waldränder"],
  "fruiting_season": {...}
}
```

## 🔄 SSR-Integration

```typescript
import { getItem, searchItems } from './server';

const item = await getItem('psilocybe-cyanescens');
const results = await searchItems({ query: 'pilz' });
```

## universe-index.json Format

```json
{
  "version": "1.0",
  "generated": "2025-12-18T...",
  "total": 2,
  "kingdoms": {
    "fungi": { "name": "Fungi", "icon": "🍄", "count": 0 },
    "plantae": { "name": "Plantae", "icon": "🌿", "count": 1 },
    "animalia": { "name": "Animalia", "icon": "🦋", "count": 1 },
    "bacteria": { "name": "Bacteria", "icon": "🦠", "count": 0 }
  },
  "species": [
    {
      "id": "animalia-001",
      "slug": "alpine-marmot",
      "name": "Alpenmurmeltier",
      "scientific_name": "Marmota marmota",
      "kingdom": "animalia",
      "perspectives": ["conservation", "ecology", ...]
    }
  ]
}
```

---

## Spezies index.json Format

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
