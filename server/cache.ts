// Enhanced in-memory cache with TTL and last updated tracking
interface CacheEntry<T> {
  data: T;
  expires: number;
  lastUpdated: number;
}

// Comprehensive company data structure
interface CompanyData {
  symbol: string;
  name: string;
  currentPrice: number;
  volume: string;
  marketCap: number;
  sector: string;
  industry: string;
  changes: {
    "1D": { change: number; changePercent: number } | null;
    "1W": { change: number; changePercent: number } | null;
    "1M": { change: number; changePercent: number } | null;
    "3M": { change: number; changePercent: number } | null;
    "6M": { change: number; changePercent: number } | null;
    "1Y": { change: number; changePercent: number } | null;
    "YTD": { change: number; changePercent: number } | null;
  };
  lastUpdated: number;
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      expires: now + ttlMs,
      lastUpdated: now
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

  getWithAge(key: string): { data: T; age: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return { data: entry.data, age: now - entry.lastUpdated };
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  getAllKeys(): string[] {
    this.cleanup(); // Clean expired entries first
    return Array.from(this.cache.keys());
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
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
export const companyDataCache = new Cache<CompanyData>(); // Comprehensive company data
export const quoteCache = new Cache<any>(); // 2 minutes for quotes
export const historicalCache = new Cache<any>(); // 15 minutes for historical data
export const profileCache = new Cache<any>(); // 4 hours for company profiles
export const marketDataCache = new Cache<any>(); // 10 minutes for market data
export const searchCache = new Cache<any>(); // 30 minutes for search results

// Cache TTLs in milliseconds - Extended for 50% more API quota savings
export const CACHE_TTL = {
  COMPANY_DATA: 10 * 60 * 1000, // 10 minutes for comprehensive company data
  QUOTE: 2 * 60 * 1000, // 2 minutes (was 30 seconds)
  HISTORICAL: 15 * 60 * 1000, // 15 minutes (was 5 minutes)
  PROFILE: 4 * 60 * 60 * 1000, // 4 hours (was 1 hour)
  MARKET_DATA: 10 * 60 * 1000, // 10 minutes for batch market data
  SEARCH_RESULTS: 30 * 60 * 1000, // 30 minutes for stock search results
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  companyDataCache.cleanup();
  quoteCache.cleanup();
  historicalCache.cleanup();
  profileCache.cleanup();
  marketDataCache.cleanup();
  searchCache.cleanup();
}, 5 * 60 * 1000);

// Export CompanyData type for use in other modules
export type { CompanyData };