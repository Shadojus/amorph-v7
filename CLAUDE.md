# AMORPH v8.7.1 - Score-Based Bloom Controls Edition

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für wissenschaftliche Daten - EINE Instanz für ALLE 17 Domains.

## Status: ✅ Production Ready (Januar 2026)

### Aktuelle Architektur
```
┌─────────────────────────────────────────────────────────────────┐
│  AMORPH v8.7.1 - Score-Based Bloom Controls                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Port 4321 - EINE Astro-Instanz für ALLE Domains                │
│                                                                 │
│  Routes:                                                        │
│  ├─ /                      ⭐ UNIFIED Landing (113 Entities!)   │
│  │   ├─ Design: Exakte Kopie von [domain].astro                 │
│  │   ├─ loadGlobalItems() aus allen 17 Domains                  │
│  │   ├─ Score-Based Bloom Controls (4 Ecken)                    │
│  │   │   ├─ LIFE (fungi, phyto, drako, bakterio, viro)          │
│  │   │   ├─ SCIENCE (chemo, physi, geno, biotech)               │
│  │   │   ├─ EARTH (mine, tekto, kosmo, paleo)                   │
│  │   │   └─ SYSTEMS (netzo, socio, cognito)                     │
│  │   ├─ Score-Berechnung: domainScore * bloomWeight * engagement│
│  │   ├─ My Species Panel mit Bifroest Activator                 │
│  │   ├─ Fog Corner Effects pro Super-Domain                     │
│  │   └─ Domain Badges auf jedem Item                            │
│  ├─ /{domain}              Domain Grid (fungi, phyto, etc.)     │
│  ├─ /{domain}/{slug}       Entity Detail Page                   │
│  ├─ /api/nexus/*           Nexus API (8 Endpoints)              │
│  ├─ /api/nexus/experts     Experten-API (10 Experten in DB)     │
│  ├─ /api/nexus/stats       Stats mit Facet-Count (NEU!)         │
│  └─ /api/health            Health Check                         │
│                                                                 │
│  Datenquelle: PostgreSQL-Only (KEINE JSON-Fallbacks!)           │
│  └─ DATABASE_URL=postgresql://bifroest:bifroest2024@...         │
│     ├─ 17 Domains registriert                                   │
│     ├─ 113 Entities aus allen Domains                           │
│     ├─ 10 Experten (mit Domain-Attribution!)                    │
│     └─ 339 EntityFacets (Cross-Domain Relations)                │
│                                                                 │
│  Lokale Ressourcen: NUR Bilder!                                 │
│  └─ public/images/{domain}/{slug}/                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Unified Landing Page (index.astro)

Die Landing Page ist eine **exakte Kopie** des Domain-Page Designs ([domain].astro) und zeigt **118 Entities aus allen 17 Domains**:

### Design-Elemente (identisch zu Domain-Seiten)
- **Header** mit Suchfeld und Filteroptionen
- **Grid** mit responsiven Item-Cards
- **My Species Panel** (rechts) mit Status-Anzeige
- **Bifroest Activator** Button
- **Bottom Navigation** mit Domain-Links
- **Domain Badges** auf jedem Item (🍄FUNGI, 🌿PLANTAE, etc.)

### Score-Based Bloom Controls
```
┌──────────────────────────────────────────────────────────────┐
│  LIFE (TL)                                      SCIENCE (TR) │
│  ├─ fungi, phyto, drako, bakterio, viro         ├─ chemo,    │
│  └─ Slider 0-100%                                  physi,    │
│                                                    geno,     │
│          [═══════ GRID ═══════]                    biotech   │
│                                                              │
│  EARTH (BL)                                     SYSTEMS (BR) │
│  ├─ mine, tekto, kosmo, paleo                   ├─ netzo,    │
│  └─ Slider 0-100%                                  socio,    │
│                                                    cognito   │
└──────────────────────────────────────────────────────────────┘
```

### Score-Berechnung
```typescript
// Für jedes Item wird ein Gesamt-Score berechnet:
const calculateItemScore = (item, bloomWeights) => {
  const domainScores = Object.entries(superDomainConfig)
    .map(([sd, config]) => {
      if (config.domains.includes(item.domain)) {
        return bloomWeights[sd] * 100; // 0-100
      }
      return 0;
    });
  
  // Höchster Score gewinnt
  return Math.max(...domainScores);
};

