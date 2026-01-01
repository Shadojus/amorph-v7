# AMORPH v7 - Config

> YAML als Single Source of Truth für App-Konfiguration.

## 📁 Struktur

```
config/
├── manifest.yaml       # App-Name, Version, Branding, Port
├── daten.yaml          # Datenquelle, Kingdoms
├── features.yaml       # Feature-Flags
├── observer.yaml       # Debug-Config
├── morphs.yaml         # Morph-Registry Verweis
├── rendering.js        # (JavaScript Helper)
├── helpers.js          # (JavaScript Helper)
└── schema/             # Schema-System
    ├── perspektiven.yaml    # 15 Perspektiven-Definitionen
    ├── semantik.yaml        # Semantische Feld-Mappings
    ├── felder.yaml          # Feld-Definitionen
    └── perspektiven/        # Blueprints pro Perspektive
        └── blueprints/      # 15 Blueprint YAML-Dateien
```

## 📦 YAML-Dateien

### manifest.yaml
```yaml
app:
  name: Funginomi
  version: "1.0.0"
  port: 4323
branding:
  titel: FUNGINOMI
  partner:
    text: Part of the
    name: Bifroest
    url: https://bifroest.io
```

### daten.yaml
```yaml
quelle:
  typ: json-perspektiven   # kingdom/species/perspectives Struktur
  indexUrl: ./data/fungi/index.json
  baseUrl: ./data/fungi/
kingdoms:
  - fungi
```

### features.yaml
```yaml
aktiv:
  - header
  - grid
  - ansichten
  - vergleich
  - einzelansicht
  - infinitescroll

suche:
  live: true
  debounce: 300
  limit: 50

perspektiven:
  maxAktiv: 4
```

### observer.yaml
```yaml
enabled: true
targets:
  - console
verbose: false
```

## 📦 schema/perspektiven.yaml - 15 Perspektiven

| ID | Symbol | Name | Farbe |
|----|--------|------|-------|
| taxonomy | 🧬 | Taxonomie | #a78bfa |
| chemistry | ⚗️ | Chemie | #22d3ee |
| ecology | 🌱 | Ökologie | #a3e635 |
| cultivation | 🌾 | Kultivierung | #fbbf24 |
| culinary | 🍳 | Kulinarik | #fb923c |
| safety | ⚠️ | Sicherheit | #ef4444 |
| mythology | 🔮 | Mythologie | #c4b5fd |
| history | 📜 | Geschichte | #f472b6 |
| phenotype | 👁️ | Erscheinung | #00ffc8 |
| medicinal | 💊 | Medizin | #34d399 |
| psychoactive | 🧠 | Psychoaktiv | #818cf8 |
| conservation | 🛡️ | Naturschutz | #14b8a6 |
| identification | 🔍 | Bestimmung | #60a5fa |
| comparison | ⚖️ | Vergleich | #f59e0b |
| climate | 🌡️ | Klima | #06b6d4 |

## 🔧 Server-Laden

```typescript
import { loadConfig, getConfig, getAllPerspectives } from './server';

await loadConfig();  // Einmal beim Start
const config = getConfig();
const perspectives = getAllPerspectives();  // 15 Perspektiven
```
      icon: ▥
      minAuswahl: 1
```

### observer.yaml

**Entwicklung (Console):**
```yaml
interaktion:
  ziel:
    typ: console
    prefix: "[KLICK]"
    level: log

rendering:
  ziel:
    typ: console
    prefix: "[RENDER]"
    level: debug
```

**Produktion (auskommentiert):**
- `redis` - Redis-Stream via Bridge
- `http` - Analytics-Endpoint mit Batching
- `websocket` - Live-Session-Tracking

### morphs.yaml

Verweis auf modulares System:
```yaml
source: morphs/index.yaml
```

---

## Schema-System (schema/)

### Struktur

```
schema/
├── index.yaml        ← Schema-Index v3.0, Module-Definitionen
├── basis.yaml        ← Kern-Felder (id, name, slug, bild)
├── semantik.yaml     ← 651 Zeilen: Suche, Farben, 60+ Keyword-Mappings
└── perspektiven/     ← 15 Perspektiven
    ├── index.yaml    ← Aktive Perspektiven-Liste
    ├── index.css     ← Gemeinsame Styles
    ├── chemistry.yaml (990 Zeilen) + chemistry.css
    ├── ecology.yaml + ecology.css
    ├── medicine.yaml + medicine.css
    └── ... (insgesamt 15)
```

### index.yaml

```yaml
version: "3.0"
module:
  basis: ./basis.yaml
  semantik: ./semantik.yaml
  perspektiven: ./perspektiven/
```

**Data-Driven Approach:**
- Keine separate felder.yaml
- Felder werden aus Perspektiven + Daten abgeleitet
- Typ-Erkennung automatisch via pipeline.js

### basis.yaml

```yaml
meta:
  nameField: name
  idField: id
  bildField: bild

kern:
  id: { typ: number, versteckt: true }
  slug: { typ: string, versteckt: true }
  name: { typ: string, pflicht: true, suche: { gewicht: 100, exakt: true } }
  bild: { typ: image }

