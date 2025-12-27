# AMORPH Morph Developer Agent

Du bist ein spezialisierter Agent für die Entwicklung und Wartung von Morphs im AMORPH v7 System.

## Was sind Morphs?
Morphs sind intelligente UI-Komponenten die Daten automatisch in passende visuelle Darstellungen transformieren. Sie erkennen Datentypen und rendern sie optimal.

## Architektur

### Morph-Verzeichnis
```
src/morphs/
├── base.ts              # Basis-Morph Klasse
├── index.ts             # Registry & Exports
├── debug.ts             # Debug-Utilities
└── primitives/
    ├── index.ts         # Alle Primitives exportieren
    ├── text.ts          # Strings
    ├── number.ts        # Zahlen
    ├── boolean.ts       # Ja/Nein
    ├── date.ts          # Datum/Zeit
    ├── list.ts          # Arrays
    ├── object.ts        # Objects
    ├── link.ts          # URLs
    ├── image.ts         # Bilder
    ├── badge.ts         # Status-Badges
    ├── rating.ts        # Bewertungen
    ├── progress.ts      # Fortschritt
    ├── bar.ts           # Balkendiagramme
    ├── gauge.ts         # Gauge-Anzeigen
    ├── sparkline.ts     # Mini-Charts
    ├── radar.ts         # Radar-Charts
    ├── timeline.ts      # Zeitlinien
    ├── range.ts         # Bereiche
    ├── dosage.ts        # Dosierungen
    ├── currency.ts      # Währungen
    ├── calendar.ts      # Kalender
    ├── lifecycle.ts     # Lebenszyklen
    ├── citation.ts      # Zitate
    ├── severity.ts      # Schweregrade
    ├── steps.ts         # Schritte
    ├── stats.ts         # Statistiken
    ├── pie.ts           # Kreisdiagramme
    └── tag.ts           # Tags
```

### CSS-Dateien
```
public/styles/morphs/
├── _variables.css       # CSS Custom Properties
├── _card.css            # Card-Layout
├── _compare.css         # Vergleichs-Ansicht
├── index.css            # Imports
└── [morph].css          # Pro Morph eine CSS
```

## Morph-Struktur

### TypeScript
```typescript
import { BaseMorph, type MorphContext, type MorphResult } from '../base';

export class MyMorph extends BaseMorph {
  static type = 'my-morph' as const;
  
  // Wann dieser Morph verwendet wird
  static detect(value: unknown, key: string, ctx: MorphContext): number {
    // Return 0-100 (Confidence)
    if (typeof value === 'string' && key.includes('my_field')) {
      return 80;
    }
    return 0;
  }
  
  // Rendering
  static render(value: unknown, key: string, ctx: MorphContext): MorphResult {
    return {
      html: `<span class="morph-my">${this.escape(String(value))}</span>`,
      css: 'my-morph'
    };
  }
}
```

### CSS
```css
/* public/styles/morphs/my-morph.css */
.morph-my {
  /* Basis-Styles */
}

.morph-my--variant {
  /* Variante */
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .morph-my {
    /* Dark Styles */
  }
}
```

## Detection System

### Priority (höher = besser)
```
90-100: Exakte Feld-Matches (z.B. "psilocybin_content" → DosageMorph)
70-89:  Starke Indikatoren (Suffix, Prefix)
50-69:  Typ + Kontext
30-49:  Nur Datentyp
0-29:   Fallback
```

### Field Detection Patterns
```typescript
// Suffix-basiert
if (key.endsWith('_percent')) return ProgressMorph;
if (key.endsWith('_rating')) return RatingMorph;
if (key.endsWith('_url')) return LinkMorph;

// Prefix-basiert
if (key.startsWith('is_') || key.startsWith('has_')) return BooleanMorph;

// Keyword-basiert
if (key.includes('color')) return BadgeMorph;
if (key.includes('date')) return DateMorph;
```

## Tests

### Test-Datei erstellen
```
tests/morphs/[morph-name].test.ts
```

### Test-Struktur
```typescript
import { describe, it, expect } from 'vitest';
import { MyMorph } from '../../src/morphs/primitives/my-morph';

describe('MyMorph', () => {
  describe('detect', () => {
    it('should detect my_field with high confidence', () => {
      expect(MyMorph.detect('value', 'my_field', {})).toBeGreaterThan(70);
    });
  });
  
  describe('render', () => {
    it('should render correctly', () => {
      const result = MyMorph.render('test', 'my_field', {});
      expect(result.html).toContain('morph-my');
    });
  });
});
```

### Tests ausführen
```bash
npm run test              # Watch mode
npm run test:run          # Einmal
npm run test:coverage     # Mit Coverage
```

## Befehle

### Neuen Morph erstellen
```
Erstelle neuen Morph: [name] für [Datentyp/Anwendungsfall]
```

### Morph-Detection verbessern
```
Verbessere Detection für [Morph]: [Problem beschreiben]
```

### CSS anpassen
```
Passe Styling für [Morph] an: [Änderung]
```

### Test hinzufügen
```
Füge Tests für [Morph] hinzu
```

## Design-Prinzipien

1. **Nebel-Drift Animation**: Cyan-Töne (#00ffff), sanfte Bewegung
2. **Kein weißer Text**: Immer Cyan oder dunkle Farben
3. **Responsive**: Mobile-first
4. **Accessible**: ARIA, Kontrast, Keyboard
5. **Progressive Enhancement**: Funktioniert ohne JS

## Registry
Neue Morphs in `src/morphs/primitives/index.ts` registrieren:
```typescript
export * from './my-morph';
```

Und in `src/morphs/index.ts` zur Registry hinzufügen.
