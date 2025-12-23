# AMORPH v7 - Server Module

> SSR-Module für Config und Data Loading.

## 📁 Struktur

```
server/
├── config.ts    # YAML Config Loader
├── data.ts      # JSON Data Loader + Search
└── index.ts     # Re-Exports
```

## 📦 config.ts - Config Loader

Lädt YAML-Konfiguration aus `config/` Symlink.

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

## 📦 data.ts - Data Loader

Lädt JSON-Daten aus `data/` Symlink.

### Formate

**Flat** (pro Item):
```
data/fungi/steinpilz.json
```

**Hierarchical** (Index):
```json
{
  "kingdom": "fungi",
  "items": [...]
}
```

### Search API
```typescript
import { searchItems, getItem } from './server';

const results = await searchItems({
  query: 'pilz',
  perspectives: ['culinary', 'safety'],
  limit: 20
});

const item = await getItem('steinpilz');
```

### Response
```typescript
interface SearchResult {
  items: ItemData[];
  total: number;
  perspectivesWithData: string[];
}
```

### API

```typescript
import { 
  loadAllItems,
  searchItems,
  getItem,          // Einzelnes Item (war: getItemBySlug)
  getItems,         // Mehrere Items (für Compare)
  // Lazy Loading für Perspektiven
  loadPerspective,  // Lädt eine Perspektive bei Bedarf
  loadPerspectives, // Lädt mehrere Perspektiven batch
  hasPerspective,   // Prüft ob Perspektive existiert
  // Error Handling
  getLoadErrors,    // Gibt Ladefehler zurück
  invalidateCache   // Cache invalidieren
} from './server/data';

// Alle Items laden
const items = await loadAllItems();

// Suche
const { items, total, perspectivesWithData } = await searchItems({
  query: 'pilz',
  perspectives: ['culinary', 'safety'],
  limit: 20
});

// Einzelnes Item
const steinpilz = await getItem('steinpilz');

// Lazy Loading: Perspektive erst bei Bedarf laden
const chemistry = await loadPerspective('psilocybe-cyanescens', 'chemistry');
if (chemistry) {
  // chemistry-Daten sind jetzt verfügbar und gecached
}

// Batch: Mehrere Perspektiven laden
const perspMap = await loadPerspectives('steinpilz', ['chemistry', 'ecology']);

// Prüfen ohne zu laden
const exists = await hasPerspective('steinpilz', 'culinary');

// Error Handling
const errors = getLoadErrors();  // [{path, error}, ...]
invalidateCache();               // Force reload
```

### Lazy Loading für Perspektiven

Statt alle Perspektiven beim Item-Laden zu mergen, können sie on-demand geladen werden:

```typescript
// loadPerspective(slug, name) -> Record<string, unknown> | null
const chemistry = await loadPerspective('psilocybe-cyanescens', 'chemistry');

// Automatisches Caching: Zweiter Aufruf nutzt Cache
const sameData = await loadPerspective('psilocybe-cyanescens', 'chemistry');

// loadPerspectives(slug, names) -> Map<string, Record<string, unknown>>
const batch = await loadPerspectives('steinpilz', ['ecology', 'safety', 'culinary']);
batch.get('ecology');  // Ecology-Daten oder undefined

// hasPerspective(slug, name) -> boolean
// Prüft Dateisystem ohne zu laden (für UI-Checks)
if (await hasPerspective('steinpilz', 'chemistry')) {
  // Button anzeigen
}
```

### Error Handling

```typescript
// Ladefehler abrufen
const errors = getLoadErrors();
// [{ path: '/path/to/file.json', error: 'Invalid JSON syntax: ...' }]

// Cache invalidieren (z.B. nach Daten-Update)
invalidateCache();
const freshItems = await loadAllItems(true);  // force reload
```

### Such-Features

- **Text-Suche**: In `name`, `wissenschaftlich`, allen String-Feldern
- **Perspektiven-Suche**: Suchbegriff wird auch gegen Perspektiven-Namen/IDs gematcht
- **Perspektiven-Filter**: Items mit Daten für gewählte Perspektiven
- **Pagination**: `limit` und `offset` Parameter
- **perspectivesWithData**: Welche Perspektiven haben überhaupt Daten
- **matchedPerspectives**: Welche Perspektiven matchen den Suchbegriff (NEU)

### Security

- Path Traversal Prevention bei Slugs
- Validierung aller Eingaben via `core/security.ts`

## 🔗 Symlinks

```
amorph-v7/config → ../config    (YAML)
amorph-v7/data   → ../data      (JSON)
```

Single Source of Truth: Config und Daten werden nicht dupliziert.

## 💡 Usage in Astro Pages

```astro
---
// In index.astro oder [slug].astro
import { loadConfig, getAllPerspectives } from '../server/config';
import { searchItems, getItemBySlug } from '../server/data';

// Config laden (einmalig, wird gecacht)
await loadConfig();

// Daten holen
const perspectives = getAllPerspectives();
const { items } = await searchItems({ query: '', limit: 50 });
---
```

## 🧪 Integration Tests

`tests/integration.test.ts` testet:
- Module Imports funktionieren
- Config + Data Loader arbeiten zusammen
- Security wird angewendet
