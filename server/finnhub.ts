import fetch from 'node-fetch';
import { getTwelveDataHistorical } from './twelvedata';
import { getPolygonHistoricalData } from './polygon';

const FINNHUB_API_KEY = 'd1nr9epr01qtrautf0sgd1nr9epr01qtrautf0t0';
const BASE_URL = 'https://finnhub.io/api/v1';

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

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (!data.c || data.c === 0) {
      return null;
    }
    
    return {
      symbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (!data.name) {
      return null;
    }
    
    return {
      symbol,
      name: data.name,
      sector: data.finnhubIndustry || 'Unknown',
      industry: data.finnhubIndustry || 'Unknown',
      marketCap: data.marketCapitalization || 0,
      country: data.country || 'US',
      currency: data.currency || 'USD',
      exchange: data.exchange || 'Unknown',
      weburl: data.weburl || '',
      logo: data.logo || ''
    };
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter(quote => quote !== null) as StockQuote[];
}

export async function getHistoricalData(symbol: string, period: string): Promise<{
  change: number;
  changePercent: number;
} | null> {
  // First try Polygon.io API for historical data (most reliable)
  const polygonData = await getPolygonHistoricalData(symbol, period);
  
  if (polygonData) {
    return polygonData;
  }
  
  // Fallback to Twelve Data API 
  const historicalData = await getTwelveDataHistorical(symbol, period);
  
  if (historicalData) {
    return historicalData;
  }
  
  // Final fallback to Finnhub if both fail
  try {
    const now = Math.floor(Date.now() / 1000);
    let fromDate;
    
    switch (period) {
      case '1W':
        fromDate = now - (7 * 24 * 60 * 60);
        break;
      case '1M':
        fromDate = now - (30 * 24 * 60 * 60);
        break;
      case '3M':
        fromDate = now - (90 * 24 * 60 * 60);
        break;
      case '6M':
        fromDate = now - (180 * 24 * 60 * 60);
        break;
      case '1Y':
        fromDate = now - (365 * 24 * 60 * 60);
        break;
      case 'YTD':
        const currentYear = new Date().getFullYear();
        fromDate = Math.floor(new Date(currentYear, 0, 1).getTime() / 1000);
        break;
      default:
        return null;
    }
    
    const response = await fetch(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${fromDate}&to=${now}&token=${FINNHUB_API_KEY}`);
    
    if (!response.ok) {
      console.log(`Historical data not available for ${symbol} (${period}): HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      console.log(`No historical data returned for ${symbol} (${period})`);
      return null;
    }
    
    const closePrices = data.c;
    const startPrice = closePrices[0];
    const endPrice = closePrices[closePrices.length - 1];
    
    if (startPrice && endPrice && startPrice > 0) {
      const change = endPrice - startPrice;
      const changePercent = (change / startPrice) * 100;
      
      return {
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return null;
  }
}

export async function getMarketData(symbols: string[]): Promise<{
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sector: string;
}[]> {
  const quotes = await getMultipleQuotes(symbols);
  const profiles = await Promise.all(symbols.map(symbol => getCompanyProfile(symbol)));
  
  const marketData = [];
  
  for (let i = 0; i < symbols.length; i++) {
    const quote = quotes.find(q => q.symbol === symbols[i]);
    const profile = profiles[i];
    
    if (quote && profile) {
      marketData.push({
        symbol: quote.symbol,
        name: profile.name,
        currentPrice: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        marketCap: profile.marketCap,
        sector: profile.sector
      });
    }
  }
  
  return marketData;
}

export async function getMarketDataWithHistory(symbols: string[]): Promise<{
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sector: string;
  historicalData: {
    '1W': { change: number; changePercent: number } | null;
    '1M': { change: number; changePercent: number } | null;
    '3M': { change: number; changePercent: number } | null;
    '6M': { change: number; changePercent: number } | null;
    '1Y': { change: number; changePercent: number } | null;
    'YTD': { change: number; changePercent: number } | null;
  };
}[]> {
  const quotes = await getMultipleQuotes(symbols);
  const profiles = await Promise.all(symbols.map(symbol => getCompanyProfile(symbol)));
  
  const marketData = [];
  
  for (let i = 0; i < symbols.length; i++) {
    const quote = quotes.find(q => q.symbol === symbols[i]);
    const profile = profiles[i];
    
    if (quote && profile) {
      // Get historical data for all periods
      const historicalPromises = ['1W', '1M', '3M', '6M', '1Y', 'YTD'].map(period => 
        getHistoricalData(quote.symbol, period)
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
          '1W': historicalResults[0],
          '1M': historicalResults[1],
          '3M': historicalResults[2],
          '6M': historicalResults[3],
          '1Y': historicalResults[4],
          'YTD': historicalResults[5]
        }
      });
    }
  }
  
  return marketData;
}

// Popular stock symbols for search
export const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'COST', 'NFLX',
  'ASML', 'CSCO', 'TMUS', 'AMD', 'LIN', 'INTU', 'TXN', 'ISRG', 'BKNG', 'PEP',
  'QCOM', 'AMGN', 'ADBE', 'AMAT', 'ARM', 'HON', 'PDD', 'GILD', 'PANW', 'MU',
  'CMCSA', 'CRWD', 'LRCX', 'MELI', 'ADP', 'VRTX', 'KLAC', 'ADI', 'SBUX', 'DASH',
  'INTC', 'CEG', 'CDNS', 'CTAS', 'MDLZ', 'SNPS', 'ABNB', 'FTNT', 'ORLY', 'MAR',
  'PYPL', 'ADSK', 'WDAY', 'AXON', 'CSX', 'CHTR', 'MRVL', 'ROP', 'REGN', 'NXPI',
  'MNST', 'TEAM', 'AEP', 'PAYX', 'PCAR', 'FAST', 'DDOG', 'ZS', 'CPRT', 'KDP',
  'TTWO', 'EXC', 'IDXX', 'CCEP', 'ROST', 'VRSK', 'FANG', 'MCHP', 'CTSH', 'XEL',
  'BKR', 'EA', 'TTD', 'CSGP', 'ODFL', 'GEHC', 'DXCM', 'ANSS', 'KHC', 'WBD',
  'LULU', 'ON', 'CDW', 'GFS', 'BIIB', 'MDB', 'JNJ', 'JPM', 'UNH', 'PG', 'HD',
  'CVX', 'MRK', 'ABBV', 'KO', 'LLY', 'WMT', 'BAC', 'CRM', 'TMO', 'WFC', 'DIS',
  'ACN', 'VZ', 'PM', 'COP', 'NEE', 'RTX', 'T', 'UPS', 'LOW', 'GS', 'SPGI',
  'CAT', 'DE', 'MS', 'TJX', 'AXP', 'BLK', 'MDT', 'GE', 'MMC', 'AMT', 'SYK',
  'TGT', 'BSX', 'C', 'CMG', 'SCHW', 'NOW', 'PLD', 'IBM', 'MO', 'USB', 'NKE',
  'CCI', 'DHR', 'BMY', 'SO', 'EOG', 'ICE', 'ITW', 'PNC', 'APD', 'CME', 'AON',
  'PGR', 'FCX', 'EL', 'MCO', 'NSC', 'JCI', 'ORCL', 'BDX', 'COF', 'MLM', 'PAYX',
  'KMB', 'CTAS', 'MCHP', 'VRSK', 'GWW', 'YUM', 'CMI', 'GPN', 'MSI'
];