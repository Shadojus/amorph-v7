# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für wissenschaftliche Daten mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready (Januar 2026)

### Aktuelle Features
- **🔗 BIFROEST Integration** - Daten aus PostgreSQL/Prisma (SQLite als Dev-Fallback)
- **📊 Unified Entity Table** - Alle Entities mit domainId Foreign Key
- **17 Domains** - Wissenschaftliche Multi-Site Architektur
- **28 Morph Primitives** - Vollständige Komponenten-Bibliothek
- **475 Tests** - Umfassende Testabdeckung (37 Dateien)

### Technologie-Stack
- **Astro 5.16** mit SSR
- **TypeScript** durchgängig
- **Vitest** für Tests
- **PostgreSQL/Prisma** als einzige Datenquelle (SQLite für Development)

---

## ⚠️ Wichtig: PostgreSQL/Prisma!

```
❌ data-local/     → LEGACY (nicht verwenden!)
❌ data/           → Symlink zu data-local (entfernen!)
❌ config/         → Symlink zu config-local (entfernen!)
❌ PocketBase      → MIGRIERT zu PostgreSQL
✅ PostgreSQL      → Production Datenquelle
✅ SQLite          → Development Fallback (via Prisma)
```

**Bilder**: Werden im File System gespeichert, Pfade in der Datenbank!

---

## 🌐 Multi-Domain System (17 Sites)

| Port | Site | Domain | Kategorie |
|------|------|--------|-----------|
| 4321 | Funginomi | fungi | Biologie |
| 4322 | Phytonomi | phyto | Biologie |
| 4323 | Drakonomi | drako | Biologie |
| 4324 | Bakterionomi | bakterio | Biologie |
| 4325 | Vironomi | viro | Biologie |
| 4326 | Genonomi | geno | Biologie |
| 4327 | Anatonomi | anato | Medizin |
| 4328 | Chemonomi | chemo | Chemie |
| 4329 | Physikonomi | physi | Physik |
| 4330 | Kosmonomi | kosmo | Astronomie |
| 4331 | Minenomi | mine | Geologie |
| 4332 | Tektonomi | tekto | Geologie |
| 4333 | Paleonomi | paleo | Paläontologie |
| 4334 | Netzonomi | netzo | Informatik |
| 4335 | Cognitonomi | cognito | KI |
| 4336 | Bionomi | biotech | Biotechnologie |
| 4337 | Socionomi | socio | Soziologie |

---

## 🚀 Quick Start

```bash
# System starten (vom ROOT-Verzeichnis Bifroest/)
npm start                     # Startet Database + alle 17 AMORPH + Frontend
npm run start:single          # Nur Database + Fungi (schneller)
npm run start:test            # Mit Tests nach Start

# Datenbank-Befehle
npm run db:generate           # Prisma Client generieren
npm run db:push               # Schema pushen
npm run db:migrate            # Migrations ausführen
npm run db:seed               # Testdaten laden
npm run db:studio             # Prisma Studio öffnen

# Nur AMORPH (Database muss laufen)
cd amorph
npm run dev

# Tests
npm test
npm run test:run

# Build
npm run build
```

---

## 📁 Projektstruktur

```
amorph/
├── CLAUDE.md                    # ⭐ Diese Datei
├── config-local/                # Site-Konfiguration
│   ├── manifest.yaml            # App-Metadaten
│   ├── daten.yaml               # Datenquelle (pocketbase)
│   ├── features.yaml            # Feature-Flags
│   └── schema/                  # Perspektiven-Schema
│
├── src/
│   ├── core/                    # types.ts, detection.ts, security.ts
│   │   └── CLAUDE.md
│   ├── morphs/                  # 28 Morph Primitives
│   │   └── CLAUDE.md
│   ├── observer/                # Debug & Analytics
│   │   └── CLAUDE.md
│   ├── server/                  # ⭐ database.ts (Prisma Client)
│   │   └── CLAUDE.md
│   ├── client/                  # Frontend Features
│   │   └── CLAUDE.md
│   ├── layouts/                 # Astro Layouts
│   │   └── CLAUDE.md
│   └── pages/                   # Routes
│       └── CLAUDE.md
│
├── public/
│   ├── CLAUDE.md
│   ├── styles/                  # CSS (inkl. all.min.css Bundle)
│   └── images/                  # Statische Assets (NICHT Species-Bilder!)
│
├── tests/                       # 475 Tests (37 Dateien)
│   └── CLAUDE.md
│
├── data-local/                  # ⚠️ LEGACY - Wird entfernt!
│   └── CLAUDE.md                # Warnung vor Nutzung
│
└── data, config                 # ❌ Symlinks - Entfernen!
```

---

## 🔗 PostgreSQL/Prisma Integration

### Datenfluss
```
Blueprint YAML → Prisma Schema → PostgreSQL/SQLite → AMORPH Frontend
```

