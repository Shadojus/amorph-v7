/**
 * AMORPH v7 - Calendar Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { calendar } from '../../src/morphs/primitives/calendar.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('calendar morph', () => {
  describe('single mode', () => {
    it('should render 12-month calendar', () => {
      const data = [
        { month: 1, active: true },
        { month: 2, active: false },
        { month: 3, active: true }
      ];
      
      const html = calendar(data, singleContext);
      
      expect(html).toContain('morph-calendar');
    });

    it('should handle German field names', () => {
      const data = [
        { monat: 1, aktiv: true },
        { monat: 6, aktiv: true }
      ];
      
      const html = calendar(data, singleContext);
      
      expect(html).toContain('morph-calendar');
    });

    it('should handle boolean array', () => {
      const data = [true, false, true, false, true, false, true, false, true, false, true, false];
      
      const html = calendar(data, singleContext);
      
      expect(html).toContain('morph-calendar');
    });

    it('should handle numeric values for intensity', () => {
      const data = [
        { month: 1, value: 0.5 },
        { month: 2, value: 1.0 },
        { month: 3, value: 0 }
      ];
      
      const html = calendar(data, singleContext);
      
      expect(html).toContain('morph-calendar');
    });

    it('should handle empty array', () => {
      const html = calendar([], singleContext);
      
      expect(html).toContain('morph-calendar');
    });
  });

  describe('compare mode', () => {
    it('should render calendar comparison', () => {
      const ctx = createCompareContextWithValues('calendar', [
        [{ month: 1, active: true }],
        [{ month: 1, active: false }]
      ]);
      
      const html = calendar(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
