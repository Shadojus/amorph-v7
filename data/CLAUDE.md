# Data

Modulare JSON-Daten für AMORPH - 4 Kingdoms × 15 Perspektiven.

## Struktur

```
data/
├── universe-index.json           ← Haupt-Index (Frontend lädt diese)
├── animalia/
│   ├── index.json                ← Kingdom-Index
│   └── alpine-marmot/            ← 1 Spezies
│       ├── index.json            ← Core-Daten
│       └── *.json                ← Perspektiven
├── bacteria/
│   └── index.json                ← Kingdom-Index (leer)
├── fungi/
│   ├── index.json                ← Kingdom-Index
│   └── psilocybe-cyanescens/     ← 1 Spezies
│       ├── index.json            ← Core-Daten
│       ├── chemistry.json
│       ├── culture.json
│       ├── ecology.json
│       ├── identification.json
│       ├── medicine.json
│       ├── safety.json
│       └── temporal.json
└── plantae/
    ├── index.json                ← Kingdom-Index
    └── deadly-nightshade/        ← 1 Spezies
        ├── index.json
        └── *.json                ← Perspektiven
```

---

## Aktuelle Daten

| Kingdom | Spezies | Perspektiven |
|---------|---------|--------------|
| Animalia | alpine-marmot (Alpenmurmeltier) | 10 |
| Fungi | psilocybe-cyanescens (Blauender Kahlkopf) | 7 |
| Plantae | deadly-nightshade (Tollkirsche) | 7 |
| Bacteria | - | 0 |

**Gesamt**: 3 Spezies, 24 Perspektiven-Dateien

---

## SSR-Integration (NEU)

Die Astro SSR-Layer (`src/lib/species.ts`) lädt Daten direkt aus diesen Ordnern:

```typescript
// Sucht in beiden Dateien:
data/{kingdom}/{slug}/index.json
data/{kingdom}/{slug}/data.json
```

---

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
