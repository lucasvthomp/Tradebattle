import { TrendingUp, TrendingDown } from "lucide-react";

interface StockHeaderProps {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  percentChange: number;
}

export function StockHeader({ symbol, companyName, price, change, percentChange }: StockHeaderProps) {
  const isPositive = change >= 0;

  return (
    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
      <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#67E7BF" }}>
        {symbol}
      </h1>
      <span className="text-sm md:text-base" style={{ color: "#94A3B8" }}>
        {companyName}
      </span>
      <span className="text-2xl md:text-3xl font-bold" style={{ color: "#FFFFFF" }}>
        ${price.toFixed(2)}
      </span>
      <span
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        style={{
          color: isPositive ? "#10B981" : "#EF4444",
          backgroundColor: isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
        }}
      >
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{percentChange.toFixed(2)}%)
      </span>
    </div>
  );
}
