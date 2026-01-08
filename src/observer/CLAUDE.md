# Observer Module

Debug und Analytics für AMORPH.

**Tests:** 8 in observer.test.ts

---

## Features

- Performance-Monitoring
- Render-Tracking
- Error-Logging
- Feature-Flag Debugging

---

## Verwendung

```typescript
// Wird dynamisch importiert (nur wenn debug=true)
if (config.debug) {
  const { observer } = await import('@/observer');
  observer.track('render', { morph: 'badge', duration: 5 });
}
```

---

## Wichtig

⚠️ **DYNAMIC IMPORT** - Nicht im Production Bundle!

Observer wird nur geladen wenn Debug aktiviert ist,
um Bundle-Größe zu minimieren.

---

## Konfiguration

In `config-local/features.yaml`:
```yaml
debug: false  # true für Entwicklung
```

---

## 📚 Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| [../CLAUDE.md](../CLAUDE.md) | src/ Übersicht |
| [../../CLAUDE.md](../../CLAUDE.md) | AMORPH Root |

---

*Letzte Aktualisierung: Januar 2026*
