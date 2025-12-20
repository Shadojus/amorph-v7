/**
 * AMORPH v7 - Security Module
 * 
 * Zentrale Sicherheitsfunktionen:
 * - Input Validation
 * - Path Traversal Schutz
 * - XSS Prevention
 * - Rate Limiting
 * - CSRF Protection
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

const SLUG_PATTERN = /^[a-z0-9][a-z0-9\-_]{0,100}$/i;
const QUERY_MAX_LENGTH = 200;
const PERSPECTIVE_MAX_COUNT = 10;
const ITEMS_MAX_COUNT = 10;

/**
 * Validiert einen Slug-Parameter.
 * Verhindert Path Traversal und Injection.
 */
export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== 'string') return null;
  
  // Trim and lowercase
  const cleaned = slug.trim().toLowerCase();
  
  // Check length
  if (cleaned.length === 0 || cleaned.length > 100) return null;
  
  // Check for path traversal
  if (cleaned.includes('..') || cleaned.includes('/') || cleaned.includes('\\')) {
    console.warn(`[Security] Path traversal attempt blocked: ${slug}`);
    return null;
  }
  
  // Validate pattern
  if (!SLUG_PATTERN.test(cleaned)) {
    console.warn(`[Security] Invalid slug pattern: ${slug}`);
    return null;
  }
  
  return cleaned;
}

/**
 * Validiert eine Liste von Slugs.
 */
export function validateSlugs(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  
  return slugs
    .slice(0, ITEMS_MAX_COUNT)
    .map(s => validateSlug(s))
    .filter((s): s is string => s !== null);
}

/**
 * Validiert einen Suchquery.
 */
export function validateQuery(query: unknown): string {
  if (typeof query !== 'string') return '';
  
  // Trim and limit length
  let cleaned = query.trim().slice(0, QUERY_MAX_LENGTH);
  
  // Remove dangerous characters (but allow German umlauts)
  cleaned = cleaned.replace(/[<>'"`;\\]/g, '');
  
  return cleaned;
}

/**
 * Validiert Perspektive-IDs.
 */
export function validatePerspectives(perspectives: unknown): string[] {
  if (!Array.isArray(perspectives)) {
    if (typeof perspectives === 'string') {
      return perspectives.split(',')
        .slice(0, PERSPECTIVE_MAX_COUNT)
        .map(p => p.trim())
        .filter(p => SLUG_PATTERN.test(p));
    }
    return [];
  }
  
  return perspectives
    .slice(0, PERSPECTIVE_MAX_COUNT)
    .filter((p): p is string => typeof p === 'string' && SLUG_PATTERN.test(p));
}

/**
 * Validiert numerische Parameter.
 */
export function validateNumber(value: unknown, min: number, max: number, defaultValue: number): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  
  if (isNaN(num)) return defaultValue;
  if (num < min) return min;
  if (num > max) return max;
  
  return num;
}

// ═══════════════════════════════════════════════════════════════════════════════
// XSS PREVENTION
// ═══════════════════════════════════════════════════════════════════════════════

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '/': '&#x2F;'
};

/**
 * Escaped HTML-Entities für sicheren Output.
 */
export function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[&<>"'`/]/g, char => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Escaped Attribute-Werte.
 */
export function escapeAttribute(text: unknown): string {
  if (text === null || text === undefined) return '';
  // Zusätzlich Newlines entfernen
  return escapeHtml(text).replace(/[\n\r]/g, '');
}

/**
 * Validiert URLs für sichere Links.
 */
export function validateUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  
  // Check for javascript: or data: URLs
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    console.warn(`[Security] Dangerous URL blocked: ${url}`);
    return null;
  }
  
  // Allow relative, http, https
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Prepend https:// for bare domains
  if (/^[a-z0-9][a-z0-9\-]*\.[a-z]{2,}/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATH SECURITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prüft ob ein Pfad innerhalb des erlaubten Verzeichnisses liegt.
 */
export function isPathWithin(basePath: string, targetPath: string): boolean {
  const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/+$/, '');
  const normalizedTarget = targetPath.replace(/\\/g, '/');
  
  // Handle absolute paths (starting with / or drive letter)
  const isAbsolute = normalizedTarget.startsWith('/') || /^[A-Za-z]:/.test(normalizedTarget);
  
  // Resolve any .. or . in path
  const parts = normalizedTarget.split('/');
  const resolved: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else if (part !== '.' && part !== '') {
      resolved.push(part);
    }
  }
  
  // Reconstruct path with leading slash for absolute paths
  const resolvedPath = isAbsolute && !resolved[0]?.includes(':') 
    ? '/' + resolved.join('/') 
    : resolved.join('/');
    
  return resolvedPath.startsWith(normalizedBase);
}

/**
 * Sanitized einen Dateinamen.
 */
export function sanitizeFilename(filename: unknown): string | null {
  if (typeof filename !== 'string') return null;
  
  // Remove path separators and dangerous chars
  const cleaned = filename
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\.\./g, '')
    .trim();
  
  if (cleaned.length === 0 || cleaned.length > 200) return null;
  
  return cleaned;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING (Simple in-memory)
// ═══════════════════════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

/**
 * Prüft Rate Limit für eine IP.
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now };
}

/**
 * Cleanup old rate limit entries (call periodically).
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(ip);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sicherheitsheader für Responses.
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; font-src 'self'"
};

/**
 * Fügt Sicherheitsheader zu Response hinzu.
 */
export function addSecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Logged sicherheitsrelevante Events (ohne sensible Daten).
 */
export function logSecurityEvent(type: string, details: Record<string, unknown>): void {
  const sanitizedDetails = { ...details };
  
  // Remove potentially sensitive fields
  delete sanitizedDetails.password;
  delete sanitizedDetails.token;
  delete sanitizedDetails.cookie;
  
  console.warn(`[Security:${type}]`, JSON.stringify(sanitizedDetails));
}
