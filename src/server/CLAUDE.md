# Server Module

Prisma Database Client und Datenlade-Logik für AMORPH.

## ⚠️ Wichtig: PostgreSQL/Prisma!

```bash
# Development (SQLite)
DATA_SOURCE=local
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATA_SOURCE=postgresql
DATABASE_URL="postgresql://user:password@host:5432/bifroest"
```

Alle lokalen JSON-Fallbacks wurden entfernt.

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `database.ts` | ⭐ Prisma Database Client (einzige Datenquelle!) |
| `config.ts` | Server-Konfiguration, Domain-Farben, Site-Types |
| `data.ts` | Datenlade-Abstraktion (ruft database.ts auf) |
| `cache.ts` | In-Memory Caching für Database Responses |
| `rate-limiter.ts` | Rate Limiting für API Requests |
| `logger.ts` | Strukturiertes Logging |

---

## database.ts - Prisma Client

### Hauptfunktionen

```typescript
// Entities einer Domain laden
const entities = await getEntitiesByDomain('fungi');

// Experten für ein Feld laden
const experts = await getExpertsForField('habitat');
// → Matched via expert.fieldExpertise.includes('habitat')

// Entity direkt abfragen
const entity = await getEntityBySlug('fungi', 'amanita-muscaria');

// Health Check
const isUp = await checkDatabaseConnection();
```

### Table-Struktur

```typescript
// Unified Entity Table mit domainId FK
domains → entities (via domainId)

// Perspektiven-Daten
entities → entity_perspectives (via entityId)
perspectives → entity_perspectives (via perspectiveId)

// Community Links
entities → external_links (via entityId)
external_links → link_votes (via linkId)

// Experten mit Publikationen
experts → publications (via expertId)
```

### Experten-System

```typescript
// Experten werden geladen und zu Feldern zugeordnet:
const matchingExperts = loadedExperts.filter(expert => 
  expert.fieldExpertise?.includes(fieldKey)
);

// Experten-Interface:
interface Expert {
  name: string;
  domain: 'fungi' | 'phyto' | 'drako' | ... // 17 Domains
  fieldExpertise: string[];   // z.B. ["habitat", "edibility", "genus"]
  impactScore: number;        // NIEMALS an Client senden!
  isVerified: boolean;
}
```

---

## data.ts - Datenlade-Abstraktion

### Einziger Modus: PostgreSQL/SQLite (via Prisma)

```typescript
// loadAllItems() → ruft loadFromDatabase() auf
// KEIN Fallback auf lokale Dateien mehr!
export async function loadAllItems(): Promise<ItemData[]> {
  return await loadFromDatabase();
}
```

### Legacy-Code (entfernt)

Der lokale JSON-Loader (`safeReadJson`, `DATA_PATH`, etc.) wurde entfernt.

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
# Development (SQLite)
DATA_SOURCE=local
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATA_SOURCE=postgresql
DATABASE_URL="postgresql://user:password@host:5432/bifroest"

API_TIMEOUT=5000                        # Timeout in ms
CACHE_TTL=300                           # Cache-Dauer in Sekunden
```

---

## Wichtig

- ❌ KEINE lokalen JSON-Dateien verwenden
- ❌ KEINE `DATA_SOURCE=pocketbase` mehr
- ✅ Immer über database.ts → Prisma → PostgreSQL/SQLite
- ✅ Fehlerbehandlung für offline Database (Error-State, kein Fallback!)

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |
| [../../../CLAUDE.md](../../../CLAUDE.md) | Monorepo Root |
| [../../../bifroest-platform/CLAUDE.md](../../../bifroest-platform/CLAUDE.md) | Backend |

---

*Letzte Aktualisierung: Januar 2026*
