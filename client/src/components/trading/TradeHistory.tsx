import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface TradeHistoryProps {
  tournamentId: number | undefined;
}

export function TradeHistory({ tournamentId }: TradeHistoryProps) {
  const { formatCurrency } = useUserPreferences();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/tournaments", tournamentId, "trades"],
    enabled: !!tournamentId,
    refetchInterval: 15000,
  });

  const trades = (data as any)?.data || [];

  if (!tournamentId) return null;

  return (
    <div style={{ borderTop: "1px solid #1F2937" }}>
      <div className="px-3 py-2">
        <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
          Trade History
        </span>
      </div>

      {isLoading ? (
        <div className="px-3 pb-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="px-3 pb-3 text-center">
          <p className="text-xs" style={{ color: "#64748B" }}>
            No trades yet
          </p>
        </div>
      ) : (
        <ScrollArea style={{ maxHeight: "300px" }}>
          <div className="px-3 pb-2 space-y-1">
            {trades.map((trade: any) => {
              const isBuy = trade.tradeType === "buy";
              const totalValue = parseFloat(trade.totalValue);
              const price = parseFloat(trade.price);
              const timeAgo = formatDistanceToNow(new Date(trade.tradeDate), { addSuffix: true });

              return (
                <div
                  key={trade.id}
                  className="py-1.5 px-2 rounded"
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: "#06B6D4" }}>
                        {trade.symbol}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: isBuy ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: isBuy ? "#10B981" : "#EF4444",
                        }}
                      >
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "#F1F5F9" }}>
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px]" style={{ color: "#64748B" }}>
                      {trade.shares} shares @ {formatCurrency(price)}
                    </span>
                    <span className="text-[10px]" style={{ color: "#64748B" }}>
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
