# AMORPH v7 - Pages

> Astro-Routen und API-Endpoints.

## 📁 Struktur

```
pages/
├── index.astro     # Grid-Übersicht + Morph Showcase (421 Zeilen)
├── [slug].astro    # Detail-Seite mit Perspektiven (699 Zeilen)
└── api/
    ├── search.ts   # GET /api/search
    └── compare.ts  # POST /api/compare (Feld-Modus)
```

## 📄 index.astro - Hauptseite (421 Zeilen)

### Features
- **Grid-Ansicht** aller Spezies
- **Sticky Suchleiste** unter Header (z-index: 10000)
- **Feld-Selektion** mit Perspektiven-Farben
- **Site-Switcher Header** mit Bifröst-Portal
- **Bottom Navigation** mit Selection-Badge (z-index: 10001)
- **Compare Panel** mit Copy-Button (z-index: 9999)
- **Morph Showcase Section** mit allen 28 Primitives

### Layout
```
┌─────────────────────────────────┐
│ 🍄 Funginomi | Phytonomi | Bifröst │  Header (z:200)
├─────────────────────────────────┤
│        🔍 Suchen...              │  Search (z:10000, sticky)
├─────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │Card │ │Card │ │Card │       │  Grid
│  └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────┤
│ 📊 Morph Showcase               │  28 Morphs Demo
├─────────────────────────────────┤
│   🏠 Home  ⚖️ Compare  🌈 Bifröst │  BottomNav (z:10001)
└─────────────────────────────────┘
```

## 📄 [slug].astro - Detail-Seite (699 Zeilen)

### Features
- **Alle Felder** der Spezies mit Morph-Rendering
- **Perspektiven-Filter** für Felder
- **Feld-Selektion** mit Perspektiven-Farben
- **Search durchsucht Compare** wenn aktiv
- **sessionStorage Persistenz** der Selection

## 📡 API Endpoints

### GET /api/search
```
/api/search?q=pilz&p=culinary,safety&limit=20
```

Response:
```json
{
  "items": [...],
  "total": 42,
  "perspectivesWithData": ["culinary", "safety"],
  "html": "<article>..."
}
```

### POST /api/compare
```json
{
  "fields": [
    {"itemSlug": "steinpilz", "fieldName": "toxicity", "value": {...}},
    ...
  ],
  "perspectives": ["culinary"]
}
```

Response:
```json
{
  "html": "<div class='compare-view'>...",
  "itemCount": 2,
  "fieldCount": 15
}
```

## 🎨 Z-Index Hierarchie

| Element | Z-Index |
|---------|---------|
| Bottom Nav | 10001 |
| Search | 10000 |
| Compare Panel | 9999 |
| Header | 200 |

## 📦 api/search.ts - Such-API

### Request
```
GET /api/search?q=pilz&p=culinary,safety&limit=20
```

### Response
```json
{
  "items": [...],
  "total": 42,
  "perspectivesWithData": ["culinary", "safety"],
  "matchedPerspectives": ["culinary"],
  "html": "<article class='amorph-item'>..."
}
```

### Auto-Perspektiven
Wenn Suchbegriff eine Perspektive matcht (z.B. "chemie" → "chemistry"), wird diese automatisch aktiviert.

## 📦 api/compare.ts - Compare-API

### Zwei Modi

**Item-Modus** (alle Felder):
```json
POST /api/compare
{ "items": ["steinpilz", "fliegenpilz"], "perspectives": ["safety"] }
```

**Feld-Modus** (spezifische Felder):
```json
POST /api/compare
{
  "fields": [
    { "itemSlug": "steinpilz", "itemName": "Steinpilz", "fieldName": "Essbarkeit", "value": "Essbar" }
  ]
}
```

### Response
```json
{
  "html": "<div class='compare-view'>...",
  "itemCount": 2,
  "fieldCount": 15,
  "mode": "items"
}
```

## 🔒 Security

Alle Endpoints verwenden `core/security.ts`:
- `validateQuery()` für Suchbegriffe
- `validateSlug()` / `validateSlugs()` für Item-IDs
- `validateNumber()` für Limits
- `escapeHtml()` für HTML-Output
