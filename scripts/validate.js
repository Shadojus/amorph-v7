#!/usr/bin/env node
/**
 * AMORPH Daten-Validierung
 * 
 * Generiert automatisch Zod-Schemas aus den Blueprint-YAML-Dateien
 * und validiert die JSON-Daten gegen diese Schemas.
 * 
 * Usage:
 *   node scripts/validate.js              # Alle Daten validieren
 *   node scripts/validate.js -s steinpilz # Einzelne Spezies
 *   node scripts/validate.js -p culinary  # Nur eine Perspektive
 *   node scripts/validate.js --list       # Verfügbare Perspektiven
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const BLUEPRINTS_DIR = path.join(ROOT, 'config', 'schema', 'perspektiven', 'blueprints');

// ============================================================================
// MORPH TYPE SCHEMAS
// ============================================================================

const morphSchemas = {
  // Primitives
  text: z.union([z.string(), z.object({ value: z.string() }).passthrough()]),
  number: z.union([z.number(), z.object({ value: z.number() }).passthrough()]),
  boolean: z.union([z.boolean(), z.object({ value: z.boolean() }).passthrough()]),
  tag: z.union([z.string(), z.object({ value: z.string() }).passthrough()]),
  
  // List - sehr flexibel
  list: z.union([
    z.array(z.any()),
    z.object({ items: z.array(z.any()) }).passthrough(),
  ]),
  
  // Links
  link: z.union([
    z.string(),
    z.object({ url: z.string() }).passthrough(),
  ]),
  
  // Image
  image: z.union([
    z.string(),
    z.object({ src: z.string() }).passthrough(),
  ]),
  
  // Currency
  currency: z.union([
    z.number(),
    z.object({ value: z.number() }).passthrough(),
  ]),
  
  // Citation
  citation: z.union([
    z.string(),
    z.object({}).passthrough(),
  ]),
  
  // Range
  range: z.union([
    z.number(),
    z.object({ min: z.number(), max: z.number() }).passthrough(),
    z.object({ value: z.number() }).passthrough(),
  ]),
  
  // Severity
  severity: z.union([
    z.string(),
    z.object({ level: z.string() }).passthrough(),
    z.array(z.object({ level: z.string() }).passthrough()),
  ]),
  
  // Badge
  badge: z.union([
    z.string(),
    z.object({ status: z.string() }).passthrough(),
  ]),
  
  // Dosage
  dosage: z.union([
    z.string(),
    z.object({ unit: z.string() }).passthrough(),
  ]),
  
  // Progress
  progress: z.union([
    z.number(),
    z.object({ value: z.number() }).passthrough(),
  ]),
  
  // Steps
  steps: z.union([
    z.array(z.string()),
    z.array(z.object({ label: z.string() }).passthrough()),
    z.array(z.object({ step: z.number() }).passthrough()),
  ]),
  
  // Gauge
  gauge: z.union([
    z.number(),
    z.object({ value: z.number() }).passthrough(),
  ]),
  
  // Charts
  bar: z.union([
    z.record(z.number()),
    z.array(z.object({ label: z.string(), value: z.number() }).passthrough()),
    z.array(z.object({ name: z.string(), value: z.number() }).passthrough()),
  ]),
  
  stackedbar: z.union([
    z.record(z.record(z.number())),
    z.array(z.any()),
  ]),
  
  groupedbar: z.union([
    z.record(z.record(z.number())),
    z.array(z.any()),
  ]),
  
  pie: z.union([
    z.record(z.number()),
    z.array(z.object({ label: z.string(), value: z.number() }).passthrough()),
    z.array(z.object({ name: z.string(), value: z.number() }).passthrough()),
  ]),
  
  radar: z.union([
    z.record(z.number()),
    z.array(z.object({ axis: z.string(), value: z.number() }).passthrough()),
    z.array(z.object({ label: z.string(), value: z.number() }).passthrough()),
  ]),
  
  sparkline: z.union([
    z.array(z.number()),
    z.object({ data: z.array(z.number()) }).passthrough(),
  ]),
  
  scatterplot: z.array(z.object({ x: z.number(), y: z.number() }).passthrough()),
  boxplot: z.union([z.array(z.number()), z.object({ min: z.number() }).passthrough()]),
  bubble: z.array(z.object({ x: z.number(), y: z.number(), size: z.number() }).passthrough()),
  heatmap: z.union([z.array(z.array(z.number())), z.object({ data: z.array(z.any()) }).passthrough()]),
  treemap: z.union([z.record(z.number()), z.object({ name: z.string() }).passthrough()]),
  sunburst: z.object({ name: z.string() }).passthrough(),
  slopegraph: z.array(z.object({ label: z.string() }).passthrough()),
  lollipop: z.union([z.record(z.number()), z.array(z.any())]),
  dotplot: z.union([z.array(z.number()), z.array(z.any())]),
  
  // Hierarchical & Network
  hierarchy: z.object({ name: z.string() }).passthrough(),
  network: z.union([
    z.object({ nodes: z.array(z.any()), edges: z.array(z.any()) }).passthrough(),
    z.array(z.object({ name: z.string() }).passthrough()),
  ]),
  flow: z.object({ nodes: z.array(z.any()) }).passthrough(),
  
  // Time
  timeline: z.array(z.object({}).passthrough()),
  calendar: z.union([
    z.record(z.any()),
    z.array(z.object({ month: z.number() }).passthrough()),
    z.array(z.object({ date: z.string() }).passthrough()),
  ]),
  lifecycle: z.array(z.object({}).passthrough()),
  
  // Geographic
  map: z.union([
    z.array(z.string()),
    z.array(z.object({}).passthrough()),
    z.object({}).passthrough(),
  ]),
  
  // Statistics
  stats: z.object({}).passthrough(),
  comparison: z.object({}).passthrough(),
  
  // Display
  pictogram: z.union([z.number(), z.object({ value: z.number() }).passthrough()]),
  object: z.object({}).passthrough(),
};

// Fallback für unbekannte Morphs
const anyMorph = z.any();

// ============================================================================
// BLUEPRINT PARSER
// ============================================================================

/**
 * Parst ein Blueprint-YAML und extrahiert Feld -> Morph-Typ Mapping
 * Unterstützt zwei Formate:
 * 1. # morph: type (vor dem Feld)
 * 2. feldname:
 *      # morph: type (innerhalb des Objekts)
 */
function parseBlueprintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const fieldMorphMap = {};
  let currentMorph = null;
  let pendingField = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Format 1: # morph: type (vor dem Feld, nicht eingerückt)
    const morphMatchBefore = line.match(/^#\s*morph:\s*(\w+)/i);
    if (morphMatchBefore) {
      currentMorph = morphMatchBefore[1].toLowerCase();
      continue;
    }
    
    // Format 2: Feldname gefolgt von eingerücktem # morph: type
    const fieldMatch = line.match(/^(\w[\w_]*)\s*:/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      
      // Ignoriere Meta-Felder
      if (['perspective', 'version', 'id', 'name', 'symbol', 'colors'].includes(fieldName)) {
        currentMorph = null;
        continue;
      }
      
      // Wenn wir einen vorherigen Morph haben, weise ihn diesem Feld zu
      if (currentMorph) {
        fieldMorphMap[fieldName] = currentMorph;
        currentMorph = null;
      } else {
        // Merke das Feld für den nächsten eingerückten Morph-Kommentar
        pendingField = fieldName;
      }
      continue;
    }
    
    // Format 2: Eingerückter # morph: type (innerhalb eines Objekts)
    const morphMatchInside = trimmed.match(/^#\s*morph:\s*(\w+)/i);
    if (morphMatchInside && pendingField) {
      fieldMorphMap[pendingField] = morphMatchInside[1].toLowerCase();
      pendingField = null;
      continue;
    }
    
    // Reset wenn neue Sektion (═══ oder ───)
    if (line.match(/^#\s*[═─]/) || trimmed === '') {
      // Nur currentMorph resetten wenn es eine echte neue Sektion ist
      if (line.match(/^#\s*[═─]/)) {
        currentMorph = null;
        pendingField = null;
      }
    }
  }
  
  return fieldMorphMap;
}

/**
 * Lädt alle Blueprints und erstellt Perspektiven-Schemas
 */
function loadAllBlueprints() {
  const schemas = {};
  
  if (!fs.existsSync(BLUEPRINTS_DIR)) {
    console.log('⚠️  Blueprints-Verzeichnis nicht gefunden:', BLUEPRINTS_DIR);
    return schemas;
  }
  
  const files = fs.readdirSync(BLUEPRINTS_DIR).filter(f => f.endsWith('.blueprint.yaml'));
  
  for (const file of files) {
    const perspectiveName = file.replace('.blueprint.yaml', '');
    const filePath = path.join(BLUEPRINTS_DIR, file);
    
    try {
      const fieldMorphMap = parseBlueprintFile(filePath);
      
      // Erstelle Zod-Schema aus dem Mapping
      const schemaShape = {};
      for (const [field, morphType] of Object.entries(fieldMorphMap)) {
        const morphSchema = morphSchemas[morphType] || anyMorph;
        schemaShape[field] = morphSchema.optional();
      }
      
      schemas[perspectiveName] = {
        schema: z.object(schemaShape).passthrough(),
        fields: fieldMorphMap,
        fieldCount: Object.keys(fieldMorphMap).length,
      };
      
    } catch (e) {
      console.error(`❌ Fehler beim Parsen von ${file}:`, e.message);
    }
  }
  
  return schemas;
}

// ============================================================================
// SPECIES INDEX SCHEMA
// ============================================================================

const indexSchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z.string().optional(),
  name: z.union([z.string(), z.object({ common: z.string() }).passthrough()]),
  bild: z.string().optional(),
  image: z.any().optional(),
  perspectives: z.array(z.string()).optional(),
}).passthrough();

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function validateFile(filePath, schema) {
  const errors = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!schema) {
      return { valid: true, errors: [], warnings: [{ message: 'Kein Schema verfügbar' }] };
    }
    
    const result = schema.safeParse(data);
    
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          path: issue.path.join('.') || 'root',
          message: issue.message,
          code: issue.code,
        });
      }
    }
    
    return { valid: errors.length === 0, errors, warnings: [] };
  } catch (e) {
    if (e instanceof SyntaxError) {
      errors.push({ path: '', message: `JSON Syntax Error: ${e.message}` });
    } else {
      errors.push({ path: '', message: e.message });
    }
    return { valid: false, errors, warnings: [] };
  }
}

