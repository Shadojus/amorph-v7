# AMORPH v7 - Test Suite

> 227 Tests mit Vitest für vollständige Code-Abdeckung.

## 📁 Struktur

```
tests/
├── detection.test.ts     # 80 Tests - Struktur-basierte Typ-Erkennung
├── security.test.ts      # 49 Tests - Security Functions (vollständig)
├── observer.test.ts      # 8 Tests  - Debug Observer
├── integration.test.ts   # 9 Tests  - Module Integration
└── morphs/               # 81 Tests - Feature-basiert aufgeteilt
    ├── _setup.ts         # Shared contexts (single, compare, grid)
    ├── text.test.ts      # 3 Tests
    ├── number.test.ts    # 3 Tests
    ├── boolean.test.ts   # 3 Tests
    ├── badge.test.ts     # 4 Tests
    ├── tag.test.ts       # 3 Tests
    ├── progress.test.ts  # 5 Tests
    ├── rating.test.ts    # 2 Tests
    ├── range.test.ts     # 4 Tests
    ├── stats.test.ts     # 3 Tests
    ├── image.test.ts     # 7 Tests
    ├── link.test.ts      # 3 Tests
    ├── list.test.ts      # 3 Tests
    ├── object.test.ts    # 9 Tests (inkl. compare mode)
    ├── date.test.ts      # 2 Tests
    ├── timeline.test.ts  # 1 Test
    ├── bar.test.ts       # 4 Tests
    ├── sparkline.test.ts # 3 Tests
    ├── radar.test.ts     # 7 Tests (inkl. compare mode)
    ├── base.test.ts      # 6 Tests (wrapInField, Base64)
    └── renderValue.test.ts # 6 Tests
```

## 🚀 Ausführen

```bash
# Watch Mode (Development)
npm test

# Einmalig
npm run test:run

# Mit Coverage
npm run test:coverage
```

## 📦 detection.test.ts (80 Tests)

Testet `core/detection.ts` - **Struktur-basierte Erkennung** (keine Feldnamen!):

### Kategorien

- **Primitives** (8): null, undefined, boolean, numbers
- **Strings** (16): tag (≤20 chars), text, image URLs, links, dates (ISO, German)
- **Arrays** (10): sparkline (numbers), tag (short strings), list, bar, radar, timeline
- **Objects** (14): badge, rating, progress, range, stats, radar, generic object
- **getBadgeVariant** (12): success, danger, warning, muted, default variants
- **Real Blueprints** (20): Tests mit echten Blueprint-Strukturen (chemistry, ecology, culinary, etc.)

### Struktur → Morph Mapping

| Struktur | → Morph |
|----------|--------|
| `{status, variant}` | badge |
| `{rating, max?}` | rating |
| `{value, max}` | progress |
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `[{axis, value}]` | radar |
| `[{label, value}]` | bar |
| `[{date, event}]` | timeline |
| `[numbers...]` | sparkline |
| String ≤20 chars | tag |
| String >20 chars | text |

### Beispiel

```typescript
describe('Object Detection', () => {
  it('should detect badge structure', () => {
    expect(detectType({ status: 'LC', variant: 'success' })).toBe('badge');
  });
  
  it('should detect range structure', () => {
    expect(detectType({ min: 800, max: 3200 })).toBe('range');
  });
});
```

## 📦 security.test.ts (49 Tests)

Testet `core/security.ts` - **Vollständige Abdeckung**:

### Kategorien

- **validateSlug** (5): valid slugs, path traversal, invalid chars, empty, length
- **validateSlugs** (2): array validation, item limits
- **validateQuery** (3): normal queries, dangerous chars, length
- **escapeHtml** (3): HTML entities, null handling, number conversion
- **escapeAttribute** (3): attribute escaping, edge cases
- **validateUrl** (6): safe URLs, javascript:, data:, vbscript:, bare domains
- **sanitizeFilename** (3): safe names, path separators, dangerous chars
- **isPathWithin** (3): within base, outside base, Windows paths
- **validateNumber** (2): clamping, defaults
- **validatePerspectives** (4): valid perspectives, invalid filtering, empty
- **checkRateLimit** (3): under limit, over limit, cleanup
- **addSecurityHeaders** (4): header injection, all required headers
- **securityHeaders** (3): CSP, X-Frame-Options, all headers present
- **logSecurityEvent** (3): event logging, levels

