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
      <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#E3B341" }}>
        {symbol}
      </h1>
      <span className="text-sm md:text-base" style={{ color: "#8A93A6" }}>
        {companyName}
      </span>
      <span className="text-2xl md:text-3xl font-bold" style={{ color: "#FFFFFF" }}>
        ${price.toFixed(2)}
      </span>
      <span
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        style={{
          color: isPositive ? "#28C76F" : "#FF4F58",
          backgroundColor: isPositive ? "rgba(40, 199, 111, 0.15)" : "rgba(255, 79, 88, 0.15)",
        }}
      >
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{percentChange.toFixed(2)}%)
      </span>
    </div>
  );
}
