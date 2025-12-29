#!/usr/bin/env node
/**
 * AMORPH v7 - Image Optimization Script
 * 
 * Konvertiert Bilder zu WebP für bessere Performance:
 * - JPG/PNG → WebP mit 80% Qualität
 * - Typische Reduktion: 40-50%
 * 
 * Benötigt: npm install sharp
 * Ausführen: node scripts/optimize-images.js
 */

import { promises as fs } from 'fs';
import { join, extname, basename, dirname } from 'path';

// Check if sharp is installed
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n❌ sharp nicht installiert!');
  console.error('   Installieren mit: npm install sharp\n');
  process.exit(1);
}

const DATA_DIR = './data';
const QUALITY = 80; // WebP Qualität (80 ist guter Kompromiss)
const MAX_WIDTH = 800; // Max Breite für Grid-Bilder
const SKIP_EXISTING = true; // Bereits konvertierte überspringen

// Stats
let stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  failed: 0,
  savedBytes: 0
};

/**
 * Findet alle Bilder rekursiv
 */
async function findImages(dir) {
  const images = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        images.push(...await findImages(fullPath));
      } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
        images.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`⚠️ Fehler bei ${dir}:`, err.message);
  }
  
  return images;
}

/**
 * Konvertiert ein Bild zu WebP
 */
async function convertImage(inputPath) {
  stats.total++;
  
  const webpPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Skip if WebP exists
  if (SKIP_EXISTING) {
    try {
      await fs.access(webpPath);
      stats.skipped++;
      return { skipped: true, path: webpPath };
    } catch {} // File doesn't exist, continue
  }
  
  try {
    const inputStats = await fs.stat(inputPath);
    const inputSize = inputStats.size;
    
    // Convert with sharp
    await sharp(inputPath)
      .resize(MAX_WIDTH, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    const outputStats = await fs.stat(webpPath);
    const outputSize = outputStats.size;
    const saved = inputSize - outputSize;
    
    stats.converted++;
    stats.savedBytes += saved;
    
    const percent = ((saved / inputSize) * 100).toFixed(1);
    console.log(`✅ ${basename(inputPath)} → ${basename(webpPath)} (${formatBytes(inputSize)} → ${formatBytes(outputSize)}, -${percent}%)`);
    
    return { converted: true, path: webpPath, saved };
  } catch (err) {
    stats.failed++;
    console.error(`❌ ${basename(inputPath)}: ${err.message}`);
    return { failed: true, error: err.message };
  }
}

/**
 * Formatiert Bytes lesbar
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Main
 */
async function main() {
  console.log('\n🖼️  AMORPH Image Optimizer');
  console.log('═'.repeat(50));
  console.log(`📁 Scanning: ${DATA_DIR}`);
  console.log(`⚙️  Quality: ${QUALITY}% | Max Width: ${MAX_WIDTH}px`);
  console.log();
  
  const images = await findImages(DATA_DIR);
  
  if (images.length === 0) {
    console.log('Keine Bilder gefunden!');
    return;
  }
  
  console.log(`📷 ${images.length} Bilder gefunden\n`);
  
  // Process all images
  for (const img of images) {
    await convertImage(img);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Zusammenfassung:');
  console.log(`   Total:      ${stats.total}`);
  console.log(`   Konvertiert: ${stats.converted}`);
  console.log(`   Übersprungen: ${stats.skipped}`);
  console.log(`   Fehler:      ${stats.failed}`);
  console.log(`   Gespart:     ${formatBytes(stats.savedBytes)}`);
  console.log();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
