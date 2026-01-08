/**
 * AMORPH v7 - Server Config
 * 
 * Lädt YAML-Konfigurationen für SSR.
 * Perspektiven werden DATENGETRIEBEN aus Blueprint-Dateien geladen.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYAML } from 'yaml';
import type { AppConfig, Perspective, SchemaField } from '../core/types';

// ═══════════════════════════════════════════════════════════════════════════════
// SITE TYPE - Multi-Site Support
// ═══════════════════════════════════════════════════════════════════════════════

// Biology Sites
export type BiologySiteType = 'fungi' | 'phyto' | 'drako';
// Geology Sites
export type GeologySiteType = 'paleo' | 'tekto' | 'mine';
// Biomedical Sites
export type BiomedicalSiteType = 'bakterio' | 'viro' | 'geno' | 'anato';
// Physics & Chemistry Sites
export type PhysChemSiteType = 'chemo' | 'physi' | 'kosmo';
// Technology Sites
export type TechnologySiteType = 'netzo' | 'cognito' | 'biotech' | 'socio';
// All Sites
export type SiteType = BiologySiteType | GeologySiteType | BiomedicalSiteType | PhysChemSiteType | TechnologySiteType;

// Domain mapping
export type Domain = 'biology' | 'geology' | 'biomedical' | 'physchem' | 'technology';

export const SITE_DOMAIN: Record<SiteType, Domain> = {
  // Biology
  fungi: 'biology',
  phyto: 'biology',
  drako: 'biology',
  // Geology
  paleo: 'geology',
  tekto: 'geology',
  mine: 'geology',
  // Biomedical
  bakterio: 'biomedical',
  viro: 'biomedical',
  geno: 'biomedical',
  anato: 'biomedical',
  // Physics & Chemistry
  chemo: 'physchem',
  physi: 'physchem',
  kosmo: 'physchem',
  // Technology
  netzo: 'technology',
  cognito: 'technology',
  biotech: 'technology',
  socio: 'technology'
};

// Get site type from environment (default: fungi)
export function getSiteType(): SiteType {
  const siteType = process.env.SITE_TYPE?.toLowerCase();
  const validTypes: SiteType[] = [
    // Biology
    'fungi', 'phyto', 'drako',
    // Geology
    'paleo', 'tekto', 'mine',
    // Biomedical
    'bakterio', 'viro', 'geno', 'anato',
    // Physics & Chemistry
    'chemo', 'physi', 'kosmo',
    // Technology
    'netzo', 'cognito', 'biotech', 'socio'
  ];
  if (validTypes.includes(siteType as SiteType)) {
    return siteType as SiteType;
  }
  return 'fungi';
}

// Get domain for current site
export function getSiteDomain(): Domain {
  return SITE_DOMAIN[getSiteType()];
}

// Site metadata for each type
// Collection names match Pocketbase: {domain}_entities
export const SITE_META: Record<SiteType, { 
  name: string; 
  color: string; 
  dataFolder: string; 
  collection: string;
  domain: Domain;
}> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // Biology Sites
  // ═══════════════════════════════════════════════════════════════════════════
  fungi: { name: 'FUNGINOMI', color: 'funginomi', dataFolder: 'fungi', collection: 'fungi_entities', domain: 'biology' },
  phyto: { name: 'PHYTONOMI', color: 'phytonomi', dataFolder: 'phyto', collection: 'phyto_entities', domain: 'biology' },
  drako: { name: 'DRAKONOMI', color: 'drakonomi', dataFolder: 'drako', collection: 'drako_entities', domain: 'biology' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Geology Sites
  // ═══════════════════════════════════════════════════════════════════════════
  paleo: { name: 'PALEONOMI', color: 'paleonomi', dataFolder: 'paleo', collection: 'paleo_entities', domain: 'geology' },
  tekto: { name: 'TEKTONOMI', color: 'tektonomi', dataFolder: 'tekto', collection: 'tekto_entities', domain: 'geology' },
  mine: { name: 'MINENOMI', color: 'minenomi', dataFolder: 'mine', collection: 'mine_entities', domain: 'geology' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Biomedical Sites
  // ═══════════════════════════════════════════════════════════════════════════
  bakterio: { name: 'BAKTERIONOMI', color: 'bakterionomi', dataFolder: 'bakterio', collection: 'bakterio_entities', domain: 'biomedical' },
  viro: { name: 'VIRONOMI', color: 'vironomi', dataFolder: 'viro', collection: 'viro_entities', domain: 'biomedical' },
  geno: { name: 'GENONOMI', color: 'genonomi', dataFolder: 'geno', collection: 'geno_entities', domain: 'biomedical' },
  anato: { name: 'ANATONOMI', color: 'anatonomi', dataFolder: 'anato', collection: 'anato_entities', domain: 'biomedical' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Physics & Chemistry Sites
  // ═══════════════════════════════════════════════════════════════════════════
  chemo: { name: 'CHEMONOMI', color: 'chemonomi', dataFolder: 'chemo', collection: 'chemo_entities', domain: 'physchem' },
  physi: { name: 'PHYSINOMI', color: 'physinomi', dataFolder: 'physi', collection: 'physi_entities', domain: 'physchem' },
  kosmo: { name: 'KOSMONOMI', color: 'kosmonomi', dataFolder: 'kosmo', collection: 'kosmo_entities', domain: 'physchem' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Technology Sites
  // ═══════════════════════════════════════════════════════════════════════════
  netzo: { name: 'NETZONOMI', color: 'netzonomi', dataFolder: 'netzo', collection: 'netzo_entities', domain: 'technology' },
  cognito: { name: 'COGNITONOMI', color: 'cognitonomi', dataFolder: 'cognito', collection: 'cognito_entities', domain: 'technology' },
  biotech: { name: 'BIONOMI', color: 'bionomi', dataFolder: 'biotech', collection: 'biotech_entities', domain: 'technology' },
  socio: { name: 'SOCIONOMI', color: 'socionomi', dataFolder: 'socio', collection: 'socio_entities', domain: 'technology' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));

// In production (built), __dirname is /app/dist/server/chunks/
// In dev, __dirname is /app/src/server/
// Config is always at /app/config/ - use process.cwd() for reliability
const BASE_CONFIG_PATH = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'config')
  : join(__dirname, '../../config');

// Site-specific config path (falls back to base if not exists)
function getConfigPath(): string {
  const siteType = getSiteType();
  const siteConfigPath = join(BASE_CONFIG_PATH, siteType);
  
  // Check if site-specific config exists
  if (existsSync(join(siteConfigPath, 'manifest.yaml'))) {
    return siteConfigPath;
  }
  
  return BASE_CONFIG_PATH;
}

const CONFIG_PATH = getConfigPath();

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════════

let cachedConfig: AppConfig | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// YAML LOADER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load YAML file - first tries site-specific path, then falls back to base config
 */
