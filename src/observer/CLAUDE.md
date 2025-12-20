# AMORPH v7 - Observer Module

> Debug & Analytics System mit kategorisiertem Logging.

## 📁 Struktur

```
observer/
├── debug.ts        # DebugObserver Klasse mit History
├── interaction.ts  # InteractionObserver (Clicks, Hover, Input)
├── rendering.ts    # RenderingObserver (Mount, Unmount, DOM)
├── session.ts      # SessionObserver (Page Views, Zeit)
├── target.ts       # Output Backends (Console, HTTP, WebSocket)
└── index.ts        # setupObservers(), getObserverStats()
```

## 🔧 Aktivierung

Das Observer-System ist **standardmäßig AKTIVIERT** für einfaches Debugging.

### Deaktivieren

```javascript
// Per localStorage
localStorage.setItem('amorph:observers', 'false');
location.reload();

// Per Console
window.amorphDebug.disable();
```

### Per URL Parameter (überschreibt localStorage)
```
http://localhost:4323/?observe=false    // Deaktivieren
http://localhost:4323/?observe=true     // Aktivieren
```

### Verbose Mode
```javascript
window.amorphDebug.setVerbose(true);  // Alle Kategorien
```

## 📦 debug.ts - DebugObserver

Zentrales Logging mit farbigen Kategorien und History:

### Kategorien

| Kategorie | Farbe | Beschreibung |
|-----------|-------|--------------|
| **System** | | |
| `amorph` | #f472b6 | Haupt-Events |
| `config` | #34d399 | Config Laden |
| `data` | #60a5fa | Daten Laden |
| `security` | #ef4444 | Security Warnungen |
| **Features** | | |
| `search` | #38bdf8 | Suche |
| `grid` | #84cc16 | Grid Events |
| `compare` | #14b8a6 | Vergleich |
| **Morphs** | | |
| `morphs` | #fb7185 | Morph Rendering |
| `detection` | #e879f9 | Typ-Erkennung |
| `render` | #fbbf24 | DOM Rendering |
| **Observer** | | |
| `click` | #fb923c | Klick Events |
| `hover` | #fdba74 | Hover Events |
| `scroll` | #d4d4d4 | Scroll Events |
| `session` | #22d3ee | Session Events |

### API

```typescript
import { debug } from './observer';

// Logging
debug.amorph('App initialized');
debug.search('Query', { q: 'pilz', results: 42 });
debug.error('Something failed', errorData);

// Controls
debug.enable();
debug.disable();
debug.setVerbose(true);     // Zeigt auch gemutete Kategorien
debug.setFilter(['search', 'compare']);  // Nur bestimmte
debug.mute('scroll');       // Kategorie stummschalten
debug.unmute('scroll');

// History
debug.getStats();           // { total, byCategory, runtime }
debug.getTimeline(20);      // Letzte 20 Einträge
debug.getByCategory('error', 50);
debug.clear();
```

## 📦 interaction.ts - InteractionObserver

Trackt User-Interaktionen:

```typescript
const observer = new InteractionObserver(container, target);
observer.start();

// Tracked Events:
// - click: Element, Position, Morph, Feature
// - hover: (verzögert, nur bei Morphs)
// - input: Search Input Changes
// - scroll: (throttled)
```

## 📦 rendering.ts - RenderingObserver

Trackt DOM-Events:

```typescript
const observer = new RenderingObserver(container, target);
observer.start();

// Tracked Events:
// - amorph:mounted: Morph wurde gerendert
// - amorph:unmounted: Morph wurde entfernt
// - amorph:rendered: Render-Zyklus abgeschlossen
// - DOM Mutations via MutationObserver
```

## 📦 session.ts - SessionObserver

Trackt Session-Daten:

```typescript
const observer = new SessionObserver(target);
observer.start(sessionId);

// Tracked Events:
// - Page Views
// - Verweildauer
// - Tab-Wechsel (visibilitychange)
// - Page Leave (beforeunload)
```

## 📦 target.ts - Output Backends

Drei Backends für Observer-Daten:

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

Nach Aktivierung verfügbar:

```javascript
// Debug Logging
window.amorphDebug.enable()
window.amorphDebug.getStats()
window.amorphDebug.getTimeline(20)

// Observer Stats
window.amorphObservers           // { interaction, rendering, session }
window.amorphObserverStats()     // Statistiken
window.getAmorphStats()          // Alias
window.stopObservers()           // Alle stoppen
```

## 🧪 Tests

`tests/observer.test.ts` - 8 Tests:
- History Logging
- Category Filtering
- Muting
- Stats Tracking
- Timeline
- Enable/Disable

## 💡 Best Practices

1. **Prod**: Observer deaktiviert lassen für Performance
2. **Dev**: `?observe` zum schnellen Aktivieren
3. **Debug**: `setVerbose(true)` für alle Details
4. **Filter**: `setFilter(['error', 'search'])` für spezifische Diagnose
