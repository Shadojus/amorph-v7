# Blueprints

Leere Schema-Definitionen mit korrekten Morph-Datenstrukturen.

## Zweck

Jedes Blueprint definiert **alle Felder einer Perspektive** mit:
1. Korrektem Morph-Typ als Kommentar (`# morph: badge`)
2. Leerer Datenstruktur im exakten Morph-Format
3. `_enums` Sektion mit erlaubten Werten

## Verwendung

### Für Datenerstellung

```yaml
# Blueprint sagt:
# morph: badge
conservation_status:
  status: ""
  variant: ""
```

```json
// Dein JSON:
{
  "conservation_status": {
    "status": "Vulnerable",
    "variant": "warning"
  }
}
```

### Für Typ-Erkennung

Pipeline liest Morph-Kommentar und erkennt korrekten Typ:
```javascript
// Daten: { status: "Active", variant: "success" }
// Blueprint: # morph: badge
// → Rendert als Badge-Element
```

---

## Domains & Blueprints (v3)

### 🧬 BIOLOGY (15 Blueprints)
Für fungi, plantae, therion

| Datei | Perspektive | ~Zeilen |
|-------|-------------|---------|
| `chemistry.blueprint.yaml` | 🧪 Chemistry | ~500 |
| `conservation.blueprint.yaml` | 🛡️ Conservation | ~600 |
| `culinary.blueprint.yaml` | 🍳 Culinary | ~400 |
| `cultivation.blueprint.yaml` | 🌱 Cultivation | ~800 |
| `culture.blueprint.yaml` | 📜 Culture | ~700 |
| `ecology.blueprint.yaml` | 🌿 Ecology | ~650 |
| `economy.blueprint.yaml` | 💰 Economy | ~600 |
| `geography.blueprint.yaml` | 🗺️ Geography | ~900 |
| `identification.blueprint.yaml` | 🔍 Identification | ~2000 |
| `interactions.blueprint.yaml` | 🔗 Interactions | ~550 |
| `medicine.blueprint.yaml` | 💊 Medicine | ~700 |
| `research.blueprint.yaml` | 📚 Research | ~600 |
| `safety.blueprint.yaml` | ⚠️ Safety | ~1400 |
| `statistics.blueprint.yaml` | 📊 Statistics | ~500 |
| `temporal.blueprint.yaml` | ⏰ Temporal | ~1600 |

### 🦕 PALEONTOLOGY (11 Blueprints)
Für fossils und extinct organisms

| Datei | Perspektive |
|-------|-------------|
| `taxonomy_paleo.blueprint.yaml` | 🦴 Taxonomy |
| `morphology.blueprint.yaml` | 🦕 Morphology |
| `chronology.blueprint.yaml` | ⏳ Chronology |
| `paleoecology.blueprint.yaml` | 🌿 Paleoecology |
| `taphonomy.blueprint.yaml` | 🪨 Taphonomy |
| `biogeography.blueprint.yaml` | 🗺️ Biogeography |
| `extinction.blueprint.yaml` | 💀 Extinction |
| `discoveries.blueprint.yaml` | 🔍 Discoveries |
| `reconstruction.blueprint.yaml` | 🎨 Reconstruction |
| `museum.blueprint.yaml` | 🏛️ Museum |
| `research.blueprint.yaml` | 📚 Research (shared) |

### 💎 MINERALOGY (11 Blueprints)
Für minerals und gemstones

| Datei | Perspektive |
|-------|-------------|
| `classification.blueprint.yaml` | 📊 Classification |
| `chemistry.blueprint.yaml` | 🧪 Chemistry (shared) |
| `crystallography.blueprint.yaml` | 💎 Crystallography |
| `physical.blueprint.yaml` | ⚖️ Physical |
| `optical.blueprint.yaml` | 🔬 Optical |
| `formation.blueprint.yaml` | 🌋 Formation |
| `occurrence.blueprint.yaml` | 📍 Occurrence |
| `economic_mineral.blueprint.yaml` | 💰 Economic |
| `collecting.blueprint.yaml` | 🎒 Collecting |
| `gemology.blueprint.yaml` | 💍 Gemology |
| `research.blueprint.yaml` | 📚 Research (shared) |

