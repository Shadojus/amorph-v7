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
# IMMER pocketbase - keine lokalen Dateien mehr!
source: pocketbase
url: http://127.0.0.1:8090
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
| [../../bifroest-platform/claude.md](../../bifroest-platform/claude.md) | Schema-Manager |

---

*Letzte Aktualisierung: Januar 2026*
