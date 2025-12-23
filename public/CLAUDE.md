# AMORPH v7 - Public Assets

> Statische CSS-Dateien für das Black Glass Morphism Design System.

## 📁 Struktur

```
public/
├── styles/
│   ├── base.css        # Design Tokens, Multi-Site Colors, Typography
│   ├── components.css  # UI-Komponenten (Header, Search, Compare, Nav)
│   ├── morphs.css      # Morph-spezifische Styles (18 Primitives)
│   └── morphs/
│       ├── _card.css   # Grid-Card Styles
│       ├── _compare.css # Compare-Mode Styles
│       └── _variables.css # Morph CSS Variables
└── icons/              # PWA Icons
```

## 🎨 Design System

### Z-Index Hierarchie
```css
z-index: 10000  /* Suchleiste - immer über allem */
z-index: 9999   /* Compare-Panel */
z-index: 400    /* Bottom Navigation */
z-index: 200    /* Header */
```

### Multi-Site Colors (base.css)
```css
--site-funginomi-rgb: 77, 136, 255;   /* Psychedelic Blue */
--site-phytonomi-rgb: 51, 179, 128;   /* Jade Green */
--site-therionomi-rgb: 235, 77, 180;  /* Magenta Pink */
--system-rgb: var(--site-funginomi-rgb); /* Active Site */
```

### Perspektiven (15 matte Pastell-Töne)
```css
[data-perspektive="chemistry"] { --perspektive-rgb: 160, 140, 160; }
[data-perspektive="ecology"]   { --perspektive-rgb: 130, 150, 120; }
/* ... */
```

### Bio-Lumineszenz (Compare, 8 Farben)
```css
--bio-foxfire: rgb(0, 255, 200);      /* Panellus stipticus */
--bio-myzel: rgb(167, 139, 250);
--bio-sporen: rgb(251, 191, 36);
--bio-tiefsee: rgb(34, 211, 238);
--bio-rhodotus: rgb(244, 114, 182);
--bio-chlorophyll: rgb(163, 230, 53);
--bio-carotin: rgb(251, 146, 60);
--bio-lavendel: rgb(196, 181, 253);
```

### Black Glass Morphism
```css
background: rgba(8, 10, 16, 0.95);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.04);
```

## 📦 CSS Files

### base.css (~900 Zeilen)
- CSS Reset
- Design Tokens (Space, Radius, Transitions, Z-Index)
- Multi-Site Color System
- Perspektiven-Farben
- Bio-Lumineszenz Farben
- Typography
- Glass Panel Basics

### components.css (~3600 Zeilen)
- **Search Bar** - Sticky unter Header, z-index: 10000
- **Header** - Site-Switcher mit Bifröst-Portal, Nebel-Animation
- **Compare Panel** - Copy-Button, License-Notice, Search-Highlights
- **Bottom Navigation** - Fixed, Badge für Selection-Count
- **Selection Bar** - Perspective-Pills
- **Grid Cards** - Field Selection mit Farben
- **Detail Page** - Species View Komponenten

### morphs.css (~2000 Zeilen)
- 18 Morph Primitives Styles
- Single Mode + Compare Mode
- Bar, Radar, Sparkline Charts
- Progress, Rating, Range
- Badge, Tag, Text, Number
- Image, Link, List, Object
- Timeline, Calendar, Steps
    var(--bio-rhodotus) 60%,
    var(--bio-chlorophyll) 75%,
    var(--bio-carotin) 90%,
    var(--bio-foxfire) 100%
  );
  animation: rotateBioBorder 10s linear infinite;
}
```

**KEIN BLUR** - Klares, scharfes Glas mit Lichtreflexionen

### System Color

**Psychedelic Blue**: `#4d88ff` / `rgb(77, 136, 255)`

### Perspektiven-Farben (15) - Matte Pastell-Töne

Dezent, nicht leuchtend - klar unterscheidbar von Bio-Lumineszenz:

| Perspektive | Farbe | RGB |
|-------------|-------|-----|
| culinary | Matte Terracotta | 180, 140, 120 |
| safety | Dusty Rose | 170, 130, 140 |
| cultivation | Sage Grau | 120, 150, 130 |
| medicine | Mauve Grau | 150, 140, 170 |
| chemistry | Dusty Plum | 160, 140, 160 |
| ecology | Olive Matte | 130, 150, 120 |
| statistics | Taupe | 165, 155, 140 |
| geography | Clay | 160, 135, 120 |
| temporal | Khaki Matte | 170, 160, 130 |
| economy | Sand Matte | 165, 150, 115 |
| conservation | Seafoam Matte | 115, 150, 145 |
| culture | Lavender Grau | 155, 140, 160 |
| research | Steel Matte | 140, 145, 160 |
| interactions | Apricot Matte | 175, 145, 135 |
| identification | Moss Matte | 145, 155, 125 |

### Bio-Lumineszenz Farben für Compare (8)

Inspiriert von biologischer Lumineszenz (Pilze, Meeresorganismen, Pflanzen):

| # | Name | Farbe | RGB |
|---|------|-------|-----|
| 0 | Foxfire | #00ffc8 | 0, 255, 200 |
| 1 | Myzel | #a78bfa | 167, 139, 250 |
| 2 | Sporen | #fbbf24 | 251, 191, 36 |
| 3 | Tiefsee | #22d3ee | 34, 211, 238 |
| 4 | Rhodotus | #f472b6 | 244, 114, 182 |
| 5 | Chlorophyll | #a3e635 | 163, 230, 53 |
| 6 | Carotin | #fb923c | 251, 146, 60 |
| 7 | Lavendel | #c4b5fd | 196, 181, 253 |

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
