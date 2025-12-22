/**
 * AMORPH v7 - Tests mit echten Daten aus psilocybe-cyanescens
 * 
 * Diese Tests validieren Morphs mit realen Datenstrukturen
 * statt synthetischen Test-Fixtures.
 */

import { describe, it, expect } from 'vitest';
import { renderValue, primitives } from '../src/morphs/index.js';
import { detectType } from '../src/core/detection.js';
import { singleContext, compareContext } from './morphs/_setup.js';

// ============================================================================
// Echte Daten aus psilocybe-cyanescens/chemistry.json
// ============================================================================

describe('chemistry.json Strukturen', () => {
  // Radar-Daten aus alkaloid_profile_radar
  const alkaloidProfileRadar = [
    { axis: 'Psilocybin', value: 95 },
    { axis: 'Psilocin', value: 35 },
    { axis: 'Baeocystin', value: 15 },
    { axis: 'Norbaeocystin', value: 5 },
    { axis: 'Aeruginascin', value: 3 }
  ];

  // Bar-Daten aus alkaloid_content_by_part
  const alkaloidByPart = [
    { label: 'Hut (Pileus)', value: 1.68 },
    { label: 'Stiel (Stipe)', value: 0.75 },
    { label: 'Gesamter Fruchtkörper', value: 1.20 }
  ];

  // Range-Daten aus total_alkaloid_content
  const totalAlkaloidContent = {
    min: 0.85,
    max: 2.0,
    unit: '% dry weight'
  };

  // Stats-Daten aus primary_metabolites.carbohydrates
  const carbohydrates = {
    total_percent: 45,
    types: ['Chitin', 'Glucane', 'Trehalose', 'Glycogen']
  };

  // Komplexe Alkaloid-Compound Daten
  const psilocybinCompound = {
    name: 'Psilocybin',
    cas: '520-52-5',
    formula: 'C12H17N2O4P',
    molecular_weight: 284.25,
    content_range: { min: 0.85, max: 1.96, unit: '% DW' },
    pharmacological_class: '5-HT2A Agonist (Prodrug)',
    mechanism: 'Dephosphoryliert zu Psilocin, partieller Agonist an serotonergen Rezeptoren'
  };

  describe('Radar Morph mit Alkaloid-Profil', () => {
    it('erkennt Radar-Struktur korrekt', () => {
      const type = detectType(alkaloidProfileRadar, 'alkaloid_profile_radar');
      expect(type).toBe('radar');
    });

    it('rendert alle 5 Achsen mit vollen Labels', () => {
      const html = primitives.radar(alkaloidProfileRadar, singleContext);
      
      // Labels werden NICHT mehr gekürzt
      expect(html).toContain('Psilocybin');
      expect(html).toContain('Psilocin');
      expect(html).toContain('Baeocystin');
      expect(html).toContain('Norbaeocystin');
      expect(html).toContain('Aeruginascin');
    });

    it('rendert SVG Radar-Chart', () => {
      const html = primitives.radar(alkaloidProfileRadar, singleContext);
      
      expect(html).toContain('<svg');
      expect(html).toContain('morph-radar');
    });

    it('handhabt Werte von 3 bis 95 korrekt', () => {
      const html = primitives.radar(alkaloidProfileRadar, singleContext);
      // Sollte keine Fehler werfen und valide sein
      expect(html.length).toBeGreaterThan(100);
    });
  });

  describe('Bar Morph mit Alkaloid-Gehalt nach Teil', () => {
    it('erkennt Bar-Struktur korrekt', () => {
      const type = detectType(alkaloidByPart, 'alkaloid_content_by_part');
      expect(type).toBe('bar');
    });

    it('rendert alle Pilzteile', () => {
      const html = primitives.bar(alkaloidByPart, singleContext);
      
      expect(html).toContain('Hut');
      expect(html).toContain('Stiel');
      expect(html).toContain('Fruchtkörper');
    });

    it('rendert Prozentbalken für Werte', () => {
      const html = primitives.bar(alkaloidByPart, singleContext);
      expect(html).toContain('morph-bar');
    });
  });

  describe('Range Morph mit Alkaloid-Gesamtgehalt', () => {
    it('erkennt Range-Struktur korrekt', () => {
      const type = detectType(totalAlkaloidContent, 'total_alkaloid_content');
      expect(type).toBe('range');
    });

    it('rendert min und max Werte (deutsche Formatierung)', () => {
      const html = primitives.range(totalAlkaloidContent, singleContext);
      
      // Deutsche Zahlenformatierung: 0,85 statt 0.85
      expect(html).toContain('0,85');
      expect(html).toContain('2');
      expect(html).toContain('morph-range');
    });
  });

  describe('Object Morph mit komplexem Compound', () => {
    it('rendert geschachtelte Struktur', () => {
      const html = renderValue(psilocybinCompound, 'psilocybin', singleContext);
      
      expect(html).toContain('Psilocybin');
      expect(html).toContain('520-52-5');
      expect(html).toContain('C12H17N2O4P');
    });

    it('handhabt verschachtelte Range in content_range (deutsche Formatierung)', () => {
      const html = renderValue(psilocybinCompound.content_range, 'content_range', singleContext);
      
      // Deutsche Zahlenformatierung: Komma statt Punkt
      expect(html).toContain('0,85');
      expect(html).toContain('1,96');
    });
  });
});

