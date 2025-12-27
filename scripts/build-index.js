/**
 * AMORPH Universe Index Generator v2.0
 * 
 * Intelligent extraction of high-value data from perspectives
 * Optimized for SEO, user engagement, and discoverability
 * 
 * Usage:
 *   node scripts/build-index.js
 *   npm run build:index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'universe-index.json');

// ═══════════════════════════════════════════════════════════════════════════════
// KINGDOM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const KINGDOMS = [
  { 
    slug: 'fungi', 
    name: 'Fungi', 
    icon: '🍄',
    tagline: 'Das verborgene Königreich',
    color: '#8B4513'
  },
  { 
    slug: 'plantae', 
    name: 'Plantae', 
    icon: '🌿',
    tagline: 'Die grüne Apotheke der Natur',
    color: '#228B22'
  },
  { 
    slug: 'animalia', 
    name: 'Animalia', 
    icon: '🦋',
    tagline: 'Fauna in all ihrer Vielfalt',
    color: '#4169E1'
  },
  { 
    slug: 'bacteria', 
    name: 'Bacteria', 
    icon: '🦠',
    tagline: 'Mikroskopische Lebensformen',
    color: '#9932CC'
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD EXTRACTION CONFIGURATION
// High-value fields to extract from each perspective
// ═══════════════════════════════════════════════════════════════════════════════

const EXTRACTION_CONFIG = {
  // IDENTIFICATION - Taxonomie & Erkennung
  identification: {
    priority: 1,
    fields: {
      common_names: { type: 'keywords', weight: 10 },
      synonyms: { type: 'keywords', weight: 8 },
      taxonomy_family: { type: 'category', label: 'Familie' },
      taxonomy_order: { type: 'category', label: 'Ordnung' },
      size_range: { type: 'quickfact', icon: '📏', label: 'Größe' },
      color_primary: { type: 'quickfact', icon: '🎨', label: 'Farbe' },
      smell_description: { type: 'feature', label: 'Geruch' },
      taste_description: { type: 'feature', label: 'Geschmack' },
    }
  },
  
  // SAFETY - Kritische Sicherheitsdaten (höchste Priorität für Engagement)
  safety: {
    priority: 0,
    fields: {
      edibility_status: { type: 'badge', icon: '🍴', label: 'Essbarkeit', highlight: true },
      toxicity_level: { type: 'badge', icon: '☠️', label: 'Giftigkeit', highlight: true },
      poisonous_compounds: { type: 'alert', label: 'Giftstoffe' },
      lookalikes: { type: 'alert', label: 'Verwechslungsgefahren' },
      warning_notes: { type: 'alert', label: 'Warnhinweise' },
      first_aid: { type: 'feature', label: 'Erste Hilfe' },
    }
  },
  
  // ECOLOGY - Lebensraum & Ökologie
  ecology: {
    priority: 2,
    fields: {
      habitat_types: { type: 'quickfact', icon: '🏔️', label: 'Habitat' },
      ecosystem_type: { type: 'quickfact', icon: '🌲', label: 'Ökosystem' },
      substrate_type_primary: { type: 'quickfact', icon: '🌳', label: 'Substrat' },
      fruiting_season_start: { type: 'season', label: 'Saison Start' },
      fruiting_season_end: { type: 'season', label: 'Saison Ende' },
      native_range: { type: 'quickfact', icon: '🌍', label: 'Verbreitung' },
      iucn_global_status: { type: 'badge', icon: '🛡️', label: 'Schutzstatus', highlight: true },
      conservation_notes: { type: 'feature', label: 'Schutz' },
    }
  },
  
  // MEDICINE - Medizinische Eigenschaften (High Engagement)
  medicine: {
    priority: 1,
    fields: {
      primary_medicinal_uses: { type: 'highlights', icon: '💊', label: 'Heilwirkung', highlight: true },
      active_compounds: { type: 'feature', label: 'Wirkstoffe' },
      traditional_medicine_systems: { type: 'feature', label: 'Traditionelle Medizin' },
      clinical_evidence_level: { type: 'badge', icon: '🔬', label: 'Evidenz' },
      research_areas: { type: 'keywords', weight: 6 },
      medicinal_status: { type: 'badge', icon: '⚕️', label: 'Status' },
    }
  },
  
  // CULINARY - Kulinarik (Engagement für Foodies)
  culinary: {
    priority: 2,
    fields: {
      culinary_rating: { type: 'badge', icon: '⭐', label: 'Bewertung' },
      flavor_profile: { type: 'quickfact', icon: '👅', label: 'Geschmack' },
      texture: { type: 'feature', label: 'Textur' },
      cooking_methods: { type: 'feature', label: 'Zubereitung' },
      best_pairings: { type: 'feature', label: 'Kombinationen' },
      nutritional_highlights: { type: 'feature', label: 'Nährstoffe' },
    }
  },
  
  // CHEMISTRY - Bioaktive Verbindungen
  chemistry: {
    priority: 3,
    fields: {
      primary_compounds: { type: 'keywords', weight: 5 },
      bioactive_classes: { type: 'category', label: 'Wirkstoffklassen' },
      notable_effects: { type: 'highlights', label: 'Besondere Wirkungen' },
    }
  },
  
  // CULTIVATION - Anbau
  cultivation: {
    priority: 3,
    fields: {
      difficulty_level: { type: 'badge', icon: '🌱', label: 'Schwierigkeit' },
      substrate_options: { type: 'feature', label: 'Substrate' },
      yield_potential: { type: 'quickfact', icon: '📊', label: 'Ertrag' },
      time_to_harvest: { type: 'quickfact', icon: '⏱️', label: 'Erntezeit' },
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MONTH NAMES FOR SEASON DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

const MONTHS = ['', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// ═══════════════════════════════════════════════════════════════════════════════
// DATA EXTRACTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract high-value data from all perspectives of a species
 */
