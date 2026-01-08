# Pages

Astro-Routen für AMORPH.

---

## Routen

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/` | `index.astro` | Startseite mit Pagination |
| `/[slug]` | `[slug].astro` | Species Detail-Seite |
| `/api/search` | `api/search.ts` | Such-API |
| `/api/compare` | `api/compare.ts` | Compare-API |

---

## Datenfluss

```astro
---
// [slug].astro
import { loadAllItems } from '@/server/data';

const { slug } = Astro.params;
const items = await loadAllItems();  // → PocketBase!
const item = items.find(s => s.slug === slug);
---

<Layout>
  <SpeciesDetail item={item} />
</Layout>
```

---

## API Endpoints

### GET /api/search
```
/api/search?q=pilz&p=culinary,safety&limit=20
```

### POST /api/compare
```json
{
  "fields": [...]
}
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../server/CLAUDE.md](../server/CLAUDE.md) | PocketBase Client |

---

*Letzte Aktualisierung: Januar 2026*