// Items werden nach Score gefiltert und sortiert
const threshold = 10; // Minimum Score zum Anzeigen
visibleItems = items.filter(i => calculateItemScore(i) >= threshold);
```

### Daten-Fluss
```
src/server/data.ts
├─ loadGlobalItems()        # Lädt aus allen 17 Domains
│   └─ data-db.ts
│       └─ loadItemsFromAllDomains()  # Prisma Query ohne Domain-Filter
│
src/pages/index.astro
├─ featuredItems = await loadGlobalItems()
├─ Super-Domain Score Berechnung (runtime)
└─ Client-side Bloom Controls mit Slider-Interaktion
```

### Farben (Gedämpft & Professionell)

**Domain-Farben:**
```typescript
const domainColors = {
  fungi: '#8B9DC3',    // Gedämpftes Blau-Grau
  phyto: '#7A9E7E',    // Gedämpftes Grün
  drako: '#6B9B9B',    // Gedämpftes Türkis
  bakterio: '#B87A7A', // Gedämpftes Rot
  viro: '#8E7BA8',     // Gedämpftes Violett
  chemo: '#A89A7A',    // Gedämpftes Gold
  physi: '#7A8EA8',    // Gedämpftes Stahlblau
  geno: '#9A7A9A',     // Gedämpftes Magenta
  biotech: '#7AA87A',  // Gedämpftes Smaragd
  mine: '#9A8A7A',     // Gedämpftes Braun
  tekto: '#8A7A6A',    // Gedämpftes Terrakotta
  kosmo: '#6A7A8A',    // Gedämpftes Nachtblau
  paleo: '#8A9A7A',    // Gedämpftes Olive
  netzo: '#7A8A9A',    // Gedämpftes Cyan
  socio: '#9A8A8A',    // Gedämpftes Mauve
  cognito: '#8A8A9A',  // Gedämpftes Lavendel
  anato: '#9A7A8A',    // Gedämpftes Rose
};
```

**Super-Domain-Farben (für Bloom Controls):**
```typescript

---

## 🎮 Bloom Controls

Die Landing Page verwendet Score-basierte Bloom Controls in 4 Ecken:

### Super-Domain Konfiguration
```typescript
const superDomainConfig = {
  life: {
    domains: ['fungi', 'phyto', 'drako', 'bakterio', 'viro'],
    color: '#6B9B8A',  // Gedämpftes Grün
    position: 'top-left'
  },
  science: {
    domains: ['chemo', 'physi', 'geno', 'biotech'],
    color: '#7B82A8',  // Gedämpftes Blau-Violett
    position: 'top-right'
  },
  earth: {
    domains: ['mine', 'tekto', 'kosmo', 'paleo'],
    color: '#8F7A5A',  // Gedämpftes Erdbraun
    position: 'bottom-left'
  },
  systems: {
    domains: ['netzo', 'socio', 'cognito'],
    color: '#5A7A8F',  // Gedämpftes Stahlblau
    position: 'bottom-right'
  }
};
```

### Interaktion
- **Slider 0-100%** pro Super-Domain (Default: 50%)
- **Score-Berechnung**: Item-Domain-Score × Bloom-Weight
- **Fog Corner Effects**: Visuelle Nebel-Ecken zeigen Gewichtung
- **Live-Update**: Grid filtert sich sofort bei Slider-Bewegung

---

## 📁 Verzeichnisstruktur

