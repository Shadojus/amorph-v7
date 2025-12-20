# AMORPH v7 - Morphs Module

> Unified Morph Architecture mit 18 Primitives (45+ MorphTypes für Erweiterbarkeit).
> Visualisiert biologische Daten: Taxonomie, Chemie, Ökologie, Medizin, etc.
> **Struktur-basierte Detection** - Typ wird aus Datenstruktur erkannt, nicht aus Feldnamen!

## 📁 Struktur

```
morphs/
├── base.ts           # createUnifiedMorph() Factory + wrapInField() mit Base64
├── debug.ts          # Morph Debug System
├── primitives/       # 18 Morph-Implementierungen
│   ├── index.ts      # Re-Exports + Registry
│   ├── text.ts
│   ├── number.ts
│   ├── boolean.ts
│   ├── badge.ts
│   ├── tag.ts
│   ├── progress.ts
│   ├── rating.ts
│   ├── range.ts
│   ├── stats.ts
│   ├── image.ts
│   ├── link.ts
│   ├── list.ts
│   ├── date.ts
│   ├── bar.ts
│   ├── sparkline.ts
│   ├── radar.ts
│   ├── timeline.ts
│   └── object.ts
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
| **number** | German locale | Horizontal bars | `.morph-number` |
| **boolean** | ✓ / ✗ | Side-by-side | `.morph-boolean` |
| **badge** | Colored label | Highlight diff | `.morph-badge` |
| **tag** | Pill list | Common/Unique | `.morph-tag` |
| **progress** | Bar 0-100% | Stacked bars | `.morph-progress` |
| **rating** | ★★★★☆ | Horizontal | `.morph-rating` |
| **range** | min–max | Overlap visual | `.morph-range` |
| **stats** | min/avg/max | Side-by-side | `.morph-stats` |
| **image** | Thumbnail | Gallery | `.morph-image` |
| **link** | Clickable | List | `.morph-link` |
| **list** | Bullet list | Side-by-side | `.morph-list` |
| **date** | Formatted | Side-by-side | `.morph-date` |
| **bar** | Chart bars | Grouped + Ø/Δ | `.morph-bar` |
| **sparkline** | Mini chart | Overlay | `.morph-sparkline` |
| **radar** | Spider chart | Overlay + Insights | `.morph-radar` |
| **timeline** | Event list | Side-by-side | `.morph-timeline` |
| **object** | Key-value | Tabelle + Max/Min/Δ | `.morph-object` |

### Bar Compare-Modus
- Gruppierte Balken pro Label
- **Ø** (Durchschnitt) und **Δ** (Differenz) Statistiken pro Gruppe
- Farbige Item-Legende

### Radar Compare-Modus
- Überlagerte Radar-Charts mit gemeinsamer Achsen-Skala
- **Insights-Box**: Zeigt automatisch die 3 größten Unterschiede (Δ)
- Transparente Flächen für bessere Überlagerung

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

`tests/morphs.test.ts` - 81 Tests:
- text: HTML Escaping
- number: German locale
- boolean: true/false/ja/nein
- badge: Variant Detection
- progress: Clamping 0-100
- rating: Star Rendering
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
