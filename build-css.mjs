#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AMORPH v7 - CSS BUILD SYSTEM
 * Single Source of Truth CSS Processing
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Verarbeitet CSS-Dateien mit @import-Anweisungen und erstellt:
 * - .bundled.css (Alle Imports aufgelöst)
 * - .min.css (Minifizierte Version)
 * 
 * WARUM NOTWENDIG?
 * ────────────────────────────────────────────────────────────────────────────
 * Browser unterstützen @import nur begrenzt und synchron.
 * Für Production brauchen wir eine flache CSS-Datei ohne Imports.
 * 
 * SINGLE SOURCE OF TRUTH:
 * ────────────────────────────────────────────────────────────────────────────
 * _aurora-colors.css → Alle Farbdefinitionen
 * base.css → @import '_aurora-colors.css'
 * morphs/_variables.css → @import '../_aurora-colors.css'
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STYLES_DIR = path.join(__dirname, '..', 'public', 'styles');

/**
 * Löst @import-Anweisungen rekursiv auf
 * @param {string} cssContent - CSS-Inhalt mit @import-Anweisungen
 * @param {string} basePath - Basisverzeichnis für relative Imports
 * @returns {Promise<string>} - CSS mit aufgelösten Imports
 */
async function resolveImports(cssContent, basePath) {
  // Regex für @import-Anweisungen: @import 'file.css'; oder @import "file.css";
  const importRegex = /@import\s+['"](.*?)['"];?/g;
  let resolvedContent = cssContent;
  let match;
  
  // Alle @import-Anweisungen finden
  const imports = [];
  while ((match = importRegex.exec(cssContent)) !== null) {
    imports.push({
      fullMatch: match[0],
      filePath: match[1]
    });
  }
  
  // Imports von oben nach unten auflösen (um Reihenfolge zu erhalten)
  for (const importInfo of imports) {
    const importPath = path.resolve(basePath, importInfo.filePath);
    
    try {
      // Import-Datei laden
      const importedContent = await fs.readFile(importPath, 'utf-8');
      
      // Rekursiv weitere Imports in der importierten Datei auflösen
      const importBasePath = path.dirname(importPath);
      const resolvedImportContent = await resolveImports(importedContent, importBasePath);
      
      // @import-Anweisung durch Dateiinhalt ersetzen
      resolvedContent = resolvedContent.replace(
        importInfo.fullMatch,
        `/* ══════ Imported from ${importInfo.filePath} ══════ */\n${resolvedImportContent}\n/* ══════ End Import ${importInfo.filePath} ══════ */`
      );
      
      console.log(`✓ Resolved import: ${importInfo.filePath}`);
    } catch (error) {
      console.error(`✗ Failed to resolve import: ${importInfo.filePath}`, error.message);
      // Import-Anweisung als Kommentar belassen
      resolvedContent = resolvedContent.replace(
        importInfo.fullMatch,
        `/* FAILED IMPORT: ${importInfo.filePath} - ${error.message} */`
      );
    }
  }
  
  return resolvedContent;
}

/**
 * Minifiziert CSS (einfache Implementierung)
 * @param {string} css - CSS-Inhalt
 * @returns {string} - Minifizierter CSS
 */
function minifyCSS(css) {
  return css
    // Kommentare entfernen (außer /*! wichtige Kommentare */)
    .replace(/\/\*(?!\!)(.*?)\*\//gs, '')
    // Mehrfache Leerzeichen durch einzelne ersetzen
    .replace(/\s+/g, ' ')
    // Leerzeichen um Zeichen entfernen: { } ; : , 
    .replace(/\s*([{}:;,])\s*/g, '$1')
    // Leerzeichen am Anfang/Ende entfernen
    .trim();
}

/**
 * Verarbeitet eine CSS-Datei und erstellt .bundled und .min Versionen
 * @param {string} fileName - Name der CSS-Datei (z.B. 'base.css')
 */
async function processCSSFile(fileName) {
  const inputPath = path.join(STYLES_DIR, fileName);
  const baseName = path.basename(fileName, '.css');
  const bundledPath = path.join(STYLES_DIR, `${baseName}.bundled.css`);
  const minPath = path.join(STYLES_DIR, `${baseName}.min.css`);
  
  try {
    console.log(`\n🔄 Processing ${fileName}...`);
    
    // Original CSS laden
    const originalCSS = await fs.readFile(inputPath, 'utf-8');
    
    // Imports auflösen
    const bundledCSS = await resolveImports(originalCSS, STYLES_DIR);
    
    // Minifizierte Version erstellen
    const minifiedCSS = minifyCSS(bundledCSS);
    
    // Header für gebündelte Datei
    const bundledHeader = `/* ═══════════════════════════════════════════════════════════════════════════════
   AMORPH v7 - ${baseName.toUpperCase()} STYLES (BUNDLED)
   Auto-generated from ${fileName} with resolved imports
   DO NOT EDIT - Changes will be overwritten on build
   ═══════════════════════════════════════════════════════════════════════════════ */

`;
    
    // Dateien schreiben
    await fs.writeFile(bundledPath, bundledHeader + bundledCSS);
    await fs.writeFile(minPath, minifiedCSS);
    
    console.log(`✅ Created ${baseName}.bundled.css (${bundledCSS.length} chars)`);
    console.log(`✅ Created ${baseName}.min.css (${minifiedCSS.length} chars)`);
    
    return {
      original: originalCSS.length,
      bundled: bundledCSS.length,
      minified: minifiedCSS.length
    };
    
  } catch (error) {
    console.error(`❌ Failed to process ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Hauptfunktion - Verarbeitet alle CSS-Dateien
 */
async function buildCSS() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🔨 AMORPH v7 CSS BUILD - Single Source of Truth Processing');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  const results = {};
  
  try {
    // Liste der zu verarbeitenden CSS-Dateien
    const cssFiles = [
      'base.css',
      'components.css',
      'morphs.css'
    ];
    
    // Verarbeite jede CSS-Datei
    for (const fileName of cssFiles) {
      const filePath = path.join(STYLES_DIR, fileName);
      
      // Prüfen ob Datei existiert
      try {
        await fs.access(filePath);
        results[fileName] = await processCSSFile(fileName);
      } catch (error) {
        console.log(`⚠️  Skipping ${fileName} (not found)`);
      }
    }
    
    // Zusammenfassung
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 BUILD SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    let totalOriginal = 0;
    let totalBundled = 0;
    let totalMinified = 0;
    
    for (const [fileName, stats] of Object.entries(results)) {
      totalOriginal += stats.original;
      totalBundled += stats.bundled;
      totalMinified += stats.minified;
      
      const bundledRatio = ((stats.bundled / stats.original) * 100).toFixed(1);
      const minRatio = ((stats.minified / stats.original) * 100).toFixed(1);
      
      console.log(`${fileName}:`);
      console.log(`  Original: ${stats.original} chars`);
      console.log(`  Bundled:  ${stats.bundled} chars (${bundledRatio}%)`);
      console.log(`  Minified: ${stats.minified} chars (${minRatio}%)`);
      console.log('');
    }
    
    console.log(`🎯 TOTAL: ${totalOriginal} → ${totalBundled} → ${totalMinified} chars`);
    console.log(`📦 Bundled: ${((totalBundled / totalOriginal) * 100).toFixed(1)}% of original`);
    console.log(`🗜️  Minified: ${((totalMinified / totalOriginal) * 100).toFixed(1)}% of original`);
    
    console.log('\n✨ CSS build complete! Aurora colors are now centralized.');
    
  } catch (error) {
    console.error('❌ CSS Build failed:', error);
    process.exit(1);
  }
}

// Nur ausführen wenn direkt aufgerufen
if (import.meta.url === `file://${process.argv[1]}`) {
  buildCSS();
}

export { buildCSS, processCSSFile, resolveImports, minifyCSS };