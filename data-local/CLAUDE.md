# Data-Local

## 🎯 PRIMÄRE DATENQUELLE (v8.0)

Dieser Ordner enthält die lokalen JSON-Daten für das gesamte AMORPH/Bifroest System.

## Status: ✅ Aktiv

### Dateien

| Datei | Beschreibung | Anzahl |
|-------|--------------|--------|
| `universe-index.json` | Species-Index für alle Domains | 62+ |
| `bifroest-experts.json` | Experten-Daten | 28+ |
| `fungi/` | Pilz-Daten | 27 |
| `plantae/` | Pflanzen-Daten | 35 |
| `therion/` | Tier-Daten | — |
| `ai/`, `anatomy/`, etc. | Weitere Domains | — |

### Datenstruktur

```
data-local/
├── bifroest-experts.json    # Experten für Bifroest
├── universe-index.json      # Gesamt-Index aller Species
├── fungi/                   # Pilz-Dateien
│   ├── agaricus-subrufescens/
│   ├── hericium-erinaceus/
│   └── ...
├── plantae/                 # Pflanzen-Dateien
│   ├── aloe-vera/
│   └── ...
└── ...
```

### Experten-Schema (v8.0)

```json
{
  "paul-stamets": {
    "name": "Paul Stamets",
    "title": "Mycologist",
    "specialization": ["Medicinal Mushrooms", "Psilocybin"],
    "affiliation": "Fungi Perfecti",
    "location": "Olympia, WA",
    "contact": {
      "website": "https://fungi.com",
      "youtube": "@fungimagazine"
    }
  }
}
```

### Species-Schema

```json
{
  "id": "hericium-erinaceus",
  "slug": "hericium-erinaceus",
  "name": "Lion's Mane",
  "scientific_name": "Hericium erinaceus",
  "kingdom": "fungi",
  "description": "..."
}
```

## Usage

```typescript
// In bifroest-platform/frontend/src/lib/data.ts
import { loadExperts, loadSpecies } from '../lib/data';

const experts = await loadExperts();      // ← bifroest-experts.json
const species = await loadSpecies();      // ← universe-index.json
```

## Entwicklung

```bash
# Daten validieren
npm run validate:data

# Server starten (lädt automatisch)
npm run dev
```

---

> **Version 8.0:** Lokale JSON-Daten sind die primäre Datenquelle.  
> PostgreSQL/Prisma ist für Produktion vorbereitet.
