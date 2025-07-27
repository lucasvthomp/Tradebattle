import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { SellStockDialog } from "@/components/trading/SellStockDialog";

export function PortfolioHoldingsWidget() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  const { data: purchasesData } = useQuery({
    queryKey: ["/api/personal-purchases"],
    enabled: !!user
  });

  const purchases = purchasesData?.data || [];

  if (!Array.isArray(purchases) || !purchases.length) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No holdings yet</p>
          <p className="text-xs mt-1">Start trading to see your positions here</p>
        </div>
      </div>
    );
  }

  const handleSell = (stock: any) => {
    setSelectedStock(stock);
    setSellDialogOpen(true);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Holdings</h3>
        <Badge variant="secondary" className="text-xs">
          {purchases.length} positions
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {purchases.map((purchase: any) => {
          const totalCost = purchase.shares * purchase.purchasePrice;
          const currentValue = purchase.shares * purchase.currentPrice;
          const gainLoss = currentValue - totalCost;
          const gainLossPercent = (gainLoss / totalCost) * 100;
          const isPositive = gainLoss >= 0;

          return (
            <div
              key={purchase.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">
                    {purchase.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {purchase.shares} shares
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg cost: {formatCurrency(purchase.purchasePrice)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {formatCurrency(currentValue)}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositive ? '+' : ''}{formatCurrency(gainLoss)} ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSell(purchase)}
                  className="text-xs px-2 py-1 h-7"
                >
                  Sell
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <SellStockDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        stock={selectedStock}
      />
    </div>
  );
}