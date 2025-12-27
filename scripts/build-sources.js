/**
 * BUILD-SOURCES - Generiert _sources.json für Bifröst
 * 
 * Logik:
 * 1. Findet das Hauptbild (aus index.json "image" Feld)
 * 2. Sucht ein Copyright-Bild mit identischer Dateigröße
 * 3. Extrahiert Metadaten aus dem Dateinamen
 * 4. Generiert Field-Expert Mappings basierend auf Feldnamen
 * 5. Validiert alles mit Zod
 * 6. Schreibt _sources.json ins Species-Verzeichnis
 * 
 * Dateiname-Format: "Copyright © YEAR Author (username).jpg"
 */

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Strenge Validierung
// ═══════════════════════════════════════════════════════════════════════════════

const ExpertSchema = z.object({
  name: z.string().min(1, 'Expert name required'),
  title: z.string().optional(),
  url: z.string().url().optional().nullable(),
  contact: z.string().optional().nullable()
}).strict();

const ImageSourceSchema = z.object({
  name: z.string().min(1, 'Image source name required'),
  author: z.string().optional(),
  username: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  copyright: z.string().optional(),
  license: z.string().optional(),
  url: z.string().optional(),
  notes: z.string().optional()
}).strict();

const SourcesSchema = z.object({
  image: z.array(ImageSourceSchema).default([]),
  fields: z.record(z.string(), z.array(ExpertSchema)).default({})
}).strict();

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERTEN DATENBANK
// ═══════════════════════════════════════════════════════════════════════════════

