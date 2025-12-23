# AMORPH v7 - Core Module

> Fundamentale Typen, Detection und Security.

## 📁 Dateien

```
core/
├── types.ts      # TypeScript Interfaces (273 Zeilen)
├── detection.ts  # Struktur-basierte Typ-Erkennung (472 Zeilen)
├── security.ts   # XSS-Schutz & Validierung (309 Zeilen)
└── index.ts      # Re-Exports
```

## 📦 types.ts - Zentrale Typen

### RenderMode
```typescript
type RenderMode = 'single' | 'grid' | 'compare';
```

### RenderContext
```typescript
interface RenderContext {
  mode: RenderMode;
  itemCount: number;
  items?: ItemData[];
  itemIndex?: number;
  colors?: string[];
  perspectives?: string[];
  fieldName?: string;
  fieldConfig?: SchemaField;
  compact?: boolean;
}
```

### MorphType (28 Primitives)
```typescript
type MorphType = 
  // Primitives
  | 'null' | 'boolean' | 'text' | 'number' | 'progress'
  // String-derived
  | 'link' | 'image' | 'badge' | 'tag' | 'date'
  // Containers
  | 'list' | 'object' | 'hierarchy'
  // Charts
  | 'bar' | 'pie' | 'radar' | 'sparkline' | 'gauge' | 'heatmap'
  // Temporal
  | 'timeline' | 'lifecycle' | 'steps' | 'calendar'
  // Specialized
  | 'range' | 'stats' | 'citation' | 'dosage' | 'currency'
  | 'rating' | 'severity';
```

### ItemData
```typescript
interface ItemData {
  id: string;
  slug: string;
  name: string;
  _perspectives?: Record<string, unknown>;
  _kingdom?: string;
  [key: string]: unknown;
}
```

## 📦 detection.ts - Automatische Erkennung

**WICHTIG**: Erkennung basiert **nur auf Datenstruktur**, nicht Feldnamen!

### String Detection
| Struktur | → Morph |
|----------|---------|
| `.jpg/.png/.webp/.svg` URL | `image` |
| `http://` oder `https://` | `link` |
| ISO Date (2024-12-20) | `date` |
| String ≤20 chars | `tag` |
| String >20 chars | `text` |

### Object Detection (Reihenfolge wichtig!)
| Struktur | → Morph |
|----------|---------|
| `{status, variant}` | `badge` |
| `{rating, max?}` | `rating` |
| `{value, max}` | `progress` |
| `{min, max, avg}` | `stats` |
| `{min, max}` | `range` |
| Object mit 3+ numeric values | `radar` |
| Generic Object | `object` |

### Array Detection
| Struktur | → Morph |
|----------|---------|
| `[{axis, value}]` | `radar` |
| `[{label, value}]` | `bar` |
| `[{date, event}]` | `timeline` |
| `[{step, label}]` | `steps` |
| `[{phase, duration}]` | `lifecycle` |
| `[{month, active}]` | `calendar` |
| `[{level, typ}]` | `severity` |
| `[{amount, unit, frequency}]` | `dosage` |
| `[numbers...]` | `sparkline` |
| `["short strings"]` (≤20 chars) | `tag` |
| `["longer strings"]` | `list` |

## 📦 security.ts - XSS-Schutz

### Input Validation
```typescript
validateSlug(slug: unknown): string | null
validateSlugs(slugs: unknown): string[]
validateQuery(query: unknown): string
validatePerspectives(perspectives: unknown): string[]
validateNumber(value: unknown, min, max, default): number
```

### XSS Prevention
```typescript
escapeHtml(text: unknown): string    // &lt;script&gt;
escapeAttribute(text: unknown): string
validateUrl(url: unknown): string | null  // Blockt javascript:
```

### Security Features
- Path Traversal Schutz (`..` wird blockiert)
- Rate Limiting (`checkRateLimit`)
- Security Headers (`addSecurityHeaders`)
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
