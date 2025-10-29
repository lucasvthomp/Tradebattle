import { WidgetWrapper } from "./WidgetWrapper";
import { BarChart3 } from "lucide-react";
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
    <WidgetWrapper
      title="Trading Chart"
      icon={<BarChart3 className="w-4 h-4" />}
      onRemove={onRemove}
      onExpand={onExpand}
      isExpanded={isExpanded}
      className="chart-widget"
    >
      <div ref={containerRef} className="h-full w-full">
        <AdvancedTradingChart
          key={key}
          selectedStock={selectedStock}
          tournamentId={tournamentId}
        />
      </div>
    </WidgetWrapper>
  );
}
