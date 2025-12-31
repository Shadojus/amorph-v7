/**
 * AMORPH Agent Prompt Generator
 * 
 * Generiert strukturierte Prompts für Claude-Agenten zur Datenerstellung.
 * Jeder Agent bekommt einen fokussierten Prompt mit:
 * - Spezifischer Spezies + Perspektive
 * - Blueprint-Schema als Vorlage
 * - Empfohlene Experten als Referenz
 * - Validierungsregeln
 * 
 * Usage:
 *   node scripts/agent-prompt.js steinpilz medicine
 *   node scripts/agent-prompt.js --batch fungi medicine  # Alle Pilze
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const BLUEPRINTS_DIR = path.join(ROOT, 'config', 'schema', 'perspektiven', 'blueprints');

// ═══════════════════════════════════════════════════════════════════════════════
// BLUEPRINT LOADING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt ein Blueprint und extrahiert die Feld-Definitionen
 */
function loadBlueprint(perspective) {
  const blueprintPath = path.join(BLUEPRINTS_DIR, `${perspective}.blueprint.yaml`);
  
  if (!fs.existsSync(blueprintPath)) {
    throw new Error(`Blueprint not found: ${perspective}`);
  }
  
  const content = fs.readFileSync(blueprintPath, 'utf-8');
  const parsed = yaml.load(content);
  
  // Extrahiere Feld-Namen und ihre Morph-Typen
  const fields = [];
  const lines = content.split('\n');
  let currentMorph = null;
  
  for (const line of lines) {
    const morphMatch = line.match(/# morph: (\w+)/);
    if (morphMatch) {
      currentMorph = morphMatch[1];
    }
    
    const fieldMatch = line.match(/^(\w+):/);
    if (fieldMatch && currentMorph) {
      fields.push({
        name: fieldMatch[1],
        morph: currentMorph
      });
    }
  }
  
  return { parsed, fields, raw: content };
}

/**
 * Lädt Spezies-Daten
 */
function loadSpeciesData(kingdom, species) {
  const speciesDir = path.join(DATA_DIR, kingdom, species);
  const indexPath = path.join(speciesDir, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Species not found: ${species}`);
  }
  
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
}

/**
 * Prüft ob eine Perspektive bereits existiert
 */
function perspectiveExists(kingdom, species, perspective) {
  const filePath = path.join(DATA_DIR, kingdom, species, `${perspective}.json`);
  return fs.existsSync(filePath);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generiert einen strukturierten Prompt für einen Claude-Agenten
 */
export function generateAgentPrompt(kingdom, species, perspective, options = {}) {
  const speciesData = loadSpeciesData(kingdom, species);
  const blueprint = loadBlueprint(perspective);
  const exists = perspectiveExists(kingdom, species, perspective);
  
  // Top 20 wichtigste Felder extrahieren
  const topFields = blueprint.fields.slice(0, 25);
  
  const prompt = `
# AMORPH Daten-Agent Auftrag

Du bist ein spezialisierter Daten-Agent für das AMORPH Pilz-Datenbank-System.
Deine Aufgabe ist es, die **${perspective.toUpperCase()}** Perspektive für **${speciesData.name}** zu erstellen.

## Ziel-Spezies

- **Wissenschaftlicher Name:** ${speciesData.scientific_name}
- **Deutscher Name:** ${speciesData.name}
- **Slug:** ${speciesData.slug}
- **Beschreibung:** ${speciesData.description}

## Aufgabe

Erstelle eine JSON-Datei für die Perspektive **${perspective}** mit folgenden Feldern:

### Wichtige Felder (priorisiert):

${topFields.map(f => `- \`${f.name}\` (Morph: ${f.morph})`).join('\n')}

## Datenformat-Regeln

1. **Alle Werte müssen dem Morph-Typ entsprechen:**
   - \`text\`: String
   - \`list\`: Array von Strings ["item1", "item2"]
   - \`tag\`: Kurzer String (max 20 Zeichen)
   - \`badge\`: Objekt mit status: {"status": "wert", "variant": "success|warning|danger"}
   - \`range\`: Objekt {"min": 0, "max": 100, "unit": "cm"}
   - \`bar\`: Array [{"label": "A", "value": 50}, {"label": "B", "value": 30}]

2. **GOAT erforderlich:**
   \`\`\`json
   "_source": {
     "references": ["URL1", "URL2"],
     "expert": "experten-id"
   }
   \`\`\`

3. **Meta-Daten:**
   \`\`\`json
   "_meta": {
     "created": "${new Date().toISOString()}",
     "createdBy": "claude-agent",
     "version": "1.0"
   }
   \`\`\`

## Empfohlene Experten für ${perspective}

Verwende Wissen von diesen Experten als Referenz:
${getExpertRecommendations(perspective)}

## Output-Format

Antworte NUR mit dem JSON-Objekt, ohne Markdown-Code-Blocks oder Erklärungen:

{
  "_meta": { ... },
  "_source": { ... },
  "feld1": "wert1",
  "feld2": ["wert2a", "wert2b"],
  ...
}

## Validierung

Deine Ausgabe wird automatisch gegen das Schema validiert.
Stelle sicher, dass alle Werte:
- Den richtigen Datentyp haben
- Keine leeren Strings "" sind (lass leere Felder weg)
- Wissenschaftlich korrekt und aktuell sind

${exists ? '\n⚠️ HINWEIS: Eine Datei für diese Perspektive existiert bereits und wird überschrieben!' : ''}

---
Beginne jetzt mit der JSON-Erstellung für ${speciesData.scientific_name} / ${perspective}:
`;

  return prompt;
}

/**
 * Holt Experten-Empfehlungen als String
 */
function getExpertRecommendations(perspective) {
  const recommendations = {
    medicine: '- Paul Stamets (Medizinische Pilze, Immunmodulation)\n- Christopher Hobbs (TCM, Heilpilze)',
    identification: '- Michael Kuo (Pilz-Identifikation)\n- Alan Rockefeller (DNA-basierte Bestimmung)',
    cultivation: '- Tradd Cotter (Kultivierungstechniken)\n- Paul Stamets (Substrat & Spawn)',
    ecology: '- Paul Stamets (Mykoremediation)\n- Michael Wood (Habitat-Ökologie)',
    chemistry: '- Paul Stamets (Bioaktive Verbindungen)\n- Alan Rockefeller (Alkaloid-Analyse)',
    safety: '- Michael Kuo (Toxikologie)\n- David Arora (Essbarkeits-Bewertung)',
    culinary: '- David Arora (Kulinarische Nutzung)\n- Gary Lincoff (Gourmet-Pilze)',
    culture: '- Gary Lincoff (Ethnomykologie)\n- Christopher Hobbs (Traditionelle Nutzung)'
  };
  
  return recommendations[perspective] || '- Allgemeine Pilz-Experten';
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generiert Prompts für alle Spezies eines Kingdoms
 */
function generateBatchPrompts(kingdom, perspective) {
  const kingdomDir = path.join(DATA_DIR, kingdom);
  
  if (!fs.existsSync(kingdomDir)) {
    throw new Error(`Kingdom not found: ${kingdom}`);
  }
  
  const species = fs.readdirSync(kingdomDir)
    .filter(f => fs.statSync(path.join(kingdomDir, f)).isDirectory())
    .filter(f => !f.startsWith('.'));
  
  const prompts = [];
  
  for (const sp of species) {
    try {
      if (!perspectiveExists(kingdom, sp, perspective)) {
        prompts.push({
          species: sp,
          perspective,
          prompt: generateAgentPrompt(kingdom, sp, perspective)
        });
      }
    } catch (e) {
      console.error(`Skipping ${sp}: ${e.message}`);
    }
  }
  
  return prompts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
AMORPH Agent Prompt Generator

Usage:
  node scripts/agent-prompt.js <species> <perspective>
  node scripts/agent-prompt.js --batch <kingdom> <perspective>
  node scripts/agent-prompt.js --list-blueprints

Examples:
  node scripts/agent-prompt.js hericium-erinaceus medicine
  node scripts/agent-prompt.js --batch fungi ecology
  node scripts/agent-prompt.js --list-blueprints
    `);
    return;
  }
  
  if (args.includes('--list-blueprints')) {
    const blueprints = fs.readdirSync(BLUEPRINTS_DIR)
      .filter(f => f.endsWith('.blueprint.yaml'))
      .map(f => f.replace('.blueprint.yaml', ''));
    
    console.log('\nAvailable Perspectives:');
    for (const bp of blueprints) {
      console.log(`  - ${bp}`);
    }
    return;
  }
  
  if (args.includes('--batch')) {
    const kingdom = args[args.indexOf('--batch') + 1];
    const perspective = args[args.indexOf('--batch') + 2];
    
    if (!kingdom || !perspective) {
      console.error('Error: Kingdom and perspective required');
      process.exit(1);
    }
    
    const prompts = generateBatchPrompts(kingdom, perspective);
    console.log(`\nGenerated ${prompts.length} prompts for ${kingdom}/${perspective}`);
    
    // Speichere Prompts in Datei
    const outputPath = path.join(ROOT, '.agent-prompts', `${kingdom}-${perspective}.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prompts, null, 2));
    console.log(`Saved to: ${outputPath}`);
    return;
  }
  
  // Single prompt
  const [species, perspective] = args;
  
  if (!species || !perspective) {
    console.error('Error: Species and perspective required');
    process.exit(1);
  }
  
  try {
    const prompt = generateAgentPrompt('fungi', species, perspective);
    console.log(prompt);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