function validateSpecies(speciesPath, schemas, filterPerspective = null) {
  const results = {
    species: path.basename(speciesPath),
    kingdom: path.basename(path.dirname(speciesPath)),
    files: [],
    totalErrors: 0,
  };
  
  // Index validieren
  const indexPath = path.join(speciesPath, 'index.json');
  if (fs.existsSync(indexPath)) {
    const indexResult = validateFile(indexPath, indexSchema);
    if (!filterPerspective) {
      results.files.push({ file: 'index.json', ...indexResult });
      results.totalErrors += indexResult.errors.length;
    }
  }
  
  // Perspektiven validieren
  const files = fs.readdirSync(speciesPath).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  for (const file of files) {
    const perspective = file.replace('.json', '');
    
    if (filterPerspective && perspective !== filterPerspective) continue;
    
    const filePath = path.join(speciesPath, file);
    const schemaData = schemas[perspective];
    const schema = schemaData?.schema;
    
    const result = validateFile(filePath, schema);
    
    if (!schema) {
      result.warnings.push({ message: `Kein Blueprint für "${perspective}"` });
    }
    
    results.files.push({ file, perspective, ...result, fieldCount: schemaData?.fieldCount || 0 });
    results.totalErrors += result.errors.length;
  }
  
  return results;
}

function validateAll(schemas, filterPerspective = null) {
  const kingdoms = ['fungi', 'animalia', 'bacteria', 'plantae'];
  const allResults = [];
  
  for (const kingdom of kingdoms) {
    const kingdomPath = path.join(DATA_DIR, kingdom);
    if (!fs.existsSync(kingdomPath)) continue;
    
    const species = fs.readdirSync(kingdomPath)
      .filter(d => fs.statSync(path.join(kingdomPath, d)).isDirectory());
    
    for (const speciesName of species) {
      const speciesPath = path.join(kingdomPath, speciesName);
      const result = validateSpecies(speciesPath, schemas, filterPerspective);
      allResults.push(result);
    }
  }
  
  return allResults;
}

function printResults(results, schemas) {
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;
  
  console.log('\n' + '═'.repeat(70));
  console.log('  🔍 AMORPH Daten-Validierung');
  console.log('  📋 Schemas automatisch aus Blueprints generiert');
  console.log('═'.repeat(70) + '\n');
  
  for (const species of results) {
    if (species.files.length === 0) continue;
    
    const hasErrors = species.totalErrors > 0;
    const icon = hasErrors ? '❌' : '✅';
    console.log(`${icon} ${colors.blue(species.kingdom)}/${colors.bold(species.species)}`);
    
    for (const file of species.files) {
      totalFiles++;
      const fileIcon = file.errors.length > 0 ? '  ❌' : '  ✅';
      const fieldInfo = file.fieldCount ? colors.gray(` (${file.fieldCount} Felder)`) : '';
      console.log(`${fileIcon} ${file.file}${fieldInfo}`);
      
      for (const error of file.errors) {
        console.log(colors.red(`      ✗ ${error.path}: ${error.message}`));
      }
      
      for (const warning of file.warnings) {
        console.log(colors.yellow(`      ⚠ ${warning.message}`));
        totalWarnings++;
      }
    }
    
    totalErrors += species.totalErrors;
    console.log('');
  }
  
  console.log('─'.repeat(70));
  console.log(`📊 Gesamt: ${totalFiles} Dateien geprüft`);
  console.log(`   ${totalErrors === 0 ? colors.green('✅') : colors.red('❌')} ${totalErrors} Fehler`);
  console.log(`   ${totalWarnings === 0 ? colors.green('✅') : colors.yellow('⚠️')} ${totalWarnings} Warnungen`);
  
  // Blueprint-Statistik
  const perspectiveCount = Object.keys(schemas).length;
  const totalFields = Object.values(schemas).reduce((sum, s) => sum + s.fieldCount, 0);
  console.log(`\n📐 Schemas: ${perspectiveCount} Perspektiven, ${totalFields} Felder total`);
  console.log('─'.repeat(70) + '\n');
  
  return totalErrors === 0;
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);

