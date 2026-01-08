/**
 * AMORPH v7 - Lifecycle Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { lifecycle } from '../../src/morphs/primitives/lifecycle.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('lifecycle morph', () => {
  describe('single mode', () => {
    it('should render lifecycle phases', () => {
      const data = [
        { phase: 'Spore', duration: '1-2 Wochen' },
        { phase: 'Myzel', duration: '2-4 Wochen', active: true },
        { phase: 'Fruchtkörper', duration: '1-2 Wochen' }
      ];
      
      const html = lifecycle(data, singleContext);
      
      expect(html).toContain('morph-lifecycle');
      expect(html).toContain('Spore');
      expect(html).toContain('Myzel');
      expect(html).toContain('Fruchtkörper');
      expect(html).toContain('1-2 Wochen');
      expect(html).toContain('morph-lifecycle-phase--active');
    });

    it('should handle German field names', () => {
      const data = [
        { name: 'Phase 1', dauer: '5 Tage', aktiv: true }
      ];
      
      const html = lifecycle(data, singleContext);
      
      expect(html).toContain('Phase 1');
      expect(html).toContain('5 Tage');
    });

    it('should render phases without duration', () => {
      const data = [
        { phase: 'Start' },
        { phase: 'Middle' },
        { phase: 'End' }
      ];
      
      const html = lifecycle(data, singleContext);
      
      expect(html).toContain('Start');
      expect(html).toContain('Middle');
      expect(html).toContain('End');
    });

    it('should handle simple string array', () => {
      const data = ['Phase A', 'Phase B', 'Phase C'];
      
      const html = lifecycle(data, singleContext);
      
      expect(html).toContain('morph-lifecycle');
    });
  });

  describe('compare mode', () => {
    it('should render lifecycle comparison', () => {
      const ctx = createCompareContextWithValues('lifecycle', [
        [{ phase: 'A', duration: '1w' }],
        [{ phase: 'A', duration: '2w' }]
      ]);
      
      const html = lifecycle(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
