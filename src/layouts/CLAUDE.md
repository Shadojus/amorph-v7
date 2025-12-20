# AMORPH v7 - Layouts

> Astro Layout-Komponenten.

## 📁 Struktur

```
layouts/
└── Base.astro    # Haupt-Layout (~50 Zeilen)
```

## 📦 Base.astro

Modulares HTML-Grundgerüst für alle Seiten.

### Props

```typescript
interface Props {
  title?: string;       // Default: 'AMORPH'
  description?: string; // Default: 'Formlos. Zustandslos. Transformierend.'
}
```

### Struktur

```astro
---
const { title = 'AMORPH', description = '...' } = Astro.props;
---
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content={description}>
  <title>{title}</title>
  
  <!-- CSS -->
  <link rel="stylesheet" href="/styles/base.css?v=3">
  <link rel="stylesheet" href="/styles/components.css?v=3">
  <link rel="stylesheet" href="/styles/morphs.css?v=3">
</head>
<body>
  <slot />
  
  <!-- Client Scripts -->
  <script>
    import { initApp } from '../client/features';
    initApp();
  </script>
</body>
</html>
```

### Features

- **~50 Zeilen** statt 3600 (v6 Monolith)
- **Slot-basiert** - Inhalt wird von Pages eingefügt
- **Cache Busting** - `?v=3` bei CSS für Updates
- **Client Init** - Automatische App-Initialisierung

## 💡 Usage

```astro
---
// In pages/index.astro
import Base from '../layouts/Base.astro';
---

<Base title="AMORPH – Übersicht">
  <header class="amorph-header">...</header>
  <main class="amorph-main">...</main>
</Base>
```

### Mit Custom Meta

```astro
<Base 
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
