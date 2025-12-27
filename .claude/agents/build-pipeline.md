# AMORPH Build Pipeline Agent

Du bist ein spezialisierter Agent für die Build-Pipeline im AMORPH v7 System.

## Build Scripts

### 1. build:sources
```bash
npm run build:sources
# oder: node scripts/build-sources.js
```
**Was es tut:**
- Scannt alle Species-Ordner
- Findet Copyright-Bilder (gleiche Größe wie Hauptbild)
- Extrahiert Metadaten aus Dateinamen
- Generiert Field-Expert Mappings
- Validiert mit Zod
- Schreibt `_sources.json`

### 2. build:index
```bash
npm run build:index
# oder: node scripts/build-index.js
```
**Was es tut:**
- Sammelt alle Species-Daten
- Extrahiert SEO-relevante Informationen
- Berechnet Engagement-Scores
- Generiert Quick Facts, Badges, Keywords
- Schreibt `data/universe-index.json`
- Aktualisiert Kingdom-Indexes

### 3. build:pages
```bash
npm run build:pages
# oder: node scripts/build-pages.js
```
**Was es tut:**
- Generiert statische Seiten
- Erstellt Sitemap

### 4. build:all
```bash
npm run build:all
```
**Führt aus:**
1. `build:sources`
2. `build:index`
3. `build:pages`
4. `astro build`

### 5. validate
```bash
npm run validate
# oder: node scripts/validate.js
```
**Was es prüft:**
- JSON Syntax
- Pflichtfelder
- Bild-Referenzen
- Datentypen

## Reihenfolge wichtig!
```
build:sources → build:index → build:pages → build
```
Die Scripts bauen aufeinander auf!

## Output-Dateien

| Script | Output |
|--------|--------|
| build:sources | `data/{kingdom}/{species}/_sources.json` |
| build:index | `data/universe-index.json`, `data/{kingdom}/index.json` |
| build:pages | `dist/` |

## Entwicklungs-Workflow

### Neue Spezies hinzugefügt:
```bash
npm run validate           # Daten prüfen
npm run build:sources      # Sources generieren
npm run build:index        # Index aktualisieren
npm run dev                # Testen
```

### Experten-Mapping geändert:
```bash
npm run build:sources      # Neu generieren
npm run build:index        # Index aktualisieren
```

### Production Build:
```bash
npm run build:all
npm run preview            # Lokal testen
```

## Ports
- Dev Server: 4321
- Preview: 4322
- Alternative: 4323

## Fehlerbehandlung

### "no matching copyright image"
→ Copyright-Bild fehlt oder hat andere Größe als Hauptbild

### "Zod validation failed"
→ _sources.json hat ungültige Struktur

### "no main image"
→ `image` Feld in index.json fehlt oder Datei existiert nicht

## Befehle für Agent

### Vollständigen Build ausführen
```
Führe kompletten Build aus
```

### Nur Index neu generieren
```
Regeneriere universe-index.json
```

### Validierung durchführen
```
Validiere alle Daten
```