erkennung:
  pie: "Objekt mit nur Zahlen"
  range: "Objekt mit min/max"
  stats: "Objekt mit min/max/avg"
  radar: "Array mit axis/value"
  bar: "Array mit label/value"
  timeline: "Array mit date/event"
  progress: "Ganzzahl 0-100"
  rating: "Zahl 0-10"
  badge: "Kurzer String mit Status-Keywords"
```

### semantik.yaml (651 Zeilen)

**Kirk's Datenvisualisierungs-Prinzipien:**

```yaml
visuell:
  farben:
    kritisch: { rgb: "255, 82, 82", glow: "..." }
    warnung: { rgb: "255, 193, 7", glow: "..." }
    neutral: { rgb: "158, 158, 158" }
    positiv: { rgb: "76, 175, 80", glow: "..." }
    exzellent: { rgb: "0, 230, 118", glow: "..." }
    info: { rgb: "33, 150, 243" }

  schwellwerte:
    standard: { kritisch: 20, warnung: 40, neutral: 60, positiv: 80, exzellent: 100 }
    invertiert: { exzellent: 20, positiv: 40, neutral: 60, warnung: 80, kritisch: 100 }
    binaer: { kritisch: 50, positiv: 100 }

  invertierte_felder: [toxizitaet, gefahr, risiko, sterblichkeit, severity]
  binaere_felder: [essbar, verfuegbar, aktiv, vorhanden, sicher]
```

**60+ Semantische Keyword-Mappings:**

| Kategorie | Keywords |
|-----------|----------|
| Essbarkeit | essbar, giftig, delikatesse |
| Geschmack | nussig, mild, würzig, umami, bitter, fruchtig, erdig |
| Zubereitung | braten, trocknen, schmoren, roh, grillen, einlegen |
| Lagerung | haltbarkeit, einfrieren |
| Pairings | butter, sahne, knoblauch, pasta, risotto |
| Traditionen | italienisch, französisch, deutsch, asiatisch |
| Standort | wald, wiese, nadelwald, laubwald |
| Saison | frühling, sommer, herbst, winter, jetzt |
| Sicherheit | verwechslung |

**Mapping-Struktur:**
```yaml
essbar:
  keywords: [essbar, essen, speisepilz, lecker]
  feld: essbarkeit
  werte: [essbar, bedingt essbar]
  pfad: essbarkeit.status        # Nested path support
  pfad_werte: [choice, essbar]
  score: 50
```

### Perspektiven (15 Stück)

| ID | Name | Symbol | Felder (Beispiel) |
|----|------|--------|-------------------|
| chemistry | Chemistry | ⚗️ | 90+ Felder (nutritional_values, metabolites, ...) |
| ecology | Ecology | 🌿 | habitat, symbiosis, ... |
| medicine | Medicine | 💊 | compounds, effects, ... |
| culinary | Culinary | 🍳 | taste, recipes, ... |
| safety | Safety | ⚠️ | toxicity, lookalikes, ... |
| identification | Identification | 🔍 | morphology, spores, ... |
| cultivation | Cultivation | 🌱 | substrate, yield, ... |
| conservation | Conservation | 🛡️ | status, threats, ... |
| culture | Culture | 📚 | folklore, traditions, ... |
| economy | Economy | 💰 | market, trade, ... |
| geography | Geography | 🗺️ | distribution, climate, ... |
| interactions | Interactions | 🔗 | hosts, parasites, ... |
| research | Research | 🔬 | studies, citations, ... |
| statistics | Statistics | 📊 | occurrences, trends, ... |
| temporal | Temporal | ⏱️ | seasonality, cycles, ... |

**Perspektiven-Format:**
```yaml
id: chemistry
name: Chemistry
symbol: ⚗️
colors:
  - "rgba(180, 140, 255, 0.65)"
  - "rgba(160, 120, 240, 0.65)"
  - "rgba(145, 105, 225, 0.65)"
  - "rgba(130, 90, 210, 0.65)"
fields:
  - scientific_name
  - genus
  - nutritional_values
  - ...
```

---

## Lade-Reihenfolge

1. `manifest.yaml` - App-Metadaten
2. `daten.yaml` - Datenquellen-Config
3. `features.yaml` - Aktive Features
4. `observer.yaml` - Debug-Config
5. `schema/basis.yaml` - Kern-System
6. `schema/semantik.yaml` - Such-Mappings
7. `schema/perspektiven/*.yaml` - Alle Perspektiven

---

## Neue Perspektive hinzufügen

1. **YAML erstellen:** `schema/perspektiven/name.yaml`
   ```yaml
   id: mypersp
   name: My Perspective
   symbol: 🔮
   colors: ["rgba(100, 200, 150, 0.65)"]
   fields: [field1, field2]
   ```

2. **In Index aktivieren:** `schema/perspektiven/index.yaml`

3. **CSS erstellen:** `schema/perspektiven/name.css`

4. **Keywords hinzufügen:** `schema/semantik.yaml`

---

## Abhängigkeiten

```
index.js      → morphs/primitives/*, morphs/compare/*, observer/debug.js
header.js     → observer/debug.js, ./suche.js, ./perspektiven.js
perspektiven.js → observer/debug.js, util/semantic.js
suche.js      → observer/debug.js
```
