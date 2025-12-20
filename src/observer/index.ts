/**
 * AMORPH v7 - Observer Module
 * 
 * Zentrales Beobachtungssystem für:
 * - User-Interaktionen (Klicks, Hover, Input)
 * - Rendering-Events (Mount, Unmount, DOM)
 * - Session-Tracking (Page Views, Verweildauer)
 */

import { InteractionObserver } from './interaction.js';
import { RenderingObserver } from './rendering.js';
import { SessionObserver } from './session.js';
import { createTarget, type ObserverTarget, type TargetConfig } from './target.js';
import { debug } from './debug.js';

// Re-export
export { debug } from './debug.js';
export { InteractionObserver } from './interaction.js';
export { RenderingObserver } from './rendering.js';
export { SessionObserver } from './session.js';
export { createTarget, type ObserverTarget, type TargetConfig } from './target.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ObserverConfig {
  interaction?: {
    enabled: boolean;
    target?: TargetConfig;
  };
  rendering?: {
    enabled: boolean;
    target?: TargetConfig;
  };
  session?: {
    enabled: boolean;
    target?: TargetConfig;
  };
}

interface ActiveObservers {
  interaction: InteractionObserver | null;
  rendering: RenderingObserver | null;
  session: SessionObserver | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let activeObservers: ActiveObservers = {
  interaction: null,
  rendering: null,
  session: null
};

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════════

export function setupObservers(
  container: HTMLElement,
  config: ObserverConfig,
  sessionId?: string
): Array<InteractionObserver | RenderingObserver | SessionObserver> {
  const observers: Array<InteractionObserver | RenderingObserver | SessionObserver> = [];
  
  debug.observer('Setup', {
    hasConfig: !!config,
    interaction: !!config?.interaction?.enabled,
    rendering: !!config?.rendering?.enabled,
    session: !!config?.session?.enabled
  });
  
  if (!config) {
    debug.warn('No observer configuration found');
    return observers;
  }
  
  // === INTERACTION OBSERVER ===
  if (config.interaction?.enabled) {
    const target = config.interaction.target ? createTarget(config.interaction.target) : null;
    const obs = new InteractionObserver(container, target);
    obs.start();
    observers.push(obs);
    activeObservers.interaction = obs;
  }
  
  // === RENDERING OBSERVER ===
  if (config.rendering?.enabled) {
    const target = config.rendering.target ? createTarget(config.rendering.target) : null;
    const obs = new RenderingObserver(container, target);
    obs.start();
    observers.push(obs);
    activeObservers.rendering = obs;
  }
  
  // === SESSION OBSERVER ===
  if (config.session?.enabled && sessionId) {
    const target = config.session.target ? createTarget(config.session.target) : null;
    const obs = new SessionObserver(target);
    obs.start(sessionId);
    observers.push(obs);
    activeObservers.session = obs;
  }
  
  // Global access for debugging
  if (typeof window !== 'undefined') {
    (window as any).amorphObservers = activeObservers;
    (window as any).amorphObserverStats = getObserverStats;
  }
  
  debug.observer('All observers active', {
    count: observers.length,
    types: Object.entries(activeObservers)
      .filter(([_, v]) => v !== null)
      .map(([k]) => k)
  });
  
  return observers;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

export function stopObservers(
  observers: Array<InteractionObserver | RenderingObserver | SessionObserver>
): void {
  debug.observer('Stopping all observers');
  
  for (const obs of observers) {
    obs.stop();
  }
  
  activeObservers = {
    interaction: null,
    rendering: null,
    session: null
  };
}

export function getObserverStats(): Record<string, unknown> {
  const stats: Record<string, unknown> = {
    debug: debug.getStats(),
    timeline: debug.getTimeline(20)
  };
  
  if (activeObservers.rendering) {
    stats.rendering = activeObservers.rendering.getStats();
  }
  
  if (activeObservers.session) {
    stats.session = activeObservers.session.getStats();
  }
  
  return stats;
}
