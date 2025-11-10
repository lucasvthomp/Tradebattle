import { Coins, BarChart3, RefreshCw, LayoutList, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface HoldingsWidgetProps {
  holdings: any[];
  isLoading: boolean;
  onChartClick: (symbol: string) => void;
  onSellClick: (holding: any) => void;
  onRemove?: () => void;
  showHoldings?: boolean;
  onToggleView?: () => void;
}

export function HoldingsWidget({
  holdings,
  isLoading,
  onChartClick,
  onSellClick,
  onRemove,
  showHoldings = false,
  onToggleView
}: HoldingsWidgetProps) {
  const { formatCurrency } = useUserPreferences();

  return (
    <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-l border-border/50 overflow-hidden">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/30 flex-shrink-0">
        <div className="flex items-center space-x-2 text-foreground">
          <Coins className="w-4 h-4" />
          <span className="text-sm font-semibold">Your Holdings</span>
        </div>
        {onToggleView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleView}
            className="h-7 text-xs"
          >
            {showHoldings ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1.5" />
                Trade
              </>
            ) : (
              <>
                <LayoutList className="w-3 h-3 mr-1.5" />
                Holdings
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No Holdings</h3>
            <p className="text-xs text-muted-foreground">
              Start trading to build your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map((holding: any, index: number) => {
              const currentValue = (holding.shares || 0) * (holding.currentPrice || 0);
              const purchasePrice = holding.averagePurchasePrice || holding.purchasePrice || 0;
              const totalCost = holding.totalCost || ((holding.shares || 0) * purchasePrice);
              const gainLoss = currentValue - totalCost;
              const isPositive = gainLoss >= 0;

              return (
                <div
                  key={index}
                  className="p-3 border border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-sm">{holding.symbol}</div>
                      <div className="text-xs text-muted-foreground">{holding.shares} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(holding.currentPrice || 0)}
                      </div>
                      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onChartClick(holding.symbol)}
                      className="text-xs px-2 py-1 h-6 flex-1"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Chart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSellClick(holding)}
                      className="text-xs px-2 py-1 h-6 flex-1"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
