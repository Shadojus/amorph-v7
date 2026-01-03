# AMORPH v7 - Data

> ⚠️ **IMPORTANT**: Species data is now stored in **BIFROEST Pocketbase**, NOT in local files!

## 🔗 Data Source

All species data is loaded from PocketBase:

```
http://localhost:8090/api/collections/{collection}/records
```

### Collections Overview

| Collection | Items | Port | Domain |
|------------|-------|------|--------|
| species | 91 | 4321/4322/4323 | fungi/plantae/therion |
| paleontology | 91 | 4324 | fossils |
| mineralogy | 12 | 4325 | minerals |
| tectonics | 13 | 4326 | geology |
| microbiology | 3 | 4327 | microbes |
| virology | 3 | 4328 | viruses |
| genetics | 3 | 4329 | genes |
| anatomy | 3 | 4330 | organs |
| chemistry | 3 | 4331 | compounds |
| physics | 3 | 4332 | particles |
| astronomy | 3 | 4333 | celestial |
| informatics | 3 | 4334 | IT systems |
| ai | 3 | 4335 | AI models |
| biotech | 3 | 4336 | biotech |
| sociology | 3 | 4337 | social |

### Local Files (kept for reference/mockdata)
```
data/
├── universe-index.json     # Navigation index
├── bifroest-experts.json   # Experts database
├── CLAUDE.md               # This file
├── README.md               # Documentation
│
├── fungi/                  # 28 species (mockdata)
├── plantae/                # 35 species (mockdata)
├── therion/                # 28 species (mockdata)
├── paleontology/           # 91 fossils (mockdata)
├── mineralogy/             # 12 minerals (mockdata)
├── tectonics/              # 13 structures (mockdata)
│
├── microbiology/           # 3 items (mockdata)
├── virology/               # 3 items (mockdata)
├── genetics/               # 3 items (mockdata)
├── anatomy/                # 3 items (mockdata)
├── chemistry/              # 3 items (mockdata)
├── physics/                # 3 items (mockdata)
├── astronomy/              # 3 items (mockdata)
├── informatics/            # 3 items (mockdata)
├── ai/                     # 3 items (mockdata)
├── biotech/                # 3 items (mockdata)
└── sociology/              # 3 items (mockdata)
```

### Pocketbase Species Collection (25 fields)
| Field | Type | Description |
|-------|------|-------------|
| name | text | Display name |
| slug | text | URL slug (unique) |
| category | select | fungi/plantae/therion |
| description | text | Short description |
| scientific_name | text | Latin name |
| image | text | Image filename |
| identification | json | Perspective data |
| ecology | json | Perspective data |
| chemistry | json | Perspective data |
| medicine | json | Perspective data |
| safety | json | Perspective data |
| culinary | json | Perspective data |
| cultivation | json | Perspective data |
| conservation | json | Perspective data |
| culture | json | Perspective data |
| economy | json | Perspective data |
| geography | json | Perspective data |
| interactions | json | Perspective data |
| research | json | Perspective data |
| statistics | json | Perspective data |
| temporal | json | Perspective data |
| sources | json | Data sources |
| expert_id | relation | Link to expert |

## 🖼️ Images

Species images are stored locally in:
```
public/images/species/{category}/{slug}/
```

## 📊 Current Data (January 2026)

### Original Domains (Full Data)
- **91 species** in `species` collection
  - 28 fungi (mushrooms)
  - 35 plantae (plants)
  - 28 therion (animals)
- **91 fossils** in `paleontology` collection
- **12 minerals** in `mineralogy` collection
- **13 structures** in `tectonics` collection

### New Domains (Mockdata - 3 items each)
| Domain | Collection | Items |
|--------|------------|-------|
| 🦠 Microbiology | microbiology | E. coli, S. aureus, B. subtilis |
| 🧬 Virology | virology | Influenza A, SARS-CoV-2, HIV-1 |
| 🧬 Genetics | genetics | TP53, BRCA1, APOE |
| 🫀 Anatomy | anatomy | Heart, Brain, Liver |
| ⚗️ Chemistry | chemistry | Water, Glucose, Aspirin |
| ⚛️ Physics | physics | Electron, Photon, Higgs Boson |
| 🌟 Astronomy | astronomy | Sun, Earth, Jupiter |
| 💻 Informatics | informatics | TCP/IP, HTTP/3, Kubernetes |
| 🤖 AI | ai | GPT-4, Claude 3, DALL-E 3 |
| 🧪 Biotech | biotech | CRISPR-Cas9, mRNA Vaccines, Insulin Production |
| 👥 Sociology | sociology | Family, Corporation, Democracy |

