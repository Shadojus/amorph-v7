/**
 * AMORPH v7 - Observer Tests
 * 
 * Tests für den Debug Observer.
 * Beachte: Der Observer hat standardmäßig gemutete Kategorien und verbose=false.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { debug } from '../src/observer/debug.js';

describe('debug observer', () => {
  beforeEach(() => {
    debug.clear();
    debug.enable();
    debug.setVerbose(true);  // Enable verbose to see all logs
    debug.setFilter(null);   // Clear any filters
  });

  it('should log messages to history', () => {
    debug.amorph('Test message', { data: 123 });
    debug.config('Config loaded');
    
    const stats = debug.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });

  it('should filter by category when filter is set', () => {
    // First, log without filter
    debug.amorph('Should appear initially');
    debug.error('Error message');
    
    const beforeFilter = debug.getStats().total;
    expect(beforeFilter).toBeGreaterThan(0);
    
    // Clear and set filter
    debug.clear();
    debug.setFilter(['error']);
    
    // Now only error category should log
    debug.amorph('Should be filtered out');
    debug.error('Should appear');
    
    const timeline = debug.getTimeline(10);
    // Filter only allows 'error' category now
    const errorCount = timeline.filter(e => e.category === 'error').length;
    expect(errorCount).toBe(1);
    
    debug.setFilter(null);
  });

  it('should mute categories', () => {
    debug.setVerbose(false);  // Use default muting
    debug.mute('amorph');
    
    const before = debug.getStats().total;
    debug.amorph('Should be muted');
    const after = debug.getStats().total;
    
    expect(after).toBe(before);
    
    debug.unmute('amorph');
    debug.setVerbose(true);
  });

  it('should track stats by category', () => {
    debug.error('Error 1');
    debug.error('Error 2');
    debug.session('Session event');  // Use a non-muted category
    
    const stats = debug.getStats();
    expect(stats.byCategory.error).toBe(2);
    expect(stats.byCategory.session).toBe(1);
  });

  it('should get timeline entries', () => {
    debug.amorph('Entry 1');
    debug.config('Entry 2');
    debug.data('Entry 3');
    
    const timeline = debug.getTimeline(2);
    expect(timeline.length).toBe(2);
  });

  it('should enable/disable logging', () => {
    debug.disable();
    const before = debug.getStats().total;
    debug.amorph('Should not log');
    const after = debug.getStats().total;
    
    expect(after).toBe(before);
    
    debug.enable();
  });

  it('should return log entries with correct structure', () => {
    debug.security('Test security', { level: 'high' });
    
    const timeline = debug.getTimeline(1);
    expect(timeline.length).toBe(1);
    
    const entry = timeline[0];
    expect(entry).toHaveProperty('time');
    expect(entry).toHaveProperty('elapsed');
    expect(entry).toHaveProperty('category');
    expect(entry).toHaveProperty('message');
    expect(entry).toHaveProperty('data');
    expect(entry).toHaveProperty('timestamp');
  });

  it('should get entries by category', () => {
    debug.error('Error 1');
    debug.error('Error 2');
    debug.session('Not an error');
    
    const errors = debug.getByCategory('error', 10);
    expect(errors.length).toBe(2);
    expect(errors.every(e => e.category === 'error')).toBe(true);
  });
});
