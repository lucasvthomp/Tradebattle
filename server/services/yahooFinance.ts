import yahooFinance from 'yahoo-finance2';
import { StockQuote, HistoricalDataPoint, CompanyProfile, SearchResult } from '../types/finance.js';

// Suppress yahoo-finance2 validation notices and configure for production
yahooFinance.setGlobalConfig({
  validation: {
    logErrors: false,
    logOptionsErrors: false,
  },
});

// List of Coinbase-supported cryptocurrency symbols only
// Restricted to major cryptocurrencies available on Coinbase
const CRYPTO_SYMBOLS = [
  'BTC-USD', 'ETH-USD', 'USDT-USD', 'XRP-USD', 'SOL-USD', 'USDC-USD',
  'ADA-USD', 'DOGE-USD', 'TRX-USD', 'AVAX-USD', 'LINK-USD', 'DOT-USD',
  'MATIC-USD', 'LTC-USD', 'UNI-USD', 'ATOM-USD', 'XLM-USD', 'ALGO-USD',
  'AAVE-USD', 'APE-USD', 'SHIB-USD', 'MANA-USD', 'SAND-USD', 'CRO-USD'
];

// Allowed exchanges for stock trading - NYSE and NASDAQ
const ALLOWED_EXCHANGES = ['NYQ', 'NYSE', 'NMS', 'NASDAQ', 'NGM', 'NCM'];

/**
 * Validate if a stock symbol is from allowed exchanges (NYSE or NASDAQ)
 */
export function isAllowedExchange(exchange?: string): boolean {
  if (!exchange) return false;
  return ALLOWED_EXCHANGES.includes(exchange.toUpperCase());
}

/**
 * Validate if a crypto symbol is supported on Coinbase
 */
export function isCoinbaseCrypto(symbol: string): boolean {
  return CRYPTO_SYMBOLS.includes(symbol.toUpperCase());
}

/**
 * Check if a symbol represents a cryptocurrency
 * Cryptos typically end with -USD (e.g., BTC-USD) or are in the known crypto list
 */
export function isCryptoSymbol(symbol: string): boolean {
  if (!symbol) return false;

  // Check if in known crypto list
  if (CRYPTO_SYMBOLS.includes(symbol.toUpperCase())) return true;

  // Check if symbol ends with -USD (common for crypto on Yahoo Finance)
  if (symbol.toUpperCase().endsWith('-USD')) return true;

  // Check if symbol ends with other crypto suffixes
  const cryptoSuffixes = ['-USDT', '-EUR', '-GBP', '-BTC', '-ETH'];
  return cryptoSuffixes.some(suffix => symbol.toUpperCase().endsWith(suffix));
}

/**
 * Get asset type for a symbol
 */
export function getAssetType(symbol: string): 'crypto' | 'stock' {
  return isCryptoSymbol(symbol) ? 'crypto' : 'stock';
}

