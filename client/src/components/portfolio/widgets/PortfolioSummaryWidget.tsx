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

  const portfolio = (portfolioData as any)?.data;
  const balance = Number(portfolio?.balance) || 0;
  const holdings = portfolio?.holdings || [];
  
  // Calculate total stock value from holdings
  const stockValue = holdings.reduce((total: number, holding: any) => {
    return total + (holding.shares * holding.currentPrice);
  }, 0);
  
  // Total portfolio value = cash balance + stock value
  const totalValue = balance + stockValue;
  
  // Calculate P&L based on initial $10,000 deposit
  const initialDeposit = 10000;
  const totalGainLoss = totalValue - initialDeposit;
  const totalGainLossPercent = (totalGainLoss / initialDeposit) * 100;

  const isPositive = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border">
      {/* Total Portfolio Value */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center space-x-1 mb-1">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formatCurrency(totalValue)}</span>
      </div>

      {/* Cash Balance */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center space-x-1 mb-1">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cash</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formatCurrency(balance)}</span>
      </div>

      {/* Profit/Loss */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center space-x-1 mb-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">P/L</span>
        </div>
        <div className="flex flex-col items-center">
          <span className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
          </span>
          <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            ({isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Holdings Count */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center space-x-1 mb-1">
          <Building className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Holdings</span>
        </div>
        <span className="text-lg font-bold text-foreground">
          {Array.isArray(portfolio?.holdings) ? portfolio.holdings.length : 0}
        </span>
      </div>
    </div>
  );
}