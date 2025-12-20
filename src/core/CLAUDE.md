# AMORPH v7 - Core Module

> Fundamentale Typen, Detection und Security für biologische Daten aller Kingdoms.

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

### detectType(value) - Struktur-basierte Erkennung

**WICHTIG**: Erkennung basiert **nur auf Datenstruktur**, nicht auf Feldnamen!

| Struktur | → Morph |
|----------|---------|
| `null`, `undefined` | `text` |
| `true`, `false` | `boolean` |
| Number | `number` |
| String ≤20 chars | `tag` |
| String >20 chars | `text` |
| URL mit Bild-Extension (.jpg, .png, .webp, .svg) | `image` |
| http/https URL | `link` |
| ISO Date (2024-12-20) | `date` |
| `{status, variant}` | `badge` |
| `{rating, max?}` | `rating` |
| `{value, max}` | `progress` |
| `{min, max}` ohne avg | `range` |
| `{min, max, avg}` | `stats` |
| `[{axis, value}]` | `radar` |
| `[{label, value}]` | `bar` |
| `[{date, event}]` oder `[{step, label}]` | `timeline` |
| `[numbers...]` | `sparkline` |
| `["short strings"]` (alle ≤20 chars) | `tag` |
| `["longer strings"]` | `list` |
| Object mit 3+ numeric values | `radar` |
| Object (generic) | `object` |

### getBadgeVariant(status)
Erkennt Badge-Variante aus Status-Text:

| Variante | Keywords |
|----------|----------|
| `success` | edible, safe, essbar, LC, least_concern |
| `danger` | toxic, deadly, giftig, CR, extinct |
| `warning` | caution, vulnerable, endangered |
| `muted` | unknown, data_deficient, inactive |
| `default` | alles andere |

**Hinweis**: Kurze Keywords (≤2 Zeichen wie "en", "lc") erfordern exakte Übereinstimmung.

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

Tests in `tests/detection.test.ts`:
- **80 Tests** für struktur-basierte Typ-Erkennung
- Real Blueprint Structures (chemistry, ecology, culinary, conservation)
- Badge Variant Detection

Tests in `tests/security.test.ts`:
- **49 Tests** für Security-Funktionen

## 💡 Usage

```typescript
import { 
  detectType, 
  getBadgeVariant,
  escapeHtml, 
  validateSlug,
  type RenderContext,
  type MorphType 
} from './core';

// Struktur-basierte Erkennung (KEIN Feldname nötig)
detectType({ status: 'LC', variant: 'success' });  // → 'badge'
detectType({ min: 800, max: 3200 });               // → 'range'
detectType([{ axis: 'A', value: 1 }]);             // → 'radar'
detectType([1, 2, 3, 4, 5]);                       // → 'sparkline'
detectType('essbar');                              // → 'tag' (≤20 chars)

// Badge-Variante
getBadgeVariant('Least Concern');                  // → 'success'
getBadgeVariant('Critically Endangered');          // → 'danger'

// Security
const safe = escapeHtml('<script>alert(1)</script>');
const isValid = validateSlug('steinpilz');
```
