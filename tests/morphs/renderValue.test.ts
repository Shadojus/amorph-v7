/**
 * renderValue Integration Tests
 */
import { describe, it, expect } from 'vitest';
import { renderValue } from '../../src/morphs/index.js';
import { singleContext } from './_setup.js';

describe('renderValue integration', () => {
  it('should include data-raw-value for bar chart data', () => {
    const data = [
      { label: 'Hut', value: 1.68 },
      { label: 'Stiel', value: 0.75 }
    ];
    const html = renderValue(data, 'alkaloid_content_by_part', singleContext);
    expect(html).toContain('data-raw-value="');
    expect(html).toContain('data-morph="bar"');
  });

  it('should include data-raw-value for radar data', () => {
    const data = [
      { axis: 'Psilocybin', value: 95 },
      { axis: 'Psilocin', value: 35 },
      { axis: 'Baeocystin', value: 15 }
    ];
    const html = renderValue(data, 'alkaloid_profile_radar', singleContext);
    expect(html).toContain('data-raw-value="');
    expect(html).toContain('data-morph="radar"');
  });

  it('should include data-raw-value for range data', () => {
    const data = { min: 800, max: 3200 };
    const html = renderValue(data, 'elevation_range', singleContext);
    expect(html).toContain('data-raw-value="');
  });

  it('should include data-raw-value for array (tags)', () => {
    const data = ['essbar', 'häufig', 'Herbst'];
    const html = renderValue(data, 'tags', singleContext);
    expect(html).toContain('data-raw-value="');
  });

  it('should return empty string for null/undefined', () => {
    expect(renderValue(null, 'field', singleContext)).toBe('');
    expect(renderValue(undefined, 'field', singleContext)).toBe('');
    expect(renderValue('', 'field', singleContext)).toBe('');
  });

  it('should return empty string for empty arrays', () => {
    expect(renderValue([], 'field', singleContext)).toBe('');
  });
});
