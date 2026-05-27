import { useState, useEffect, useRef } from "react";
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
  const { formatCurrency, t } = useUserPreferences();
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

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

  // Handle scroll shadows for mobile
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = scrollContainerRef.current;
    if (container) {
      handleScroll(); // Check initial state
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [holdings]);

  if (!Array.isArray(holdings) || !holdings.length) {
    return (
      <>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>{t('holdings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{t('noData')}</p>
            <p className="text-xs mt-1">{t('startTradingMessage')}</p>
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
            <span>{t('holdings')}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {holdings.length} positions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Scroll shadows for mobile */}
          <div
            className={`absolute inset-y-0 left-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-[#0C1829] to-transparent md:hidden transition-opacity duration-200 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            className={`absolute inset-y-0 right-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-[#0C1829] to-transparent md:hidden transition-opacity duration-200 ${showRightShadow ? 'opacity-100' : 'opacity-0'}`}
          />

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto md:overflow-x-visible -mx-3 md:mx-0"
          >
            <div className="min-w-max md:min-w-0 px-3 space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-2 px-3 py-2 text-sm md:text-xs font-medium text-muted-foreground border-b" style={{ minWidth: '600px' }}>
                <div>Symbol</div>
                <div className="hidden md:block">Shares</div>
                <div className="hidden md:block">Purchase Price</div>
                <div>Current Price</div>
                <div className="hidden md:block">Change</div>
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
                    className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-2 px-3 py-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors items-center"
                                      >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">
                        {holding.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {holding.companyName || holding.symbol}
                      </span>
                    </div>

                    <div className="hidden md:block text-sm">
                      {holding.shares}
                    </div>

                    <div className="hidden md:block text-sm">
                      {formatCurrency(holding.averagePrice)}
                    </div>

                    <div className="text-sm font-medium">
                      {formatCurrency(holding.currentPrice)}
                    </div>

                    <div className={`hidden md:flex text-sm items-center gap-1 ${
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
                        aria-label={`View chart for ${holding.symbol}`}
                        title="View chart"
                      >
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSell(holding)}
                        className="text-xs px-2 py-1 h-7"
                        aria-label={`Sell ${holding.symbol}`}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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