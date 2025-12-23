# AMORPH v7 - Pages

> Astro-Routen und API-Endpoints.

## 📁 Struktur

```
pages/
├── index.astro     # Grid-Übersicht mit Feld-Selektion
├── [slug].astro    # Detail-Seite mit Search + Compare
└── api/
    ├── search.ts   # GET /api/search
    └── compare.ts  # POST /api/compare
```

## 📄 index.astro - Hauptseite

### Features
- **Grid-Ansicht** aller Spezies
- **Sticky Suchleiste** unter Header (z-index: 10000)
- **Feld-Selektion** mit Perspektiven-Farben
- **Site-Switcher Header** mit Bifröst-Portal
- **Bottom Navigation** mit Selection-Badge
- **Compare Panel** mit Copy-Button

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
│   🏠 Home  ⚖️ Compare  🌈 Bifröst │  BottomNav (z:400)
└─────────────────────────────────┘
```

## 📄 [slug].astro - Detail-Seite

### Features
- **Alle Felder** der Spezies anzeigen
- **Perspektiven-Filter** für Felder
- **Feld-Selektion** mit Farben
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
  ]
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
  <div class="selection-bar">...</div>
  <aside class="amorph-compare">...</aside>
</Base>
```

## 📦 [slug].astro - Detail-Seite

Dynamische Route für einzelne Items.

### URL

```
/steinpilz
/fliegenpilz
/amanita-muscaria
```

### Aufbau

```astro
---
const { slug } = Astro.params;
const item = await getItemBySlug(slug);

if (!item) {
  return Astro.redirect('/404');
}
---

<Base title={`${item.name} – AMORPH`}>
  <article class="amorph-detail">
    <header>
      <h1>{item.name}</h1>
      <span class="scientific">{item.wissenschaftlich}</span>
    </header>
    
    <div class="detail-body">
      {Object.entries(item)
        .filter(([k]) => !['id', 'slug', 'name'].includes(k))
        .map(([key, value]) => (
          <Fragment set:html={renderValue(value, key, detailContext)} />
        ))
      }
    </div>
  </article>
</Base>
```

## 📦 api/search.ts - Such-API

### Request

```
GET /api/search?q=pilz&p=culinary,safety&limit=20
```

### Response

```json
{
  "items": [
    {
      "id": "steinpilz",
      "slug": "steinpilz",
      "name": "Steinpilz",
      "wissenschaftlich": "Boletus edulis",
      ...
    }
  ],
  "total": 42,
  "perspectivesWithData": ["culinary", "safety", "ecology"],
  "matchedPerspectives": ["culinary"],
  "html": "<article class='amorph-item'>..."
}
```

### HTML Feld-Wrapper (NEU)

Jedes Feld wird mit Auswahl-Button gerendert:

```html
<div class="amorph-field" data-field="Essbarkeit" data-item="steinpilz">
  <span class="field-name">Essbarkeit:</span>
  <span class="field-value">Essbar</span>
  <button class="field-select" title="Feld auswählen">+</button>
</div>
```

### matchedPerspectives Auto-Activation (NEU)

Wenn der Suchbegriff eine Perspektive matcht (Name, ID oder Beschreibung), werden die gematchten Perspektiven automatisch zu `activePerspectives` hinzugefügt, wenn keine expliziten Perspektiven ausgewählt sind:

```
GET /api/search?q=chemie
→ matchedPerspectives: ["chemistry"]
→ activePerspectives: ["chemistry"]  // Auto-aktiviert wenn leer!
```

Dies stellt sicher, dass Suchergebnisse immer die relevanten Felder anzeigen:
- Suche nach "alkaloid" → chemistry-Perspektive wird aktiviert
- Felder aus chemistry werden in den Ergebnis-Cards angezeigt
- matchedPerspectives bleiben unverändert zur Client-Information

```typescript
// api/search.ts - Auto-Activation Logic
if (matchedPerspectives.length > 0 && activePerspectives.length === 0) {
  activePerspectives.push(...matchedPerspectives);
}
```
```

### Implementation

```typescript
export const GET: APIRoute = async ({ url }) => {
  const query = validateQuery(url.searchParams.get('q') || '');
  const perspectives = url.searchParams.get('p')?.split(',') || [];
  const limit = validateNumber(
    parseInt(url.searchParams.get('limit') || '20'),
    1, 100, 20
  );
  
  const result = await searchItems({ query, perspectives, limit });
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## 📦 api/compare.ts - Compare-API

Zwei Modi: **Item-Vergleich** oder **Feld-Vergleich**.

### Item-Modus (klassisch)

Vergleicht alle Felder von 2+ Items:

```
POST /api/compare
Content-Type: application/json

{
  "items": ["steinpilz", "fliegenpilz"],
  "perspectives": ["safety"]
}
```

### Feld-Modus (NEU)

Vergleicht spezifische Felder verschiedener Items:

```
POST /api/compare
Content-Type: application/json

{
  "fields": [
    { "itemSlug": "steinpilz", "itemName": "Steinpilz", "fieldName": "Essbarkeit", "value": "Essbar" },
    { "itemSlug": "fliegenpilz", "itemName": "Fliegenpilz", "fieldName": "Essbarkeit", "value": "Giftig" }
  ],
  "perspectives": ["safety"]
}
```

### Response

```json
{
  "html": "<div class='compare-view'>...",
  "itemCount": 2,
  "fieldCount": 15,
  "items": [...],
  "mode": "items"  // oder "fields"
}
```

### Feld-Compare HTML

Gruppiert nach Feldname, mit farblicher Item-Zuordnung:

```html
<div class="compare-fields">
  <div class="compare-legend">
    <span style="--item-color: #f0f">Steinpilz</span>
    <span style="--item-color: #0ff">Fliegenpilz</span>
  </div>
  <div class="compare-field-group">
    <h4>Essbarkeit</h4>
    <div class="compare-field-row" style="--item-color: #f0f">
      <span class="item-name">Steinpilz</span>
      <span class="field-value">Essbar</span>
    </div>
    <div class="compare-field-row" style="--item-color: #0ff">
      <span class="item-name">Fliegenpilz</span>
      <span class="field-value">Giftig</span>
    </div>
  </div>
</div>
```

## 🔒 Security

Alle Endpoints verwenden `core/security.ts`:

- `validateQuery()` für Suchbegriffe
- `validateSlug()` / `validateSlugs()` für Item-IDs
- `validateNumber()` für Limits
- `escapeHtml()` für HTML-Output

## 💡 Neue Route hinzufügen

### Statische Route

```astro
<!-- pages/about.astro -->
---
import Base from '../layouts/Base.astro';
---

<Base title="Über AMORPH">
  <h1>Über uns</h1>
</Base>
```

### Dynamische Route

```astro
<!-- pages/kingdom/[kingdom].astro -->
---
const { kingdom } = Astro.params;
const items = await getItemsByKingdom(kingdom);
---
```

### API Endpoint

```typescript
// pages/api/stats.ts
export const GET: APIRoute = async () => {
  const stats = await getStatistics();
  return new Response(JSON.stringify(stats));
};
```
