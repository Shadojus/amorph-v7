/**
 * AMORPH v7 - Severity Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { severity } from '../../src/morphs/primitives/severity.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('severity morph', () => {
  describe('single mode', () => {
    it('should render severity list', () => {
      const data = [
        { level: 'critical', type: 'Toxizität', description: 'Lebensbedrohlich' },
        { level: 'moderate', type: 'Allergie', description: 'Hautreaktion möglich' },
        { level: 'low', type: 'Verdauung', description: 'Leichte Beschwerden' }
      ];
      
      const html = severity(data, singleContext);
      
      expect(html).toContain('morph-severity');
      expect(html).toContain('Toxizität');
      expect(html).toContain('Lebensbedrohlich');
    });

    it('should handle German field names', () => {
      const data = [
        { severity: 'high', typ: 'Gefahr', beschreibung: 'Vorsicht!' }
      ];
      
      const html = severity(data, singleContext);
      
      expect(html).toContain('Gefahr');
      expect(html).toContain('Vorsicht!');
    });

    it('should handle all severity levels', () => {
      const levels = ['critical', 'severe', 'high', 'moderate', 'low', 'minimal', 'none'];
      
      levels.forEach(level => {
        const data = [{ level, type: 'Test' }];
        const html = severity(data, singleContext);
        expect(html).toContain('morph-severity');
      });
    });

    it('should handle unknown severity levels', () => {
      const data = [{ level: 'unknown-level', type: 'Test' }];
      
      const html = severity(data, singleContext);
      
      expect(html).toContain('morph-severity');
    });

    it('should handle simple string value', () => {
      const data = 'moderate';
      
      const html = severity(data, singleContext);
      
      expect(html).toContain('morph-severity');
    });
  });

  describe('compare mode', () => {
    it('should render severity comparison', () => {
      const ctx = createCompareContextWithValues('severity', [
        [{ level: 'high', type: 'Risk' }],
        [{ level: 'low', type: 'Risk' }]
      ]);
      
      const html = severity(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
