/**
 * AMORPH v7 - Observer Targets
 * 
 * Verschiedene Backends für Observer-Daten:
 * - Console (via debug.js)
 * - HTTP API
 * - WebSocket
 */

import { debug } from './debug.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ObserverTarget {
  send(data: Record<string, unknown>): void;
}

export interface TargetConfig {
  type: 'console' | 'http' | 'websocket';
  url?: string;
  headers?: Record<string, string>;
  batch?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createTarget(config: TargetConfig): ObserverTarget {
  switch (config.type) {
    case 'console':
      return new NoOpTarget();
    case 'http':
      return new HttpTarget(config.url!, config);
    case 'websocket':
      return new WebSocketTarget(config.url!);
    default:
      return new NoOpTarget();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOOP TARGET
// ═══════════════════════════════════════════════════════════════════════════════

class NoOpTarget implements ObserverTarget {
  send(_data: Record<string, unknown>): void {
    // debug.js handles console output
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HTTP TARGET
// ═══════════════════════════════════════════════════════════════════════════════

class HttpTarget implements ObserverTarget {
  private url: string;
  private headers: Record<string, string>;
  private batch: boolean;
  private queue: Record<string, unknown>[];
  private batchTimeout: ReturnType<typeof setTimeout> | null;
  
  constructor(url: string, options: Partial<TargetConfig> = {}) {
    this.url = url;
    this.headers = options.headers || {};
    this.batch = options.batch || false;
    this.queue = [];
    this.batchTimeout = null;
  }
  
  send(data: Record<string, unknown>): void {
    if (this.batch) {
      this.queue.push(data);
      this.scheduleBatch();
    } else {
      this.post([data]);
    }
  }
  
  private scheduleBatch(): void {
    if (this.batchTimeout) return;
    this.batchTimeout = setTimeout(() => {
      this.post(this.queue);
      this.queue = [];
      this.batchTimeout = null;
    }, 1000);
  }
  
  private async post(data: Record<string, unknown>[]): Promise<void> {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.headers },
        body: JSON.stringify(data)
      });
    } catch (e) {
      debug.error('HTTP target error', e);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET TARGET
// ═══════════════════════════════════════════════════════════════════════════════

class WebSocketTarget implements ObserverTarget {
  private url: string;
  private ws: WebSocket | null;
  private queue: Record<string, unknown>[];
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  
  constructor(url: string) {
    this.url = url;
    this.ws = null;
    this.queue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connect();
  }
  
  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        debug.observer('WebSocket connected', { url: this.url });
        this.reconnectAttempts = 0;
        this.flushQueue();
      };
      
      this.ws.onclose = () => {
        debug.observer('WebSocket closed');
        this.ws = null;
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (e) => {
        debug.error('WebSocket error', e);
      };
    } catch (e) {
      debug.error('WebSocket connection failed', e);
      this.scheduleReconnect();
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      debug.warn('WebSocket max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => this.connect(), delay);
  }
  
  private flushQueue(): void {
    while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const data = this.queue.shift();
      if (data) {
        this.ws.send(JSON.stringify(data));
      }
    }
  }
  
  send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.queue.push(data);
    }
  }
}