### Database Schema (Prisma)
- **`domains`** - 17 Domains (fungi, phyto, etc.)
- **`entities`** - Alle Entities mit `domainId` Foreign Key
- **`perspectives`** - Perspektiven-Definitionen
- **`entity_perspectives`** - Entity ↔ Perspective Daten (JSON)
- **`external_links`** - Community-eingereichte Links
- **`link_votes`** - Link-Bewertungen
- **`experts`** - 68 Experten mit fieldExpertise-Arrays
- **`publications`** - Experten-Publikationen

### Experten-System (BIFROEST)
```typescript
// Experten-Feld-Matching in database.ts:
const matchingExperts = loadedExperts.filter(expert => 
  expert.fieldExpertise?.includes(fieldKey)
);

// Experten-Schema:
interface Expert {
  name: string;
  domain: 'fungi' | 'phyto' | 'drako' | ... // 17 Domains
  fieldExpertise: string[];   // z.B. ["habitat", "edibility", "genus"]
  impactScore: number;        // NIEMALS an Client senden!
  isVerified: boolean;
}
```

### Environment Variables
```bash
# Development (SQLite)
DATA_SOURCE=local
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATA_SOURCE=postgresql
DATABASE_URL="postgresql://user:password@host:5432/bifroest"
```

### API Calls (database.ts)
```typescript
// Entities laden
const entities = await getEntitiesByDomain('fungi');

// Experten für Feld laden
const experts = await getExpertsForField('habitat');
```

---

## 📋 Blueprint System

### Verzeichnisstruktur
```
shared/blueprints/
├── amorph-fungi/
│   ├── chemical_ecology.blueprint.yaml
│   ├── cross_kingdom_relations.blueprint.yaml
│   ├── ecosystem_engineering.blueprint.yaml
│   ├── fungal_holobiont.blueprint.yaml
│   ├── fungal_intelligence.blueprint.yaml
│   └── mycelial_networks.blueprint.yaml
├── amorph-phyto/
│   └── ...
└── ... (17 Domains)
```

### Blueprint Format
```yaml
perspective: fungal_intelligence
version: "1.0.0"

scientific_name:
  # morph: text
  ""

network_complexity:
  # morph: badge
  status: ""

sensory_modalities:
  # morph: list
  - ""

memory_capability:
  # morph: boolean
  false
```

### Morph Types → Prisma
| Morph Type | Prisma Type |
|------------|-------------|
| `text` | `String` |
| `boolean` | `Boolean` |
| `number` | `Float` / `Int` |
| `list` | `Json` |
| `tag` | `String` |
| `badge` | `String` |
| `gauge` | `Json` |
| `range` | `Json` |
| `editor` | `String` |

---

## 🎨 Design System

### Farben
| System | Verwendung |
|--------|------------|
| **Site Colors** | Pro Domain (Blue für Fungi, Jade für Phyto, etc.) |
| **Perspektiven** | 15 matte Pastell-Töne |
| **Bio-Lumineszenz** | 8 leuchtende Farben für Compare-Ansicht |

### CSS Variables
```css
--system-rgb: 77, 136, 255;       /* Aktive Site-Farbe */
--pilz-0-rgb bis --pilz-7-rgb     /* Bio-Lumineszenz Palette */
```

### Z-Index Hierarchie
1. **z-index: 10001** - Bottom Navigation
2. **z-index: 10000** - Suchleiste
3. **z-index: 9999** - Compare-Panel
4. **z-index: 200** - Header

---

## 🔧 Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Production Build |
| `npm test` | Tests im Watch-Modus |
| `npm run test:run` | Einmalige Test-Ausführung |

---

## 📝 Wichtige Hinweise

### ⚠️ Keine lokalen Daten!
- ❌ Keine Species-JSON in `data-local/` verwenden
- ❌ Keine Bilder in `public/images/species/`
- ✅ Alle Daten in PostgreSQL/SQLite (via Prisma)
- ✅ Bilder im File System, Pfade in DB

### Neue Perspektive hinzufügen
1. Blueprint YAML in `shared/blueprints/amorph-{domain}/` erstellen
2. `npm run db:migrate` im ROOT-Verzeichnis ausführen
3. Perspektive wird automatisch erstellt

### Tests vor Commit
```bash
npm run test:run   # 475 Tests
npm run build      # Production Build
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | Root-Dokumentation |
| [../bifroest-platform/CLAUDE.md](../bifroest-platform/CLAUDE.md) | Backend & Scripts |
| [src/server/CLAUDE.md](src/server/CLAUDE.md) | Database Client |
| [src/morphs/CLAUDE.md](src/morphs/CLAUDE.md) | 28 Morph Primitives |
| [src/core/CLAUDE.md](src/core/CLAUDE.md) | Types & Detection |
| [tests/CLAUDE.md](tests/CLAUDE.md) | Test-Dokumentation |

---

*Letzte Aktualisierung: Januar 2026*
