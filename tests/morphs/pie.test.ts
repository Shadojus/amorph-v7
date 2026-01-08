/**
 * AMORPH v7 - Pie Chart Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { pie } from '../../src/morphs/primitives/pie.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('pie morph', () => {
  describe('single mode', () => {
    it('should render pie chart with labeled segments', () => {
      const data = [
        { label: 'Category A', value: 30 },
        { label: 'Category B', value: 50 },
        { label: 'Category C', value: 20 }
      ];
      
      const html = pie(data, singleContext);
      
      expect(html).toContain('morph-pie');
      expect(html).toContain('Category A');
      expect(html).toContain('Category B');
      expect(html).toContain('Category C');
    });

    it('should handle German field names', () => {
      const data = [
        { name: 'Teil 1', wert: 60 },
        { name: 'Teil 2', wert: 40 }
      ];
      
      const html = pie(data, singleContext);
      
      expect(html).toContain('Teil 1');
      expect(html).toContain('Teil 2');
    });

    it('should render simple number array', () => {
      const data = [25, 25, 25, 25];
      
      const html = pie(data, singleContext);
      
      expect(html).toContain('morph-pie');
    });

    it('should handle single value', () => {
      const data = { label: 'Only One', value: 100 };
      
      const html = pie(data, singleContext);
      
      expect(html).toContain('morph-pie');
      expect(html).toContain('Only One');
    });

    it('should use conic-gradient for pie visualization', () => {
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 }
      ];
      
      const html = pie(data, singleContext);
      
      // CSS conic-gradient is used for pie charts
      expect(html).toContain('conic-gradient');
    });
  });

  describe('compare mode', () => {
    it('should render pie chart comparison', () => {
      const ctx = createCompareContextWithValues('pie', [
        [{ label: 'A', value: 60 }, { label: 'B', value: 40 }],
        [{ label: 'A', value: 40 }, { label: 'B', value: 60 }]
      ]);
      
      const html = pie(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
