# AMORPH v7 - Client Module

> Browser-seitige Features und Interaktionen.

## 📁 Struktur

```
client/
└── features/           # Alle Client-Features
    ├── index.ts        # Re-Exports (80+ Exports)
    ├── app.ts          # Haupt-Initialisierung (~264 Zeilen)
    ├── debug.ts        # Client Debug Logging
    ├── search.ts       # Suche + Auto-Perspektiven (~508 Zeilen)
    ├── grid.ts         # Grid-Interaktionen + Feld-Selektion
    ├── compare.ts      # Compare-Panel + Diff-Updates (~670 Zeilen)
    └── selection.ts    # Item + Field State (~317 Zeilen)
```

## 🔧 Features

### app.ts (264 Zeilen)
- Initialisiert alle Module beim DOM Ready
- Reihenfolge: Search → Grid → Compare → BottomNav → SelectionBar → LoadFromStorage
- Guard gegen doppelte Initialisierung (`isInitialized`)
- Restores from URL/sessionStorage

### search.ts (508 Zeilen)
- Suchmaschinen-UX mit Auto-Perspektiven (ab 3 Zeichen)
- Perspektiven-Pills unter Suchleiste
- Highlight-Navigation (Prev/Next)
- URL-State: `?q=pilz&p=culinary,safety`

### grid.ts
- Grid-Layout Management
- Feld-Selektion mit Perspektiven-Farben
- Base64-encoded Raw Values für Compare
- **KEIN Click-Navigation** - Cards leiten nicht zur Spezies-URL

### compare.ts (670 Zeilen)
- Compare-Panel Visibility (show/hide/toggle)
- **Diff-Based Updates**: `updateFieldsDiff()` für Animation
- **Search-in-Compare**: Durchsucht Compare-Content
- **Copy-Button**: Exportiert Daten mit License-Hinweis
- **Species-Highlight System** (Hover/Click)
- CSS-Klassen: `.is-adding`, `.is-removing`

### selection.ts (317 Zeilen)
- Item + Field Selection State
- **sessionStorage Persistenz**
- **Perspektiven-Farben** für Felder
- Max 8 Items für Compare

## 🐛 Debug-Logging

```javascript
// Deaktivieren:
localStorage.setItem('amorph:debug', 'false')
localStorage.setItem('amorph:observers', 'false')

// Console:
window.amorphDebug.disable()
window.morphDebug.enable()  // Morph-Debug
```

## 📤 Exports (index.ts)

```typescript
// App
export { initApp } from './app';

// Search
export { initSearch, performSearch, getActivePerspectives } from './search';

// Grid
export { initGrid, updateSelectionUI } from './grid';

// Compare
export { 
  initCompare, showCompare, hideCompare, toggleCompare,
  isCompareOpen, searchInCompare, navigateCompareHighlight,
  clearCompareHighlights, getCompareHighlightInfo,
  updateFieldsDiff  // Diff-based field updates
} from './compare';

// Selection
export {
  selectItem, deselectItem, toggleItem, clearSelection,
  isSelected, getSelectedItems, getSelectedCount, canCompare,
  subscribe, loadFromStorage,
  selectField, deselectField, isFieldSelected, getFieldColor,
  getSelectedFields, getSelectedFieldsGrouped, getSelectedFieldCount,
  canCompareFields
} from './selection';
```

## 🚀 Init-Reihenfolge

**Double-Init Guard**: Alle Initialisierungen haben Guards (`isInitialized`, `isSearchInitialized`).

1. `loadFromStorage()` - Persistierte Selection laden
2. `initSearch()` - Such-Input + Perspektiven-Buttons + Active Pills
3. `initGrid()` - Grid Click-Handler + Feld-Selektion
4. `initCompare()` - Compare-Panel
5. `initSelectionBar()` - Auswahl-Leiste
6. `restoreFromURL()` - URL-Parameter wiederherstellen
7. `initObservers()` - Observer System (standardmäßig aktiv)

## 📦 debug.ts - Client Debug

Leichtgewichtiges Logging mit Kategorien:

```typescript
import { debug } from './debug';

debug.amorph('App started');
debug.selection('Item selected', { slug });
debug.selection('Field selected', { itemSlug, fieldName });
debug.compare('Comparing', { mode: 'fields', count: 5 });
debug.api('API call', { url, response });
debug.layout('Grid click', { target });

// Deaktivierung:
debug.disable();  // localStorage.setItem('amorph:debug', 'false')
debug.isEnabled();
```

### Kategorien

| Kategorie | Emoji | Farbe | Beschreibung |
|-----------|-------|-------|--------------|
| `amorph` | 🍄 | #0df | Haupt-Events |
| `selection` | ✓ | #0f0 | Item + Feld Auswahl |
| `compare` | 🔬 | #f0d | Vergleich |
| `api` | 🌐 | #fd0 | API Calls |
| `router` | 🔗 | #0fd | Navigation |
| `touch` | 📱 | #d0f | Touch Events |
| `layout` | 📐 | #fa0 | Grid/Layout |
| `morph` | 🔮 | #af0 | Morphs |

