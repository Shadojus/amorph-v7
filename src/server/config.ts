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

export type SiteType = 'fungi' | 'phyto' | 'therion';

// Get site type from environment (default: fungi)
export function getSiteType(): SiteType {
  const siteType = process.env.SITE_TYPE?.toLowerCase();
  if (siteType === 'phyto' || siteType === 'therion') {
    return siteType;
  }
  return 'fungi';
}

// Site metadata for each type
export const SITE_META: Record<SiteType, { name: string; color: string; dataFolder: string }> = {
  fungi: { name: 'FUNGINOMI', color: 'funginomi', dataFolder: 'fungi' },
  phyto: { name: 'PHYTONOMI', color: 'phytonomi', dataFolder: 'plantae' },
  therion: { name: 'THERIONOMI', color: 'therionomi', dataFolder: 'animalia' }
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
