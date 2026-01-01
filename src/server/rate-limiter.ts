/**
 * Rate Limiter - IP-based request throttling
 * Production-ready with configurable limits and cleanup
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
}

interface RateLimiterConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  blockDuration: number; // How long to block after limit exceeded (ms)
  cleanupInterval: number;
}

const defaultConfig: RateLimiterConfig = {
  windowMs: 60 * 1000,        // 1 minute window
  maxRequests: 100,           // 100 requests per minute
  blockDuration: 5 * 60 * 1000, // Block for 5 minutes after exceeding
  cleanupInterval: 60 * 1000  // Cleanup every minute
};

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private config: RateLimiterConfig;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startCleanup();
  }

  /**
   * Check if request should be allowed
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip: string): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const now = Date.now();
    const entry = this.requests.get(ip);

    // New visitor
    if (!entry) {
      this.requests.set(ip, {
        count: 1,
        firstRequest: now,
        blocked: false
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Currently blocked
    if (entry.blocked) {
      const blockEnd = entry.firstRequest + this.config.blockDuration;
      if (now < blockEnd) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockEnd,
          retryAfter: Math.ceil((blockEnd - now) / 1000)
        };
      }
      // Block expired, reset
      entry.blocked = false;
      entry.count = 1;
      entry.firstRequest = now;
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Window expired, reset counter
    if (now - entry.firstRequest > this.config.windowMs) {
      entry.count = 1;
      entry.firstRequest = now;
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Within window, increment
    entry.count++;

    // Check if over limit
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true;
      entry.firstRequest = now; // Reset for block duration
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.blockDuration,
        retryAfter: Math.ceil(this.config.blockDuration / 1000)
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.firstRequest + this.config.windowMs
    };
  }

  /**
   * Get current stats
   */
  getStats(): { totalTracked: number; blockedIPs: number } {
    let blockedIPs = 0;
    this.requests.forEach(entry => {
      if (entry.blocked) blockedIPs++;
    });
    return {
      totalTracked: this.requests.size,
      blockedIPs
    };
  }

  /**
   * Manually block an IP
   */
  blockIP(ip: string, duration?: number): void {
    this.requests.set(ip, {
      count: this.config.maxRequests + 1,
      firstRequest: Date.now(),
      blocked: true
    });
  }

  /**
   * Unblock an IP
   */
  unblockIP(ip: string): void {
    this.requests.delete(ip);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const maxAge = Math.max(this.config.windowMs, this.config.blockDuration);
      
      this.requests.forEach((entry, ip) => {
        if (now - entry.firstRequest > maxAge) {
          this.requests.delete(ip);
        }
      });
    }, this.config.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.requests.clear();
  }
}

// Singleton instances for different rate limit tiers
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  blockDuration: 5 * 60 * 1000
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  blockDuration: 15 * 60 * 1000
});

// Helper to extract IP from request
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - in production this should be from the connection
  return 'unknown';
}

// Middleware helper for Astro API routes
export function checkRateLimit(request: Request, limiter = apiRateLimiter): Response | null {
  const ip = getClientIP(request);
  const result = limiter.check(ip);

  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please slow down.',
      retryAfter: result.retryAfter
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Limit': String(100),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
      }
    });
  }

  return null; // Request allowed
}

// Export for rate limit headers on successful requests
export function getRateLimitHeaders(request: Request, limiter = apiRateLimiter): Record<string, string> {
  const ip = getClientIP(request);
  const result = limiter.check(ip);
  
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining - 1)), // -1 because check() increments
    'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
  };
}

export { RateLimiter };
export type { RateLimiterConfig };
