# Public Assets

Statische Dateien für das Frontend.

---

## Struktur

```
public/
├── styles/
│   ├── all.min.css     # ⭐ Production CSS Bundle (154KB)
│   ├── base.css        # Basis-Styles
│   └── morphs/         # Morph-spezifische Styles
│       ├── badge.css
│       ├── gauge.css
│       ├── bifroest.css  # Attribution System
│       └── ...
│
├── images/
│   └── (UI Assets nur - KEINE Species-Bilder!)
│
└── test-bar.html       # Test-Seite
```

---

## ⚠️ Wichtig: Bilder in PocketBase!

Entity-Bilder werden **nicht** lokal gespeichert!

```
✅ PocketBase File API:
   http://127.0.0.1:8090/api/files/{domain}_entities/{id}/{filename}

❌ Nicht verwenden:
   public/images/entities/
```

---

## CSS Bundling

Production Build erstellt `all.min.css`:

```bash
npm run build
```

Enthält alle Styles in einer Datei.

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | AMORPH Root |
| [../src/layouts/CLAUDE.md](../src/layouts/CLAUDE.md) | Layout-Komponenten |

---

*Letzte Aktualisierung: Januar 2026*