function loadYAML<T>(filename: string, required = false): T | null {
  // Try site-specific path first
  let filepath = join(CONFIG_PATH, filename);
  
  // Fall back to base config path if file doesn't exist in site folder
  if (!existsSync(filepath) && CONFIG_PATH !== BASE_CONFIG_PATH) {
    filepath = join(BASE_CONFIG_PATH, filename);
  }
  
  if (!existsSync(filepath)) {
    if (required) {
      throw new Error(`Required config file not found: ${filename}`);
    }
    return null;
  }
  
  try {
    const content = readFileSync(filepath, 'utf-8');
    return parseYAML(content) as T;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    if (required) throw error;
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA LOADER
// ═══════════════════════════════════════════════════════════════════════════════

interface SchemaConfig {
  meta?: Record<string, string>;
  kern?: Record<string, unknown>;
  felder?: Record<string, SchemaField>;
  perspektiven?: Record<string, Perspective>;
  reihenfolge?: string[];
  semantik?: Record<string, string[]>;
}

interface ParsedConfig {
  manifest: AppConfig['manifest'];
  daten: AppConfig['daten'];
  features: Record<string, unknown>;
  schema: SchemaConfig;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SITE TYPE → BLUEPRINT FOLDER MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const SITE_TO_BLUEPRINT_FOLDER: Record<SiteType, string> = {
  fungi: 'amorph-fungi',
  phyto: 'amorph-phyto',
  therion: 'amorph-drako',
  paleo: 'amorph-paleo',
  tekto: 'amorph-tekto',
  mineral: 'amorph-mine',
  bakterio: 'amorph-bakterio',
  viro: 'amorph-viro',
  geno: 'amorph-geno',
  anato: 'amorph-anato',
  chemo: 'amorph-chemo',
  physi: 'amorph-physi',
  kosmo: 'amorph-kosmo',
  netzo: 'amorph-netzo',
  cognito: 'amorph-cognito',
  biotech: 'amorph-biotech',
  socio: 'amorph-socio'
};

/**
 * Generate a nice display name from a perspective ID
 * e.g. "antibiotic_resistance" → "Antibiotic Resistance"
 */
function generateDisplayName(id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a symbol based on perspective ID (fallback if not in YAML)
 */
function generateSymbol(id: string): string {
  // Common keywords → symbols mapping
  const symbolMap: Record<string, string> = {
    resistance: '💊',
    communication: '📡',
    network: '🔗',
    gene: '🧬',
    metabol: '⚡',
    biofilm: '🦠',
    holobiont: '🌐',
    intelligence: '🧠',
    ecology: '🌿',
    chemical: '⚗️',
    ecosystem: '🌍',
    mycel: '🍄',
    cross: '🔀',
    transfer: '↔️',
    safety: '⚠️',
    medicine: '💊',
    culinary: '🍳',
    cultivation: '🌱',
    identification: '🔍',
    taxonomy: '📚',
    morphology: '🔬',
    pathogen: '☣️',
    vaccine: '💉',
    virus: '🦠',
    bacteria: '🦠',
    anatomy: '🫀',
    surgery: '🏥',
    imaging: '📸',
    physics: '⚛️',
    quantum: '🔮',
    astronomy: '🔭',
    mission: '🚀',
    cosmos: '🌌',
    architecture: '🏗️',
    security: '🔒',
    ai: '🤖',
    model: '🧠',
    training: '📚',
    ethics: '⚖️',
    biotech: '🧬',
    socio: '🏛️',
    culture: '🎭',
    economy: '💰',
    research: '🔬',
    statistics: '📊',
    geography: '🗺️',
    temporal: '📅',
    conservation: '🛡️',
    fossil: '🦴',
    mineral: '💎',
    crystal: '💎',
    volcano: '🌋',
    plate: '🌍',
    structure: '🏗️'
  };
  
  const lowerID = id.toLowerCase();
  for (const [keyword, symbol] of Object.entries(symbolMap)) {
    if (lowerID.includes(keyword)) {
      return symbol;
    }
  }
  
  return '●'; // Default symbol
}

/**
 * Load perspectives DYNAMICALLY from Blueprint files
 * 
 * Data-driven: Scans the blueprint folder for the current SITE_TYPE
 * and creates perspectives from the filenames.
 */
function loadPerspectivesFromBlueprints(siteType: SiteType): Map<string, Perspective> {
  const perspectives = new Map<string, Perspective>();
  
  const blueprintFolder = SITE_TO_BLUEPRINT_FOLDER[siteType];
  const blueprintPath = join(BASE_CONFIG_PATH, 'schema', 'perspektiven', 'blueprints', blueprintFolder);
  
  if (!existsSync(blueprintPath)) {
    console.warn(`[Config] Blueprint folder not found: ${blueprintPath}`);
    return perspectives;
  }
  
  try {
    const files = readdirSync(blueprintPath);
    const blueprintFiles = files.filter(f => f.endsWith('.blueprint.yaml'));
    
    for (const file of blueprintFiles) {
      // Extract ID from filename: "antibiotic_resistance.blueprint.yaml" → "antibiotic_resistance"
      const id = basename(file, '.blueprint.yaml');
      
      // Try to read perspective metadata from the YAML file
      let name = generateDisplayName(id);
      let symbol = generateSymbol(id);
      
      try {
        const filePath = join(blueprintPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const yaml = parseYAML(content) as Record<string, unknown>;
        
        // Check if YAML has explicit perspective name/symbol
        if (yaml.perspective_name && typeof yaml.perspective_name === 'string') {
          name = yaml.perspective_name;
        }
        if (yaml.perspective_symbol && typeof yaml.perspective_symbol === 'string') {
          symbol = yaml.perspective_symbol;
        }
      } catch {
        // Use generated values if YAML parsing fails
      }
      
      perspectives.set(id, { id, name, symbol });
    }
    
    console.log(`[Config] Loaded ${perspectives.size} perspectives from blueprints: ${blueprintFolder}`);
    
  } catch (error) {
    console.error(`[Config] Error reading blueprint folder:`, error);
  }
  
  return perspectives;
}

function loadSchema(): SchemaConfig {
  const schema: SchemaConfig = {
    meta: {},
    felder: {},
    perspektiven: {},
    reihenfolge: [],
    semantik: {}
  };
  
  // Load basis.yaml
  const basis = loadYAML<any>('schema/basis.yaml');
  if (basis) {
    schema.meta = basis.meta || {};
    schema.felder = basis.kern || {};
  }
  
  // Load semantik.yaml
  const semantik = loadYAML<Record<string, string[]>>('schema/semantik.yaml');
  if (semantik) {
    schema.semantik = semantik;
  }
  
  // Get current site type
  const siteType = getSiteType();
  const siteMeta = SITE_META[siteType];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATA-DRIVEN: Load perspectives from Blueprint files
  // ═══════════════════════════════════════════════════════════════════════════
  const blueprintPerspectives = loadPerspectivesFromBlueprints(siteType);
  
  // Add blueprint perspectives to schema
  for (const [id, perspective] of blueprintPerspectives) {
    schema.perspektiven![id] = perspective;
    schema.reihenfolge!.push(id);
  }
  
  console.log(`[Config] Site: ${siteType} (${siteMeta.name}) → ${schema.reihenfolge!.length} perspectives loaded`);
  
  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOADER
// ═══════════════════════════════════════════════════════════════════════════════

export async function loadConfig(forceReload = false): Promise<AppConfig> {
  if (cachedConfig && !forceReload) {
    return cachedConfig;
  }
  
  // Load required configs
  const manifest = loadYAML<AppConfig['manifest']>('manifest.yaml', true)!;
  const daten = loadYAML<AppConfig['daten']>('daten.yaml', true)!;
  
  // Load optional configs
  const features = loadYAML<Record<string, unknown>>('features.yaml') || {};
  
  // Load schema
  const schema = loadSchema();
  
  cachedConfig = {
    manifest,
    daten,
    features,
    schema
  };
  
  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return cachedConfig;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPerspective(id: string): Perspective | undefined {
  return cachedConfig?.schema?.perspektiven?.[id];
}

export function getAllPerspectives(): Perspective[] {
  const perspektiven = cachedConfig?.schema?.perspektiven;
  if (!perspektiven) return [];
  
  const reihenfolge = cachedConfig?.schema?.reihenfolge || Object.keys(perspektiven);
  return reihenfolge.map(id => perspektiven[id]).filter(Boolean);
}

export function getFieldConfig(fieldName: string): SchemaField | undefined {
  return cachedConfig?.schema?.felder?.[fieldName];
}

export function getSemanticAliases(term: string): string[] {
  const semantik = cachedConfig?.schema?.semantik as Record<string, string[]> | undefined;
  if (!semantik) return [term];
  
  const lower = term.toLowerCase();
  
  for (const [canonical, aliasArray] of Object.entries(semantik)) {
    const aliases: string[] = Array.isArray(aliasArray) ? aliasArray : [];
    if (canonical === lower || aliases.includes(lower)) {
      return [canonical, ...aliases];
    }
  }
  
  return [term];
}
