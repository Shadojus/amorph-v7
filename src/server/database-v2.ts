/**
 * AMORPH - Database Configuration v8.0
 * 
 * PostgreSQL/SQLite via Prisma Configuration.
 * Verwendet lokale JSON-Daten als Standard (DATA_SOURCE=local).
 * 
 * Bei DATA_SOURCE=postgresql wird Prisma verwendet.
 */

import { getSiteType, getSiteDomain, SITE_META, SITE_DOMAIN, type SiteType, type Domain } from './config';

// Database Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'file:../shared/database/prisma/dev.db';
const DATA_SOURCE = process.env.DATA_SOURCE || 'local';

// ============================================================================
// DOMAIN CONFIGURATION
// ============================================================================

// 17 Domain Types (matching amorph-* blueprint folders)
export type DomainSlug = 
  // Biology
  | 'fungi' | 'phyto' | 'drako'
  // Geology  
  | 'paleo' | 'tekto' | 'mine'
  // Biomedical
  | 'bakterio' | 'viro' | 'geno' | 'anato'
  // Physics & Chemistry
  | 'chemo' | 'physi' | 'kosmo'
  // Technology
  | 'netzo' | 'cognito' | 'biotech' | 'socio';

// All 17 domain slugs
export const ALL_DOMAINS: DomainSlug[] = [
  // Biology
  'fungi', 'phyto', 'drako',
  // Geology
  'paleo', 'tekto', 'mine',
  // Biomedical
  'bakterio', 'viro', 'geno', 'anato',
  // Physics & Chemistry
  'chemo', 'physi', 'kosmo',
  // Technology
  'netzo', 'cognito', 'biotech', 'socio'
];

// Map domain slug to category
export function getDomainCategory(domainSlug: DomainSlug): Domain {
  const domainMap: Record<DomainSlug, Domain> = {
    fungi: 'biology', phyto: 'biology', drako: 'biology',
    paleo: 'geology', tekto: 'geology', mine: 'geology',
    bakterio: 'biomedical', viro: 'biomedical', geno: 'biomedical', anato: 'biomedical',
    chemo: 'physchem', physi: 'physchem', kosmo: 'physchem',
    netzo: 'technology', cognito: 'technology', biotech: 'technology', socio: 'technology'
  };
  return domainMap[domainSlug] || 'biology';
}

// Map legacy category names to domain slugs
const LEGACY_CATEGORY_MAP: Record<string, DomainSlug> = {
  // Biology (legacy)
  'fungi': 'fungi', 'mushrooms': 'fungi',
  'phyto': 'phyto', 'plantae': 'phyto', 'plants': 'phyto',
  'drako': 'drako', 'therion': 'drako', 'animals': 'drako',
  // Geology
  'paleo': 'paleo', 'paleontology': 'paleo', 'fossils': 'paleo',
  'tekto': 'tekto', 'tectonics': 'tekto',
  'mine': 'mine', 'mineralogy': 'mine', 'minerals': 'mine',
  // Biomedical
  'bakterio': 'bakterio', 'microbiology': 'bakterio', 'bacteria': 'bakterio',
  'viro': 'viro', 'virology': 'viro', 'viruses': 'viro',
  'geno': 'geno', 'genetics': 'geno',
  'anato': 'anato', 'anatomy': 'anato',
  // Physics & Chemistry
  'chemo': 'chemo', 'chemistry': 'chemo',
  'physi': 'physi', 'physics': 'physi',
  'kosmo': 'kosmo', 'astronomy': 'kosmo', 'cosmos': 'kosmo',
  // Technology
  'netzo': 'netzo', 'informatics': 'netzo', 'computing': 'netzo',
  'cognito': 'cognito', 'ai': 'cognito',
  'biotech': 'biotech', 'biotechnology': 'biotech',
  'socio': 'socio', 'sociology': 'socio'
};

// Perspectives per domain
const DOMAIN_PERSPECTIVES: Record<DomainSlug, readonly string[]> = {
  // Biology
  fungi: ['overview', 'identification', 'ecology', 'medicine', 'cultivation', 'chemistry'],
  phyto: ['overview', 'identification', 'ecology', 'medicine', 'cultivation', 'chemistry'],
  drako: ['overview', 'identification', 'ecology', 'behavior', 'conservation', 'anatomy'],
  // Geology
  paleo: ['overview', 'identification', 'stratigraphy', 'evolution', 'biogeography', 'taphonomy'],
  tekto: ['overview', 'identification', 'structure', 'processes', 'hazards', 'resources'],
  mine: ['overview', 'identification', 'crystallography', 'formation', 'uses', 'localities'],
  // Biomedical
  bakterio: ['overview', 'identification', 'metabolism', 'pathogenicity', 'ecology', 'applications'],
  viro: ['overview', 'identification', 'structure', 'replication', 'pathogenesis', 'treatment'],
  geno: ['overview', 'structure', 'expression', 'inheritance', 'mutations', 'applications'],
  anato: ['overview', 'structure', 'function', 'development', 'pathology', 'imaging'],
  // Physics & Chemistry
  chemo: ['overview', 'structure', 'properties', 'reactions', 'synthesis', 'applications'],
  physi: ['overview', 'mechanics', 'thermodynamics', 'electromagnetism', 'quantum', 'applications'],
  kosmo: ['overview', 'observation', 'formation', 'composition', 'dynamics', 'exploration'],
  // Technology
  netzo: ['overview', 'architecture', 'protocols', 'security', 'applications', 'trends'],
  cognito: ['overview', 'algorithms', 'learning', 'applications', 'ethics', 'research'],
  biotech: ['overview', 'techniques', 'applications', 'ethics', 'regulation', 'research'],
  socio: ['overview', 'theory', 'methods', 'institutions', 'culture', 'globalization']
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get domain slug from legacy category name
 */
export function getDomainSlug(category: string): DomainSlug {
  return LEGACY_CATEGORY_MAP[category.toLowerCase()] || 'fungi';
}

/**
 * Get all domain slugs
 */
export function getAllDomains(): DomainSlug[] {
  return [...ALL_DOMAINS];
}

/**
 * Get perspectives for a domain
 */
export function getPerspectivesForDomain(domainSlug: DomainSlug): readonly string[] {
  return DOMAIN_PERSPECTIVES[domainSlug] || DOMAIN_PERSPECTIVES.fungi;
}

/**
 * Check if using local data source
 */
export function isLocalDataSource(): boolean {
  return DATA_SOURCE === 'local';
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
  return {
    url: DATABASE_URL,
    dataSource: DATA_SOURCE,
    isLocal: isLocalDataSource()
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const databaseConfig = {
  url: DATABASE_URL,
  dataSource: DATA_SOURCE
};
