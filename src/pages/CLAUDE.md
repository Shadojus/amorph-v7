# AMORPH v7 - Pages

> Astro-Routen und API-Endpoints mit Engagement-optimierter Feld-Priorisierung.

## 📁 Struktur

```
pages/
├── index.astro     # Grid-Übersicht + HIGH_VALUE_FIELDS (~438 Zeilen)
├── [slug].astro    # Detail-Seite mit Perspektiven (~699 Zeilen)
└── api/
    ├── search.ts   # GET /api/search
    └── compare.ts  # POST /api/compare (Feld-Modus)
```

## 📄 index.astro - Hauptseite (~438 Zeilen)

### Features
- **Grid-Ansicht** aller Spezies (27 Pilze)
- **HIGH_VALUE_FIELDS Priorisierung** - "Knaller"-Daten zuerst anzeigen
- **MORPH_PRIORITY** - Badge vor Range, visuell wichtiges zuerst
- **Sticky Suchleiste** unter Header (z-index: 10000)
- **Feld-Selektion** mit Perspektiven-Farben
- **Site-Switcher Header** mit Bifröst-Portal
- **Bottom Navigation** mit Selection-Badge (z-index: 10001)
- **Compare Panel** mit Copy-Button (z-index: 9999)

### HIGH_VALUE_FIELDS Tiers (neu!)
```
TIER 1: 🌟 WOW-FAKTOR
  - special_feature, bioluminescence, bioremediation_potential
  - effect_profile, historical_significance

TIER 2: 💫 HEALING & TRADITION
  - primary_medicinal_uses, traditional_medicine_systems
  - mechanism_of_action, active_compounds

TIER 3: 🍳 KULINARIK & LIFESTYLE
  - culinary_rating, flavor_profile, signature_dishes_famous
  - wine_pairing, best_cooking_methods

TIER 4: 🌿 NATUR & ÖKOLOGIE
  - ecological_role, ecosystem_services, iucn_global_status

TIER 5: ⚠️ SICHERHEIT
  - edibility_status, toxicity_level, confusion_risk_level

TIER 6: 🔬 IDENTIFIKATION
  - identification_difficulty, key_differentiating_features
```

### MORPH_PRIORITY (visueller Impact)
```typescript
const MORPH_PRIORITY = {
  'badge': 1,     // Essbarkeit, Status - HÖCHSTE PRIO
  'severity': 1,  // Giftigkeit, Warnungen
  'bar': 2,       // Nährstoffe, Verteilung
  'radar': 2,     // Compound Profile
  'range': 5,     // Größen-Ranges (weniger wichtig!)
  'text': 9,      // Text ganz unten
};
```

### sortFieldsByInterest()
```typescript
// 1. High-Value Fields haben absolute Priorität
// 2. Innerhalb: nach Tier-Reihenfolge
// 3. Keine High-Value: nach Morph-Typ sortieren
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
