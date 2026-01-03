/**
 * AMORPH v7 - Server Config
 * 
 * Lädt YAML-Konfigurationen für SSR.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYAML } from 'yaml';
import type { AppConfig, Perspective, SchemaField } from '../core/types';

// ═══════════════════════════════════════════════════════════════════════════════
// SITE TYPE - Multi-Site Support
// ═══════════════════════════════════════════════════════════════════════════════

// Biology Sites
export type BiologySiteType = 'fungi' | 'phyto' | 'therion';
// Geology Sites
export type GeologySiteType = 'paleo' | 'tekto' | 'mineral';
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
  therion: 'biology',
  // Geology
  paleo: 'geology',
  tekto: 'geology',
  mineral: 'geology',
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
    'fungi', 'phyto', 'therion',
    // Geology
    'paleo', 'tekto', 'mineral',
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
  fungi: { name: 'FUNGINOMI', color: 'funginomi', dataFolder: 'fungi', collection: 'fungi', domain: 'biology' },
  phyto: { name: 'PHYTONOMI', color: 'phytonomi', dataFolder: 'plantae', collection: 'plantae', domain: 'biology' },
  therion: { name: 'THERIONOMI', color: 'drakonomi', dataFolder: 'therion', collection: 'therion', domain: 'biology' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Geology Sites
  // ═══════════════════════════════════════════════════════════════════════════
  paleo: { name: 'PALEONOMI', color: 'paleonomi', dataFolder: 'paleontology', collection: 'paleontology', domain: 'geology' },
  tekto: { name: 'TEKTONOMI', color: 'tektonomi', dataFolder: 'tectonics', collection: 'tectonics', domain: 'geology' },
  mineral: { name: 'MINENOMI', color: 'minenomi', dataFolder: 'mineralogy', collection: 'mineralogy', domain: 'geology' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Biomedical Sites
  // ═══════════════════════════════════════════════════════════════════════════
  bakterio: { name: 'BAKTERIONOMI', color: 'bakterionomi', dataFolder: 'microbiology', collection: 'microbiology', domain: 'biomedical' },
  viro: { name: 'VIRONOMI', color: 'vironomi', dataFolder: 'virology', collection: 'virology', domain: 'biomedical' },
  geno: { name: 'GENONOMI', color: 'genonomi', dataFolder: 'genetics', collection: 'genetics', domain: 'biomedical' },
  anato: { name: 'ANATONOMI', color: 'anatonomi', dataFolder: 'anatomy', collection: 'anatomy', domain: 'biomedical' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Physics & Chemistry Sites
  // ═══════════════════════════════════════════════════════════════════════════
  chemo: { name: 'CHEMONOMI', color: 'chemonomi', dataFolder: 'chemistry', collection: 'chemistry', domain: 'physchem' },
  physi: { name: 'PHYSINOMI', color: 'physinomi', dataFolder: 'physics', collection: 'physics', domain: 'physchem' },
  kosmo: { name: 'KOSMONOMI', color: 'kosmonomi', dataFolder: 'astronomy', collection: 'astronomy', domain: 'physchem' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Technology Sites
  // ═══════════════════════════════════════════════════════════════════════════
  netzo: { name: 'NETZONOMI', color: 'netzonomi', dataFolder: 'informatics', collection: 'informatics', domain: 'technology' },
  cognito: { name: 'COGNITONOMI', color: 'cognitonomi', dataFolder: 'ai', collection: 'ai', domain: 'technology' },
  biotech: { name: 'BIONOMI', color: 'bionomi', dataFolder: 'biotech', collection: 'biotech', domain: 'technology' },
  socio: { name: 'SOCIONOMI', color: 'socionomi', dataFolder: 'sociology', collection: 'sociology', domain: 'technology' }
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
  
  // Perspektiven-Metadaten (Name, Symbol für Anzeige)
  const perspektivenMeta: Record<string, { name: string; symbol: string }> = {
    culinary: { name: 'Kulinarisch', symbol: '🍳' },
    safety: { name: 'Sicherheit', symbol: '⚠️' },
    cultivation: { name: 'Anbau', symbol: '🌱' },
    medicine: { name: 'Medizin', symbol: '💊' },
    chemistry: { name: 'Chemie', symbol: '⚗️' },
    ecology: { name: 'Ökologie', symbol: '🌿' },
    statistics: { name: 'Statistik', symbol: '📊' },
    geography: { name: 'Geografie', symbol: '🗺️' },
    temporal: { name: 'Zeitlich', symbol: '📅' },
    economy: { name: 'Wirtschaft', symbol: '💰' },
    conservation: { name: 'Naturschutz', symbol: '🛡️' },
    culture: { name: 'Kultur', symbol: '🎭' },
    research: { name: 'Forschung', symbol: '🔬' },
    interactions: { name: 'Interaktionen', symbol: '🔗' },
    identification: { name: 'Bestimmung', symbol: '🔍' }
  };
  
  // Load perspectives from index.yaml
  const perspektivenIndex = loadYAML<{ aktiv?: string[] }>('schema/perspektiven/index.yaml');
  if (perspektivenIndex?.aktiv) {
    for (const id of perspektivenIndex.aktiv) {
      const meta = perspektivenMeta[id] || { name: id.charAt(0).toUpperCase() + id.slice(1), symbol: '●' };
      schema.perspektiven![id] = { 
        id,
        name: meta.name,
        symbol: meta.symbol
      };
      schema.reihenfolge!.push(id);
    }
  }
  
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
