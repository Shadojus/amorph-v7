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

## 15 Blueprints

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

**Gesamt**: ~12.000 Zeilen

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
