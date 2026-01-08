# Pages

Astro-Routen für AMORPH.

---

## Routen

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/` | `index.astro` | Startseite mit Pagination |
| `/[slug]` | `[slug].astro` | Entity Detail-Seite |
| `/api/search` | `api/search.ts` | Such-API |
| `/api/compare` | `api/compare.ts` | Compare-API |
| `/api/autocomplete` | `api/autocomplete.ts` | Autovervollständigung |
| `/api/health` | `api/health.ts` | Health Check |

---

## Datenfluss

```astro
---
// [slug].astro
import { loadSiteItems } from '@/server/bifroest';

const { slug } = Astro.params;
const items = await loadSiteItems();  // → PocketBase!
const item = items.find(s => s.slug === slug);
---

<Layout>
  <EntityDetail item={item} />
</Layout>
```

---

## API Endpoints

### GET /api/search
```
/api/search?q=pilz&p=culinary,safety&limit=20
```

### GET /api/autocomplete
```
/api/autocomplete?q=aga&limit=10
```

### POST /api/compare
```json
{
  "fields": [...]
}
```

### GET /api/health
```
/api/health → { status: "ok", pocketbase: true }
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../server/CLAUDE.md](../server/CLAUDE.md) | PocketBase Client |

---

*Letzte Aktualisierung: Januar 2026*
