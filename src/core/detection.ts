/**
 * AMORPH v7 - Type Detection
 * 
 * Automatische Erkennung des optimalen Morph-Typs aus Datenstruktur.
 * Vereint die besten Aspekte aus v5 und v6.
 */

import type { MorphType, DetectionConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: DetectionConfig = {
  badge: {
    keywords: [
      // Status
      'active', 'inactive', 'yes', 'no', 'online', 'offline',
      'open', 'closed', 'available', 'unavailable', 'enabled', 'disabled',
      // Edibility (EN)
      'edible', 'toxic', 'deadly', 'poisonous', 'choice', 'caution',
      // Essbarkeit (DE)
      'essbar', 'giftig', 'tödlich', 'bedingt', 'ungenießbar',
      // Quality
      'good', 'bad', 'excellent', 'poor', 'warning', 'danger', 'safe',
      'pending', 'approved', 'rejected', 'complete', 'incomplete',
      // Level
      'high', 'medium', 'low', 'critical', 'normal', 'none'
    ],
    maxLength: 25
  },
  progress: {
    min: 0,
    max: 100,
    integersOnly: true
  },
  rating: {
    min: 0,
    max: 10,
    decimalsRequired: false
  }
};

let config: DetectionConfig = DEFAULT_CONFIG;

export function setDetectionConfig(newConfig: Partial<DetectionConfig>): void {
  config = { ...DEFAULT_CONFIG, ...newConfig };
}

export function getDetectionConfig(): DetectionConfig {
  return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const BADGE_VARIANTS: Record<string, string[]> = {
  success: [
    'active', 'yes', 'available', 'enabled', 'online', 'open',
    'edible', 'safe', 'good', 'choice', 'excellent', 'essbar',
    'approved', 'complete', 'common'
  ],
  danger: [
    'toxic', 'deadly', 'poisonous', 'danger', 'critical',
    'giftig', 'tödlich', 'rejected', 'error', 'fatal'
  ],
  warning: [
    'caution', 'warning', 'medium', 'bedingt', 'pending',
    'ungenießbar', 'partial', 'limited'
  ],
  muted: [
    'inactive', 'no', 'unavailable', 'disabled', 'offline', 'closed',
    'poor', 'none', 'unknown', 'n/a'
  ]
};

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'muted' | 'default';

export function getBadgeVariant(value: string): BadgeVariant {
  const lower = value.toLowerCase();
  
  for (const [variant, keywords] of Object.entries(BADGE_VARIANTS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return variant as BadgeVariant;
    }
  }
  
  return 'default';
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hauptfunktion: Erkennt Morph-Typ aus Wert und optional Feldname.
 */
export function detectType(value: unknown, fieldName?: string): MorphType {
  // Null/Undefined
  if (value === null || value === undefined) return 'null';
  
  // Boolean
  if (typeof value === 'boolean') return 'boolean';
  
  // Number
  if (typeof value === 'number') {
    return detectNumberType(value, fieldName);
  }
  
  // String
  if (typeof value === 'string') {
    return detectStringType(value, fieldName);
  }
  
  // Array
  if (Array.isArray(value)) {
    return detectArrayType(value, fieldName);
  }
  
  // Object
  if (typeof value === 'object') {
    return detectObjectType(value as Record<string, unknown>, fieldName);
  }
  
  return 'text';
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectNumberType(value: number, fieldName?: string): MorphType {
  // Field-based hints
  if (fieldName) {
    const lower = fieldName.toLowerCase();
    if (/rating|bewertung|score|sterne/i.test(lower)) return 'rating';
    if (/percent|prozent|progress|fortschritt/i.test(lower)) return 'progress';
    if (/price|preis|cost|kosten|eur|usd|€|\$/i.test(lower)) return 'currency';
    if (/lat|lng|latitude|longitude/i.test(lower)) return 'map';
  }
  
  // Progress: 0-100 integers
  if (value >= config.progress.min && value <= config.progress.max) {
    if (!config.progress.integersOnly || Number.isInteger(value)) {
      return 'progress';
    }
  }
  
  // Rating: 0-10
  if (value >= config.rating.min && value <= config.rating.max) {
    return 'rating';
  }
  
  return 'number';
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRING DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectStringType(value: string, fieldName?: string): MorphType {
  const trimmed = value.trim();
  if (!trimmed) return 'null';
  
  // URL patterns
  if (/^https?:\/\//i.test(trimmed)) {
    // Image URLs
    if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i.test(trimmed)) {
      return 'image';
    }
    return 'link';
  }
  
  // Relative image paths
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(trimmed)) {
    return 'image';
  }
  
  // Date patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed) || /^\d{2}\.\d{2}\.\d{4}/.test(trimmed)) {
    return 'date';
  }
  
  // Field-based hints
  if (fieldName) {
    const lower = fieldName.toLowerCase();
    if (/bild|image|foto|photo|avatar|thumbnail/i.test(lower)) return 'image';
    if (/link|url|href|website/i.test(lower)) return 'link';
    if (/datum|date|zeit|time|created|updated/i.test(lower)) return 'date';
    if (/tags?|kategorie|category|label/i.test(lower)) return 'tag';
  }
  
  // Badge detection by keywords
  const lower = trimmed.toLowerCase();
  if (trimmed.length <= config.badge.maxLength) {
    if (config.badge.keywords.some(kw => lower.includes(kw))) {
      return 'badge';
    }
  }
  
  // Short strings as tags
  if (trimmed.length <= 20 && !trimmed.includes(' ')) {
    return 'tag';
  }
  
  return 'text';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectArrayType(value: unknown[], fieldName?: string): MorphType {
  if (value.length === 0) return 'list';
  
  const first = value[0];
  
  // Array of strings → list or tags
  if (typeof first === 'string') {
    // All short strings → tags
    if (value.every(v => typeof v === 'string' && (v as string).length <= 20)) {
      return 'tag';
    }
    return 'list';
  }
  
  // Array of numbers → sparkline
  if (typeof first === 'number') {
    return 'sparkline';
  }
  
  // Array of objects → detect chart type
  if (typeof first === 'object' && first !== null) {
    const obj = first as Record<string, unknown>;
    const keys = Object.keys(obj);
    
    // Timeline: has date/time field
    if (keys.some(k => /date|datum|zeit|time|year|jahr/i.test(k))) {
      return 'timeline';
    }
    
    // Bar chart: has label + value
    if (keys.includes('label') && keys.includes('value')) {
      return 'bar';
    }
    
    // Pie chart: has name/label + value + small array
    if (value.length <= 8 && keys.includes('value')) {
      return 'pie';
    }
    
    // Steps: has step/phase + status
    if (keys.some(k => /step|schritt|phase/i.test(k))) {
      return 'steps';
    }
    
    // Lifecycle: has phase + duration
    if (keys.includes('phase') || keys.includes('duration')) {
      return 'lifecycle';
    }
    
    // Network: has connections/relations
    if (keys.some(k => /from|to|source|target|connection/i.test(k))) {
      return 'network';
    }
    
    // Default: object list
    return 'list';
  }
  
  return 'list';
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectObjectType(value: Record<string, unknown>, fieldName?: string): MorphType {
  const keys = Object.keys(value);
  if (keys.length === 0) return 'object';
  
  // Range: has min + max
  if ('min' in value && 'max' in value) {
    // Stats: has avg
    if ('avg' in value || 'average' in value || 'mean' in value) {
      return 'stats';
    }
    return 'range';
  }
  
  // Map: has lat + lng
  if (('lat' in value && 'lng' in value) || ('latitude' in value && 'longitude' in value)) {
    return 'map';
  }
  
  // Rating object: has rating + max
  if ('rating' in value || 'score' in value) {
    return 'rating';
  }
  
  // Gauge: has value + zones/thresholds
  if ('value' in value && ('zones' in value || 'thresholds' in value)) {
    return 'gauge';
  }
  
  // Citation: has authors + year
  if ('authors' in value || 'autor' in value) {
    return 'citation';
  }
  
  // Currency: has amount + currency
  if ('amount' in value && 'currency' in value) {
    return 'currency';
  }
  
  // Dosage: has dose/amount + unit
  if (('dose' in value || 'amount' in value) && 'unit' in value) {
    return 'dosage';
  }
  
  // Hierarchy: has children or parent
  if ('children' in value || 'parent' in value) {
    // Treemap: numerical values
    if ('value' in value) {
      return 'treemap';
    }
    // Sunburst: nested children
    if (Array.isArray(value.children) && value.children.length > 0) {
      const child = value.children[0];
      if (typeof child === 'object' && 'children' in (child as object)) {
        return 'sunburst';
      }
    }
    return 'hierarchy';
  }
  
  // Boxplot: has q1, median, q3
  if ('q1' in value && 'median' in value && 'q3' in value) {
    return 'boxplot';
  }
  
  // Radar: 3+ numeric fields → radar chart
  const numericKeys = keys.filter(k => typeof value[k] === 'number');
  if (numericKeys.length >= 3) {
    return 'radar';
  }
  
  return 'object';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════════════════════

export {
  detectNumberType,
  detectStringType,
  detectArrayType,
  detectObjectType
};
