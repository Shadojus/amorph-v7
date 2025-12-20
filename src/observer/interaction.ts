/**
 * AMORPH v7 - Interaction Observer
 * 
 * Beobachtet User-Interaktionen: Klicks, Hover, Input, Scroll
 */

import { debug } from './debug.js';
import type { ObserverTarget } from './target';

export class InteractionObserver {
  private container: HTMLElement;
  private target: ObserverTarget | null;
  private handlers: Map<string, EventListener>;
  private lastScrollTime: number;
  private active: boolean;
  
  constructor(container: HTMLElement, target: ObserverTarget | null = null) {
    this.container = container;
    this.target = target;
    this.handlers = new Map();
    this.lastScrollTime = 0;
    this.active = false;
  }
  
  start(): void {
    if (this.active) return;
    this.active = true;
    
    debug.observer('InteractionObserver started');
    
    // === CLICKS ===
    this.addHandler('click', (e: Event) => {
      const event = e as MouseEvent;
      const target = event.target as HTMLElement;
      
      const morph = target.closest('[data-morph]') as HTMLElement | null;
      const feature = target.closest('[data-feature]') as HTMLElement | null;
      const btn = target.closest('button');
      const link = target.closest('a');
      
      const data = {
        morph: morph?.dataset.morph,
        field: morph?.dataset.field,
        feature: feature?.dataset.feature,
        button: btn?.textContent?.trim().substring(0, 20),
        link: link?.href,
        target: target.tagName.toLowerCase(),
        x: event.clientX,
        y: event.clientY
      };
      
      debug.click('Click', data);
      this.target?.send({ type: 'click', ...data, timestamp: Date.now() });
    });
    
    // === HOVER (delayed) ===
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastHoverMorph: HTMLElement | null = null;
    
    this.addHandler('mouseover', (e: Event) => {
      const target = (e as MouseEvent).target as HTMLElement;
      const morph = target.closest('[data-morph]') as HTMLElement | null;
      if (!morph || morph === lastHoverMorph) return;
      
      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        lastHoverMorph = morph;
        const data = {
          morph: morph.dataset.morph,
          field: morph.dataset.field
        };
        debug.hover('Hover', data);
        this.target?.send({ type: 'hover', ...data, timestamp: Date.now() });
      }, 500);
    });
    
    this.addHandler('mouseout', (e: Event) => {
      const target = (e as MouseEvent).target as HTMLElement;
      const morph = target.closest('[data-morph]') as HTMLElement | null;
      if (morph === lastHoverMorph) {
        lastHoverMorph = null;
      }
      if (hoverTimeout) clearTimeout(hoverTimeout);
    });
    
    // === INPUT ===
    this.addHandler('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const morph = target.closest('[data-morph]') as HTMLElement | null;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const data = {
          morph: morph?.dataset.morph,
          field: morph?.dataset.field,
          inputType: target.type,
          name: target.name || target.placeholder,
          length: target.value?.length || 0
        };
        debug.input('Input', data);
        this.target?.send({ eventType: 'input', ...data, timestamp: Date.now() });
      }
    });
    
    // === SCROLL (throttled) ===
    this.addHandler('scroll', () => {
      const now = Date.now();
      if (now - this.lastScrollTime < 500) return;
      this.lastScrollTime = now;
      
      const scrollTop = this.container.scrollTop || window.scrollY;
      const scrollHeight = this.container.scrollHeight || document.body.scrollHeight;
      const clientHeight = this.container.clientHeight || window.innerHeight;
      const scrollPercent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      
      const data = {
        scrollTop,
        scrollPercent,
        viewportHeight: clientHeight
      };
      
      debug.scroll('Scroll', data);
      this.target?.send({ type: 'scroll', ...data, timestamp: Date.now() });
    }, true);
  }
  
  stop(): void {
    if (!this.active) return;
    this.active = false;
    
    debug.observer('InteractionObserver stopped');
    
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
      document.removeEventListener(event, handler);
    }
    this.handlers.clear();
  }
  
  private addHandler(event: string, handler: EventListener, useDocument = false): void {
    const target = useDocument ? document : this.container;
    target.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }
}
