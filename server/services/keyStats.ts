import yahooFinance from 'yahoo-finance2';
import { KeyStats } from '../types/finance.js';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getKeyStats(symbol: string): Promise<KeyStats> {
  const cacheKey = `keystats_${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ['defaultKeyStatistics', 'summaryDetail']
      }).catch(() => null)
    ]);

    const keyStats = summary?.defaultKeyStatistics;
    const summaryDetail = summary?.summaryDetail;

    const stats: KeyStats = {
      trailingPE: (quote as any).trailingPE ?? summaryDetail?.trailingPE ?? null,
      epsTrailingTwelveMonths: (quote as any).epsTrailingTwelveMonths ?? null,
      fiftyTwoWeekHigh: (quote as any).fiftyTwoWeekHigh ?? summaryDetail?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: (quote as any).fiftyTwoWeekLow ?? summaryDetail?.fiftyTwoWeekLow ?? null,
      dividendYield: summaryDetail?.dividendYield ?? (quote as any).dividendYield ?? null,
      beta: keyStats?.beta ?? null,
      averageVolume: (quote as any).averageDailyVolume10Day ?? summaryDetail?.averageVolume10days ?? null,
      regularMarketDayHigh: (quote as any).regularMarketDayHigh ?? null,
      regularMarketDayLow: (quote as any).regularMarketDayLow ?? null,
      regularMarketOpen: (quote as any).regularMarketOpen ?? null,
      marketCap: (quote as any).marketCap ?? null,
    };

    setCache(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error(`Error fetching key stats for ${symbol}:`, error);
    throw new Error(`Failed to fetch key stats for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
