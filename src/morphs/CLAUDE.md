# AMORPH v7 - Morphs Module

> Unified Morph Architecture mit **28 Primitives**.
> Struktur-basierte Detection - Typ wird aus Datenstruktur erkannt.
> Object-Parsing - Badge/Rating/Progress parsen Objekte automatisch.

## � Performance-Optimierungen (Dezember 2025)
- **WebP Support** - `image.ts` rendert `<picture>` mit WebP-Fallback
- **decoding="async"** - Bilder blockieren nicht das Rendering
- **loading="lazy"** - Bilder laden erst bei Sichtbarkeit

## 📁 Struktur

```
morphs/
├── base.ts           # createUnifiedMorph() Factory + wrapInField() (~261 Zeilen)
├── debug.ts          # Morph Debug System (morphDebug.enable())
├── index.ts          # Registry, renderValue(), renderCompare() (~256 Zeilen)
└── primitives/       # 28 Morph-Implementierungen
    ├── index.ts      # Re-Exports + Registry
    ├── badge.ts      # {status, variant}
    ├── bar.ts        # [{label, value}]
    ├── boolean.ts    # true/false
    ├── calendar.ts   # [{month, active}] - Lichtkugeln
    ├── citation.ts   # {author, year, title, doi?}
    ├── currency.ts   # {amount, currency} oder [currencies]
    ├── date.ts       # ISO-Datum
    ├── dosage.ts     # [{amount, unit, frequency}] oder {min, max}
    ├── gauge.ts      # {value, min, max, unit}
    ├── image.ts      # URL mit WebP-Support (<picture>)
    ├── lifecycle.ts  # [{phase, duration}] - Phasen-Dots
    ├── link.ts       # http(s)://
    ├── list.ts       # ["strings"]
    ├── number.ts     # Numbers mit Formatierung
    ├── object.ts     # Generic Object
    ├── pie.ts        # [{label, value}] - Kreisdiagramm
    ├── progress.ts   # {value, max, unit}
    ├── radar.ts      # [{axis, value}] - Spider Chart
    ├── range.ts      # {min, max, unit}
    ├── rating.ts     # {rating, max}
    ├── severity.ts   # [{level, typ}] - Schweregrad
    ├── sparkline.ts  # [numbers] - Mini-Line Chart
    ├── stats.ts      # {min, avg, max}
    ├── steps.ts      # [{step, label}] - Lichtkugeln
    ├── tag.ts        # String ≤20 chars / ["short"]
    ├── text.ts       # String >20 chars
    └── timeline.ts   # [{date, event}]
```

## 🖼️ image.ts - WebP Support

```typescript
// Generiert <picture> mit WebP-Fallback:
<picture class="morph-image">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Image" loading="lazy" decoding="async" />
</picture>

// Automatische Erkennung für JPG/PNG → WebP
function getWebPSrc(src: string): string | null {
  if (/\.(jpg|jpeg|png)$/i.test(src)) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return null;
}
```

## 🎯 Priority im Grid

Index.astro sortiert Felder nach **MORPH_PRIORITY**:

```typescript
const MORPH_PRIORITY = {
  'badge': 1,     // Essbarkeit, Status - HÖCHSTE PRIO
  'severity': 1,  // Giftigkeit, Warnungen
  'bar': 2,       // Nährstoffe, Verteilung
  'radar': 2,     // Compound Profile
  'sparkline': 3, // Trends
  'progress': 3,  // Prozent-Werte
  'range': 5,     // Größen-Ranges (weniger wichtig!)
  'text': 9,      // Text ganz unten
};
```

## 🎯 Unified Morph API

```typescript
import { createUnifiedMorph } from './base';

export const myMorph = createUnifiedMorph(
  'myMorph',
  // Single-Render
  (value, ctx) => `<div class="morph-my">${value}</div>`,
  // Compare-Render (optional)
  (values, ctx) => `<div class="morph-my-compare">...</div>`
);
```

## 🔧 RenderContext

```typescript
interface RenderContext {
  mode: 'single' | 'grid' | 'compare';
  itemCount: number;
  items?: ItemData[];
  itemIndex?: number;
  colors?: string[];
  perspectives?: string[];  // Aktive Perspektiven
  fieldName?: string;       // Aktuelles Feld
  fieldConfig?: SchemaField;
  compact?: boolean;
}
```

## 📊 Detection Priorität

1. **Spezielle Strukturen**: `{min,max}`, `{rating}`, `{status}`, etc.
2. **Arrays**: Prüfe auf `[{label,value}]`, `[{date,event}]`, `[numbers]`
3. **URLs**: Image vs. Link
4. **Strings**: Tag (≤20) vs. Text (>20)
5. **Fallback**: `object` oder `text`

## 🔍 Morph Debug System

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

