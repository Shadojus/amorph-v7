# AMORPH v7 - Morphs Module

> Unified Morph Architecture mit **27 Primitives** (45+ MorphTypes für Erweiterbarkeit).
> Visualisiert biologische Daten: Taxonomie, Chemie, Ökologie, Medizin, etc.
> **Struktur-basierte Detection** - Typ wird aus Datenstruktur erkannt, nicht aus Feldnamen!
> **Object-Parsing** - Badge/Rating/Progress parsen strukturierte Objekte automatisch.

## 📁 Struktur

```
morphs/
├── base.ts           # createUnifiedMorph() Factory + wrapInField() mit Base64
├── debug.ts          # Morph Debug System
├── primitives/       # 27 Morph-Implementierungen
│   ├── index.ts      # Re-Exports + Registry
│   │
│   │── # TEXT & BASICS
│   ├── text.ts       # Langer Text
│   ├── number.ts     # Zahlen
│   ├── boolean.ts    # true/false
│   │
│   │── # LABELS & TAGS  
│   ├── badge.ts      # {status, variant}
│   ├── tag.ts        # Kurze Strings ≤20 Zeichen
│   │
│   │── # PROGRESS & RATING
│   ├── progress.ts   # {value, max, unit}
│   ├── rating.ts     # {rating, max}
│   ├── range.ts      # {min, max, unit}
│   ├── stats.ts      # {min, max, avg, ...}
│   ├── gauge.ts      # {value, max, zones} ⭐ NEU
│   │
│   │── # MEDIA
│   ├── image.ts      # URL mit Bildendung
│   ├── link.ts       # http(s)://...
│   │
│   │── # COLLECTIONS
│   ├── list.ts       # ["string", ...]
│   ├── object.ts     # Generic Object
│   │
│   │── # TEMPORAL
│   ├── date.ts       # ISO-Datum
│   ├── timeline.ts   # [{date, event}]
│   ├── lifecycle.ts  # [{phase, duration}] ⭐ NEU
│   ├── steps.ts      # [{step, label, status}] ⭐ NEU
│   ├── calendar.ts   # [{month, active}] ⭐ NEU
│   │
│   │── # CHARTS
│   ├── bar.ts        # [{label, value}]
│   ├── pie.ts        # [{label, value}] ⭐ NEU
│   ├── sparkline.ts  # [0, 1, 2, ...]
│   ├── radar.ts      # [{axis, value}]
│   │
│   │── # SPECIALIZED
│   ├── severity.ts   # [{level, typ, beschreibung}] ⭐ NEU
│   ├── dosage.ts     # [{amount, unit, frequency}] ⭐ NEU
│   ├── citation.ts   # {authors, year, title} ⭐ NEU
│   └── currency.ts   # {amount, currency} ⭐ NEU
│
└── index.ts          # Main API
```

## 🔍 Morph Debug System (NEU)

Debug-Tool um zu testen ob Felder die richtigen Morphs verwenden.

### Aktivieren

```javascript
// In Browser Console:
morphDebug.enable()    // Debug-Logging aktivieren
morphDebug.disable()   // Debug-Logging deaktivieren
```

### Analyse-Befehle

```javascript
morphDebug.showStats()       // Statistik aller Morph-Typen
morphDebug.showFieldTypes()  // Welche Felder → welche Typen
morphDebug.showHistory(20)   // Letzte 20 Erkennungen
morphDebug.findByType('bar') // Alle Felder mit Typ 'bar'
morphDebug.showIssues()      // Potenzielle Probleme finden
morphDebug.help()            // Alle Befehle anzeigen
```

### Beispiel-Output

```
🔮 MORPH alkaloid_content_by_part → bar :: [{label, value}...] (3)
✓ RENDER alkaloid_content_by_part [bar] → 523 chars
```
```

## 🔧 Unified Morph API

### createUnifiedMorph(name, singleRender, compareRender?)

Factory für Morphs die automatisch zwischen Single und Compare umschalten:

```typescript
import { createUnifiedMorph } from '../base';
import type { RenderContext, CompareValue } from '../../core/types';

