# AMORPH v7 - Schema

> Modulares Schema-System (Data-Driven Architecture).

## 📁 Struktur

```
schema/
├── index.yaml          # Schema-Index, Version
├── basis.yaml          # Kern-Felder (id, name, slug)
├── semantik.yaml       # Suche-Mappings
└── perspektiven/
    ├── index.yaml      # Aktive Perspektiven
    ├── *.yaml          # 15 Perspektiven-Definitionen
    └── blueprints/     # Morph-Blueprints
        └── *.blueprint.yaml
```

## 📦 15 Perspektiven

| ID | Symbol | Name |
|----|--------|------|
| chemistry | 🧪 | Chemie |
| conservation | 🛡️ | Schutzstatus |
| culinary | 🍳 | Kulinarik |
| cultivation | 🌱 | Anbau |
| culture | 📜 | Kultur |
| ecology | 🌿 | Ökologie |
| economy | 💰 | Wirtschaft |
| geography | 🗺️ | Geografie |
| identification | 🔍 | Bestimmung |
| interactions | 🔗 | Interaktionen |
| medicine | 💊 | Medizin |
| research | 📚 | Forschung |
| safety | ⚠️ | Sicherheit |
| statistics | 📊 | Statistik |
| temporal | ⏰ | Zeitlich |

## 📐 Blueprints

Siehe [blueprints/CLAUDE.md](perspektiven/blueprints/CLAUDE.md)

Jedes Blueprint definiert:
- Morph-Typ als Kommentar (`# morph: badge`)
- Leere Datenstruktur im Morph-Format
- `_enums` mit erlaubten Werten
| interactions | interactions.blueprint.yaml | ~550 |
| medicine | medicine.blueprint.yaml | ~700 |
| research | research.blueprint.yaml | ~600 |
| safety | safety.blueprint.yaml | ~1400 |
| statistics | statistics.blueprint.yaml | ~500 |
| temporal | temporal.blueprint.yaml | ~1600 |

**Gesamt**: ~12.000 Zeilen Schema-Definitionen

---

## index.yaml

```yaml
version: "3.0"

module:
  basis: ./basis.yaml
  semantik: ./semantik.yaml
  perspektiven: ./perspektiven/
```

**Data-Driven Approach:**
- Keine separate `felder.yaml` nötig
- Felder werden aus Perspektiven definiert
- Typen automatisch aus Datenstruktur erkannt
- System adaptiert sich an neue Felder

---

## basis.yaml

### Meta-Konfiguration

```yaml
meta:
  nameField: name      # Feld für Anzeigename
  idField: id          # Feld für eindeutige ID
  bildField: bild      # Feld für Hauptbild
```

### Kern-Felder (unveränderlich)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | number | Versteckt, eindeutige ID |
| `slug` | string | Versteckt, URL-freundlich |
| `name` | string | Pflichtfeld, Suche gewicht=100 |
| `bild` | image | Hauptbild |

### Schema-Attribute (optional für alle Einträge)

```yaml
citation:
  quelle: "Name der Quelle (Pflicht)"
  url: "Link zur Quelle"
  datum: "YYYY-MM"
  autor: "Autor/Organisation"
  lizenz: "Lizenz"
  verifiziert: boolean

advertisement:
  sponsor: "Name des Sponsors"
  typ: "product | affiliate | sponsored | native"
  url: "Ziel-URL"
  kampagne: "Kampagnen-ID"
  kennzeichnung: boolean
```

### Morph-Erkennung (für pipeline.js)

| Morph | Bedingung | Beispiel |
|-------|-----------|----------|
| `pie` | Objekt mit nur Zahlen | `{Protein: 26, Fett: 8}` |
| `range` | Objekt mit min/max | `{min: 10, max: 25}` |
| `stats` | Objekt mit min/max/avg | `{min: 50, max: 200, avg: 125}` |
| `radar` | Array mit axis/value | `[{axis: 'A', value: 80}]` |
| `bar` | Array mit label/value | `[{label: 'X', value: 3.2}]` |
| `timeline` | Array mit date/event | `[{date: '2024-03', event: 'X'}]` |
| `progress` | Ganzzahl 0-100 | `75` |
| `rating` | Zahl 0-10 | `4.5` |
| `badge` | Kurzer String mit Keywords | `"verfügbar"` |

