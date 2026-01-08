/**
 * AMORPH v7 - Gauge Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { gauge } from '../../src/morphs/primitives/gauge.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('gauge morph', () => {
  describe('single mode', () => {
    it('should render basic gauge', () => {
      const data = { value: 75, min: 0, max: 100 };
      
      const html = gauge(data, singleContext);
      
      expect(html).toContain('morph-gauge');
      expect(html).toContain('75');
    });

    it('should render gauge with unit', () => {
      const data = { value: 50, min: 0, max: 100, unit: '%' };
      
      const html = gauge(data, singleContext);
      
      expect(html).toContain('50');
      expect(html).toContain('%');
    });

    it('should render gauge with zones', () => {
      const data = {
        value: 25,
        min: 0,
        max: 100,
        zones: [
          { from: 0, to: 30, color: 'danger' },
          { from: 30, to: 70, color: 'warning' },
          { from: 70, to: 100, color: 'success' }
        ]
      };
      
      const html = gauge(data, singleContext);
      
      expect(html).toContain('morph-gauge');
    });

    it('should handle German field names', () => {
      const data = { wert: 60, min: 0, max: 100 };
      
      const html = gauge(data, singleContext);
      
      expect(html).toContain('60');
    });

    it('should handle simple number value', () => {
      const html = gauge(42, singleContext);
      
      expect(html).toContain('42');
    });
  });

  describe('compare mode', () => {
    it('should render gauge comparison', () => {
      const ctx = createCompareContextWithValues('gauge', [
        { value: 75, max: 100 },
        { value: 25, max: 100 }
      ]);
      
      const html = gauge(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
