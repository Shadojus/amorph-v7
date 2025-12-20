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

Lädt YAML-Konfiguration aus dem `config/` Symlink:

### Dateien

| Datei | Inhalt |
|-------|--------|
| `features.yaml` | Feature-Flags und Einstellungen |
| `perspektiven.yaml` | Die 15 Perspektiven (id, name, symbol) |
| `morphs.yaml` | Morph-Typ-Mappings |
| `daten.yaml` | Daten-Pfade und Kingdoms |

### API

```typescript
import { 
  loadConfig, 
  getConfig, 
  getAllPerspectives,
  getPerspective 
} from './server/config';

// Beim Server-Start einmal laden
await loadConfig();

// Config abrufen
const config = getConfig();
const perspectives = getAllPerspectives();
const safety = getPerspective('safety');
```

### Perspektiven-Struktur

```typescript
interface Perspective {
  id: string;           // 'culinary'
  name: string;         // 'Kulinarik'
  symbol: string;       // '🍳'
  color?: string;       // '#f59e0b'
  description?: string;
}
```

## 📦 data.ts - Data Loader

Lädt JSON-Daten aus dem `data/` Symlink:

### Unterstützte Formate

**Flat Format** (Einzelne JSON pro Item):
```
data/fungi/steinpilz.json
data/fungi/fliegenpilz.json
```

**Hierarchical Format** (Kingdom-Index):
```json
// data/fungi/index.json
{
  "kingdom": "fungi",
  "items": [
    { "id": "steinpilz", "name": "Steinpilz", ... },
    { "id": "fliegenpilz", "name": "Fliegenpilz", ... }
  ]
}
```

### API

```typescript
import { 
  loadAllItems,
  searchItems,
  getItem,          // Einzelnes Item (war: getItemBySlug)
  getItems          // Mehrere Items (für Compare)
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
const steinpilz = await getItemBySlug('steinpilz');

// Nach Perspektive
const edible = await getItemsByPerspective('culinary');
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
