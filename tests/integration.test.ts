/**
 * AMORPH v7 - Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';

// These tests would run against a running server
// For now, they test the module imports and basic integration

describe('module imports', () => {
  it('should import core types', async () => {
    const types = await import('../src/core/types.js');
    expect(types.isCompareMode).toBeDefined();
    expect(types.isSingleMode).toBeDefined();
  });

  it('should import detection', async () => {
    const detection = await import('../src/core/detection.js');
    expect(detection.detectType).toBeDefined();
  });

  it('should import security', async () => {
    const security = await import('../src/core/security.js');
    expect(security.validateSlug).toBeDefined();
    expect(security.escapeHtml).toBeDefined();
    expect(security.checkRateLimit).toBeDefined();
  });

  it('should import morphs', async () => {
    const morphs = await import('../src/morphs/index.js');
    expect(morphs.renderValue).toBeDefined();
    expect(morphs.renderCompare).toBeDefined();
    expect(morphs.primitives).toBeDefined();
  });

  it('should import all primitives', async () => {
    const primitives = await import('../src/morphs/primitives/index.js');
    
    expect(primitives.text).toBeDefined();
    expect(primitives.number).toBeDefined();
    expect(primitives.boolean).toBeDefined();
    expect(primitives.badge).toBeDefined();
    expect(primitives.tag).toBeDefined();
    expect(primitives.progress).toBeDefined();
    expect(primitives.rating).toBeDefined();
    expect(primitives.range).toBeDefined();
    expect(primitives.stats).toBeDefined();
    expect(primitives.image).toBeDefined();
    expect(primitives.link).toBeDefined();
    expect(primitives.list).toBeDefined();
    expect(primitives.object).toBeDefined();
    expect(primitives.date).toBeDefined();
    expect(primitives.timeline).toBeDefined();
    expect(primitives.bar).toBeDefined();
    expect(primitives.sparkline).toBeDefined();
    expect(primitives.radar).toBeDefined();
  });

  it('should import observer', async () => {
    const observer = await import('../src/observer/index.js');
    expect(observer.debug).toBeDefined();
    expect(observer.setupObservers).toBeDefined();
    expect(observer.InteractionObserver).toBeDefined();
    expect(observer.RenderingObserver).toBeDefined();
    expect(observer.SessionObserver).toBeDefined();
  });
});

describe('morph rendering', () => {
  it('should render values with context', async () => {
    const { renderValue } = await import('../src/morphs/index.js');
    
    const context = { mode: 'single' as const, itemCount: 1 };
    const html = renderValue('Test Value', 'name', context);
    
    expect(html).toContain('Test Value');
    expect(html).toContain('amorph-field');
  });

  it('should detect and use correct morph based on structure', async () => {
    const { renderValue } = await import('../src/morphs/index.js');
    
    const context = { mode: 'single' as const, itemCount: 1 };
    
    // Plain numbers become number morph
    const numHtml = renderValue(42, 'count', context);
    expect(numHtml).toContain('morph-number');
    
    // Boolean
    const boolHtml = renderValue(true, 'active', context);
    expect(boolHtml).toContain('morph-boolean');
    
    // Progress object {value, max} becomes progress
    const progressHtml = renderValue({ value: 75, max: 100 }, 'fortschritt', context);
    expect(progressHtml).toContain('morph-progress');
    
    // Large numbers also become number morph
    const largeNumHtml = renderValue(12345, 'visitors', context);
    expect(largeNumHtml).toContain('morph-number');
  });
});

describe('security integration', () => {
  it('should escape user input in morphs', async () => {
    const { text } = await import('../src/morphs/primitives/text.js');
    
    const malicious = '<img src=x onerror=alert(1)>';
    const html = text(malicious, { mode: 'single', itemCount: 1 });
    
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});

describe('data module', () => {
  it('should export getLoadErrors and invalidateCache', async () => {
    const data = await import('../src/server/data.js');
    expect(data.getLoadErrors).toBeDefined();
    expect(data.invalidateCache).toBeDefined();
    expect(typeof data.getLoadErrors).toBe('function');
    expect(typeof data.invalidateCache).toBe('function');
  });
  
  it('getLoadErrors should return an array', async () => {
    const { getLoadErrors } = await import('../src/server/data.js');
    const errors = getLoadErrors();
    expect(Array.isArray(errors)).toBe(true);
  });
});
