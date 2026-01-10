# Tests

Vitest Test-Suite für AMORPH v8.7.1.

## Übersicht

| Datei | Tests | Beschreibung |
|-------|-------|--------------|
| `detection.test.ts` | 80 | Typ-Erkennung |
| `security.test.ts` | 49 | Input Sanitization |
| `morphs.test.ts` | 81 | Morph Rendering |
| `morphs/*.test.ts` | 110 | Individuelle Morph-Tests |
| `observer.test.ts` | 8 | Debug Module |
| `error-handling.test.ts` | 14 | Error Handling |
| `data-db.test.ts` | 38 | PostgreSQL Database Tests |
| `data-driven-core.test.ts` | 33 | Data Layer Tests |
| `schema-complete.test.ts` | 73 | Prisma Schema Tests |
| `ultra-complete.test.ts` | 115 | Full Integration |
| `live-api.test.ts` | 18 | Live Server API |
| `external-links.test.ts` | 38 | External Links |
| `expert-attribution.test.ts` | 19 | Expert Domain Attribution (NEU!) |
| `api-endpoints.test.ts` | 41 | API Endpoints |

**Total: 737 Tests (42 Dateien) ✅**

---

## Commands

```bash
# Watch-Modus (Entwicklung)
npm test

# Einmalig ausführen
npm run test:run
npx vitest run

# Mit Coverage
npm run test:coverage

# Spezifische Datei
npx vitest run detection.test.ts
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
