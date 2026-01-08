# Config-Local

Site-spezifische Konfiguration für AMORPH.

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `manifest.yaml` | App-Name, Version, Site-Info |
| `daten.yaml` | Datenquelle (immer `pocketbase`!) |
| `features.yaml` | Feature-Flags |
| `morphs.yaml` | Morph-Zuordnung |
| `observer.yaml` | Debug-Config |

---

## daten.yaml

```yaml
# v8.1: PostgreSQL ist die Datenquelle!
# Die daten.yaml ist legacy - Datenquelle wird via ENV gesteuert:
# DATA_SOURCE=database → PostgreSQL/Prisma
# DATA_SOURCE=local → JSON-Fallback
```

---

## Schema

```
schema/
├── basis.yaml       # Basis-Definitionen
├── index.yaml       # Schema-Index
├── semantik.yaml    # Semantische Typen
└── perspektiven/
    └── index.yaml   # Perspektiv-Zuordnung
```

---

## ⚠️ Hinweis: Blueprints

Blueprint-Dateien sind **nicht** hier, sondern in:

```
shared/blueprints/amorph-{domain}/
```

Siehe [../../shared/blueprints/](../../shared/blueprints/)

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | AMORPH Root |
| [../../CLAUDE.md](../../CLAUDE.md) | Monorepo Root |
| [../../bifroest-platform/CLAUDE.md](../../bifroest-platform/CLAUDE.md) | Schema-Manager |

---

*Letzte Aktualisierung: Januar 2026*