- **15 perspectives** per species (original)
- **3-10 perspectives** per item (new domains)
- **Admin**: http://localhost:8090/_/

## 🔗 Bifroest Attribution System

The Bifroest system tracks data sources and experts for attribution:

### Data Sources (Images)
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

### Experts (Data Fields)
Experts are defined per perspective and passed to the frontend via `data-field-experts` attribute:

```json
{
  "_experts": {
    "medicine": ["Paul Stamets", "Christopher Hobbs"],
    "identification": ["Alan Rockefeller", "Michael Kuo"]
  }
}
```

### Known Mycologists & Contacts
| Name | Specialization | Contact |
|------|----------------|---------|
| Paul Stamets | Medicinal Mushrooms, Cultivation | fungi.com, info@fungi.com |
| Alan Rockefeller | Psilocybe Identification, Photography | alanrockefeller@gmail.com, @alan_rockefeller |
| Michael Kuo | Mushroom Identification, Morels | mushroomexpert.com |
| Christopher Hobbs | TCM & Medicinal Mushrooms | christopherhobbs.com |
| Tradd Cotter | Mushroom Cultivation, Mycoremediation | mushroommountain.com |
| Michael Wood | California Mushrooms | mykoweb.com, webmaster@mykoweb.com |
| David Arora | Field Guide Author | (Mushrooms Demystified) |
| Gary Lincoff † | Audubon Field Guide | (Legacy) |

### Organizations
| Organization | Contact |
|--------------|---------|
| NAMA (North American Mycological Association) | namyco.org, COO@namyco.org |
| iNaturalist | inaturalist.org |
| Mushroom Observer | mushroomobserver.org |
| MSSF (Mycological Society of San Francisco) | mssf.org |

### Complete Experts Database
See `data/bifroest-experts.json` for:
- Detailed contact information
- Social media links
- Publication lists
- Perspective assignments
- Image sources with license info

## 📦 Data Hierarchy

### universe-index.json (v2.0 SEO-optimized)
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
      "name": "Lion's Mane",
      "kingdom": "fungi",
      "tagline": "Neuroregeneration, Alzheimer support",
      "badges": ["Medicinal mushroom", "edible"],
      "quick_facts": { "edibility": "edible", "medicinal": true },
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
  "name": "Lion's Mane",
  "scientific_name": "Hericium erinaceus",
  "description": "Lion's Mane..."
}
```

### {species}/{perspective}.json
```json
{
  "primary_medicinal_uses": ["Neuroregeneration", "Alzheimer support"],
  "traditional_medicine_systems": ["TCM", "Japanese Medicine"],
  "active_compounds": [
    {"name": "Erinacine", "effects": ["Nerve growth factor stimulation"]}
  ]
}
```

## 🔄 Build Pipeline

```bash
npm run validate      # Zod schema validation of all JSONs
npm run build:index   # Regenerate SEO index (build-index.js v2.0)
```

## 🔄 SSR Integration

```typescript
import { getItem, searchItems, loadAllItems } from './server/data';

// Load all items (with merged perspective fields)
const items = await loadAllItems();

// Single item  
const item = await getItem('hericium-erinaceus');

// Search
const results = await searchItems({ query: 'medicinal mushroom', limit: 20 });
```

## 📐 Perspectives Schema

Each perspective has a blueprint in `config/schema/perspektiven/blueprints/`:

| Perspective | Typical Fields |
|-------------|----------------|
| medicine | primary_medicinal_uses, active_compounds, clinical_evidence_level |
| safety | edibility_status, toxicity_level, confusion_risk_level |
| culinary | culinary_rating, flavor_profile, best_cooking_methods |
| ecology | ecological_role, habitat_primary, fruiting_season |
| identification | cap_shape, spore_print_color, key_differentiating_features |
const chemistry = await loadPerspective('king-bolete', 'chemistry');
```

## 📊 Data Types for Morphs

The data structure automatically determines which morph is used:

