# Server Module (v8.7)

PostgreSQL-Only Data Layer für AMORPH.

## ⚠️ PostgreSQL-Only Edition!

```bash
# Einzige Datenquelle (keine JSON-Fallbacks!)
DATABASE_URL=postgresql://bifroest:bifroest2024@localhost:5432/bifroest

# Bilder sind die einzigen lokalen Ressourcen:
# public/images/{domain}/{slug}/
```

**Datenquelle:** PostgreSQL (Container: bifroest-postgres)

- 17 Domains registriert
- 118 Entities (66 Production + 52 Mock)
- 10 Experten (mit fieldExpertise!)
- 654 EntityFacets
- Bilder: `public/images/{domain}/{slug}/`

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `db.ts` | ⭐ Prisma Client (PostgreSQL) |
| `data-db.ts` | ⭐ PostgreSQL Data Loader |
| `data.ts` | Datenlade-Abstraktion (DB-only, keine Fallbacks!) |
| `config.ts` | Server-Konfiguration, Domain-Farben, Site-Types |
| `cache.ts` | In-Memory Caching für Data Responses |
| `rate-limiter.ts` | Rate Limiting für API Requests |
| `logger.ts` | Strukturiertes Logging |

---

## data-db.ts - PostgreSQL Data Loader

### Hauptfunktionen

```typescript
// Alle Items aus PostgreSQL laden
const items = await loadAllItemsFromDB(domain);
// → Entities + EntityFacets aus allen Domains

// Experten aus PostgreSQL laden
const experts = await loadExpertsFromDB(domain);
// → Experts mit fieldExpertise Array

// Globale Items für Landing-Page
const items = await loadGlobalItems();
// → Items aus ALLEN 17 Domains
```

### Expert-Struktur (v8.7)

```typescript
// Experten in PostgreSQL mit fieldExpertise
{
  id: string,
  name: string,
  domain: string,           // "fungi", "kosmo", etc.
  fieldExpertise: string[], // ["description", "ecology", ...]
  impactScore: number,
  isVerified: boolean
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