## 📦 search.ts - Suche (508 Zeilen)

### Features
- Auto-Perspektiven ab 3 Zeichen (z.B. "chemie" → "chemistry")
- Perspektiven-Pills unter Suchleiste
- Highlight-Navigation (Prev/Next)
- URL-State: `?q=pilz&p=culinary,safety`

### API
```typescript
performSearch('steinpilz');           // Suche ausführen
togglePerspective('culinary');        // Perspektive togglen
getActivePerspectives();              // ['culinary', 'safety']
restoreFromURL();                     // URL-State wiederherstellen
```

### Perspektiven-Auto-Match (NEU)

Wenn der Suchbegriff eine Perspektive matcht, wird diese automatisch aktiviert:

```
Suche: "chemie" → Perspektive "chemistry" wird aktiviert
```

### API

```typescript
import { 
  performSearch,
  togglePerspective,
  getActivePerspectives,
  restoreFromURL 
} from './search';

// Suche ausführen (debounced)
performSearch('steinpilz');

// Perspektive ein/ausschalten
togglePerspective('culinary');

// Aktive Perspektiven
const active = getActivePerspectives();  // ['culinary', 'safety']

// URL-State wiederherstellen
restoreFromURL();  // Liest ?q= und ?p=
```

### URL-State

```
?q=pilz&p=culinary,safety
```

- `q` - Suchbegriff
- `p` - Komma-separierte Perspektiven-IDs

## 📦 grid.ts - Grid

### Features
- **Kein Klick-Navigation** - Card-Klicks leiten NICHT zur Spezies-URL
- Click auf `.item-select-all` → Alle Felder des Items auswählen
- Click auf `.field-select` (+/✓) → Einzelnes Feld auswählen
- Keyboard: Enter/Space zum Auswählen
- Visual Feedback für selected State

### API
```typescript
initGrid(container);      // Grid initialisieren
updateSelectionUI();      // .is-selected Klassen aktualisieren
```

## 📦 compare.ts - Compare Panel (670 Zeilen)

### Features
- **Diff-Based Updates**: Animierte Feld-Änderungen
- **Search-in-Compare**: Durchsucht Compare-Content
- **Copy-Button**: Exportiert mit License-Hinweis
- **Species-Highlight**: Hover/Click auf Spezies-Namen

### API
```typescript
showCompare();            // Panel öffnen + API Call
hideCompare();            // Panel schließen
toggleCompare();          // Toggle
isCompareOpen();          // Status prüfen
updateFieldsDiff(items, perspectives, container);  // Diff-Update
searchInCompare(query);   // Content durchsuchen
navigateCompareHighlight(direction);  // Prev/Next
```

### Compare API Call (Zwei Modi)
```typescript
// Item-Modus
POST /api/compare { items: ["steinpilz", "fliegenpilz"], perspectives: ["culinary"] }

// Feld-Modus  
POST /api/compare { fields: [{itemSlug, fieldName, value}], perspectives: ["culinary"] }
```

## 📦 selection.ts - Selection State (317 Zeilen)

Client-seitiger State für **Items UND Felder** mit sessionStorage Persistenz.

### Item-Auswahl API
```typescript
selectItem({ slug, name, id });      // Item auswählen
deselectItem('steinpilz');            // Abwählen
toggleItem(itemData);                 // Toggle
clearSelection();                     // Alle entfernen
isSelected('steinpilz');              // Prüfen
getSelectedItems();                   // Alle ausgewählten
getSelectedCount();                   // Anzahl
canCompare();                         // 2-8 Items?
```

### Feld-Auswahl API
```typescript
selectField({ itemSlug, itemName, fieldName, value });
deselectField('steinpilz', 'Essbarkeit');
isFieldSelected('steinpilz', 'Essbarkeit');
getFieldColor('steinpilz', 'Essbarkeit');  // Perspektiven-Farbe
getSelectedFields();                  // SelectedField[]
getSelectedFieldsGrouped();           // { "Essbarkeit": [field1, field2] }
getSelectedFieldCount();              // Anzahl
canCompareFields();                   // mind. 2 Felder?
```

### State-Subscription
```typescript
const unsubscribe = subscribe((event) => {
  event.items;          // SelectedItem[]
  event.count;          // Item count
  event.canCompare;     // Item compare?
  event.fields;         // SelectedField[]
  event.fieldCount;     // Field count
  event.canCompareFields;  // Field compare?
});
```

### Persistence
```typescript
loadFromStorage();  // Beim App-Start automatisch
// Automatisch gespeichert bei jeder Änderung in sessionStorage
```

## 🌐 Window API

```javascript
window.amorphDebug          // Debug Logging (standardmäßig AN)
window.amorphDebug.disable()
window.amorphDebug.enable()
window.amorphDebug.isEnabled()
```
