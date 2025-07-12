import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
}

export default function StockTicker() {
  const [tickerData, setTickerData] = useState<StockData[]>([]);

  const { data: popularStocks, isLoading } = useQuery<{ success: boolean; data: StockData[] }>({
    queryKey: ['/api/popular'],
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (popularStocks?.success && popularStocks.data) {
      // Sort by highest absolute percent change to show most active stocks
      const sortedStocks = [...popularStocks.data]
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, 10); // Show top 10 most active stocks
      setTickerData(sortedStocks);
    }
  }, [popularStocks]);

  if (isLoading || !tickerData.length) {
    return (
      <div className="bg-card border-b border-muted py-3 overflow-hidden">
        <div className="flex items-center space-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2 animate-pulse">
              <div className="w-10 h-4 bg-muted rounded"></div>
              <div className="w-16 h-4 bg-muted rounded"></div>
              <div className="w-12 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const StockItem = ({ stock }: { stock: StockData }) => (
    <div className="flex items-center space-x-2 whitespace-nowrap px-4">
      <span className="font-semibold text-foreground text-sm">{stock.symbol}</span>
      <span className="text-foreground text-sm">${stock.price.toFixed(2)}</span>
      <div className="flex items-center space-x-1">
        {stock.percentChange >= 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span
          className={`text-xs font-medium ${
            stock.percentChange >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-card border-b border-muted py-3 overflow-hidden">
      <motion.div
        className="flex items-center"
        animate={{
          x: [0, -100 * tickerData.length - 32 * tickerData.length], // Account for padding
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* First set */}
        {tickerData.map((stock) => (
          <StockItem key={`first-${stock.symbol}`} stock={stock} />
        ))}
        {/* Second set for seamless loop */}
        {tickerData.map((stock) => (
          <StockItem key={`second-${stock.symbol}`} stock={stock} />
        ))}
      </motion.div>
    </div>
  );
}