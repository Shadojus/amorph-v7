/**
 * AMORPH v7 - Dosage Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { dosage } from '../../src/morphs/primitives/dosage.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('dosage morph', () => {
  describe('single mode', () => {
    it('should render dosage list', () => {
      const data = [
        { amount: 500, unit: 'mg', frequency: '2x täglich', route: 'oral' },
        { amount: 100, unit: 'ml', frequency: '1x täglich', route: 'i.v.' }
      ];
      
      const html = dosage(data, singleContext);
      
      expect(html).toContain('morph-dosage');
      expect(html).toContain('500');
      expect(html).toContain('mg');
      expect(html).toContain('2x täglich');
      expect(html).toContain('oral');
    });

    it('should handle German field names', () => {
      const data = [
        { menge: 250, einheit: 'mg', frequenz: 'täglich', verabreichung: 'oral' }
      ];
      
      const html = dosage(data, singleContext);
      
      expect(html).toContain('250');
      expect(html).toContain('mg');
    });

    it('should handle minimal dosage', () => {
      const data = [{ amount: 10, unit: 'g' }];
      
      const html = dosage(data, singleContext);
      
      expect(html).toContain('10');
      expect(html).toContain('g');
    });

    it('should handle single item (not array)', () => {
      const data = { amount: 50, unit: 'mg' };
      
      const html = dosage(data, singleContext);
      
      expect(html).toContain('50');
    });
  });

  describe('compare mode', () => {
    it('should render dosage comparison', () => {
      const ctx = createCompareContextWithValues('dosage', [
        [{ amount: 100, unit: 'mg' }],
        [{ amount: 200, unit: 'mg' }]
      ]);
      
      const html = dosage(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
