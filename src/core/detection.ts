/**
 * AMORPH v7 - Structure-Based Type Detection
 * 
 * Erkennt Morph-Typen AUSSCHLIESSLICH basierend auf Datenstruktur.
 * Keine Feldnamen-Heuristiken - nur die Struktur zählt.
 * 
 * Basiert auf den Blueprint-Definitionen in:
 * config/schema/perspektiven/blueprints/CLAUDE.md
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRUKTUR-REGELN (aus Blueprints)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRIMITIV:
 *   text      → string (beliebige Länge)
 *   number    → number
 *   boolean   → true | false
 *   tag       → string (≤20 Zeichen)
 *   image     → string mit Bildendung (.jpg, .png, etc.)
 *   link      → string mit http(s)://
 *   date      → string mit ISO-Datum (YYYY-MM-DD)
 * 
 * STATUS (Object mit spezifischen Keys):
 *   badge     → {status: "", variant: ""}
 *   rating    → {rating: 0, max: 10}
 *   progress  → {value: 0, max: 100, unit?: "%"}
 * 
 * BEREICH (Object mit min/max):
 *   range     → {min: 0, max: 0, unit?: ""}
 *   stats     → {min: 0, max: 0, avg: 0, ...}
 *   gauge     → {value: 0, min: 0, max: 0, zones: [...]}
 * 
 * CHARTS (Array mit spezifischer Struktur):
 *   bar       → [{label: "", value: 0}]
 *   pie       → [{label: "", value: 0}] (≤6 Elemente)
 *   radar     → [{axis: "", value: 0}]
 *   sparkline → [0, 1, 2, ...] (reine Zahlen)
 * 
 * TEMPORAL (Array mit Zeit-Keys):
 *   timeline  → [{date: "", event: "", description?: ""}]
 *   steps     → [{step: 1, label: "", status: ""}]
 *   lifecycle → [{phase: "", duration: ""}]
 *   calendar  → [{month: 1, active: false}]
 * 
 * LISTEN:
 *   list      → ["string", ...] oder [{...}]
 *   tag       → ["short", "strings"] (alle ≤20 Zeichen)
 * 
 * SPEZIAL:
 *   severity  → [{level: "", typ: "", beschreibung: ""}]
 *   dosage    → [{amount: 0, unit: "", frequency: "", route: ""}]
 *   citation  → {authors: "", year: 0, title: "", journal?: "", doi?: ""}
 *   currency  → {amount: 0, currency: ""}
 *   map       → {lat: 0, lng: 0}
 *   object    → Generic fallback für andere Objekte
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { MorphType } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Erkennt Morph-Typ aus Datenstruktur.
 * Feldname wird für semantische Hinweise verwendet (z.B. "months" für Monatszahlen).
 * 
 * WICHTIG: Erkennungsreihenfolge ist kritisch!
 * 
 * Primitive (in dieser Reihenfolge):
 *   1. null/undefined → text
 *   2. boolean → boolean  
 *   3. number → number
 *   4. string → image > link > date > tag > text
 *   5. array → siehe detectArrayStructure
 *   6. object → siehe detectObjectStructure
 * 
 * Object-Erkennung (Reihenfolge wichtig wegen Überlappung):
 *   1. {status, variant} → badge
 *   2. {rating, max?} → rating  
 *   3. {value, max} → progress (vor range, da spezifischer)
 *   4. {min, max, avg} → stats (vor range, da mehr Keys)
 *   5. {min, max} → range
 *   6. 3+ numeric keys → radar
 *   7. fallback → object
 */
