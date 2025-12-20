/**
 * AMORPH v7 - Debug Observer
 * 
 * Zentrales Logging-System für das gesamte Framework.
 * Alle Events werden hier geloggt, nicht verstreut im Code.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const STYLES: Record<string, string> = {
  // System
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #34d399; font-weight: bold',
  data: 'color: #60a5fa; font-weight: bold',
  schema: 'color: #67e8f9; font-weight: bold',
  security: 'color: #ef4444; font-weight: bold',
  
  // Features
  features: 'color: #a78bfa; font-weight: bold',
  header: 'color: #c084fc; font-weight: bold',
  search: 'color: #38bdf8; font-weight: bold',
  perspectives: 'color: #06b6d4; font-weight: bold',
  grid: 'color: #84cc16; font-weight: bold',
  views: 'color: #22c55e; font-weight: bold',
  compare: 'color: #14b8a6; font-weight: bold',
  detail: 'color: #10b981; font-weight: bold',
  
  // Morphs & Rendering
  morphs: 'color: #fb7185; font-weight: bold',
  detection: 'color: #e879f9; font-weight: bold',
  render: 'color: #fbbf24; font-weight: bold',
  mount: 'color: #facc15; font-weight: bold',
  unmount: 'color: #a3a3a3; font-weight: bold',
  
  // User-Interaction
  observer: 'color: #f87171; font-weight: bold',
  click: 'color: #fb923c; font-weight: bold',
  hover: 'color: #fdba74; font-weight: bold',
  input: 'color: #fcd34d; font-weight: bold',
  scroll: 'color: #d4d4d4; font-weight: bold',
  
  // Session & Navigation
  session: 'color: #22d3ee; font-weight: bold',
  navigation: 'color: #2dd4bf; font-weight: bold',
  
  // Errors & Warnings
  error: 'color: #ef4444; font-weight: bold',
  warn: 'color: #fbbf24; font-weight: bold',
  
  // Standard
  muted: 'color: #888'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface LogEntry {
  time: string;
  elapsed: number;
  category: string;
  message: string;
  data: unknown;
  timestamp: number;
}

type LogCategory = 
  | 'amorph' | 'config' | 'data' | 'schema' | 'security'
  | 'features' | 'header' | 'search' | 'perspectives' | 'grid' | 'views' | 'compare' | 'detail'
  | 'morphs' | 'detection' | 'render' | 'mount' | 'unmount'
  | 'observer' | 'click' | 'hover' | 'input' | 'scroll'
  | 'session' | 'navigation'
  | 'error' | 'warn';

// ═══════════════════════════════════════════════════════════════════════════════
// DEBUG OBSERVER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class DebugObserver {
  private enabled: boolean;
  private history: LogEntry[];
  private maxHistory: number;
  private filter: string[] | null;
  private startTime: number;
  private muted: Set<string>;
  private verbose: boolean;
  
  constructor(enabled = true) {
    this.enabled = enabled;
    this.history = [];
    this.maxHistory = 500;
    this.filter = null;
    this.startTime = Date.now();
    // Mute noisy categories by default
    this.muted = new Set(['mount', 'unmount', 'scroll', 'hover', 'morphs', 'detection', 'render']);
    this.verbose = false;
  }
  
  /**
   * Basis-Log-Methode
   */
  log(category: LogCategory | string, message: string, data: unknown = null): LogEntry | undefined {
    if (!this.enabled) return;
    if (this.filter && !this.filter.includes(category)) return;
    if (!this.verbose && this.muted.has(category)) return;
    
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const elapsed = Date.now() - this.startTime;
    const style = STYLES[category] || STYLES.muted;
    const prefix = `[${category.toUpperCase()}]`;
    
    // Store in history
    const entry: LogEntry = { time, elapsed, category, message, data, timestamp: Date.now() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Output to console (only in browser)
    if (typeof window !== 'undefined') {
      if (data !== null) {
        console.log(`%c${prefix}%c [${time}] ${message}`, style, STYLES.muted, data);
      } else {
        console.log(`%c${prefix}%c [${time}] ${message}`, style, STYLES.muted);
      }
    }
    
    return entry;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  amorph(msg: string, data?: unknown) { return this.log('amorph', msg, data); }
  config(msg: string, data?: unknown) { return this.log('config', msg, data); }
  data(msg: string, data?: unknown) { return this.log('data', msg, data); }
  schema(msg: string, data?: unknown) { return this.log('schema', msg, data); }
  security(msg: string, data?: unknown) { return this.log('security', msg, data); }
  
  features(msg: string, data?: unknown) { return this.log('features', msg, data); }
  header(msg: string, data?: unknown) { return this.log('header', msg, data); }
  search(msg: string, data?: unknown) { return this.log('search', msg, data); }
  perspectives(msg: string, data?: unknown) { return this.log('perspectives', msg, data); }
  grid(msg: string, data?: unknown) { return this.log('grid', msg, data); }
  views(msg: string, data?: unknown) { return this.log('views', msg, data); }
  compare(msg: string, data?: unknown) { return this.log('compare', msg, data); }
  detail(msg: string, data?: unknown) { return this.log('detail', msg, data); }
  
  morphs(msg: string, data?: unknown) { return this.log('morphs', msg, data); }
  detection(msg: string, data?: unknown) { return this.log('detection', msg, data); }
  render(msg: string, data?: unknown) { return this.log('render', msg, data); }
  mount(msg: string, data?: unknown) { return this.log('mount', msg, data); }
  unmount(msg: string, data?: unknown) { return this.log('unmount', msg, data); }
  
  observer(msg: string, data?: unknown) { return this.log('observer', msg, data); }
  click(msg: string, data?: unknown) { return this.log('click', msg, data); }
  hover(msg: string, data?: unknown) { return this.log('hover', msg, data); }
  input(msg: string, data?: unknown) { return this.log('input', msg, data); }
  scroll(msg: string, data?: unknown) { return this.log('scroll', msg, data); }
  
  session(msg: string, data?: unknown) { return this.log('session', msg, data); }
  navigation(msg: string, data?: unknown) { return this.log('navigation', msg, data); }
  
  error(msg: string, data?: unknown) { return this.log('error', msg, data); }
  warn(msg: string, data?: unknown) { return this.log('warn', msg, data); }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════
  
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  setVerbose(value: boolean) { 
    this.verbose = value;
    if (value) {
      this.log('amorph', 'Verbose mode enabled - all categories visible');
    }
  }
  
  setFilter(categories: string[] | null) { 
    this.filter = categories;
    if (categories) {
      this.log('amorph', `Filter set: ${categories.join(', ')}`);
    }
  }
  
  mute(category: string) { this.muted.add(category); }
  unmute(category: string) { this.muted.delete(category); }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STATS & HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  
  getStats() {
    const stats: Record<string, number> = {};
    for (const entry of this.history) {
      stats[entry.category] = (stats[entry.category] || 0) + 1;
    }
    return {
      total: this.history.length,
      byCategory: stats,
      runtime: Date.now() - this.startTime
    };
  }
  
  getTimeline(limit = 20): LogEntry[] {
    return this.history.slice(-limit);
  }
  
  getByCategory(category: string, limit = 50): LogEntry[] {
    return this.history.filter(e => e.category === category).slice(-limit);
  }
  
  clear() {
    this.history = [];
    this.log('amorph', 'History cleared');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSOLE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  table(data: unknown) {
    if (typeof console !== 'undefined' && console.table) {
      console.table(data);
    }
  }
  
  group(label: string) {
    if (typeof console !== 'undefined' && console.group) {
      console.group(label);
    }
  }
  
  groupEnd() {
    if (typeof console !== 'undefined' && console.groupEnd) {
      console.groupEnd();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const debug = new DebugObserver();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).amorphDebug = debug;
}