export const badge = createUnifiedMorph(
  'badge',
  
  // Single-Render: Ein Wert
  (value: unknown, ctx: RenderContext): string => {
    const variant = detectVariant(value);
    return `<span class="morph-badge morph-badge--${variant}">${value}</span>`;
  },
  
  // Compare-Render: Mehrere Werte (optional)
  (values: CompareValue[], ctx: RenderContext): string => `
    <div class="morph-badge-compare">
      ${values.map(({ item, value, color }) => 
        `<span class="morph-badge" style="--item-color: ${color}">${value}</span>`
      ).join('')}
    </div>
  `
);
```

### renderValue(value, fieldName, context)
Erkennt automatisch den Typ **aus der Datenstruktur** und rendert:

```typescript
import { renderValue } from './morphs';

// Struktur-basierte Erkennung
renderValue({ value: 75, max: 100 }, 'any_field', context);  // → progress
renderValue({ status: 'LC', variant: 'success' }, 'any', context);  // → badge
renderValue([{ axis: 'A', value: 1 }], 'profile', context);  // → radar
renderValue([1, 2, 3, 4, 5], 'trend', context);  // → sparkline
```

### wrapInField(fieldName, morphType, content, rawValue?)
Wraps morph output in field container with optional Base64-encoded raw value:

```typescript
// Raw values bis 10KB werden Base64-encoded für Compare-Modus
wrapInField('alkaloid_profile', 'radar', '<svg>...</svg>', radarData);
// → <div data-raw-value="eyJheGlzIjoi...">...</div>
```

### renderCompare(items, fieldName, context)
Rendert Vergleichs-Ansicht für mehrere Items:

```typescript
import { renderCompare } from './morphs';

const html = renderCompare(
  [steinpilz, fliegenpilz], 
  'toxizität', 
  { mode: 'compare', itemCount: 2 }
);
```

## � Security

### Image XSS Protection
Der `image` Morph verwendet `validateUrl()` aus `core/security.ts`:
- Blockiert `javascript:`, `data:`, `vbscript:` URLs
- Erlaubt nur sichere URLs (http/https, relative Pfade)
- Zeigt `[Blocked URL]` für blockierte URLs

```typescript
// Gefährliche URLs werden blockiert
image('javascript:alert(1)') // → [Blocked URL]
image('data:image/svg+xml...') // → [Blocked URL]

// Sichere URLs funktionieren
image('/images/photo.jpg') // ✓
image('https://example.com/img.png') // ✓
```

## 📋 Morph-Übersicht (18 Primitives)

| Morph | Single | Compare | CSS Klasse |
|-------|--------|---------|------------|
| **text** | Escaped text | Side-by-side | `.morph-text` |
| **number** | German locale | Horizontal bars | `.number-compare-wrapper` |
| **boolean** | ✓ / ✗ | Side-by-side | `.boolean-compare-wrapper` |
| **badge** | Colored label | Highlight diff | `.badge-compare-wrapper` |
| **tag** | Pill list | Common/Partial/Unique | `.tag-compare-wrapper` |
| **progress** | Bar 0-100% | Stacked bars | `.progress-compare-wrapper` |
| **rating** | ★★★★☆ | Horizontal | `.rating-compare-wrapper` |
| **range** | min–max | Overlap visual | `.range-compare-wrapper` |
| **stats** | min/avg/max | Side-by-side | `.stats-compare-wrapper` |
| **image** | Thumbnail | Gallery | `.morph-image` |
| **link** | Clickable | List | `.morph-link` |
| **list** | Bullet list | Common/Unique Sections | `.list-compare-wrapper` |
| **date** | Formatted | Side-by-side | `.morph-date` |
| **bar** | Chart bars | Grouped + Ø | `.bar-compare-wrapper` |
| **sparkline** | Mini chart | Overlay | `.sparkline-compare-wrapper` |
| **radar** | Spider chart | Overlay + Insights | `.morph-radar` |
| **timeline** | Event list | Side-by-side | `.morph-timeline` |
| **object** | Key-value | Tabelle + Max/Min/Δ | `.morph-object` |

## 🔧 Object-Parsing in Morphs (NEU)

Badge, Rating und Progress parsen automatisch strukturierte Objekte:

### Badge
```typescript
// String-Format
badge('edible')  // → "edible" mit auto-detected variant

