# AMORPH v7 - Layouts

> Astro Layout-Komponenten.

## 📁 Struktur

```
layouts/
└── Base.astro    # Haupt-Layout
```

## 📦 Base.astro

Modulares HTML-Grundgerüst für alle Seiten.

### Props
```typescript
interface Props {
  title?: string;       // Default: 'AMORPH'
  description?: string;
}
```

### Struktur
```astro
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  
  <!-- CSS (Cache-Busting) -->
  <link rel="stylesheet" href="/styles/base.css?v=3">
  <link rel="stylesheet" href="/styles/components.css?v=3">
  <link rel="stylesheet" href="/styles/morphs.css?v=3">
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
- **Cache Busting** - `?v=3` bei CSS
- **Client Init** - Automatische App-Initialisierung

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
  title="Steinpilz – AMORPH" 
  description="Boletus edulis - Der König der Speisepilze"
>
  ...
</Base>
```

## 🔄 CSS Updates

Bei CSS-Änderungen den Version-Parameter erhöhen:

```html
<!-- Von -->
<link rel="stylesheet" href="/styles/base.css?v=3">

<!-- Zu -->
<link rel="stylesheet" href="/styles/base.css?v=4">
```

Dies zwingt Browser zum Neuladen der Styles.
