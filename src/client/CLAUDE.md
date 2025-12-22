# AMORPH v7 - Client Module

> Browser-seitige Features und Interaktionen.

## 📁 Struktur

```
client/
├── features/           # Alle Client-Features
│   ├── index.ts        # Re-Exports
│   ├── app.ts          # Haupt-Initialisierung
│   ├── debug.ts        # Client Debug Logging (standardmäßig AN)
│   ├── search.ts       # Suche + Perspektiven (Max 4 FIFO, Auto-Match ab 4 Zeichen)
│   ├── grid.ts         # Grid-Interaktionen + Feld-Selektion
│   ├── compare.ts      # Compare-Panel (Item + Feld Modi)
│   └── selection.ts    # Item + Field Auswahl State
└── styles/             # (leer - CSS in public/)
```

## 🔍 Perspektiven-System

- Aktive Perspektiven erscheinen als **Text-Pills** im Suchfeld

### Perspektiven-Suche (ab 4 Zeichen)

Wenn der Suchbegriff **mindestens 4 Zeichen** hat:
- Suche nach **"chem"** → Perspektive "Chemistry" matcht
- Gematchte (aber nicht aktive) Perspektiven bekommen **Glow + Counter**
- Auto-Aktivierung respektiert das 4er-Limit

## 🐛 Debug-Logging (Standardmäßig AN)

Debug und Observer sind **standardmäßig aktiviert**. Deaktivieren:

```javascript
// In Browser Console:
localStorage.setItem('amorph:debug', 'false')      // Logs aus
localStorage.setItem('amorph:observers', 'false')  // Observer aus

// Oder via window.amorphDebug:
window.amorphDebug.disable()
```

## 📦 app.ts - Haupt-Init

Initialisiert alle Client-Features beim DOM Ready:

```typescript
import { initApp } from './client/features';

// Automatisch bei DOMContentLoaded
// Oder manuell:
initApp();
```

### Init-Reihenfolge

**Double-Init Guard**: Alle Initialisierungen haben Guards (`isInitialized`, `isSearchInitialized`), um mehrfache Event-Registrierung bei HMR/Navigation zu verhindern.

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

## 📦 search.ts - Suche

### initSearch(options)

```typescript
initSearch({
  input: document.querySelector('.amorph-search input'),
  grid: document.querySelector('.amorph-grid'),
  perspectiveButtons: document.querySelectorAll('.persp-btn'),
  activePerspectivesContainer: document.querySelector('.active-perspectives')
});
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

### initGrid(container)

```typescript
initGrid(document.querySelector('.amorph-grid'));
```

### Features

- **Kein Klick-Navigation mehr** - Card-Klicks leiten NICHT zur Spezies-URL
- Click auf `.item-select-all` → Alle Felder des Items auswählen
- Click auf `.field-select` (+/✓) → Einzelnes Feld auswählen
- Keyboard: Enter/Space zum Auswählen
- Visual Feedback für selected State

### Feld-Selektion (NEU)

Jedes Daten-Feld kann einzeln für den Compare-View ausgewählt werden:

```typescript
// Click auf + Button bei einem Feld
handleFieldSelect(button);  // Wählt einzelnes Feld aus

// Click auf "Alle" Button auf Item
handleItemSelectAll(button);  // Wählt alle Felder des Items
```

### updateSelectionUI()

Aktualisiert `.is-selected` Klasse auf allen Grid-Items und Feldern.

## 📦 compare.ts - Compare Panel

### initCompare(panel)

```typescript
initCompare(document.querySelector('.amorph-compare'));
```

### API

```typescript
import { 
  showCompare,
  hideCompare,
  toggleCompare,
  isCompareOpen 
} from './compare';

// Panel öffnen (lädt Daten via API)
await showCompare();

// Panel schließen
hideCompare();

// Toggle
toggleCompare();

// Status prüfen
if (isCompareOpen()) { ... }
```

### Compare API Call

Zwei Modi:

```typescript
// Item-Modus (alle Felder zweier Items vergleichen)
POST /api/compare
{
  "items": ["steinpilz", "fliegenpilz"],
  "perspectives": ["culinary"]
}

