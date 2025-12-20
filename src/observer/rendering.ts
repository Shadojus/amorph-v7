/**
 * AMORPH v7 - Rendering Observer
 * 
 * Beobachtet Rendering-Events: Mount, Unmount, DOM Mutations
 */

import { debug } from './debug.js';
import type { ObserverTarget } from './target';

export class RenderingObserver {
  private container: HTMLElement;
  private target: ObserverTarget | null;
  private handlers: Array<[string, EventListener]>;
  private mutationObserver: MutationObserver | null;
  private renderCount: number;
  private mountCount: number;
  private active: boolean;
  
  constructor(container: HTMLElement, target: ObserverTarget | null = null) {
    this.container = container;
    this.target = target;
    this.handlers = [];
    this.mutationObserver = null;
    this.renderCount = 0;
    this.mountCount = 0;
    this.active = false;
  }
  
  start(): void {
    if (this.active) return;
    this.active = true;
    
    debug.observer('RenderingObserver started');
    
    // === MOUNT EVENTS ===
    const mountHandler = (e: Event) => {
      this.mountCount++;
      const detail = (e as CustomEvent).detail || {};
      const data = {
        morph: detail.morph,
        field: detail.field,
        number: this.mountCount
      };
      debug.mount('Mount', data);
      this.target?.send({ type: 'mount', ...data, timestamp: Date.now() });
    };
    this.container.addEventListener('amorph:mounted', mountHandler);
    this.handlers.push(['amorph:mounted', mountHandler]);
    
    // === UNMOUNT EVENTS ===
    const unmountHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const data = { morph: detail.morph, field: detail.field };
      debug.unmount('Unmount', data);
      this.target?.send({ type: 'unmount', ...data, timestamp: Date.now() });
    };
    this.container.addEventListener('amorph:unmounted', unmountHandler);
    this.handlers.push(['amorph:unmounted', unmountHandler]);
    
    // === RENDER COMPLETE ===
    const renderHandler = (e: Event) => {
      this.renderCount++;
      const detail = (e as CustomEvent).detail || {};
      const data = {
        count: detail.count,
        renderNumber: this.renderCount,
        totalMounts: this.mountCount
      };
      debug.render('Render complete', data);
      this.target?.send({ type: 'render', ...data, timestamp: Date.now() });
    };
    this.container.addEventListener('amorph:rendered', renderHandler);
    this.handlers.push(['amorph:rendered', renderHandler]);
    
    // === DOM MUTATION OBSERVER ===
    this.mutationObserver = new MutationObserver((mutations) => {
      let addedNodes = 0;
      let removedNodes = 0;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          addedNodes += mutation.addedNodes.length;
          removedNodes += mutation.removedNodes.length;
        }
      }
      
      if (addedNodes > 0 || removedNodes > 0) {
        debug.render('DOM Mutation', { added: addedNodes, removed: removedNodes });
      }
    });
    
    this.mutationObserver.observe(this.container, {
      childList: true,
      subtree: true
    });
  }
  
  stop(): void {
    if (!this.active) return;
    this.active = false;
    
    debug.observer('RenderingObserver stopped', {
      totalRenders: this.renderCount,
      totalMounts: this.mountCount
    });
    
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers = [];
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
  
  getStats() {
    return {
      renders: this.renderCount,
      mounts: this.mountCount,
      active: this.active
    };
  }
}
