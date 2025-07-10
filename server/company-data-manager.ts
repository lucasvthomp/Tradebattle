import { companyDataCache, CACHE_TTL, CompanyData } from "./cache";
import { getStockQuote, getCompanyProfile, getHistoricalData, POPULAR_STOCKS } from "./finnhub";

class CompanyDataManager {
  // Store and update comprehensive company data in cache
  async updateCompanyData(symbol: string): Promise<CompanyData | null> {
    try {
      console.log(`Updating comprehensive data for ${symbol}`);
      
      // Get quote, profile, and historical data in parallel
      const [quote, profile] = await Promise.all([
        getStockQuote(symbol),
        getCompanyProfile(symbol)
      ]);

      if (!quote || !profile) {
        console.error(`Missing data for ${symbol}: quote=${!!quote}, profile=${!!profile}`);
        return null;
      }

      // Get historical data for all periods
      const periods = ["1D", "1W", "1M", "3M", "6M", "1Y", "YTD"];
      const historicalPromises = periods.map(period => 
        getHistoricalData(symbol, period).catch(err => {
          console.warn(`Historical data for ${symbol} (${period}) failed:`, err.message);
          return null;
        })
      );

      const historicalResults = await Promise.all(historicalPromises);

      // Build changes object
      const changes: CompanyData["changes"] = {
        "1D": { change: quote.change, changePercent: quote.changePercent },
        "1W": historicalResults[1],
        "1M": historicalResults[2],
        "3M": historicalResults[3],
        "6M": historicalResults[4],
        "1Y": historicalResults[5],
        "YTD": historicalResults[6]
      };

      const companyData: CompanyData = {
        symbol: quote.symbol,
        name: profile.name,
        currentPrice: quote.currentPrice,
        volume: this.formatVolume(quote.volume || 0),
        marketCap: profile.marketCap,
        sector: profile.sector,
        industry: profile.industry,
        changes,
        lastUpdated: Date.now()
      };

      // Cache the comprehensive data
      companyDataCache.set(symbol, companyData, CACHE_TTL.COMPANY_DATA);
      
      console.log(`Successfully cached comprehensive data for ${symbol}`);
      return companyData;
      
    } catch (error) {
      console.error(`Error updating company data for ${symbol}:`, error);
      return null;
    }
  }

  // Get company data from cache or fetch if not available
  async getCompanyData(symbol: string): Promise<CompanyData | null> {
    // Check if we have cached data
    const cached = companyDataCache.get(symbol);
    if (cached) {
      return cached;
    }

    // If not cached, fetch and cache new data
    return await this.updateCompanyData(symbol);
  }

  // Get multiple companies data
  async getMultipleCompaniesData(symbols: string[]): Promise<CompanyData[]> {
    const promises = symbols.map(symbol => this.getCompanyData(symbol));
    const results = await Promise.all(promises);
    return results.filter((data): data is CompanyData => data !== null);
  }

  // Update all popular stocks in background
  async updatePopularStocks(): Promise<void> {
    console.log("Background update: Refreshing popular stocks data");
    
    // Update popular stocks in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < POPULAR_STOCKS.length; i += batchSize) {
      const batch = POPULAR_STOCKS.slice(i, i + batchSize);
      
      const promises = batch.map(symbol => 
        this.updateCompanyData(symbol).catch(err => {
          console.warn(`Failed to update ${symbol}:`, err.message);
          return null;
        })
      );
      
      await Promise.all(promises);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < POPULAR_STOCKS.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log("Background update completed for popular stocks");
  }

  // Get all cached company symbols
  getCachedSymbols(): string[] {
    return companyDataCache.getAllKeys();
  }

  // Get cache statistics
  getCacheStats(): { totalCompanies: number; lastUpdate: number } {
    const keys = this.getCachedSymbols();
    let lastUpdate = 0;
    
    keys.forEach(key => {
      const data = companyDataCache.get(key);
      if (data && data.lastUpdated > lastUpdate) {
        lastUpdate = data.lastUpdated;
      }
    });

    return {
      totalCompanies: keys.length,
      lastUpdate
    };
  }

  // Format volume for display
  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    }
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    }
    if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  }
}

export const companyDataManager = new CompanyDataManager();

// Background update scheduler - update popular stocks every 15 minutes
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

setInterval(() => {
  companyDataManager.updatePopularStocks().catch(err => {
    console.error("Background update failed:", err);
  });
}, UPDATE_INTERVAL);

// Initial update after 30 seconds to let the server start up
setTimeout(() => {
  companyDataManager.updatePopularStocks().catch(err => {
    console.error("Initial background update failed:", err);
  });
}, 30000);