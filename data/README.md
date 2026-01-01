# Test Data Overview

Modular test data structure for AMORPH.

## Current Structure

```
data/
├── animalia/
│   ├── index.json
│   └── alpine-marmot/          # 11 JSON files
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
│   └── deadly-nightshade/      # 8 JSON files
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
│   └── index.json              # (empty)
│
└── bacteria/
    └── index.json              # (empty)
```

## Active Species

| Kingdom   | Species               | Scientific Name       | Files   |
|-----------|----------------------|----------------------|---------|
| Animalia  | Alpine Marmot        | Marmota marmota      | 11      |
| Plantae   | Deadly Nightshade    | Atropa belladonna    | 8       |

## File Format

### index.json (Species)
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

### Perspective JSON
```json
{
  "fieldname": { "type": "morph-type", "data": ... },
  ...
}
```

## Used Morphs

The perspectives use various morph types depending on data structure:
- `text`, `number`, `boolean` - Single values
- `list`, `object` - Structured data
- `bar`, `pie`, `radar` - Charts
- `range`, `stats` - Statistics
- `badge`, `tag`, `rating` - Ratings

## Configuration

In `config/daten.yaml`:
```yaml
source:
  type: json-universe-optimized
  path: ./data
```

## Adding New Species

1. Create folder: `data/{kingdom}/{species-slug}/`
2. Create index.json with basic info
3. Create perspective JSONs following blueprints
4. Run `npm run validate`
5. Run `npm run build:index`

## See Also

- [CLAUDE.md](CLAUDE.md) - Data System Documentation
- [/docs/DATEN_ERSTELLEN.md](/docs/DATEN_ERSTELLEN.md) - Manual Creation
- [/scripts/CLAUDE.md](/scripts/CLAUDE.md) - Validation & Build