### ⛰️ TECTONICS (7 Blueprints)
Für geological structures und plate tectonics

| Datei | Perspektive |
|-------|-------------|
| `chronology.blueprint.yaml` | ⏳ Chronology (shared) |
| `stratigraphy.blueprint.yaml` | 📚 Stratigraphy |
| `plate_tectonics.blueprint.yaml` | 🌍 Plate Tectonics |
| `structural.blueprint.yaml` | ⛰️ Structural |
| `deformation.blueprint.yaml` | 🔄 Deformation |
| `research.blueprint.yaml` | 📚 Research (shared) |

### 🦠 MICROBIOLOGY (9 Blueprints)
Für microorganisms (bacteria, archaea, protozoa)

| Datei | Perspektive |
|-------|-------------|
| `taxonomy_micro.blueprint.yaml` | 🔬 Taxonomy |
| `morphology_micro.blueprint.yaml` | 🔍 Morphology |
| `metabolism.blueprint.yaml` | ⚡ Metabolism |
| `pathogenicity.blueprint.yaml` | 🦠 Pathogenicity |
| `antibiotic_resistance.blueprint.yaml` | 💊 Antibiotic Resistance |
| `cultivation_micro.blueprint.yaml` | 🧫 Cultivation |
| `genomics.blueprint.yaml` | 🧬 Genomics |
| `ecology_micro.blueprint.yaml` | 🌍 Ecology |
| `industrial.blueprint.yaml` | 🏭 Industrial Use |

### 🧬 VIROLOGY (9 Blueprints)
Für viruses und viral diseases

| Datei | Perspektive |
|-------|-------------|
| `taxonomy_viro.blueprint.yaml` | 🔬 Taxonomy |
| `structure_viro.blueprint.yaml` | 🔍 Structure |
| `replication.blueprint.yaml` | 🔄 Replication |
| `pathogenesis.blueprint.yaml` | 🦠 Pathogenesis |
| `epidemiology.blueprint.yaml` | 📊 Epidemiology |
| `immunity.blueprint.yaml` | 🛡️ Immunity |
| `vaccines.blueprint.yaml` | 💉 Vaccines |
| `antiviral.blueprint.yaml` | 💊 Antiviral |
| `evolution_viro.blueprint.yaml` | 🌳 Evolution |

### 🧬 GENETICS (8 Blueprints)
Für genes und genetic information

| Datei | Perspektive |
|-------|-------------|
| `gene_structure.blueprint.yaml` | 🔬 Gene Structure |
| `inheritance.blueprint.yaml` | 👪 Inheritance |
| `mutations.blueprint.yaml` | ⚡ Mutations |
| `expression.blueprint.yaml` | 📊 Expression |
| `regulation.blueprint.yaml` | 🎛️ Regulation |
| `epigenetics.blueprint.yaml` | 🔒 Epigenetics |
| `biotechnology.blueprint.yaml` | 🧪 Biotechnology |
| `diseases_genetic.blueprint.yaml` | 🏥 Genetic Diseases |

### 🫀 ANATOMY (9 Blueprints)
Für organs und body structures

| Datei | Perspektive |
|-------|-------------|
| `gross_anatomy.blueprint.yaml` | 🫀 Gross Anatomy |
| `histology.blueprint.yaml` | 🔬 Histology |
| `physiology.blueprint.yaml` | ⚡ Physiology |
| `development.blueprint.yaml` | 🌱 Development |
| `pathology.blueprint.yaml` | 🏥 Pathology |
| `imaging.blueprint.yaml` | 📷 Imaging |
| `surgery.blueprint.yaml` | 🔪 Surgery |
| `comparative.blueprint.yaml` | 🔄 Comparative |
| `clinical.blueprint.yaml` | 🩺 Clinical |

### ⚗️ CHEMISTRY (9 Blueprints)
Für chemical compounds und reactions

