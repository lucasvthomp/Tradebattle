import { Card } from "@/components/ui/card";

// Import widget components
import { PortfolioSummary } from "./widgets/PortfolioSummary";
import { WatchlistWidget } from "./widgets/WatchlistWidget";
import { PerformanceChart } from "./widgets/PerformanceChart";

export function PortfolioGrid() {
  return (
    <div className="w-full space-y-6">
      {/* Portfolio Performance Chart - Full Width */}
      <Card className="w-full min-h-[500px]">
        <PerformanceChart />
      </Card>

      {/* Portfolio Summary and Watchlist - Stretched Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="min-h-[400px]">
            <PortfolioSummary />
          </Card>
        </div>
        <div>
          <Card className="min-h-[400px]">
            <WatchlistWidget />
          </Card>
        </div>
      </div>
    </div>
  );
}