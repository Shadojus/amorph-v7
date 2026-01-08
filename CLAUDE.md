# AMORPH v7

**Formlos. Zustandslos. Transformierend.**

> Unified Morph Architecture für wissenschaftliche Daten mit automatischer Single/Compare-Erkennung.

## Status: ✅ Production Ready (Januar 2026)

### Aktuelle Features
- **🔗 BIFROEST Integration** - Daten ausschließlich aus PocketBase
- **📊 97 Perspektiven** - Automatisch aus Blueprint YAML generiert
- **17 Domains** - Wissenschaftliche Multi-Site Architektur
- **28 Morph Primitives** - Vollständige Komponenten-Bibliothek
- **475 Tests** - Umfassende Testabdeckung

### Technologie-Stack
- **Astro 5.16** mit SSR
- **TypeScript** durchgängig
- **Vitest** für Tests
- **PocketBase v0.25** als einzige Datenquelle (via Bifroest)

---

## ⚠️ Wichtig: Nur PocketBase!

```
❌ data-local/     → LEGACY (nicht verwenden!)
❌ data/           → Symlink zu data-local (entfernen!)
❌ config/         → Symlink zu config-local (entfernen!)
✅ PocketBase      → Einzige Datenquelle für Species & Experten
```

**Bilder**: PocketBase unterstützt `file` Felder - alle Bilder dort speichern!

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
npm start                     # Startet PocketBase + alle 17 AMORPH + Frontend
npm run start:single          # Nur PocketBase + Fungi (schneller)
npm run start:test            # Mit Tests nach Start

# Nur AMORPH (PocketBase muss laufen)
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
│   ├── server/                  # ⭐ bifroest.ts (PocketBase Client)
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
├── tests/                       # 475 Vitest Tests
│   └── CLAUDE.md
│
├── data-local/                  # ⚠️ LEGACY - Wird entfernt!
│   └── CLAUDE.md                # Warnung vor Nutzung
│
└── data, config                 # ❌ Symlinks - Entfernen!
```

---

## 🔗 PocketBase Integration

### Datenfluss
```
Blueprint YAML → Schema Manager → PocketBase Collections → AMORPH Frontend
```

### Collections (automatisch generiert)
- **`{domain}_entities`** - 17 Entity-Collections (fungi_entities, phyto_entities, etc.)
- **`{domain}_*`** - Perspektiv-Tabellen pro Domain
- **`experts`** - 68 Experten mit field_expertise-Arrays

### Experten-System (BIFROEST)
```typescript
// Experten-Feld-Matching in bifroest.ts:
const matchingExperts = loadedExperts.filter(expert => 
  expert.field_expertise?.includes(fieldKey)
);

// Experten-Schema:
interface Expert {
  name: string;
  domain: 'fungi' | 'phyto' | 'drako' | ... // 17 Domains
  field_expertise: string[];  // z.B. ["habitat", "edibility", "genus"]
  impact_score: number;       // NIEMALS an Client senden!
  verified: boolean;
}
```

### Environment Variables
```bash
POCKETBASE_URL=http://127.0.0.1:8090   # PocketBase API
DATA_SOURCE=pocketbase                  # 'pocketbase' | 'local'
```

### API Calls (bifroest.ts)
```typescript
// Entities laden
const entities = await fetchFromCollection('fungi');

// Experten für Feld laden
const experts = await getExpertsForField('habitat');
```

---

## 📋 Blueprint System

### Verzeichnisstruktur
```
config/schema/perspektiven/blueprints/
├── amorph-fungi/
│   ├── chemical_ecology.blueprint.yaml
│   ├── cross_kingdom_relations.blueprint.yaml
│   ├── ecosystem_engineering.blueprint.yaml
│   ├── fungal_holobiont.blueprint.yaml
│   ├── fungal_intelligence.blueprint.yaml
│   └── mycelial_networks.blueprint.yaml
├── amorph-phyto/
│   └── ... (6 Blueprints)
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

### Morph Types → PocketBase
| Morph Type | PocketBase Type |
|------------|-----------------|
| `text` | `text` |
| `boolean` | `bool` |
| `number` | `number` |
| `list` | `json` |
| `tag` | `text` |
| `badge` | `text` |
| `gauge` | `json` |
| `range` | `json` |
| `editor` | `editor` |

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
- ✅ Alle Daten in PocketBase (`species` + `perspective_*` Collections)
- ✅ Alle Bilder in PocketBase (file field)

### Neue Perspektive hinzufügen
1. Blueprint YAML in `shared/blueprints/amorph-{domain}/` erstellen
2. `npm run schema` im ROOT-Verzeichnis ausführen
3. Collection wird automatisch erstellt (existierende bleiben erhalten!)

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
| [../bifroest-platform/claude.md](../bifroest-platform/claude.md) | Backend & Scripts |
| [src/server/CLAUDE.md](src/server/CLAUDE.md) | PocketBase Client |
| [src/morphs/CLAUDE.md](src/morphs/CLAUDE.md) | 28 Morph Primitives |
| [src/core/CLAUDE.md](src/core/CLAUDE.md) | Types & Detection |
| [tests/CLAUDE.md](tests/CLAUDE.md) | Test-Dokumentation |

---

*Letzte Aktualisierung: Januar 2026*
