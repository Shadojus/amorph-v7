# Core Module

Grundlegende TypeScript-Definitionen und Utilities.

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `types.ts` | TypeScript Interfaces für ItemData, RenderContext, etc. |
| `detection.ts` | Struktur-basierte Typ-Erkennung (80 Tests) |
| `security.ts` | Input Sanitization & XSS Prevention (49 Tests) |

---

## types.ts

### Haupt-Interfaces

```typescript
interface ItemData {
  id: string;
  slug: string;
  name: string;
  scientific_name?: string;
  domain: string;              // 17 Domains
  data: Record<string, any>;
}

interface Expert {
  id: string;
  name: string;
  domain: string;
  field_expertise: string[];  // Für Field-Matching!
  impact_score: number;       // NIEMALS an Client!
  verified: boolean;
}

interface RenderContext {
  mode: 'single' | 'compare' | 'grid';
  itemCount: number;
  items: ItemData[];
}
```

---

## detection.ts

Erkennt Datentypen aus der Struktur:

```typescript
detectType('hello')           // 'text'
detectType(42)                // 'number'
detectType(true)              // 'boolean'
detectType(['a', 'b'])        // 'list'
detectType({ value: 50 })     // 'gauge' (wenn min/max)
```

---

## security.ts

```typescript
validateSlug(slug)            // Path Traversal Prevention
validateQuery(query)          // XSS & Injection Prevention
sanitizeForFilter(input)      // Filter Query Sanitization
logSecurityEvent(event)       // Security Logging
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |
| [../morphs/CLAUDE.md](../morphs/CLAUDE.md) | 28 Morph Primitives |

---

*Letzte Aktualisierung: Januar 2026*