---

## semantik.yaml (651 Zeilen)

### Kirk's Datenvisualisierungs-Prinzipien

#### Semantische Farben

```yaml
visuell:
  farben:
    kritisch:
      rgb: "255, 82, 82"           # Rot
      glow: "0 0 12px rgba(255, 82, 82, 0.6)"
    warnung:
      rgb: "255, 193, 7"           # Orange
      glow: "0 0 10px rgba(255, 193, 7, 0.5)"
    neutral:
      rgb: "158, 158, 158"         # Grau
      glow: "none"
    positiv:
      rgb: "76, 175, 80"           # Grün
      glow: "0 0 10px rgba(76, 175, 80, 0.5)"
    exzellent:
      rgb: "0, 230, 118"           # Helles Grün
      glow: "0 0 12px rgba(0, 230, 118, 0.6)"
    info:
      rgb: "33, 150, 243"          # Blau
      glow: "0 0 8px rgba(33, 150, 243, 0.4)"
```

#### Schwellwerte (Prozent 0-100)

```yaml
schwellwerte:
  standard:                        # Höher = besser
    kritisch: 20                   # 0-20%
    warnung: 40                    # 20-40%
    neutral: 60                    # 40-60%
    positiv: 80                    # 60-80%
    exzellent: 100                 # 80-100%

  invertiert:                      # Höher = schlechter (Toxizität)
    exzellent: 20
    positiv: 40
    neutral: 60
    warnung: 80
    kritisch: 100

  binaer:                          # Nur gut/schlecht
    kritisch: 50
    positiv: 100
```

#### Spezial-Felder

```yaml
invertierte_felder:               # Höher = schlechter
  - toxizitaet
  - gefahr
  - risiko
  - sterblichkeit
  - schweregrad
  - severity
  - bedrohung
  - gefaehrdung
  - kritikalitaet

binaere_felder:                   # Nur true/false
  - essbar
  - verfuegbar
  - aktiv
  - vorhanden
  - sicher
```

#### Animationen & Tooltips

```yaml
animationen:
  einblenden: { dauer: "0.3s", easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
  kritisch: { animation: "pulse-kritisch 2s ease-in-out infinite" }
  hover: { transform: "translateY(-2px)", transition: "0.2s ease" }

tooltips:
  verzoegerung: 300               # ms
  position: "top"
  maxBreite: 250                  # px

annotations:
  kritisch: { icon: "⚠️", prefix: "Achtung: " }
  warnung: { icon: "⚡", prefix: "Hinweis: " }
  exzellent: { icon: "✓", prefix: "" }
```

### Semantische Keyword-Mappings (60+)

#### Struktur

```yaml
semantik:
  regelname:
    keywords: [...]           # Suchbegriffe die matchen
    feld: feldname            # Feld in Daten
    werte: [...]              # Exakte Werte
    enthält: [...]            # Teilstrings
    existiert: true           # Feld muss existieren
    aktuell: true             # Datum-Match (aktueller Monat)
    pfad: nested.field        # Nested-Path-Support
    pfad_werte: [...]         # Werte für nested
    pfad_enthält: [...]       # Teilstrings für nested
    score: 50                 # Suchgewichtung
```

#### Kategorien

| Kategorie | Regeln | Beispiel-Keywords |
|-----------|--------|-------------------|
| **Essbarkeit** | essbar, delikatesse, giftig | essen, speisepilz, lecker, gift |
| **Geschmack** | nussig, mild, würzig, umami, pfeffrig, bitter, fruchtig, erdig | nuss, aromatisch, herzhaft |
| **Zubereitung** | braten, trocknen, schmoren, roh, grillen, einlegen | pfanne, dörren, ragout, carpaccio |
| **Lagerung** | haltbarkeit, einfrieren | lagern, tiefkühlen |
| **Pairings** | passt_zu, butter, sahne, knoblauch, pasta, risotto | kombinieren, cremig, tagliatelle |
| **Traditionen** | italienisch, französisch, deutsch, asiatisch | porcini, cèpe, heimisch |
| **Standort** | wald, wiese, nadelwald, laubwald | forst, fichte, eiche, buche |
| **Saison** | frühling, sommer, herbst, winter, jetzt | märz, juni, september, aktuell |
| **Sicherheit** | verwechslung | doppelgänger, ähnlich |

