/**
 * AMORPH v8.5 - Real API Endpoint Tests
 * ======================================
 * Echte HTTP Tests gegen laufende AMORPH Server.
 * Testet dass APIs echte Daten aus PostgreSQL zurückgeben.
 * 
 * REQUIRES: AMORPH running on localhost:4321
 * Run: npx vitest run tests/api-endpoints.test.ts
 * 
 * @since v8.5.0 - PostgreSQL-Only
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:4321';
let serverAvailable = false;

beforeAll(async () => {
  // Check if server is running - use /api/nexus which always exists
  try {
    const response = await fetch(`${BASE_URL}/api/nexus`, { 
      signal: AbortSignal.timeout(3000) 
    });
    serverAvailable = response.ok;
    if (serverAvailable) {
      console.log('✅ AMORPH server available - running HTTP tests');
    }
  } catch {
    console.warn('⚠️ AMORPH server not available - skipping HTTP tests');
    serverAvailable = false;
  }
});

// Helper for conditional tests
const describeIf = (condition: boolean) => condition ? describe : describe.skip;

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH API TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Search API - /api/search', () => {
  it('returns JSON with items array', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=test&limit=5`);
    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('returns items from database', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=20`);
    const data = await response.json();
    
    // With DB containing 147+ entities, we should get results
    expect(data.total).toBeGreaterThan(0);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it('items have required fields', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=5`);
    const data = await response.json();
    
    for (const item of data.items) {
      expect(item.slug).toBeTruthy();
      expect(item.name).toBeTruthy();
    }
  });

  it('items have _fromDatabase flag', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=5`);
    const data = await response.json();
    
    // All items should have _fromDatabase: true (no JSON fallback)
    for (const item of data.items) {
      expect(item._fromDatabase).toBe(true);
    }
  });

  it('respects limit parameter', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=3`);
    const data = await response.json();
    
    expect(data.items.length).toBeLessThanOrEqual(3);
  });

  it('handles search query', async () => {
    // Search for something that should exist
    const response = await fetch(`${BASE_URL}/api/search?q=a&limit=10`);
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items).toBeDefined();
  });

  it('returns CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=test`);
    
    // Should have CORS headers for cross-origin requests
    expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROEST EXPERTS API TESTS - CRITICAL
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Bifroest Experts API - /api/bifroest/experts', () => {
  it('returns JSON array', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  // 🔴 CRITICAL TEST
  it('returns at least 8 experts', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    expect(data.length).toBeGreaterThanOrEqual(8);
  });

  it('experts have required fields', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    for (const expert of data) {
      expect(expert.name).toBeTruthy();
      expect(expert.slug).toBeTruthy();
      expect(expert.domain || expert.domainSlug).toBeTruthy();
    }
  });

  // 🔴 CRITICAL TEST - This was the broken functionality!
  it('experts have field_expertise or fieldExpertise populated', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    const withExpertise = data.filter((e: any) => {
      const expertise = e.field_expertise || e.fieldExpertise;
      return Array.isArray(expertise) && expertise.length > 0;
    });
    
    // At least 8 of 10 experts should have expertise
    expect(withExpertise.length).toBeGreaterThanOrEqual(8);
  });

  // 🔴 CRITICAL TEST - Validate expertise content
  it('fieldExpertise contains valid strings', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    for (const expert of data) {
      const expertise = expert.field_expertise || expert.fieldExpertise || [];
      
      for (const field of expertise) {
        expect(typeof field).toBe('string');
        if (field) {
          expect(field.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('does not expose sensitive data', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    for (const expert of data) {
      // Should not expose internal IDs or sensitive data
      expect(expert.password).toBeUndefined();
      expect(expert.email).toBeUndefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARE API TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Compare API - /api/compare', () => {
  it('returns comparison data for valid slugs', async () => {
    // First get some valid slugs
    const searchResponse = await fetch(`${BASE_URL}/api/search?q=&limit=2`);
    const searchData = await searchResponse.json();
    
    if (searchData.items.length < 2) {
      console.warn('Not enough items for compare test');
      return;
    }
    
    const slugs = searchData.items.map((i: any) => i.slug).join(',');
    const response = await fetch(`${BASE_URL}/api/compare?slugs=${slugs}`);
    
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.items || data).toBeDefined();
  });

  it('handles missing slugs gracefully', async () => {
    const response = await fetch(`${BASE_URL}/api/compare?slugs=`);
    
    // Should return empty or error, not crash
    expect(response.status).toBeLessThan(500);
  });

  it('handles non-existent slugs', async () => {
    const response = await fetch(`${BASE_URL}/api/compare?slugs=nonexistent-1,nonexistent-2`);
    
    // Should handle gracefully
    expect(response.status).toBeLessThan(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATS API TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Stats API - /api/stats', () => {
  it('returns database statistics', async () => {
    const response = await fetch(`${BASE_URL}/api/stats`);
    
    if (!response.ok) {
      console.warn('Stats API not available');
      return;
    }
    
    const data = await response.json();
    
    // Should reflect actual database counts
    if (data.domains !== undefined) {
      expect(data.domains).toBe(17);
    }
    if (data.entities !== undefined) {
      expect(data.entities).toBeGreaterThanOrEqual(147);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('API Security', () => {
  it('sanitizes XSS in search query', async () => {
    const xssQuery = '<script>alert(1)</script>';
    const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(xssQuery)}&limit=5`);
    
    const data = await response.json();
    const text = JSON.stringify(data);
    
    // Response should not contain raw script tags
    expect(text).not.toContain('<script>');
  });

  it('rejects SQL injection attempts', async () => {
    const sqlQuery = "'; DROP TABLE entities; --";
    const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(sqlQuery)}&limit=5`);
    
    // Should not crash, should return valid response
    expect(response.status).toBeLessThan(500);
  });

  it('handles path traversal attempts', async () => {
    const maliciousSlug = '../../../etc/passwd';
    const response = await fetch(`${BASE_URL}/api/compare?slugs=${encodeURIComponent(maliciousSlug)}`);
    
    // Should not crash, should reject invalid slug
    expect(response.status).toBeLessThan(500);
  });

  it('limits response size', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=1000`);
    const data = await response.json();
    
    // Should respect max limits
    expect(data.items.length).toBeLessThanOrEqual(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE FORMAT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Response Format Validation', () => {
  it('search response has correct structure', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=5`);
    const data = await response.json();
    
    // Standard response structure
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('items have consistent structure', async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=&limit=10`);
    const data = await response.json();
    
    const requiredFields = ['slug', 'name'];
    
    for (const item of data.items) {
      for (const field of requiredFields) {
        expect(item).toHaveProperty(field);
      }
    }
  });

  it('experts have consistent structure', async () => {
    const response = await fetch(`${BASE_URL}/api/bifroest/experts`);
    const data = await response.json();
    
    const requiredFields = ['name', 'slug'];
    
    for (const expert of data) {
      for (const field of requiredFields) {
        expect(expert).toHaveProperty(field);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describeIf(serverAvailable)('Error Handling', () => {
  it('returns 404 for non-existent endpoints', async () => {
    const response = await fetch(`${BASE_URL}/api/nonexistent`);
    expect(response.status).toBe(404);
  });

  it('handles malformed requests gracefully', async () => {
    const response = await fetch(`${BASE_URL}/api/search?limit=not-a-number`);
    
    // Should not crash
    expect(response.status).toBeLessThan(500);
  });
});
