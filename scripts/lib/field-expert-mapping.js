/**
 * AMORPH Hilbert-Raum Feld-Experten-Mapping
 * 
 * Semantische Zuordnung von Datenfeldern zu Experten basierend auf:
 * - Keyword-Ähnlichkeit (TF-IDF-like)
 * - Perspektiven-Zugehörigkeit
 * - Spezialisierungsgrad
 * 
 * Der "Hilbert-Raum" ist hier als Vektorraum implementiert,
 * in dem Felder und Experten durch ihre Keyword-Vektoren repräsentiert werden.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// KEYWORD-VEKTOREN FÜR SEMANTISCHE ÄHNLICHKEIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Semantic Field Clusters - Gruppen von semantisch verwandten Begriffen
 * Jeder Cluster bildet eine "Dimension" im Hilbert-Raum
 */
export const SEMANTIC_CLUSTERS = {
  // Medizin & Gesundheit
  medical: [
    'medicinal', 'therapeutic', 'healing', 'treatment', 'clinical',
    'pharmacology', 'bioactive', 'compound', 'extract', 'dosage',
    'medicine', 'health', 'therapy', 'drug', 'pharmaceutical',
    'neuroregeneration', 'immunmodulation', 'antioxidant', 'anti-inflammatory',
    'tcm', 'ayurveda', 'traditional', 'herb', 'remedy'
  ],
  
  // Identifikation & Taxonomie
  identification: [
    'identification', 'taxonomy', 'morphology', 'species', 'genus',
    'family', 'order', 'class', 'phylum', 'kingdom',
    'microscopy', 'spore', 'cap', 'stem', 'gill', 'pore',
    'color', 'shape', 'size', 'texture', 'smell', 'taste',
    'key', 'distinguish', 'lookalike', 'confusion'
  ],
  
  // Kultivierung & Anbau
  cultivation: [
    'cultivation', 'growing', 'substrate', 'spawn', 'inoculation',
    'fruiting', 'harvest', 'yield', 'strain', 'culture',
    'sterile', 'technique', 'indoor', 'outdoor', 'log',
    'bag', 'bottle', 'temperature', 'humidity', 'light'
  ],
  
  // Ökologie & Umwelt
  ecology: [
    'ecology', 'habitat', 'ecosystem', 'symbiosis', 'mycorrhiza',
    'decomposer', 'saprobe', 'parasite', 'substrate', 'host',
    'forest', 'soil', 'wood', 'tree', 'organic',
    'nitrogen', 'carbon', 'nutrient', 'cycle', 'biodiversity'
  ],
  
  // Chemie & Biochemie
  chemistry: [
    'chemistry', 'compound', 'molecule', 'structure', 'synthesis',
    'polysaccharide', 'beta-glucan', 'terpene', 'alkaloid', 'sterol',
    'extraction', 'analysis', 'chromatography', 'spectroscopy',
    'bioactive', 'metabolite', 'enzyme', 'protein'
  ],
  
  // Psychoaktive Substanzen
  psychoactive: [
    'psychoactive', 'psilocybin', 'psilocin', 'psychedelic', 'entheogen',
    'trip', 'experience', 'consciousness', 'neuroplasticity',
    'serotonin', 'receptor', 'dose', 'set', 'setting',
    'legal', 'decriminalization', 'research', 'therapy'
  ],
  
  // Kulinarik
  culinary: [
    'culinary', 'edible', 'cooking', 'recipe', 'flavor',
    'taste', 'texture', 'aroma', 'umami', 'savory',
    'preparation', 'drying', 'preservation', 'dish', 'cuisine',
    'gourmet', 'delicacy', 'nutritional', 'protein', 'vitamin'
  ],
  
  // Sicherheit & Toxikologie
  safety: [
    'safety', 'toxicity', 'poison', 'toxic', 'lethal',
    'edibility', 'warning', 'caution', 'danger', 'risk',
    'symptom', 'syndrome', 'antidote', 'treatment', 'hospital',
    'lookalike', 'confusion', 'misidentification', 'fatal'
  ],
  
  // Kultur & Geschichte
  culture: [
    'culture', 'history', 'mythology', 'folklore', 'tradition',
    'ritual', 'ceremony', 'shamanic', 'spiritual', 'sacred',
    'ethnomycology', 'indigenous', 'ancient', 'symbolism', 'art'
  ],
  
  // Forschung & Wissenschaft
  research: [
    'research', 'study', 'clinical', 'trial', 'evidence',
    'publication', 'journal', 'peer-reviewed', 'scientist',
    'discovery', 'innovation', 'patent', 'university', 'lab'
  ]
};