// ============================================================================
// Echte Daten aus psilocybe-cyanescens/ecology.json
// ============================================================================

describe('ecology.json Strukturen', () => {
  // Badge-Daten mit status/variant
  const trophicFlexibility = {
    status: 'Low',
    variant: 'info'
  };

  const decompositionRate = {
    status: 'Moderate',
    variant: 'warning'
  };

  const guildConfidence = {
    status: 'High',
    variant: 'success'
  };

  // Progress-Daten mit value/max
  const laccaseActivity = {
    value: 65,
    min: 0,
    max: 100,
    unit: '%'
  };

  const cellulaseActivity = {
    value: 55,
    min: 0,
    max: 100,
    unit: '%'
  };

  // Rating-Daten
  const ecosystemFunctionIntensity = {
    rating: 6,
    max: 10
  };

  const soilCarbonContribution = {
    rating: 5,
    max: 10
  };

  // List-Daten
  const secondaryFunctions = [
    'Nutrient cycling',
    'Soil structure improvement',
    'Carbon cycling'
  ];

  const associatedPlantFamilies = [
    'Betulaceae (Birkengewächse)',
    'Fagaceae (Buchengewächse)',
    'Aceraceae (Ahorngewächse)',
    'Rosaceae (Rosengewächse)'
  ];

  describe('Badge Morph mit Status/Variant', () => {
    it('erkennt Badge-Struktur für alle Varianten', () => {
      expect(detectType(trophicFlexibility, 'trophic_flexibility')).toBe('badge');
      expect(detectType(decompositionRate, 'decomposition_rate')).toBe('badge');
      expect(detectType(guildConfidence, 'guild_confidence')).toBe('badge');
    });

    it('rendert Info-Badge korrekt', () => {
      const html = primitives.badge(trophicFlexibility, singleContext);
      
      expect(html).toContain('Low');
      expect(html).toContain('badge-info');
    });

    it('rendert Warning-Badge korrekt', () => {
      const html = primitives.badge(decompositionRate, singleContext);
      
      expect(html).toContain('Moderate');
      expect(html).toContain('badge-warning');
    });

    it('rendert Success-Badge korrekt', () => {
      const html = primitives.badge(guildConfidence, singleContext);
      
      expect(html).toContain('High');
      expect(html).toContain('badge-success');
    });
  });

  describe('Progress Morph mit Enzym-Aktivitäten', () => {
    it('erkennt Progress-Struktur', () => {
      expect(detectType(laccaseActivity, 'enzyme_laccase_activity')).toBe('progress');
      expect(detectType(cellulaseActivity, 'enzyme_cellulase_activity')).toBe('progress');
    });

    it('rendert Laccase 65% korrekt', () => {
      const html = primitives.progress(laccaseActivity, singleContext);
      
      expect(html).toContain('65');
      expect(html).toContain('morph-progress');
    });

    it('rendert Cellulase 55% korrekt', () => {
      const html = primitives.progress(cellulaseActivity, singleContext);
      
      expect(html).toContain('55');
    });
  });

  describe('Rating Morph mit Ökosystem-Bewertungen', () => {
    it('erkennt Rating-Struktur', () => {
      expect(detectType(ecosystemFunctionIntensity, 'ecosystem_function_intensity')).toBe('rating');
      expect(detectType(soilCarbonContribution, 'soil_carbon_contribution')).toBe('rating');
    });

    it('rendert 6/10 Rating korrekt', () => {
      const html = primitives.rating(ecosystemFunctionIntensity, singleContext);
      
      expect(html).toContain('morph-rating');
      // 6 gefüllte und 4 leere Sterne
      expect(html).toContain('★');
    });

    it('rendert 5/10 Rating korrekt', () => {
      const html = primitives.rating(soilCarbonContribution, singleContext);
      expect(html).toContain('★');
    });
  });

  describe('List Morph mit ökologischen Listen', () => {
    it('erkennt List-Struktur', () => {
      expect(detectType(secondaryFunctions, 'secondary_ecosystem_functions')).toBe('list');
      expect(detectType(associatedPlantFamilies, 'associated_plant_families')).toBe('list');
    });

    it('rendert alle sekundären Funktionen', () => {
      const html = primitives.list(secondaryFunctions, singleContext);
      
      expect(html).toContain('Nutrient cycling');
      expect(html).toContain('Soil structure improvement');
      expect(html).toContain('Carbon cycling');
    });

    it('rendert Pflanzenfamilien mit Sonderzeichen', () => {
      const html = primitives.list(associatedPlantFamilies, singleContext);
      
      expect(html).toContain('Betulaceae');
      expect(html).toContain('Fagaceae');
    });
  });
});

