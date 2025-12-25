# AMORPH v7 - Observer Module

> Debug & Analytics System mit kategorisiertem Logging.

## 📁 Struktur

```
observer/
├── index.ts        # setupObservers(), stopObservers() (~160 Zeilen)
├── debug.ts        # DebugObserver mit History
├── interaction.ts  # Clicks, Hover, Input
├── rendering.ts    # Mount, Unmount, DOM
├── session.ts      # Page Views, Zeit
└── target.ts       # Console, HTTP, WebSocket Backends
```

## 🔧 Aktivierung

**Standardmäßig AKTIVIERT** für Debugging.

### Deaktivieren
```javascript
localStorage.setItem('amorph:observers', 'false');
// oder
window.amorphDebug.disable();
```

### Per URL Parameter
```
?observe=false    // Deaktivieren
?observe=true     // Aktivieren
```

## 📦 debug.ts - Kategorien

| Kategorie | Farbe | Beschreibung |
|-----------|-------|--------------|
| `amorph` | #f472b6 | Haupt-Events |
| `config` | #34d399 | Config Laden |
| `data` | #60a5fa | Daten Laden |
| `security` | #ef4444 | Security |
| `search` | #38bdf8 | Suche |
| `grid` | #84cc16 | Grid Events |
| `compare` | #14b8a6 | Vergleich |
| `morphs` | #fb7185 | Morph Rendering |
| `detection` | #e879f9 | Typ-Erkennung |
| `render` | #fbbf24 | DOM Rendering |

### API
```typescript
import { debug } from './observer';

debug.amorph('App initialized');
debug.search('Query', { q: 'pilz', results: 42 });
debug.error('Something failed', errorData);

debug.enable();
debug.disable();
debug.setVerbose(true);
debug.mute('scroll');
debug.getStats();
debug.getTimeline(20);
```

## 🌐 window.amorphDebug

Global verfügbar für DevTools:
```javascript
amorphDebug.enable()
amorphDebug.disable()
amorphDebug.setVerbose(true)
amorphDebug.getStats()
amorphDebug.getTimeline(50)
```

## 📦 interaction.ts - InteractionObserver

Trackt User-Interaktionen:
- `click`: Element, Position, Morph, Feature
- `hover`: (verzögert, nur bei Morphs)
- `input`: Search Input Changes
- `scroll`: (throttled)

## 📦 rendering.ts - RenderingObserver

Trackt DOM-Events:
- `amorph:mounted`: Morph wurde gerendert
- `amorph:unmounted`: Morph wurde entfernt
- `amorph:rendered`: Render-Zyklus abgeschlossen
- DOM Mutations via MutationObserver

## 📦 session.ts - SessionObserver

Trackt Session-Daten:
- Page Views
- Verweildauer
- Tab-Wechsel (visibilitychange)
- Page Leave (beforeunload)

## 📦 target.ts - Output Backends

```typescript
import { createTarget } from './target';

// Console (via debug.ts)
const consoleTarget = createTarget({ type: 'console' });

// HTTP POST
const httpTarget = createTarget({ 
  type: 'http', 
  url: '/api/analytics',
  batch: true 
});

// WebSocket
const wsTarget = createTarget({ 
  type: 'websocket', 
  url: 'wss://analytics.example.com' 
});
```

## 📦 index.ts - Setup

```typescript
import { setupObservers, stopObservers, getObserverStats } from './observer';

// Aktivieren
const observers = setupObservers(document.body, {
  interaction: { enabled: true },
  rendering: { enabled: true },
  session: { enabled: true }
}, sessionId);

// Stats abrufen
const stats = getObserverStats();

// Deaktivieren
stopObservers(observers);
```

## 🌐 Window API

```javascript
window.amorphDebug.enable()
window.amorphDebug.getStats()
window.amorphDebug.getTimeline(20)

window.amorphObservers           // { interaction, rendering, session }
window.amorphObserverStats()     // Statistiken
window.getAmorphStats()          // Alias
window.stopObservers()           // Alle stoppen
```

## 🧪 Tests

`tests/observer.test.ts` - Tests für:
- History Logging
- Category Filtering
- Muting
- Stats Tracking
- Timeline
- Enable/Disable
