# Layouts

Astro Layout-Komponenten.

---

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `Base.astro` | Haupt-Layout mit CSS Bundle |

---

## Base.astro

Enthält:
- HTML Head mit Meta-Tags
- CSS Bundle (`all.min.css`)
- Header mit Aurora Animation
- Footer Navigation
- Slot für Content

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html>
  <head>
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/all.min.css" />
  </head>
  <body>
    <header>...</header>
    <main>
      <slot />
    </main>
    <footer>...</footer>
  </body>
</html>
```

---

## CSS Loading

- **Production:** `all.min.css` (bundled)
- **Development:** Einzelne CSS-Dateien

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../../public/CLAUDE.md](../../public/CLAUDE.md) | Statische Assets |

---

*Letzte Aktualisierung: Januar 2026*