## 📋 Morph-Übersicht (28 Primitives)

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
| **pie** | Kreisdiagramm | Side-by-side | `.morph-pie` |
| **gauge** | Zeiger-Dial | Side-by-side | `.morph-gauge` |
| **steps** | Lichtkugel-Steps | Side-by-side | `.morph-steps` |
| **lifecycle** | Phasen-Dots | Side-by-side | `.morph-lifecycle` |
| **calendar** | Monats-Dots | Side-by-side | `.morph-calendar` |
| **severity** | Schweregrad | Side-by-side | `.morph-severity` |
| **dosage** | Dosierung | Side-by-side | `.morph-dosage` |
| **citation** | Zitat-Card | List | `.morph-citation` |
| **currency** | Währung | Side-by-side | `.morph-currency` |
| **heatmap** | Heat Grid | Side-by-side | `.morph-heatmap` |
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
| **object** | Key-value | Tabelle + Max/Min/Δ | `.morph-object` |
| **pie** | Kreisdiagramm | Side-by-side | `.morph-pie` |
| **gauge** | Zeiger-Dial | Side-by-side | `.morph-gauge` |
| **steps** | Lichtkugel-Steps | Side-by-side | `.morph-steps` |
| **lifecycle** | Phasen-Dots | Side-by-side | `.morph-lifecycle` |
| **calendar** | Monats-Dots | Side-by-side | `.morph-calendar` |
| **severity** | Schweregrad | Side-by-side | `.morph-severity` |
| **dosage** | Dosierung | Side-by-side | `.morph-dosage` |
| **citation** | Zitat-Card | List | `.morph-citation` |
| **currency** | Währung | Side-by-side | `.morph-currency` |
| **heatmap** | Heat Grid | Side-by-side | `.morph-heatmap` |

## 🎨 CSS in public/styles/morphs/

Morph-Styles sind aufgeteilt in `public/styles/morphs/`:

| Datei | Inhalt |
|-------|--------|
| `_card.css` | Morph Cards |
| `_compare.css` | Compare Mode Layouts |
| `_variables.css` | Design Tokens |
| `badge.css` | Badge Variants |
| `bar.css` | Bar-Charts |
| `boolean.css` | Boolean Rendering |
| `calendar.css` | Kalender-Lichtkugeln |
| `citation.css` | Zitat-Cards |
| `currency.css` | Währungs-Anzeige |
| `date.css` | Datums-Formatierung |
| `dosage.css` | Dosierungs-Anzeige |
| `gauge.css` | Gauge-Dial |
| `image.css` | Image Thumbnails |
| `lifecycle.css` | Lifecycle-Phasen |
| `link.css` | Link-Styling |
| `list.css` | Listen-Rendering |
| `number.css` | Number Formatting |
| `object.css` | Object-Tabellen |
| `pie.css` | Kreisdiagramme |
| `progress.css` | Progress-Bars |
| `radar.css` | Radar/Spider-Charts |
| `range.css` | Range-Anzeige |
| `rating.css` | Star-Rating |
| `severity.css` | Schweregrad-Anzeige |
| `sparkline.css` | Mini-Line Charts |
| `stats.css` | Statistik-Anzeige |
| `steps.css` | Steps mit Lichtkugeln |
| `tag.css` | Tag-Pills |
| `text.css` | Text-Rendering |
| `timeline.css` | Timeline-Events |

### Bio-Lumineszenz Farben (8)

| Var | Farbe | Verwendung |
|-----|-------|------------|
| `--bio-foxfire` | #00ffc8 | Primary, Links |
| `--bio-myzel` | #a78bfa | Charts, Graphs |
| `--bio-sporen` | #fbbf24 | Warnings, Active |
| `--bio-tiefsee` | #22d3ee | Info, Secondary |
| `--bio-rhodotus` | #f472b6 | Pink Accents |
| `--bio-chlorophyll` | #a3e635 | Success, Nature |
| `--bio-carotin` | #fb923c | Orange Accents |
| `--bio-lavendel` | #c4b5fd | Muted, Inactive |

## 🔧 wrapInField(fieldName, morphType, content, rawValue?)

Wraps morph output in field container:

```typescript
// Raw values bis 10KB werden Base64-encoded für Compare-Modus
wrapInField('alkaloid_profile', 'radar', '<svg>...</svg>', radarData);
// → <div class="morph-field" data-field="alkaloid_profile" data-morph="radar" data-raw-value="eyJheGlzIjoi...">...</div>
```

## 🧪 Tests

`tests/morphs/` - Tests aufgeteilt nach Morph:
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

1. Erstelle `src/morphs/primitives/mymorph.ts`
2. Registriere in `primitives/index.ts`
3. Füge Detection hinzu in `core/detection.ts`
4. Füge CSS hinzu in `public/styles/morphs/mymorph.css`
5. Importiere CSS in `public/styles/morphs/index.css`
