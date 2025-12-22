/**
 * Static Site Generator für AMORPH
 * 
 * Generiert SEO-optimierte HTML-Seiten für jede Spezies
 * 
 * Usage: node scripts/build-pages.js
 * Output: dist/ Ordner mit statischen HTML-Seiten
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DIST_DIR = path.join(ROOT, 'dist');

// Kingdoms to process
const KINGDOMS = ['fungi', 'plantae', 'animalia', 'bacteria'];

/**
 * Load species data from JSON files
 */
async function loadAllSpecies() {
  const species = [];
  
  for (const kingdom of KINGDOMS) {
    const kingdomDir = path.join(DATA_DIR, kingdom);
    const indexPath = path.join(kingdomDir, 'index.json');
    
    if (!fs.existsSync(indexPath)) continue;
    
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    
    for (const item of indexData.species || []) {
      const speciesDir = path.join(kingdomDir, item.slug);
      const speciesPath = path.join(speciesDir, 'index.json');
      
      if (!fs.existsSync(speciesPath)) {
        console.warn(`⚠️  Missing: ${speciesPath}`);
        continue;
      }
      
      const speciesData = JSON.parse(fs.readFileSync(speciesPath, 'utf-8'));
      
      // Load perspective data
      const perspectives = {};
      for (const perspId of item.perspectives || []) {
        const perspPath = path.join(speciesDir, `${perspId}.json`);
        if (fs.existsSync(perspPath)) {
          perspectives[perspId] = JSON.parse(fs.readFileSync(perspPath, 'utf-8'));
        }
      }
      
      species.push({
        ...speciesData,
        kingdom,
        kingdomIcon: indexData.icon,
        kingdomName: indexData.name,
        perspectives,
        availablePerspectives: item.perspectives || []
      });
    }
  }
  
  return species;
}

/**
 * Generate JSON-LD structured data for SEO
 */
function generateJsonLd(species) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": species.name,
    "alternateName": species.scientific_name,
    "description": species.description,
    "url": `https://funginomi.com/${species.slug}`,
    "identifier": species.id
  };
  
  // Add kingdom-specific types
  if (species.kingdom === 'fungi') {
    jsonLd["@type"] = "Thing"; // Schema.org doesn't have Fungus, use Thing
    jsonLd.additionalType = "https://en.wikipedia.org/wiki/Fungus";
  } else if (species.kingdom === 'plantae') {
    jsonLd["@type"] = "Thing";
    jsonLd.additionalType = "https://en.wikipedia.org/wiki/Plant";
  } else if (species.kingdom === 'animalia') {
    jsonLd["@type"] = "Animal";
  }
  
  // Add image if available
  if (species.image) {
    jsonLd.image = species.image;
  }
  
  // Add taxonomy if available
  if (species.taxonomy) {
    jsonLd.isPartOf = {
      "@type": "Thing",
      "name": species.taxonomy.family || species.taxonomy.genus
    };
  }
  
  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Generate meta tags for SEO
 */
function generateMetaTags(species) {
  const title = `${species.name} (${species.scientific_name}) - Funginomi`;
  const description = species.description?.slice(0, 160) || 
    `${species.name} - ${species.scientific_name}. Detaillierte Informationen und Daten.`;
  
  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(species.name)}, ${escapeHtml(species.scientific_name)}, ${species.kingdom}, ${species.availablePerspectives.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="https://funginomi.com/${species.slug}">
    ${species.image ? `<meta property="og:image" content="${species.image}">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://funginomi.com/${species.slug}">
  `.trim();
}

/**
 * Escape HTML entities
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render perspective data as HTML
 */
function renderPerspective(perspId, data, perspectiveConfig) {
  if (!data || Object.keys(data).length === 0) return '';
  
  const perspNames = {
    chemistry: '🧪 Chemie',
    ecology: '🌿 Ökologie',
    medicine: '💊 Medizin',
    safety: '⚠️ Sicherheit',
    culture: '🎭 Kultur',
    identification: '🔍 Bestimmung',
    temporal: '📅 Zeitlich',
    geography: '🌍 Geografie',
    cultivation: '🌱 Anbau',
    culinary: '🍳 Kulinarisch',
    statistics: '📊 Statistik',
    conservation: '🛡️ Schutz'
  };
  
  const name = perspNames[perspId] || perspId;
  
  let html = `<section class="perspective" data-perspective="${perspId}">
    <h2>${name}</h2>
    <dl class="fields">`;
  
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_')) continue; // Skip internal fields
    
    const label = formatFieldLabel(key);
    const rendered = renderValue(value);
    
    html += `
      <div class="field">
        <dt>${escapeHtml(label)}</dt>
        <dd>${rendered}</dd>
      </div>`;
  }
  
  html += `</dl></section>`;
  return html;
}

/**
 * Format field label from snake_case to Title Case
 */
function formatFieldLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Render a value as HTML
 */
