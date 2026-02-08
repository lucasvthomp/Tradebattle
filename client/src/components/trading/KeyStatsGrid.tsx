import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface KeyStatsGridProps {
  symbol: string;
}

function formatNumber(val: number | null): string {
  if (val === null || val === undefined) return "--";
  if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(2) + "T";
  if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + "B";
  if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + "M";
  if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + "K";
  return val.toLocaleString();
}

function formatPrice(val: number | null): string {
  if (val === null || val === undefined) return "--";
  return "$" + val.toFixed(2);
}

function formatPercent(val: number | null): string {
  if (val === null || val === undefined) return "--";
  return (val * 100).toFixed(2) + "%";
}

function formatDecimal(val: number | null, decimals: number = 2): string {
  if (val === null || val === undefined) return "--";
  return val.toFixed(decimals);
}

export function KeyStatsGrid({ symbol }: KeyStatsGridProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/key-stats", symbol],
    refetchInterval: 60000,
  });

  const stats = (data as any)?.data;

  const items = [
    { label: "Market Cap", value: stats ? formatNumber(stats.marketCap) : null },
    { label: "P/E Ratio", value: stats ? formatDecimal(stats.trailingPE) : null },
    { label: "EPS", value: stats ? formatPrice(stats.epsTrailingTwelveMonths) : null },
    { label: "52-Week High", value: stats ? formatPrice(stats.fiftyTwoWeekHigh) : null },
    { label: "52-Week Low", value: stats ? formatPrice(stats.fiftyTwoWeekLow) : null },
    { label: "Dividend Yield", value: stats ? formatPercent(stats.dividendYield) : null },
    { label: "Volume", value: stats ? formatNumber(stats.regularMarketDayHigh !== null ? (data as any)?.data?.averageVolume : null) : null },
    { label: "Avg Volume", value: stats ? formatNumber(stats.averageVolume) : null },
    { label: "Beta", value: stats ? formatDecimal(stats.beta) : null },
    { label: "Open", value: stats ? formatPrice(stats.regularMarketOpen) : null },
    { label: "Day High", value: stats ? formatPrice(stats.regularMarketDayHigh) : null },
    { label: "Day Low", value: stats ? formatPrice(stats.regularMarketDayLow) : null },
  ];

  return (
    <div className="px-4 py-4">
      <h3 className="text-base font-bold mb-3" style={{ color: "#C9D1E2" }}>
        Key Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-xs" style={{ color: "#8A93A6" }}>
              {item.label}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-20 mt-0.5" />
            ) : (
              <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                {item.value ?? "--"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
