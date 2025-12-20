/**
 * AMORPH v7 - Morph Debug System
 * 
 * Spezialisiertes Debug-Logging für Morph-Erkennung und Rendering.
 * Hilft bei der Diagnose, ob Felder die richtigen Morphs verwenden.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

// Debug ist standardmäßig aus - aktivieren mit:
// localStorage.setItem('amorph:morph-debug', 'true')
// oder: window.morphDebug.enable()
const getEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('amorph:morph-debug') === 'true';
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const STYLES = {
  header: 'color: #f472b6; font-weight: bold; font-size: 12px',
  field: 'color: #60a5fa; font-weight: bold',
  type: 'color: #34d399; font-weight: bold',
  value: 'color: #fbbf24',
  muted: 'color: #888',
  warn: 'color: #fb923c; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  success: 'color: #22c55e; font-weight: bold'
};

// Morph-Type Colors für visuelle Unterscheidung
const TYPE_COLORS: Record<string, string> = {
  text: '#94a3b8',
  number: '#60a5fa',
  boolean: '#a78bfa',
  badge: '#f472b6',
  tag: '#06b6d4',
  progress: '#22c55e',
  rating: '#fbbf24',
  bar: '#fb7185',
  sparkline: '#34d399',
  radar: '#e879f9',
  image: '#38bdf8',
  link: '#2dd4bf',
  list: '#84cc16',
  object: '#c084fc',
  date: '#67e8f9',
  timeline: '#14b8a6',
  range: '#f97316',
  stats: '#8b5cf6',
  null: '#6b7280'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface MorphDebugEntry {
  timestamp: number;
  fieldName: string;
  detectedType: string;
  valueType: string;
  valuePreview: string;
  isArray: boolean;
  arrayLength?: number;
  objectKeys?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEBUG STATE
// ═══════════════════════════════════════════════════════════════════════════════

const history: MorphDebugEntry[] = [];
const maxHistory = 200;
const typeStats: Record<string, number> = {};
const fieldTypeMap: Map<string, Set<string>> = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getValuePreview(value: unknown, maxLen = 50): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const first = value[0];
    if (typeof first === 'object' && first !== null) {
      const keys = Object.keys(first);
      return `[{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}] (${value.length})`;
    }
    return `[${String(value[0])}...] (${value.length})`;
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value as object);
    return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
  }
  
  const str = String(value);
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || '#888';
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DEBUG FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log eine Morph-Erkennung
 */
export function logDetection(
  fieldName: string,
  value: unknown,
  detectedType: string
): void {
  const enabled = getEnabled();
  
  // Stats immer sammeln
  typeStats[detectedType] = (typeStats[detectedType] || 0) + 1;
  
  // Feld-Typ-Mapping tracken
  if (!fieldTypeMap.has(fieldName)) {
    fieldTypeMap.set(fieldName, new Set());
  }
  fieldTypeMap.get(fieldName)!.add(detectedType);
  
  const entry: MorphDebugEntry = {
    timestamp: Date.now(),
    fieldName,
    detectedType,
    valueType: Array.isArray(value) ? 'array' : typeof value,
    valuePreview: getValuePreview(value),
    isArray: Array.isArray(value),
    arrayLength: Array.isArray(value) ? value.length : undefined,
    objectKeys: typeof value === 'object' && value !== null && !Array.isArray(value) 
      ? Object.keys(value) 
      : undefined
  };
  
  history.push(entry);
  if (history.length > maxHistory) history.shift();
  
  if (!enabled) return;
  
  // Console Output
  const typeColor = getTypeColor(detectedType);
  console.log(
    `%c🔮 MORPH%c ${fieldName} %c→ ${detectedType}%c :: ${entry.valuePreview}`,
    STYLES.header,
    STYLES.field,
    `color: ${typeColor}; font-weight: bold`,
    STYLES.muted
  );
}

/**
 * Log eine Warnung bei unerwarteter Erkennung
 */
export function logMismatch(
  fieldName: string,
  expectedType: string,
  actualType: string,
  value: unknown
): void {
  if (!getEnabled()) return;
  
  console.warn(
    `%c⚠️ MORPH MISMATCH%c ${fieldName}%c expected=${expectedType} actual=${actualType}`,
    STYLES.warn,
    STYLES.field,
    STYLES.muted,
    { value, preview: getValuePreview(value) }
  );
}

/**
 * Log Render-Ergebnis
 */
