import { Card } from "@/components/ui/card";

// Import widget components
import { PerformanceChart } from "./widgets/PerformanceChart";
import { PortfolioHoldingsWidget } from "./widgets/PortfolioHoldingsWidget";

export function PortfolioGrid() {
  return (
    <div className="w-full space-y-6">
      {/* Portfolio Performance Chart with Summary in Header - Full Width */}
      <Card className="w-full min-h-[500px]">
        <PerformanceChart />
      </Card>

      {/* Current Holdings */}
      <Card className="w-full min-h-[400px]">
        <PortfolioHoldingsWidget />
      </Card>
    </div>
  );
}