function renderValue(value) {
  if (value === null || value === undefined) return '<span class="empty">—</span>';
  
  if (typeof value === 'boolean') {
    return value ? '✓ Ja' : '✗ Nein';
  }
  
  if (typeof value === 'number') {
    return escapeHtml(String(value));
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '<span class="empty">—</span>';
    return `<ul>${value.map(v => `<li>${renderValue(v)}</li>`).join('')}</ul>`;
  }
  
  if (typeof value === 'object') {
    // Handle special object types
    if (value.min !== undefined && value.max !== undefined) {
      return `${value.min}–${value.max}${value.unit ? ' ' + value.unit : ''}`;
    }
    if (value.value !== undefined) {
      return `${value.value}${value.unit ? ' ' + value.unit : ''}`;
    }
    // Generic object
    return `<dl class="nested">${Object.entries(value).map(([k, v]) => 
      `<div><dt>${escapeHtml(formatFieldLabel(k))}</dt><dd>${renderValue(v)}</dd></div>`
    ).join('')}</dl>`;
  }
  
  // String - escape and handle URLs
  const str = String(value);
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return `<a href="${escapeHtml(str)}" rel="noopener">${escapeHtml(str)}</a>`;
  }
  
  return escapeHtml(str);
}

/**
 * Generate full HTML page for a species
 */
function generatePage(species) {
  const metaTags = generateMetaTags(species);
  const jsonLd = generateJsonLd(species);
  
  // Render perspectives
  const perspectivesHtml = species.availablePerspectives
    .map(perspId => renderPerspective(perspId, species.perspectives[perspId]))
    .filter(Boolean)
    .join('\n');
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${metaTags}
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍄</text></svg>">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
${jsonLd}
  </script>
  
  <!-- Styles -->
  <link rel="stylesheet" href="/styles/index.css">
  <link rel="stylesheet" href="/styles/seo-page.css">
</head>
<body>
  <header class="seo-header">
    <nav>
      <a href="/" class="home-link">🍄 Funginomi</a>
      <span class="breadcrumb">
        <a href="/?kingdom=${species.kingdom}">${species.kingdomIcon} ${species.kingdomName}</a>
        <span class="sep">›</span>
        <span class="current">${escapeHtml(species.name)}</span>
      </span>
    </nav>
  </header>

  <main class="seo-content">
    <article class="species-page" itemscope itemtype="https://schema.org/Thing">
      <header class="species-header">
        ${species.image ? `<img src="${species.image}" alt="${escapeHtml(species.name)}" class="species-image" itemprop="image">` : ''}
        <div class="species-titles">
          <h1 itemprop="name">${escapeHtml(species.name)}</h1>
          <p class="scientific-name" itemprop="alternateName"><em>${escapeHtml(species.scientific_name)}</em></p>
          <p class="kingdom-badge">${species.kingdomIcon} ${species.kingdomName}</p>
        </div>
      </header>
      
      <section class="description" itemprop="description">
        <p>${escapeHtml(species.description)}</p>
      </section>
      
      <nav class="perspective-nav">
        <h2>Perspektiven</h2>
        <ul>
          ${species.availablePerspectives.map(p => 
            `<li><a href="#${p}">${p}</a></li>`
          ).join('')}
        </ul>
      </nav>
      
      <div class="perspectives">
        ${perspectivesHtml}
      </div>
    </article>
  </main>

  <footer class="seo-footer">
    <p>
      <a href="/">🍄 Funginomi</a> – 
      <a href="/?search=${encodeURIComponent(species.name)}">Interaktive Ansicht</a>
    </p>
  </footer>

  <!-- Optional: Load interactive app for enhanced experience -->
  <script type="module">
    // Check if user wants interactive mode
    if (window.location.search.includes('interactive=1')) {
      import('/index.js').then(({ amorph }) => {
        amorph({ container: 'main', config: '/config/' });
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(species) {
  const baseUrl = 'https://funginomi.com';
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  for (const item of species) {
    xml += `
  <url>
    <loc>${baseUrl}/${item.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  
  xml += '\n</urlset>';
  return xml;
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: https://funginomi.com/sitemap.xml
`;
}

/**
 * Main build function
 */
async function build() {
  console.log('🔨 Building static pages...\n');
  
  // Clean/create dist directory
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  
  // Load all species
  const species = await loadAllSpecies();
  console.log(`📦 Found ${species.length} species\n`);
  
  // Generate pages
  for (const item of species) {
    const pagePath = path.join(DIST_DIR, item.slug, 'index.html');
    fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    fs.writeFileSync(pagePath, generatePage(item));
    console.log(`  ✅ ${item.slug}/index.html`);
  }
  
  // Generate sitemap
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, generateSitemap(species));
  console.log(`\n📍 sitemap.xml`);
  
  // Generate robots.txt
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  fs.writeFileSync(robotsPath, generateRobotsTxt());
  console.log(`🤖 robots.txt`);
  
  // Copy main index.html
  fs.copyFileSync(
    path.join(ROOT, 'index.html'),
    path.join(DIST_DIR, 'index.html')
  );
  console.log(`📄 index.html (copied)`);
  
  // Copy static assets (styles, config, data)
  const assetDirs = ['styles', 'config', 'data', 'morphs', 'features', 'core', 'util', 'observer'];
  for (const dir of assetDirs) {
    const src = path.join(ROOT, dir);
    const dest = path.join(DIST_DIR, dir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log(`📁 ${dir}/`);
    }
  }
  
  // Copy JS files
  for (const file of ['index.js']) {
    const src = path.join(ROOT, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`📄 ${file}`);
    }
  }
  
  console.log(`\n✨ Build complete! ${species.length} pages generated in dist/`);
}

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run build
build().catch(console.error);
