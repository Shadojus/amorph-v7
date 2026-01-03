# AMORPH v7 - Test Suite

> Vitest Tests für vollständige Code-Abdeckung. **421 Tests, 0 Failures**.

## 📁 Struktur

```
tests/
├── detection.test.ts       # Struktur-basierte Erkennung (28 Typen)
├── security.test.ts        # Security Functions (50+ Tests)
├── morphs.test.ts          # Haupt-Morph-Tests
├── observer.test.ts        # Debug Observer
├── integration.test.ts     # Module Integration
├── real-data.test.ts       # Echte Daten Tests
├── error-handling.test.ts  # Error & Edge Cases
├── api-integration.test.ts # API, Search, Compare
└── morphs/                 # Feature-basiert (20 Dateien)
    ├── _setup.ts           # Shared contexts
    ├── base.test.ts        # createUnifiedMorph Tests
    ├── renderValue.test.ts # renderValue() Tests
    ├── badge.test.ts
    ├── bar.test.ts
    ├── boolean.test.ts
    ├── date.test.ts
    ├── image.test.ts
    ├── link.test.ts
    ├── list.test.ts
    ├── number.test.ts
    ├── object.test.ts
    ├── progress.test.ts
    ├── radar.test.ts
    ├── range.test.ts
    ├── rating.test.ts
    ├── sparkline.test.ts
    ├── stats.test.ts
    ├── tag.test.ts
    ├── text.test.ts
    └── timeline.test.ts
```

## 🚀 Ausführen

```bash
npm test           # Watch Mode
npm run test:run   # Einmalig (421 Tests in ~2s)
npm run test:coverage
```

## 📊 Aktueller Status (Dezember 2025)

```
✓ tests/detection.test.ts (120 tests)
✓ tests/security.test.ts (50+ tests)
✓ tests/morphs.test.ts
✓ tests/morphs/*.test.ts (20 files)
✓ tests/integration.test.ts
✓ tests/real-data.test.ts
✓ tests/api-integration.test.ts
✓ tests/error-handling.test.ts
✓ tests/observer.test.ts

 Test Files  29 passed
      Tests  421 passed
   Duration  ~2s
```

## 📦 Test-Kategorien

### detection.test.ts
Testet `core/detection.ts` - Struktur-basierte Erkennung:

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
| `[{step, label}]` | steps |
| `[{phase, duration}]` | lifecycle |
| `[{month, active}]` | calendar |
| `[numbers...]` | sparkline |
| String ≤20 chars | tag |
| String >20 chars | text |

### morphs/*.test.ts
Ein Test-File pro Morph Primitive mit Contexts:
- **single** - Einzelnes Item
- **grid** - Kompakte Darstellung
- **compare** - Mehrere Items mit Farben

### _setup.ts - Shared Contexts
```typescript
import { singleContext, compareContext, gridContext } from './_setup';

it('renders in compare mode', () => {
  const html = renderValue(value, compareContext);
  expect(html).toContain('morph-compare-item');
});
```

### security.test.ts - 50+ Tests
- **validateSlug**: valid slugs, path traversal, invalid chars
- **validateSlugs**: array validation, item limits
- **validateQuery**: normal queries, dangerous chars
- **escapeHtml**: HTML entities, null handling
- **validateUrl**: safe URLs, javascript:, data:, vbscript:
- **checkRateLimit**: under/over limit, cleanup
- **addSecurityHeaders**: CSP, X-Frame-Options

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

## 📦 integration.test.ts (11 Tests)

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

### Data Module (2)

- getLoadErrors und invalidateCache exports
- getLoadErrors returns array

## 📦 real-data.test.ts (34 Tests) - NEU

**Tests mit echten Daten aus psilocybe-cyanescens:**

### chemistry.json (11 Tests)
- Radar Morph mit alkaloid_profile_radar
- Bar Morph mit alkaloid_content_by_part  
- Range Morph mit total_alkaloid_content
- Object Morph mit alkaloid_compounds

### ecology.json (12 Tests)
- Badge Morph mit status/variant (info, warning, success)
- Progress Morph mit Enzym-Aktivitäten (65%, 55%)
- Rating Morph mit ecosystem_function_intensity
- List Morph mit secondary_ecosystem_functions

### identification.json (9 Tests)
- Timeline Morph mit quick_id_checklist (step/label/status Struktur)
- Object Morph mit appearance_by_season
- List Morph mit common_names
- Confusion Species mit danger Level

### Compare-Modus (2 Tests)
- Zwei Radar-Charts mit verschiedenen Alkaloid-Profilen

## 📦 error-handling.test.ts (14 Tests) - NEU

**Tests für robuste Fehlerbehandlung:**

### safeReadJson Verhalten (2 Tests)
- Fehlende Dateien graceful handeln
- Korruptes JSON graceful handeln

### invalidateCache / getLoadErrors (2 Tests)
- Cache und Fehler zurücksetzen
- Kopie des Error-Arrays zurückgeben

### Security: Malicious Data (3 Tests)
- escapeHtml verhindert XSS durch Tag-Escaping
- validateSlug blockt Path Traversal (gibt null zurück)
- validateSlug erlaubt valide Slugs

### Circular Reference Protection (1 Test)
- wrapInField erkennt zirkuläre Referenzen in rawValue

### Type Detection Edge Cases (6 Tests)
- null und undefined graceful handeln
- leere Objekte/Arrays
- sehr tiefe Objekte ohne Stack Overflow
- sehr große Arrays (tag detection)
- Array von Zahlen als sparkline

## 📦 api-integration.test.ts (27 Tests) - NEU

**Tests für API-Endpoints und Lazy-Loading:**

