import { AdvancedTradingChart } from "@/components/portfolio/widgets/AdvancedTradingChart";
import React, { useEffect, useRef } from "react";

interface ChartWidgetProps {
  selectedStock: string;
  tournamentId?: number;
  onRemove?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export function ChartWidget({
  selectedStock,
  tournamentId,
  onRemove,
  onExpand,
  isExpanded
}: ChartWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = React.useState(0);

  // Force chart re-render when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setKey(prev => prev + 1);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-y-auto">
      <div ref={containerRef} className="h-full w-full">
        <AdvancedTradingChart
          key={key}
          selectedStock={selectedStock}
          tournamentId={tournamentId}
        />
      </div>
    </div>
  );
}
