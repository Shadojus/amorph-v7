/**
 * Extract experts from _sources.json files and add to Bifröst Expert System
 * 
 * This script:
 * 1. Reads all _sources.json files from data/fungi/
 * 2. Extracts unique experts with their fields/perspectives
 * 3. Creates/updates expert records in Pocketbase
 * 
 * Usage: node scripts/extract-experts.cjs [admin-email] [admin-password]
 */

const fs = require('fs');
const path = require('path');

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const DATA_DIR = './data/fungi';

const ADMIN_EMAIL = process.argv[2] || process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.argv[3] || process.env.PB_ADMIN_PASSWORD;

// Map source fields to perspectives
const FIELD_TO_PERSPECTIVE = {
  // Identification perspective
  'scientific_name': 'identification',
  'author_citation': 'identification',
  'taxonomy_family': 'identification',
  'confusion_species_list': 'identification',
  
  // Ecology perspective
  'trophic_mode_primary': 'ecology',
  'decomposer_type': 'ecology',
  'substrate_type_primary': 'ecology',
  'habitat': 'ecology',
  'ecological_role': 'ecology',
  
  // Medicine perspective
  'active_compounds': 'medicine',
  'primary_medicinal_uses': 'medicine',
  'clinical_evidence_level': 'medicine',
  'contraindications': 'medicine',
  'traditional_medicine_systems': 'medicine',
  'mechanism_of_action': 'medicine',
  'nerve_growth_factor': 'medicine',
  'safety_profile': 'medicine',
  'clinical_indications': 'medicine',
  'clinical_studies': 'medicine',
  
  // Chemistry perspective
  'bioactive_compounds': 'chemistry',
  'polysaccharide_content': 'chemistry',
  
  // Cultivation perspective
  'cultivation_methods': 'cultivation',
  'substrate_preferences': 'cultivation',
  
  // Culinary perspective
  'culinary_uses': 'culinary',
  'flavor_profile': 'culinary',
  
  // Image sources -> identification by default
  'image': 'identification'
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractExpertsFromSources(sourcesData, speciesSlug) {
  const experts = new Map();
  
  // Extract from image sources
  if (sourcesData.image && Array.isArray(sourcesData.image)) {
    for (const img of sourcesData.image) {
      if (!img.name) continue;
      
      const key = slugify(img.name);
      if (!experts.has(key)) {
        experts.set(key, {
          name: img.name,
          slug: key,
          title: 'Photographer',
          url: img.url || '',
          perspectives: new Set(['identification']),
          species: new Set([speciesSlug]),
          tags: new Set(['photography']),
          fields: new Set(['image'])
        });
      } else {
        experts.get(key).species.add(speciesSlug);
        experts.get(key).fields.add('image');
      }
    }
  }
  
  // Extract from field sources
  if (sourcesData.fields) {
    for (const [fieldName, sources] of Object.entries(sourcesData.fields)) {
      if (!Array.isArray(sources)) continue;
      
      const perspective = FIELD_TO_PERSPECTIVE[fieldName] || 'research';
      
      for (const source of sources) {
        if (!source.name) continue;
        
        const key = slugify(source.name);
        
        if (!experts.has(key)) {
          experts.set(key, {
            name: source.name,
            slug: key,
            title: source.title || 'Researcher',
            url: source.url || '',
            contact: source.contact || '',
            perspectives: new Set([perspective]),
            species: new Set([speciesSlug]),
            tags: new Set([perspective]),
            fields: new Set([fieldName])
          });
        } else {
          const expert = experts.get(key);
          expert.perspectives.add(perspective);
          expert.species.add(speciesSlug);
          expert.fields.add(fieldName);
          // Update title if current one is more specific
          if (source.title && source.title.length > expert.title.length) {
            expert.title = source.title;
          }
          // Update URL if we don't have one
          if (!expert.url && source.url) {
            expert.url = source.url;
          }
        }
      }
    }
  }
  
  return experts;
}

async function main() {
  console.log('🔗 Connecting to Pocketbase:', POCKETBASE_URL);
  
  let authToken = null;
  
  // Authenticate
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log('🔐 Authenticating as admin...');
    try {
      let authRes = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      
      if (!authRes.ok) {
        authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
      }
      
      if (!authRes.ok) throw new Error(await authRes.text());
      
      const authData = await authRes.json();
      authToken = authData.token;
      console.log('✅ Authenticated\n');
    } catch (error) {
      console.error('❌ Auth failed:', error.message);
      process.exit(1);
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': authToken } : {})
  };
  
  // Collect all experts from all species
  const allExperts = new Map();
  
  const speciesDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  console.log(`📁 Scanning ${speciesDirs.length} species for experts...\n`);
  
  for (const speciesSlug of speciesDirs) {
    const sourcesPath = path.join(DATA_DIR, speciesSlug, '_sources.json');
    
    if (!fs.existsSync(sourcesPath)) continue;
    
    const sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
    const experts = extractExpertsFromSources(sourcesData, speciesSlug);
    
    // Merge into global experts map
    for (const [key, expert] of experts) {
      if (!allExperts.has(key)) {
        allExperts.set(key, expert);
      } else {
        const existing = allExperts.get(key);
        expert.perspectives.forEach(p => existing.perspectives.add(p));
        expert.species.forEach(s => existing.species.add(s));
        expert.tags.forEach(t => existing.tags.add(t));
        expert.fields.forEach(f => existing.fields.add(f));
        if (expert.title.length > existing.title.length) {
          existing.title = expert.title;
        }
        if (!existing.url && expert.url) {
          existing.url = expert.url;
        }
      }
    }
  }
  
  console.log(`👥 Found ${allExperts.size} unique experts\n`);
  
  // Get existing experts
  const existingRes = await fetch(`${POCKETBASE_URL}/api/collections/experts/records?perPage=500`);
  const existingData = await existingRes.json();
  const existingSlugs = new Set(existingData.items?.map(e => e.slug) || []);
  
  console.log(`📊 Existing experts in database: ${existingSlugs.size}\n`);
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const [slug, expert] of allExperts) {
    const expertData = {
      name: expert.name,
      slug: expert.slug,
      title: expert.title,
      url: expert.url || '',
      contact: expert.contact || '',
      category: 'fungi',
      perspectives: Array.from(expert.perspectives),
      species: Array.from(expert.species),
      tags: Array.from(expert.tags),
      verified: false,
      impact_score: Math.min(100, expert.species.size * 10 + expert.fields.size * 5)
    };
    
    // Generate bio
    const perspectiveList = Array.from(expert.perspectives).join(', ');
    const speciesCount = expert.species.size;
    expertData.bio = `${expert.title}. Referenced for ${perspectiveList} across ${speciesCount} species.`;
    
    try {
      if (existingSlugs.has(slug)) {
        // Update existing expert - merge species and perspectives
        const existingExpert = existingData.items.find(e => e.slug === slug);
        
        // Merge arrays
        const mergedSpecies = [...new Set([...(existingExpert.species || []), ...expertData.species])];
        const mergedPerspectives = [...new Set([...(existingExpert.perspectives || []), ...expertData.perspectives])];
        const mergedTags = [...new Set([...(existingExpert.tags || []), ...expertData.tags])];
        
        const updateRes = await fetch(`${POCKETBASE_URL}/api/collections/experts/records/${existingExpert.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            species: mergedSpecies,
            perspectives: mergedPerspectives,
            tags: mergedTags,
            impact_score: Math.max(existingExpert.impact_score || 0, expertData.impact_score)
          })
        });
        
        if (updateRes.ok) {
          console.log(`🔄 ${expert.name}: Updated (${mergedSpecies.length} species)`);
          updated++;
        } else {
          console.log(`⏭️  ${expert.name}: Skipped (update failed)`);
          skipped++;
        }
      } else {
        // Create new expert
        const createRes = await fetch(`${POCKETBASE_URL}/api/collections/experts/records`, {
          method: 'POST',
          headers,
          body: JSON.stringify(expertData)
        });
        
        if (createRes.ok) {
          console.log(`✅ ${expert.name}: Created (${expertData.species.length} species, ${expertData.perspectives.length} perspectives)`);
          created++;
        } else {
          const err = await createRes.text();
          console.log(`❌ ${expert.name}: Failed - ${err}`);
          skipped++;
        }
      }
    } catch (error) {
      console.log(`❌ ${expert.name}: Error - ${error.message}`);
      skipped++;
    }
  }
  
  console.log('\n📊 Expert Extraction Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   👥 Total unique experts: ${allExperts.size}`);
}

main().catch(console.error);
