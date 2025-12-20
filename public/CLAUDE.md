# AMORPH v7 - Public Assets

> Statische Dateien: CSS, Icons, manifest.json

## 📁 Struktur

```
public/
├── styles/
│   ├── base.css        # Design Tokens + Reset
│   ├── components.css  # UI-Komponenten
│   └── morphs.css      # Morph-spezifische Styles
└── icons/
    └── (PWA Icons)
```

## 🎨 Design System

### Farbpalette

**System Color**: Psychedelic Blue `#4d88ff`

**Background Gradient**:
```css
background: linear-gradient(
  135deg,
  #0a0a0f 0%,
  #1a0a2e 25%,
  #0d0d1f 50%,
  #0a1a2e 75%,
  #0a0a0f 100%
);
```

**Glass Effect**:
```css
background: rgba(13, 13, 31, 0.85);
backdrop-filter: blur(20px);
border: 1px solid rgba(77, 136, 255, 0.2);
```

### Perspektiven-Farben (15)

| # | Name | Farbe |
|---|------|-------|
| 1 | Magenta | #ff0080 |
| 2 | Cyan | #00ffff |
| 3 | Orange | #ff8000 |
| 4 | Lime | #80ff00 |
| 5 | Purple | #8000ff |
| 6 | Yellow | #ffff00 |
| 7 | Pink | #ff0040 |
| 8 | Teal | #00ff80 |
| 9 | Blue | #0080ff |
| 10 | Red | #ff4040 |
| 11 | Green | #40ff40 |
| 12 | Violet | #ff40ff |
| 13 | Coral | #ff6060 |
| 14 | Aqua | #60ffff |
| 15 | Gold | #ffc000 |

### Pilz-Farben für Compare (8)

| # | Name | Farbe |
|---|------|-------|
| 1 | Toxic Pink | #ff1493 |
| 2 | Slime Green | #39ff14 |
| 3 | Spore Purple | #bf00ff |
| 4 | Bioluminescent Blue | #00f5ff |
| 5 | Warning Orange | #ff6600 |
| 6 | Mycelium Yellow | #fff700 |
| 7 | Deadly Red | #ff0044 |
| 8 | Magic Teal | #00ffa5 |

## 📦 base.css

### Inhalt

1. **Reset** - Box-sizing, Margins
2. **Typography** - System Fonts, Sizes
3. **Colors** - Hardcoded Design Tokens
4. **Background** - Psychedelic Gradient
5. **Utilities** - Scrollbar Styling

### Cache Busting

```html
<link rel="stylesheet" href="/styles/base.css?v=3">
```

## 📦 components.css

### UI-Komponenten

| Klasse | Beschreibung |
|--------|--------------|
| `.amorph-header` | Fixed Header mit Glass Effect |
| `.amorph-logo` | Logo/Home Link |
| `.amorph-search` | Such-Container |
| `.amorph-search input` | Such-Input |
| `.perspective-filters` | Perspektiven-Button-Leiste |
| `.persp-btn` | Perspektiven-Filter Button |
| `.amorph-main` | Main Content Area |
| `.amorph-grid` | Grid Container |
| `.amorph-item` | Grid Item Card |
| `.item-select` | Auswahl-Checkbox |
| `.selection-bar` | Sticky Selection Bar |
| `.selection-pill` | Ausgewähltes Item Pill |
| `.amorph-compare` | Compare Slide-in Panel |
| `.amorph-detail` | Detail-Ansicht |
| `.empty-state` | Keine Ergebnisse |

### States

- `.is-active` - Aktiver Button
- `.is-selected` - Ausgewähltes Item
- `.is-visible` - Sichtbares Element
- `.has-data` - Perspektive hat Daten

## 📦 morphs.css

### Morph-Basis

```css
.morph-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.morph-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
}

.morph-value {
  font-size: 14px;
}
```

### Morph-Typen (19)

Jeder Morph hat eigene Styles:

- `.morph-text` - Einfacher Text
- `.morph-number` - Zahlen mit Bar
- `.morph-boolean` - Checkmark/X
- `.morph-badge` - Farbige Labels
- `.morph-tag` - Pill-Liste
- `.morph-progress` - Fortschrittsbalken
- `.morph-rating` - Sterne
- `.morph-range` - Min-Max Bereich
- `.morph-stats` - Statistik-Karte
- `.morph-image` - Thumbnail
- `.morph-link` - Klickbarer Link
- `.morph-list` - Aufzählung
- `.morph-date` - Formatiertes Datum
- `.morph-bar` - Balkendiagramm
- `.morph-sparkline` - Mini-Chart (SVG)
- `.morph-radar` - Spider-Chart (SVG)
- `.morph-timeline` - Ereignis-Liste
- `.morph-object` - Key-Value Paare

### Badge Variants

```css
.morph-badge--danger  { background: #dc2626; }
.morph-badge--warning { background: #d97706; }
.morph-badge--success { background: #16a34a; }
.morph-badge--info    { background: #2563eb; }
.morph-badge--neutral { background: #4b5563; }
```

## 📱 Responsive Design

Mobile-First mit Breakpoints:
- Default: Mobile (< 640px)
- `@media (min-width: 640px)`: Tablet
- `@media (min-width: 1024px)`: Desktop

### Grid Columns

```css
.amorph-grid {
  grid-template-columns: 1fr;  /* Mobile */
}

@media (min-width: 640px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}
```

## 💡 Best Practices

1. **Hardcoded Colors** - Keine CSS Variables für Kompatibilität
2. **Cache Busting** - `?v=X` bei CSS-Änderungen erhöhen
3. **Mobile First** - Basis-Styles für Mobile, dann Erweiterungen
4. **Glass Effect** - `backdrop-filter` nur wo nötig (Performance)
