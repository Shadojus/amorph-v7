# Client Features

Browser-seitige TypeScript Module für Amorph v8.7.1.

---

## Module

| Datei | Beschreibung |
|-------|--------------|
| `app.ts` | Hauptanwendung, Init |
| `search.ts` | Suchfunktion |
| `compare.ts` | Vergleichs-Ansicht |
| `selection.ts` | Feld-Selektion |
| `grid.ts` | Grid-Layout |
| `bifroest.ts` | ⭐ BIFROEST Expert Attribution System |
| `debug.ts` | Debug-Utilities |

---

## ⭐ BIFROEST Expert Attribution System (`bifroest.ts`)

Das Bifroest-System zeigt Quellen-Attribution für Datenfelder:

### Features (v8.7.1)
- **Multi-Domain Support** - Lädt Experten für ALLE sichtbaren Domains auf Landing-Page
- **Domain-Filtering** - Experten erscheinen NUR bei Items aus ihrer eigenen Domain
- **10 Experten** - Verteilt auf 10 verschiedene Domains
- **Field Matching** - Basierend auf `fieldExpertise` Array

### Architektur
```
┌─────────────────────────────────────────────────────────────┐
│  loadAndDisplayExperts()                                     │
│  ├── isLandingPage()? → Lade ALLE sichtbaren Domains        │
│  │   └── getVisibleDomains() → fetchExperts() parallel      │
│  └── Single Domain → fetchExperts(currentDomain)            │
│                                                             │
│  applyExpertsToFields()                                     │
│  ├── Iteriere über alle .amorph-field                       │
│  ├── Finde Experten mit passendem field_expertise           │
│  ├── ⭐ Domain-Check: expert.domain === itemDomain          │
│  └── Füge Button mit Experten-Info hinzu                    │
└─────────────────────────────────────────────────────────────┘
```

### Expert-Felder
Experten werden Feldern zugeordnet über `fieldExpertise`:
- `description`, `categories`, `keywords`, `ecology`, `habitat`
- `chemistry`, `genetics`, `anatomy`, `morphology`, `taxonomy`

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
- `bifroest:experts:{domain}` - Gecachte Experten (10min TTL)

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

*Letzte Aktualisierung: 9. Januar 2026*
