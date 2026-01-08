/**
 * AMORPH v7 - Steps Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { steps } from '../../src/morphs/primitives/steps.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('steps morph', () => {
  describe('single mode', () => {
    it('should render basic step list', () => {
      const data = [
        { step: 1, label: 'Vorbereitung', status: 'complete' },
        { step: 2, label: 'Durchführung', status: 'active' },
        { step: 3, label: 'Abschluss', status: 'pending' }
      ];
      
      const html = steps(data, singleContext);
      
      expect(html).toContain('morph-steps');
      expect(html).toContain('Vorbereitung');
      expect(html).toContain('Durchführung');
      expect(html).toContain('Abschluss');
      expect(html).toContain('morph-step--complete');
      expect(html).toContain('morph-step--active');
      expect(html).toContain('morph-step--pending');
    });

    it('should handle German field names', () => {
      const data = [
        { schritt: 1, name: 'Schritt Eins', status: 'completed' }
      ];
      
      const html = steps(data, singleContext);
      
      expect(html).toContain('Schritt Eins');
    });

    it('should handle missing status', () => {
      const data = [{ step: 1, label: 'Test' }];
      
      const html = steps(data, singleContext);
      
      expect(html).toContain('morph-step--pending');
    });

    it('should handle simple array values', () => {
      const data = ['Step 1', 'Step 2', 'Step 3'];
      
      const html = steps(data, singleContext);
      
      expect(html).toContain('morph-steps');
    });
  });

  describe('compare mode', () => {
    it('should render multiple step lists for comparison', () => {
      const ctx = createCompareContextWithValues('steps', [
        [{ step: 1, label: 'A', status: 'complete' }],
        [{ step: 1, label: 'B', status: 'pending' }]
      ]);
      
      const html = steps(null, ctx);
      
      expect(html).toBeDefined();
    });
  });

  describe('status normalization', () => {
    it('should normalize "completed" to complete', () => {
      const data = [{ step: 1, label: 'Done', status: 'completed' }];
      const html = steps(data, singleContext);
      expect(html).toContain('morph-step--complete');
    });

    it('should normalize "current" to active', () => {
      const data = [{ step: 1, label: 'Now', status: 'current' }];
      const html = steps(data, singleContext);
      expect(html).toContain('morph-step--active');
    });

    it('should normalize "waiting" to pending', () => {
      const data = [{ step: 1, label: 'Wait', status: 'waiting' }];
      const html = steps(data, singleContext);
      expect(html).toContain('morph-step--pending');
    });
  });
});
