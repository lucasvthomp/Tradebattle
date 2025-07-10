import yahooFinance from 'yahoo-finance2';
import { withRetry } from './retry';

export interface YahooStockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap: number;
  volume: number;
}

export interface YahooCompanyProfile {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio?: number;
  country: string;
  currency: string;
  exchange: string;
  website: string;
  description: string;
  employees: number;
}

export interface YahooHistoricalData {
  change: number;
  changePercent: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export async function getYahooStockQuote(symbol: string): Promise<YahooStockQuote | null> {
  try {
    const quote = await withRetry(
      () => yahooFinance.quote(symbol),
      { maxAttempts: 3, baseDelay: 1000, maxDelay: 5000 }
    );

    if (!quote || !quote.regularMarketPrice) {
      return null;
    }

    return {
      symbol: quote.symbol || symbol,
      currentPrice: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      high: quote.regularMarketDayHigh || quote.regularMarketPrice,
      low: quote.regularMarketDayLow || quote.regularMarketPrice,
      open: quote.regularMarketOpen || quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      marketCap: quote.marketCap || 0,
      volume: quote.regularMarketVolume || 0,
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance quote for ${symbol}:`, error);
    return null;
  }
}

export async function getYahooCompanyProfile(symbol: string): Promise<YahooCompanyProfile | null> {
  try {
    const [quote, profile] = await Promise.all([
      withRetry(
        () => yahooFinance.quote(symbol),
        { maxAttempts: 3, baseDelay: 1000, maxDelay: 5000 }
      ),
      withRetry(
        () => yahooFinance.quoteSummary(symbol, { 
          modules: ['summaryProfile', 'defaultKeyStatistics', 'financialData', 'summaryDetail'] 
        }),
        { maxAttempts: 3, baseDelay: 1000, maxDelay: 5000 }
      )
    ]);

    if (!quote || !profile) {
      return null;
    }

    const summaryProfile = profile.summaryProfile;
    const keyStats = profile.defaultKeyStatistics;
    const financialData = profile.financialData;
    const summaryDetail = profile.summaryDetail;

    return {
      symbol: quote.symbol || symbol,
      name: quote.displayName || quote.shortName || symbol,
      sector: summaryProfile?.sector || 'Unknown',
      industry: summaryProfile?.industry || 'Unknown',
      marketCap: quote.marketCap || 0,
      peRatio: summaryDetail?.trailingPE || keyStats?.trailingPE || keyStats?.forwardPE || null,
      country: summaryProfile?.country || 'US',
      currency: quote.currency || 'USD',
      exchange: quote.fullExchangeName || 'Unknown',
      website: summaryProfile?.website || '',
      description: summaryProfile?.longBusinessSummary || '',
      employees: summaryProfile?.fullTimeEmployees || 0,
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance profile for ${symbol}:`, error);
    return null;
  }
}

export async function getYahooHistoricalData(
  symbol: string, 
  period: string
): Promise<YahooHistoricalData | null> {
  try {
    const now = new Date();
    let startDate: Date;

    // Calculate proper date ranges for each period
    switch (period) {
      case '1D':
        startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      default:
        console.error(`Invalid period: ${period}`);
        return null;
    }

    const historical = await withRetry(
      () => yahooFinance.chart(symbol, {
        period1: startDate,
        period2: now,
        interval: '1d'
      }),
      { maxAttempts: 3, baseDelay: 1000, maxDelay: 5000 }
    );

    if (!historical || !historical.quotes || historical.quotes.length === 0) {
      console.log(`No historical data found for ${symbol} (${period})`);
      return null;
    }

    const quotes = historical.quotes;
    
    // Get first and last data points with valid data
    const validQuotes = quotes.filter(q => q && q.open && q.close);
    if (validQuotes.length === 0) {
      console.log(`No valid quotes found for ${symbol} (${period})`);
      return null;
    }

    const firstData = validQuotes[0];
    const lastData = validQuotes[validQuotes.length - 1];

    const change = lastData.close - firstData.open;
    const changePercent = (change / firstData.open) * 100;

    return {
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      open: firstData.open,
      close: lastData.close,
      high: Math.max(...quotes.filter(q => q.high).map(q => q.high)),
      low: Math.min(...quotes.filter(q => q.low).map(q => q.low)),
      volume: quotes.reduce((sum, q) => sum + (q.volume || 0), 0)
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance historical data for ${symbol} (${period}):`, error);
    return null;
  }
}

export async function getYahooMultipleQuotes(symbols: string[]): Promise<YahooStockQuote[]> {
  const quotes = await Promise.allSettled(
    symbols.map(symbol => getYahooStockQuote(symbol))
  );

  return quotes
    .filter((result): result is PromiseFulfilledResult<YahooStockQuote> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

export async function getYahooMarketData(symbols: string[]): Promise<any[]> {
  const quotes = await getYahooMultipleQuotes(symbols);
  const profiles = await Promise.allSettled(
    symbols.map(symbol => getYahooCompanyProfile(symbol))
  );

  const profileMap = new Map<string, YahooCompanyProfile>();
  profiles.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      profileMap.set(symbols[index], result.value);
    }
  });

  return quotes.map(quote => {
    const profile = profileMap.get(quote.symbol);
    return {
      symbol: quote.symbol,
      name: profile?.name || quote.symbol,
      currentPrice: quote.currentPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      previousClose: quote.previousClose,
      marketCap: quote.marketCap,
      volume: quote.volume,
      sector: profile?.sector || 'Unknown',
      industry: profile?.industry || 'Unknown',
      peRatio: profile?.peRatio || null,
    };
  });
}

export async function getYahooMarketDataWithHistory(symbols: string[]): Promise<any[]> {
  const marketData = await getYahooMarketData(symbols);
  
  const periodsToFetch = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'];
  
  const enrichedData = await Promise.all(
    marketData.map(async (stock) => {
      const changes: { [key: string]: { change: number; changePercent: number } | null } = {};
      
      const historicalResults = await Promise.allSettled(
        periodsToFetch.map(period => getYahooHistoricalData(stock.symbol, period))
      );
      
      historicalResults.forEach((result, index) => {
        const period = periodsToFetch[index];
        if (result.status === 'fulfilled' && result.value) {
          changes[period] = {
            change: result.value.change,
            changePercent: result.value.changePercent
          };
        } else {
          changes[period] = null;
        }
      });
      
      return {
        ...stock,
        changes,
        lastUpdated: Date.now()
      };
    })
  );
  
  return enrichedData;
}

export const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK-B', 'UNH', 'JNJ',
  'V', 'PG', 'JPM', 'HD', 'CVX', 'MA', 'PFE', 'ABBV', 'BAC', 'KO',
  'AVGO', 'PEP', 'TMO', 'COST', 'WMT', 'DIS', 'ABT', 'CRM', 'ACN', 'MRK',
  'NFLX', 'ADBE', 'VZ', 'CMCSA', 'CSCO', 'NKE', 'QCOM', 'TXN', 'DHR', 'NEE',
  'PM', 'UPS', 'ORCL', 'HON', 'T', 'LIN', 'MS', 'IBM', 'INTC', 'COP',
  'RTX', 'AMGN', 'INTU', 'AMD', 'CAT', 'LOW', 'SPGI', 'ELV', 'GS', 'ISRG',
  'AXP', 'BKNG', 'BLK', 'NOW', 'SYK', 'PLD', 'MDLZ', 'GILD', 'TJX', 'C',
  'SCHW', 'MU', 'DE', 'CB', 'TMUS', 'REGN', 'MO', 'BSX', 'AON', 'ICE',
  'PYPL', 'SO', 'ITW', 'USB', 'DUK', 'ZTS', 'BMY', 'EQIX', 'APD', 'ADI',
  'SHW', 'CL', 'CME', 'EOG', 'ATVI', 'NSC', 'EL', 'WM', 'GD', 'MMM'
];