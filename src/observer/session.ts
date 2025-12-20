/**
 * AMORPH v7 - Session Observer
 * 
 * Trackt Session-Daten: Page Views, Verweildauer, Tab-Wechsel
 */

import { debug } from './debug.js';
import type { ObserverTarget } from './target';

interface SessionAction {
  type: string;
  session: string;
  timestamp: number;
  interactionNumber: number;
  [key: string]: unknown;
}

export class SessionObserver {
  private target: ObserverTarget | null;
  private sessionId: string | null;
  private actions: SessionAction[];
  private flushInterval: ReturnType<typeof setInterval> | null;
  private startTime: number | null;
  private pageViews: number;
  private interactions: number;
  private active: boolean;
  
  constructor(target: ObserverTarget | null = null) {
    this.target = target;
    this.sessionId = null;
    this.actions = [];
    this.flushInterval = null;
    this.startTime = null;
    this.pageViews = 0;
    this.interactions = 0;
    this.active = false;
  }
  
  start(sessionId: string): void {
    if (!sessionId || this.active) return;
    this.active = true;
    
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.pageViews = 1;
    
    debug.session('Session started', {
      id: sessionId,
      url: window.location.href,
      referrer: document.referrer
    });
    
    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 30000);
    
    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
      this.flush();
    });
    
    // Visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        debug.session('Tab hidden');
        this.track({ type: 'tab_hidden' });
      } else {
        debug.session('Tab visible');
        this.track({ type: 'tab_visible' });
      }
    });
    
    // Send session start
    this.target?.send({
      type: 'session_start',
      session: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      },
      url: window.location.href,
      referrer: document.referrer
    });
  }
  
  track(action: Record<string, unknown>): void {
    if (!this.sessionId || !this.active) return;
    
    this.interactions++;
    const enrichedAction: SessionAction = {
      ...action,
      type: String(action.type || 'unknown'),
      session: this.sessionId,
      timestamp: Date.now(),
      interactionNumber: this.interactions
    };
    
    debug.session('Track', enrichedAction);
    this.actions.push(enrichedAction);
    
    if (this.actions.length >= 50) {
      this.flush();
    }
  }
  
  private trackPageLeave(): void {
    if (!this.startTime) return;
    
    const duration = Date.now() - this.startTime;
    debug.session('Page leave', {
      duration: `${Math.round(duration / 1000)}s`,
      interactions: this.interactions
    });
    
    this.track({
      type: 'page_leave',
      duration,
      interactions: this.interactions,
      scrollDepth: this.getScrollDepth()
    });
  }
  
  private getScrollDepth(): number {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    return Math.round((scrollTop / (docHeight - winHeight)) * 100) || 0;
  }
  
  flush(): void {
    if (this.actions.length === 0) return;
    
    debug.session('Flushing actions', { count: this.actions.length });
    
    // Send batch
    this.target?.send({
      type: 'session_batch',
      session: this.sessionId,
      actions: [...this.actions],
      timestamp: Date.now()
    });
    
    this.actions = [];
  }
  
  stop(): void {
    if (!this.active) return;
    this.active = false;
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    this.flush();
    
    debug.session('Session stopped', {
      pageViews: this.pageViews,
      interactions: this.interactions,
      duration: this.startTime ? Date.now() - this.startTime : 0
    });
  }
  
  getStats() {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      interactions: this.interactions,
      pendingActions: this.actions.length,
      runtime: this.startTime ? Date.now() - this.startTime : 0,
      active: this.active
    };
  }
}
