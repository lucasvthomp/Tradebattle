import fetch from 'node-fetch';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || 't3m4pFpwZKGJU_DpSrmJgJG3MeqX7HWe';
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

export interface PolygonHistoricalData {
  change: number;
  changePercent: number;
}

// Get the latest trading day (excluding weekends)
function getLatestTradingDay(): Date {
  const date = new Date();
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  if (dayOfWeek === 0) { // Sunday
    date.setDate(date.getDate() - 2); // Go back to Friday
  } else if (dayOfWeek === 6) { // Saturday
    date.setDate(date.getDate() - 1); // Go back to Friday
  }
  
  return date;
}

// Calculate the date range for different periods
function getDateRange(period: string): { from: string; to: string } {
  const today = getLatestTradingDay(); // Use latest trading day
  const toDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let fromDate: Date;
  
  switch (period) {
    case '1W':
      fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      fromDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6M':
      fromDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      fromDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'YTD':
      fromDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      break;
    default:
      fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate
  };
}

// Rate limiting for Polygon API
let polygonLastRequest = 0;
const POLYGON_MIN_INTERVAL = 2000; // 2 seconds between requests for free tier

export async function getPolygonHistoricalData(symbol: string, period: string): Promise<PolygonHistoricalData | null> {
  try {
    // Rate limiting
    const now = Date.now();
    if (now - polygonLastRequest < POLYGON_MIN_INTERVAL) {
      console.log(`Polygon API rate limit: waiting ${POLYGON_MIN_INTERVAL - (now - polygonLastRequest)}ms`);
      await new Promise(resolve => setTimeout(resolve, POLYGON_MIN_INTERVAL - (now - polygonLastRequest)));
    }
    polygonLastRequest = Date.now();
    
    const { from, to } = getDateRange(period);
    
    // Use daily aggregates for most periods
    const multiplier = 1;
    const timespan = 'day';
    
    const url = `${BASE_URL}/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log(`Polygon API rate limited for ${symbol} (${period}), skipping to next provider`);
        return null;
      }
      console.error(`Polygon API error for ${symbol} (${period}): HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'ERROR' && data.error && data.error.includes('exceeded')) {
      console.log(`Polygon API rate limited for ${symbol} (${period}), skipping to next provider`);
      return null;
    }
    
    if (data.status !== 'OK' || !data.results || data.results.length < 2) {
      throw new Error(`No historical data available for ${symbol} (${period}) from Polygon: ${data.error || 'Insufficient data points'}`);
    }
    
    // Get the first and last closing prices
    const firstClose = data.results[0].c;
    const lastClose = data.results[data.results.length - 1].c;
    
    const change = lastClose - firstClose;
    const changePercent = (change / firstClose) * 100;
    
    console.log(`Polygon data for ${symbol} (${period}): ${firstClose} -> ${lastClose} = ${change} (${changePercent.toFixed(2)}%)`);
    
    return {
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
  } catch (error) {
    console.error(`Error fetching Polygon data for ${symbol} (${period}):`, error);
    return null;
  }
}

// Get current quote data from Polygon
export async function getPolygonQuote(symbol: string): Promise<{
  currentPrice: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const url = `${BASE_URL}/${symbol}/range/1/day/${yesterdayStr}/${yesterdayStr}?adjusted=true&apikey=${POLYGON_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Polygon quote API error for ${symbol}: HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error(`No quote data available for ${symbol} from Polygon`);
      return null;
    }
    
    const result = data.results[0];
    const currentPrice = result.c; // closing price
    const previousClose = result.o; // opening price
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
  } catch (error) {
    console.error(`Error fetching Polygon quote for ${symbol}:`, error);
    return null;
  }
}