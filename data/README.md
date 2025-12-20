# Testdaten Übersicht

Modulare Testdaten-Struktur für AMORPH.

## Aktuelle Struktur

```
data/
├── animalia/
│   ├── index.json
│   └── alpine-marmot/          # 11 JSON-Dateien
│       ├── index.json
│       ├── chemistry.json
│       ├── conservation.json
│       ├── culinary.json
│       ├── ecology.json
│       ├── geography.json
│       ├── identification.json
│       ├── interactions.json
│       ├── medicine.json
│       ├── safety.json
│       └── statistics.json
│
├── plantae/
│   ├── index.json
│   └── deadly-nightshade/      # 8 JSON-Dateien
│       ├── index.json
│       ├── chemistry.json
│       ├── culinary.json
│       ├── culture.json
│       ├── ecology.json
│       ├── identification.json
│       ├── medicine.json
│       └── safety.json
│
├── fungi/
│   └── index.json              # (leer)
│
└── bacteria/
    └── index.json              # (leer)
```

## Aktive Spezies

| Kingdom   | Spezies               | Wissenschaftlich      | Dateien |
|-----------|----------------------|----------------------|---------|
| Animalia  | Alpine Marmot        | Marmota marmota      | 11      |
| Plantae   | Deadly Nightshade    | Atropa belladonna    | 8       |

## Datei-Format

### index.json (Spezies)
```json
{
  "id": "alpine-marmot",
  "slug": "alpine-marmot",
  "name": "Alpine Marmot",
  "scientific_name": "Marmota marmota",
  "image": "https://...",
  "perspectives": ["identification", "ecology", ...]
}
```

### Perspektive-JSON
```json
{
  "feldname": { "type": "morph-typ", "data": ... },
  ...
}
```

## Verwendete Morphs

Die Perspektiven nutzen verschiedene Morph-Typen je nach Datenstruktur:
- `text`, `number`, `boolean` - Einzelwerte
- `list`, `object` - Strukturierte Daten
- `bar`, `pie`, `radar` - Charts
- `range`, `stats` - Statistiken
- `badge`, `tag`, `rating` - Bewertungen

## Konfiguration

In `config/daten.yaml`:
```yaml
quelle:
  typ: json-universe-optimized
  pfad: ./data
```

## Neue Spezies hinzufügen

1. Ordner erstellen: `data/{kingdom}/{species-slug}/`
2. index.json mit Basis-Infos erstellen
3. Perspektiven-JSONs nach Blueprints erstellen
4. `npm run validate` ausführen
5. `npm run build:index` ausführen

## Siehe auch

- [CLAUDE.md](CLAUDE.md) - Daten-System Dokumentation
- [/docs/DATEN_ERSTELLEN.md](/docs/DATEN_ERSTELLEN.md) - Manuelle Erstellung
- [/scripts/CLAUDE.md](/scripts/CLAUDE.md) - Validierung & Build
