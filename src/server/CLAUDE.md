# AMORPH v7 - Server Module

> SSR-Module für Config und Data Loading mit **Pocketbase Integration**.

## 📁 Struktur

```
server/
├── index.ts      # Re-Exports
├── config.ts     # YAML Config Loader (~200 Zeilen)
├── data.ts       # Data Loader + Pocketbase/Local Fallback (~380 Zeilen)
└── bifroest.ts   # Pocketbase Client v3 (~400 Zeilen)
```

## 🔗 Pocketbase Integration v3 (Januar 2026)

**Multi-Domain Support für Biology, Geology UND 11 neue Wissenschafts-Domains!**

```typescript
// Env vars (in Astro config oder .env)
POCKETBASE_URL=http://localhost:8090
DATA_SOURCE=pocketbase  // 'pocketbase' | 'local' | 'auto'
```

### bifroest.ts v3 - Pocketbase Client

```typescript
import { 
  loadByCollection,
  loadByDomain,
  loadSpeciesByCategory,
  loadSpeciesBySlug,
  loadItemBySlug
} from './bifroest';

// Load by collection
const fungi = await loadByCollection('fungi');
const minerals = await loadByCollection('mineralogy');
const bacteria = await loadByCollection('microbiology');

// Load by domain  
const biology = await loadByDomain('biology');   // fungi + plantae + therion
const geology = await loadByDomain('geology');   // paleontology + mineralogy + tectonics

// Load single item (searches all collections)
const item = await loadSpeciesBySlug('hericium-erinaceus');
const fossil = await loadItemBySlug('paleontology', 'tyrannosaurus-rex');
const ecoli = await loadItemBySlug('microbiology', 'escherichia-coli');
```

### Collections (17 Domains)

| Domain | Collection | Port | Items |
|--------|------------|------|-------|
| 🍄 Fungi | species | 4321 | 28 |
| 🌱 Plantae | species | 4322 | 35 |
| 🦁 Therion | species | 4323 | 28 |
| 🦕 Paleontology | paleontology | 4324 | 91 |
| 💎 Mineralogy | mineralogy | 4325 | 12 |
| ⛰️ Tectonics | tectonics | 4326 | 13 |
| 🦠 Microbiology | microbiology | 4327 | 3 |
| 🧬 Virology | virology | 4328 | 3 |
| 🧬 Genetics | genetics | 4329 | 3 |
| 🫀 Anatomy | anatomy | 4330 | 3 |
| ⚗️ Chemistry | chemistry | 4331 | 3 |
| ⚛️ Physics | physics | 4332 | 3 |
| 🌟 Astronomy | astronomy | 4333 | 3 |
| 💻 Informatics | informatics | 4334 | 3 |
| 🤖 AI | ai | 4335 | 3 |
| 🧪 Biotech | biotech | 4336 | 3 |
| 👥 Sociology | sociology | 4337 | 3 |

### Perspectives per Collection

| Collection | Perspectives (count) |
|------------|---------------------|
| fungi/plantae/therion | identification, ecology, chemistry, ... (15) |
| paleontology | taxonomy_paleo, morphology, chronology, ... (11) |
| mineralogy | classification, chemistry, crystallography, ... (11) |
| tectonics | chronology, stratigraphy, plate_tectonics, ... (6) |
| microbiology | taxonomy_micro, metabolism, pathogenicity, ... (9) |
| virology | taxonomy_viro, replication, epidemiology, ... (9) |
| genetics | gene_structure, inheritance, mutations, ... (8) |
| anatomy | gross_anatomy, histology, physiology, ... (9) |
| chemistry | atomic_structure, bonding, thermodynamics, ... (9) |
| physics | mechanics, electromagnetism, quantum, ... (9) |
| astronomy | classification_astro, orbital, composition, ... (9) |
| informatics | architecture, protocols, security_info, ... (9) |
| ai | model_architecture, training, capabilities, ... (9) |
| biotech | methodology, applications_biotech, products, ... (10) |
| sociology | structure, institutions, demographics, ... (10) |

### ItemData Extensions

```typescript
interface ItemData {
  // ... standard fields
  _kingdom?: string;       // Legacy (Fungi, Plantae)
  _collection?: string;    // fungi, mineralogy, microbiology, etc.
  _domain?: 'biology' | 'geology' | 'lifescience' | 'physical' | 'tech' | 'social';
}
```

## 📦 config.ts - Config Loader (200 Zeilen)

Lädt YAML-Konfiguration aus `config/` Ordner.

### API
```typescript
import { loadConfig, getConfig, getAllPerspectives } from './server';

await loadConfig();  // Einmal beim Start
const config = getConfig();
const perspectives = getAllPerspectives();
```

### Perspektiven (15 Stück)
```typescript
interface Perspective {
  id: string;           // 'culinary'
  name: string;         // 'Kulinarik'
  symbol: string;       // '🍳'
  color?: string;       // '#f59e0b'
}
```

