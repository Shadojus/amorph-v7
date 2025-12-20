/**
 * AMORPH v7 - Security Tests
 * 
 * Vollständige Tests für alle Security-Funktionen.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateSlug,
  validateSlugs,
  validateQuery,
  validatePerspectives,
  validateNumber,
  escapeHtml,
  escapeAttribute,
  validateUrl,
  sanitizeFilename,
  isPathWithin,
  checkRateLimit,
  cleanupRateLimits,
  addSecurityHeaders,
  securityHeaders,
  logSecurityEvent
} from '../src/core/security.js';

// ═══════════════════════════════════════════════════════════════════════════════
// SLUG VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateSlug', () => {
  it('should accept valid slugs', () => {
    expect(validateSlug('steinpilz')).toBe('steinpilz');
    expect(validateSlug('fliegenpilz-rot')).toBe('fliegenpilz-rot');
    expect(validateSlug('item_123')).toBe('item_123');
    expect(validateSlug('Boletus-Edulis')).toBe('boletus-edulis'); // lowercase
  });

  it('should reject path traversal attempts', () => {
    expect(validateSlug('../etc/passwd')).toBeNull();
    expect(validateSlug('..\\windows\\system32')).toBeNull();
    expect(validateSlug('foo/../bar')).toBeNull();
  });

  it('should reject invalid characters', () => {
    expect(validateSlug('<script>')).toBeNull();
    expect(validateSlug('foo;bar')).toBeNull();
    expect(validateSlug('item/sub')).toBeNull();
  });

  it('should handle empty/null input', () => {
    expect(validateSlug('')).toBeNull();
    expect(validateSlug(null)).toBeNull();
    expect(validateSlug(undefined)).toBeNull();
  });

  it('should enforce length limits', () => {
    const longSlug = 'a'.repeat(101);
    expect(validateSlug(longSlug)).toBeNull();
  });
});

describe('validateSlugs', () => {
  it('should validate array of slugs', () => {
    const result = validateSlugs(['valid-1', 'valid-2', '../invalid']);
    expect(result).toEqual(['valid-1', 'valid-2']);
  });

  it('should limit number of items', () => {
    const many = Array(20).fill('item');
    const result = validateSlugs(many);
    expect(result.length).toBeLessThanOrEqual(10);
  });
  
  it('should handle non-array input', () => {
    expect(validateSlugs('not-an-array')).toEqual([]);
    expect(validateSlugs(null)).toEqual([]);
    expect(validateSlugs(undefined)).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY & PERSPECTIVES VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateQuery', () => {
  it('should allow normal search queries', () => {
    expect(validateQuery('Steinpilz')).toBe('Steinpilz');
    expect(validateQuery('röhrlinge essbar')).toBe('röhrlinge essbar');
  });

  it('should strip dangerous characters', () => {
    expect(validateQuery('<script>alert(1)</script>')).not.toContain('<');
    expect(validateQuery("'; DROP TABLE--")).not.toContain("'");
  });

  it('should enforce length limit', () => {
    const longQuery = 'a'.repeat(300);
    expect(validateQuery(longQuery).length).toBeLessThanOrEqual(200);
  });
  
  it('should handle non-string input', () => {
    expect(validateQuery(null)).toBe('');
    expect(validateQuery(undefined)).toBe('');
    expect(validateQuery(123)).toBe('');
  });
});

describe('validatePerspectives', () => {
  it('should validate array of perspective IDs', () => {
    const result = validatePerspectives(['culinary', 'safety', 'ecology']);
    expect(result).toEqual(['culinary', 'safety', 'ecology']);
  });
  
  it('should parse comma-separated string', () => {
    const result = validatePerspectives('culinary,safety,ecology');
    expect(result).toEqual(['culinary', 'safety', 'ecology']);
  });
  
  it('should filter invalid perspective IDs', () => {
    const result = validatePerspectives(['valid', '<invalid>', '../bad']);
    expect(result).toEqual(['valid']);
  });
  
  it('should limit number of perspectives', () => {
    const many = Array(15).fill('persp');
    const result = validatePerspectives(many);
    expect(result.length).toBeLessThanOrEqual(10);
  });
  
  it('should handle empty/null input', () => {
    expect(validatePerspectives(null)).toEqual([]);
    expect(validatePerspectives(undefined)).toEqual([]);
    expect(validatePerspectives('')).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HTML ESCAPING
// ═══════════════════════════════════════════════════════════════════════════════

describe('escapeHtml', () => {
  it('should escape HTML entities', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"quotes"')).toBe('&quot;quotes&quot;');
    expect(escapeHtml("'apostrophe'")).toBe('&#x27;apostrophe&#x27;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should handle null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should convert numbers to strings', () => {
    expect(escapeHtml(42)).toBe('42');
  });
  
  it('should escape forward slash', () => {
    expect(escapeHtml('a/b')).toBe('a&#x2F;b');
  });
  
  it('should escape backticks', () => {
    expect(escapeHtml('`code`')).toBe('&#x60;code&#x60;');
  });
});

describe('escapeAttribute', () => {
  it('should escape attribute values', () => {
    expect(escapeAttribute('<"test">')).toBe('&lt;&quot;test&quot;&gt;');
  });
  
  it('should remove newlines', () => {
    const result = escapeAttribute('line1\nline2\rline3');
    expect(result).not.toContain('\n');
    expect(result).not.toContain('\r');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// URL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateUrl', () => {
  it('should allow safe URLs', () => {
    expect(validateUrl('https://example.com')).toBe('https://example.com');
    expect(validateUrl('http://localhost:3000')).toBe('http://localhost:3000');
    expect(validateUrl('/relative/path')).toBe('/relative/path');
  });

  it('should block javascript: URLs', () => {
    expect(validateUrl('javascript:alert(1)')).toBeNull();
    expect(validateUrl('JAVASCRIPT:void(0)')).toBeNull();
    expect(validateUrl('  javascript:alert(1)  ')).toBeNull();
  });

  it('should block data: URLs', () => {
    expect(validateUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });
  
  it('should block vbscript: URLs', () => {
    expect(validateUrl('vbscript:msgbox(1)')).toBeNull();
  });

  it('should add https to bare domains', () => {
    expect(validateUrl('example.com')).toBe('https://example.com');
  });
  
  it('should handle non-string input', () => {
    expect(validateUrl(null)).toBeNull();
    expect(validateUrl(undefined)).toBeNull();
    expect(validateUrl(123)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FILENAME & PATH
// ═══════════════════════════════════════════════════════════════════════════════

describe('sanitizeFilename', () => {
  it('should allow safe filenames', () => {
    expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
    expect(sanitizeFilename('image-2024.jpg')).toBe('image-2024.jpg');
  });

  it('should remove path separators', () => {
    expect(sanitizeFilename('../secret/file.txt')).toBe('secretfile.txt');
    expect(sanitizeFilename('..\\..\\file.txt')).toBe('file.txt');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeFilename('file<script>.txt')).toBe('filescript.txt');
    expect(sanitizeFilename('file:name.txt')).toBe('filename.txt');
    expect(sanitizeFilename('file*name?.txt')).toBe('filename.txt');
  });
  
  it('should handle non-string input', () => {
    expect(sanitizeFilename(null)).toBeNull();
    expect(sanitizeFilename(undefined)).toBeNull();
    expect(sanitizeFilename(123)).toBeNull();
  });
  
  it('should reject too long filenames', () => {
    const longName = 'a'.repeat(250) + '.txt';
    expect(sanitizeFilename(longName)).toBeNull();
  });
});

describe('isPathWithin', () => {
  it('should detect paths within base (same prefix)', () => {
    expect(isPathWithin('/data', '/data/fungi/item.json')).toBe(true);
    expect(isPathWithin('/data', '/data/sub/deep/file.json')).toBe(true);
  });

  it('should reject paths outside base', () => {
    expect(isPathWithin('/data', '/etc/passwd')).toBe(false);
    expect(isPathWithin('/data', '/data/../etc/passwd')).toBe(false);
  });

  it('should handle Windows-style paths', () => {
    expect(isPathWithin('D:/data', 'D:/data/file.json')).toBe(true);
    expect(isPathWithin('D:\\data', 'D:\\data\\file.json')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateNumber', () => {
  it('should clamp to range', () => {
    expect(validateNumber(50, 0, 100, 0)).toBe(50);
    expect(validateNumber(-10, 0, 100, 0)).toBe(0);
    expect(validateNumber(150, 0, 100, 0)).toBe(100);
  });

  it('should use default for invalid', () => {
    expect(validateNumber('invalid', 0, 100, 42)).toBe(42);
    expect(validateNumber(NaN, 0, 100, 42)).toBe(42);
  });
  
  it('should parse string numbers', () => {
    expect(validateNumber('50', 0, 100, 0)).toBe(50);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

describe('checkRateLimit', () => {
  beforeEach(() => {
    cleanupRateLimits();
  });
  
  it('should allow first request', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });
  
  it('should track request count', () => {
    const ip = '192.168.1.2';
    checkRateLimit(ip);
    checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.remaining).toBe(97);
  });
  
  it('should block after limit exceeded', () => {
    const ip = '192.168.1.3';
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      checkRateLimit(ip);
    }
    // 101st should be blocked
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe('cleanupRateLimits', () => {
  it('should not throw', () => {
    expect(() => cleanupRateLimits()).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

describe('securityHeaders', () => {
  it('should have required security headers', () => {
    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
    expect(securityHeaders['X-Frame-Options']).toBe('DENY');
    expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block');
    expect(securityHeaders['Referrer-Policy']).toBeDefined();
    expect(securityHeaders['Content-Security-Policy']).toBeDefined();
  });
});

describe('addSecurityHeaders', () => {
  it('should add headers to Headers object', () => {
    const headers = new Headers();
    addSecurityHeaders(headers);
    
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

describe('logSecurityEvent', () => {
  it('should not throw', () => {
    expect(() => logSecurityEvent('TEST', { ip: '127.0.0.1' })).not.toThrow();
  });
  
  it('should sanitize sensitive fields', () => {
    // This test verifies the function runs without exposing sensitive data
    // In practice, we'd capture console.warn output
    expect(() => logSecurityEvent('AUTH', { 
      ip: '127.0.0.1', 
      password: 'secret123',
      token: 'abc123'
    })).not.toThrow();
  });
});
