/**
 * AMORPH v7 - Currency Morph Tests
 */

import { describe, it, expect } from 'vitest';
import { currency } from '../../src/morphs/primitives/currency.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('currency morph', () => {
  describe('single mode', () => {
    it('should render EUR amount', () => {
      const data = { amount: 1234.56, currency: 'EUR' };
      
      const html = currency(data, singleContext);
      
      expect(html).toContain('morph-currency');
      expect(html).toContain('€');
    });

    it('should render USD amount', () => {
      const data = { amount: 99.99, currency: 'USD' };
      
      const html = currency(data, singleContext);
      
      expect(html).toContain('$');
    });

    it('should handle German field names', () => {
      const data = { betrag: 50, währung: 'EUR' };
      
      const html = currency(data, singleContext);
      
      expect(html).toContain('€');
    });

    it('should handle simple number value', () => {
      const html = currency(100, singleContext);
      
      expect(html).toContain('morph-currency');
      expect(html).toContain('100');
    });

    it('should render BTC symbol', () => {
      const data = { amount: 0.5, currency: 'BTC' };
      
      const html = currency(data, singleContext);
      
      expect(html).toContain('₿');
    });

    it('should handle unknown currency codes', () => {
      const data = { amount: 100, currency: 'XYZ' };
      
      const html = currency(data, singleContext);
      
      expect(html).toContain('XYZ');
    });
  });

  describe('compare mode', () => {
    it('should render currency comparison', () => {
      const ctx = createCompareContextWithValues('price', [
        { amount: 100, currency: 'EUR' },
        { amount: 120, currency: 'EUR' }
      ]);
      
      const html = currency(null, ctx);
      
      expect(html).toBeDefined();
    });
  });
});