const EXPERTS = {
  'paul-stamets': {
    name: 'Paul Stamets',
    title: 'Mykologe & Autor',
    url: 'https://fungi.com',
    contact: 'info@fungi.com'
  },
  'alan-rockefeller': {
    name: 'Alan Rockefeller',
    title: 'Mykologe & Fotograf',
    url: 'https://www.inaturalist.org/people/alan_rockefeller',
    contact: 'alanrockefeller@gmail.com'
  },
  'michael-kuo': {
    name: 'Michael Kuo',
    title: 'Pilz-Experte',
    url: 'https://www.mushroomexpert.com',
    contact: null
  },
  'christopher-hobbs': {
    name: 'Dr. Christopher Hobbs',
    title: 'Herbalist & Mykologe',
    url: 'https://christopherhobbs.com',
    contact: null
  },
  'tradd-cotter': {
    name: 'Tradd Cotter',
    title: 'Pilzzuechter',
    url: 'https://mushroommountain.com',
    contact: null
  },
  'michael-wood': {
    name: 'Michael Wood',
    title: 'MykoWeb',
    url: 'https://www.mykoweb.com',
    contact: 'webmaster@mykoweb.com'
  },
  'nama': {
    name: 'NAMA',
    title: 'North American Mycological Association',
    url: 'https://namyco.org',
    contact: 'COO@namyco.org'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// KEYWORD → EXPERTEN MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const KEYWORD_EXPERTS = {
  // Medizin
  'medicinal': ['paul-stamets', 'christopher-hobbs'],
  'medicine': ['paul-stamets', 'christopher-hobbs'],
  'therapeutic': ['paul-stamets', 'christopher-hobbs'],
  'healing': ['paul-stamets', 'christopher-hobbs'],
  'compound': ['paul-stamets', 'christopher-hobbs'],
  'bioactive': ['paul-stamets'],
  'neuroregeneration': ['paul-stamets'],
  'tcm': ['christopher-hobbs'],
  'traditional': ['christopher-hobbs'],
  
  // Identifikation
  'identification': ['michael-kuo', 'alan-rockefeller', 'michael-wood'],
  'morphology': ['michael-kuo', 'alan-rockefeller'],
  'spore': ['michael-kuo', 'alan-rockefeller'],
  'cap': ['michael-kuo'],
  'stem': ['michael-kuo'],
  'gill': ['michael-kuo'],
  'color': ['michael-kuo', 'alan-rockefeller'],
  'microscopy': ['alan-rockefeller'],
  'key': ['michael-kuo'],
  'lookalike': ['michael-kuo', 'nama'],
  'differentiating': ['michael-kuo'],
  
  // Kultivierung
  'cultivation': ['paul-stamets', 'tradd-cotter'],
  'growing': ['paul-stamets', 'tradd-cotter'],
  'substrate': ['tradd-cotter', 'paul-stamets'],
  'spawn': ['tradd-cotter'],
  'inoculation': ['tradd-cotter'],
  'fruiting': ['tradd-cotter', 'paul-stamets'],
  'harvest': ['tradd-cotter'],
  'yield': ['tradd-cotter'],
  'strain': ['paul-stamets', 'tradd-cotter'],
  
  // Oekologie
  'ecology': ['paul-stamets', 'michael-wood'],
  'habitat': ['michael-wood', 'michael-kuo'],
  'ecosystem': ['paul-stamets'],
  'symbiosis': ['paul-stamets'],
  'mycorrhiza': ['paul-stamets'],
  'forest': ['michael-wood'],
  
  // Chemie
  'chemistry': ['paul-stamets', 'alan-rockefeller'],
  'polysaccharide': ['paul-stamets'],
  'psilocybin': ['alan-rockefeller', 'paul-stamets'],
  'psilocin': ['alan-rockefeller'],
  
  // Psychoaktiv
  'psychoactive': ['alan-rockefeller', 'paul-stamets'],
  'psychedelic': ['alan-rockefeller', 'paul-stamets'],
  
  // Kulinarik
  'culinary': ['michael-wood'],
  'edible': ['michael-kuo', 'michael-wood'],
  'cooking': ['michael-wood'],
  'flavor': ['michael-wood'],
  'taste': ['michael-kuo', 'michael-wood'],
  'gourmet': ['michael-wood'],
  
  // Sicherheit
  'safety': ['michael-kuo', 'nama'],
  'toxicity': ['nama', 'michael-kuo'],
  'poison': ['nama', 'michael-kuo'],
  'toxic': ['nama'],
  'edibility': ['michael-kuo', 'nama'],
  'warning': ['nama'],
  'danger': ['nama'],
  'risk': ['nama']
};

// ═══════════════════════════════════════════════════════════════════════════════
// FELD-EXPERTEN GENERIERUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Berechnet welche Experten zu einem Feldnamen passen.
 */
function getExpertsForField(fieldName) {
  if (!fieldName) return [];
  
  const fieldWords = fieldName
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(/[\s-]+/)
    .filter(w => w.length > 2);
  
  const scores = {};
  
  for (const word of fieldWords) {
    if (KEYWORD_EXPERTS[word]) {
      for (const expertId of KEYWORD_EXPERTS[word]) {
        scores[expertId] = (scores[expertId] || 0) + 2;
      }
    }
    
    for (const [keyword, experts] of Object.entries(KEYWORD_EXPERTS)) {
      if (keyword.includes(word) || word.includes(keyword)) {
        for (const expertId of experts) {
          scores[expertId] = (scores[expertId] || 0) + 1;
        }
      }
    }
  }
  
  return Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([expertId]) => EXPERTS[expertId])
    .filter(Boolean);
}

/**
 * Generiert Feld-Experten fuer alle Felder eines Items.
 */
