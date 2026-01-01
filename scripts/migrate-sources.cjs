/**
 * Migrate _sources.json files to Pocketbase
 * 
 * Reads all _sources.json files from data/fungi/ and updates
 * the corresponding species records in Pocketbase.
 * 
 * Usage: node scripts/migrate-sources.cjs [admin-email] [admin-password]
 */

const fs = require('fs');
const path = require('path');

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const DATA_DIR = './data/fungi';

// Get admin credentials from args or env
const ADMIN_EMAIL = process.argv[2] || process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.argv[3] || process.env.PB_ADMIN_PASSWORD;

async function migrateSources() {
  console.log('🔗 Connecting to Pocketbase:', POCKETBASE_URL);
  
  let authToken = null;
  
  // Authenticate as admin if credentials provided
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log('🔐 Authenticating as admin...');
    try {
      // Try new Pocketbase v0.23+ auth endpoint first
      let authRes = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      
      // Fallback to old endpoint
      if (!authRes.ok) {
        authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
      }
      
      if (!authRes.ok) {
        throw new Error(`Auth failed: ${await authRes.text()}`);
      }
      
      const authData = await authRes.json();
      authToken = authData.token;
      console.log('✅ Authenticated successfully\n');
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      console.log('\n💡 Usage: node scripts/migrate-sources.cjs <admin-email> <admin-password>');
      console.log('   Or set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables\n');
      process.exit(1);
    }
  } else {
    console.log('⚠️  No admin credentials provided - will try without auth\n');
    console.log('💡 Usage: node scripts/migrate-sources.cjs <admin-email> <admin-password>\n');
  }
  
  // Get all species directories
  const speciesDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  console.log(`📁 Found ${speciesDirs.length} species directories\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': authToken } : {})
  };
  
  for (const slug of speciesDirs) {
    const sourcesPath = path.join(DATA_DIR, slug, '_sources.json');
    
    if (!fs.existsSync(sourcesPath)) {
      console.log(`⏭️  ${slug}: No _sources.json found`);
      skipped++;
      continue;
    }
    
    try {
      // Read sources file
      const sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
      
      // Find the species record by slug
      const listRes = await fetch(`${POCKETBASE_URL}/api/collections/species/records?filter=(slug='${slug}')`);
      const records = await listRes.json();
      
      if (!records.items || records.items.length === 0) {
        console.log(`⚠️  ${slug}: Not found in Pocketbase`);
        skipped++;
        continue;
      }
      
      const record = records.items[0];
      
      // Update the sources field
      const updateRes = await fetch(`${POCKETBASE_URL}/api/collections/species/records/${record.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sources: sourcesData })
      });
      
      if (!updateRes.ok) {
        throw new Error(`HTTP ${updateRes.status}: ${await updateRes.text()}`);
      }
      
      const fieldCount = Object.keys(sourcesData.fields || {}).length;
      const imageCount = (sourcesData.image || []).length;
      console.log(`✅ ${slug}: Sources updated (${fieldCount} field sources, ${imageCount} image sources)`);
      updated++;
      
    } catch (error) {
      console.error(`❌ ${slug}: Error - ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📁 Total: ${speciesDirs.length}`);
}

migrateSources().catch(console.error);