function extractSpeciesData(speciesPath, perspectiveFiles) {
  const extracted = {
    quickFacts: [],
    highlights: [],
    keywords: new Set(),
    categories: new Set(),
    badges: [],
    alerts: [],
    features: [],
    seasonStart: null,
    seasonEnd: null,
    edibility: null,
    toxicity: null,
    medicinalUses: [],
    schutzstatus: null,
  };
  
  // Load and process each perspective
  for (const perspId of perspectiveFiles) {
    const perspPath = path.join(speciesPath, `${perspId}.json`);
    if (!fs.existsSync(perspPath)) continue;
    
    try {
      const perspData = JSON.parse(fs.readFileSync(perspPath, 'utf-8'));
      const config = EXTRACTION_CONFIG[perspId];
      
      if (config) {
        extractFromPerspective(perspData, config, extracted);
      }
      
      // Always extract general searchable terms
      extractGeneralTerms(perspData, extracted);
      
    } catch (e) {
      // Silent fail for individual perspectives
    }
  }
  
  return extracted;
}

/**
 * Extract data based on perspective configuration
 */
function extractFromPerspective(data, config, extracted) {
  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    const value = findFieldValue(data, fieldName);
    if (value === null || value === undefined) continue;
    
    switch (fieldConfig.type) {
      case 'quickfact':
        const qfValue = formatQuickFactValue(value);
        if (qfValue) {
          extracted.quickFacts.push({
            icon: fieldConfig.icon,
            label: fieldConfig.label,
            value: qfValue,
            priority: config.priority
          });
        }
        break;
        
      case 'badge':
        const badgeValue = formatBadgeValue(value);
        if (badgeValue) {
          extracted.badges.push({
            icon: fieldConfig.icon,
            label: fieldConfig.label,
            ...badgeValue,
            highlight: fieldConfig.highlight || false,
            priority: config.priority
          });
          
          // Special handling for key fields
          if (fieldName.includes('edibility')) {
            extracted.edibility = badgeValue;
          }
          if (fieldName.includes('toxicity')) {
            extracted.toxicity = badgeValue;
          }
          if (fieldName.includes('iucn') || fieldName.includes('conservation')) {
            extracted.schutzstatus = badgeValue;
          }
        }
        break;
        
      case 'highlights':
        const highlights = extractHighlights(value);
        extracted.highlights.push(...highlights.slice(0, 3));
        break;
        
      case 'keywords':
        const keywords = extractKeywords(value);
        keywords.forEach(k => extracted.keywords.add(k));
        break;
        
      case 'category':
        if (typeof value === 'string' && value.length > 0) {
          extracted.categories.add(value);
        }
        break;
        
      case 'alert':
        const alertValue = formatAlertValue(value);
        if (alertValue) {
          extracted.alerts.push({
            label: fieldConfig.label,
            value: alertValue
          });
        }
        break;
        
      case 'feature':
        const featureValue = formatFeatureValue(value);
        if (featureValue) {
          extracted.features.push({
            label: fieldConfig.label,
            value: featureValue
          });
        }
        break;
        
      case 'season':
        if (typeof value === 'number' && value >= 1 && value <= 12) {
          if (fieldName.includes('start')) {
            extracted.seasonStart = value;
          } else if (fieldName.includes('end')) {
            extracted.seasonEnd = value;
          }
        }
        break;
    }
  }
  
  // Extract medicinal uses specifically
  const medUses = findFieldValue(data, 'primary_medicinal_uses') || 
                  findFieldValue(data, 'medicinal_uses') ||
                  findFieldValue(data, 'therapeutic_uses');
  if (Array.isArray(medUses)) {
    extracted.medicinalUses.push(...medUses.slice(0, 5));
  }
}

