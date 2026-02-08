import { useQuery } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface PositionCardProps {
  symbol: string;
  tournamentId: number | undefined;
  currentPrice: number;
}

export function PositionCard({ symbol, tournamentId, currentPrice }: PositionCardProps) {
  const { formatCurrency } = useUserPreferences();

  const { data } = useQuery({
    queryKey: ["/api/portfolio/tournament", tournamentId],
    enabled: !!tournamentId,
  });

  const holdings = (data as any)?.data || (data as any)?.holdings || [];
  const position = Array.isArray(holdings)
    ? holdings.find((h: any) => h.symbol === symbol)
    : null;

  if (!position || !position.shares || position.shares === 0) return null;

  const shares = position.shares;
  const avgCost = position.averagePurchasePrice || position.avgCost || 0;
  const marketValue = shares * currentPrice;
  const totalReturn = marketValue - shares * avgCost;
  const totalReturnPercent = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className="px-4 py-4" style={{ borderBottom: "1px solid #2B3A4C" }}>
      <h3 className="text-base font-bold mb-3" style={{ color: "#C9D1E2" }}>
        Your Position
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs" style={{ color: "#8A93A6" }}>Shares</div>
          <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{shares}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#8A93A6" }}>Avg Cost</div>
          <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{formatCurrency(avgCost)}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#8A93A6" }}>Market Value</div>
          <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{formatCurrency(marketValue)}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#8A93A6" }}>Total Return</div>
          <div className="text-sm font-semibold" style={{ color: isPositive ? "#28C76F" : "#FF4F58" }}>
            {isPositive ? "+" : ""}{formatCurrency(totalReturn)} ({isPositive ? "+" : ""}{totalReturnPercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
