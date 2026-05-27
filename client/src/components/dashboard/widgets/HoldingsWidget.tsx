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
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#0C1A2E' }}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: '#0E2040', backgroundColor: '#091525' }}>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" style={{ color: '#E3B341' }} />
          <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Holdings</span>
        </div>
        {onToggleView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleView}
            className="h-6 text-xs"
            style={{ color: '#94A3B8' }}
          >
            {showHoldings ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Trade
              </>
            ) : (
              <>
                <LayoutList className="w-3 h-3 mr-1" />
                Holdings
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>Loading...</span>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="w-10 h-10 mx-auto mb-3 opacity-50" style={{ color: '#94A3B8' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#F1F5F9' }}>No Holdings</h3>
            <p className="text-[10px]" style={{ color: '#94A3B8' }}>
              Start trading to build your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {holdings.map((holding: any, index: number) => {
              const currentValue = (holding.shares || 0) * (holding.currentPrice || 0);
              const purchasePrice = holding.averagePurchasePrice || holding.purchasePrice || 0;
              const totalCost = holding.totalCost || ((holding.shares || 0) * purchasePrice);
              const gainLoss = currentValue - totalCost;
              const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;
              const isPositive = gainLoss >= 0;

              return (
                <div
                  key={index}
                  className="p-2 rounded transition-colors"
                  style={{ backgroundColor: '#091525', border: '1px solid #0E2040' }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-baseline gap-2">
                      <div className="font-semibold text-sm" style={{ color: '#E3B341' }}>{holding.symbol}</div>
                      <div className="text-[10px]" style={{ color: '#94A3B8' }}>{holding.shares.toLocaleString('en-US')} sh</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-xs" style={{ color: '#F1F5F9' }}>
                        {formatCurrency(holding.currentPrice || 0)}
                      </div>
                      <div className="text-[10px] font-medium" style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                        {isPositive ? '+' : ''}{gainLossPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => onChartClick(holding.symbol)}
                      className="text-[10px] px-1.5 py-0.5 h-6 flex-1"
                      style={{ backgroundColor: '#0C1A2E', borderColor: '#0E2040', color: '#F1F5F9', border: '1px solid #0E2040' }}
                    >
                      <BarChart3 className="h-3 w-3 mr-0.5" />
                      Chart
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSellClick(holding)}
                      className="text-[10px] px-1.5 py-0.5 h-6 flex-1"
                      style={{ backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none' }}
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
