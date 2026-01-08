# Client Features

Browser-seitige TypeScript Module.

---

## Module

| Datei | Beschreibung |
|-------|--------------|
| `app.ts` | Hauptanwendung, Init |
| `search.ts` | Suchfunktion |
| `compare.ts` | Vergleichs-Ansicht |
| `selection.ts` | Feld-Selektion |
| `grid.ts` | Grid-Layout |
| `bifroest.ts` | BIFROEST Expert Attribution System |
| `debug.ts` | Debug-Utilities |

---

## Verwendung

Module werden als ES Modules geladen:

```html
<script type="module" src="/client/app.ts"></script>
```

---

## State Management

Session Storage Keys:
- `amorph:selection:fields` - Ausgewählte Felder
- `amorph:compare:items` - Compare Items
- `amorph:search:query` - Letzte Suche

---

## Events

Custom Events für Kommunikation:
- `amorph:field:select`
- `amorph:compare:update`
- `amorph:search:complete`

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |

---

*Letzte Aktualisierung: Januar 2026*