| Datei | Perspektive |
|-------|-------------|
| `atomic_structure.blueprint.yaml` | ⚛️ Atomic Structure |
| `bonding.blueprint.yaml` | 🔗 Bonding |
| `thermodynamics_chem.blueprint.yaml` | 🔥 Thermodynamics |
| `kinetics.blueprint.yaml` | ⏱️ Kinetics |
| `organic.blueprint.yaml` | 🧬 Organic Chemistry |
| `inorganic.blueprint.yaml` | 💎 Inorganic Chemistry |
| `analytical.blueprint.yaml` | 📊 Analytical |
| `synthesis.blueprint.yaml` | 🧪 Synthesis |
| `applications.blueprint.yaml` | 🏭 Applications |

### ⚛️ PHYSICS (9 Blueprints)
Für physical phenomena und particles

| Datei | Perspektive |
|-------|-------------|
| `mechanics.blueprint.yaml` | ⚙️ Mechanics |
| `electromagnetism.blueprint.yaml` | ⚡ Electromagnetism |
| `thermodynamics_phys.blueprint.yaml` | 🔥 Thermodynamics |
| `quantum.blueprint.yaml` | 🔮 Quantum |
| `relativity.blueprint.yaml` | 🌀 Relativity |
| `particle.blueprint.yaml` | ⚛️ Particle Physics |
| `nuclear.blueprint.yaml` | ☢️ Nuclear Physics |
| `optics.blueprint.yaml` | 💡 Optics |
| `applications_phys.blueprint.yaml` | 🏗️ Applications |

### 🌟 ASTRONOMY (9 Blueprints)
Für celestial bodies und cosmic objects

| Datei | Perspektive |
|-------|-------------|
| `classification_astro.blueprint.yaml` | 🔬 Classification |
| `orbital.blueprint.yaml` | 🌍 Orbital Mechanics |
| `composition.blueprint.yaml` | 🧪 Composition |
| `formation_astro.blueprint.yaml` | 🌋 Formation |
| `lifecycle.blueprint.yaml` | ⏳ Lifecycle |
| `observation.blueprint.yaml` | 🔭 Observation |
| `missions.blueprint.yaml` | 🚀 Space Missions |
| `habitability.blueprint.yaml` | 🏠 Habitability |
| `cosmology.blueprint.yaml` | 🌌 Cosmology |

### 💻 INFORMATICS (9 Blueprints)
Für IT systems und protocols

| Datei | Perspektive |
|-------|-------------|
| `architecture.blueprint.yaml` | 🏗️ Architecture |
| `protocols.blueprint.yaml` | 📡 Protocols |
| `security_info.blueprint.yaml` | 🔐 Security |
| `networking.blueprint.yaml` | 🌐 Networking |
| `data_storage.blueprint.yaml` | 💾 Data Storage |
| `distributed.blueprint.yaml` | 🔀 Distributed Systems |
| `performance.blueprint.yaml` | ⚡ Performance |
| `standards.blueprint.yaml` | 📋 Standards |
| `applications_info.blueprint.yaml` | 🛠️ Applications |

### 🤖 AI (9 Blueprints)
Für AI models und neural networks

| Datei | Perspektive |
|-------|-------------|
| `model_architecture.blueprint.yaml` | 🏗️ Model Architecture |
| `training.blueprint.yaml` | 📚 Training |
| `capabilities.blueprint.yaml` | 💪 Capabilities |
| `limitations.blueprint.yaml` | ⚠️ Limitations |
| `applications_ai.blueprint.yaml` | 🛠️ Applications |
| `ethics.blueprint.yaml` | ⚖️ Ethics |
| `benchmarks.blueprint.yaml` | 📊 Benchmarks |
| `deployment.blueprint.yaml` | 🚀 Deployment |
| `safety_ai.blueprint.yaml` | 🛡️ Safety |

### 🧪 BIOTECH (10 Blueprints)
Für biotechnology products und processes

| Datei | Perspektive |
|-------|-------------|
| `methodology.blueprint.yaml` | 🔬 Methodology |
| `applications_biotech.blueprint.yaml` | 🛠️ Applications |
| `products.blueprint.yaml` | 📦 Products |
| `organisms.blueprint.yaml` | 🦠 Organisms |
| `safety_biotech.blueprint.yaml` | 🛡️ Safety |
| `regulation.blueprint.yaml` | 📋 Regulation |
| `economics_biotech.blueprint.yaml` | 💰 Economics |
| `ethics_biotech.blueprint.yaml` | ⚖️ Ethics |
| `future.blueprint.yaml` | 🔮 Future |
| `research_biotech.blueprint.yaml` | 📚 Research |