## 📦 data.ts - Data Loader (~380 Zeilen)

Orchestriert Datenladung - **Pocketbase zuerst, lokaler Fallback bei Bedarf**.

### Daten-Hierarchie
```
1. Pocketbase API (http://localhost:8090)
   └── species collection (91 records)
       ├── fungi (28)
       ├── plantae (35)
       └── therion (28)

2. Local Fallback (wenn DATA_SOURCE='auto' und Pocketbase down)
   └── data/{category}/{species-slug}/
       ├── index.json
       └── {perspective}.json
```

### API
```typescript
import { 
  loadAllItems,     // Lädt von Pocketbase
  searchItems,
  getItem,          // Einzelnes Item
  getItems,         // Mehrere Items (für Compare)
  getLoadErrors,    // Gibt Ladefehler zurück
  invalidateCache   // Cache invalidieren
} from './server/data';
```

### Search API
```typescript
const { items, total, perspectivesWithData } = await searchItems({
  query: 'pilz',
  perspectives: ['culinary', 'safety'],
  limit: 20
});
```

### Response Types
```typescript
interface SearchResult {
  items: ItemData[];
  total: number;
  perspectivesWithData: string[];
}
```

### Security

- Path Traversal Prevention bei Slugs
- Validierung aller Eingaben via `core/security.ts`

## 💡 Usage in Astro Pages

```astro
---
import { loadConfig, getAllPerspectives } from '../server/config';
import { searchItems, getItem } from '../server/data';

await loadConfig();  // Einmalig, wird gecacht

const perspectives = getAllPerspectives();
const { items } = await searchItems({ query: '', limit: 50 });
const steinpilz = await getItem('steinpilz');
---
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POCKETBASE_URL` | `http://localhost:8090` | Pocketbase API URL |
| `DATA_SOURCE` | `pocketbase` | `pocketbase`, `local`, or `auto` |

### DATA_SOURCE Options
- **pocketbase**: Only load from Pocketbase (default, recommended)
- **local**: Only load from local JSON files (legacy mode)
- **auto**: Try Pocketbase first, fallback to local if unavailable

---

## 🚀 How to Add New Server Components

### A) Neue Collection zu data.ts hinzufügen

1. **Collection-Mapping erweitern** in `data.ts`:

```typescript
const COLLECTION_MAP: Record<string, string> = {
  fungi: 'species',
  plantae: 'species',
  therion: 'species',
  paleontology: 'paleontology',
  mineralogy: 'mineralogy',
  // Neue Collection hinzufügen:
  newdomain: 'newdomain',
};
```

2. **Domain-Grouping erweitern**:

```typescript
const DOMAIN_COLLECTIONS: Record<string, string[]> = {
  biology: ['fungi', 'plantae', 'therion'],
  geology: ['paleontology', 'mineralogy', 'tectonics'],
  // Neue Domain-Gruppe hinzufügen:
  newgroup: ['newdomain', 'otherdomain'],
};
```

### B) Neue Perspektiven zu config.ts hinzufügen

1. **DOMAIN_COLORS erweitern**:

```typescript
export const DOMAIN_COLORS: Record<string, string> = {
  fungi: '#22c55e',
  // Neue Farbe hinzufügen:
  newdomain: '#FF6B35',
};
```

2. **perspektiven/index.yaml erweitern**:

```yaml
newdomain:
  - perspective1
  - perspective2
  - perspective3
```

### C) PocketBase Client erweitern (bifroest.ts)

1. **Neue Loader-Funktion**:

```typescript
export async function loadNewDomainItems(filter?: string): Promise<ItemData[]> {
  return loadByCollection('newdomain', filter);
}
```

2. **Transformation erweitern** falls nötig:

```typescript
function transformPocketbaseItem(record: any, collection: string): ItemData {
  const item: ItemData = {
    // Standard-Felder
    id: record.id,
    slug: record.slug,
    name: record.name,
    // ...
    
    // Collection-spezifische Transformationen:
    _collection: collection,
    _domain: getDomainForCollection(collection),
  };
  
  // Spezielle Behandlung für newdomain:
  if (collection === 'newdomain') {
    item.specialField = record.special_field;
  }
  
  return item;
}
```

### D) API-Endpoint hinzufügen

In `src/pages/api/`:

```typescript
// src/pages/api/newdomain/[slug].ts
import type { APIRoute } from 'astro';
import { loadItemBySlug } from '../../../server/bifroest';
import { validateSlug } from '../../../core/security';

export const GET: APIRoute = async ({ params }) => {
  const slug = validateSlug(params.slug || '');
  if (!slug) {
    return new Response('Invalid slug', { status: 400 });
  }
  
  const item = await loadItemBySlug('newdomain', slug);
  if (!item) {
    return new Response('Not found', { status: 404 });
  }
  
  return new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```
