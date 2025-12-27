/**
 * BUILD-SOURCES - Extrahiert Bild-Copyright für Bifröst
 * 
 * WICHTIG: Field-Experts werden NICHT automatisch generiert!
 * Die Experten-Zuordnung ist SPEZIES-SPEZIFISCH und muss manuell gepflegt werden.
 * 
 * Beispiel: Paul Stamets hat über Hericium erinaceus geforscht,
 * aber vielleicht NIE über Cantharellus cibarius - dann darf er dort nicht stehen!
 * 
 * Dieses Script macht NUR:
 * 1. Findet das Hauptbild (aus index.json "image" Feld)
 * 2. Sucht ein Copyright-Bild mit identischer Dateigröße
 * 3. Extrahiert Metadaten aus dem Dateinamen
 * 4. Validiert mit Zod
 * 5. Schreibt/aktualisiert NUR das "image" Array in _sources.json
 * 
 * Die "fields" bleiben UNBERÜHRT und müssen manuell gepflegt werden!
 * 
 * Dateiname-Format: "Copyright © YEAR Author (username).jpg"
 */

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// ═══════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMAS
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
// COPYRIGHT PARSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parst Copyright-Info aus Dateinamen
 * Formate:
 * - "Copyright © 2010 Martin Livezey (MLivezey).jpg"
 * - "Copyright © 2010 J-Dar.jpg" (nur Username)
 * - "Copyright © 2020 raffib128, cut.jpg" (mit cut Suffix)
 */
function parseCopyrightFilename(filename) {
  let cleanName = filename
    .replace(/, cut\.(\w+)$/, '.$1')
    .replace(/ copy\.(\w+)$/, '.$1');
  
  cleanName = cleanName.replace(/^[^©]+- Copyright /, 'Copyright ');
  
  // Format: "Copyright © YEAR Name (username).ext"
  let match = cleanName.match(/^Copyright © (\d{4}) ([^(]+)\(([^)]+)\)(\d*)\.(\w+)$/);
  
  if (match) {
    const [, year, authorRaw, username] = match;
    const author = authorRaw.trim();
    
    return {
      name: author,
      author: author,
      username: username,
      year: parseInt(year),
      copyright: `© ${year} ${author} (${username})`,
      license: 'CC BY-SA 3.0',
      url: 'https://mushroomobserver.org'
    };
  }
  
  // Format: "Copyright © YEAR Username.ext"
  match = cleanName.match(/^Copyright © (\d{4}) ([^.]+)\.(\w+)$/);
  
  if (match) {
    const [, year, username] = match;
    
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

function processSpecies(kingdomDir, speciesSlug) {
  const speciesDir = path.join(kingdomDir, speciesSlug);
  const indexPath = path.join(speciesDir, 'index.json');
  const sourcesPath = path.join(speciesDir, '_sources.json');
  
  if (!fs.existsSync(indexPath)) {
    return { status: 'skip', reason: 'no index.json' };
  }
  
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const mainImage = indexData.image;
  
  if (!mainImage) {
    return { status: 'skip', reason: 'no main image' };
  }
  
  const copyrightFile = findMatchingCopyrightImage(speciesDir, mainImage);
  
  if (!copyrightFile) {
    return { status: 'skip', reason: 'no matching copyright image' };
  }
  
  const copyrightInfo = parseCopyrightFilename(copyrightFile);
  
  if (!copyrightInfo) {
    return { status: 'error', reason: 'parse failed' };
  }
  
  // Lade existierende _sources.json oder erstelle neue
  let sources = { image: [], fields: {} };
  if (fs.existsSync(sourcesPath)) {
    try {
      sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
    } catch {
      sources = { image: [], fields: {} };
    }
  }
  
  // NUR Image aktualisieren, fields NICHT anfassen!
  sources.image = sources.image || [];
  
  // Prüfe ob Copyright-Info schon existiert
  const existingIndex = sources.image.findIndex(s => s.copyright === copyrightInfo.copyright);
  if (existingIndex === -1) {
    sources.image.push(copyrightInfo);
  }
  
  // Fields bleiben wie sie sind (manuell gepflegt!)
  sources.fields = sources.fields || {};
  
  // Zod Validierung
  const validation = SourcesSchema.safeParse(sources);
  
  if (!validation.success) {
    return { 
      status: 'error', 
      reason: `Zod: ${validation.error.errors.map(e => e.message).join(', ')}`
    };
  }
  
  // Schreibe validierte _sources.json
  fs.writeFileSync(sourcesPath, JSON.stringify(validation.data, null, 2) + '\n');
  
  const fieldsCount = Object.keys(sources.fields).length;
  
  return { 
    status: 'success', 
    author: copyrightInfo.author,
    year: copyrightInfo.year,
    fieldsCount: fieldsCount
  };
}

/**
 * Hauptfunktion
 */
function buildSources() {
  console.log('🌈 BIFRÖST - Building _sources.json (Image Copyright only)');
  console.log('   Field-Experts müssen MANUELL pro Spezies gepflegt werden!\n');
  
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
        const fieldsInfo = result.fieldsCount > 0 ? ` | ${result.fieldsCount} manual experts` : '';
        console.log(`  ✓ ${speciesSlug}: © ${result.year} ${result.author}${fieldsInfo}`);
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
  console.log(`📊 Bifröst Image Sources Complete`);
  console.log(`   ✓ ${success}/${total} Bilder mit Copyright`);
  console.log(`   ○ ${skipped} übersprungen`);
  console.log(`   ✗ ${errors} Fehler`);
  console.log('');
  console.log('💡 Field-Experts manuell in _sources.json pflegen!');
  console.log('   Nur Experten eintragen die wirklich über DIESE Spezies');
  console.log('   geforscht/publiziert haben.');
  console.log('═'.repeat(60));
}

buildSources();
