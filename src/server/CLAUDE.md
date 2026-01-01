# AMORPH v7 - Server Module

> SSR-Module für Config und Data Loading mit **Pocketbase Integration**.

## 📁 Struktur

```
server/
├── index.ts      # Re-Exports
├── config.ts     # YAML Config Loader (~200 Zeilen)
├── data.ts       # Data Loader + Pocketbase/Local Fallback (~380 Zeilen)
└── bifroest.ts   # Pocketbase Client für Species (~150 Zeilen)
```

## 🔗 Pocketbase Integration (Januar 2026)

**Alle Species-Daten kommen aus Pocketbase!**

```typescript
// Env vars (in Astro config oder .env)
POCKETBASE_URL=http://localhost:8090
DATA_SOURCE=pocketbase  // 'pocketbase' | 'local' | 'auto'
```

### bifroest.ts - Pocketbase Client

```typescript
import { loadSpeciesFromBifroest, loadSpeciesBySlug } from './bifroest';

// Load all species for a category
const species = await loadSpeciesFromBifroest('fungi');
// Returns ItemData[] with all 15 perspectives merged

// Load single species
const item = await loadSpeciesBySlug('hericium-erinaceus');
```

### 15 Perspektiven (aus Pocketbase JSON-Feldern)
```typescript
const PERSPECTIVES = [
  'identification', 'ecology', 'chemistry', 'medicine', 'safety',
  'culinary', 'cultivation', 'conservation', 'culture', 'economy',
  'geography', 'interactions', 'research', 'statistics', 'temporal'
];
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
