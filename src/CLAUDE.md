# Source Code

Haupt-Quellcode für AMORPH.

---

## Verzeichnisse

| Ordner | Beschreibung | CLAUDE.md |
|--------|--------------|----------|
| `core/` | Typen, Detection, Security | [core/CLAUDE.md](core/CLAUDE.md) |
| `morphs/` | 28 Morph Primitives | [morphs/CLAUDE.md](morphs/CLAUDE.md) |
| `server/` | PocketBase Client, Config | [server/CLAUDE.md](server/CLAUDE.md) |
| `client/` | Frontend Features | [client/CLAUDE.md](client/CLAUDE.md) |
| `observer/` | Debug & Analytics | [observer/CLAUDE.md](observer/CLAUDE.md) |
| `layouts/` | Astro Layouts | [layouts/CLAUDE.md](layouts/CLAUDE.md) |
| `pages/` | Routen | [pages/CLAUDE.md](pages/CLAUDE.md) |

---

## Wichtige Dateien

### core/
- `types.ts` - TypeScript Definitionen
- `detection.ts` - Struktur-basierte Typ-Erkennung
- `security.ts` - Input Sanitization

### server/
- `bifroest.ts` - ⭐ PocketBase API Client (einzige Datenquelle!)
- `config.ts` - Domain-Farben, Site-Meta
- `data.ts` - Datenlade-Abstraktion
- `cache.ts` - In-Memory Caching

### morphs/
- `base.ts` - Basis-Morph Utilities
- 28 Primitive (badge, bar, boolean, gauge, list, etc.)

### client/
- `app.ts` - Hauptanwendung
- `search.ts` - Suchfunktion
- `compare.ts` - Vergleichs-Ansicht
- `selection.ts` - Feld-Selektion
- `bifroest.ts` - BIFROEST Expert Attribution System

---

## Datenfluss

```
PocketBase ({domain}_entities + experts)
    ↓
bifroest.ts (fetch + transform)
    ↓
pages/*.astro (render)
    ↓
morphs/*.ts (visualize)
    ↓
Expert-Matching (field_expertise.includes(fieldKey))
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | AMORPH Root |
| [../../CLAUDE.md](../../CLAUDE.md) | Monorepo Root |

---

*Letzte Aktualisierung: Januar 2026*
