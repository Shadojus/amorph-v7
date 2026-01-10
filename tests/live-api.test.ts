/**
 * AMORPH v8.5 - Live API Tests
 * ============================
 * Diese Tests laufen IMMER und prüfen ob der Server verfügbar ist.
 * Wenn der Server nicht läuft, werden die Tests übersprungen.
 * 
 * Run: npx vitest run tests/live-api.test.ts
 */

import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:4321';

// Helper für API-Aufrufe mit Timeout
async function fetchAPI(endpoint: string, timeoutMs = 3000): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      signal: AbortSignal.timeout(timeoutMs)
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: null, error: String(error) };
  }
}

// Prüft ob Server läuft - cached das Ergebnis
let _serverCheck: Promise<boolean> | null = null;
async function isServerAvailable(): Promise<boolean> {
  if (!_serverCheck) {
    _serverCheck = (async () => {
      const result = await fetchAPI('/api/nexus');
      return result.ok;
    })();
  }
  return _serverCheck;
}

describe('Live API Tests', () => {
  describe('Server Availability', () => {
    it('should have server running on port 4321', async () => {
      const available = await isServerAvailable();
      if (!available) {
        console.log('⚠️ Server nicht verfügbar - starte mit: npm run dev');
      }
      expect(available).toBe(true);
    });
  });

  describe('Nexus API Status', () => {
    it('should return healthy status', async () => {
      if (!await isServerAvailable()) return;
      
      const { ok, data } = await fetchAPI('/api/nexus');
      expect(ok).toBe(true);
      expect(data.status).toBe('healthy');
    });

    it('should show database connected', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus');
      expect(data.database).toBeDefined();
      expect(data.database.connected).toBe(true);
    });

    it('should have entities in database (verified via entities endpoint)', async () => {
      if (!await isServerAvailable()) return;

      // Zähle Entities über alle Domains
      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi&limit=1');
      expect(data.pagination.total).toBeGreaterThanOrEqual(20);
    });

    it('should have 17 domains', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus');
      expect(data.database.domains).toBe(17);
    });
  });

  describe('Entities API', () => {
    it('should return fungi entities', async () => {
      if (!await isServerAvailable()) return;

      const { ok, data } = await fetchAPI('/api/nexus/entities?domain=fungi');
      
      expect(ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.entities)).toBe(true);
      expect(data.entities.length).toBeGreaterThan(0);
    });

    it('should include pagination', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi');
      
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThanOrEqual(20);
    });

    it('should include domain relation in entities', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi');
      
      const entity = data.entities[0];
      expect(entity.domain).toBeDefined();
      expect(entity.domain.slug).toBe('fungi');
      expect(entity.domain.name).toBe('Fungi');
    });

    it('should work for phyto domain', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=phyto');
      
      expect(data.success).toBe(true);
      expect(data.entities.length).toBeGreaterThan(0);
      expect(data.entities[0].domain.slug).toBe('phyto');
    });

    it('should support pagination', async () => {
      if (!await isServerAvailable()) return;

      const page1 = await fetchAPI('/api/nexus/entities?domain=fungi&page=1&limit=5');
      const page2 = await fetchAPI('/api/nexus/entities?domain=fungi&page=2&limit=5');
      
      expect(page1.data.entities.length).toBe(5);
      expect(page2.data.entities.length).toBe(5);
      expect(page1.data.entities[0].id).not.toBe(page2.data.entities[0].id);
    });
  });

  describe('Entity Data Quality', () => {
    it('should have entities with scientific names', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi&limit=30');
      
      const withScientificName = data.entities.filter((e: any) => e.scientificName);
      expect(withScientificName.length).toBeGreaterThan(10);
    });

    it('should have entities with descriptions', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi&limit=30');
      
      const withDescription = data.entities.filter((e: any) => e.description && e.description.length > 50);
      expect(withDescription.length).toBeGreaterThan(10);
    });

    it('should have entities with images', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/entities?domain=fungi&limit=30');
      
      const withImage = data.entities.filter((e: any) => e.image);
      expect(withImage.length).toBeGreaterThan(5);
    });
  });

  describe('Domains API', () => {
    it('should return all 17 domains', async () => {
      if (!await isServerAvailable()) return;

      const { ok, data } = await fetchAPI('/api/nexus/domains');
      
      expect(ok).toBe(true);
      expect(data.domains.length).toBe(17);
    });

    it('should include fungi domain with correct data', async () => {
      if (!await isServerAvailable()) return;

      const { data } = await fetchAPI('/api/nexus/domains');
      
      const fungi = data.domains.find((d: any) => d.slug === 'fungi');
      expect(fungi).toBeDefined();
      expect(fungi.name).toBe('Fungi');
      expect(fungi.color).toBeDefined();
    });
  });

  describe('Perspectives API', () => {
    it('should return perspectives', async () => {
      if (!await isServerAvailable()) return;

      const { ok, data } = await fetchAPI('/api/nexus/perspectives');
      
      expect(ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.perspectives.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Experts API', () => {
    it('should return experts', async () => {
      if (!await isServerAvailable()) return;

      const { ok, data } = await fetchAPI('/api/nexus/experts');
      
      expect(ok).toBe(true);
      expect(data.success).toBe(true);
      // 8+ experts in current seed data (one per major domain)
      expect(data.experts.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Cross-Domain Validation', () => {
    it('should have entities across multiple domains', async () => {
      if (!await isServerAvailable()) return;

      const domains = ['fungi', 'phyto', 'therion', 'chemo'];
      let totalEntities = 0;

      for (const domain of domains) {
        const { data } = await fetchAPI(`/api/nexus/entities?domain=${domain}&limit=1`);
        if (data.pagination) {
          totalEntities += data.pagination.total;
        }
      }

      expect(totalEntities).toBeGreaterThanOrEqual(80);
    });
  });
});