### 👥 SOCIOLOGY (10 Blueprints)
Für social groups und institutions

| Datei | Perspektive |
|-------|-------------|
| `structure.blueprint.yaml` | 🏗️ Structure |
| `institutions.blueprint.yaml` | 🏛️ Institutions |
| `culture_socio.blueprint.yaml` | 🎭 Culture |
| `demographics.blueprint.yaml` | 📊 Demographics |
| `inequality.blueprint.yaml` | ⚖️ Inequality |
| `movements.blueprint.yaml` | ✊ Movements |
| `change.blueprint.yaml` | 🔄 Change |
| `methods.blueprint.yaml` | 🔬 Methods |
| `theory.blueprint.yaml` | 📖 Theory |
| `research_socio.blueprint.yaml` | 📚 Research |

---

## Morph-Typ Referenz

### Primitive Typen

| Morph | Leere Struktur |
|-------|----------------|
| `text` | `""` |
| `number` | `0` |
| `boolean` | `false` |
| `tag` | `""` (≤20 Zeichen) |
| `image` | `""` (URL) |
| `link` | `""` (URL) |

### Status-Typen

| Morph | Struktur |
|-------|----------|
| `badge` | `{status: "", variant: ""}` |
| `rating` | `{rating: 0, max: 10}` |
| `progress` | `{value: 0, max: 100, unit: "%"}` |

### Bereichs-Typen

| Morph | Struktur |
|-------|----------|
| `range` | `{min: 0, max: 0, unit: ""}` |
| `stats` | `{total: 0, count: 0, min: 0, max: 0, avg: 0}` |
| `gauge` | `{value: 0, min: 0, max: 100, zones: [...]}` |

### Listen-Typen

| Morph | Struktur |
|-------|----------|
| `list` | `[""]` |
| `bar` | `[{label: "", value: 0}]` |
| `pie` | `[{label: "", value: 0}]` |
| `radar` | `[{axis: "", value: 0}]` |
| `sparkline` | `[0]` |

### Temporal-Typen

| Morph | Struktur |
|-------|----------|
| `timeline` | `[{date: "", event: "", description: ""}]` |
| `lifecycle` | `[{phase: "", duration: ""}]` |
| `steps` | `[{step: 1, label: "", status: "pending"}]` |
| `calendar` | `[{month: 1, active: false}, ... × 12]` |

### Beziehungs-Typen

| Morph | Struktur |
|-------|----------|
| `network` | `[{name: "", type: "", intensity: 0}]` |
| `flow` | `[{from: "", to: "", value: 0}]` |
| `hierarchy` | `[{level: "", name: ""}]` |

### Spezial-Typen

| Morph | Struktur |
|-------|----------|
| `map` | `{lat: 0, lng: 0, region: ""}` |
| `citation` | `{authors: "", year: 0, title: "", journal: "", doi: ""}` |
| `currency` | `{amount: 0, currency: ""}` |
| `dosage` | `[{amount: 0, unit: "", frequency: "", route: ""}]` |
| `severity` | `[{level: "", typ: "", beschreibung: ""}]` |
| `comparison` | `{items: [...], metrics: [...]}` |
| `object` | `{key: value}` |

---

## Erkennungs-Priorität

Pipeline prüft in dieser Reihenfolge:

```
flow → scatterplot → groupedbar → stackedbar → boxplot →
dotplot → lollipop → sunburst → treemap → bubble →
pictogram → slopegraph → heatmap → sparkline → severity →
lifecycle → timeline → steps → calendar → radar → pie →
bar → network → hierarchy → map → citation → dosage →
currency → gauge → stats → range → comparison → rating →
progress → badge → image → link → tag → text → number →
boolean → list → object
```

---

## Enumerations

Jedes Blueprint enthält `_enums` mit gültigen Werten:

```yaml
_enums:
  conservation_status:
    - extinct
    - critically_endangered
    - endangered
    - vulnerable
    - near_threatened
    - least_concern
    - data_deficient
    - not_evaluated
```

Diese werden für Validierung und Auto-Complete verwendet.
