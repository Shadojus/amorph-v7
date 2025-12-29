#!/usr/bin/env node
/**
 * AMORPH v7 - CSS Bundler
 * 
 * Kompiliert alle CSS-Dateien in gebundelte Ausgabe-Dateien.
 * Löst @import Statements auf und erstellt optimierte Bundles.
 * 
 * Usage: node scripts/build-css.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STYLES_DIR = join(ROOT, 'public', 'styles');

/**
 * Löst alle @import Statements in einer CSS-Datei rekursiv auf
 */
function resolveImports(cssContent, basePath, processedFiles = new Set()) {
  const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
  
  return cssContent.replace(importRegex, (match, importPath) => {
    // Relativen Pfad auflösen
    const fullPath = resolve(basePath, importPath);
    
    // Zirkuläre Imports verhindern
    if (processedFiles.has(fullPath)) {
      console.log(`  ⚠ Skipping duplicate: ${importPath}`);
      return `/* Already imported: ${importPath} */`;
    }
    
    if (!existsSync(fullPath)) {
      console.warn(`  ⚠ File not found: ${fullPath}`);
      return `/* File not found: ${importPath} */`;
    }
    
    processedFiles.add(fullPath);
    
    // Datei lesen und rekursiv Imports auflösen
    const importedContent = readFileSync(fullPath, 'utf-8');
    const resolvedContent = resolveImports(importedContent, dirname(fullPath), processedFiles);
    
    console.log(`  ✓ Imported: ${importPath}`);
    return `/* === ${importPath} === */\n${resolvedContent}\n`;
  });
}

/**
 * Minifiziert CSS (einfache Version)
 */
function minifyCSS(css) {
  return css
    // Kommentare entfernen (außer wichtige)
    .replace(/\/\*(?!\!)[^*]*\*+([^/*][^*]*\*+)*\//g, '')
    // Whitespace normalisieren
    .replace(/\s+/g, ' ')
    // Whitespace um Selektoren/Eigenschaften
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Führende/nachfolgende Whitespaces
    .trim();
}

/**
 * Bundelt eine CSS-Datei mit allen Imports
 */
function bundleCSS(inputFile, outputFile, minify = false) {
  console.log(`\n📦 Bundling: ${inputFile}`);
  
  const inputPath = join(STYLES_DIR, inputFile);
  
  if (!existsSync(inputPath)) {
    console.error(`  ❌ Input file not found: ${inputPath}`);
    return false;
  }
  
  const content = readFileSync(inputPath, 'utf-8');
  const bundled = resolveImports(content, dirname(inputPath), new Set([inputPath]));
  
  // Optional minifizieren
  const finalContent = minify ? minifyCSS(bundled) : bundled;
  
  // Ausgabe schreiben
  const outputPath = join(STYLES_DIR, outputFile);
  writeFileSync(outputPath, finalContent, 'utf-8');
  
  // Statistiken
  const originalSize = Buffer.byteLength(bundled, 'utf-8');
  const finalSize = Buffer.byteLength(finalContent, 'utf-8');
  const savings = ((1 - finalSize / originalSize) * 100).toFixed(1);
  
  console.log(`  📊 Size: ${(finalSize / 1024).toFixed(1)}KB`);
  if (minify) {
    console.log(`  💾 Saved: ${savings}% (from ${(originalSize / 1024).toFixed(1)}KB)`);
  }
  console.log(`  ✅ Output: ${outputFile}`);
  
  return true;
}

// === MAIN ===
console.log('🎨 AMORPH CSS Bundler\n');
console.log('━'.repeat(50));

// Base CSS bundeln (falls es imports hat)
bundleCSS('base.css', 'base.bundled.css', false);
bundleCSS('base.css', 'base.min.css', true);

// Components CSS bundeln
bundleCSS('components.css', 'components.bundled.css', false);
bundleCSS('components.css', 'components.min.css', true);

// Morphs CSS bundeln (enthält alle morph-spezifischen Styles)
bundleCSS('morphs.css', 'morphs.bundled.css', false);
bundleCSS('morphs.css', 'morphs.min.css', true);

// === ALL-IN-ONE Bundle für maximale Performance ===
console.log('\n📦 Creating ALL-IN-ONE bundle...');
const allInOnePath = join(STYLES_DIR, 'all.min.css');
const baseMin = readFileSync(join(STYLES_DIR, 'base.min.css'), 'utf-8');
const componentsMin = readFileSync(join(STYLES_DIR, 'components.min.css'), 'utf-8');
const morphsMin = readFileSync(join(STYLES_DIR, 'morphs.min.css'), 'utf-8');

const allInOne = `/* AMORPH v7 - All-in-One CSS Bundle */\n${baseMin}\n${componentsMin}\n${morphsMin}`;
writeFileSync(allInOnePath, allInOne, 'utf-8');

const allSize = Buffer.byteLength(allInOne, 'utf-8');
console.log(`  📊 Total size: ${(allSize / 1024).toFixed(1)}KB`);
console.log(`  ✅ Output: all.min.css (1 HTTP Request statt 3!)`);

console.log('\n━'.repeat(50));
console.log('✨ CSS Bundling complete!\n');
console.log('Production Empfehlung:');
console.log('  → Einzeldateien: base.min.css + components.min.css + morphs.min.css');
console.log('  → All-in-One:    all.min.css (beste Performance, 1 Request)');
