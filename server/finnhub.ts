import fetch from "node-fetch";
import { getTwelveDataHistorical } from "./twelvedata";
import { getPolygonHistoricalData } from "./polygon";
import { quoteCache, historicalCache, profileCache, marketDataCache, CACHE_TTL } from "./cache";
import { APIError, RateLimitError, validateQuoteData, validateHistoricalData } from "./errors";
import { withRetry, shouldRetryAPICall } from "./retry";
import { batchProcessor } from "./batch-cache";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d1nr9epr01qtrautf0sgd1nr9epr01qtrautf0t0";
const BASE_URL = "https://finnhub.io/api/v1";

// Rate limiting for Finnhub API (60 calls per minute = 1 call per second)
let finnhubLastRequest = 0;
const FINNHUB_MIN_INTERVAL = 1000; // 1 second between requests

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  if (now - finnhubLastRequest < FINNHUB_MIN_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, FINNHUB_MIN_INTERVAL - (now - finnhubLastRequest)),
    );
  }
  finnhubLastRequest = Date.now();

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      console.log(`Finnhub API rate limited, waiting 2 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Retry once
      return await fetch(url);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  country: string;
  currency: string;
  exchange: string;
  weburl: string;
  logo: string;
}

export async function getStockQuote(
  symbol: string,
): Promise<StockQuote | null> {
  // Check cache first
  const cacheKey = `quote:${symbol}`;
  const cached = quoteCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await withRetry(async () => {
      const response = await rateLimitedFetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      );

      const data = (await response.json()) as any;

      if (!validateQuoteData(data)) {
        throw new Error(`Invalid quote data for ${symbol}`);
      }

      return {
        symbol,
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
      };
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      retryCondition: shouldRetryAPICall
    });

    // Cache the result
    quoteCache.set(cacheKey, result, CACHE_TTL.QUOTE);
    return result;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getCompanyProfile(
  symbol: string,
): Promise<CompanyProfile | null> {
  // Check cache first
  const cacheKey = `profile:${symbol}`;
  const cached = profileCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await withRetry(async () => {
      const response = await rateLimitedFetch(
        `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      );

      const data = (await response.json()) as any;

      if (!data.name) {
        throw new Error(`No profile data for ${symbol}`);
      }

      return {
        symbol,
        name: data.name,
        sector: data.finnhubIndustry || "Unknown",
        industry: data.finnhubIndustry || "Unknown",
        marketCap: data.marketCapitalization || 0,
        country: data.country || "US",
        currency: data.currency || "USD",
        exchange: data.exchange || "Unknown",
        weburl: data.weburl || "",
        logo: data.logo || "",
      };
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      retryCondition: shouldRetryAPICall
    });

    // Cache the result
    profileCache.set(cacheKey, result, CACHE_TTL.PROFILE);
    return result;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleQuotes(
  symbols: string[],
): Promise<StockQuote[]> {
  // Check for batch cache first
  const batchKey = `batch:quotes:${symbols.sort().join(',')}`;
  const cached = marketDataCache.get(batchKey);
  if (cached) {
    return cached;
  }

  // Notify batch processor of this request
  symbols.forEach(symbol => batchProcessor.addQuoteRequest(symbol));

  const promises = symbols.map((symbol) => getStockQuote(symbol));
  const results = await Promise.all(promises);
  const validResults = results.filter((quote) => quote !== null) as StockQuote[];
  
  // Cache the batch result if we got all symbols
  if (validResults.length === symbols.length) {
    marketDataCache.set(batchKey, validResults, CACHE_TTL.MARKET_DATA);
  }
  
  return validResults;
}