// Lade Blueprints
const schemas = loadAllBlueprints();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bold('AMORPH Daten-Validierung')}

Generiert automatisch Zod-Schemas aus den Blueprint-YAML-Dateien.

Usage:
  node scripts/validate.js              Alle Daten validieren
  node scripts/validate.js -s <slug>    Nur eine Spezies validieren
  node scripts/validate.js -p <name>    Nur eine Perspektive validieren
  node scripts/validate.js --list       Verfügbare Perspektiven auflisten
  node scripts/validate.js --stats      Schema-Statistiken anzeigen

Beispiele:
  node scripts/validate.js -s porcini
  node scripts/validate.js -p culinary
`);
  process.exit(0);
}

// Schemas auflisten
if (args.includes('--list') || args.includes('-l')) {
  console.log('\n📋 Verfügbare Perspektiven-Schemas (aus Blueprints):\n');
  for (const [name, data] of Object.entries(schemas)) {
    console.log(`  • ${name} (${data.fieldCount} Felder)`);
  }
  console.log(`\n  📐 Gesamt: ${Object.keys(schemas).length} Perspektiven\n`);
  process.exit(0);
}

// Schema-Statistiken
if (args.includes('--stats')) {
  console.log('\n📊 Schema-Statistiken:\n');
  
  const morphCounts = {};
  for (const [name, data] of Object.entries(schemas)) {
    console.log(`\n${colors.bold(name)} (${data.fieldCount} Felder):`);
    
    for (const [field, morph] of Object.entries(data.fields)) {
      morphCounts[morph] = (morphCounts[morph] || 0) + 1;
    }
    
    // Top 5 Morphs für diese Perspektive
    const perspMorphs = {};
    for (const [_, morph] of Object.entries(data.fields)) {
      perspMorphs[morph] = (perspMorphs[morph] || 0) + 1;
    }
    const top = Object.entries(perspMorphs).sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log(`  Top Morphs: ${top.map(([m, c]) => `${m}(${c})`).join(', ')}`);
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('Morph-Typen Gesamtverteilung:');
  const sorted = Object.entries(morphCounts).sort((a, b) => b[1] - a[1]);
  for (const [morph, count] of sorted) {
    console.log(`  ${morph}: ${count}`);
  }
  console.log('');
  process.exit(0);
}

// Perspektive filtern
let filterPerspective = null;
const perspIdx = args.findIndex(a => a === '--perspective' || a === '-p');
if (perspIdx !== -1 && args[perspIdx + 1]) {
  filterPerspective = args[perspIdx + 1];
  if (!schemas[filterPerspective]) {
    console.log(colors.red(`❌ Unbekannte Perspektive: "${filterPerspective}"`));
    console.log(`Verfügbar: ${Object.keys(schemas).join(', ')}`);
    process.exit(1);
  }
}

// Spezifische Spezies
const speciesIdx = args.findIndex(a => a === '--species' || a === '-s');
if (speciesIdx !== -1 && args[speciesIdx + 1]) {
  const speciesSlug = args[speciesIdx + 1];
  
  for (const kingdom of ['fungi', 'animalia', 'bacteria', 'plantae']) {
    const speciesPath = path.join(DATA_DIR, kingdom, speciesSlug);
    if (fs.existsSync(speciesPath)) {
      const result = validateSpecies(speciesPath, schemas, filterPerspective);
      printResults([result], schemas);
      process.exit(result.totalErrors > 0 ? 1 : 0);
    }
  }
  
  console.log(colors.red(`❌ Spezies "${speciesSlug}" nicht gefunden`));
  process.exit(1);
}

// Alle validieren
const results = validateAll(schemas, filterPerspective);
const success = printResults(results, schemas);
process.exit(success ? 0 : 1);
