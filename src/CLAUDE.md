# AMORPH v7 - Source Directory

> TypeScript-Module für biologische Datenvisualisierung (Pilze, Pflanzen, Tiere, etc.).

## 📁 Struktur

```
src/
├── core/           # Typen, Detection (struktur-basiert), Security
├── morphs/         # Unified Morph System (18 Primitives)
├── observer/       # Debug & Analytics
├── server/         # SSR: Config + Data Loader
├── client/         # Browser: Features
├── layouts/        # Astro Base Layout
├── pages/          # Routes + API
└── env.d.ts        # Astro TypeScript Referenzen
```

## 🔗 Modul-Abhängigkeiten

```
pages/ → layouts/ → server/ → core/
                 ↘        ↘
                  client/ → morphs/ → core/
                        ↘
                         observer/
```

## 📦 Module im Detail

### core/
Fundamentale Typen und Utilities:
- `types.ts` - RenderContext, MorphType, ItemData, CompareValue
- `detection.ts` - **Struktur-basierte** Typ-Erkennung (keine Feldnamen!)
- `security.ts` - Input Validation, XSS Schutz, Path Traversal Prevention
- `index.ts` - Re-Exports

### morphs/
Unified Morph Architecture:
- `base.ts` - createUnifiedMorph() Factory + wrapInField() mit Base64
- `primitives/` - 18 Morph-Typen (text, badge, progress, etc.)
- `index.ts` - Registry, renderValue(), renderCompare()

### observer/
Debug und Analytics System:
- `debug.ts` - Kategorisiertes Logging mit History
- `interaction.ts` - Click, Hover, Input Tracking
- `rendering.ts` - Mount/Unmount Events
- `session.ts` - Page Views, Session Tracking
- `target.ts` - Console/HTTP/WebSocket Backends
- `index.ts` - setupObservers(), getObserverStats()

### server/
Server-seitige Module (nur SSR):
- `config.ts` - YAML Config Loader (via Symlink)
- `data.ts` - JSON Data Loader, Hierarchical Format Support
- `index.ts` - Re-Exports

### client/
Browser-Module:
- `features/` - App Init, Search, Grid, Compare, Selection, Debug
- `styles/` - (leer, CSS ist in public/)

### layouts/
Astro Layout Components:
- `Base.astro` - Modulares HTML-Gerüst (~50 Zeilen)

### pages/
Astro Routes:
- `index.astro` - Grid-Übersicht
- `[slug].astro` - Detail-Seite
- `api/search.ts` - GET /api/search
- `api/compare.ts` - POST /api/compare

## 🔧 Build Info

- TypeScript 5.9+
- Astro 5.16 mit SSR (Node Adapter)
- Alle Module sind ESM (type: "module")
- Relative Imports mit .js Extension für Node-Kompatibilität
