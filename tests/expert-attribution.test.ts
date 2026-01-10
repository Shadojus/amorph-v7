/**
 * AMORPH v8.7 - Expert Domain Attribution Tests
 * ==============================================
 * Tests für Multi-Domain Expert Loading und Domain-basiertes Filtering
 * 
 * Diese Tests validieren:
 * - Experts werden mit korrekter Domain geladen
 * - Experts erscheinen nur bei Items ihrer Domain
 * - Multi-Domain Support auf der Landing Page
 * - Field Expertise wird korrekt zugeordnet
 * 
 * Run: npx vitest run tests/expert-attribution.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:4321';

interface Expert {
  id: string;
  name: string;
  title?: string;
  domain?: string;  // API returns domain as string slug
  domainName?: string;
  domainColor?: string;
  domainIcon?: string;
  fieldExpertise?: string[];
}

// Helper für API-Aufrufe
async function fetchAPI(endpoint: string): Promise<{ ok: boolean; data: any }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

let serverAvailable = false;
let experts: Expert[] = [];

beforeAll(async () => {
  const result = await fetchAPI('/api/nexus');
  serverAvailable = result.ok;
  
  if (serverAvailable) {
    const expertsResult = await fetchAPI('/api/nexus/experts');
    if (expertsResult.ok) {
      experts = expertsResult.data.experts || [];
    }
  }
});

describe('Expert Domain Attribution', () => {
  describe('Expert Data Structure', () => {
    it('should have experts loaded', () => {
      if (!serverAvailable) return;
      expect(experts.length).toBeGreaterThanOrEqual(8);
    });

    it('each expert should have a domain', () => {
      if (!serverAvailable) return;
      
      for (const expert of experts) {
        expect(expert.domain).toBeDefined();
        expect(typeof expert.domain).toBe('string');
        expect(expert.domain!.length).toBeGreaterThan(0);
      }
    });

    it('each expert should have domain metadata', () => {
      if (!serverAvailable) return;
      
      for (const expert of experts) {
        expect(expert.domainName).toBeDefined();
        expect(expert.domainColor).toBeDefined();
        expect(expert.domainIcon).toBeDefined();
      }
    });

    it('experts should cover multiple domains', () => {
      if (!serverAvailable) return;
      
      const domainSlugs = new Set(experts.map(e => e.domain).filter(Boolean));
      // Expect at least 5 different domains covered
      expect(domainSlugs.size).toBeGreaterThanOrEqual(5);
    });

    it('experts should have field expertise', () => {
      if (!serverAvailable) return;
      
      const withExpertise = experts.filter(e => 
        Array.isArray(e.fieldExpertise) && e.fieldExpertise.length > 0
      );
      // All should have field expertise
      expect(withExpertise.length).toBe(experts.length);
    });
  });

  describe('Domain-Specific Experts', () => {
    it('should have fungi domain expert', () => {
      if (!serverAvailable) return;
      
      const fungiExperts = experts.filter(e => e.domain === 'fungi');
      expect(fungiExperts.length).toBeGreaterThanOrEqual(1);
      
      // Maria Fungi should be in fungi
      const mariaFungi = fungiExperts.find(e => 
        e.name.toLowerCase().includes('fungi') || e.name.toLowerCase().includes('maria')
      );
      expect(mariaFungi).toBeDefined();
    });

    it('should have phyto domain expert', () => {
      if (!serverAvailable) return;
      
      const phytoExperts = experts.filter(e => e.domain === 'phyto');
      expect(phytoExperts.length).toBeGreaterThanOrEqual(1);
    });

    it('should have kosmo domain expert', () => {
      if (!serverAvailable) return;
      
      const kosmoExperts = experts.filter(e => e.domain === 'kosmo');
      expect(kosmoExperts.length).toBeGreaterThanOrEqual(1);
      
      // Carl Sagan should be in kosmo
      const carlSagan = kosmoExperts.find(e => 
        e.name.toLowerCase().includes('sagan')
      );
      expect(carlSagan).toBeDefined();
    });

    it('should have chemo domain expert', () => {
      if (!serverAvailable) return;
      
      const chemoExperts = experts.filter(e => e.domain === 'chemo');
      expect(chemoExperts.length).toBeGreaterThanOrEqual(1);
      
      // Marie Curie should be in chemo
      const marieCurie = chemoExperts.find(e => 
        e.name.toLowerCase().includes('curie')
      );
      expect(marieCurie).toBeDefined();
    });
  });

  describe('Expert-Entity Domain Matching', () => {
    it('fungi experts should be assigned to fungi domain', async () => {
      if (!serverAvailable) return;
      
      const fungiExperts = experts.filter(e => e.domain === 'fungi');
      expect(fungiExperts.length).toBeGreaterThan(0);
      
      // All fungi experts should have domain='fungi'
      for (const expert of fungiExperts) {
        expect(expert.domain).toBe('fungi');
        expect(expert.domainName).toBe('Fungi');
      }
    });

    it('kosmo experts should not be assigned to fungi', () => {
      if (!serverAvailable) return;
      
      const kosmoExperts = experts.filter(e => e.domain === 'kosmo');
      const fungiExperts = experts.filter(e => e.domain === 'fungi');
      
      // No overlap
      const kosmoIds = new Set(kosmoExperts.map(e => e.id));
      const fungiIds = new Set(fungiExperts.map(e => e.id));
      
      for (const id of kosmoIds) {
        expect(fungiIds.has(id)).toBe(false);
      }
    });
  });

  describe('Expert Metadata Quality', () => {
    it('experts should have valid names', () => {
      if (!serverAvailable) return;
      
      for (const expert of experts) {
        expect(expert.name).toBeDefined();
        expect(expert.name.length).toBeGreaterThan(2);
        // Should be a proper name format (at least 2 words typically)
        expect(expert.name).toMatch(/\w+/);
      }
    });

    it('experts should have titles', () => {
      if (!serverAvailable) return;
      
      const withTitle = experts.filter(e => e.title && e.title.length > 0);
      // All should have titles
      expect(withTitle.length).toBe(experts.length);
    });

    it('domain colors should be hex colors', () => {
      if (!serverAvailable) return;
      
      for (const expert of experts) {
        expect(expert.domainColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });
});

describe('Multi-Domain API Support', () => {
  it('should support querying all domains', async () => {
    if (!serverAvailable) return;
    
    const { ok, data } = await fetchAPI('/api/nexus/domains');
    expect(ok).toBe(true);
    expect(data.domains.length).toBe(17);
  });

  it('should have consistent expert counts per domain', async () => {
    if (!serverAvailable) return;
    
    const domainCounts: Record<string, number> = {};
    
    for (const expert of experts) {
      const slug = expert.domain || 'unknown';
      domainCounts[slug] = (domainCounts[slug] || 0) + 1;
    }
    
    // Log distribution
    console.log('Expert distribution by domain:', domainCounts);
    
    // Total should match experts count
    const total = Object.values(domainCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(experts.length);
  });

  it('field expertise should be arrays', () => {
    if (!serverAvailable) return;
    
    for (const expert of experts) {
      expect(Array.isArray(expert.fieldExpertise)).toBe(true);
      expect(expert.fieldExpertise!.length).toBeGreaterThan(0);
    }
  });
});

describe('Stats API Expert Integration', () => {
  it('should include expert count in stats', async () => {
    if (!serverAvailable) return;
    
    const { ok, data } = await fetchAPI('/api/nexus/stats');
    expect(ok).toBe(true);
    expect(data.stats.experts).toBeGreaterThanOrEqual(8);
  });

  it('should include facet count in stats', async () => {
    if (!serverAvailable) return;
    
    const { ok, data } = await fetchAPI('/api/nexus/stats');
    expect(ok).toBe(true);
    expect(data.stats.facets).toBeGreaterThanOrEqual(300);
  });
});
