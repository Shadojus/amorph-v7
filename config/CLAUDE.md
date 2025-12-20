# Config

YAML als Single Source of Truth. JavaScript-Dateien sind Morphs/Re-Exports.

> **Laden**: `core/config.js` liest alle YAML-Dateien und parsed sie mit eigenem Parser.
> **Schema**: Siehe `config/schema/CLAUDE.md` für Details zum modularen Schema-System.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `manifest.yaml` | 24 | App-Name, Version, Branding, Partner |
| `daten.yaml` | 53 | Datenquelle (Typ, URLs) |
| `morphs.yaml` | 8 | Verweis auf morphs/index.yaml |
| `features.yaml` | 44 | Aktive Features + Feature-Config |
| `observer.yaml` | 33 | Debug-Config, Console/Redis/HTTP-Targets |
| `index.js` | 207 | Morph-Registry (Re-Export aller Morphs) |
| `header.js` | 276 | Header-Morph (Branding, Suche, Perspektiven) |
| `perspektiven.js` | 63 | Perspektiven-Morph (Button-Leiste) |
| `suche.js` | 34 | Suche-Morph (Suchleiste) |

---

## JavaScript-Dateien

### index.js (207 Zeilen) - Morph-Registry

**Alle verfügbaren Morphs in einer Datei exportiert:**

#### Primitives
```javascript
text, string, number, boolean, tag, range, list, object, image, link,
pie, bar, radar, rating, progress, stats, timeline, badge, lifecycle
```

#### Features
```javascript
suche, perspektiven, header
```

#### Compare-Morphs
```javascript
compareMorph, compareBar, compareRating, compareTag, compareList,
compareImage, compareRadar, comparePie, compareText, compareTimeline,
compareRange, compareProgress, compareBoolean, compareStats, compareObject
```

#### Compare-Composites
```javascript
smartCompare, diffCompare
```

#### Compare-Utilities
```javascript
erstelleFarben, setAktivePerspektivenFarben, detectType, createSection, createHeader, compareByType, compareByData
```

### header.js (276 Zeilen)

Erzeugt Header-DOM mit 4 Zeilen:

| Zeile | Inhalt | CSS-Klasse |
|-------|--------|------------|
| 0 | Branding: Titel + Partner | `.amorph-header-branding` |
| 1 | Suche + aktive Filter + Ansicht-Switch | `.amorph-header-main` |
| 2 | Perspektiven-Grid | `.amorph-header-perspektiven` |
| 3 | Ausgewählte Items (initial hidden) | `.amorph-header-auswahl` |

**Exports:**
```javascript
export function header(config, morphConfig)
// Methode: container.updateAuswahlListe(fungi)
```

**Ansicht-Switch:**
- `karten` - Immer verfügbar (minAuswahl: 0)
- `vergleich` - Nur wenn Auswahl (minAuswahl: 1)
- Counter-Badge zeigt Auswahl-Anzahl

### perspektiven.js (63 Zeilen)

```javascript
export function perspektiven(config, morphConfig) → nav.amorph-perspektiven
```

- Liest Liste aus `getPerspektivenListe()` (Schema)
- Erzeugt Buttons mit Symbol + Name
- CSS Custom Properties: `--p-farbe`, `--p-farbe-2`, `--p-farbe-3`, `--p-farbe-4`
- `data-perspektive`, `data-felder` Attribute

### suche.js (34 Zeilen)

```javascript
export function suche(config, morphConfig) → div.amorph-suche
```

- Input + Button
- Dataset-Attribute: `live`, `debounce`, `limit`, `erlaubeLeer`

---

## YAML-Dateien

### manifest.yaml

```yaml
name: Funginomi
beschreibung: Pilz-Wissenssammlung
version: 1.0.0
sprache: de

branding:
  titel: FUNGINOMI
  titelUrl: /
  partner:
    text: Part of the
    name: Bifroest
    url: https://bifroest.io

farben:
  palette: standard
```

### daten.yaml

**Aktiv:**
```yaml
quelle:
  typ: json-perspektiven
  indexUrl: ./data/fungi/index.json
  baseUrl: ./data/fungi/
```

**Verfügbare Typen:**

| Typ | Beschreibung |
|-----|--------------|
| `json` | Einzelne JSON-Datei |
| `json-multi` | index.json + einzelne Dateien pro Item |
| `json-perspektiven` | index.json + Ordner pro Item + Perspektiven-Dateien |
| `rest` | REST-API mit Headers |
| `pocketbase` | PocketBase Backend |

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
  placeholder: Suchen...

perspektiven:
  maxAktiv: 4

ansicht:
  default: karten
  ansichten:
    - id: karten
      icon: ⊞
      minAuswahl: 0
    - id: vergleich
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