| Structure | → Morph |
|-----------|---------|
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
  "name": "Alpine Marmot",
  "scientific_name": "Marmota marmota",
  "image": "data/animalia/alpine-marmot/main-image.jpg",
  "description": "The Alpine Marmot is a rodent...",
  "perspectives": [
    "conservation",
    "ecology",
    "identification"
  ]
}
```

---

## Perspective File Format

Each perspective is a JSON file with fields matching the blueprint:

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

### 1. Create New Species

```bash
# Create folder
mkdir data/fungi/king-bolete

# Create index.json
echo '{"id":"fungi-001","slug":"king-bolete","name":"King Bolete",...}' > data/fungi/king-bolete/index.json

# Create perspective JSONs (see blueprints)
```

### 2. Validate

```bash
npm run validate
```

### 3. Update Index

```bash
npm run build:index
```

---

## 15 Perspectives

| ID | Symbol | Focus |
|----|--------|-------|
| chemistry | 🧪 | Compounds, metabolites |
| conservation | 🛡️ | Protection status, threats |
| culinary | 🍳 | Edibility, preparation |
| cultivation | 🌱 | Growing, breeding |
| culture | 📜 | Mythology, history |
| ecology | 🌿 | Habitat, symbioses |
| economy | 💰 | Market, trade |
| geography | 🗺️ | Distribution, climate |
| identification | 🔍 | Identification features |
| interactions | 🔗 | Interactions |
| medicine | 💊 | Medicinal use |
| research | 📚 | Science |
| safety | ⚠️ | Dangers, toxins |
| statistics | 📊 | Statistics |
| temporal | ⏰ | Temporal aspects |

---

## Blueprints

Blueprints define the structure of each perspective:

```
config/schema/perspektiven/blueprints/
├── chemistry.blueprint.yaml
├── conservation.blueprint.yaml
├── culinary.blueprint.yaml
├── ...
└── temporal.blueprint.yaml
```

Each field has a morph type comment:

```yaml
habitat_types:  # morph: list
  - ""
elevation_range:  # morph: range
  min: 0
  max: 0
  unit: ""
```

---

## Lazy Loading (Scales to 1000+ Entries)

The frontend loads data on-demand:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. App Start                                                        │
│     └── universe-index.json (~10KB for 100 species)                 │
│         ✓ name, slug, description, tags, perspectives[]             │
│         ✗ No perspective data                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Search "King Bolete"                                             │
│     └── Searches ONLY index (0 additional requests)                 │
│         → Result: 3 matches                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Perspective "safety" activated                                   │
│     └── ensureFullData(['safety'])                                  │
│         ✓ Loads safety.json for 3 matches (3 requests)             │
│         ✗ NOT: ecology.json, cultivation.json etc.                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Additional perspective "cultivation" added                       │
│     └── ensureFullData(['safety', 'cultivation'])                   │
│         ✓ safety already cached (0 requests)                       │
│         ✓ Loads only cultivation.json (3 new requests)             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Detail view for "King Bolete"                                    │
│     └── getBySlug('king-bolete')                                    │
│         ✓ Loads ALL perspectives for ONE species                   │
│         ✓ Cache is used for already loaded                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Comparison

| Scenario | Naive Approach | Optimized |
|----------|----------------|-----------|
| 100 items, search without perspective | 700 requests | 0 requests |
| 100 items, 2 perspectives active | 700 requests | 200 requests |
| 500 items, 3 perspectives active | 3500 requests | 1500 requests |
| Add perspective (cached) | Everything new | Only new perspective |

### API

```javascript
// Search - index only, no perspectives
const results = await dataSource.query({ search: 'mushroom' });

// Selectively load perspectives (for Grid + Compare)
await dataSource.ensureFullData(['safety', 'cultivation']);

// Detail view - all perspectives of one species
const full = await dataSource.getBySlug('king-bolete');

