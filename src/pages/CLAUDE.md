# AMORPH Pages (v8.0)

> Teil von: [src](../CLAUDE.md) | Workspace Root: [Bifroest](../../../CLAUDE.md)

## Routen

| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | `index.astro` | Startseite |
| `/[slug]` | `[slug].astro` | Species-Detail |
| `/[a]/vs/[b]` | `[a]/vs/[b].astro` | Vergleich |
| `/suche` | `suche.astro` | Suchseite |
| `/api/*` | `api/` | API-Endpoints |

## Page Structure

```astro
---
// Datenladen aus lokalem JSON
const items = await loadSiteItems();  // → data-local/

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
| `/api/items` | GET | Alle Items |
| `/api/item/[slug]` | GET | Item nach Slug |
| `/api/search` | GET | Suche |

### Health Response

```json
{
  "status": "healthy",
  "timestamp": "2025-01-02T...",
  "version": "8.0.0",
  "dataSource": "local"
}
```

## Dynamische Routes

### `/[slug].astro`

```astro
---
export async function getStaticPaths() {
  const items = await loadSiteItems();
  return items.map(item => ({
    params: { slug: item.slug },
    props: { item }
  }));
}

const { item } = Astro.props;
---
```

## Related

| Datei | Beschreibung |
|-------|-------------|
| [../components/CLAUDE.md](../components/CLAUDE.md) | UI Components |
| [../server/CLAUDE.md](../server/CLAUDE.md) | Data Layer |
| [../layouts/CLAUDE.md](../layouts/CLAUDE.md) | Page Layouts |

---

> **v8.0:** Daten kommen aus lokalen JSON-Dateien (`data-local/`).
