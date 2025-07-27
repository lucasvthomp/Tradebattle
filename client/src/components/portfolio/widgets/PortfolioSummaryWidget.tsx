import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export function PortfolioSummaryWidget() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = portfolioData?.data;
  const balance = Number(portfolio?.balance) || 0;
  const totalValue = portfolio?.totalValue || 0;
  const totalGainLoss = totalValue - 10000; // Initial deposit of $10,000
  const totalGainLossPercent = totalGainLoss / 10000 * 100;

  const isPositive = totalGainLoss >= 0;

  return (
    <div className="p-4 h-full">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Portfolio Value */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Value</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(totalValue)}
          </div>
        </div>

        {/* Gain/Loss */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">Today's P&L</span>
          </div>
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
            <span className="text-sm ml-1">
              ({isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Buying Power */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Buying Power</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(balance)}
          </div>
        </div>

        {/* Holdings Count */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Holdings</span>
          <div className="text-lg font-semibold text-foreground">
            {Array.isArray(portfolio?.holdings) ? portfolio.holdings.length : 0}
          </div>
        </div>
      </div>
    </div>
  );
}