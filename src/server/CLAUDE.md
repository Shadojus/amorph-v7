# Server Module (v8.0)

JSON-basierter Data Loader und Server-Logik für AMORPH.

## ⚠️ Wichtig: Lokale JSON-Dateien!

```bash
# Development & Production (Standard)
DATA_SOURCE=local   # Verwendet data-local/ JSON-Dateien
```

**Datenquelle:** Lokale JSON-Dateien aus `data-local/`

- `universe-index.json` - Species Index mit allen 62 Entities
- `bifroest-experts.json` - Experten-Datenbank
- `fungi/`, `plantae/`, etc. - Detaillierte Entity-Daten pro Domain

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `database.ts` | ⭐ JSON Data Loader (einzige Datenquelle!) |
| `config.ts` | Server-Konfiguration, Domain-Farben, Site-Types |
| `data.ts` | Datenlade-Abstraktion (ruft database.ts auf) |
| `cache.ts` | In-Memory Caching für Data Responses |
| `rate-limiter.ts` | Rate Limiting für API Requests |
| `logger.ts` | Strukturiertes Logging |

---

## database.ts - JSON Data Loader

### Hauptfunktionen

```typescript
// Species einer Domain laden (aus universe-index.json)
const species = await loadSpeciesByDomain('fungi');

// Experten laden (aus bifroest-experts.json)
const experts = await loadExperts();

// Entity Details laden (aus data-local/{domain}/{slug}/)
const entity = await loadEntityDetails('fungi', 'amanita-muscaria');

// Health Check
const health = await getHealthStatus();
```

### Daten-Struktur

```typescript
// data-local/universe-index.json
{
  "version": "2.0",
  "total": 62,
  "kingdoms": {
    "fungi": { "count": 27, ... },
    "plantae": { "count": 35, ... },
    ...
  },
  "species": [
    { "id": "agaricus-subrufescens", "scientificName": "...", ... }
  ]
}

// data-local/bifroest-experts.json
{
  "experts": {
    "paul-stamets": { "name": "...", "specialization": [...] }
  }
}
```

### Experten-System

```typescript
// Experten werden aus bifroest-experts.json geladen:
const experts = JSON.parse(fs.readFileSync('bifroest-experts.json'));

// Experten-Interface:
interface Expert {
  name: string;
  title: string;
  specialization: string[];
  affiliation: string;
  contact: { website, email, ... };
  publications: string[];
  perspectives: string[];
}
```

---

## data.ts - Datenlade-Abstraktion

### Einziger Modus: Lokale JSON-Dateien

```typescript
// loadAllItems() → lädt aus data-local/
export async function loadAllItems(): Promise<ItemData[]> {
  return await loadFromLocalFiles();
}
```

### Datenquellen

- `data-local/universe-index.json` - Species Index
- `data-local/bifroest-experts.json` - Experten
- `data-local/{domain}/{slug}/` - Entity Details

---

## config.ts

### Domain-Farben
```typescript
export const DOMAIN_COLORS: Record<string, string> = {
  fungi: 'hsl(220, 100%, 65%)',   // Blue
  phyto: 'hsl(160, 60%, 50%)',    // Jade
  drako: 'hsl(320, 80%, 65%)',    // Magenta
  // ... 17 Domains
};
```

### Site Meta
```typescript
export const SITE_META: Record<SiteType, SiteMeta> = {
  fungi: { name: 'FUNGINOMI', color: 'funginomi', collection: 'fungi', domain: 'biology' },
  // ... 17 Sites
};
```

---

## Environment Variables

```bash
# Standard (lokale JSON-Dateien)
DATA_SOURCE=local     # Verwendet data-local/ als Quelle

API_TIMEOUT=5000      # Timeout in ms
CACHE_TTL=300         # Cache-Dauer in Sekunden
```

---

## Wichtig

- ✅ Lokale JSON-Dateien als einzige Datenquelle (data-local/)
- ✅ Kein PostgreSQL/Prisma notwendig
- ✅ Fehlerbehandlung für fehlende Dateien (Error-State)
- ✅ In-Memory Caching für Performance

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |
| [../../../CLAUDE.md](../../../CLAUDE.md) | Monorepo Root |
| [../../../bifroest-platform/CLAUDE.md](../../../bifroest-platform/CLAUDE.md) | Backend |

---

*Letzte Aktualisierung: Januar 2026 - v8.0 (JSON-basiert)*