export function detectType(value: unknown, fieldName?: string): MorphType {
  // Null/Undefined → text (empty)
  if (value === null || value === undefined) return 'text';
  
  // Boolean → boolean
  if (typeof value === 'boolean') return 'boolean';
  
  // Number (plain) → number
  if (typeof value === 'number') return 'number';
  
  // String → detectStringStructure
  if (typeof value === 'string') {
    return detectStringStructure(value);
  }
  
  // Array → detectArrayStructure (with field name hint)
  if (Array.isArray(value)) {
    return detectArrayStructure(value, fieldName);
  }
  
  // Object → detectObjectStructure
  if (typeof value === 'object') {
    return detectObjectStructure(value as Record<string, unknown>);
  }
  
  return 'text';
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRING DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectStringStructure(value: string): MorphType {
  if (!value || value.length === 0) return 'text';
  
  const trimmed = value.trim();
  
  // ─────────────────────────────────────────────────────────────────────────────
  // IMAGE: URLs/paths ending with image extensions
  // ─────────────────────────────────────────────────────────────────────────────
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i.test(trimmed)) {
    return 'image';
  }
  
  // IMAGE: URL with /images/ or /img/ path
  if (/\/images?\/|\/img\//i.test(trimmed)) {
    return 'image';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LINK: Full URLs (http/https)
  // ─────────────────────────────────────────────────────────────────────────────
  if (/^https?:\/\//i.test(trimmed)) {
    return 'link';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DATE: ISO date format
  // ─────────────────────────────────────────────────────────────────────────────
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(trimmed)) {
    return 'date';
  }
  
  // DATE: German format (DD.MM.YYYY)
  if (/^\d{1,2}\.\s?\w+\.?\s?\d{4}$/.test(trimmed) || /^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    return 'date';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TAG: Short strings (≤20 chars, no newlines)
  // ─────────────────────────────────────────────────────────────────────────────
  if (trimmed.length <= 20 && !trimmed.includes('\n')) {
    return 'tag';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT: Default for longer strings
  // ─────────────────────────────────────────────────────────────────────────────
  return 'text';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectArrayStructure(arr: unknown[], fieldName?: string): MorphType {
  if (arr.length === 0) return 'list';
  
  const first = arr[0];
  const fieldLower = fieldName?.toLowerCase() || '';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // NUMBER ARRAYS: Check if they're semantic (months, years) vs data points
  // ─────────────────────────────────────────────────────────────────────────────
  if (arr.every(item => typeof item === 'number')) {
    // MONTH NUMBERS: Field name contains "month" and all values 1-12
    // → Render as tag list with month names, not sparkline
    if (fieldLower.includes('month') && arr.every(n => Number.isInteger(n) && n >= 1 && n <= 12)) {
      return 'tag'; // Will be rendered as month names by tag morph
    }
    
    // YEAR NUMBERS: Field name contains "year" and all values look like years (1900-2100)
    if (fieldLower.includes('year') && arr.every(n => Number.isInteger(n) && n >= 1900 && n <= 2100)) {
      return 'tag'; // Render as year list
    }
    
    // Small integer lists (1-10 items, all small integers 1-12): likely categorical, not trend data
    // But only if they look sequential or categorical (not random values)
    if (arr.length <= 12 && arr.every(n => Number.isInteger(n) && n >= 1 && n <= 12)) {
      // Check if it's sequential-ish (consecutive months, ranks, etc.)
      const sorted = [...arr].sort((a, b) => (a as number) - (b as number));
      const isSequential = sorted.every((n, i) => i === 0 || (n as number) - (sorted[i-1] as number) <= 2);
      if (isSequential) {
        return 'tag'; // Likely month list or similar categorical data
      }
    }
    
    // Default: sparkline for general numeric arrays
    return 'sparkline';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TAG or LIST: Array of strings
  // ─────────────────────────────────────────────────────────────────────────────
  if (arr.every(item => typeof item === 'string')) {
    // All short strings → tag
    if (arr.every(item => (item as string).length <= 20)) {
      return 'tag';
    }
    return 'list';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // OBJECT ARRAYS: Check structure of first element
  // ─────────────────────────────────────────────────────────────────────────────
  if (typeof first === 'object' && first !== null) {
    const obj = first as Record<string, unknown>;
    
    // BADGE ARRAY: [{status: "", variant: ""}] oder [{label: "", status: "", variant: ""}]
    // Aus universe-index.json: [{icon, label, status, variant}]
    if (hasKeys(obj, ['status', 'variant']) || hasKeys(obj, ['status', 'label'])) {
      return 'badge';
    }
    
    // RADAR: [{axis: "", value: 0}]
    if (hasExactKeys(obj, ['axis', 'value'])) {
      return 'radar';
    }
    
    // BAR/PIE: [{label: "", value: 0}]
    if (hasKeys(obj, ['label', 'value'])) {
      // PIE: ≤6 elements
      if (arr.length <= 6) {
        return 'bar'; // Could be pie, but bar is safer default
      }
      return 'bar';
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // TEMPORAL TYPES
    // ─────────────────────────────────────────────────────────────────────────
    
    // TIMELINE: [{date: "", event: ""}]
    if (hasKeys(obj, ['date', 'event'])) {
      return 'timeline';
    }
    
    // STEPS: [{step: 1, label: "", status: ""}]
    if (hasKeys(obj, ['step', 'label'])) {
      return 'steps';
    }
    
    // LIFECYCLE: [{phase: "", duration: ""}]
    if (hasKeys(obj, ['phase', 'duration'])) {
      return 'lifecycle';
    }
    
    // CALENDAR: [{month: 1, active: false}]
    if (hasKeys(obj, ['month', 'active']) || hasKeys(obj, ['monat', 'aktiv'])) {
      return 'calendar';
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // SPECIAL LIST TYPES
    // ─────────────────────────────────────────────────────────────────────────
    
    // SEVERITY: [{level: "", typ: "", beschreibung: ""}]
    if (hasKeys(obj, ['level', 'typ']) || hasKeys(obj, ['level', 'type'])) {
      return 'severity';
    }
    
    // DOSAGE: [{amount: 0, unit: "", frequency: ""}]
    if (hasKeys(obj, ['amount', 'unit', 'frequency']) || hasKeys(obj, ['menge', 'einheit', 'frequenz'])) {
      return 'dosage';
    }
    
    // NETWORK: [{name: "", type: "", intensity: 0}]
    if (hasKeys(obj, ['name', 'type', 'intensity'])) {
      return 'list';
    }
    
    // FLOW: [{from: "", to: "", value: 0}]
    if (hasKeys(obj, ['from', 'to'])) {
      return 'list';
    }
    
    // HIERARCHY: [{level: "", name: ""}]
    if (hasKeys(obj, ['level', 'name'])) {
      return 'list';
    }
    
    // Default: generic list
    return 'list';
  }
  
  return 'list';
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectObjectStructure(obj: Record<string, unknown>): MorphType {
  const keys = Object.keys(obj);
  
  if (keys.length === 0) return 'object';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BADGE: {status: "", variant: ""}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['status', 'variant'])) {
    return 'badge';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RATING: {rating: 0, max: 10}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['rating', 'max']) || hasKeys(obj, ['rating'])) {
    return 'rating';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PROGRESS/GAUGE: {value: 0, max: 100, ...}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['value', 'max'])) {
    // GAUGE: has zones
    if (hasKey(obj, 'zones') && Array.isArray(obj.zones)) {
      return 'gauge';
    }
    return 'progress';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // STATS: {min: 0, max: 0, avg: 0, ...}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['min', 'max', 'avg']) || hasKeys(obj, ['total', 'count', 'avg'])) {
    return 'stats';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RANGE: {min: 0, max: 0, unit?: ""}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['min', 'max'])) {
    return 'range';
  }
  
  // RANGE: German variant {von: 0, bis: 0}
  if (hasKeys(obj, ['von', 'bis'])) {
    return 'range';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // MAP: {lat: 0, lng: 0} or {latitude: 0, longitude: 0}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['lat', 'lng']) || hasKeys(obj, ['latitude', 'longitude'])) {
    return 'object'; // map morph not implemented
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CITATION: {authors: "", year: 0, title: ""}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['authors', 'year', 'title']) || hasKeys(obj, ['autor', 'jahr', 'titel'])) {
    return 'citation';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CURRENCY: {amount: 0, currency: ""}
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasKeys(obj, ['amount', 'currency']) || hasKeys(obj, ['betrag', 'waehrung'])) {
    return 'currency';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RADAR from Object: 3+ numeric keys
  // ─────────────────────────────────────────────────────────────────────────────
  const numericKeys = keys.filter(k => typeof obj[k] === 'number');
  if (numericKeys.length >= 3) {
    return 'radar';
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DEFAULT: object
  // ─────────────────────────────────────────────────────────────────────────────
  return 'object';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if object has a specific key
 */
function hasKey(obj: Record<string, unknown>, key: string): boolean {
  return key in obj;
}

/**
 * Check if object has ALL specified keys
 */
function hasKeys(obj: Record<string, unknown>, requiredKeys: string[]): boolean {
  return requiredKeys.every(key => key in obj);
}

/**
 * Check if object has EXACTLY these keys (no more, no less)
 */
function hasExactKeys(obj: Record<string, unknown>, exactKeys: string[]): boolean {
  const keys = Object.keys(obj);
  if (keys.length !== exactKeys.length) return false;
  return exactKeys.every(key => key in obj);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE VARIANTS (for rendering)
// ═══════════════════════════════════════════════════════════════════════════════

const BADGE_VARIANTS: Record<string, string[]> = {
  success: [
    'active', 'yes', 'available', 'enabled', 'online', 'open',
    'edible', 'safe', 'good', 'choice', 'excellent', 'essbar',
    'approved', 'complete', 'common', 'least_concern', 'lc'
  ],
  danger: [
    'toxic', 'deadly', 'poisonous', 'danger', 'critical',
    'giftig', 'tödlich', 'rejected', 'error', 'fatal',
    'extinct', 'critically_endangered', 'ce', 'ex'
  ],
  warning: [
    'caution', 'warning', 'medium', 'bedingt', 'pending',
    'ungenießbar', 'partial', 'limited', 'endangered',
    'vulnerable', 'near_threatened', 'en', 'vu', 'nt'
  ],
  muted: [
    'inactive', 'no', 'unavailable', 'disabled', 'offline', 'closed',
    'poor', 'none', 'unknown', 'n/a', 'data_deficient', 'not_evaluated', 'dd', 'ne'
  ]
};

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'muted' | 'default';

/**
 * Get badge variant from status string
 * Short keywords (≤2 chars) require exact match to avoid false positives
 */
export function getBadgeVariant(value: string): BadgeVariant {
  const lower = value.toLowerCase().replace(/[\s_-]/g, '_');
  
  for (const [variant, keywords] of Object.entries(BADGE_VARIANTS)) {
    if (keywords.some(kw => {
      // Short keywords need exact match (e.g., 'en', 'nt' should not match 'data_deficient')
      if (kw.length <= 2) {
        return lower === kw;
      }
      // Longer keywords can be substring match
      return lower.includes(kw) || lower === kw;
    })) {
      return variant as BadgeVariant;
    }
  }
  
  return 'default';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { detectType as default };
