// TypeScript interfaces for Yahoo Finance data structures

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  currency: string;
  sector?: string;
  industry?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  volume: number;
  currency: string;
  exchange: string;
  website?: string;
  employees?: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  sector?: string;
  industry?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

export interface KeyStats {
  trailingPE: number | null;
  epsTrailingTwelveMonths: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  dividendYield: number | null;
  beta: number | null;
  regularMarketVolume: number | null;
  averageVolume: number | null;
  regularMarketDayHigh: number | null;
  regularMarketDayLow: number | null;
  regularMarketOpen: number | null;
  marketCap: number | null;
}