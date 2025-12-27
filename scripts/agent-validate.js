/**
 * AMORPH Agent Validator
 * 
 * Validiert von Agenten erstellte Daten:
 * - Schema-Validierung gegen Blueprint
 * - Morph-Typ-Prüfung
 * - Experten-Zuordnung
 * - Qualitätsprüfung (keine leeren Felder, Mindestlänge, etc.)
 * 
 * Usage:
 *   node scripts/agent-validate.js steinpilz medicine
 *   node scripts/agent-validate.js --all fungi
 *   node scripts/agent-validate.js --enrich steinpilz medicine
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const BLUEPRINTS_DIR = path.join(ROOT, 'config', 'schema', 'perspektiven', 'blueprints');

// ═══════════════════════════════════════════════════════════════════════════════
// MORPH TYPE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const morphSchemas = {
  text: z.string().min(1),
  tag: z.string().max(30),
  number: z.number(),
  boolean: z.boolean(),
  list: z.array(z.any()).min(1),
  badge: z.object({
    status: z.string(),
    variant: z.string().optional()
  }),
  range: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.string().optional()
  }),
  bar: z.array(z.object({
    label: z.string(),
    value: z.number()
  })),
  radar: z.array(z.object({
    axis: z.string(),
    value: z.number()
  })),
  timeline: z.array(z.object({
    date: z.string(),
    event: z.string()
  })),
  dosage: z.union([
    z.array(z.object({
      amount: z.number(),
      unit: z.string()
    })),
    z.object({
      min: z.number(),
      max: z.number(),
      unit: z.string()
    })
  ]),
  object: z.record(z.any()),
  link: z.string().url(),
  image: z.string()
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLUEPRINT-BASIERTE VALIDIERUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt Blueprint und extrahiert Feld-Morph-Mapping
 */
