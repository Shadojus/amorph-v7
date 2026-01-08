/**
 * AMORPH v7 - Citation Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { citation } from '../../src/morphs/primitives/citation.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('citation morph', () => {
  describe('single mode', () => {
    it('should render full citation', () => {
      const data = {
        authors: 'Smith, J. & Doe, A.',
        year: 2023,
        title: 'A Study on Mushrooms',
        journal: 'Journal of Mycology',
        doi: '10.1234/jom.2023.001'
      };
      
      const html = citation(data, singleContext);
      
      expect(html).toContain('morph-citation');
      expect(html).toContain('Smith, J. &amp; Doe, A.');
      expect(html).toContain('2023');
      expect(html).toContain('A Study on Mushrooms');
      expect(html).toContain('Journal of Mycology');
      expect(html).toContain('doi.org');
    });

    it('should handle German field names', () => {
      const data = {
        autoren: 'Müller, H.',
        jahr: 2022,
        titel: 'Pilzforschung',
        zeitschrift: 'Mykologie Heute'
      };
      
      const html = citation(data, singleContext);
      
      expect(html).toContain('Müller, H.');
      expect(html).toContain('2022');
    });

    it('should handle minimal citation', () => {
      const data = {
        authors: 'Anonymous',
        year: 2020
      };
      
      const html = citation(data, singleContext);
      
      expect(html).toContain('Anonymous');
      expect(html).toContain('2020');
    });

    it('should handle full URL as doi', () => {
      const data = {
        authors: 'Test Author',
        year: 2024,
        doi: 'https://example.com/paper'
      };
      
      const html = citation(data, singleContext);
      
      expect(html).toContain('href="https://example.com/paper"');
    });
  });

  describe('compare mode', () => {
    it('should render citation comparison', () => {
      const ctx = createCompareContextWithValues('citation', [
        { authors: 'A', year: 2020 },
        { authors: 'B', year: 2021 }
      ]);
      
      const html = citation(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
