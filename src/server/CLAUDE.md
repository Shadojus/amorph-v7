# AMORPH v7 - Server Module

> SSR-Module für Config und Data Loading.

## 📁 Struktur

```
server/
├── index.ts     # Re-Exports
├── config.ts    # YAML Config Loader (200 Zeilen)
└── data.ts      # JSON Data Loader + Search (692 Zeilen)
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

Verfügbare Perspektiven:
- taxonomy, chemistry, ecology, cultivation, culinary
- safety, mythology, history, phenotype, medicinal
- psychoactive, conservation, identification, comparison, climate

## 📦 data.ts - Data Loader (692 Zeilen)

Lädt JSON-Daten aus `data/` Ordner mit Kingdom/Species/Perspective Struktur.

### Daten-Hierarchie
```
data/
├── fungi/                    # Kingdom
│   └── steinpilz/           # Species (Slug)
│       ├── species.json     # Basisdaten
│       └── perspectives/    # Perspektiven-Ordner
│           ├── culinary.json
│           └── safety.json
└── other_kingdom/
```

### API
```typescript
import { 
  loadAllItems,
  searchItems,
  getItem,          // Einzelnes Item
  getItems,         // Mehrere Items (für Compare)
  loadPerspective,  // Lädt eine Perspektive lazy
  loadPerspectives, // Lädt mehrere Perspektiven batch
  hasPerspective,   // Prüft ob Perspektive existiert
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

### Lazy Loading für Perspektiven
```typescript
// On-demand Perspektive laden (mit Caching)
const chemistry = await loadPerspective('psilocybe-cyanescens', 'chemistry');

// Batch: Mehrere Perspektiven laden
const perspMap = await loadPerspectives('steinpilz', ['chemistry', 'ecology']);
perspMap.get('ecology');  // Ecology-Daten oder undefined

// Prüfen ohne zu laden
const exists = await hasPerspective('steinpilz', 'culinary');
```

### Response Types
```typescript
interface SearchResult {
  items: ItemData[];
  total: number;
  perspectivesWithData: string[];
}
```

### Such-Features

- **Text-Suche**: In `name`, `wissenschaftlich`, allen String-Feldern
- **Perspektiven-Suche**: Suchbegriff wird gegen Perspektiven-Namen/IDs gematcht
- **Perspektiven-Filter**: Items mit Daten für gewählte Perspektiven
- **Pagination**: `limit` und `offset` Parameter
- **perspectivesWithData**: Welche Perspektiven haben Daten

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
