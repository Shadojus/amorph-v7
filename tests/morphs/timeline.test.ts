/**
 * Timeline Morph Tests
 */
import { describe, it, expect } from 'vitest';
import { timeline } from '../../src/morphs/primitives/timeline.js';
import { singleContext, createCompareContextWithValues } from './_setup.js';

describe('timeline morph', () => {
  it('should render timeline events', () => {
    const events = [
      { date: '2024-01', event: 'Sporen bilden' },
      { date: '2024-06', event: 'Wachstum' }
    ];
    const html = timeline(events, singleContext);
    expect(html).toContain('morph-timeline');
    expect(html).toContain('Sporen bilden');
    expect(html).toContain('Wachstum');
  });
});

describe('timeline compare', () => {
  it('should merge events on shared axis', () => {
    const ctx = createCompareContextWithValues('lifecycle', [
      [{ date: '2024-01', event: 'Event A' }],
      [{ date: '2024-01', event: 'Event B' }]
    ]);
    const html = timeline(null, ctx);
    expect(html).toContain('morph-timeline-compare');
    expect(html).toContain('timeline-axis');
    expect(html).toContain('Event A');
    expect(html).toContain('Event B');
  });

  it('should show legend with source names', () => {
    const ctx = createCompareContextWithValues('lifecycle', [
      [{ date: '2024-01', event: 'E1' }],
      [{ date: '2024-06', event: 'E2' }]
    ]);
    const html = timeline(null, ctx);
    expect(html).toContain('timeline-legend');
    expect(html).toContain('Steinpilz');
    expect(html).toContain('Fliegenpilz');
  });
});