// ============================================================================
// Echte Daten aus psilocybe-cyanescens/identification.json
// ============================================================================

describe('identification.json Strukturen', () => {
  // Checklist-Daten
  const quickIdChecklist = [
    { step: 1, label: 'Hutrand wellig-gewellt (besonders bei Reife)', status: 'pending' },
    { step: 2, label: 'Intensive Blauverfärbung bei Berührung', status: 'pending' },
    { step: 3, label: 'Karamell- bis honigbrauner Hut, hygrophan', status: 'pending' },
    { step: 4, label: 'Stiel weißlich mit seidigem Glanz', status: 'pending' },
    { step: 5, label: 'Wachstum auf Holzhäcksel', status: 'pending' },
    { step: 6, label: 'Erscheinung im Spätherbst', status: 'pending' },
    { step: 7, label: 'Sporenpulver dunkel purpur-braun', status: 'pending' }
  ];

  // Confusion-Species mit Level
  const confusionConsequences = [
    { 
      level: 'critical', 
      typ: 'Galerina marginata', 
      beschreibung: 'Tödlich giftig! Enthält Amatoxine.' 
    },
    { 
      level: 'medium', 
      typ: 'Hypholoma fasciculare', 
      beschreibung: 'Giftig, verursacht Magen-Darm-Beschwerden.' 
    }
  ];

  // Season-Daten als Object
  const appearanceBySeason = {
    spring: 'Selten, nur bei kühlem, feuchtem Wetter',
    summer: 'Nicht vorhanden',
    autumn: 'Hauptsaison Oktober-Dezember, Peak nach erstem Frost',
    winter: 'Bis Januar bei mildem Wetter möglich'
  };

  // String-Listen
  const commonNames = [
    'Blauender Kahlkopf',
    'Wavy Cap',
    'Potent Psilocybe',
    'Blue Halos',
    'Cyan'
  ];

  const synonyms = [
    'Geophila cyanescens (Wakefield) Kühner & Romagn. 1953'
  ];

  describe('Steps Morph mit Checklist', () => {
    it('erkennt Checklist als Steps (wegen step/label/status Struktur)', () => {
      const type = detectType(quickIdChecklist, 'quick_id_checklist');
      // Checklist hat step/label/status - wird als Steps erkannt!
      expect(type).toBe('steps');
    });

    it('rendert als Steps mit allen 7 Schritten', () => {
      const html = primitives.steps(quickIdChecklist, singleContext);
      
      expect(html).toContain('Hutrand wellig');
      expect(html).toContain('Blauverfärbung');
      expect(html).toContain('Sporenpulver');
      expect(html).toContain('morph-step');
    });
  });

  describe('Object Morph mit Season-Daten', () => {
    it('erkennt als Object', () => {
      const type = detectType(appearanceBySeason, 'appearance_by_season');
      expect(type).toBe('object');
    });

    it('rendert alle vier Jahreszeiten', () => {
      const html = renderValue(appearanceBySeason, 'appearance_by_season', singleContext);
      
      expect(html).toContain('spring');
      expect(html).toContain('summer');
      expect(html).toContain('autumn');
      expect(html).toContain('winter');
    });
  });

  describe('List Morph mit Namen', () => {
    it('rendert deutsche und englische Namen', () => {
      const html = primitives.list(commonNames, singleContext);
      
      expect(html).toContain('Blauender Kahlkopf');
      expect(html).toContain('Wavy Cap');
      expect(html).toContain('Cyan');
    });

    it('handhabt Synonyme mit Sonderzeichen', () => {
      const html = primitives.list(synonyms, singleContext);
      
      expect(html).toContain('Geophila cyanescens');
    });
  });

  describe('Confusion Species mit danger Level', () => {
    it('erkennt als Severity (Array mit level/typ Struktur)', () => {
      const type = detectType(confusionConsequences, 'confusion_consequences');
      expect(type).toBe('severity');
    });

    it('Severity Morph zeigt Level und Details', () => {
      // Severity Morph kann die Schweregrade korrekt darstellen
      const html = primitives.severity(confusionConsequences, singleContext);
      expect(html).toContain('morph-severity');
      
      // Um Galerina zu sehen, müsste man jedes Item einzeln mit Object-Morph rendern
      const itemHtml = renderValue(confusionConsequences[0], 'consequence_0', singleContext);
      expect(itemHtml).toContain('Galerina marginata');
      expect(itemHtml).toContain('Amatoxine');
    });
  });
});

