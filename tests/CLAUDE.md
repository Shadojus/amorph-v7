# AMORPH v7 - Test Suite

> 155 Tests mit Vitest für vollständige Code-Abdeckung.

## 📁 Struktur

```
tests/
├── detection.test.ts     # 40 Tests - Typ-Erkennung + Badge-Varianten + Radar Arrays
├── security.test.ts      # 49 Tests - Security Functions (vollständig)
├── morphs.test.ts        # 49 Tests - Alle 18 Morph Primitives
├── observer.test.ts      # 8 Tests  - Debug Observer
└── integration.test.ts   # 9 Tests  - Module Integration
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

## 📦 detection.test.ts (39 Tests)

Testet `core/detection.ts`:

### Kategorien

- **Primitives** (4): null, boolean, numbers, empty strings
- **Field Name Hints** (6): progress, rating, image, link, date, currency
- **String Patterns** (5): URLs, image URLs, dates, short strings, badge keywords
- **Arrays** (7): string arrays, number arrays, object arrays, bar/pie/radar charts, empty
- **Objects** (10): range, stats, radar, mixed, map, currency, citation, dosage, hierarchy, boxplot
- **getBadgeVariant** (6): success, danger, warning, muted, default, substring limitations
- **Config** (2): get/set detection config

### Beispiel

```typescript
describe('primitives', () => {
  it('should detect numbers as progress (0-100) or rating (0-10)', () => {
    expect(detectType(85, 'progress')).toBe('progress');
    expect(detectType(7.5, 'rating')).toBe('rating');
    expect(detectType(42)).toBe('number');
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

## 📦 morphs.test.ts (49 Tests)

Testet `morphs/primitives/` - **Alle 18 Morphs abgedeckt**:

### Kategorien

- **text** (3): string values, HTML escaping, null handling
- **number** (3): German locale, NaN handling, string parsing
- **boolean** (3): true/false, ja/nein strings
- **badge** (4): danger, success, neutral variants, XSS escaping
- **tag** (3): single tag, array of tags, HTML escaping
- **progress** (3): bar rendering, value clamping, string values
- **rating** (2): star rendering, percentage normalization
- **range** (3): min/max, German von/bis, current value
- **stats** (2): stats object, empty object
- **image** (6): render, object src, XSS blocking, data: blocking, relative paths
- **link** (3): clickable, protocol stripping, HTML escaping
- **list** (3): array rendering, single value, HTML escaping
- **object** (1): key-value pairs
- **date** (2): German formatting, invalid dates
- **timeline** (1): timeline events
- **bar** (2): bar chart, number array
- **sparkline** (2): SVG rendering, empty array
- **radar** (2): 3+ fields, fallback

### Beispiel

```typescript
describe('badge morph', () => {
  it('should detect danger variant', () => {
    const html = badge('giftig', gridContext);
    expect(html).toContain('morph-badge--danger');
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
  it('should detect and use correct morph', () => {
    const html = renderValue(75, 'progress', gridContext);
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
| detection.test.ts | 19 | ✅ Pass |
| security.test.ts | 25 | ✅ Pass |
| morphs.test.ts | 16 | ✅ Pass |
| observer.test.ts | 8 | ✅ Pass |
| integration.test.ts | 9 | ✅ Pass |
| **Total** | **77** | ✅ **All Pass** |