/**
 * Find field value with flexible matching (handles snake_case, camelCase)
 */
function findFieldValue(data, fieldName) {
  // Direct match
  if (data[fieldName] !== undefined) return data[fieldName];
  
  // Try camelCase
  const camelCase = fieldName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (data[camelCase] !== undefined) return data[camelCase];
  
  // Try without underscores
  const noUnderscore = fieldName.replace(/_/g, '');
  for (const key of Object.keys(data)) {
    if (key.toLowerCase().replace(/_/g, '') === noUnderscore) {
      return data[key];
    }
  }
  
  return null;
}

/**
 * Format value for quick facts display
 */
function formatQuickFactValue(value) {
  if (value === null || value === undefined) return null;
  
  // Range object
  if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
    const unit = value.unit || '';
    return `${value.min}–${value.max} ${unit}`.trim();
  }
  
  // Badge object
  if (typeof value === 'object' && value.status) {
    return value.status;
  }
  
  // Array
  if (Array.isArray(value)) {
    return value.slice(0, 3).join(', ');
  }
  
  // String
  if (typeof value === 'string') {
    return value.length > 50 ? value.slice(0, 47) + '...' : value;
  }
  
  return String(value);
}

/**
 * Format badge values (status/variant objects)
 */
function formatBadgeValue(value) {
  if (typeof value === 'object' && value.status) {
    return {
      status: value.status,
      variant: value.variant || 'info'
    };
  }
  
  if (typeof value === 'string') {
    // Determine variant from value
    const lowerValue = value.toLowerCase();
    let variant = 'info';
    
    if (lowerValue.includes('giftig') || lowerValue.includes('toxic') || lowerValue.includes('deadly')) {
      variant = 'danger';
    } else if (lowerValue.includes('essbar') || lowerValue.includes('edible') || lowerValue.includes('safe')) {
      variant = 'success';
    } else if (lowerValue.includes('gefährdet') || lowerValue.includes('caution') || lowerValue.includes('warning')) {
      variant = 'warning';
    }
    
    return { status: value, variant };
  }
  
  return null;
}

/**
 * Extract highlights from array or object
 */
function extractHighlights(value) {
  if (Array.isArray(value)) {
    return value.filter(v => typeof v === 'string').slice(0, 5);
  }
  
  if (typeof value === 'object') {
    // Extract from compound objects
    return Object.values(value)
      .filter(v => typeof v === 'string' || (typeof v === 'object' && v.name))
      .map(v => typeof v === 'string' ? v : v.name)
      .slice(0, 5);
  }
  
  if (typeof value === 'string') {
    return [value];
  }
  
  return [];
}

