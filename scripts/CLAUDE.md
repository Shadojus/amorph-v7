# AMORPH v7 - Scripts

> Build-Tools, Validierung und Agent-System für die Daten-Pipeline.

## 📁 Struktur

```
scripts/
├── build-index.js       # v2.0 - SEO-optimierte Index-Generierung
├── build-pages.js       # Static Page Generation (optional)
├── validate.js          # Zod-Schema-Validierung aller JSON-Dateien
├── agent-create.js      # Agent Queue-Management für Multi-Agent Workflows
├── agent-prompt.js      # Prompt-Generator für Claude-Agenten
├── agent-validate.js    # Validierung + Experten-Anreicherung
└── lib/
    └── field-expert-mapping.js  # Hilbert-Raum Feld-Experten-Mapping
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

## 🤖 Agent-System (NEU)

Das Agent-System ermöglicht mehreren Claude-Agenten parallel Daten zu erstellen.

### agent-create.js - Queue Management

Verwaltet eine Task-Queue für Multi-Agent-Workflows:

```bash
# Queue initialisieren
node scripts/agent-create.js --init

# Aufgaben hinzufügen
node scripts/agent-create.js --add steinpilz medicine 1    # Priorität 1 (hoch)
node scripts/agent-create.js --add steinpilz ecology 5     # Priorität 5 (normal)

# Aufgabe claimen (für Agent)
node scripts/agent-create.js --claim claude-agent-1

# Status prüfen
node scripts/agent-create.js --list-pending
node scripts/agent-create.js --list-progress

# Experten für Perspektive
node scripts/agent-create.js --experts medicine
```

### agent-prompt.js - Prompt Generator

Generiert strukturierte Prompts für Daten-Agenten:

```bash
# Einzelner Prompt
node scripts/agent-prompt.js hericium-erinaceus medicine

# Batch für alle Spezies ohne diese Perspektive
node scripts/agent-prompt.js --batch fungi ecology

# Verfügbare Blueprints
node scripts/agent-prompt.js --list-blueprints
```

### agent-validate.js - Validierung + Anreicherung

Validiert Agent-Output und reichert mit Experten an:

```bash
# Einzelne Datei validieren
node scripts/agent-validate.js steinpilz medicine

# Alle Perspektiven einer Spezies
node scripts/agent-validate.js --species steinpilz

# Alle Spezies eines Kingdoms
node scripts/agent-validate.js --all fungi

# Mit Experten anreichern
node scripts/agent-validate.js --enrich steinpilz medicine
```

### lib/field-expert-mapping.js - Hilbert-Raum Mapping

Semantische Zuordnung von Feldern zu Experten:

```javascript
import { 
  findExpertsForField,
  findFieldsForExpert,
  getExpertsForPerspective,
  generateFieldExpertMapping
} from './lib/field-expert-mapping.js';

// Experten für ein Feld finden
findExpertsForField('primary_medicinal_uses', 3);
// → [{expert: 'paul-stamets', similarity: 0.85}, ...]

// Feld-Experten-Mapping für ganzes Item
generateFieldExpertMapping(itemData);
// → {fieldName: ['expert1', 'expert2'], ...}
```

**Semantische Cluster:**
- medical, identification, cultivation, ecology
- chemistry, psychoactive, culinary, safety
- culture, research

## 🔄 Agent-Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. Tasks zur Queue hinzufügen                                       │
│     node scripts/agent-create.js --add steinpilz medicine 1          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Agent claimt Task                                                │
│     node scripts/agent-create.js --claim claude-agent-1              │
│     → Erhält: species + perspective                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Agent bekommt Prompt                                             │
│     node scripts/agent-prompt.js steinpilz medicine                  │
│     → Strukturierter Prompt mit Blueprint + Experten                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Agent erstellt JSON-Daten                                        │
│     → Speichert in data/fungi/steinpilz/medicine.json               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Validierung + Experten-Anreicherung                              │
│     node scripts/agent-validate.js steinpilz medicine                │
│     node scripts/agent-validate.js --enrich steinpilz medicine       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. Index neu generieren                                             │
│     npm run build:index                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Build-Workflow

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