### Query Validation (2 Tests)
- Validierung und Normalisierung
- Query-Länge limitieren

### Perspective Validation (2 Tests)
- Perspektiven-Liste parsen
- Ungültige Perspektiven blocken

### Search Function (3 Tests)
- Items nach Query durchsuchen
- Nach Perspektiven filtern
- Pagination respektieren

### Slug Validation (2 Tests)
- Item-Slugs validieren
- Anzahl der Slugs limitieren

### Item Loading (3 Tests)
- Items nach Slugs laden
- Fehlende Items graceful handeln
- Mehrere Items für Vergleich laden

### Grid/Compare Rendering (4 Tests)
- Grid-Modus (compact) rendern
- Komplexe Daten für Grid
- Vergleich zwischen Items
- Fehlende Werte im Vergleich

### Rate Limiting (2 Tests)
- Normale Anfragen erlauben
- Zu viele Anfragen limitieren

### Response Headers (1 Test)
- Security Headers hinzufügen

### Lazy Loading für Perspektiven (8 Tests)
- loadPerspective für existierendes Item
- null für nicht-existierende Perspektive
- null für nicht-existierendes Item
- Caching geladener Perspektiven
- loadPerspectives batch laden
- Nicht-existierende Perspektiven graceful ignorieren
- hasPerspective ohne zu laden
- false für nicht-existierende Perspektive

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

**Stand: Januar 2026**

| Suite | Tests | Status |
|-------|-------|--------|
| detection.test.ts | 120 | ✅ Pass |
| security.test.ts | 50+ | ✅ Pass |
| morphs.test.ts | 69 | ✅ Pass |
| morphs/*.test.ts | 81 | ✅ Pass |
| observer.test.ts | 8 | ✅ Pass |
| integration.test.ts | 9 | ✅ Pass |
| real-data.test.ts | ~50 | ✅ Pass |
| api-integration.test.ts | ~20 | ✅ Pass |
| error-handling.test.ts | ~15 | ✅ Pass |
| **Total** | **421+** | ✅ **All Pass** |

---

## 🚀 How to Add New Tests

### A) Test für neuen Morph erstellen

1. **Test-Datei erstellen** in `tests/morphs/newmorph.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderValue } from '../../src/morphs';
import { singleContext, compareContext, gridContext } from './_setup';

describe('newmorph morph', () => {
  describe('single mode', () => {
    it('renders basic value', () => {
      const value = { /* morph data structure */ };
      const html = renderValue(value, singleContext);
      expect(html).toContain('morph-newmorph');
    });

    it('handles empty value', () => {
      const html = renderValue(null, singleContext);
      expect(html).toContain('morph-empty');
    });
  });

  describe('compare mode', () => {
    it('renders multiple values', () => {
      const value = { /* data */ };
      const context = {
        ...compareContext,
        items: [
          { name: 'Item 1', value: { /* data 1 */ } },
          { name: 'Item 2', value: { /* data 2 */ } }
        ]
      };
      const html = renderValue(value, context);
      expect(html).toContain('morph-compare');
    });
  });

  describe('grid mode', () => {
    it('renders compact version', () => {
      const value = { /* data */ };
      const html = renderValue(value, gridContext);
      expect(html).toContain('morph-compact');
    });
  });
});
```

2. **_setup.ts erweitern** falls nötig:

```typescript
// tests/morphs/_setup.ts
export const newMorphContext = {
  mode: 'single',
  fieldName: 'newfield',
  blueprint: {
    // Blueprint-spezifische Daten
  }
};
```

### B) Test für neue Domain-Integration erstellen

```typescript
// tests/domains/newdomain.test.ts
import { describe, it, expect } from 'vitest';
import { loadSpeciesData } from '../../src/server/data';

describe('newdomain integration', () => {
  it('loads all newdomain items', async () => {
    const items = await loadSpeciesData('newdomain');
    expect(items.length).toBeGreaterThan(0);
  });

  it('validates item structure', async () => {
    const items = await loadSpeciesData('newdomain');
    for (const item of items) {
      expect(item).toHaveProperty('slug');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('perspectives');
    }
  });

  it('has valid perspectives', async () => {
    const items = await loadSpeciesData('newdomain');
    const validPerspectives = [
      'perspective1', 'perspective2', 'perspective3'
    ];
    
    for (const item of items) {
      for (const p of item.perspectives) {
        expect(validPerspectives).toContain(p);
      }
    }
  });
});
```

### C) API-Test für neue Endpoints

```typescript
// tests/api/newdomain-api.test.ts
import { describe, it, expect } from 'vitest';

describe('newdomain API', () => {
  const baseUrl = 'http://localhost:4338'; // Port für newdomain

  it('returns search results', async () => {
    const response = await fetch(`${baseUrl}/api/search?q=test`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data.results)).toBe(true);
  });

  it('returns species by slug', async () => {
    const response = await fetch(`${baseUrl}/api/species/item-slug`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('name');
  });
});
```

### D) Test-Konventionen

| Aspekt | Konvention |
|--------|------------|
| **Dateiname** | `{feature}.test.ts` |
| **Beschreibung** | Klar, Action-orientiert |
| **Gruppierung** | `describe` für Funktionen, nested für Modi |
| **Assertion** | Ein logisches Assert pro Test |
| **Setup** | Shared in `_setup.ts` |
| **Cleanup** | Via `beforeEach`/`afterEach` |

### E) Test-Befehle

```bash
# Alle Tests
npm test

# Einmalig ohne Watch
npm run test:run

# Mit Coverage
npm run test:coverage

# Einzelne Datei
npm test -- tests/morphs/newmorph.test.ts

# Pattern matching
npm test -- --grep "newmorph"
```