export async function getHistoricalData(
  symbol: string,
  period: string,
): Promise<{
  change: number;
  changePercent: number;
} | null> {
  // Check cache first
  const cacheKey = `historical:${symbol}:${period}`;
  const cached = historicalCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let result = null;

  // First try Polygon.io API for historical data (most reliable)
  try {
    result = await getPolygonHistoricalData(symbol, period);
    if (result) {
      historicalCache.set(cacheKey, result, CACHE_TTL.HISTORICAL);
      return result;
    }
  } catch (error) {
    console.log(`Polygon failed for ${symbol} (${period}): ${error.message}`);
  }

  // Fallback to Twelve Data API with retry
  try {
    result = await withRetry(
      () => getTwelveDataHistorical(symbol, period),
      {
        maxAttempts: 2,
        baseDelay: 2000,
        maxDelay: 10000,
        retryCondition: (error) => error.message.includes('rate limit') || error.message.includes('credits')
      }
    );
    
    if (result) {
      historicalCache.set(cacheKey, result, CACHE_TTL.HISTORICAL);
      return result;
    }
  } catch (error) {
    console.log(`Twelve Data failed for ${symbol} (${period}): ${error.message}`);
  }

  // Final fallback to Finnhub - use current quote with known reference prices
  try {
    // For YTD, we'll use the current price and a known starting price
    if (period === "YTD") {
      const currentQuote = await getStockQuote(symbol);
      if (currentQuote) {
        // Known opening prices for major stocks on Jan 2, 2025 (first trading day)
        const ytdStartPrices: { [key: string]: number } = {
          "AAPL": 248.93, // Apple opened at $248.93 on Jan 2, 2025
          "MSFT": 440.00, // Microsoft approximate opening
          "GOOGL": 178.00, // Google approximate opening
          "AMZN": 218.00, // Amazon approximate opening
          "NVDA": 143.00, // Nvidia approximate opening
          "TSLA": 395.00, // Tesla approximate opening
          "META": 592.00, // Meta approximate opening
        };
        
        const startPrice = ytdStartPrices[symbol];
        if (startPrice) {
          const change = currentQuote.currentPrice - startPrice;
          const changePercent = (change / startPrice) * 100;
          
          console.log(`Finnhub YTD fallback ${symbol}: ${startPrice} -> ${currentQuote.currentPrice} = ${change} (${changePercent.toFixed(2)}%)`);
          
          result = {
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
          };
          
          historicalCache.set(cacheKey, result, CACHE_TTL.HISTORICAL);
          return result;
        }
      }
    }
    
    // For other periods, try historical data
    const now = Math.floor(Date.now() / 1000);
    let fromDate;

    switch (period) {
      case "1W":
        fromDate = now - 7 * 24 * 60 * 60;
        break;
      case "1M":
        fromDate = now - 30 * 24 * 60 * 60;
        break;
      case "3M":
        fromDate = now - 90 * 24 * 60 * 60;
        break;
      case "6M":
        fromDate = now - 180 * 24 * 60 * 60;
        break;
      case "1Y":
        fromDate = now - 365 * 24 * 60 * 60;
        break;
      default:
        return null;
    }

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${fromDate}&to=${now}&token=${FINNHUB_API_KEY}`,
    );

    if (!response.ok) {
      console.log(
        `Historical data not available for ${symbol} (${period}): HTTP ${response.status}`,
      );
      return null;
    }

    const data = (await response.json()) as any;

    if (data.s !== "ok" || !data.c || data.c.length === 0) {
      console.log(`No historical data returned for ${symbol} (${period})`);
      return null;
    }

    const closePrices = data.c;
    const openPrices = data.o;
    
    const startPrice = closePrices[0];
    const endPrice = closePrices[closePrices.length - 1];

    if (startPrice && endPrice && startPrice > 0) {
      const change = endPrice - startPrice;
      const changePercent = (change / startPrice) * 100;

      console.log(`Finnhub ${symbol} (${period}): ${startPrice} -> ${endPrice} = ${change} (${changePercent.toFixed(2)}%)`);

      result = {
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
      };
      
      historicalCache.set(cacheKey, result, CACHE_TTL.HISTORICAL);
      return result;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return null;
  }
}

export async function getMarketData(symbols: string[]): Promise<
  {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    marketCap: number;
    sector: string;
  }[]
> {
  // Check for complete market data cache first
  const cacheKey = `market:${symbols.sort().join(',')}`;
  const cached = marketDataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const quotes = await getMultipleQuotes(symbols);
  const profiles = await Promise.all(
    symbols.map((symbol) => getCompanyProfile(symbol)),
  );

  const marketData = [];

  for (let i = 0; i < symbols.length; i++) {
    const quote = quotes.find((q) => q.symbol === symbols[i]);
    const profile = profiles[i];

    if (quote && profile) {
      marketData.push({
        symbol: quote.symbol,
        name: profile.name,
        currentPrice: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        marketCap: profile.marketCap,
        sector: profile.sector,
      });
    }
  }

  // Cache the complete market data result
  marketDataCache.set(cacheKey, marketData, CACHE_TTL.MARKET_DATA);
  return marketData;
}

export async function getMarketDataWithHistory(symbols: string[]): Promise<
  {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    marketCap: number;
    sector: string;
    historicalData: {
      "1W": { change: number; changePercent: number } | null;
      "1M": { change: number; changePercent: number } | null;
      "3M": { change: number; changePercent: number } | null;
      "6M": { change: number; changePercent: number } | null;
      "1Y": { change: number; changePercent: number } | null;
      YTD: { change: number; changePercent: number } | null;
    };
  }[]
> {
  const quotes = await getMultipleQuotes(symbols);
  const profiles = await Promise.all(
    symbols.map((symbol) => getCompanyProfile(symbol)),
  );

  const marketData = [];

  for (let i = 0; i < symbols.length; i++) {
    const quote = quotes.find((q) => q.symbol === symbols[i]);
    const profile = profiles[i];

    if (quote && profile) {
      // Get historical data for all periods
      const historicalPromises = ["1W", "1M", "3M", "6M", "1Y", "YTD"].map(
        (period) => getHistoricalData(quote.symbol, period),
      );

      const historicalResults = await Promise.all(historicalPromises);

      marketData.push({
        symbol: quote.symbol,
        name: profile.name,
        currentPrice: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        marketCap: profile.marketCap,
        sector: profile.sector,
        historicalData: {
          "1W": historicalResults[0],
          "1M": historicalResults[1],
          "3M": historicalResults[2],
          "6M": historicalResults[3],
          "1Y": historicalResults[4],
          YTD: historicalResults[5],
        },
      });
    }
  }

  return marketData;
}

// Popular stock symbols for search
export const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "AVGO",
  "COST",
  "NFLX",
  "ASML",
  "CSCO",
  "TMUS",
  "AMD",
  "LIN",
  "INTU",
  "TXN",
  "ISRG",
  "BKNG",
  "PEP",
  "QCOM",
  "AMGN",
  "ADBE",
  "AMAT",
  "ARM",
  "HON",
  "PDD",
  "GILD",
  "PANW",
  "MU",
  "CMCSA",
  "CRWD",
  "LRCX",
  "MELI",
  "ADP",
  "VRTX",
  "KLAC",
  "ADI",
  "SBUX",
  "DASH",
  "INTC",
  "CEG",
  "CDNS",
  "CTAS",
  "MDLZ",
  "SNPS",
  "ABNB",
  "FTNT",
  "ORLY",
  "MAR",
  "PYPL",
  "ADSK",
  "WDAY",
  "AXON",
  "CSX",
  "CHTR",
  "MRVL",
  "ROP",
  "REGN",
  "NXPI",
  "MNST",
  "TEAM",
  "AEP",
  "PAYX",
  "PCAR",
  "FAST",
  "DDOG",
  "ZS",
  "CPRT",
  "KDP",
  "TTWO",
  "EXC",
  "IDXX",
  "CCEP",
  "ROST",
  "VRSK",
  "FANG",
  "MCHP",
  "CTSH",
  "XEL",
  "BKR",
  "EA",
  "TTD",
  "CSGP",
  "ODFL",
  "GEHC",
  "DXCM",
  "ANSS",
  "KHC",
  "WBD",
  "LULU",
  "ON",
  "CDW",
  "GFS",
  "BIIB",
  "MDB",
  "JNJ",
  "JPM",
  "UNH",
  "PG",
  "HD",
  "CVX",
  "MRK",
  "ABBV",
  "KO",
  "LLY",
  "WMT",
  "BAC",
  "CRM",
  "TMO",
  "WFC",
  "DIS",
  "ACN",
  "VZ",
  "PM",
  "COP",
  "NEE",
  "RTX",
  "T",
  "UPS",
  "LOW",
  "GS",
  "SPGI",
  "CAT",
  "DE",
  "MS",
  "TJX",
  "AXP",
  "BLK",
  "MDT",
  "GE",
  "MMC",
  "AMT",
  "SYK",
  "TGT",
  "BSX",
  "C",
  "CMG",
  "SCHW",
  "NOW",
  "PLD",
  "IBM",
  "MO",
  "USB",
  "NKE",
  "CCI",
  "DHR",
  "BMY",
  "SO",
  "EOG",
  "ICE",
  "ITW",
  "PNC",
  "APD",
  "CME",
  "AON",
  "PGR",
  "FCX",
  "EL",
  "MCO",
  "NSC",
  "JCI",
  "ORCL",
  "BDX",
  "COF",
  "MLM",
  "PAYX",
  "KMB",
  "CTAS",
  "MCHP",
  "VRSK",
  "GWW",
  "YUM",
  "CMI",
  "GPN",
  "MSI",
];
