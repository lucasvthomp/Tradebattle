import { companyDataCache } from './cache';
import { 
  getYahooStockQuote, 
  getYahooCompanyProfile, 
  getYahooHistoricalData,
  getYahooMarketDataWithHistory,
  POPULAR_STOCKS 
} from './yahoo-finance';

interface CompanyData {
  symbol: string;
  name: string;
  currentPrice: number;
  peRatio: number | null;
  marketCap: number;
  sector: string;
  industry: string;
  changes: {
    "1D": { change: number; changePercent: number } | null;
    "1W": { change: number; changePercent: number } | null;
    "1M": { change: number; changePercent: number } | null;
    "3M": { change: number; changePercent: number } | null;
    "6M": { change: number; changePercent: number } | null;
    "1Y": { change: number; changePercent: number } | null;
    "YTD": { change: number; changePercent: number } | null;
  };
  lastUpdated: number;
}

class YahooCompanyDataManager {
  private batchSize = 10; // Yahoo Finance handles batching internally
  private updateInterval = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Auto-update popular stocks every 15 minutes
    setInterval(() => {
      console.log('Auto-updating popular stocks data...');
      this.updatePopularStocks();
    }, this.updateInterval);

    // Initial load
    setTimeout(() => {
      console.log('Performing initial load of popular stocks...');
      this.updatePopularStocks();
    }, 5000);
  }

  async updateCompanyData(symbol: string): Promise<CompanyData | null> {
    try {
      console.log(`Updating company data for ${symbol}...`);
      
      const [quote, profile] = await Promise.all([
        getYahooStockQuote(symbol),
        getYahooCompanyProfile(symbol)
      ]);

      if (!quote || !profile) {
        console.log(`Failed to get quote or profile for ${symbol}`);
        return null;
      }

      // Fetch historical data for all periods
      const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'];
      const historicalPromises = periods.map(period => 
        getYahooHistoricalData(symbol, period)
      );

      const historicalResults = await Promise.allSettled(historicalPromises);
      
      const changes: CompanyData['changes'] = {
        "1D": null,
        "1W": null,
        "1M": null,
        "3M": null,
        "6M": null,
        "1Y": null,
        "YTD": null
      };

      historicalResults.forEach((result, index) => {
        const period = periods[index] as keyof CompanyData['changes'];
        if (result.status === 'fulfilled' && result.value) {
          changes[period] = {
            change: result.value.change,
            changePercent: result.value.changePercent
          };
        }
      });

      const companyData: CompanyData = {
        symbol: symbol,
        name: profile.name,
        currentPrice: quote.currentPrice,
        peRatio: profile.peRatio,
        marketCap: quote.marketCap || profile.marketCap,
        sector: profile.sector,
        industry: profile.industry,
        changes,
        lastUpdated: Date.now()
      };

      // Cache with 15-minute TTL
      companyDataCache.set(symbol, companyData, 15 * 60 * 1000);
      
      console.log(`Successfully cached comprehensive data for ${symbol}`);
      return companyData;
    } catch (error) {
      console.error(`Error updating company data for ${symbol}:`, error);
      return null;
    }
  }

  async getCompanyData(symbol: string): Promise<CompanyData | null> {
    // Try cache first
    const cached = companyDataCache.get(symbol);
    if (cached) {
      return cached;
    }

    // If not cached, fetch and cache
    return await this.updateCompanyData(symbol);
  }

  async getMultipleCompaniesData(symbols: string[]): Promise<CompanyData[]> {
    const results: CompanyData[] = [];
    
    // Check cache first
    const uncachedSymbols: string[] = [];
    for (const symbol of symbols) {
      const cached = companyDataCache.get(symbol);
      if (cached) {
        results.push(cached);
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    // Fetch uncached symbols in batches
    if (uncachedSymbols.length > 0) {
      console.log(`Fetching ${uncachedSymbols.length} uncached symbols...`);
      
      for (let i = 0; i < uncachedSymbols.length; i += this.batchSize) {
        const batch = uncachedSymbols.slice(i, i + this.batchSize);
        const batchPromises = batch.map(symbol => this.updateCompanyData(symbol));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          }
        });
        
        // Small delay between batches to be respectful
        if (i + this.batchSize < uncachedSymbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    return results.sort((a, b) => symbols.indexOf(a.symbol) - symbols.indexOf(b.symbol));
  }

  async updatePopularStocks(): Promise<void> {
    try {
      console.log('Updating popular stocks data...');
      
      // Use Yahoo Finance batch functionality
      const stocksWithHistory = await getYahooMarketDataWithHistory(POPULAR_STOCKS.slice(0, 50));
      
      // Cache each stock
      stocksWithHistory.forEach(stock => {
        if (stock && stock.symbol) {
          const companyData: CompanyData = {
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: stock.currentPrice,
            peRatio: stock.peRatio,
            marketCap: stock.marketCap,
            sector: stock.sector,
            industry: stock.industry,
            changes: stock.changes || {
              "1D": null,
              "1W": null,
              "1M": null,
              "3M": null,
              "6M": null,
              "1Y": null,
              "YTD": null
            },
            lastUpdated: stock.lastUpdated || Date.now()
          };
          
          companyDataCache.set(stock.symbol, companyData, 15 * 60 * 1000);
        }
      });
      
      console.log(`Background update completed for ${stocksWithHistory.length} popular stocks`);
    } catch (error) {
      console.error('Error updating popular stocks:', error);
    }
  }

  getCachedSymbols(): string[] {
    return companyDataCache.getAllKeys();
  }

  getCacheStats(): { totalCompanies: number; lastUpdate: number } {
    const cachedSymbols = this.getCachedSymbols();
    let lastUpdate = 0;
    
    cachedSymbols.forEach(symbol => {
      const data = companyDataCache.get(symbol);
      if (data && data.lastUpdated > lastUpdate) {
        lastUpdate = data.lastUpdated;
      }
    });

    return {
      totalCompanies: cachedSymbols.length,
      lastUpdate
    };
  }
}

export const yahooCompanyDataManager = new YahooCompanyDataManager();
export type { CompanyData };