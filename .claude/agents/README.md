# AMORPH v7 Claude Agents

Spezialisierte Agenten für die Verwaltung des AMORPH Mykologie-Systems.

## Verfügbare Agenten

### 📊 [Data Manager](data-manager.md)
Verwaltet Spezies-Daten, Perspektiven und die Datenstruktur.
```
@data-manager Erstelle neue Spezies: Löwenmähne (Hericium erinaceus) im Kingdom fungi
```

### 🌈 [Bifroest Manager](bifroest-manager.md)
Verwaltet das Quellen- und Experten-System. Field-Experts sind MANUELL pro Spezies!
```
@bifroest Trage Dr. Kawagishi für active_compounds bei hericium-erinaceus ein
```

### 🔬 [Species Expert Researcher](species-expert-researcher.md) ⭐ NEU
Recherchiert welche Experten **konkret über eine bestimmte Spezies** publiziert haben.
```
@species-researcher Recherchiere Experten für hericium-erinaceus
```

### 🔧 [Build Pipeline](build-pipeline.md)
Führt Build-Scripts aus und verwaltet die Pipeline.
```
@build Führe kompletten Build aus
```

### 🔬 [Research Agent](research-agent.md)
Allgemeine Recherche für neue Experten, Spezies-Daten und Bildquellen.
```
@research Recherchiere Experten für Psilocybin-Forschung
```

### 🎨 [Morph Developer](morph-developer.md)
Entwickelt und wartet Morph-Komponenten.
```
@morph Erstelle neuen Morph: taxonomy für hierarchische Daten
```

### ✅ [Validator](validator.md)
Validiert Daten und findet Fehler.
```
@validator Validiere alle Daten im Kingdom fungi
```

## ⚠️ WICHTIG: Experten-Zuordnung

### Das Prinzip
Experten werden **NICHT** generisch nach Feldtyp zugeordnet!
Sie werden **PRO SPEZIES** manuell eingetragen - nur wenn sie 
**nachweislich über diese konkrete Art publiziert haben**.

### Beispiel
```
❌ FALSCH: "Paul Stamets ist Pilzexperte → bei allen Pilzen eintragen"
✅ RICHTIG: "Stamets hat in 'Mycelium Running' über Hericium geschrieben → nur dort"
```

### Workflow für neue Experten
1. `@species-researcher` → Recherchiere wer publiziert hat
2. Publikationen verifizieren (PubMed, Google Scholar)
3. `@bifroest` → Manuell in _sources.json eintragen
4. URL zur Publikation angeben!

## Quick Reference

### Häufige Workflows

#### Neue Spezies hinzufügen
1. `@data-manager` → Basis-Daten erstellen
2. `@species-researcher` → Experten für DIESE Spezies recherchieren
3. `@bifroest` → Verifizierte Experten eintragen
4. `@validator` → Daten prüfen
5. `@build` → Index aktualisieren

#### Experten für bestehende Spezies finden
1. `@species-researcher` → "Wer hat über [spezies] publiziert?"
2. Publikationen prüfen
3. `@bifroest` → In _sources.json eintragen mit Quell-URL

### System-Übersicht
```
┌─────────────────────────────────────────────────────────────┐
│                        AMORPH v7                            │
├─────────────────────────────────────────────────────────────┤
│  data/                    │  src/                           │
│  ├── fungi/               │  ├── morphs/                    │
│  │   └── species/         │  │   └── primitives/            │
│  │       ├── index.json   │  ├── core/                      │
│  │       ├── *.json       │  ├── client/                    │
│  │       └── _sources.json│  └── server/                    │
│  └── universe-index.json  │                                 │
├─────────────────────────────────────────────────────────────┤
│  scripts/                 │  public/styles/                 │
│  ├── build-sources.js     │  └── morphs/                    │
│  ├── build-index.js       │      └── *.css                  │
│  └── validate.js          │                                 │
└─────────────────────────────────────────────────────────────┘
```

### NPM Scripts
```bash
npm run dev           # Entwicklungsserver
npm run build:sources # _sources.json generieren
npm run build:index   # universe-index.json generieren
npm run build:all     # Alles bauen
npm run validate      # Daten validieren
npm run test          # Tests ausführen
```

### Ports
- 4321: Development
- 4322: Preview
- 4323: Alternative

## Konventionen

### Feldnamen
- `snake_case` für alle Felder
- Keine Umlaute
- Englisch

### Slugs
- `kebab-case`
- Lowercase
- Wissenschaftlicher Name

### Dateien
- JSON mit 2 Spaces Indentation
- UTF-8 Encoding
- Newline am Ende

### Git
- Aussagekräftige Commits
- Feature-Branches
- PR für größere Änderungen
