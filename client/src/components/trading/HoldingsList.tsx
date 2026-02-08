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
    refetchInterval: 30000,
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
          {holdings.length}
        </span>
      </div>

      {/* Portfolio Summary */}
      {holdings.length > 0 && (
        <div
          className="rounded-lg p-3 mb-3 grid grid-cols-2 gap-3"
          style={{ backgroundColor: "#0A1A2F" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "#8A93A6" }}>
              Portfolio Value
            </div>
            <div className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
              {formatCurrency(totals.totalValue)}
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
              {totals.totalPL >= 0 ? "+" : ""}{formatCurrency(totals.totalPL)}{" "}
              <span className="text-[10px] font-normal">
                ({totals.totalPL >= 0 ? "+" : ""}{totals.totalPLPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
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
            Buy stocks using the order panel
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-0">
            {holdings.map((holding) => {
              const isSelected = holding.symbol === selectedSymbol;
              const isPositive = (holding.profitLoss || 0) >= 0;

              return (
                <button
                  key={holding.symbol}
                  onClick={() => onSelectStock(holding.symbol)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors hover:bg-[#142538] rounded-lg"
                  style={{
                    backgroundColor: isSelected ? "#142538" : "transparent",
                    borderLeft: isSelected ? "2px solid #E3B341" : "2px solid transparent",
                  }}
                >
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: isSelected ? "#E3B341" : "#FFFFFF" }}
                    >
                      {holding.symbol}
                    </div>
                    <div className="text-[10px]" style={{ color: "#8A93A6" }}>
                      {holding.shares} shares @ {formatCurrency(holding.averagePurchasePrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                      {formatCurrency(holding.currentValue || 0)}
                    </div>
                    <div
                      className="text-[10px] font-semibold"
                      style={{ color: isPositive ? "#28C76F" : "#FF4F58" }}
                    >
                      {isPositive ? "+" : ""}{formatCurrency(holding.profitLoss || 0)}{" "}
                      ({isPositive ? "+" : ""}{(holding.profitLossPercent || 0).toFixed(2)}%)
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