```
amorph/
├── src/
│   ├── pages/
│   │   ├── index.astro           # ⭐ Landing mit Score-Based Bloom
│   │   │   ├─ Design: Kopie von [domain].astro
│   │   │   ├─ My Species Panel
│   │   │   ├─ Bifroest Activator
│   │   │   └─ 4 Bloom Corner Controls
│   │   ├── [domain].astro        # Domain Grid (/fungi, /phyto, etc.)
│   │   ├── [domain]/
│   │   │   └── [slug].astro      # Entity Detail
│   │   └── api/
│   │       └── nexus/            # 8 API Endpoints
│   │           ├── index.ts
│   │           ├── domains.ts
│   │           ├── entities.ts
│   │           ├── search.ts     # ⭐ Faceted Search
│   │           ├── stats.ts
│   │           ├── links.ts
│   │           ├── vote.ts
│   │           └── perspectives.ts
│   │
│   ├── server/
│   │   ├── config.ts             # 17 Domain Config
│   │   ├── data.ts               # Data Layer
│   │   └── data-db.ts            # PostgreSQL Queries
│   │
│   ├── morphs/                   # 28 Morph Primitives
│   │   ├── MorphImage.astro
│   │   ├── MorphText.astro
│   │   ├── MorphNumber.astro
│   │   └── ... (25 weitere)
│   │
│   ├── components/               # UI Components
│   ├── layouts/                  # Base Layouts
│   └── client/                   # Client-side JS
│
├── config-local/                 # Site Configuration
├── public/images/                # Bilder (Fungi, Phyto)
└── tests/                        # Vitest Tests
```

---

## 📡 Nexus API

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/api/nexus` | GET | API Index |
| `/api/nexus/domains` | GET | Alle 17 Domains |
| `/api/nexus/domains?stats=true` | GET | Mit Entity-Counts |
| `/api/nexus/entities` | GET | Alle Entities |
| `/api/nexus/entities?domain=fungi` | GET | Nach Domain filtern |
| `/api/nexus/search` | GET | **Faceted Search** |
| `/api/nexus/stats` | GET | Statistiken |
| `/api/nexus/links` | GET/POST | External Links |
| `/api/nexus/vote` | POST | Voting |
| `/api/nexus/perspectives` | GET | Perspektiven |

### Faceted Search API
```bash
GET /api/nexus/search?q=pilz&domains=fungi,phyto&limit=20
```

Gibt Entities mit ihren Cross-Domain Facets zurück, gewichtet nach relevance.

---

## 🔧 Konfiguration

### Environment Variables
```env
DATA_SOURCE=database
DATABASE_URL=postgresql://bifroest:bifroest_secret@localhost:5432/bifroest
SITE_TYPE=fungi
```

### Starten
```bash
cd amorph
npm run dev          # Startet auf Port 4321 (oder 4322)
npm run build        # Production Build
npm run test         # Vitest
```

---

## 📊 Statistiken

| Metrik | Wert |
|--------|------|
| Astro Version | 5.x |
| Domains | 17 |
| Entities | 113 |
| Experts | 10 (mit Domain-Attribution!) |
| EntityFacets | 339 |
| Morph Primitives | 28 |
| Tests | **737 ✅** (inkl. 19 Expert Attribution Tests) |
| Port | 4321/4322 |

---

## ⭐ Bifroest Expert Attribution System

Das Bifroest-System zeigt Quellen-Attribution für Datenfelder:

### Features (v8.7.1)
- **Multi-Domain Support** - Lädt Experten für ALLE sichtbaren Domains auf Landing-Page
- **Domain-Filtering** - Experten erscheinen nur bei Items aus ihrer eigenen Domain
- **Field Matching** - Basierend auf `fieldExpertise` Array
- **Caching** - SessionStorage mit 10min TTL

### Architektur
```
loadAndDisplayExperts()
├── isLandingPage()? → Lädt ALLE sichtbaren Domains parallel
│   └── getVisibleDomains() → Promise.all(fetchExperts())
└── Single Domain → fetchExperts(currentDomain) mit Cache

applyExpertsToFields()
├── Iteriere über alle .amorph-field Elemente
├── Finde Experten mit passendem field_expertise
├── ⭐ Domain-Check: expert.domain === itemDomain
└── Füge Experten-Button mit Info hinzu
```

### Expert fieldExpertise
```typescript
// Experten werden Feldern zugeordnet:
['description', 'categories', 'keywords', 'ecology', 'habitat',
 'chemistry', 'genetics', 'anatomy', 'morphology', 'taxonomy']
```

---

*Letzte Aktualisierung: 9. Januar 2026 - v8.7 Multi-Domain Experts*
