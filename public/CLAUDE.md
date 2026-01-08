# Public Assets (v8.0)

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
│   └── (UI Assets - Species-Bilder in data-local/)
│
└── test-bar.html       # Test-Seite
```

---

## 📷 Bilder

### Species-Bilder (v8.0)
Bilder liegen in den lokalen Daten-Ordnern:
```
data-local/fungi/hericium-erinaceus/images/
data-local/plantae/aloe-vera/images/
```

### UI-Assets
Statische UI-Bilder in `public/images/`

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
