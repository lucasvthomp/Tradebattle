import { Card } from "@/components/ui/card";

// Import widget components
import { PortfolioSummary } from "./widgets/PortfolioSummary";
import { PerformanceChart } from "./widgets/PerformanceChart";
import { PortfolioHoldingsWidget } from "./widgets/PortfolioHoldingsWidget";

export function PortfolioGrid() {
  return (
    <div className="w-full space-y-6">
      {/* Portfolio Performance Chart - Full Width */}
      <Card className="w-full min-h-[500px]">
        <PerformanceChart />
      </Card>

      {/* Portfolio Summary - Full Width */}
      <Card className="w-full min-h-[300px]">
        <PortfolioSummary />
      </Card>

      {/* Current Holdings */}
      <Card className="w-full min-h-[400px]">
        <PortfolioHoldingsWidget />
      </Card>
    </div>
  );
}