import { useEffect, useRef, useState, memo, useCallback } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface TradingViewChartProps {
  symbol: string;
}

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y"] as const;
type TF = (typeof TIMEFRAMES)[number];

interface PriceInfo {
  price: number;
  change: number;
  changePct: number;
}

function TradingViewChartInner({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [timeframe, setTimeframe] = useState<TF>("1M");
  const [loading, setLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAndUpdate = useCallback(async (sym: string, tf: TF) => {
    if (!seriesRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/historical/${encodeURIComponent(sym)}?timeframe=${tf}`);
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      const raw: any[] = json.data || [];

      const chartData = raw
        .map((item) => ({
          time: item.date as any,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        }))
        .filter((d) => !isNaN(d.open) && !isNaN(d.close))
        .sort((a, b) => {
          const ta = typeof a.time === "number" ? a.time : new Date(a.time).getTime() / 1000;
          const tb = typeof b.time === "number" ? b.time : new Date(b.time).getTime() / 1000;
          return ta - tb;
        });

      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();

      if (chartData.length >= 2) {
        const first = chartData[0];
        const last = chartData[chartData.length - 1];
        const change = last.close - first.open;
        const changePct = (change / first.open) * 100;
        setPriceInfo({ price: last.close, change, changePct });
      }
    } catch (e: any) {
      setError("Could not load chart data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Build chart when symbol changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !symbol) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    setPriceInfo(null);
    setError(null);

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8A93A6",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        textColor: "#8A93A6",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#28C76F",
      downColor: "#FF4F58",
      borderUpColor: "#28C76F",
      borderDownColor: "#FF4F58",
      wickUpColor: "#28C76F",
      wickDownColor: "#FF4F58",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // ResizeObserver for responsive sizing
    const ro = new ResizeObserver(() => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    });
    ro.observe(container);
    resizeObserverRef.current = ro;

    fetchAndUpdate(symbol, timeframe);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Refetch when timeframe changes (no chart rebuild)
  useEffect(() => {
    if (symbol && seriesRef.current) {
      fetchAndUpdate(symbol, timeframe);
    }
  }, [timeframe, fetchAndUpdate, symbol]);

  if (!symbol) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          backgroundColor: "rgba(0,163,255,0.06)",
          border: "1px solid rgba(0,163,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Search style={{ width: "22px", height: "22px", color: "#00A3FF", opacity: 0.6 }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#C9D1E2", fontSize: "14px", fontWeight: 600 }}>Search a ticker to begin</div>
          <div style={{ color: "#4B5563", fontSize: "12px", marginTop: "4px" }}>e.g. AAPL, TSLA, BTC-USD</div>
        </div>
      </div>
    );
  }

  const isPositive = priceInfo ? priceInfo.change >= 0 : true;
  const priceColor = isPositive ? "#28C76F" : "#FF4F58";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 6px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        {/* Ticker + price */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#F1F5F9", fontSize: "15px", fontWeight: 800, letterSpacing: "-0.01em" }}>
            {symbol}
          </span>
          {priceInfo && (
            <>
              <span style={{ color: "#F1F5F9", fontSize: "14px", fontWeight: 700 }}>
                ${priceInfo.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{
                display: "flex", alignItems: "center", gap: "3px",
                color: priceColor, fontSize: "12px", fontWeight: 600,
              }}>
                {isPositive
                  ? <TrendingUp style={{ width: "13px", height: "13px" }} />
                  : <TrendingDown style={{ width: "13px", height: "13px" }} />
                }
                {isPositive ? "+" : ""}{priceInfo.changePct.toFixed(2)}%
              </span>
            </>
          )}
          {loading && (
            <span style={{ color: "#4B5563", fontSize: "11px" }}>Loading...</span>
          )}
          {error && (
            <span style={{ color: "#FF4F58", fontSize: "11px" }}>{error}</span>
          )}
        </div>

        {/* Timeframe pills */}
        <div style={{ display: "flex", gap: "4px" }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "3px 9px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                transition: "all 0.15s",
                background: timeframe === tf ? "rgba(0,163,255,0.18)" : "transparent",
                color: timeframe === tf ? "#00A3FF" : "#4B5563",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, width: "100%" }} />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
