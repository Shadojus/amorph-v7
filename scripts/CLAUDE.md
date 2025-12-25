# AMORPH v7 - Scripts

> Build-Tools und Validierung für die Daten-Pipeline.

## 📁 Struktur

```
scripts/
├── build-index.js   # v2.0 - SEO-optimierte Index-Generierung
├── build-pages.js   # Static Page Generation (optional, nicht im Workflow)
└── validate.js      # Zod-Schema-Validierung aller JSON-Dateien
```

## 📦 build-index.js (v2.0)

**Zweck**: Generiert SEO-optimierte Index-Dateien für schnelle Suche und Discovery.

### Features
- **Intelligente Daten-Extraktion** aus allen Perspektiven-JSONs
- **Taglines** aus primary_medicinal_uses, ecological_role, etc.
- **Badges** aus edibility_status, medicinal_status
- **Quick Facts** für Vorschau-Cards
- **Engagement Scores** für Featured Species
- **Featured Species** pro Kingdom

### Ausführen
```bash
npm run build:index
# oder
node scripts/build-index.js
```

### Output
- `data/universe-index.json` - Haupt-Index aller Kingdoms
- `data/{kingdom}/index.json` - Kingdom-spezifischer Index

### EXTRACTION_CONFIG
```javascript
const EXTRACTION_CONFIG = {
  // Felder für Tagline-Generierung (Priorität)
  taglineFields: [
    'primary_medicinal_uses',      // ["Neuroregeneration", "Immunstärkung"]
    'special_feature',              // "Biolumineszenz"
    'ecological_role',              // "Schlüsselart"
    'flavor_profile',               // "nussig, erdig"
  ],
  
  // Badge-Felder (Status-Anzeigen)
  badgeFields: [
    'edibility_status',             // {status: "essbar"}
    'medicinal_status',             // {status: "Vitalpilz"}
    'conservation_status',          // {status: "LC"}
  ],
  
  // Quick Facts für Preview
  quickFactFields: [
    'edibility_status',
    'toxicity_level',
    'traditional_medicine_use',
    'culinary_rating',
  ]
};
```

## 📦 validate.js

**Zweck**: Validiert alle JSON-Dateien gegen Zod-Schemas.

### Features
- **Zod-basierte Validierung** für type-safety
- **Perspective-spezifische Schemas** (medicine, safety, culinary, etc.)
- **Dosage-Schema** unterstützt Arrays und Objects
- **Detaillierte Fehler-Reports** mit Pfaden

### Ausführen
```bash
npm run validate
# oder
node scripts/validate.js
```

### Output
```
Validating 196 files...
✓ fungi/hericium-erinaceus/medicine.json
✓ fungi/hericium-erinaceus/safety.json
...
═══════════════════════════════════════════
✅ Validation complete: 0 errors in 196 files
═══════════════════════════════════════════
```

### Schemas
- `dosageSchema` - Flexible Dosierung (Array oder Object)
- `badgeSchema` - {status, variant}
- `rangeSchema` - {min, max, unit?}
- Perspective-spezifische Schemas für medicine, safety, etc.

## 📦 build-pages.js

**Status**: Optional, nicht im Standard-Workflow verwendet.

**Zweck**: Generiert statische HTML-Seiten (für SSG statt SSR).

> **Hinweis**: AMORPH v7 nutzt Astro SSR, daher wird dieses Script normalerweise nicht benötigt.

## 🔄 Build-Workflow

```bash
# 1. Validierung
npm run validate        # 0 Errors expected

# 2. Index generieren (bei Datenänderungen)
npm run build:index     # SEO-Index aktualisieren

# 3. Astro Build
npm run build           # Production Build

# 4. Tests
npm run test:run        # 421 Tests
```

## 📐 package.json Scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:index": "node scripts/build-index.js",
    "validate": "node scripts/validate.js",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```
