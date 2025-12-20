# AMORPH v7 - Core Module

> Fundamentale Typen, Detection und Security.

## 📁 Dateien

```
core/
├── types.ts      # TypeScript Interfaces & Types
├── detection.ts  # Automatische Typ-Erkennung
├── security.ts   # Input Validation & XSS Schutz
└── index.ts      # Re-Exports
```

## 📦 types.ts

### RenderContext
```typescript
interface RenderContext {
  mode: 'single' | 'grid' | 'compare';
  itemCount: number;           // 1 = single, >1 = compare
  items?: ItemData[];          // Alle Items bei compare
  itemIndex?: number;          // Index des aktuellen Items
  colors?: string[];           // Farben für Compare
  perspectives?: string[];     // Aktive Perspektiven
  fieldName?: string;          // Aktuelles Feld
  compact?: boolean;           // Grid = kompakt
}
```

### MorphType (19 Typen)
```typescript
type MorphType = 
  | 'text' | 'number' | 'boolean' | 'badge' | 'tag'
  | 'progress' | 'rating' | 'range' | 'stats'
  | 'image' | 'link' | 'list' | 'date'
  | 'bar' | 'sparkline' | 'radar' | 'timeline'
  | 'object' | 'null';
```

### ItemData
```typescript
interface ItemData {
  id: string;
  slug: string;
  name: string;
  wissenschaftlich?: string;
  bild?: string;
  [key: string]: unknown;      // Dynamische Felder
}
```

### CompareValue
```typescript
interface CompareValue {
  item: ItemData;
  value: unknown;
  color: string;
}
```

## 📦 detection.ts

### detectType(value, fieldName?)
Erkennt automatisch den passenden MorphType:

| Input | Erkannt als |
|-------|-------------|
| `null`, `undefined`, `""` | `null` |
| `true`, `false` | `boolean` |
| `0-100` (field: progress/prozent) | `progress` |
| `0-10` (field: rating/bewertung) | `rating` |
| Number | `number` |
| URL mit Bild-Extension | `image` |
| URL | `link` |
| ISO Date / Date-Field | `date` |
| Kurzer String (<30 Zeichen) | `tag` |
| String | `text` |
| `{min, max}` | `range` |
| `{min, avg, max}` | `stats` |
| Object mit 3+ numerischen Feldern | `radar` |
| Array von Numbers | `sparkline` |
| Array von `{date, ...}` | `timeline` |
| Array von Strings | `tag` |
| Object | `object` |

### createSingleContext / createCompareContext
Helper zum Erstellen von RenderContext-Objekten.

## 📦 security.ts

### Funktionen

| Funktion | Zweck |
|----------|-------|
| `validateSlug(slug)` | Prüft auf gültige Slugs (keine Path Traversal) |
| `validateSlugs(arr)` | Validiert Array von Slugs |
| `validateQuery(q)` | Sanitized Suchanfragen |
| `escapeHtml(str)` | XSS-sichere HTML-Ausgabe |
| `validateUrl(url)` | Blockiert javascript:/data: URLs |
| `sanitizeFilename(name)` | Entfernt gefährliche Zeichen |
| `isPathWithin(path, base)` | Prüft ob Pfad innerhalb Base liegt |
| `validateNumber(n, min, max, default)` | Clamp mit Default |

### Sicherheits-Features
- ✅ Path Traversal Prevention (`../`, `..\\`)
- ✅ XSS Protection (HTML Escaping)
- ✅ URL Scheme Blocking (javascript:, data:)
- ✅ Input Length Limits
- ✅ Character Whitelisting

## 🧪 Tests

Tests in `tests/`:
- `detection.test.ts` - 19 Tests für Typ-Erkennung
- `security.test.ts` - 25 Tests für Security-Funktionen

## 💡 Usage

```typescript
import { 
  detectType, 
  escapeHtml, 
  validateSlug,
  type RenderContext,
  type MorphType 
} from './core';

const morphType = detectType(value, 'rating');  // → 'rating'
const safe = escapeHtml('<script>alert(1)</script>');
const isValid = validateSlug('steinpilz');
```
