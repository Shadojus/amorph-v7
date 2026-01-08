# Morphs

28 visuelle Primitive für Datenvisualisierung.

**Tests:** 81 in morphs.test.ts + 29 in morphs/*.test.ts = **~110 Tests**

---

## Konzept

Ein **Morph** ist eine wiederverwendbare Visualisierungskomponente die:
- Automatisch Single/Compare-Modus erkennt
- Konsistentes Styling hat
- Typ-sicher ist
- Als Funktion aufgerufen wird: `morph(value, context)`

---

## Verfügbare Morphs (28)

| Morph | Beschreibung | Verwendung |
|-------|--------------|------------|
| `badge` | Status-Badge | Kategorien, Status |
| `bar` | Fortschrittsbalken | Prozente, Scores |
| `boolean` | Ja/Nein | Flags, Aktivierung |
| `calendar` | Datum | Zeitpunkte |
| `citation` | Zitat | Quellen |
| `currency` | Währung | Preise |
| `date` | Datum formatiert | Zeitangaben |
| `dosage` | Dosierung | Medikamente |
| `gauge` | Messinstrument | Werte mit Skala |
| `image` | Bild | Fotos, Icons |
| `lifecycle` | Lebenszyklus | Phasen |
| `link` | Link | URLs |
| `list` | Liste | Arrays |
| `number` | Zahl | Numerische Werte |
| `object` | Objekt | Verschachtelte Daten |
| `pie` | Kreisdiagramm | Anteile |
| `progress` | Fortschritt | Schritte |
| `radar` | Radar-Chart | Mehrfach-Werte |
| `range` | Bereich | Min/Max |
| `rating` | Bewertung | Sterne |
| `severity` | Schweregrad | Warnstufen |
| `sparkline` | Mini-Chart | Trends |
| `stats` | Statistiken | Zusammenfassungen |
| `steps` | Schritte | Prozesse |
| `tag` | Tag/Label | Kategorisierung |
| `text` | Text | Beschreibungen |
| `timeline` | Zeitachse | Historisch |

---

## Verwendung

```typescript
import { badge, gauge, list } from '@/morphs';

// Single-Modus
badge('active', singleContext);

// Compare-Modus (automatisch erkannt)
gauge({ value: 75, min: 0, max: 100 }, context);
```

## Styling

CSS Variables:
```css
--morph-bg: rgba(0, 0, 0, 0.3);
--morph-border: rgba(255, 255, 255, 0.1);
--morph-text: rgba(255, 255, 255, 0.9);
```

## Neue Morphs erstellen

1. Datei in `morphs/` erstellen
2. Von `base.ts` erben
3. `render()` implementieren
4. In `index.ts` exportieren
