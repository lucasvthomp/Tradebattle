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

  const totals = useMemo(() => {
    if (holdings.length === 0) return { totalValue: 0, totalCost: 0, totalPL: 0, totalPLPercent: 0 };
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.totalCost || 0), 0);
    const totalPL = totalValue - totalCost;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalPL, totalPLPercent };
  }, [holdings]);

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

      {/* Portfolio Summary */}
      {holdings.length > 0 && (
        <div
          className="rounded-lg p-3 mb-3"
          style={{ backgroundColor: "#0A1A2F" }}
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "#8A93A6" }}>
                Total Value
              </div>
              <div className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
                {formatCurrency(totals.totalValue)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "#8A93A6" }}>
                Total Cost
              </div>
              <div className="text-sm font-bold" style={{ color: "#C9D1E2" }}>
                {formatCurrency(totals.totalCost)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "#8A93A6" }}>
                Total P&L
              </div>
              <div
                className="text-sm font-bold"
                style={{ color: totals.totalPL >= 0 ? "#28C76F" : "#FF4F58" }}
              >
                {totals.totalPL >= 0 ? "+" : ""}{formatCurrency(totals.totalPL)}
              </div>
              <div
                className="text-[10px]"
                style={{ color: totals.totalPL >= 0 ? "#28C76F" : "#FF4F58" }}
              >
                {totals.totalPL >= 0 ? "+" : ""}{totals.totalPLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: "#0A1A2F" }}>
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
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
          <div className="space-y-2">
            {holdings.map((holding) => {
              const isSelected = holding.symbol === selectedSymbol;
              const isPositive = (holding.profitLoss || 0) >= 0;
              const pricePerShareDelta = (holding.currentPrice || 0) - (holding.averagePurchasePrice || 0);
              const pricePerShareDeltaPercent = holding.averagePurchasePrice > 0
                ? (pricePerShareDelta / holding.averagePurchasePrice) * 100
                : 0;

              return (
                <button
                  key={holding.symbol}
                  onClick={() => onSelectStock(holding.symbol)}
                  className="w-full text-left transition-colors rounded-lg"
                  style={{
                    backgroundColor: isSelected ? "#142538" : "#0A1A2F",
                    border: isSelected ? "1px solid #E3B341" : "1px solid transparent",
                  }}
                >
                  {/* Top row: Symbol + Market Value */}
                  <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: isSelected ? "#E3B341" : "#FFFFFF" }}
                      >
                        {holding.symbol}
                      </span>
                      <span className="text-[10px]" style={{ color: "#5A6375" }}>
                        {holding.companyName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
                        {formatCurrency(holding.currentValue || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Detail grid */}
                  <div className="px-3 pb-2.5 grid grid-cols-3 gap-x-3 gap-y-1.5 mt-1">
                    {/* Shares */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Shares
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "#C9D1E2" }}>
                        {holding.shares}
                      </div>
                    </div>

                    {/* Avg Purchase Price */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Avg Cost
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "#C9D1E2" }}>
                        {formatCurrency(holding.averagePurchasePrice || 0)}
                      </div>
                    </div>

                    {/* Current Price */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Current
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>
                        {formatCurrency(holding.currentPrice || 0)}
                      </div>
                    </div>

                    {/* Total Cost */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Cost Basis
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "#8A93A6" }}>
                        {formatCurrency(holding.totalCost || 0)}
                      </div>
                    </div>

                    {/* Price Change Per Share (delta since purchase) */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Per Share +/-
                      </div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: pricePerShareDelta >= 0 ? "#28C76F" : "#FF4F58" }}
                      >
                        {pricePerShareDelta >= 0 ? "+" : ""}{formatCurrency(pricePerShareDelta)}
                      </div>
                    </div>

                    {/* Total P&L */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wide" style={{ color: "#5A6375" }}>
                        Total P&L
                      </div>
                      <div
                        className="text-xs font-bold"
                        style={{ color: isPositive ? "#28C76F" : "#FF4F58" }}
                      >
                        {isPositive ? "+" : ""}{formatCurrency(holding.profitLoss || 0)}{" "}
                        <span className="font-normal text-[10px]">
                          ({isPositive ? "+" : ""}{(holding.profitLossPercent || 0).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
