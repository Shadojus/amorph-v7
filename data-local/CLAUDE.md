# AMORPH v7 - Data

> ⚠️ **IMPORTANT**: Species data is now stored in **BIFRÖST Pocketbase**, NOT in local files!

## 🔗 Data Source

All species data (91 items: 28 fungi, 35 plantae, 28 therion) is loaded from:

```
http://localhost:8090/api/collections/species/records
```

### Local Files (kept for reference/fallback)
```
data/
├── universe-index.json     # Navigation index
├── bifroest-experts.json   # Experts database
├── CLAUDE.md               # This file
└── README.md               # Documentation
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

- **91 species total** in Pocketbase
  - 28 fungi (mushrooms)
  - 35 plantae (plants)
  - 28 therion (animals)
- **15 perspectives** per species
- **Admin**: http://localhost:8090/_/

## 🔗 Bifröst Attribution System

The Bifröst system tracks data sources and experts for attribution:

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
