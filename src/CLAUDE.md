# AMORPH Source (v8.0)

> Workspace Root: [Bifroest](../../CLAUDE.md)

## Struktur

| Ordner | Zweck | Details |
|--------|-------|---------|
| `client/` | Client-Side Scripts | [client/CLAUDE.md](client/CLAUDE.md) |
| `components/` | Astro Components | [components/CLAUDE.md](components/CLAUDE.md) |
| `core/` | Core Utilities | [core/CLAUDE.md](core/CLAUDE.md) |
| `layouts/` | Page Layouts | [layouts/CLAUDE.md](layouts/CLAUDE.md) |
| `morphs/` | Data Visualizations | [morphs/CLAUDE.md](morphs/CLAUDE.md) |
| `observer/` | Comparison Engine | [observer/CLAUDE.md](observer/CLAUDE.md) |
| `pages/` | Routes & API | [pages/CLAUDE.md](pages/CLAUDE.md) |
| `server/` | Data Layer, Config | [server/CLAUDE.md](server/CLAUDE.md) |

## Wichtige Dateien

### Server
- `server/config.ts` - ⭐ Zentrale Konfiguration
- `server/data.ts` - Daten-Layer (Local JSON / PostgreSQL)
- `server/database.ts` - PostgreSQL/Prisma Interface

### Core
- `core/validation.ts` - Input-Validierung
- `core/utils.ts` - Utility-Funktionen

## Datenfluss (v8.0)

```
Local JSON (data-local/)
        ↓
   loadSiteItems()
        ↓
   config.daten.yaml
        ↓
  Astro SSR Pages
```

### Datenquellen

| Mode | Beschreibung |
|------|-------------|
| `local` | JSON-Dateien in `data-local/` (Default) |
| `postgres` | PostgreSQL/Prisma (Produktion) |

## API Endpoints

| Endpoint | Beschreibung |
|----------|-------------|
| `/api/health` | Server Status |
| `/api/items` | Species-Liste |
| `/api/item/[slug]` | Einzelne Species |
| `/api/search` | Suche |

## Konfiguration

```yaml
# config-local/daten.yaml
daten:
  typ: lokal
  ordner: data-local
```

---

> **v8.0:** Kein PocketBase mehr. Lokale JSON-Daten + PostgreSQL/Prisma.
