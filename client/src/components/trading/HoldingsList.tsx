import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface HoldingsListProps {
  tournamentId: number | undefined;
  selectedSymbol: string;
  onSelectStock: (symbol: string) => void;
}

interface Holding {
  symbol: string;
  companyName: string;
  shares: number;
  averagePurchasePrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function HoldingsList({ tournamentId, selectedSymbol, onSelectStock }: HoldingsListProps) {
  const { formatCurrency } = useUserPreferences();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/portfolio/tournament", tournamentId],
    enabled: !!tournamentId,
    refetchInterval: 15000,
  });

  const holdings: Holding[] = useMemo(() => {
    const raw = (data as any)?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((h: any) => h.shares > 0);
  }, [data]);

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold" style={{ color: "#C9D1E2" }}>
          Your Holdings
        </h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ backgroundColor: "rgba(227, 179, 65, 0.15)", color: "#E3B341" }}
        >
          {holdings.length} {holdings.length === 1 ? "position" : "positions"}
        </span>
      </div>

      {/* Column Headers */}
      {holdings.length > 0 && (
        <div
          className="flex items-center gap-2 px-2 pb-2 text-[9px] uppercase tracking-wide"
          style={{ color: "#5A6375", borderBottom: "1px solid #2B3A4C" }}
        >
          <span className="w-[52px] shrink-0">Symbol</span>
          <span className="w-[32px] shrink-0 text-right">Qty</span>
          <span className="flex-1 text-right">Avg Cost</span>
          <span className="flex-1 text-right">Current</span>
          <span className="flex-1 text-right">+/-</span>
          <span className="flex-1 text-right">P&L</span>
          <span className="flex-1 text-right">Value</span>
        </div>
      )}

      {/* Holdings List */}
      {isLoading ? (
        <div className="space-y-1 mt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-2">
              <Skeleton className="h-4 w-[52px]" />
              <Skeleton className="h-4 w-[32px]" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : holdings.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm" style={{ color: "#8A93A6" }}>
            No holdings yet
          </p>
          <p className="text-xs mt-1" style={{ color: "#5A6375" }}>
            Search for a stock and buy shares to get started
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div>
            {holdings.map((holding) => {
              const isSelected = holding.symbol === selectedSymbol;
              const isPositive = (holding.profitLoss || 0) >= 0;
              const perShareDelta = (holding.currentPrice || 0) - (holding.averagePurchasePrice || 0);

              return (
                <button
                  key={holding.symbol}
                  onClick={() => onSelectStock(holding.symbol)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-[#142538] rounded"
                  style={{
                    backgroundColor: isSelected ? "#142538" : "transparent",
                    borderLeft: isSelected ? "2px solid #E3B341" : "2px solid transparent",
                  }}
                >
                  {/* Symbol */}
                  <span
                    className="w-[52px] shrink-0 text-xs font-bold truncate"
                    style={{ color: isSelected ? "#E3B341" : "#FFFFFF" }}
                  >
                    {holding.symbol}
                  </span>

                  {/* Quantity */}
                  <span
                    className="w-[32px] shrink-0 text-xs text-right"
                    style={{ color: "#C9D1E2" }}
                  >
                    {holding.shares}
                  </span>

                  {/* Avg Cost */}
                  <span
                    className="flex-1 text-xs text-right"
                    style={{ color: "#8A93A6" }}
                  >
                    {formatCurrency(holding.averagePurchasePrice || 0)}
                  </span>

                  {/* Current Price */}
                  <span
                    className="flex-1 text-xs font-medium text-right"
                    style={{ color: "#FFFFFF" }}
                  >
                    {formatCurrency(holding.currentPrice || 0)}
                  </span>

                  {/* Per-share delta */}
                  <span
                    className="flex-1 text-xs font-medium text-right"
                    style={{ color: perShareDelta >= 0 ? "#28C76F" : "#FF4F58" }}
                  >
                    {perShareDelta >= 0 ? "+" : ""}{formatCurrency(perShareDelta)}
                  </span>

                  {/* Total P&L */}
                  <span
                    className="flex-1 text-xs font-semibold text-right"
                    style={{ color: isPositive ? "#28C76F" : "#FF4F58" }}
                  >
                    {isPositive ? "+" : ""}{formatCurrency(holding.profitLoss || 0)}
                  </span>

                  {/* Market Value */}
                  <span
                    className="flex-1 text-xs font-bold text-right"
                    style={{ color: "#FFFFFF" }}
                  >
                    {formatCurrency(holding.currentValue || 0)}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
