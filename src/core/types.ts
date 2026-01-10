/**
 * AMORPH v7 - Core Type Definitions
 * 
 * Zentrale TypeScript-Typen für das gesamte System.
 * Single Source of Truth für alle Module.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER MODES & CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Die drei Haupt-Render-Modi:
 * - single: Einzelansicht (Detail-Seite)
 * - grid: Übersichts-Grid (Karten)
 * - compare: Vergleichsansicht (mehrere Items nebeneinander)
 */
export type RenderMode = 'single' | 'grid' | 'compare';

/**
 * Kontext für Morph-Rendering.
 * Morphs erhalten diesen Kontext und passen sich automatisch an.
 */
export interface RenderContext {
  /** Aktueller Render-Modus */
  mode: RenderMode;
  
  /** Anzahl der Items (1 = single, >1 = compare) */
  itemCount: number;
  
  /** Alle Items bei Compare-Modus */
  items?: ItemData[];
  
  /** Index des aktuellen Items (bei Compare) */
  itemIndex?: number;
  
  /** Farben für Items (bei Compare) */
  colors?: string[];
  
  /** Aktive Perspektive(n) */
  perspectives?: string[];
  
  /** Aktuelles Feld */
  fieldName?: string;
  
  /** Feld-Konfiguration aus Schema */
  fieldConfig?: SchemaField;
  
  /** Ist kompakte Darstellung gewünscht? */
  compact?: boolean;
  
  /** Quellen für das aktuelle Feld (Bifroest System) */
  sources?: FieldSource[];
  
  /** Bifroest Mode aktiv? (zeigt alle © leuchtend) */
  bifroestMode?: boolean;
  
  /** © komplett ausblenden (z.B. in Compare View) */
  hideCopyright?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MORPH TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Alle verfügbaren Morph-Typen.
 * Jeder Morph kann Single UND Compare rendern.
 */
export type MorphType =
  // Primitives
  | 'null' | 'boolean' | 'text' | 'number' | 'progress'
  // String-derived
  | 'link' | 'image' | 'badge' | 'tag' | 'date'
  // Containers
  | 'list' | 'object' | 'hierarchy'
  // Charts
  | 'bar' | 'pie' | 'radar' | 'sparkline' | 'gauge' | 'heatmap'
  | 'slopegraph' | 'bubble' | 'boxplot' | 'treemap' | 'sunburst'
  | 'stackedbar' | 'groupedbar' | 'dotplot' | 'scatterplot' | 'lollipop'
  | 'flow' | 'pictogram' | 'severity'
  // Temporal
  | 'timeline' | 'lifecycle' | 'steps' | 'calendar'
  // Specialized
  | 'range' | 'stats' | 'map' | 'network' | 'citation' | 'dosage' | 'currency'
  | 'rating' | 'comparison';

/**
 * Unified Morph Function Signature.
 * Ein Morph rendert basierend auf Context automatisch Single oder Compare.
 */
export type MorphFunction = (
  value: unknown | unknown[],  // Einzelwert oder Array von Werten
  context: RenderContext
) => string;

/**
 * Morph-Modul mit Metadata.
 */
export interface MorphModule {
  /** Render-Funktion */
  render: MorphFunction;
  
  /** Morph-Name */
  name: MorphType;
  
  /** Beschreibung */
  description?: string;
  
  /** Unterstützte Input-Typen */
  accepts?: string[];
  