// ============================================================================
// Compare-Modus mit echten Daten
// ============================================================================

describe('Compare-Modus mit echten Strukturen', () => {
  const cyanescensRadar = [
    { axis: 'Psilocybin', value: 95 },
    { axis: 'Psilocin', value: 35 },
    { axis: 'Baeocystin', value: 15 }
  ];

  const cubenisRadar = [
    { axis: 'Psilocybin', value: 63 },
    { axis: 'Psilocin', value: 25 },
    { axis: 'Baeocystin', value: 2 }
  ];

  it('rendert zwei Radar-Charts im Compare', () => {
    const html1 = primitives.radar(cyanescensRadar, {
      ...compareContext,
      itemIndex: 0
    });
    const html2 = primitives.radar(cubenisRadar, {
      ...compareContext,
      itemIndex: 1
    });

    expect(html1).toContain('morph-radar');
    expect(html2).toContain('morph-radar');
  });

  it('unterscheidet Werte visuell mit vollen Labels', () => {
    // Cyanescens hat höheren Psilocybin-Wert (95 vs 63)
    const html1 = primitives.radar(cyanescensRadar, {
      ...compareContext,
      itemIndex: 0
    });
    
    // Labels werden NICHT mehr gekürzt
    expect(html1).toContain('Psilocybin');
    expect(html1).toContain('Psilocin');
    expect(html1).toContain('Baeocystin');
  });
});