### Beispiel

```typescript
describe('validateSlug', () => {
  it('should reject path traversal attempts', () => {
    expect(validateSlug('../etc/passwd')).toBeNull();
    expect(validateSlug('..\\windows\\system32')).toBeNull();
    expect(validateSlug('foo/../bar')).toBeNull();
  });
});
```

## 📦 morphs/ (81 Tests - Feature-basiert)

Feature-basierte Struktur in `tests/morphs/`:

### Aufbau

```
tests/morphs/
├── _setup.ts           # Shared contexts
├── text.test.ts        # Text morph
├── number.test.ts      # Number formatting
├── boolean.test.ts     # Boolean display
├── badge.test.ts       # Badge variants
├── tag.test.ts         # Tag pills
├── progress.test.ts    # Progress bars
├── rating.test.ts      # Star ratings
├── range.test.ts       # Min/max ranges
├── stats.test.ts       # Statistics display
├── image.test.ts       # Image + XSS protection
├── link.test.ts        # External links
├── list.test.ts        # Lists
├── object.test.ts      # Objects + compare mode
├── date.test.ts        # Date formatting
├── timeline.test.ts    # Timeline events
├── bar.test.ts         # Bar charts
├── sparkline.test.ts   # Mini charts
├── radar.test.ts       # Radar + compare mode
├── base.test.ts        # wrapInField, Base64
└── renderValue.test.ts # Integration
```

### Shared Setup (_setup.ts)

```typescript
export const singleContext = { mode: 'single', itemCount: 1 };
export const compareContext = { 
  mode: 'compare', 
  itemCount: 2,
  items: [...],
  colors: ['#0df', '#f0d']
};
```

### Compare-Mode Tests (radar.test.ts, object.test.ts)

```typescript
describe('radar morph compare renderer', () => {
  it('should render overlay with multiple paths', () => {
    const values = [
      { value: [...], color: '#0df', item: { name: 'Item 1' } },
      { value: [...], color: '#f0d', item: { name: 'Item 2' } }
    ];
    // Compare renderer über morphFn.compareRender aufrufen
  });
});
```

## 📦 observer.test.ts (8 Tests)

Testet `observer/debug.ts`:

### Tests

1. Log messages to history
2. Filter by category
3. Mute categories
4. Track stats by category
5. Get timeline entries
6. Enable/disable logging
7. Correct log entry structure
8. Get entries by category

### Beispiel

```typescript
describe('debug observer', () => {
  it('should mute categories', () => {
    debug.mute('test');
    debug.setVerbose(false);
    const entry = debug.log('test', 'muted');
    expect(entry).toBeUndefined();
  });
});
```

## 📦 integration.test.ts (9 Tests)

Testet Modul-Integration:

### Module Imports (6)

- core types
- detection
- security
- morphs
- all primitives
- observer

### Morph Rendering (2)

- render values with context
- detect and use correct morph

### Security Integration (1)

- escape user input in morphs

### Beispiel

```typescript
describe('morph rendering', () => {
  it('should detect and use correct morph based on structure', () => {
    // Progress requires {value, max} object
    const html = renderValue({ value: 75, max: 100 }, 'fortschritt', gridContext);
    expect(html).toContain('morph-progress');
  });
});
```

## 📊 Coverage

```bash
npm run test:coverage
```

Coverage Report wird generiert in `coverage/`:
- `coverage/index.html` - HTML Report
- `coverage/lcov.info` - LCOV für CI

### Ziel-Coverage

| Kategorie | Ziel |
|-----------|------|
| Statements | >80% |
| Branches | >75% |
| Functions | >80% |
| Lines | >80% |

## 🔧 Konfiguration

`vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

## 💡 Neue Tests hinzufügen

1. Erstelle `tests/myfeature.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/mymodule';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

2. Tests ausführen:

```bash
npm test
```

## ✅ Test Status

**Stand: Dezember 2025**

| Suite | Tests | Status |
|-------|-------|--------|
| detection.test.ts | 80 | ✅ Pass |
| security.test.ts | 49 | ✅ Pass |
| morphs.test.ts | 69 | ✅ Pass |
| observer.test.ts | 8 | ✅ Pass |
| integration.test.ts | 9 | ✅ Pass |
| **Total** | **215** | ✅ **All Pass** |
