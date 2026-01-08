# Tests

Vitest Test-Suite für AMORPH.

## Übersicht

| Datei | Tests | Beschreibung |
|-------|-------|--------------|
| `detection.test.ts` | 80 | Typ-Erkennung |
| `security.test.ts` | 49 | Input Sanitization |
| `morphs.test.ts` | 81 | Morph Rendering |
| `morphs/*.test.ts` | 110 | Individuelle Morph-Tests |
| `observer.test.ts` | 8 | Debug Module |
| `integration.test.ts` | 11 | Module Integration |
| `api-integration.test.ts` | 27 | API Endpoints |
| `real-data.test.ts` | 34 | Local Data Tests |
| `error-handling.test.ts` | 14 | Error Handling |

**Total: 475 Tests (37 Dateien)**

---

## Commands

```bash
# Watch-Modus (Entwicklung)
npm test

# Einmalig ausführen
npm run test:run

# Mit Coverage
npm run test:coverage

# Spezifische Datei
npm test detection.test.ts
```

---

## Test-Struktur

```typescript
import { describe, it, expect } from 'vitest';

describe('detection', () => {
  it('should detect text type', () => {
    expect(detectType('hello')).toBe('text');
  });
  
  it('should detect number type', () => {
    expect(detectType(42)).toBe('number');
  });
});
```

## Mocking

```typescript
import { vi } from 'vitest';

// Data Loading mocken
vi.mock('@/server/data', () => ({
  loadItems: vi.fn(() => Promise.resolve([]))
}));
```

## Best Practices

- ✅ Tests vor Commit ausführen
- ✅ Neue Features mit Tests
- ✅ Edge Cases abdecken
- ✅ Mocks für externe Services
