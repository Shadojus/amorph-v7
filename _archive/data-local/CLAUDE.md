# Data-Local

## ⚠️ VERALTET - NICHT VERWENDEN!

Dieser Ordner ist ein **Legacy-Artefakt** aus der Zeit, als Species-Daten noch lokal gespeichert wurden.

## Status: ❌ Wird entfernt

### Was war hier?
- `universe-index.json` - Ehemaliger Species-Index
- `bifroest-experts.json` - Experten-Daten (jetzt in PocketBase `experts` Collection)
- `fungi/`, `plantae/`, etc. - Species-Unterordner

### Wo sind die Daten jetzt?

```
PocketBase (http://127.0.0.1:8090)
├── {domain}_entities   → 17 Entity-Collections (fungi_entities, phyto_entities, etc.)
├── {domain}_*          → Perspektiv-Collections pro Domain
└── experts             → 68 Experten mit field_expertise[] Arrays
```

### Experten-Schema (NEU)
```json
{
  "name": "Paul Stamets",
  "domain": "fungi",
  "field_expertise": ["habitat", "edibility", "genus", "family"],
  "impact_score": 95,
  "verified": true
}
```

## Migration

Die Daten wurden nach PocketBase migriert:

```bash
# Schema erstellen
npm run schema

# Daten seeden (falls nötig)
npm run start:seed
```

## Nicht verwenden für

- ❌ Species-Daten
- ❌ Perspektiv-Daten
- ❌ Experten-Daten
- ❌ Bilder (PocketBase `file` fields verwenden!)
- ❌ Neue Einträge

## Einzige Datenquelle

```bash
# Richtig:
PocketBase Admin: http://127.0.0.1:8090/_/

# Falsch:
# Lokale JSON-Dateien bearbeiten
```

---

**Dieser Ordner wird in einer zukünftigen Version entfernt.**

*Letzte Aktualisierung: Januar 2026*