/**
 * Experten-Profil-Vektoren
 * Jeder Experte hat Gewichte für jeden semantischen Cluster
 */
export const EXPERT_VECTORS = {
  'paul-stamets': {
    medical: 0.95,
    cultivation: 0.98,
    ecology: 0.85,
    chemistry: 0.80,
    psychoactive: 0.75,
    research: 0.90,
    culture: 0.60,
    identification: 0.65,
    culinary: 0.50,
    safety: 0.70
  },
  
  'michael-kuo': {
    identification: 0.98,
    ecology: 0.85,
    culinary: 0.70,
    safety: 0.80,
    research: 0.75,
    culture: 0.50,
    medical: 0.40,
    cultivation: 0.45,
    chemistry: 0.50,
    psychoactive: 0.20
  },
  
  'alan-rockefeller': {
    identification: 0.95,
    psychoactive: 0.95,
    chemistry: 0.85,
    research: 0.80,
    ecology: 0.70,
    safety: 0.75,
    cultivation: 0.50,
    culture: 0.60,
    medical: 0.55,
    culinary: 0.40
  },
  
  'christopher-hobbs': {
    medical: 0.98,
    chemistry: 0.85,
    culture: 0.80,
    research: 0.75,
    culinary: 0.60,
    safety: 0.70,
    ecology: 0.55,
    identification: 0.50,
    cultivation: 0.45,
    psychoactive: 0.40
  },
  
  'michael-wood': {
    identification: 0.95,
    ecology: 0.85,
    culinary: 0.75,
    research: 0.70,
    safety: 0.65,
    culture: 0.55,
    cultivation: 0.50,
    chemistry: 0.45,
    medical: 0.40,
    psychoactive: 0.30
  },
  
  'tradd-cotter': {
    cultivation: 0.98,
    ecology: 0.90,
    medical: 0.75,
    research: 0.70,
    chemistry: 0.60,
    culinary: 0.65,
    identification: 0.55,
    safety: 0.60,
    culture: 0.45,
    psychoactive: 0.30
  },
  
  'david-arora': {
    identification: 0.95,
    culinary: 0.90,
    ecology: 0.80,
    safety: 0.85,
    culture: 0.70,
    research: 0.60,
    cultivation: 0.50,
    chemistry: 0.45,
    medical: 0.40,
    psychoactive: 0.35
  },
  
  'gary-lincoff': {
    identification: 0.95,
    culture: 0.90,
    culinary: 0.85,
    ecology: 0.75,
    safety: 0.80,
    research: 0.65,
    medical: 0.50,
    cultivation: 0.45,
    chemistry: 0.40,
    psychoactive: 0.35
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FELD-VEKTOR BERECHNUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Berechnet den semantischen Vektor für ein Feldname
 * @param {string} fieldName - Name des Feldes (z.B. "primary_medicinal_uses")
 * @returns {Object} Vektor mit Gewichten pro Cluster
 */
export function computeFieldVector(fieldName) {
  const vector = {};
  const fieldTokens = tokenize(fieldName);
  
  // Für jeden Cluster: Wie viele Keywords matchen?
  for (const [cluster, keywords] of Object.entries(SEMANTIC_CLUSTERS)) {
    let score = 0;
    for (const token of fieldTokens) {
      for (const keyword of keywords) {
        if (keyword.includes(token) || token.includes(keyword)) {
          score += 1;
        }
        // Bonus für exakte Matches
        if (keyword === token) {
          score += 2;
        }
      }
    }
    // Normalisieren
    vector[cluster] = Math.min(score / 5, 1);
  }
  
  return vector;
}

/**
 * Tokenisiert einen Feldnamen
 */
function tokenize(fieldName) {
  return fieldName
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HILBERT-RAUM DISTANZ / ÄHNLICHKEIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Berechnet die Cosinus-Ähnlichkeit zwischen zwei Vektoren
 */
export function cosineSimilarity(vecA, vecB) {
  const clusters = Object.keys(SEMANTIC_CLUSTERS);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const cluster of clusters) {
    const a = vecA[cluster] || 0;
    const b = vecB[cluster] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Findet die besten Experten für ein Feld
 * @param {string} fieldName - Feldname
 * @param {number} topK - Anzahl der Top-Experten
 * @returns {Array} Sortierte Liste von {expert, similarity}
 */
export function findExpertsForField(fieldName, topK = 3) {
  const fieldVector = computeFieldVector(fieldName);
  const results = [];
  
  for (const [expertId, expertVector] of Object.entries(EXPERT_VECTORS)) {
    const similarity = cosineSimilarity(fieldVector, expertVector);
    results.push({
      expert: expertId,
      similarity: Math.round(similarity * 100) / 100
    });
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Findet die besten Felder für einen Experten
 * @param {string} expertId - Experten-ID
 * @param {Array<string>} fieldNames - Liste von Feldnamen
 * @param {number} topK - Anzahl der Top-Felder
 */
export function findFieldsForExpert(expertId, fieldNames, topK = 10) {
  const expertVector = EXPERT_VECTORS[expertId];
  if (!expertVector) return [];
  
  const results = [];
  
  for (const fieldName of fieldNames) {
    const fieldVector = computeFieldVector(fieldName);
    const similarity = cosineSimilarity(fieldVector, expertVector);
    results.push({
      field: fieldName,
      similarity: Math.round(similarity * 100) / 100
    });
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSPEKTIVEN-BASIERTE ZUORDNUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mapping von Perspektiven zu primären semantischen Clustern
 */
export const PERSPECTIVE_CLUSTERS = {
  medicine: ['medical', 'chemistry', 'research'],
  identification: ['identification', 'safety'],
  cultivation: ['cultivation', 'ecology'],
  ecology: ['ecology', 'research'],
  chemistry: ['chemistry', 'medical', 'research'],
  safety: ['safety', 'identification'],
  culinary: ['culinary', 'safety'],
  culture: ['culture', 'research'],
  conservation: ['ecology', 'research'],
  geography: ['ecology'],
  temporal: ['ecology', 'cultivation'],
  economy: ['culinary', 'cultivation'],
  interactions: ['ecology', 'chemistry'],
  research: ['research', 'chemistry', 'medical'],
  statistics: ['research']
};

/**
 * Holt die empfohlenen Experten für eine Perspektive
 */
export function getExpertsForPerspective(perspective) {
  const clusters = PERSPECTIVE_CLUSTERS[perspective] || [];
  const expertScores = {};
  
  for (const [expertId, expertVector] of Object.entries(EXPERT_VECTORS)) {
    let totalScore = 0;
    for (const cluster of clusters) {
      totalScore += expertVector[cluster] || 0;
    }
    expertScores[expertId] = totalScore / clusters.length;
  }
  
  return Object.entries(expertScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([expert, score]) => ({ expert, score: Math.round(score * 100) / 100 }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT FÜR BIFRÖST-INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generiert ein vollständiges Feld-Experten-Mapping für ein Item
 * @param {Object} itemData - Item mit allen Feldern
 * @returns {Object} Mapping von Feldnamen zu Experten-Arrays
 */
export function generateFieldExpertMapping(itemData) {
  const mapping = {};
  
  for (const [fieldName, value] of Object.entries(itemData)) {
    // Skip private fields
    if (fieldName.startsWith('_')) continue;
    if (value === null || value === undefined) continue;
    
    const experts = findExpertsForField(fieldName, 2);
    if (experts.length > 0 && experts[0].similarity > 0.1) {
      mapping[fieldName] = experts.map(e => e.expert);
    }
  }
  
  return mapping;
}

// CLI-Test wenn direkt ausgeführt
if (process.argv[1]?.includes('field-expert-mapping')) {
  console.log('\n═══ HILBERT-RAUM FELD-EXPERTEN-MAPPING TEST ═══\n');
  
  const testFields = [
    'primary_medicinal_uses',
    'toxicity_level',
    'cultivation_difficulty',
    'psilocybin_content',
    'cap_color',
    'ecological_role',
    'flavor_profile'
  ];
  
  for (const field of testFields) {
    const experts = findExpertsForField(field, 3);
    console.log(`\n${field}:`);
    for (const { expert, similarity } of experts) {
      console.log(`  → ${expert}: ${similarity}`);
    }
  }
  
  console.log('\n\n═══ EXPERTEN FÜR PERSPEKTIVEN ═══\n');
  
  for (const persp of ['medicine', 'identification', 'psychoactive', 'culinary']) {
    const experts = getExpertsForPerspective(persp);
    console.log(`${persp}: ${experts.map(e => `${e.expert}(${e.score})`).join(', ')}`);
  }
}