// Define timeframe options
export type TimeFrame = '1H' | '1D' | '5D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y';

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
    case '1H':
      return {
        period1: getDaysAgo(1), // Get 1 day ago for 1 hour of data
        period2: today,
        interval: '1m' // Use 1-minute intervals for 1H timeframe
      };

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
  QUOTE: 5 * 1000, // 5 seconds - AGGRESSIVE for real-time feel
  HISTORICAL: 30 * 60 * 1000, // 30 minutes - for daily data
  HISTORICAL_MINUTE: 10 * 1000, // 10 seconds - for intraday updates
  HISTORICAL_30MIN: 30 * 1000, // 30 seconds - for 30-minute data (5D)
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
 * Fetch quote data using Yahoo Finance v8 chart API (no auth/crumb required).
 * This bypasses the yahoo-finance2 library which triggers rate limits due to crumb/cookie setup.
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // Validate exchange restrictions before fetching
  const isCrypto = isCryptoSymbol(symbol);
  if (isCrypto && !isCoinbaseCrypto(symbol)) {
    throw new Error(`Cryptocurrency ${symbol} is not supported. Only Coinbase-listed cryptocurrencies are allowed.`);
  }

  const cacheKey = `quote_${symbol}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const result = data?.chart?.result?.[0];

    if (!result || !result.meta?.regularMarketPrice) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const meta = result.meta;

    // Validate exchange restriction for stocks (skip validation for crypto)
    if (!isCrypto) {
      const exchange = meta.exchangeName || meta.exchange;
      if (!isAllowedExchange(exchange)) {
        throw new Error(`Stock ${symbol} is not listed on NYSE or NASDAQ. Only NYSE and NASDAQ stocks are allowed. (Exchange: ${exchange || 'Unknown'})`);
      }
    }

    const currentPrice = meta.regularMarketPrice;
    const previousClosePrice = meta.chartPreviousClose || currentPrice;
    const change = currentPrice - previousClosePrice;
    const percentChange = previousClosePrice > 0 ? ((change / previousClosePrice) * 100) : 0;

    const quote: StockQuote = {
      symbol: meta.symbol || symbol,
      price: currentPrice,
      change,
      percentChange,
      previousClose: previousClosePrice,
      volume: meta.regularMarketVolume || 0,
      marketCap: 0,
      currency: meta.currency || 'USD',
      sector: getSectorFallback(symbol),
      industry: undefined,
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
    // Use direct HTTP for search to avoid library's crumb/cookie rate limits
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }

    const result = await response.json() as any;

    if (!result || !result.quotes) {
      return [];
    }

    const searchResults: SearchResult[] = result.quotes
      .filter((item: any) => {
        if (!item.symbol || (!item.shortname && !item.longname)) return false;

        // Check if it's a crypto - only allow Coinbase-supported cryptos
        if (isCryptoSymbol(item.symbol)) {
          return isCoinbaseCrypto(item.symbol);
        }

        // For stocks, only allow NYSE and NASDAQ
        return isAllowedExchange(item.exchange);
      })
      .slice(0, 10)
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        exchange: item.exchange || 'N/A',
        type: item.typeDisp || 'Stock',
        sector: item.sector || getSectorFallback(item.symbol),
        industry: item.industry || undefined,
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
  if (cached) return cached;

  // Map timeframe to Yahoo Finance v8 chart API range + interval
  const tfMap: Record<string, { range: string; interval: string }> = {
    '1D':  { range: '1d',  interval: '5m'  },
    '5D':  { range: '5d',  interval: '30m' },
    '1W':  { range: '5d',  interval: '1d'  },
    '1M':  { range: '1mo', interval: '1d'  },
    '3M':  { range: '3mo', interval: '1d'  },
    '6M':  { range: '6mo', interval: '1d'  },
    'YTD': { range: 'ytd', interval: '1d'  },
    '1Y':  { range: '1y',  interval: '1d'  },
    '5Y':  { range: '5y',  interval: '1wk' },
    '1H':  { range: '1d',  interval: '1m'  },
  };

  const { range, interval } = tfMap[timeFrame] ?? { range: '1mo', interval: '1d' };
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status} for ${symbol}`);
    }

    const data = await response.json() as any;
    const result = data?.chart?.result?.[0];

    if (!result) {
      const errMsg = data?.chart?.error?.description || 'No result in response';
      throw new Error(errMsg);
    }

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const opens: number[] = quote.open || [];
    const highs: number[] = quote.high || [];
    const lows: number[] = quote.low || [];
    const closes: number[] = quote.close || [];
    const volumes: number[] = quote.volume || [];

    if (timestamps.length === 0) {
      throw new Error(`No candles returned for ${symbol}/${timeFrame}`);
    }

    const isIntraday = interval === '1m' || interval === '5m' || interval === '30m';

    const historicalData: HistoricalDataPoint[] = timestamps
      .map((ts, i) => ({
        date: isIntraday ? ts : new Date(ts * 1000).toISOString().split('T')[0],
        open:   opens[i]   ?? closes[i] ?? 0,
        high:   highs[i]   ?? closes[i] ?? 0,
        low:    lows[i]    ?? closes[i] ?? 0,
        close:  closes[i]  ?? 0,
        volume: volumes[i] ?? 0,
      }))
      .filter((d) => d.close != null && d.close > 0);

    if (historicalData.length === 0) {
      throw new Error(`All candles null/zero for ${symbol}/${timeFrame}`);
    }

    const cacheTTL = isIntraday ? CACHE_TTL.HISTORICAL_MINUTE : CACHE_TTL.HISTORICAL;
    setCachedData(cacheKey, historicalData, cacheTTL);
    return historicalData;
  } catch (error) {
    console.error(`[getHistoricalData] ${symbol}/${timeFrame}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : String(error)}`);
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
 * Get detailed company information.
 * Uses yahoo-finance2 library with retry, falling back to chart API for basic info.
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const cacheKey = `profile_${symbol}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  // Try yahoo-finance2 library first (has description, sector, industry)
  try {
    const summaryResult = await yahooFinance.quoteSummary(symbol, {
      modules: ['summaryProfile', 'price']
    });

    const priceData = summaryResult?.price;
    const profileData = summaryResult?.summaryProfile;

    const profile: CompanyProfile = {
      name: priceData?.longName || priceData?.shortName || symbol,
      description: profileData?.longBusinessSummary || 'No description available',
      sector: profileData?.sector || getSectorFallback(symbol),
      industry: profileData?.industry || 'N/A',
      marketCap: priceData?.marketCap || 0,
      volume: priceData?.regularMarketVolume || 0,
      currency: priceData?.currency || 'USD',
      exchange: priceData?.exchangeName || 'N/A',
      website: profileData?.website || undefined,
      employees: profileData?.fullTimeEmployees || undefined,
    };

    setCachedData(cacheKey, profile, CACHE_TTL.PROFILE);
    return profile;
  } catch (error) {
    console.log(`yahoo-finance2 quoteSummary failed for ${symbol}, falling back to chart API`);
  }

  // Fallback: use v8 chart API for basic company info (name, exchange, currency)
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const data = await response.json() as any;
    const meta = data?.chart?.result?.[0]?.meta;

    const profile: CompanyProfile = {
      name: meta?.longName || meta?.shortName || symbol,
      description: 'No description available',
      sector: getSectorFallback(symbol),
      industry: 'N/A',
      marketCap: 0,
      volume: meta?.regularMarketVolume || 0,
      currency: meta?.currency || 'USD',
      exchange: meta?.fullExchangeName || meta?.exchangeName || 'N/A',
      website: undefined,
      employees: undefined,
    };

    setCachedData(cacheKey, profile, CACHE_TTL.PROFILE);
    return profile;
  } catch (fallbackError) {
    console.error(`All profile fetches failed for ${symbol}:`, fallbackError);
    throw new Error(`Failed to fetch profile for ${symbol}`);
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
 * Get popular/trending stocks - NYSE and NASDAQ
 */
export async function getPopularStocks(): Promise<StockQuote[]> {
  // Popular stocks from both NYSE and NASDAQ
  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'JPM', 'BAC', 'WMT', 'TSLA'];
  return getMultipleQuotes(popularSymbols);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of Array.from(cache.entries())) {
    if (now - value.timestamp >= value.ttl) {
      cache.delete(key);
    }
  }
}

// Clean up cache every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);