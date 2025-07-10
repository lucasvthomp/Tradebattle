// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expires: number;
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache instances with different TTLs
export const quoteCache = new Cache<any>(); // 30 seconds for quotes
export const historicalCache = new Cache<any>(); // 5 minutes for historical data
export const profileCache = new Cache<any>(); // 1 hour for company profiles

// Cache TTLs in milliseconds
export const CACHE_TTL = {
  QUOTE: 30 * 1000, // 30 seconds
  HISTORICAL: 5 * 60 * 1000, // 5 minutes
  PROFILE: 60 * 60 * 1000, // 1 hour
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  quoteCache.cleanup();
  historicalCache.cleanup();
  profileCache.cleanup();
}, 5 * 60 * 1000);