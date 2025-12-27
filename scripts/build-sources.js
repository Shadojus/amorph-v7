/**
 * BUILD-SOURCES - Generiert _sources.json aus Copyright-Bilddateinamen
 * 
 * Logik:
 * 1. Findet das Hauptbild (aus index.json "image" Feld)
 * 2. Sucht ein Copyright-Bild mit identischer Dateigröße
 * 3. Extrahiert Metadaten aus dem Dateinamen
 * 4. Schreibt _sources.json
 * 
 * Dateiname-Format: "Copyright © YEAR Author (username).jpg"
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';

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
  sources.image = [copyrightInfo];
  
  // Schreibe _sources.json
  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
  
  return { 
    status: 'success', 
    author: copyrightInfo.author,
    year: copyrightInfo.year
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
        console.log(`  ✓ ${speciesSlug}: © ${result.year} ${result.author}`);
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
  console.log(`📊 Ergebnis: ${success}/${total} erfolgreich`);
  console.log(`   ✓ ${success} _sources.json erstellt`);
  console.log(`   ○ ${skipped} übersprungen`);
  console.log(`   ✗ ${errors} Fehler`);
}

buildSources();