// Object-Format (aus Blueprints)
badge({ status: 'edible', variant: 'success' })  // → "edible" mit success variant
```

### Rating
```typescript
// Zahl-Format  
rating(4)  // → ★★★★☆ (4/5)

// Object-Format (aus Blueprints)
rating({ rating: 7, max: 10 })  // → "7/10" ★★★☆☆ (7 von 10)
```

### Progress
```typescript
// Zahl-Format
progress(75)  // → 75% Bar

// Object-Format (aus Blueprints)
progress({ value: 75, max: 100, unit: '%' })  // → 75% Bar mit Unit
```

## 🎨 Compare Design System (Unified)

Alle Compare-Morphs verwenden einheitliches CSS-Pattern:
- Transparente Flächen für bessere Überlagerung

### Unified Compare CSS Pattern (NEU)

Alle Compare-Morphs verwenden konsistentes Design:

```css
/* Wrapper */
.{type}-compare-wrapper { ... }

/* Bar-Row für jeden Wert */
.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Farbiger Dot pro Item */
.bar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--item-color);
}

/* Track mit 68% Breite */
.bar-fill-track {
  flex: 1;
  max-width: 68%;
  height: 10px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

/* Durchschnitts-Linie */
.bar-avg-line {
  position: absolute;
  width: 2px;
  height: 14px;
  background: rgba(255,255,255,0.5);
}

/* Wert-Anzeige */
.bar-val {
  font-size: 0.9375rem;
  color: var(--item-color);
}
```

### Object Compare-Modus
- **Tabellarische Darstellung** statt verschachtelt
- Gruppen-Header für verschachtelte Objekte
- **Max/Min-Hervorhebung**: Grün für höchste, Orange für niedrigste Werte
- **Δ-Differenz** bei numerischen Werten direkt am Label

### Radar-Datenformate

Der `radar` Morph unterstützt zwei Formate:

```typescript
// Format 1: Object mit numerischen Feldern
{ Psilocybin: 95, Psilocin: 35, Baeocystin: 15 }

// Format 2: Array mit axis+value (bevorzugt für benannte Achsen)
[
  { axis: "Psilocybin", value: 95 },
  { axis: "Psilocin", value: 35 },
  { axis: "Baeocystin", value: 15 }
]
```

**Wichtig:** Radar-Labels werden **NIEMALS** gekürzt. ViewBox und text-anchor 
werden dynamisch angepasst um alle Labels vollständig darzustellen.

| **timeline** | Event list | Side-by-side | `.morph-timeline` |
| **object** | Key-value | Side-by-side | `.morph-object` |

## 🎨 Badge Variants

Automatische Variant-Erkennung:
- `danger`: giftig, tödlich, gefährlich
- `warning`: ungenießbar, vorsicht
- `success`: essbar, gut, sicher
- `info`: selten, häufig
- `neutral`: default

## 🎨 CSS in public/styles/morphs.css

Alle Morph-Styles sind in `public/styles/morphs.css`:
- Hardcoded Colors (keine CSS Variables)
- Pilz-Farben für Compare (8 Neon-Farben)
- Perspektiven-Farben (15 Farben)

## 🧪 Tests

`tests/morphs/` - 116 Tests aufgeteilt nach Morph:
- text: HTML Escaping
- number: German locale, compare with bar-row
- boolean: true/false/ja/nein, compare all-same/different
- badge: Variant Detection, object parsing
- progress: Clamping 0-100, object parsing
- rating: Star Rendering, object parsing
- object: Nested objects, arrays, compare table
- radar: Single + compare overlay mit insights
- bar: Single + compare mit Statistiken
- wrapInField: Base64 encoding
- renderValue: data-raw-value Attribut

## 💡 Neuen Morph hinzufügen

1. Erstelle `src/morphs/primitives/mymorph.ts`:
```typescript
import { createUnifiedMorph } from '../base';

export const mymorph = createUnifiedMorph(
  'mymorph',
  (value, ctx) => `<div class="morph-mymorph">${value}</div>`
);
```

2. Registriere in `primitives/index.ts`:
```typescript
export * from './mymorph';
export const primitives = { ...existing, mymorph };
```

3. Füge Detection hinzu in `core/detection.ts` (falls nötig)

4. Füge CSS hinzu in `public/styles/morphs.css`
