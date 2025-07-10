import fetch from 'node-fetch';
import { APIError, RateLimitError, validateTwelveDataResponse } from "./errors";

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || "52043db1593844d3a178d1c9e720dc23";
const BASE_URL = "https://api.twelvedata.com";

// Rate limiting for Twelve Data API (8 calls per minute)
let twelveDataLastRequest = 0;
const TWELVE_DATA_MIN_INTERVAL = 7500; // 7.5 seconds between requests

async function rateLimitedTwelveDataFetch(url: string) {
  const now = Date.now();
  if (now - twelveDataLastRequest < TWELVE_DATA_MIN_INTERVAL) {
    const waitTime = TWELVE_DATA_MIN_INTERVAL - (now - twelveDataLastRequest);
    console.log(`Twelve Data API rate limit: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  twelveDataLastRequest = Date.now();
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      console.log(`Twelve Data API rate limited, waiting 10 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      throw new Error(`Rate limited: ${response.status}`);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

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
    
    const response = await rateLimitedTwelveDataFetch(url);
    
    const data = await response.json();
    
    if (!validateTwelveDataResponse(data) || data.values.length < 2) {
      const errorMsg = data.message || data.status || 'Unknown error';
      throw new APIError(`No historical data available for ${symbol} (${period}): ${errorMsg}`, 'TwelveData');
    }
    
    // Get the most recent and oldest values
    const values = data.values;
    const mostRecent = parseFloat(values[0].close);
    
    // For YTD, use opening price of first trading day, otherwise use closing price
    let oldest;
    if (period === 'YTD') {
      // Find the first trading day of 2025 (Jan 2, 2025)
      const firstDay2025 = values.find(v => v.datetime.startsWith('2025-01-02'));
      if (firstDay2025) {
        oldest = parseFloat(firstDay2025.open);
        console.log(`Found 2025 first trading day: ${firstDay2025.datetime} open=${firstDay2025.open}`);
      } else {
        // Fallback to oldest available
        oldest = parseFloat(values[values.length - 1].open);
        console.log(`Using fallback oldest: ${values[values.length - 1].datetime} open=${values[values.length - 1].open}`);
      }
    } else {
      oldest = parseFloat(values[values.length - 1].close);
    }
    
    if (isNaN(mostRecent) || isNaN(oldest) || oldest === 0) {
      return null;
    }
    
    const change = mostRecent - oldest;
    const changePercent = (change / oldest) * 100;
    
    console.log(`Twelve Data ${symbol} (${period}): ${oldest} -> ${mostRecent} = ${change} (${changePercent.toFixed(2)}%)`);
    
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
    
    const response = await rateLimitedTwelveDataFetch(url);
    
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