// Feld-Modus (spezifische Felder vergleichen)
POST /api/compare
{
  "fields": [
    { "itemSlug": "steinpilz", "fieldName": "Essbarkeit", "value": "Essbar" },
    { "itemSlug": "fliegenpilz", "fieldName": "Essbarkeit", "value": "Giftig" }
  ],
  "perspectives": ["culinary"]
}
```

## 📦 selection.ts - Selection State

Client-seitiger State für ausgewählte **Items UND Felder**.

### Item-Auswahl API

```typescript
import { 
  selectItem,
  deselectItem,
  toggleItem,
  clearSelection,
  isSelected,
  getSelectedItems,
  getSelectedCount,
  canCompare,
  subscribe,
  loadFromStorage 
} from './selection';

// Item auswählen
selectItem({ slug: 'steinpilz', name: 'Steinpilz', id: '1' });

// Abwählen
deselectItem('steinpilz');

// Toggle
toggleItem(itemData);

// Alle entfernen
clearSelection();

// Prüfen
if (isSelected('steinpilz')) { ... }

// Alle ausgewählten
const items = getSelectedItems();
const count = getSelectedCount();

// Vergleich möglich? (2-8 Items)
if (canCompare()) { showCompare(); }
```

### Feld-Auswahl API (NEU)

```typescript
import {
  selectField,
  deselectField,
  isFieldSelected,
  getSelectedFields,
  getSelectedFieldsGrouped,
  getSelectedFieldCount,
  canCompareFields
} from './selection';

// Feld auswählen
selectField({
  itemSlug: 'steinpilz',
  itemName: 'Steinpilz',
  fieldName: 'Essbarkeit',
  value: 'Essbar'
});

// Feld abwählen
deselectField('steinpilz', 'Essbarkeit');

// Prüfen
if (isFieldSelected('steinpilz', 'Essbarkeit')) { ... }

// Alle ausgewählten Felder
const fields = getSelectedFields();  // SelectedField[]

// Gruppiert nach Feldname
const grouped = getSelectedFieldsGrouped();
// { "Essbarkeit": [field1, field2], "Toxine": [field3] }

// Vergleich möglich? (mind. 2 Felder)
if (canCompareFields()) { showCompare(); }
```

### State-Subscription

```typescript
// State-Änderungen abonnieren (Item + Feld Änderungen)
const unsubscribe = subscribe((event) => {
  console.log(event.items);      // SelectedItem[]
  console.log(event.count);      // Item count
  console.log(event.canCompare); // Item compare?
  
  console.log(event.fields);     // SelectedField[]
  console.log(event.fieldCount); // Field count
  console.log(event.canCompareFields); // Field compare?
});
```

### Persistence

Selection wird in `sessionStorage` gespeichert:

```typescript
loadFromStorage();  // Beim App-Start
// Automatisch gespeichert bei jeder Änderung
```

## 🔗 Index Re-Exports

```typescript
// Alles auf einmal importieren
import { 
  debug,
  initApp,
  initSearch, performSearch, togglePerspective, getActivePerspectives,
  initGrid, updateSelectionUI,
  initCompare, showCompare, hideCompare, toggleCompare,
  // Item Selection
  selectItem, deselectItem, toggleItem, clearSelection,
  isSelected, getSelectedItems, getSelectedCount, canCompare,
  // Field Selection (NEU)
  selectField, deselectField, isFieldSelected,
  getSelectedFields, getSelectedFieldsGrouped,
  getSelectedFieldCount, canCompareFields,
  // Subscription
  subscribe, loadFromStorage
} from './client/features';
```

## 🌐 Window API

Nach Init verfügbar:

```javascript
window.amorphDebug          // Debug Logging (standardmäßig AN)
window.amorphDebug.disable()  // Ausschalten
window.amorphDebug.enable()   // Einschalten
window.amorphDebug.isEnabled()
```

## 💡 Best Practices

1. **Immer initApp() aufrufen** - oder automatisch via DOMContentLoaded
2. **Selection-State ist session-basiert** - verschwindet bei Tab-Schließen
3. **Debug standardmäßig AN** - deaktivieren via `localStorage.setItem('amorph:debug', 'false')`
4. **Observer standardmäßig AN** - deaktivieren via `localStorage.setItem('amorph:observers', 'false')`
5. **Feld-Selektion für Compare** - Einzelne Datenfelder können verglichen werden
