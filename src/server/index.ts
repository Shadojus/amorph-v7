/**
 * AMORPH v8 - Server Index
 * 
 * Re-Exports für Server-Module.
 * PostgreSQL/Prisma Edition (PocketBase deprecated)
 */

// Data & Config
export { 
  loadConfig, getConfig, getPerspective, getAllPerspectives, getFieldConfig,
  // Site Types & Domain
  getSiteType, getSiteDomain, SITE_META, SITE_DOMAIN,
  type SiteType, type Domain, type BiologySiteType, type GeologySiteType
} from './config';
export { loadAllItems, getItem, getItems, searchItems, type SearchOptions, type SearchResult } from './data';
export { cache, cachedFetch, invalidateSpeciesCache } from './cache';

// Security & Rate Limiting
export { apiRateLimiter, strictRateLimiter, checkRateLimit, getClientIP, getRateLimitHeaders } from './rate-limiter';
export { getSecurityHeaders, handleCORS, applySecurityHeaders, sanitizeInput, validateSlug, createPreflightResponse } from './security';

// Logging
export { logger, createLogger, logRequest } from './logger';
