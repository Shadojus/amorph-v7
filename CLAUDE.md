# AMORPH v8.1

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für wissenschaftliche Daten - EINE Instanz für ALLE 17 Domains.

## Status: ✅ Production Ready (Januar 2026)

### Aktuelle Architektur
```
┌─────────────────────────────────────────────────────────────────┐
│  AMORPH v8.1 - Single Instance Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Port 4321 - EINE Astro-Instanz für ALLE Domains                │
│                                                                 │
│  Routes:                                                        │
│  ├─ /                      Grid (aktuelle Domain via SITE_TYPE) │
│  ├─ /{slug}                Entity Detail Page                   │
│  ├─ /api/nexus/*           Nexus API (7 Endpoints)              │
│  ├─ /api/search            Volltextsuche                        │
│  └─ /api/health            Health Check                         │
│                                                                 │
│  Datenquelle:                                                   │
│  └─ PostgreSQL (DATA_SOURCE=database)                           │
│     ├─ 17 Domains registriert                                   │
│     ├─ 67 Entities (30 Fungi, 37 Phyto)                         │
│     └─ 6 Perspektiven                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Features
- **🔗 PostgreSQL Integration** - Zentrale Datenbank
- **📊 Nexus API** - REST API für alle Domains
- **17 Domains** - Alle über eine Instanz
- **28 Morph Primitives** - Komponenten-Bibliothek
- **~475 Tests** - Vitest

### Technologie-Stack
- **Astro 5.x** mit SSR
- **TypeScript** durchgängig
- **Prisma** als ORM
- **PostgreSQL** als Datenbank
- **Vitest** für Tests

---

## ⚠️ WICHTIG: Single Instance!

```
❌ NICHT MEHR: 17 separate Server auf Ports 4321-4337
✅ JETZT: EINE Instanz auf Port 4321 für ALLE Domains

Die Domain wird gewählt durch:
1. SITE_TYPE Environment Variable (default: fungi)
2. URL-Parameter (geplant)
3. API Endpoints arbeiten domain-übergreifend
```

---

## 🌐 Die 17 Domains

| Kategorie | Slug | Name | Entities |
|-----------|------|------|----------|
| **Biology** | fungi | FUNGINOMI | 30 ✅ |
| | phyto | PHYTONOMI | 37 ✅ |
| | drako | DRAKONOMI | 0 |
| **Geology** | paleo | PALEONOMI | 0 |
| | tekto | TEKTONOMI | 0 |
| | mine | MINENOMI | 0 |
| **Biomedical** | bakterio | BAKTERIONOMI | 0 |
| | viro | VIRONOMI | 0 |
| | geno | GENONOMI | 0 |
| | anato | ANATONOMI | 0 |
| **PhysChem** | chemo | CHEMONOMI | 0 |
| | physi | PHYSINOMI | 0 |
| | kosmo | KOSMONOMI | 0 |
| **Technology** | netzo | NETZONOMI | 0 |
| | cognito | COGNITONOMI | 0 |
| | biotech | BIONOMI | 0 |
| | socio | SOCIONOMI | 0 |

> ⚠️ Nur Fungi und Phyto haben aktuell Daten!

---

## 🚀 Quick Start

```powershell
# Vom Bifroest Root-Verzeichnis:
.\bifroest-cli.ps1 start    # PostgreSQL + AMORPH

# Oder manuell:
cd amorph
$env:DATA_SOURCE="database"
$env:DATABASE_URL="postgresql://bifroest:bifroest_secret@localhost:5432/bifroest"
npm run dev
```

---

## 📁 Projektstruktur

```
amorph/
├── CLAUDE.md                    # Diese Datei
├── config-local/                # Site-Konfiguration
│
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── nexus/           # ⭐ Nexus API
│   │   │   │   ├── index.ts     # GET /api/nexus
│   │   │   │   ├── domains.ts   # GET /api/nexus/domains
│   │   │   │   ├── entities.ts  # GET /api/nexus/entities
│   │   │   │   ├── stats.ts     # GET /api/nexus/stats
│   │   │   │   ├── links.ts     # GET/POST /api/nexus/links
│   │   │   │   ├── vote.ts      # POST /api/nexus/vote
│   │   │   │   └── perspectives.ts
│   │   │   ├── search.ts
│   │   │   └── health.ts
│   │   ├── index.astro          # Grid View
│   │   └── [slug].astro         # Detail View
│   │
│   ├── server/
│   │   ├── config.ts            # Domain Config (17 Domains)
│   │   ├── data.ts              # Data Layer
│   │   ├── data-db.ts           # PostgreSQL Queries
│   │   └── database.ts          # Prisma Client
│   │
│   ├── morphs/                  # 28 Morph Primitives
│   ├── core/                    # Types, Detection, Security
│   └── client/                  # Frontend Features
│
└── tests/                       # Vitest Tests
```

---

## 📡 Nexus API Endpoints

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/api/nexus` | GET | API Index & Endpoints |
| `/api/nexus/domains` | GET | Alle 17 Domains |
| `/api/nexus/domains?stats=true` | GET | Mit Entity-Counts |
| `/api/nexus/entities` | GET | Alle Entities |
| `/api/nexus/entities?domain=fungi` | GET | Nach Domain |
| `/api/nexus/entities?search=pilz` | GET | Suche |
| `/api/nexus/entities?limit=10&offset=0` | GET | Pagination |
| `/api/nexus/stats` | GET | System-Statistiken |
| `/api/nexus/links` | GET | External Links |
| `/api/nexus/links` | POST | Link erstellen |
| `/api/nexus/vote` | POST | Voting |
| `/api/nexus/perspectives` | GET | Perspektiven |

### Beispiel-Responses

```bash
# Domains mit Stats
curl http://localhost:4321/api/nexus/domains?stats=true

# Fungi Entities
curl http://localhost:4321/api/nexus/entities?domain=fungi&limit=5

# System Stats
curl http://localhost:4321/api/nexus/stats
```

---

## 🔧 Environment Variables

```bash
# Datenquelle
DATA_SOURCE=database              # database oder local

# PostgreSQL
DATABASE_URL=postgresql://bifroest:bifroest_secret@localhost:5432/bifroest

# Default Domain (für Grid View)
SITE_TYPE=fungi                   # fungi, phyto, paleo, etc.
```

---

## 🎨 28 Morph Primitives

| Kategorie | Morphs |
|-----------|--------|
| **Text** | text, editor, tagline |
| **Visual** | badge, gauge, bar, range |
| **Lists** | list, tag, chips |
| **Media** | image, gallery, video |
| **Data** | number, boolean, date |
| **Special** | taxonomy, sources, links |

---

## 📚 Verwandte Docs

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | Root-Dokumentation |
| [src/server/CLAUDE.md](src/server/CLAUDE.md) | Database/Data Layer |
| [src/morphs/CLAUDE.md](src/morphs/CLAUDE.md) | Morph Primitives |
| [src/pages/CLAUDE.md](src/pages/CLAUDE.md) | Routes & API |

---

*Letzte Aktualisierung: 8. Januar 2026*
