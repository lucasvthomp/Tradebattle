import fetch from 'node-fetch';

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