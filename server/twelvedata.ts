const TWELVE_DATA_API_KEY = "52043db1593844d3a178d1c9e720dc23";
const BASE_URL = "https://api.twelvedata.com";

export interface HistoricalData {
  change: number;
  changePercent: number;
}

export async function getTwelveDataHistorical(symbol: string, period: string): Promise<HistoricalData | null> {
  try {
    let interval = "1day";
    let outputsize = 5;
    
    switch (period) {
      case '1W':
        outputsize = 7;
        break;
      case '1M':
        outputsize = 30;
        break;
      case '3M':
        outputsize = 90;
        break;
      case '6M':
        outputsize = 180;
        break;
      case '1Y':
        outputsize = 365;
        break;
      case 'YTD':
        // Calculate days since Jan 1
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const now = new Date();
        outputsize = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
        break;
      default:
        return null;
    }

    const url = `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Twelve Data API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === "error" || !data.values || data.values.length < 2) {
      console.error(`No historical data available for ${symbol} (${period})`);
      return null;
    }
    
    // Get the most recent and oldest values
    const values = data.values;
    const mostRecent = parseFloat(values[0].close);
    const oldest = parseFloat(values[values.length - 1].close);
    
    if (isNaN(mostRecent) || isNaN(oldest) || oldest === 0) {
      return null;
    }
    
    const change = mostRecent - oldest;
    const changePercent = (change / oldest) * 100;
    
    return {
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
  } catch (error) {
    console.error(`Error fetching historical data from Twelve Data for ${symbol}:`, error);
    return null;
  }
}

export async function getTwelveDataQuote(symbol: string): Promise<{
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    const url = `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === "error") {
      return null;
    }
    
    return {
      symbol: data.symbol,
      currentPrice: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change)
    };
    
  } catch (error) {
    console.error(`Error fetching quote from Twelve Data for ${symbol}:`, error);
    return null;
  }
}