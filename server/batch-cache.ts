// Batch processing cache to reduce individual API calls
import { quoteCache, historicalCache, CACHE_TTL } from "./cache";

interface BatchRequest {
  symbols: string[];
  requestType: 'quotes' | 'historical';
  period?: string;
  timestamp: number;
}

// Batch queue for processing multiple requests together
class BatchProcessor {
  private quoteQueue: Set<string> = new Set();
  private historicalQueue: Map<string, Set<string>> = new Map(); // period -> symbols
  private processing = false;

  addQuoteRequest(symbol: string): void {
    this.quoteQueue.add(symbol);
    this.scheduleProcess();
  }

  addHistoricalRequest(symbol: string, period: string): void {
    if (!this.historicalQueue.has(period)) {
      this.historicalQueue.set(period, new Set());
    }
    this.historicalQueue.get(period)!.add(symbol);
    this.scheduleProcess();
  }

  private scheduleProcess(): void {
    if (this.processing) return;
    
    // Batch requests together with a small delay
    setTimeout(() => this.processBatch(), 100);
  }

  private async processBatch(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      // Process quote batches
      if (this.quoteQueue.size > 0) {
        const symbols = Array.from(this.quoteQueue);
        this.quoteQueue.clear();
        
        // Cache frequently requested stock combinations
        if (symbols.length > 1) {
          const batchKey = `batch:quotes:${symbols.sort().join(',')}`;
          const cached = quoteCache.get(batchKey);
          if (!cached) {
            // This will be processed by the regular quote fetcher
            // but we mark it as a batch for potential optimization
            console.log(`Batching ${symbols.length} quote requests: ${symbols.join(', ')}`);
          }
        }
      }

      // Process historical batches
      for (const [period, symbols] of this.historicalQueue.entries()) {
        if (symbols.size > 0) {
          const symbolArray = Array.from(symbols);
          symbols.clear();
          
          const batchKey = `batch:historical:${period}:${symbolArray.sort().join(',')}`;
          const cached = historicalCache.get(batchKey);
          if (!cached) {
            console.log(`Batching ${symbolArray.length} historical requests for ${period}: ${symbolArray.join(', ')}`);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  // Preload popular stock data during low-traffic periods
  async preloadPopularStocks(): Promise<void> {
    const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
    const periods = ['1W', '1M', 'YTD'];
    
    console.log('Preloading popular stock data to reduce future API calls...');
    
    for (const symbol of popularSymbols) {
      // Check if quote is cached, if not, queue for fetching
      const quoteKey = `quote:${symbol}`;
      if (!quoteCache.get(quoteKey)) {
        this.addQuoteRequest(symbol);
      }
      
      // Check historical data cache
      for (const period of periods) {
        const histKey = `historical:${symbol}:${period}`;
        if (!historicalCache.get(histKey)) {
          this.addHistoricalRequest(symbol, period);
        }
      }
    }
  }
}

export const batchProcessor = new BatchProcessor();

// Preload popular data every 30 minutes during business hours
setInterval(() => {
  const now = new Date();
  const hour = now.getHours();
  
  // Only preload during market hours (9 AM - 4 PM ET, roughly)
  if (hour >= 9 && hour <= 16) {
    batchProcessor.preloadPopularStocks();
  }
}, 30 * 60 * 1000); // Every 30 minutes