export function logRender(
  fieldName: string,
  morphType: string,
  htmlLength: number
): void {
  if (!getEnabled()) return;
  
  const typeColor = getTypeColor(morphType);
  console.log(
    `%c✓ RENDER%c ${fieldName} %c[${morphType}]%c → ${htmlLength} chars`,
    STYLES.success,
    STYLES.field,
    `color: ${typeColor}`,
    STYLES.muted
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zeigt Statistiken über verwendete Morph-Typen
 */
export function showStats(): void {
  console.group('%c📊 MORPH STATS', STYLES.header);
  
  const sorted = Object.entries(typeStats)
    .sort(([, a], [, b]) => b - a);
  
  console.table(
    sorted.map(([type, count]) => ({
      'Morph Type': type,
      'Count': count,
      'Percentage': `${((count / history.length) * 100).toFixed(1)}%`
    }))
  );
  
  console.log(`Total fields processed: ${history.length}`);
  console.groupEnd();
}

/**
 * Zeigt welche Felder welche Typen haben
 */
export function showFieldTypes(): void {
  console.group('%c📋 FIELD → TYPE MAPPING', STYLES.header);
  
  const entries = [...fieldTypeMap.entries()]
    .map(([field, types]) => ({
      'Field': field,
      'Types': [...types].join(', '),
      'Consistent': types.size === 1 ? '✓' : '⚠️ Multiple'
    }));
  
  console.table(entries);
  console.groupEnd();
}

/**
 * Zeigt History der letzten Erkennungen
 */
export function showHistory(limit = 20): void {
  console.group('%c📜 MORPH HISTORY (last ' + limit + ')', STYLES.header);
  
  const recent = history.slice(-limit).map(e => ({
    'Field': e.fieldName,
    'Type': e.detectedType,
    'Value Type': e.valueType,
    'Preview': e.valuePreview
  }));
  
  console.table(recent);
  console.groupEnd();
}

/**
 * Sucht nach Feldern mit bestimmtem Morph-Typ
 */
export function findByType(morphType: string): void {
  console.group(`%c🔍 FIELDS WITH TYPE: ${morphType}`, STYLES.header);
  
  const matches = history
    .filter(e => e.detectedType === morphType)
    .reduce((acc, e) => {
      if (!acc.has(e.fieldName)) {
        acc.set(e.fieldName, e);
      }
      return acc;
    }, new Map<string, MorphDebugEntry>());
  
  console.table([...matches.values()].map(e => ({
    'Field': e.fieldName,
    'Value Type': e.valueType,
    'Preview': e.valuePreview
  })));
  
  console.groupEnd();
}

/**
 * Zeigt potenzielle Probleme
 */
export function showIssues(): void {
  console.group('%c⚠️ POTENTIAL ISSUES', STYLES.warn);
  
  // Felder die als 'text' erkannt wurden, aber Array/Object sind
  const suspiciousText = history.filter(e => 
    e.detectedType === 'text' && (e.isArray || e.valueType === 'object')
  );
  
  if (suspiciousText.length > 0) {
    console.log('%cArrays/Objects rendered as text:', STYLES.warn);
    console.table(suspiciousText.map(e => ({
      'Field': e.fieldName,
      'Value Type': e.valueType,
      'Preview': e.valuePreview
    })));
  }
  
  // Felder mit inkonsistenten Typen
  const inconsistent = [...fieldTypeMap.entries()]
    .filter(([, types]) => types.size > 1);
  
  if (inconsistent.length > 0) {
    console.log('%cFields with inconsistent types:', STYLES.warn);
    inconsistent.forEach(([field, types]) => {
      console.log(`  ${field}: ${[...types].join(', ')}`);
    });
  }
  
  if (suspiciousText.length === 0 && inconsistent.length === 0) {
    console.log('%c✓ No issues detected', STYLES.success);
  }
  
  console.groupEnd();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function enable(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('amorph:morph-debug', 'true');
    console.log('%c🔮 Morph Debug ENABLED', STYLES.success);
    console.log('Use morphDebug.help() for available commands');
  }
}

export function disable(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('amorph:morph-debug');
    console.log('%c🔮 Morph Debug DISABLED', STYLES.muted);
  }
}

export function clear(): void {
  history.length = 0;
  Object.keys(typeStats).forEach(k => delete typeStats[k]);
  fieldTypeMap.clear();
  console.log('%c🔮 Morph Debug history cleared', STYLES.muted);
}

export function help(): void {
  console.log(`
%c🔮 MORPH DEBUG COMMANDS

%cControl:%c
  morphDebug.enable()     - Enable debug logging
  morphDebug.disable()    - Disable debug logging
  morphDebug.clear()      - Clear history and stats

%cAnalysis:%c
  morphDebug.showStats()      - Show morph type statistics
  morphDebug.showFieldTypes() - Show field → type mapping
  morphDebug.showHistory(n)   - Show last n detections
  morphDebug.findByType(t)    - Find fields using type t
  morphDebug.showIssues()     - Show potential problems

%cExamples:%c
  morphDebug.findByType('bar')
  morphDebug.showHistory(50)
`,
    STYLES.header,
    STYLES.field, STYLES.muted,
    STYLES.field, STYLES.muted,
    STYLES.field, STYLES.muted
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const morphDebug = {
  // Logging (internal use)
  logDetection,
  logMismatch,
  logRender,
  
  // Analysis
  showStats,
  showFieldTypes,
  showHistory,
  findByType,
  showIssues,
  
  // Control
  enable,
  disable,
  clear,
  help,
  
  // Raw data access
  getHistory: () => [...history],
  getStats: () => ({ ...typeStats }),
  getFieldTypes: () => new Map(fieldTypeMap)
};

// Expose to window
if (typeof window !== 'undefined') {
  (window as any).morphDebug = morphDebug;
}