  /** Beispiel-Konfiguration */
  example?: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard Item-Datenstruktur.
 */
export interface ItemData {
  id: string;
  slug: string;
  name: string;
  /** Scientific name */
  scientificName?: string;
  /** Description */
  description?: string;
  /** Main image URL */
  image?: string;
  /** Perspektiven-Daten (neu in v7) */
  _perspectives?: Record<string, unknown>;
  /** Loaded perspective names */
  _loadedPerspectives?: string[];
  /** Field to perspective mapping */
  _fieldPerspective?: Record<string, string>;
  /** Kingdom (legacy: Fungi, Plantae, etc.) */
  _kingdom?: string;
  /** Collection name (fungi, plantae, therion, paleontology, etc.) */
  _collection?: string;
  /** Domain (biology or geology) */
  _domain?: 'biology' | 'geology';
  /** Domain slug from database (fungi, phyto, drako, etc.) */
  _domainSlug?: string;
  /** Domain color from database (hex color) */
  _domainColor?: string;
  /** GOATn pro Feld (Bifroest System) */
  _sources?: FieldSourceMap;
  [key: string]: unknown;
}

/**
 * Schema-Feld-Definition.
 */
export interface SchemaField {
  name: string;
  type?: string;
  morph?: MorphType;
  label?: string;
  description?: string;
  hidden?: boolean;
  perspektive?: string;
  keywords?: string[];
}

/**
 * Perspektive aus Schema.
 */
export interface Perspective {
  id: string;
  name: string;
  symbol?: string;
  color?: string;
  colors?: string[];
  felder?: string[];  // German alias
  fields?: string[];  // English (from YAML)
  keywords?: string[];
  beschreibung?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Haupt-Konfiguration.
 */
export interface AppConfig {
  manifest: {
    name: string;
    version: string;
    branding?: {
      logo?: string;
      title?: string;
    };
  };
  
  daten: {
    typ: string;
    pfad: string;
    index?: string;
  };
  
  features?: Record<string, unknown>;
  
  schema?: {
    meta?: Record<string, string>;
    felder?: Record<string, SchemaField>;
    perspektiven?: Record<string, Perspective>;
    reihenfolge?: string[];
    semantik?: Record<string, string[]>;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Konfiguration für automatische Typ-Erkennung.
 */
export interface DetectionConfig {
  badge: {
    keywords: string[];
    maxLength: number;
  };
  progress: {
    min: number;
    max: number;
    integersOnly: boolean;
  };
  rating: {
    min: number;
    max: number;
    decimalsRequired: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE / COPYRIGHT TYPES (Bifroest System)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quelle/Copyright für ein Datenfeld.
 * Jedes Feld kann mehrere Quellen haben.
 */
export interface FieldSource {
  /** Kurzname (z.B. "Mushr.Observer", "iNaturalist") */
  name: string;
  
  /** Vollständiger Copyright-Text */
  copyright?: string;
  
  /** Lizenz (z.B. "CC BY-SA 4.0", "CC0") */
  license?: string;
  
  /** URL zur Quelle */
  url?: string;
  
  /** Kontakt-Email */
  contact?: string;
  
  /** Autor/Fotograf */
  author?: string;
  
  /** Datum der Datenerhebung */
  date?: string;
  
  /** Zusätzliche Notizen */
  notes?: string;
}

/**
 * Source-Metadaten für ein Item.
 * Map: fieldName -> Array von Sources
 */
export type FieldSourceMap = Record<string, FieldSource[]>;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prüft ob Context im Compare-Modus ist.
 */
export function isCompareMode(ctx: RenderContext): boolean {
  return ctx.mode === 'compare' || ctx.itemCount > 1;
}

/**
 * Prüft ob Context im Single-Modus ist.
 */
export function isSingleMode(ctx: RenderContext): boolean {
  return ctx.mode === 'single' || ctx.itemCount === 1;
}

/**
 * Erstellt Standard-Kontext für Single-Rendering.
 */
export function createSingleContext(fieldName?: string): RenderContext {
  return {
    mode: 'single',
    itemCount: 1,
    fieldName
  };
}

/**
 * Erstellt Kontext für Compare-Rendering.
 */
export function createCompareContext(
  items: ItemData[],
  colors?: string[],
  perspectives?: string[]
): RenderContext {
  return {
    mode: 'compare',
    itemCount: items.length,
    items,
    colors: colors || generateColors(items.length),
    perspectives
  };
}

/**
 * Generiert Farben für Compare-Items.
 */
export function generateColors(count: number): string[] {
  const palette = [
    '#0df',  // Cyan
    '#f0d',  // Magenta
    '#fd0',  // Yellow
    '#0fd',  // Teal
    '#d0f',  // Purple
    '#df0',  // Lime
  ];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}