// Pagination for infinite scroll
const { items, hasMore } = await dataSource.loadMore(offset, limit);
```

---

## Type Detection (Data → Morph)

| Data Structure | Morph |
|----------------|-------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `[{label, value}]` | bar/pie |
| `[{axis, value}]` | radar |
| `[{date, event}]` | timeline |
| `{lat, lng}` | map |
| `{status, variant}` | badge |

---

## See Also

- `scripts/CLAUDE.md` - Validation and index generation
- `config/schema/perspektiven/blueprints/` - Perspective schemas
- `docs/DATEN_ERSTELLEN.md` - Detailed guide

---

## 🚀 How to Add New Data

### A) Neuen Eintrag zu bestehender Domain hinzufügen

1. **Ordner erstellen** in `data/{domain}/{slug}/`

2. **index.json erstellen** mit Basis-Struktur:
```json
{
  "id": "unique-id",
  "slug": "url-slug",
  "name": "Display Name",
  "scientific_name": "Scientific Name",
  "kingdom": "domain-name",
  "kingdom_icon": "🔬",
  "description": "Kurze Beschreibung...",
  "image": "thumbnail.jpg",
  "perspectives": ["perspective1", "perspective2"],
  "quick_facts": [
    {"icon": "📏", "label": "Size", "value": "10 cm"}
  ],
  "badges": [
    {"icon": "✅", "label": "Status", "status": "Active", "variant": "success"}
  ]
}
```

3. **Perspektiven-Daten hinzufügen** - Felder gemäß Blueprint

4. **In PocketBase importieren** via seed-script oder Admin UI

### B) Neue Domain erstellen (Mockdata)

1. **Domain-Ordner erstellen:**
```bash
data/newdomain/
├── item-1/
│   └── index.json
├── item-2/
│   └── index.json
└── item-3/
    └── index.json
```

2. **Jede index.json mit vollständigen Daten:**
```json
{
  "id": "item-1",
  "slug": "item-1-slug",
  "name": "Item 1 Name",
  "scientific_name": "Itemus primus",
  "kingdom": "newdomain",
  "kingdom_icon": "🔬",
  "description": "Beschreibung des Items...",
  "image": "thumbnail.jpg",
  
  "perspectives": ["perspective1", "perspective2", "perspective3"],
  
  "quick_facts": [
    {"icon": "📊", "label": "Type", "value": "Example"},
    {"icon": "📍", "label": "Location", "value": "Global"}
  ],
  
  "badges": [
    {"icon": "✅", "label": "Status", "status": "Active", "variant": "success"},
    {"icon": "⭐", "label": "Rating", "status": "High", "variant": "primary"}
  ],
  
  "categories": ["Category A", "Category B"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  
  "engagement_score": 85,
  
  "_sources": [
    {
      "name": "Source Name",
      "url": "https://example.com/source",
      "accessed": "2026-01-01"
    }
  ],
  
  "perspective1": {
    "field1": "value1",
    "field2": {"min": 0, "max": 100, "unit": "units"}
  },
  
  "perspective2": {
    "field1": ["list", "of", "items"],
    "field2": {"status": "Active", "variant": "success"}
  }
}
```

3. **Blueprints erstellen** in `config/schema/perspektiven/blueprints/`

4. **Perspektiven registrieren** in `config/schema/perspektiven/index.yaml`

5. **PocketBase Collection erstellen** via setup-script

6. **Daten seeden:**
```bash
cd bifroest-platform
node scripts/seed-new-domains.mjs
```

### C) Daten validieren

```bash
# Alle Daten validieren
npm run validate

# Einzelne Datei prüfen
npm run validate -- data/newdomain/item-1/index.json
```

### D) Morph-Strukturen Referenz

| Morph | Struktur | Beispiel |
|-------|----------|----------|
| text | `""` | `"Hello World"` |
| number | `0` | `42` |
| boolean | `false` | `true` |
| tag | `""` | `"Category"` |
| badge | `{status, variant}` | `{"status": "Active", "variant": "success"}` |
| range | `{min, max, unit}` | `{"min": 0, "max": 100, "unit": "cm"}` |
| stats | `{total, count, min, max, avg}` | `{"total": 500, "count": 10, "min": 10, "max": 100, "avg": 50}` |
| list | `[""]` | `["Item1", "Item2", "Item3"]` |
| bar | `[{label, value}]` | `[{"label": "A", "value": 30}, {"label": "B", "value": 70}]` |
| radar | `[{axis, value}]` | `[{"axis": "Speed", "value": 80}, {"axis": "Power", "value": 60}]` |
| timeline | `[{date, event}]` | `[{"date": "2020", "event": "Discovery"}]` |
| rating | `{rating, max}` | `{"rating": 4, "max": 5}` |
| progress | `{value, max, unit}` | `{"value": 75, "max": 100, "unit": "%"}` |