function loadBlueprintMorphs(perspective) {
  const blueprintPath = path.join(BLUEPRINTS_DIR, `${perspective}.blueprint.yaml`);
  
  if (!fs.existsSync(blueprintPath)) {
    return null;
  }
  
  const content = fs.readFileSync(blueprintPath, 'utf-8');
  const fieldMorphs = {};
  
  const lines = content.split('\n');
  let currentMorph = null;
  
  for (const line of lines) {
    const morphMatch = line.match(/# morph: (\w+)/);
    if (morphMatch) {
      currentMorph = morphMatch[1];
    }
    
    const fieldMatch = line.match(/^(\w+):/);
    if (fieldMatch && currentMorph) {
      fieldMorphs[fieldMatch[1]] = currentMorph;
    }
  }
  
  return fieldMorphs;
}

/**
 * Validiert ein einzelnes Feld gegen seinen Morph-Typ
 */
function validateField(fieldName, value, expectedMorph) {
  const schema = morphSchemas[expectedMorph];
  
  if (!schema) {
    return { valid: true, warning: `Unknown morph type: ${expectedMorph}` };
  }
  
  try {
    // Flexible Validierung - einige Morphs akzeptieren auch einfache Strings
    if (expectedMorph === 'text' || expectedMorph === 'tag') {
      if (typeof value === 'string') {
        schema.parse(value);
        return { valid: true };
      }
    }
    
    if (expectedMorph === 'list' && Array.isArray(value)) {
      schema.parse(value);
      return { valid: true };
    }
    
    if (expectedMorph === 'badge') {
      if (typeof value === 'string') {
        return { valid: true, info: 'Badge as string (will be converted)' };
      }
      schema.parse(value);
      return { valid: true };
    }
    
    schema.parse(value);
    return { valid: true };
    
  } catch (error) {
    return {
      valid: false,
      error: `Field "${fieldName}" expected ${expectedMorph}, got: ${typeof value}`,
      details: error.errors?.[0]?.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HAUPTVALIDIERUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validiert eine Perspektiven-Datei
 */
export function validatePerspectiveFile(kingdom, species, perspective) {
  const filePath = path.join(DATA_DIR, kingdom, species, `${perspective}.json`);
  
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      error: 'File not found',
      filePath
    };
  }
  
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return {
      valid: false,
      error: 'Invalid JSON',
      details: e.message
    };
  }
  
  const fieldMorphs = loadBlueprintMorphs(perspective);
  const errors = [];
  const warnings = [];
  const info = [];
  
  // Prüfe jedes Feld
  for (const [fieldName, value] of Object.entries(data)) {
    // Skip meta fields
    if (fieldName.startsWith('_')) continue;
    
    // Skip null/undefined
    if (value === null || value === undefined) continue;
    
    // Skip leere Strings
    if (value === '') {
      warnings.push(`Empty string for "${fieldName}" - consider removing`);
      continue;
    }
    
    // Prüfe gegen Blueprint-Morph
    if (fieldMorphs && fieldMorphs[fieldName]) {
      const result = validateField(fieldName, value, fieldMorphs[fieldName]);
      if (!result.valid) {
        errors.push(result.error);
      }
      if (result.warning) {
        warnings.push(result.warning);
      }
      if (result.info) {
        info.push(result.info);
      }
    }
  }
  
  // Prüfe Meta-Daten
  if (!data._meta) {
    warnings.push('Missing _meta field');
  } else {
    if (!data._meta.created) warnings.push('Missing _meta.created');
    if (!data._meta.createdBy) warnings.push('Missing _meta.createdBy');
  }
  
  // Prüfe Quellen
  if (!data._source) {
    warnings.push('Missing _source field - no attribution');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    fieldCount: Object.keys(data).filter(k => !k.startsWith('_')).length,
    filePath
  };
}

/**
 * Validiert alle Perspektiven einer Spezies
 */
export function validateSpecies(kingdom, species) {
  const speciesDir = path.join(DATA_DIR, kingdom, species);
  
  if (!fs.existsSync(speciesDir)) {
    return { valid: false, error: 'Species not found' };
  }
  
  const files = fs.readdirSync(speciesDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json');
  
  const results = {};
  let totalErrors = 0;
  
  for (const file of files) {
    const perspective = file.replace('.json', '');
    const result = validatePerspectiveFile(kingdom, species, perspective);
    results[perspective] = result;
    if (!result.valid) totalErrors++;
  }
  
  return {
    valid: totalErrors === 0,
    totalPerspectives: files.length,
    totalErrors,
    perspectives: results
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERTEN-ANREICHERUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Reichert eine Perspektiven-Datei mit Experten-Zuordnungen an
 */
export async function enrichWithExperts(kingdom, species, perspective) {
  const filePath = path.join(DATA_DIR, kingdom, species, `${perspective}.json`);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Import Field-Expert-Mapping
  const { generateFieldExpertMapping } = await import('./lib/field-expert-mapping.js');
  
  const expertMapping = generateFieldExpertMapping(data);
  
  // Update _experts
  data._experts = expertMapping;
  
  // Update _meta
  if (!data._meta) data._meta = {};
  data._meta.enrichedAt = new Date().toISOString();
  data._meta.validated = true;
  
  // Speichern
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  return {
    success: true,
    expertsAdded: Object.keys(expertMapping).length,
    filePath
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
AMORPH Agent Validator

Usage:
  node scripts/agent-validate.js <species> <perspective>
  node scripts/agent-validate.js --species <species>     Validate all perspectives
  node scripts/agent-validate.js --all <kingdom>         Validate all species
  node scripts/agent-validate.js --enrich <species> <perspective>

Examples:
  node scripts/agent-validate.js hericium-erinaceus medicine
  node scripts/agent-validate.js --species steinpilz
  node scripts/agent-validate.js --all fungi
  node scripts/agent-validate.js --enrich steinpilz medicine
    `);
    return;
  }
  
  if (args.includes('--enrich')) {
    const species = args[args.indexOf('--enrich') + 1];
    const perspective = args[args.indexOf('--enrich') + 2];
    
    if (!species || !perspective) {
      console.error('Error: Species and perspective required');
      process.exit(1);
    }
    
    const result = await enrichWithExperts('fungi', species, perspective);
    if (result.success) {
      console.log(`✓ Enriched with ${result.expertsAdded} expert mappings`);
      console.log(`  File: ${result.filePath}`);
    } else {
      console.log(`✗ ${result.error}`);
    }
    return;
  }
  
  if (args.includes('--species')) {
    const species = args[args.indexOf('--species') + 1];
    
    if (!species) {
      console.error('Error: Species required');
      process.exit(1);
    }
    
    const result = validateSpecies('fungi', species);
    console.log(`\n═══ Validation Report: ${species} ═══\n`);
    console.log(`Total Perspectives: ${result.totalPerspectives}`);
    console.log(`Errors: ${result.totalErrors}`);
    console.log(`Status: ${result.valid ? '✓ VALID' : '✗ INVALID'}\n`);
    
    for (const [persp, res] of Object.entries(result.perspectives)) {
      const status = res.valid ? '✓' : '✗';
      console.log(`${status} ${persp} (${res.fieldCount} fields)`);
      for (const err of res.errors || []) {
        console.log(`    ✗ ${err}`);
      }
      for (const warn of res.warnings || []) {
        console.log(`    ⚠ ${warn}`);
      }
    }
    return;
  }
  
  if (args.includes('--all')) {
    const kingdom = args[args.indexOf('--all') + 1] || 'fungi';
    const kingdomDir = path.join(DATA_DIR, kingdom);
    
    const species = fs.readdirSync(kingdomDir)
      .filter(f => fs.statSync(path.join(kingdomDir, f)).isDirectory())
      .filter(f => !f.startsWith('.'));
    
    console.log(`\n═══ Validating ${species.length} species in ${kingdom} ═══\n`);
    
    let totalValid = 0;
    let totalInvalid = 0;
    
    for (const sp of species) {
      const result = validateSpecies(kingdom, sp);
      if (result.valid) {
        totalValid++;
        console.log(`✓ ${sp} (${result.totalPerspectives} perspectives)`);
      } else {
        totalInvalid++;
        console.log(`✗ ${sp} (${result.totalErrors} errors)`);
      }
    }
    
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`Valid: ${totalValid} | Invalid: ${totalInvalid}`);
    console.log(`═══════════════════════════════════════════\n`);
    return;
  }
  
  // Single file validation
  const [species, perspective] = args;
  
  if (!species || !perspective) {
    console.error('Error: Species and perspective required');
    process.exit(1);
  }
  
  const result = validatePerspectiveFile('fungi', species, perspective);
  
  console.log(`\n═══ Validation: ${species}/${perspective} ═══\n`);
  console.log(`Status: ${result.valid ? '✓ VALID' : '✗ INVALID'}`);
  console.log(`Fields: ${result.fieldCount}`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const err of result.errors) {
      console.log(`  ✗ ${err}`);
    }
  }
  
  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warn of result.warnings) {
      console.log(`  ⚠ ${warn}`);
    }
  }
  
  if (result.info.length > 0) {
    console.log('\nInfo:');
    for (const i of result.info) {
      console.log(`  ℹ ${i}`);
    }
  }
}

main().catch(console.error);
