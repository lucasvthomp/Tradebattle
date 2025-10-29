import { WidgetWrapper } from "./WidgetWrapper";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface PortfolioValueWidgetProps {
  portfolioValue: number;
  cashBalance: number;
  profitLoss: number;
  profitLossPercent: number;
  onRemove?: () => void;
}

export function PortfolioValueWidget({
  portfolioValue,
  cashBalance,
  profitLoss,
  profitLossPercent,
  onRemove
}: PortfolioValueWidgetProps) {
  const { formatCurrency } = useUserPreferences();
  const isPositive = profitLoss >= 0;

  return (
    <WidgetWrapper
      title="Portfolio Value"
      icon={<DollarSign className="w-4 h-4" />}
      onRemove={onRemove}
    >
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex-shrink-0">
          <div className="text-2xl lg:text-3xl font-bold text-foreground truncate">
            {formatCurrency(portfolioValue)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Portfolio Value
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'} truncate`}>
            {isPositive ? '+' : ''}{formatCurrency(profitLoss)}
          </div>
          <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
            ({isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%)
          </div>
        </div>

        <div className="pt-3 border-t border-border flex-shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Cash Balance</span>
            <span className="text-xs font-medium truncate ml-2">{formatCurrency(cashBalance)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">Invested</span>
            <span className="text-xs font-medium truncate ml-2">{formatCurrency(portfolioValue - cashBalance)}</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
