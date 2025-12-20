/**
 * wrapInField & Base64 Encoding Tests
 */
import { describe, it, expect } from 'vitest';
import { wrapInField } from '../../src/morphs/base.js';

describe('wrapInField', () => {
  it('should encode simple string to base64', () => {
    const html = wrapInField('<span>test</span>', 'text', 'test_field', undefined, 'Hello World');
    expect(html).toContain('data-raw-value="');
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      expect(decoded).toBe('"Hello World"');
    }
  });

  it('should encode array to base64', () => {
    const data = [{ label: 'Test', value: 42 }];
    const html = wrapInField('<span>test</span>', 'bar', 'bar_field', undefined, data);
    expect(html).toContain('data-raw-value="');
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
      expect(decoded).toEqual([{ label: 'Test', value: 42 }]);
    }
  });

  it('should encode complex nested object', () => {
    const data = {
      min: 10,
      max: 100,
      values: [20, 30, 40],
      nested: { deep: true }
    };
    const html = wrapInField('<span>test</span>', 'stats', 'complex_field', undefined, data);
    expect(html).toContain('data-raw-value="');
    const match = html.match(/data-raw-value="([^"]+)"/);
    expect(match).toBeTruthy();
    if (match) {
      const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString('utf-8'));
      expect(decoded).toEqual(data);
    }
  });

  it('should skip encoding for values larger than 10KB', () => {
    const largeData = 'x'.repeat(15000);
    const html = wrapInField('<span>test</span>', 'text', 'large_field', undefined, largeData);
    expect(html).not.toContain('data-raw-value=');
  });

  it('should handle null/undefined raw values', () => {
    const html1 = wrapInField('<span>test</span>', 'text', 'field1', undefined, null);
    const html2 = wrapInField('<span>test</span>', 'text', 'field2', undefined, undefined);
    expect(html1).not.toContain('data-raw-value=');
    expect(html2).not.toContain('data-raw-value=');
  });

  it('should have correct CSS classes', () => {
    const html = wrapInField('<span>content</span>', 'bar', 'test_field');
    expect(html).toContain('class="amorph-field"');
    expect(html).toContain('data-morph="bar"');
    expect(html).toContain('class="amorph-field-value"');
  });
});
