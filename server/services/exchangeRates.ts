import yahooFinance from 'yahoo-finance2';
import memoize from 'memoizee';

// Cache exchange rates for 15 minutes to avoid excessive API calls
const getCachedExchangeRate = memoize(
  async (fromCurrency: string, toCurrency: string): Promise<number> => {
    if (fromCurrency === toCurrency) return 1;
    
    try {
      // Yahoo Finance format for exchange rates: USDEUR=X, USDBRL=X, etc.
      const symbol = `${fromCurrency}${toCurrency}=X`;
      
      const quote = await yahooFinance.quote(symbol);
      const rate = quote.regularMarketPrice;
      
      if (!rate || typeof rate !== 'number') {
        throw new Error(`Invalid exchange rate for ${symbol}`);
      }
      
      return rate;
    } catch (error) {
      console.error(`Error fetching exchange rate ${fromCurrency}/${toCurrency}:`, error);
      // Fallback to 1 if we can't get the rate
      return 1;
    }
  },
  { maxAge: 15 * 60 * 1000 } // 15 minutes cache
);

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  return getCachedExchangeRate(fromCurrency, toCurrency);
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

// Common currency pairs and their Yahoo Finance symbols
export const supportedCurrencies = [
  'USD', 'BRL', 'ARS', 'MXN', 'CAD', 'COP', 'CLP', 'PEN', 'UYU', 'EUR'
];

// Get all exchange rates for a base currency
export async function getAllExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
  const rates: Record<string, number> = {};
  
  for (const currency of supportedCurrencies) {
    if (currency !== baseCurrency) {
      rates[currency] = await getExchangeRate(baseCurrency, currency);
    } else {
      rates[currency] = 1;
    }
  }
  
  return rates;
}