function generateFieldExperts(speciesDir) {
  const allFields = {};
  
  // Sammle alle Felder aus allen JSONs
  const jsonFiles = fs.readdirSync(speciesDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));
  
  for (const jsonFile of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(speciesDir, jsonFile), 'utf-8'));
    Object.assign(allFields, data);
  }
  
  const result = {};
  
  for (const fieldName of Object.keys(allFields)) {
    if (fieldName.startsWith('_')) continue;
    if (['id', 'slug', 'name', 'bild', 'image', 'description', 'scientific_name'].includes(fieldName)) continue;
    
    const experts = getExpertsForField(fieldName);
    if (experts.length > 0) {
      result[fieldName] = experts;
    }
  }
  
  return result;
}

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Parst Copyright-Info aus Dateinamen
 * Formate:
 * - "Copyright © 2010 Martin Livezey (MLivezey).jpg"
 * - "Copyright © 2010 Martin Livezey (MLivezey)2.jpg" (Variante)
 * - "Copyright © 2010 J-Dar.jpg" (nur Username)
 * - "Copyright © 2020 raffib128, cut.jpg" (mit cut Suffix)
 * - "Copyright © 2009 amadej trnkoczy (amadej), cut.jpg" (Name + Username + cut)
 * - "Species - Copyright © 2020 Author (user).jpg" (mit Spezies-Prefix)
 * - "Copyright © 2018 Alex (Feffy) copy.jpg" (mit copy Suffix)
 */
function parseCopyrightFilename(filename) {
  // Entferne ", cut" oder " copy" Suffix falls vorhanden
  let cleanName = filename
    .replace(/, cut\.(\w+)$/, '.$1')
    .replace(/ copy\.(\w+)$/, '.$1');
  
  // Entferne Spezies-Prefix falls vorhanden (z.B. "Ganoderma curtisii - Copyright ©...")
  cleanName = cleanName.replace(/^[^©]+- Copyright /, 'Copyright ');
  
  // Format 1: "Copyright © YEAR Name (username).ext" oder "Copyright © YEAR Name (username)2.ext"
  let match = cleanName.match(/^Copyright © (\d{4}) ([^(]+)\(([^)]+)\)(\d*)\.(\w+)$/);
  
  if (match) {
    const [, year, authorRaw, username, variant, ext] = match;
    const author = authorRaw.trim();
    
    return {
      name: author,
      author: author,
      username: username,
      year: parseInt(year),
      copyright: `© ${year} ${author} (${username})`,
      license: 'CC BY-SA 3.0',
      url: 'https://mushroomobserver.org',
      notes: variant ? `Variante ${variant}` : undefined
    };
  }
  
  // Format 2: "Copyright © YEAR Username.ext" (nur Username, kein Name in Klammern)
  match = cleanName.match(/^Copyright © (\d{4}) ([^.]+)\.(\w+)$/);
  
  if (match) {
    const [, year, username, ext] = match;
    
    return {
      name: username.trim(),
      author: username.trim(),
      username: username.trim(),
      year: parseInt(year),
      copyright: `© ${year} ${username.trim()}`,
      license: 'CC BY-SA 3.0',
      url: 'https://mushroomobserver.org'
    };
  }
  
  console.warn(`  ⚠ Konnte nicht parsen: ${filename}`);
  return null;
}

/**
 * Findet Copyright-Bild mit gleicher Größe wie Hauptbild
 */
function findMatchingCopyrightImage(speciesDir, mainImageName) {
  const mainImagePath = path.join(speciesDir, mainImageName);
  
  if (!fs.existsSync(mainImagePath)) {
    return null;
  }
  
  const mainSize = fs.statSync(mainImagePath).size;
  
  // Suche alle Copyright-Bilder (starten mit "Copyright ©" oder enthalten "Copyright ©")
  const files = fs.readdirSync(speciesDir);
  const copyrightFiles = files.filter(f => f.includes('Copyright ©') && f.endsWith('.jpg'));
  
  for (const copyrightFile of copyrightFiles) {
    const copyrightPath = path.join(speciesDir, copyrightFile);
    const copyrightSize = fs.statSync(copyrightPath).size;
    
    if (copyrightSize === mainSize) {
      return copyrightFile;
    }
  }
  
  return null;
}

/**
 * Verarbeitet eine Spezies
 */
