/**
 * Bar Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { bar } from '../../src/morphs/primitives/bar.js';
import { singleContext, compareContext } from './_setup.js';

describe('bar morph', () => {
  it('should render bar chart', () => {
    const data = [
      { label: 'Protein', value: 25 },
      { label: 'Fett', value: 10 },
      { label: 'Kohlenhydrate', value: 5 }
    ];
    const html = bar(data, singleContext);
    expect(html).toContain('morph-bar');
    expect(html).toContain('Protein');
    expect(html).toContain('Fett');
    expect(html).toContain('Kohlenhydrate');
  });
  
  it('should handle number array', () => {
    const html = bar([10, 20, 30], singleContext);
    expect(html).toContain('morph-bar');
  });
  
  it('should use correct CSS classes', () => {
    const data = [
      { label: 'Test1', value: 100 },
      { label: 'Test2', value: 50 }
    ];
    const html = bar(data, singleContext);
    expect(html).toContain('class="morph-bar"');
    expect(html).toContain('class="morph-bar-item"');
    expect(html).toContain('class="morph-bar-label"');
    expect(html).toContain('class="morph-bar-track"');
    expect(html).toContain('class="morph-bar-fill"');
    expect(html).toContain('class="morph-bar-value"');
  });

  it('should render with compare context', () => {
    const data = [
      { label: 'Protein', value: 25 },
      { label: 'Fett', value: 10 }
    ];
    const html = bar(data, compareContext);
    expect(html).toContain('morph-bar');
    expect(html).toContain('Protein');
  });
});
