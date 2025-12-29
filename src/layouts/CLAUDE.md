# AMORPH v7 - Layouts

> Astro Layout-Komponenten mit Performance-Optimierungen.

## 🚀 Performance-Optimierungen (Dezember 2025)
- **CSS Bundling** - `all.min.css` in Production (154KB, 1 Request)
- **DNS Prefetch** - Für externe Ressourcen
- **Conditional Loading** - Dev: Einzeldateien, Prod: Bundle

## 📁 Struktur

```
layouts/
└── Base.astro    # Haupt-Layout (~80 Zeilen)
```

## 📦 Base.astro

Modulares HTML-Grundgerüst für alle Seiten.

### Props
```typescript
interface Props {
  title?: string;       // Default: Site Name
  description?: string;
}
```

### Struktur
```astro
<!DOCTYPE html>
<html lang="de" data-site={siteType}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  
  <!-- PERFORMANCE: DNS Prefetch -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  
  {isProd ? (
    <!-- Production: ALL-IN-ONE CSS Bundle -->
    <link rel="preload" href="/styles/all.min.css" as="style" />
    <link rel="stylesheet" href="/styles/all.min.css" />
  ) : (
    <!-- Development: Einzeldateien für Debugging -->
    <link rel="stylesheet" href="/styles/base.css">
    <link rel="stylesheet" href="/styles/components.css">
    <link rel="stylesheet" href="/styles/morphs.css">
  )}
</head>
<body>
  <slot />
  
  <script>
    import { initApp } from '../client/features';
    initApp();
  </script>
</body>
</html>
```

### Features
- **Slot-basiert** - Inhalt von Pages
- **Conditional CSS** - Bundle in Prod, Einzeln in Dev
- **Preload** - Critical CSS vorladen
- **Client Init** - Automatische App-Initialisierung
- **SEO Meta Tags** - Open Graph Support

## 💡 Usage

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="AMORPH – Übersicht">
  <header class="amorph-header">...</header>
  <main class="amorph-main">...</main>
</Base>
```

## 🔄 CSS Build

CSS wird automatisch beim Build gebündelt:

```bash
npm run build        # Inkludiert build:css
npm run build:css    # Nur CSS bundeln
```

Output: `public/styles/all.min.css` (154KB)
