import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Target, Building } from "lucide-react";
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
    <div className="flex items-center space-x-6">
      {/* Portfolio Value */}
      <div className="flex items-center space-x-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="text-xs text-muted-foreground">Total: </span>
          <span className="text-sm font-semibold">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Gain/Loss */}
      <div className="flex items-center space-x-2">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <div>
          <span className="text-xs text-muted-foreground">P&L: </span>
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)} ({isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Buying Power */}
      <div className="flex items-center space-x-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="text-xs text-muted-foreground">Cash: </span>
          <span className="text-sm font-semibold">{formatCurrency(balance)}</span>
        </div>
      </div>

      {/* Holdings Count */}
      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="text-xs text-muted-foreground">Holdings: </span>
          <span className="text-sm font-semibold">
            {Array.isArray(portfolio?.holdings) ? portfolio.holdings.length : 0}
          </span>
        </div>
      </div>
    </div>
  );
}