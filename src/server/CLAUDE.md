# Server Module

PocketBase Client und Datenlade-Logik für AMORPH.

## ⚠️ Wichtig: Nur PocketBase!

```bash
DATA_SOURCE=pocketbase  # IMMER - kein 'local' oder 'auto' mehr!
```

Alle lokalen JSON-Fallbacks werden entfernt.

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `bifroest.ts` | ⭐ PocketBase API Client (einzige Datenquelle!) |
| `config.ts` | Server-Konfiguration, Domain-Farben, Site-Types |
| `data.ts` | Datenlade-Abstraktion (ruft bifroest.ts auf) |
| `cache.ts` | In-Memory Caching für PocketBase Responses |
| `rate-limiter.ts` | Rate Limiting für API Requests |
| `logger.ts` | Strukturiertes Logging |

---

## bifroest.ts - PocketBase Client

### Hauptfunktionen

```typescript
// Entities einer Domain laden
const entities = await loadSiteItems();

// Experten für ein Feld laden
const experts = await getExpertsForField('habitat');
// → Matched via expert.field_expertise.includes('habitat')

// Collection direkt abfragen
const records = await fetchFromCollection('fungi');

// Health Check
const isUp = await checkBifroestConnection();
```

### Collection-Zuordnung

```typescript
// Jede Domain hat ihre eigene Collection
'fungi' → fungi_entities
'phyto' → phyto_entities
'drako' → drako_entities
// etc. (17 Domains)
```

### Experten-System

```typescript
// Experten werden geladen und zu Feldern zugeordnet:
const matchingExperts = loadedExperts.filter(expert => 
  expert.field_expertise?.includes(fieldKey)
);

// Experten-Interface:
interface Expert {
  name: string;
  domain: 'fungi' | 'phyto' | 'drako' | ... // 17 Domains
  field_expertise: string[];  // z.B. ["habitat", "edibility", "genus"]
  impact_score: number;       // NIEMALS an Client senden!
  verified: boolean;
}
```

---

## data.ts - Datenlade-Abstraktion

### Einziger Modus: PocketBase

```typescript
// loadAllItems() → ruft loadFromBifroest() auf
// KEIN Fallback auf lokale Dateien mehr!
export async function loadAllItems(): Promise<ItemData[]> {
  return await loadFromBifroest();
}
```

### Legacy-Code (wird entfernt)

Der lokale JSON-Loader (`safeReadJson`, `DATA_PATH`, etc.) ist noch vorhanden, wird aber nicht mehr verwendet und in der nächsten Version entfernt.

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
POCKETBASE_URL=http://127.0.0.1:8090   # PocketBase API
DATA_SOURCE=pocketbase                  # Einziger unterstützter Wert!
API_TIMEOUT=5000                        # Timeout in ms
CACHE_TTL=300                           # Cache-Dauer in Sekunden
```

---

## Wichtig

- ❌ KEINE lokalen JSON-Dateien verwenden
- ❌ KEINE `DATA_SOURCE=local` oder `DATA_SOURCE=auto`
- ✅ Immer über bifroest.ts → PocketBase
- ✅ Fehlerbehandlung für offline PocketBase (Error-State, kein Fallback!)

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |
| [../../../CLAUDE.md](../../../CLAUDE.md) | Monorepo Root |
| [../../../bifroest-platform/claude.md](../../../bifroest-platform/claude.md) | Backend |

---

*Letzte Aktualisierung: Januar 2026*
