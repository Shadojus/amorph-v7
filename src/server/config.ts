/**
 * AMORPH v7 - Server Config
 * 
 * Lädt YAML-Konfigurationen für SSR.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYAML } from 'yaml';
import type { AppConfig, Perspective, SchemaField } from '../core/types';

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '../../config');

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════════

let cachedConfig: AppConfig | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// YAML LOADER
// ═══════════════════════════════════════════════════════════════════════════════

function loadYAML<T>(filename: string, required = false): T | null {
  const filepath = join(CONFIG_PATH, filename);
  
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
  
  // Load perspectives
  const perspektivenPath = join(CONFIG_PATH, 'schema/perspektiven');
  if (existsSync(perspektivenPath)) {
    const files = readdirSync(perspektivenPath).filter(f => f.endsWith('.yaml') && f !== 'index.yaml');
    
    for (const file of files) {
      const id = file.replace('.yaml', '');
      const perspektive = loadYAML<Perspective>(`schema/perspektiven/${file}`);
      if (perspektive) {
        schema.perspektiven![id] = { ...perspektive, id };
        schema.reihenfolge!.push(id);
      }
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