function processSpecies(kingdomDir, speciesSlug) {
  const speciesDir = path.join(kingdomDir, speciesSlug);
  const indexPath = path.join(speciesDir, 'index.json');
  const sourcesPath = path.join(speciesDir, '_sources.json');
  
  // Lade index.json für Hauptbild
  if (!fs.existsSync(indexPath)) {
    return { status: 'skip', reason: 'no index.json' };
  }
  
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const mainImage = indexData.image;
  
  if (!mainImage) {
    return { status: 'skip', reason: 'no main image' };
  }
  
  // Finde passendes Copyright-Bild
  const copyrightFile = findMatchingCopyrightImage(speciesDir, mainImage);
  
  if (!copyrightFile) {
    return { status: 'skip', reason: 'no matching copyright image' };
  }
  
  // Parse Copyright-Info
  const copyrightInfo = parseCopyrightFilename(copyrightFile);
  
  if (!copyrightInfo) {
    return { status: 'error', reason: 'parse failed' };
  }
  
  // Erstelle/Update _sources.json
  let sources = {};
  if (fs.existsSync(sourcesPath)) {
    sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
  }
  
  // Image sources
  sources.image = sources.image || [];
  
  // Prüfe ob Copyright-Info schon existiert
  const existingImageSource = sources.image.find(s => s.copyright === copyrightInfo.copyright);
  if (!existingImageSource) {
    sources.image.push(copyrightInfo);
  }
  
  // Field-Expert Mappings generieren
  const generatedFields = generateFieldExperts(speciesDir);
  sources.fields = sources.fields || {};
  
  // Merge: Existierende behalten, neue hinzufügen
  let newFieldsCount = 0;
  for (const [fieldName, experts] of Object.entries(generatedFields)) {
    if (!sources.fields[fieldName]) {
      sources.fields[fieldName] = experts;
      newFieldsCount++;
    }
  }
  
  // Zod Validierung
  const validation = SourcesSchema.safeParse(sources);
  
  if (!validation.success) {
    return { 
      status: 'error', 
      reason: `Zod validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`
    };
  }
  
  // Schreibe validierte _sources.json
  fs.writeFileSync(sourcesPath, JSON.stringify(validation.data, null, 2) + '\n');
  
  return { 
    status: 'success', 
    author: copyrightInfo.author,
    year: copyrightInfo.year,
    fieldsCount: Object.keys(sources.fields).length,
    newFields: newFieldsCount
  };
}

/**
 * Hauptfunktion
 */
function buildSources() {
  console.log('🌈 BIFRÖST - Building _sources.json from copyright images...\n');
  
  const kingdoms = fs.readdirSync(DATA_DIR).filter(f => {
    const stat = fs.statSync(path.join(DATA_DIR, f));
    return stat.isDirectory() && !f.startsWith('.');
  });
  
  let total = 0;
  let success = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const kingdom of kingdoms) {
    const kingdomDir = path.join(DATA_DIR, kingdom);
    console.log(`📁 ${kingdom}/`);
    
    const species = fs.readdirSync(kingdomDir).filter(f => {
      const stat = fs.statSync(path.join(kingdomDir, f));
      return stat.isDirectory() && !f.startsWith('.');
    });
    
    for (const speciesSlug of species) {
      total++;
      const result = processSpecies(kingdomDir, speciesSlug);
      
      if (result.status === 'success') {
        const fieldsInfo = result.newFields > 0 ? ` (+${result.newFields} fields)` : '';
        console.log(`  ✓ ${speciesSlug}: © ${result.year} ${result.author} | ${result.fieldsCount} fields${fieldsInfo}`);
        success++;
      } else if (result.status === 'skip') {
        console.log(`  ○ ${speciesSlug}: ${result.reason}`);
        skipped++;
      } else {
        console.log(`  ✗ ${speciesSlug}: ${result.reason}`);
        errors++;
      }
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Bifröst _sources.json Build Complete`);
  console.log(`   ✓ ${success}/${total} erfolgreich (Zod validiert)`);
  console.log(`   ○ ${skipped} übersprungen`);
  console.log(`   ✗ ${errors} Fehler`);
  console.log('═'.repeat(60));
}

buildSources();
