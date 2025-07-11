import yahooFinance from 'yahoo-finance2';
import { StockQuote, HistoricalDataPoint, CompanyProfile, SearchResult } from '../types/finance.js';

// Define timeframe options
export type TimeFrame = '1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y';

// Helper function to calculate date ranges
export function getDateRange(timeFrame: TimeFrame): { period1: string; period2: string; interval: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Helper to get date N days ago
  const getDaysAgo = (days: number): string => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };
  
  // Helper to get start of current year
  const getYearStart = (): string => {
    return `${now.getFullYear()}-01-01`;
  };
  
  // Helper to get date N years ago
  const getYearsAgo = (years: number): string => {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split('T')[0];
  };

  switch (timeFrame) {
    case '1D':
      return {
        period1: getDaysAgo(1),
        period2: today,
        interval: '5m' // 5-minute intervals for intraday
      };
    
    case '1W':
      return {
        period1: getDaysAgo(7),
        period2: today,
        interval: '30m' // 30-minute intervals
      };
    
    case '1M':
      return {
        period1: getDaysAgo(30),
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case '6M':
      return {
        period1: getDaysAgo(180),
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case 'YTD':
      return {
        period1: getYearStart(),
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case '1Y':
      return {
        period1: getYearsAgo(1),
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case '5Y':
      return {
        period1: getYearsAgo(5),
        period2: today,
        interval: '1wk' // Weekly intervals for longer timeframes
      };
    
    default:
      throw new Error(`Unsupported timeframe: ${timeFrame}`);
  }
}

// Cache for storing API responses to avoid excessive calls
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  QUOTE: 5 * 60 * 1000, // 5 minutes
  HISTORICAL: 30 * 60 * 1000, // 30 minutes
  PROFILE: 60 * 60 * 1000, // 1 hour
  SEARCH: 30 * 60 * 1000, // 30 minutes
};

/**
 * Get cached data or return null if expired
 */
function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

/**
 * Set data in cache with TTL
 */
function setCachedData(key: string, data: any, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Format large numbers with appropriate suffixes
 */
function formatLargeNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}

/**
 * Fetch current stock quote data
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `quote_${symbol}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const result = await yahooFinance.quote(symbol);
    
    if (!result || !result.regularMarketPrice) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const quote: StockQuote = {
      symbol: result.symbol || symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      percentChange: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      currency: result.currency || 'USD',
    };

    setCachedData(cacheKey, quote, CACHE_TTL.QUOTE);
    return quote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for stock symbols by company name
 */
export async function searchStocks(query: string): Promise<SearchResult[]> {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const result = await yahooFinance.search(query);
    
    if (!result || !result.quotes) {
      return [];
    }

    const searchResults: SearchResult[] = result.quotes
      .filter(item => item.symbol && item.shortname)
      .slice(0, 10) // Limit to top 10 results
      .map(item => ({
        symbol: item.symbol!,
        name: item.shortname || item.longname || item.symbol!,
        exchange: item.exchange || 'N/A',
        type: item.typeDisp || 'Stock',
      }));

    setCachedData(cacheKey, searchResults, CACHE_TTL.SEARCH);
    return searchResults;
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    throw new Error(`Failed to search for ${query}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get historical price data for a stock with timeframe support
 */
export async function getHistoricalData(symbol: string, timeFrame: TimeFrame = '1M'): Promise<HistoricalDataPoint[]> {
  const cacheKey = `historical_${symbol}_${timeFrame}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const { period1, period2, interval } = getDateRange(timeFrame);
    
    // Use chart data for intraday (1D, 1W), historical for longer periods
    const result = timeFrame === '1D' || timeFrame === '1W' 
      ? await yahooFinance.chart(symbol, {
          period1,
          period2,
          interval: interval as any,
          includePrePost: timeFrame === '1D'
        })
      : await yahooFinance.historical(symbol, {
          period1,
          period2,
          interval: interval as any,
          events: 'history'
        });

    if (!result) {
      throw new Error(`No historical data found for symbol: ${symbol}`);
    }

    let historicalData: HistoricalDataPoint[];

    if (timeFrame === '1D' || timeFrame === '1W') {
      // Chart data structure
      const quotes = (result as any).quotes || [];
      historicalData = quotes.map((item: any) => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }));
    } else {
      // Historical data structure
      const data = result as any[];
      historicalData = data.map(item => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }));
    }

    setCachedData(cacheKey, historicalData, CACHE_TTL.HISTORICAL);
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate percentage change between two prices
 */
export function calculatePercentChange(currentPrice: number, previousPrice: number): number {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Get stock performance data for different timeframes
 */
export async function getStockPerformance(symbol: string, timeFrame: TimeFrame): Promise<{
  symbol: string;
  timeFrame: TimeFrame;
  currentPrice: number;
  previousPrice: number;
  change: number;
  percentChange: number;
}> {
  const cacheKey = `performance_${symbol}_${timeFrame}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const [currentQuote, historicalData] = await Promise.all([
      getStockQuote(symbol),
      getHistoricalData(symbol, timeFrame)
    ]);

    if (!historicalData || historicalData.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    const previousPrice = historicalData[0].close;
    const currentPrice = currentQuote.price;
    const change = currentPrice - previousPrice;
    const percentChange = calculatePercentChange(currentPrice, previousPrice);

    const performance = {
      symbol,
      timeFrame,
      currentPrice,
      previousPrice,
      change,
      percentChange,
    };

    setCachedData(cacheKey, performance, CACHE_TTL.QUOTE);
    return performance;
  } catch (error) {
    console.error(`Error fetching performance for ${symbol}:`, error);
    throw new Error(`Failed to fetch performance for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed company information
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const cacheKey = `profile_${symbol}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const [quoteResult, summaryResult] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { 
        modules: ['summaryProfile', 'defaultKeyStatistics', 'price'] 
      }).catch(() => null)
    ]);

    if (!quoteResult) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const profile: CompanyProfile = {
      name: quoteResult.longName || quoteResult.shortName || symbol,
      description: summaryResult?.summaryProfile?.longBusinessSummary || 'No description available',
      sector: summaryResult?.summaryProfile?.sector || 'N/A',
      industry: summaryResult?.summaryProfile?.industry || 'N/A',
      marketCap: quoteResult.marketCap || 0,
      volume: quoteResult.regularMarketVolume || 0,
      currency: quoteResult.currency || 'USD',
      exchange: quoteResult.fullExchangeName || 'N/A',
      website: summaryResult?.summaryProfile?.website || undefined,
      employees: summaryResult?.summaryProfile?.fullTimeEmployees || undefined,
    };

    setCachedData(cacheKey, profile, CACHE_TTL.PROFILE);
    return profile;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw new Error(`Failed to fetch profile for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get multiple stock quotes efficiently
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const promises = symbols.map(symbol => 
    getStockQuote(symbol).catch(error => {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  return results.filter((quote): quote is StockQuote => quote !== null);
}

/**
 * Get popular/trending stocks
 */
export async function getPopularStocks(): Promise<StockQuote[]> {
  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'];
  return getMultipleQuotes(popularSymbols);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= value.ttl) {
      cache.delete(key);
    }
  }
}

// Clean up cache every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);