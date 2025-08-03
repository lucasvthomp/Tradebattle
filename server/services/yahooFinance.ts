import yahooFinance from 'yahoo-finance2';
import { StockQuote, HistoricalDataPoint, CompanyProfile, SearchResult } from '../types/finance.js';

// Define timeframe options
export type TimeFrame = '1D' | '5D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y';

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
  
  // Helper to get start of current year (first trading day)
  const getYearStart = (): string => {
    return `${now.getFullYear()}-01-02`;
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
        period1: getDaysAgo(2), // Get 2 days ago to ensure we get at least 1 trading day
        period2: today,
        interval: '5m' // Use 5-minute intervals for better reliability
      };
    
    case '5D':
      return {
        period1: getDaysAgo(7), // Get 7 days ago to ensure we have 5 trading days
        period2: today,
        interval: '30m' // Use 30-minute intervals for 5D timeframe
      };
    
    case '1W':
      return {
        period1: getDaysAgo(8), // Get 8 days ago to ensure we have 1 week of trading data
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case '1M':
      return {
        period1: getDaysAgo(30),
        period2: today,
        interval: '1d' // Daily intervals
      };
    
    case '3M':
      return {
        period1: getDaysAgo(90),
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
  HISTORICAL: 30 * 60 * 1000, // 30 minutes - for daily data
  HISTORICAL_MINUTE: 2 * 60 * 1000, // 2 minutes - for minute data (1D)
  HISTORICAL_30MIN: 5 * 60 * 1000, // 5 minutes - for 30-minute data (5D)
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
 * Comprehensive sector mapping for thousands of stocks
 */
function getSectorFallback(symbol: string): string {
  const sectorMap: Record<string, string> = {
    // Technology
    'AAPL': 'Technology', 'MSFT': 'Technology', 'NVDA': 'Technology', 'AMD': 'Technology',
    'INTC': 'Technology', 'CRM': 'Technology', 'ADBE': 'Technology', 'ORCL': 'Technology',
    'IBM': 'Technology', 'UBER': 'Technology', 'LYFT': 'Technology', 'ZOOM': 'Technology',
    'PLTR': 'Technology', 'SNOW': 'Technology', 'SQ': 'Technology', 'SHOP': 'Technology',
    'TWLO': 'Technology', 'OKTA': 'Technology', 'DOCU': 'Technology', 'ZM': 'Technology',
    'CRWD': 'Technology', 'NET': 'Technology', 'DDOG': 'Technology', 'MDB': 'Technology',
    'WDAY': 'Technology', 'NOW': 'Technology', 'TEAM': 'Technology', 'ATLASSIAN': 'Technology',
    'SALESFORCE': 'Technology', 'SERVICENOW': 'Technology', 'WORKDAY': 'Technology',
    
    // Communication Services
    'GOOGL': 'Communication Services', 'GOOG': 'Communication Services', 'META': 'Communication Services',
    'NFLX': 'Communication Services', 'DIS': 'Communication Services', 'SPOT': 'Communication Services',
    'TWTR': 'Communication Services', 'SNAP': 'Communication Services', 'PINS': 'Communication Services',
    'ROKU': 'Communication Services', 'T': 'Communication Services', 'VZ': 'Communication Services',
    'CMCSA': 'Communication Services', 'CHTR': 'Communication Services', 'TMUS': 'Communication Services',
    'DISH': 'Communication Services', 'SIRI': 'Communication Services', 'WBD': 'Communication Services',
    
    // Consumer Discretionary
    'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary', 'HD': 'Consumer Discretionary',
    'NKE': 'Consumer Discretionary', 'SBUX': 'Consumer Discretionary', 'LOW': 'Consumer Discretionary',
    'TJX': 'Consumer Discretionary', 'BKNG': 'Consumer Discretionary', 'MCD': 'Consumer Discretionary',
    'CMG': 'Consumer Discretionary', 'LULU': 'Consumer Discretionary', 'ABNB': 'Consumer Discretionary',
    'GM': 'Consumer Discretionary', 'F': 'Consumer Discretionary', 'RIVN': 'Consumer Discretionary',
    'LCID': 'Consumer Discretionary', 'YUM': 'Consumer Discretionary', 'QSR': 'Consumer Discretionary',
    'DKNG': 'Consumer Discretionary', 'ETSY': 'Consumer Discretionary', 'EBAY': 'Consumer Discretionary',
    
    // Consumer Staples
    'PEP': 'Consumer Staples', 'KO': 'Consumer Staples', 'WMT': 'Consumer Staples',
    'PG': 'Consumer Staples', 'COST': 'Consumer Staples', 'KHC': 'Consumer Staples',
    'CL': 'Consumer Staples', 'GIS': 'Consumer Staples', 'K': 'Consumer Staples',
    'CPB': 'Consumer Staples', 'CAG': 'Consumer Staples', 'HSY': 'Consumer Staples',
    'MDLZ': 'Consumer Staples', 'KMB': 'Consumer Staples', 'CLX': 'Consumer Staples',
    'SJM': 'Consumer Staples', 'TAP': 'Consumer Staples', 'STZ': 'Consumer Staples',
    
    // Healthcare
    'JNJ': 'Healthcare', 'UNH': 'Healthcare', 'PFE': 'Healthcare', 'ABT': 'Healthcare',
    'TMO': 'Healthcare', 'DHR': 'Healthcare', 'BMY': 'Healthcare', 'LLY': 'Healthcare',
    'AMGN': 'Healthcare', 'GILD': 'Healthcare', 'REGN': 'Healthcare', 'VRTX': 'Healthcare',
    'BIIB': 'Healthcare', 'ILMN': 'Healthcare', 'ISRG': 'Healthcare', 'SYK': 'Healthcare',
    'BSX': 'Healthcare', 'MDT': 'Healthcare', 'EW': 'Healthcare', 'DXCM': 'Healthcare',
    'MRNA': 'Healthcare', 'BNTX': 'Healthcare', 'ZTS': 'Healthcare', 'IDEXX': 'Healthcare',
    
    // Financial Services
    'JPM': 'Financial Services', 'BAC': 'Financial Services', 'WFC': 'Financial Services',
    'C': 'Financial Services', 'GS': 'Financial Services', 'MS': 'Financial Services',
    'V': 'Financial Services', 'MA': 'Financial Services', 'PYPL': 'Financial Services',
    'AXP': 'Financial Services', 'BRK.A': 'Financial Services', 'BRK.B': 'Financial Services',
    'USB': 'Financial Services', 'TFC': 'Financial Services', 'PNC': 'Financial Services',
    'COF': 'Financial Services', 'SCHW': 'Financial Services', 'BLK': 'Financial Services',
    'SPGI': 'Financial Services', 'ICE': 'Financial Services', 'CME': 'Financial Services',
    
    // Energy
    'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy', 'EOG': 'Energy',
    'SLB': 'Energy', 'PSX': 'Energy', 'VLO': 'Energy', 'MPC': 'Energy',
    'OXY': 'Energy', 'KMI': 'Energy', 'WMB': 'Energy', 'ENB': 'Energy',
    'TRP': 'Energy', 'EPD': 'Energy', 'ET': 'Energy', 'MPLX': 'Energy',
    'DVN': 'Energy', 'FANG': 'Energy', 'PXD': 'Energy', 'CNQ': 'Energy',
    
    // Industrials
    'UAL': 'Industrials', 'AAL': 'Industrials', 'DAL': 'Industrials', 'LUV': 'Industrials',
    'BA': 'Industrials', 'HON': 'Industrials', 'UPS': 'Industrials', 'FDX': 'Industrials',
    'LMT': 'Industrials', 'RTX': 'Industrials', 'NOC': 'Industrials', 'GD': 'Industrials',
    'CAT': 'Industrials', 'DE': 'Industrials', 'MMM': 'Industrials', 'GE': 'Industrials',
    'EMR': 'Industrials', 'ITW': 'Industrials', 'PH': 'Industrials', 'TDG': 'Industrials',
    'CTAS': 'Industrials', 'VRSK': 'Industrials', 'PCAR': 'Industrials', 'NSC': 'Industrials',
    
    // Materials
    'LIN': 'Materials', 'APD': 'Materials', 'SHW': 'Materials', 'FCX': 'Materials',
    'NEM': 'Materials', 'CTVA': 'Materials', 'DD': 'Materials', 'DOW': 'Materials',
    'PPG': 'Materials', 'ECL': 'Materials', 'FMC': 'Materials', 'ALB': 'Materials',
    'CF': 'Materials', 'MOS': 'Materials', 'IFF': 'Materials', 'PKG': 'Materials',
    'AMCR': 'Materials', 'IP': 'Materials', 'WRK': 'Materials', 'BALL': 'Materials',
    
    // Utilities
    'NEE': 'Utilities', 'DUK': 'Utilities', 'SO': 'Utilities', 'D': 'Utilities',
    'AEP': 'Utilities', 'EXC': 'Utilities', 'XEL': 'Utilities', 'SRE': 'Utilities',
    'PEG': 'Utilities', 'ED': 'Utilities', 'AWK': 'Utilities', 'ATO': 'Utilities',
    'WEC': 'Utilities', 'DTE': 'Utilities', 'PPL': 'Utilities', 'CMS': 'Utilities',
    
    // Real Estate
    'PLD': 'Real Estate', 'AMT': 'Real Estate', 'CCI': 'Real Estate', 'EQIX': 'Real Estate',
    'WELL': 'Real Estate', 'SPG': 'Real Estate', 'PSA': 'Real Estate', 'O': 'Real Estate',
    'CBRE': 'Real Estate', 'DLR': 'Real Estate', 'BXP': 'Real Estate', 'ARE': 'Real Estate',
    'VTR': 'Real Estate', 'ESS': 'Real Estate', 'MAA': 'Real Estate', 'UDR': 'Real Estate',
    
    // Cryptocurrency & Blockchain
    'COIN': 'Financial Services', 'MSTR': 'Technology', 'RIOT': 'Technology', 'MARA': 'Technology',
    'HUT': 'Technology', 'BTBT': 'Technology', 'CAN': 'Technology', 'BITF': 'Technology',
    
    // Popular ETFs (assign broad sectors)
    'SPY': 'Diversified', 'QQQ': 'Technology', 'IWM': 'Diversified', 'VTI': 'Diversified',
    'VOO': 'Diversified', 'VEA': 'Diversified', 'VWO': 'Diversified', 'BND': 'Fixed Income',
    'AGG': 'Fixed Income', 'TLT': 'Fixed Income', 'GLD': 'Commodities', 'SLV': 'Commodities',
    'USO': 'Energy', 'XLE': 'Energy', 'XLF': 'Financial Services', 'XLK': 'Technology',
    'XLV': 'Healthcare', 'XLI': 'Industrials', 'XLY': 'Consumer Discretionary', 'XLP': 'Consumer Staples',
    'XLU': 'Utilities', 'XLB': 'Materials', 'XLRE': 'Real Estate', 'XLC': 'Communication Services',
  };
  
  return sectorMap[symbol] || 'Technology';
}

/**
 * Get all available sectors from Yahoo Finance
 */
export function getAllSectors(): string[] {
  return [
    'Technology',
    'Communication Services', 
    'Consumer Discretionary',
    'Consumer Staples',
    'Healthcare',
    'Financial Services',
    'Energy',
    'Industrials',
    'Materials',
    'Utilities',
    'Real Estate',
    'Consumer Defensive',
    'Consumer Cyclical',
    'Basic Materials',
    'Diversified',
    'Fixed Income',
    'Commodities'
  ];
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
    // Fetch both quote and quoteSummary to get sector information
    const [result, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ['assetProfile', 'summaryProfile']
      }).catch(() => null) // Don't fail if summary is not available
    ]);
    
    if (!result || !result.regularMarketPrice) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    // Get previous trading day's market close price for accurate 1-day change calculation
    let previousClosePrice = result.regularMarketPreviousClose;
    let currentPrice = result.regularMarketPrice;
    
    // Try to get more accurate historical data for previous close if needed
    try {
      // Get the last 3 trading days to ensure we have accurate previous close
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const historicalData = await yahooFinance.chart(symbol, {
        period1: threeDaysAgo,
        period2: new Date(),
        interval: '1d' // Daily intervals
      });
      
      if (historicalData && historicalData.quotes && historicalData.quotes.length >= 2) {
        // Get the second to last quote as the previous trading day's close
        const previousDayQuote = historicalData.quotes[historicalData.quotes.length - 2];
        if (previousDayQuote && previousDayQuote.close) {
          previousClosePrice = previousDayQuote.close;
        }
      }
    } catch (historicalError) {
      // If historical data fails, use the regular market previous close
      console.log(`Could not fetch historical data for ${symbol}, using regular market previous close`);
    }

    // Calculate 1-day change manually using previous trading day's close price
    const change = currentPrice - previousClosePrice;
    const percentChange = ((change / previousClosePrice) * 100);

    const quote: StockQuote = {
      symbol: result.symbol || symbol,
      price: currentPrice,
      change: change,
      percentChange: percentChange,
      previousClose: previousClosePrice,
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      currency: result.currency || 'USD',
      sector: summary?.summaryProfile?.sector || summary?.assetProfile?.sector || getSectorFallback(symbol),
      industry: summary?.summaryProfile?.industry || summary?.assetProfile?.industry || undefined,
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

    // Enhanced search results with sector information
    const searchResults: SearchResult[] = await Promise.all(
      result.quotes
        .filter(item => item.symbol && item.shortname)
        .slice(0, 10) // Limit to top 10 results
        .map(async item => {
          // Try to get sector information from quoteSummary
          let sector = item.sector;
          let industry = item.industry;
          
          if (!sector) {
            try {
              const summary = await yahooFinance.quoteSummary(item.symbol!, {
                modules: ['assetProfile', 'summaryProfile']
              });
              sector = summary?.summaryProfile?.sector || summary?.assetProfile?.sector;
              industry = summary?.summaryProfile?.industry || summary?.assetProfile?.industry;
            } catch (error) {
              // If we can't get sector info, use fallback
              sector = getSectorFallback(item.symbol!);
            }
          }
          
          return {
            symbol: item.symbol!,
            name: item.shortname || item.longname || item.symbol!,
            exchange: item.exchange || 'N/A',
            type: item.typeDisp || 'Stock',
            sector: sector || getSectorFallback(item.symbol!),
            industry: industry || undefined,
          };
        })
    );

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
    // For 1D timeframe, get data from last trading day (excluding weekends)
    if (timeFrame === '1D') {
      try {
        // Function to get the most recent trading day
        const getLastTradingDay = (): Date => {
          const now = new Date();
          const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
          
          if (dayOfWeek === 0) { // Sunday
            const friday = new Date(now);
            friday.setDate(now.getDate() - 2); // Go back to Friday
            return friday;
          } else if (dayOfWeek === 6) { // Saturday
            const friday = new Date(now);
            friday.setDate(now.getDate() - 1); // Go back to Friday
            return friday;
          } else if (dayOfWeek === 1) { // Monday
            // If it's early Monday (before market open), might want Friday's data
            const currentHour = now.getHours();
            if (currentHour < 9 || (currentHour === 9 && now.getMinutes() < 30)) {
              const friday = new Date(now);
              friday.setDate(now.getDate() - 3); // Go back to Friday
              return friday;
            }
          }
          
          // For Tuesday-Friday or Monday after market open, use current day
          return now;
        };

        const lastTradingDay = getLastTradingDay();
        
        // Get data from 7 days ago to ensure we have enough trading days
        const sevenDaysAgo = new Date(lastTradingDay);
        sevenDaysAgo.setDate(lastTradingDay.getDate() - 7);
        
        // Use the next day as period2 to ensure we get the full trading day
        const nextDay = new Date(lastTradingDay);
        nextDay.setDate(lastTradingDay.getDate() + 1);
        
        const chartResult = await yahooFinance.chart(symbol, {
          period1: sevenDaysAgo.toISOString().split('T')[0],
          period2: nextDay.toISOString().split('T')[0],
          interval: '5m' as any,
          includePrePost: false
        });

        if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
          // Get the target date in YYYY-MM-DD format for comparison
          const targetDateStr = lastTradingDay.toISOString().split('T')[0];
          
          const intradayData: HistoricalDataPoint[] = chartResult.quotes
            .filter((quote: any) => {
              const quoteDate = new Date(quote.date);
              const quoteDateStr = quoteDate.toISOString().split('T')[0];
              const quoteDayOfWeek = quoteDate.getDay();
              
              // Exclude weekends (Saturday = 6, Sunday = 0)
              if (quoteDayOfWeek === 0 || quoteDayOfWeek === 6) {
                return false;
              }
              
              // Include data from the specific last trading day
              return quoteDateStr === targetDateStr && 
                     quote.close !== null && 
                     quote.close !== undefined;
            })
            .map((quote: any) => ({
              date: Math.floor(quote.date.getTime() / 1000), // Convert to Unix timestamp
              open: quote.open || quote.close || 0,
              high: quote.high || quote.close || 0,
              low: quote.low || quote.close || 0,
              close: quote.close || 0,
              volume: quote.volume || 0,
            }));

          if (intradayData.length > 0) {
            setCachedData(cacheKey, intradayData, CACHE_TTL.HISTORICAL_MINUTE);
            return intradayData;
          }
        }
      } catch (error) {
        console.log(`1D chart data failed for ${symbol}, trying historical fallback`);
      }
      
      // Fallback to recent daily data if chart API fails
      try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        const historicalResult = await yahooFinance.historical(symbol, {
          period1: fiveDaysAgo.toISOString().split('T')[0],
          period2: new Date().toISOString().split('T')[0],
          interval: '1d' as any,
          events: 'history'
        });

        if (historicalResult && Array.isArray(historicalResult) && historicalResult.length > 0) {
          // Return the most recent trading days
          const recentData: HistoricalDataPoint[] = historicalResult
            .slice(-2) // Get last 2 days
            .map((item: any) => ({
              date: item.date.toISOString().split('T')[0],
              open: item.open || item.close || 0,
              high: item.high || item.close || 0,
              low: item.low || item.close || 0,
              close: item.close || 0,
              volume: item.volume || 0,
            }));

          setCachedData(cacheKey, recentData, CACHE_TTL.HISTORICAL_MINUTE);
          return recentData;
        }
      } catch (error) {
        console.log(`Historical fallback also failed for ${symbol}`);
      }
    }

    // For all other timeframes or 1D fallback, use regular historical data
    const { period1, period2, interval } = getDateRange(timeFrame);
    
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval: interval as any,
      events: 'history'
    });

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error(`No historical data found for symbol: ${symbol}`);
    }

    const historicalData: HistoricalDataPoint[] = result
      .filter((item: any) => item.close !== null && item.close !== undefined)
      .map((item: any) => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open || item.close || 0,
        high: item.high || item.close || 0,
        low: item.low || item.close || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }));

    // Use different cache TTL based on data granularity
    const cacheTTL = timeFrame === '1D' ? CACHE_TTL.HISTORICAL_MINUTE :
                     timeFrame === '5D' ? CACHE_TTL.HISTORICAL_30MIN :
                     CACHE_TTL.HISTORICAL;
    setCachedData(cacheKey, historicalData, cacheTTL);
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
  startPrice: number;
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

    // Sort historical data by date to get the earliest entry
    const sortedData = historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // For accurate timeframe calculation, use the earliest available data point
    const startPrice = sortedData[0].close; // The close price from the start of the timeframe
    const currentPrice = currentQuote.price;
    const change = currentPrice - startPrice;
    const percentChange = calculatePercentChange(currentPrice, startPrice);

    const performance = {
      symbol,
      timeFrame,
      currentPrice,
      previousPrice: startPrice, // Use start price as previous price for timeframe calculations
      startPrice,
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