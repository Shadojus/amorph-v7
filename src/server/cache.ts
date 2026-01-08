/**
 * AMORPH - In-Memory Cache (v8.0)
 * 
 * Simple TTL-based cache for data responses.
 * Production-ready with automatic cleanup.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
  created: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(defaultTTLSeconds = 300) {
    this.defaultTTL = defaultTTLSeconds * 1000;
    this.startCleanup();
  }

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set value with optional custom TTL
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      created: Date.now()
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching pattern
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Cleanup expired entries periodically
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`[Cache] Cleaned ${cleaned} expired entries`);
      }
    }, 60000);
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Environment-based TTL
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
const ENABLE_CACHE = process.env.ENABLE_CACHE !== 'false';

// Singleton instance
export const cache = new MemoryCache(CACHE_TTL);

/**
 * Cache-aware fetch wrapper
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  if (!ENABLE_CACHE) {
    return fetcher();
  }

  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] HIT: ${key}`);
    return cached;
  }

  console.log(`[Cache] MISS: ${key}`);
  const data = await fetcher();
  cache.set(key, data, ttlSeconds);
  return data;
}

/**
 * Invalidate species cache (after updates)
 */
export function invalidateSpeciesCache(category?: string): void {
  if (category) {
    cache.deletePattern(`species:${category}`);
  } else {
    cache.deletePattern('species:');
  }
  console.log(`[Cache] Invalidated species cache${category ? ` for ${category}` : ''}`);
}

export default cache;
