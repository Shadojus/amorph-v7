# AMORPH v7 - Public Assets

> Statische Dateien: CSS (Mobile-First), Icons, manifest.json für biologische Datenvisualisierung.

## 📁 Struktur

```
public/
├── styles/
│   ├── base.css        # BLACK GLASS SYSTEM (Single Source of Truth) + Universe BG
│   ├── components.css  # UI-Komponenten (nutzen System-Variablen)
│   ├── morphs.css      # Morph-spezifische Styles
│   └── morphs/
│       ├── _card.css   # Morph Cards (nutzen System-Variablen)
│       └── _compare.css # Compare Mode (nutzen System-Variablen)
└── icons/
    └── (PWA Icons)
```

## 🎨 Design System: BLACK GLASS MORPHISM

### Universe Background

**Schwarzer Weltraum mit ultramarinblauen Nebelschwaden**:
```css
background: #000000;
background-image: 
  radial-gradient(ellipse at 0% 10%, rgba(30, 60, 220, 0.5) 0%, transparent 55%),
  radial-gradient(ellipse at 100% 90%, rgba(40, 70, 200, 0.4) 0%, transparent 55%);
```

### Black Glass Components

**Standard Glass Panel** (Aus _glass.css):
```css
background: linear-gradient(
  145deg,
  rgba(12, 18, 45, 0.65) 0%,
  rgba(6, 10, 28, 0.75) 50%,
  rgba(10, 16, 40, 0.65) 100%
);
border: 1px solid rgba(80, 120, 255, 0.12);
border-top-color: rgba(130, 170, 255, 0.2);
box-shadow: 
  inset 0 1px 0 rgba(255, 255, 255, 0.06),
  0 8px 32px rgba(0, 0, 0, 0.4);
```

**KEIN BLUR** - Klares, scharfes Glas mit Lichtreflexionen

### System Color

**Psychedelic Blue**: `#4d88ff` / `rgb(77, 136, 255)`

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
<link rel="stylesheet" href="/styles/base.css?v=4">
```

## 📦 components.css (Mobile-First)

### Touch-Optimierung

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Touch Targets | Min 44px | Kompakter |
| Perspektiven-Buttons | 44×44px | 36×36px |
| Field-Select Buttons | 32×32px, sichtbar | 22×22px, nur bei Hover |
| Safe-Area Insets | ✅ | - |

### UI-Komponenten

| Klasse | Beschreibung |
|--------|--------------|
| `.amorph-header` | Sticky Header mit Glass Effect + Safe-Area |
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
- `.morph-number` / `.number-compare-wrapper` - Zahlen mit Bar
- `.morph-boolean` / `.boolean-compare-wrapper` - Checkmark/X
- `.morph-badge` / `.badge-compare-wrapper` - Farbige Labels
- `.morph-tag` / `.tag-compare-wrapper` - Pill-Liste
- `.morph-progress` / `.progress-compare-wrapper` - Fortschrittsbalken
- `.morph-rating` / `.rating-compare-wrapper` - Sterne
- `.morph-range` / `.range-compare-wrapper` - Min-Max Bereich
- `.morph-stats` / `.stats-compare-wrapper` - Statistik-Karte
- `.morph-image` - Thumbnail
- `.morph-link` - Klickbarer Link
- `.morph-list` / `.list-compare-wrapper` - Aufzählung
- `.morph-date` - Formatiertes Datum
- `.morph-bar` / `.bar-compare-wrapper` - Balkendiagramm
- `.morph-sparkline` / `.sparkline-compare-wrapper` - Mini-Chart (SVG)
- `.morph-radar` - Spider-Chart (SVG)
- `.morph-timeline` - Ereignis-Liste
- `.morph-object` - Key-Value Paare

### Unified Compare CSS Pattern (NEU)

```css
/* Standard-Werte für alle Compare-Morphs */
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--item-color); }
.bar-fill-track { flex: 1; max-width: 68%; height: 10px; background: rgba(255,255,255,0.1); }
.bar-avg-line { width: 2px; height: 14px; background: rgba(255,255,255,0.5); }
.bar-val { font-size: 0.9375rem; color: var(--item-color); }
```

### Search Showcase (NEU)

"First Load" Ansicht zeigt jeden Morph-Typ einmal mit Echtdaten:

```css
.showcase-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* 4 Spalten */
  gap: 12px;
  max-height: calc(100vh - 300px);
}

.showcase-item {
  background: rgba(30, 30, 50, 0.6);
  border-radius: 8px;
  padding: 12px;
}

/* Größenbeschränkungen für große Morphs */
.showcase-item[data-morph="timeline"] { max-height: 200px; overflow-y: auto; }
.showcase-item[data-morph="list"] { max-height: 150px; overflow-y: auto; }
.showcase-item[data-morph="object"] { max-height: 180px; overflow-y: auto; }
```

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
