# AMORPH v7 - Source Directory

> TypeScript-Module für biologische Datenvisualisierung mit Engagement-Optimierung.

## � Performance-Optimierungen (Dezember 2025)
- **Observer Dynamic Import** - 87KB eingespart, nur bei Bedarf geladen
- **Pagination** - Initial 12 Items, "Mehr laden" Button
- **WebP Bilder** - `<picture>` mit Fallback in image.ts und Templates
- **CSS Bundling** - all.min.css in Production (Base.astro)

## 📁 Struktur

```
src/
├── core/           # Typen, Detection (struktur-basiert), Security
├── morphs/         # Unified Morph System (28 Primitives)
├── observer/       # Debug & Analytics (DYNAMIC IMPORT - 87KB)
├── server/         # SSR: Config + Data Loader
├── client/         # Browser: Features (8 Module inkl. Bifröst + loadMore)
├── layouts/        # Astro Base Layout (CSS Bundling)
├── pages/          # Routes + API (Pagination in index.astro)
└── env.d.ts        # Astro TypeScript Referenzen
```

## 🔗 Modul-Abhängigkeiten

```
pages/ → layouts/ → server/ → core/
                 ↘        ↘
                  client/ → morphs/ → core/
                        ↘
                         observer/ (DYNAMIC!)
```

## 📦 Module

### core/ (4 Dateien)
- `types.ts` - RenderContext, MorphType (28), ItemData, CompareValue
- `detection.ts` - Struktur-basierte Typ-Erkennung (~472 Zeilen)
- `security.ts` - Input Validation, XSS Schutz (~309 Zeilen)
- `index.ts` - Re-Exports

### morphs/ (31 Dateien)
- `base.ts` - createUnifiedMorph() Factory + wrapInField() (~261 Zeilen)
- `primitives/` - 28 Morph-Typen
- `primitives/image.ts` - **WebP Support** mit `<picture>` Element
- `debug.ts` - morphDebug System für DevTools
- `index.ts` - Registry, renderValue(), renderCompare() (~256 Zeilen)

### observer/ (6 Dateien) - **DYNAMIC IMPORT**
- `index.ts` - setupObservers(), getObserverStats() (~160 Zeilen)
- `debug.ts` - Kategorisiertes Logging
- `interaction.ts` - Click, Hover, Input Tracking
- `rendering.ts` - Mount/Unmount Events
- `session.ts` - Page Views, Session Tracking
- `target.ts` - Console/HTTP/WebSocket Backends
- **⚡ Wird nur bei `?observe=true` oder localStorage geladen!**

### client/features/ (8 Dateien)
- `app.ts` - Haupt-Initialisierung + **loadMoreItems()** (~420 Zeilen)
- `search.ts` - Suchmaschinen-UX mit Perspektiven (~508 Zeilen)
- `grid.ts` - Grid-Layout und Feld-Selection
- `compare.ts` - Compare-Panel + Diff-Updates (~670 Zeilen)
- `selection.ts` - Feld/Item State Management (~317 Zeilen)
- `bifrost.ts` - Bifröst Attribution System (Copyright + Experten)
- `debug.ts` - Client-Debug-Logging
- `index.ts` - Re-Exports (80+ Exports)

### server/ (3 Dateien)
- `config.ts` - YAML Config Loader (~200 Zeilen)
- `data.ts` - JSON Data Loader + Lazy Perspective Loading (~757 Zeilen)
- `index.ts` - Re-Exports

### layouts/ (1 Datei)
- `Base.astro` - **CSS Bundling** (all.min.css in Production)

### pages/ (4 Dateien)
- `index.astro` - Grid mit **Pagination** (limit: 12) + WebP Bilder (~520 Zeilen)
- `[slug].astro` - Detail-Seite mit Perspektiven (~699 Zeilen)
- `api/search.ts` - GET /api/search (mit WebP in HTML Output)
- `api/compare.ts` - POST /api/compare (Item & Feld Modus)

## 🔧 Build Info

- TypeScript 5.9+
- Astro 5.16 mit SSR (Node Adapter)
- Alle Module sind ESM (type: "module")
- Relative Imports mit .js Extension für Node-Kompatibilität
- 421 Tests mit Vitest