---

## Perspektiven (15 Stück)

### Format

```yaml
id: chemistry
name: Chemistry
symbol: ⚗️
colors:
  - "rgba(180, 140, 255, 0.65)"    # Hauptfarbe
  - "rgba(160, 120, 240, 0.65)"    # Sekundär
  - "rgba(145, 105, 225, 0.65)"    # Tertiär
  - "rgba(130, 90, 210, 0.65)"     # Quaternär

fields:
  - scientific_name
  - genus
  - nutritional_values
  - ...
```

### Übersicht

| ID | Name | Symbol | Beschreibung |
|----|------|--------|--------------|
| `chemistry` | Chemistry | ⚗️ | Molekular-chemisch (90+ Felder) |
| `ecology` | Ecology | 🌿 | Habitat, Symbiosen |
| `medicine` | Medicine | 💊 | Wirkstoffe, Effekte |
| `culinary` | Culinary | 🍳 | Geschmack, Rezepte |
| `safety` | Safety | ⚠️ | Toxizität, Verwechslungen |
| `identification` | Identification | 🔍 | Morphologie, Sporen |
| `cultivation` | Cultivation | 🌱 | Substrat, Ertrag |
| `conservation` | Conservation | 🛡️ | Schutzstatus, Bedrohungen |
| `culture` | Culture | 📚 | Folklore, Traditionen |
| `economy` | Economy | 💰 | Markt, Handel |
| `geography` | Geography | 🗺️ | Verbreitung, Klima |
| `interactions` | Interactions | 🔗 | Wirte, Parasiten |
| `research` | Research | 🔬 | Studien, Zitationen |
| `statistics` | Statistics | 📊 | Vorkommen, Trends |
| `temporal` | Temporal | ⏱️ | Saisonalität, Zyklen |

### chemistry.yaml (990 Zeilen - größte Perspektive)

**Zielgruppe:**
- Natural Product Chemists
- Food Chemists
- Biotechnologists
- Toxin Researchers
- Metabolomics Researchers

**Feld-Kategorien:**
- Taxonomy (5)
- Chemotype & Sample (22)
- Nutritional Values (6)
- Macronutrients (12)
- Micronutrients (30+)
- Secondary Metabolites (20+)
- Volatile Compounds (10+)
- Enzymes (15+)
- Analytical Data (MS, NMR, Chromatography)

---

## Lade-Reihenfolge

```
1. basis.yaml       → meta, kern-felder, erkennung
2. semantik.yaml    → visuell, semantik-mappings
3. perspektiven/*.yaml → Alle 15 Perspektiven
```

---

## Neue Perspektive hinzufügen

1. **YAML erstellen:** `perspektiven/mypersp.yaml`
   ```yaml
   id: mypersp
   name: My Perspective
   symbol: 🔮
   colors: ["rgba(100, 200, 150, 0.65)"]
   fields:
     - field1
     - field2
   keywords:
     - search_term
   ```

2. **In Index aktivieren:** `perspektiven/index.yaml`

3. **CSS erstellen:** `perspektiven/mypersp.css`

4. **Keywords in semantik.yaml:** (optional, für bessere Suche)

---

## Verwendung in Code

```javascript
import { 
  setSchema, getSchema, getSchemaMeta,
  getPerspektivenListe, getPerspektive,
  getSuchfelder, semanticScore
} from '../util/semantic.js';

// Nach Config-Load
setSchema(loadedSchema);

// Meta-Felder
const { nameField, idField } = getSchemaMeta();

// Perspektiven
const persp = getPerspektivenListe();
const chemistry = getPerspektive('chemistry');

// Semantische Suche
const { score, matches } = semanticScore(item, 'essbar');
```
