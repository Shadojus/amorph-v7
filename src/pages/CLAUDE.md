# AMORPH Pages (v8.2)

> Teil von: [src](../CLAUDE.md) | Workspace Root: [Bifroest](../../../CLAUDE.md)

## Routen

| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | `index.astro` | ⭐ Landing Page mit Bloom Controls |
| `/{domain}` | `[domain].astro` | Domain Grid (fungi, phyto, etc.) |
| `/{domain}/{slug}` | `[domain]/[slug].astro` | Entity Detail |
| `/search` | `search.astro` | Cross-Domain Suche |
| `/api/nexus/*` | `api/nexus/` | Nexus API Endpoints |

## Landing Page (index.astro)

Die Landing Page verwendet **Bloom Controls** im "Blume des Lebens" Stil:

### 4 Super-Domains
- **LIFE** (top-left): fungi, phyto, drako, bakterio, viro - `#4AE3A7`
- **SCIENCE** (top-right): geno, anato, chemo, physi, kosmo - `#A78BFA`
- **EARTH** (bottom-left): mine, tekto, paleo - `#F59E0B`
- **SYSTEMS** (bottom-right): netzo, cognito, biotech, socio - `#38BDF8`

### Interaktion
- **Vertikales Ziehen** ändert Kreis-Größe (0-100%)
- **Top-Ecken:** Nach unten ziehen = größer
- **Bottom-Ecken:** Nach oben ziehen = größer
- **Doppelklick:** Reset auf 20%
- Bei 100% überlappen sich alle Kreise in der Mitte

### CSS-Klassen
- `.bloom-control` - Container in jeder Ecke
- `.bloom-circle` - Der expandierende Kreis
- `.bloom-glow` - Glow-Effekt
- `.bloom-label` - Label (LIFE, SCIENCE, etc.)
- `.bloom-value` - Prozent-Anzeige beim Ziehen

## API-Endpunkte

| Route | Methode | Beschreibung |
|-------|---------|-------------|
| `/api/health` | GET | Server-Status |
| `/api/nexus/` | GET | Nexus API Index |
| `/api/nexus/domains` | GET | Alle 17 Domains |
| `/api/nexus/entities` | GET | Entities (filter: domain, search) |
| `/api/nexus/search` | GET | **Faceted Search** |
| `/api/nexus/stats` | GET | Statistiken |
| `/api/nexus/links` | GET/POST | External Links |
| `/api/nexus/vote` | POST | Voting |
| `/api/nexus/perspectives` | GET | Perspektiven |

### Faceted Search
```bash
GET /api/nexus/search?q=pilz&domains=fungi,phyto&limit=20
```

Gibt Entities mit ihren Cross-Domain Facets zurück.

---

*Letzte Aktualisierung: 8. Januar 2026*
