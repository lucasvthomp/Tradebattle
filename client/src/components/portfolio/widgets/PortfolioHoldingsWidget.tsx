import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { SellStockDialog } from "@/components/trading/SellStockDialog";

interface PortfolioHoldingsWidgetProps {
  onSelectStock?: (symbol: string) => void;
}

export function PortfolioHoldingsWidget({ onSelectStock }: PortfolioHoldingsWidgetProps = {}) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = (portfolioData as any)?.data;
  const holdings = portfolio?.holdings || [];

  const handleSell = (stock: any) => {
    setSelectedStock(stock);
    setSellDialogOpen(true);
  };

  if (!Array.isArray(holdings) || !holdings.length) {
    return (
      <>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Current Holdings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No holdings yet</p>
            <p className="text-xs mt-1">Start trading to see your positions here</p>
          </div>
        </CardContent>
        
        <SellStockDialog
          open={sellDialogOpen}
          onOpenChange={setSellDialogOpen}
          stock={selectedStock}
        />
      </>
    );
  }

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Current Holdings</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {holdings.length} positions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
            <div>Symbol</div>
            <div>Shares</div>
            <div>Purchase Price</div>
            <div>Current Price</div>
            <div>Change</div>
            <div>Value</div>
            <div>Actions</div>
          </div>
          
          {holdings.map((holding: any) => {
            const totalCost = holding.shares * holding.averagePrice;
            const currentValue = holding.shares * holding.currentPrice;
            const gainLoss = currentValue - totalCost;
            const gainLossPercent = (gainLoss / totalCost) * 100;
            const priceChange = holding.currentPrice - holding.averagePrice;
            const priceChangePercent = (priceChange / holding.averagePrice) * 100;
            const isPositive = gainLoss >= 0;

            return (
              <div
                key={holding.symbol}
                className="grid grid-cols-7 gap-2 px-3 py-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors items-center"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-foreground">
                    {holding.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {holding.companyName || holding.symbol}
                  </span>
                </div>
                
                <div className="text-sm">
                  {holding.shares}
                </div>
                
                <div className="text-sm">
                  {formatCurrency(holding.averagePrice)}
                </div>
                
                <div className="text-sm font-medium">
                  {formatCurrency(holding.currentPrice)}
                </div>
                
                <div className={`text-sm flex items-center gap-1 ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <div className="flex flex-col">
                    <span>{isPositive ? '+' : ''}{formatCurrency(priceChange)}</span>
                    <span className="text-xs">({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                  </div>
                </div>
                
                <div className="text-sm font-medium">
                  {formatCurrency(currentValue)}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectStock?.(holding.symbol)}
                    className="text-xs px-2 py-1 h-7"
                    title="View chart"
                  >
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSell(holding)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    Sell
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <SellStockDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        stock={selectedStock}
      />
    </>
  );
}