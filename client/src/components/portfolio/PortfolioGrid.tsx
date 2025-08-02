import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import widget components
import { PerformanceChart } from "./widgets/PerformanceChart";
import { PortfolioHoldingsWidget } from "./widgets/PortfolioHoldingsWidget";
import { StockSearchBar } from "../trading/StockSearchBar";
import { ShoppingCart } from "lucide-react";

interface PortfolioGridProps {
  selectedChartStock?: string | null;
  onSelectStock?: (symbol: string) => void;
}

export function PortfolioGrid({ selectedChartStock, onSelectStock }: PortfolioGridProps = {}) {
  return (
    <div className="w-full space-y-6">
      {/* Portfolio Performance Chart with Summary in Header - Full Width */}
      <Card className="w-full min-h-[500px]">
        <PerformanceChart selectedStock={selectedChartStock} />
      </Card>

      {/* Stock Purchase Search */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Buy Stocks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StockSearchBar type="purchase" placeholder="Search stocks to buy..." />
        </CardContent>
      </Card>

      {/* Current Holdings */}
      <Card className="w-full min-h-[400px]">
        <PortfolioHoldingsWidget onSelectStock={onSelectStock} />
      </Card>
    </div>
  );
}