/**
 * Extract keywords for search
 */
function extractKeywords(value) {
  const keywords = [];
  
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        keywords.push(item.toLowerCase());
      } else if (typeof item === 'object' && item.name) {
        keywords.push(item.name.toLowerCase());
      }
    }
  } else if (typeof value === 'string') {
    keywords.push(value.toLowerCase());
  }
  
  return keywords;
}

/**
 * Format alert values
 */
function formatAlertValue(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 3).map(v => typeof v === 'string' ? v : v.name || v.species || JSON.stringify(v)).join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

/**
 * Format feature values
 */
function formatFeatureValue(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 5).map(v => {
      if (typeof v === 'string') return v;
      if (typeof v === 'object') return v.name || v.method || v.system || JSON.stringify(v);
      return String(v);
    });
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return value.name || value.description || JSON.stringify(value);
  }
  return null;
}

/**
 * Extract general searchable terms from any data
 */
function extractGeneralTerms(data, extracted) {
  const searchableFields = [
    'common_names', 'synonyms', 'names', 'aliases',
    'tags', 'keywords', 'categories',
    'family', 'genus', 'order', 'class',
    'habitat', 'substrate', 'ecosystem'
  ];
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Check if this is a searchable field
    if (searchableFields.some(f => lowerKey.includes(f))) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (typeof v === 'string' && v.length > 2) {
            extracted.keywords.add(v.toLowerCase());
          }
        });
      } else if (typeof value === 'string' && value.length > 2 && value.length < 100) {
        extracted.keywords.add(value.toLowerCase());
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAGLINE & DESCRIPTION GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate an engaging tagline based on extracted data
 */
function generateTagline(extracted, baseData) {
  const parts = [];
  
  // Edibility/Toxicity first (most important for engagement)
  if (extracted.edibility) {
    if (extracted.edibility.variant === 'success') {
      parts.push('Essbar');
    } else if (extracted.edibility.variant === 'danger') {
      parts.push('⚠️ Giftig');
    }
  }
  
  // Medicinal uses
  if (extracted.medicinalUses.length > 0) {
    parts.push(extracted.medicinalUses[0]);
  }
  
  // Conservation status
  if (extracted.schutzstatus && extracted.schutzstatus.variant === 'warning') {
    parts.push('Geschützt');
  }
  
  // Season
  if (extracted.seasonStart && extracted.seasonEnd) {
    parts.push(`${MONTHS[extracted.seasonStart]}–${MONTHS[extracted.seasonEnd]}`);
  }
  
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * Generate SEO-optimized description
 */
function generateSeoDescription(extracted, baseData) {
  const parts = [];
  
  // Scientific name
  if (baseData.scientific_name) {
    parts.push(`${baseData.name} (${baseData.scientific_name})`);
  } else {
    parts.push(baseData.name);
  }
  
  // Key attributes
  if (extracted.edibility?.status) {
    parts.push(extracted.edibility.status);
  }
  
  // Medicinal
  if (extracted.medicinalUses.length > 0) {
    parts.push(`Heilwirkung: ${extracted.medicinalUses.slice(0, 2).join(', ')}`);
  }
  
  // Habitat
  const habitatFact = extracted.quickFacts.find(f => f.label === 'Habitat');
  if (habitatFact) {
    parts.push(`Vorkommen: ${habitatFact.value}`);
  }
  
  return parts.join('. ').slice(0, 160);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN BUILD FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

function buildIndex() {
  console.log('🔨 Building Universe Index v2.0...\n');
  console.log('📊 Intelligent data extraction for SEO & Engagement\n');
  
  const index = {
    version: '2.0',
    generated: new Date().toISOString(),
    total: 0,
    kingdoms: {},
    species: [],
    featured: [],
  };
  
  // Initialize kingdoms
  for (const k of KINGDOMS) {
    index.kingdoms[k.slug] = {
      name: k.name,
      icon: k.icon,
      tagline: k.tagline,
      color: k.color,
      count: 0,
      featured: [],
    };
  }
  
  // Process all species
  for (const kingdom of KINGDOMS) {
    const kingdomPath = path.join(DATA_DIR, kingdom.slug);
    
    if (!fs.existsSync(kingdomPath)) {
      console.log(`  ⚠️  ${kingdom.slug}/ nicht gefunden, überspringe...`);
      continue;
    }
    
    const speciesDirs = fs.readdirSync(kingdomPath)
      .filter(d => {
        const fullPath = path.join(kingdomPath, d);
        return fs.statSync(fullPath).isDirectory();
      });
    
    for (const speciesSlug of speciesDirs) {
      const speciesPath = path.join(kingdomPath, speciesSlug);
      const indexPath = path.join(speciesPath, 'index.json');
      
      if (!fs.existsSync(indexPath)) {
        console.log(`  ⚠️  ${kingdom.slug}/${speciesSlug}/index.json fehlt`);
        continue;
      }
      
      try {
        const baseData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        
        // Get perspective files
        const perspectiveFiles = fs.readdirSync(speciesPath)
          .filter(f => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))
          .map(f => f.replace('.json', ''));
        
        // Extract high-value data
        const extracted = extractSpeciesData(speciesPath, perspectiveFiles);
        
        // Load _sources.json if exists (created by build-sources.js)
        const sourcesPath = path.join(speciesPath, '_sources.json');
        let sourcesData = { image: [], fields: {} };
        if (fs.existsSync(sourcesPath)) {
          try {
            sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
          } catch {}
        }
        
        // Sort quick facts by priority
        extracted.quickFacts.sort((a, b) => a.priority - b.priority);
        
        // Build season string
        let season = null;
        if (extracted.seasonStart && extracted.seasonEnd) {
          season = `${MONTHS[extracted.seasonStart]}–${MONTHS[extracted.seasonEnd]}`;
        }
        
        // Generate tagline
        const tagline = generateTagline(extracted, baseData);
        
        // Build species entry
        const speciesEntry = {
          id: baseData.id || speciesSlug,
          slug: speciesSlug,
          name: baseData.name || speciesSlug,
          scientific_name: baseData.scientific_name || '',
          kingdom: kingdom.slug,
          kingdom_icon: kingdom.icon,
          
          // Visual - nur echte Bilder, kein Fallback zu nicht-existierenden Pfaden
          image: baseData.image || null,
          
          // SEO & Engagement
          tagline: tagline,
          description: baseData.description || '',
          seo_description: generateSeoDescription(extracted, baseData),
          
          // Quick Facts (Top 5)
          quick_facts: extracted.quickFacts.slice(0, 5).map(f => ({
            icon: f.icon,
            label: f.label,
            value: f.value
          })),
          
          // Highlights (Top 3)
          highlights: [...new Set(extracted.highlights)].slice(0, 3),
          
          // Badges (Key status indicators)
          badges: extracted.badges.filter(b => b.highlight).slice(0, 3).map(b => ({
            icon: b.icon,
            label: b.label,
            status: b.status,
            variant: b.variant
          })),
          
          // Season
          season: season,
          
          // Categories
          categories: [...extracted.categories].slice(0, 5),
          
          // Keywords for search
          keywords: [...extracted.keywords].slice(0, 30),
          
          // Perspectives available
          perspectives: perspectiveFiles,
          perspective_count: perspectiveFiles.length,
          
          // Engagement score (more perspectives + medicinal uses = higher)
          engagement_score: perspectiveFiles.length * 10 + 
                           extracted.medicinalUses.length * 20 +
                           (extracted.edibility ? 15 : 0) +
                           extracted.highlights.length * 5,
          
          // Bifröst: Sources (loaded from _sources.json)
          _sources: sourcesData
        };
        
        index.species.push(speciesEntry);
        index.kingdoms[kingdom.slug].count++;
        index.total++;
        
        const stats = `${perspectiveFiles.length}P, ${extracted.quickFacts.length}QF, ${extracted.keywords.size}KW`;
        console.log(`  ✅ ${kingdom.slug}/${speciesSlug} (${stats})`);
        
      } catch (e) {
        console.log(`  ❌ ${kingdom.slug}/${speciesSlug}: ${e.message}`);
      }
    }
  }
  
  // Sort species by engagement score for featured
  index.species.sort((a, b) => b.engagement_score - a.engagement_score);
  
  // Top 10 featured overall
  index.featured = index.species.slice(0, 10).map(s => s.slug);
  
  // Top 3 featured per kingdom
  for (const kingdom of KINGDOMS) {
    index.kingdoms[kingdom.slug].featured = index.species
      .filter(s => s.kingdom === kingdom.slug)
      .slice(0, 3)
      .map(s => s.slug);
  }
  
  // Re-sort alphabetically for consistency
  index.species.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  
  // Write index
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  
  console.log('\n' + '═'.repeat(60));
  console.log(`📦 Universe Index erstellt: ${OUTPUT_PATH}`);
  console.log(`   ${index.total} Spezies in ${Object.keys(index.kingdoms).length} Kingdoms`);
  console.log('');
  
  for (const [slug, data] of Object.entries(index.kingdoms)) {
    if (data.count > 0) {
      console.log(`   ${data.icon} ${data.name}: ${data.count} (Featured: ${data.featured.join(', ')})`);
    }
  }
  
  console.log('');
  console.log(`   ⭐ Top Featured: ${index.featured.slice(0, 5).join(', ')}`);
  console.log('═'.repeat(60) + '\n');
  
  return index;
}

// ═══════════════════════════════════════════════════════════════════════════════
// KINGDOM INDEX GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function updateKingdomIndexes(universeIndex) {
  console.log('📁 Updating Kingdom Indexes...\n');
  
  for (const kingdom of KINGDOMS) {
    const kingdomPath = path.join(DATA_DIR, kingdom.slug);
    
    if (!fs.existsSync(kingdomPath)) continue;
    
    const kingdomSpecies = universeIndex.species
      .filter(s => s.kingdom === kingdom.slug);
    
    if (kingdomSpecies.length === 0) continue;
    
    // Rich kingdom index
    const kingdomIndex = {
      kingdom: kingdom.slug,
      name: kingdom.name,
      icon: kingdom.icon,
      tagline: kingdom.tagline,
      color: kingdom.color,
      count: kingdomSpecies.length,
      
      // Featured species with full data
      featured: kingdomSpecies
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 5)
        .map(s => ({
          slug: s.slug,
          name: s.name,
          scientific_name: s.scientific_name,
          tagline: s.tagline,
          image: s.image,
          badges: s.badges,
          quick_facts: s.quick_facts.slice(0, 3),
        })),
      
      // All species (compact)
      species: kingdomSpecies.map(s => ({
        slug: s.slug,
        name: s.name,
        scientific_name: s.scientific_name,
        tagline: s.tagline,
        image: s.image,
        badges: s.badges,
        season: s.season,
        perspectives: s.perspectives,
        categories: s.categories,
      })),
      
      // Statistics
      stats: {
        total_perspectives: kingdomSpecies.reduce((sum, s) => sum + s.perspective_count, 0),
        with_medicinal: kingdomSpecies.filter(s => s.perspectives.includes('medicine')).length,
        with_culinary: kingdomSpecies.filter(s => s.perspectives.includes('culinary')).length,
        with_safety: kingdomSpecies.filter(s => s.perspectives.includes('safety')).length,
      }
    };
    
    const indexPath = path.join(kingdomPath, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(kingdomIndex, null, 2));
    console.log(`  ✅ ${kingdom.slug}/index.json (${kingdomSpecies.length} Spezies, ${kingdomIndex.featured.length} Featured)`);
  }
  
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const universeIndex = buildIndex();
updateKingdomIndexes(universeIndex);
