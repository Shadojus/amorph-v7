# AMORPH Pages (v8.1)

> Teil von: [src](../CLAUDE.md) | Workspace Root: [Bifroest](../../../CLAUDE.md)

## Routen

| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | `index.astro` | ⭐ Landing Page mit Fog Sliders |
| `/{domain}` | `[domain].astro` | Domain Grid (fungi, phyto, etc.) |
| `/{domain}/{slug}` | `[domain]/[slug].astro` | Entity Detail |
| `/search` | `search.astro` | Cross-Domain Suche |
| `/api/nexus/*` | `api/nexus/` | Nexus API Endpoints |

## Page Structure

```astro
---
// Datenladen aus PostgreSQL (DATA_SOURCE=database)
const items = await loadSiteItems();  // → Prisma/PostgreSQL

// Oder spezifisches Item
const item = await loadItemBySlug(slug);
---
<Base>
  <ItemGrid {items} />
</Base>
```

## API-Endpunkte

| Route | Methode | Beschreibung |
|-------|---------|-------------|
| `/api/health` | GET | Server-Status |
| `/api/nexus/` | GET | Nexus API Index |
| `/api/nexus/domains` | GET | Alle 17 Domains |
| `/api/nexus/entities` | GET | Entities (filter: domain, search) |
| `/api/nexus/stats` | GET | Statistiken |
| `/api/search` | GET | Volltextsuche |

### Health Response

```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T...",
  "version": "8.1.0",
  "dataSource": "database"
}
```

## Related

| Datei | Beschreibung |
|-------|-------------|
| [../components/CLAUDE.md](../components/CLAUDE.md) | UI Components |
| [../server/CLAUDE.md](../server/CLAUDE.md) | Data Layer |
| [../layouts/CLAUDE.md](../layouts/CLAUDE.md) | Page Layouts |

---

> **v8.1:** Daten kommen aus PostgreSQL (`DATA_SOURCE=database`). Bilder in `public/images/`.
