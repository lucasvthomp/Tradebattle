import { useEffect, useRef, useState, memo } from "react";
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
  const roRef = useRef<ResizeObserver | null>(null);

  const [timeframe, setTimeframe] = useState<TF>("1M");
  const [loading, setLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize chart instance — runs when symbol changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !symbol) return;

    // Tear down previous instance
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    seriesRef.current = null;
    setPriceInfo(null);
    setError(null);

    // Use a small timeout so the flex container has resolved its height
    const t = setTimeout(() => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;

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
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
        timeScale: {
          borderColor: "rgba(255,255,255,0.08)",
          timeVisible: true,
          secondsVisible: false,
        },
        width: w,
        height: h,
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

      const ro = new ResizeObserver(() => {
        if (!chartRef.current || !container) return;
        chartRef.current.applyOptions({
          width: container.clientWidth || 600,
          height: container.clientHeight || 400,
        });
      });
      ro.observe(container);
      roRef.current = ro;

      // Capture refs at call time so cleanup doesn't interfere with the fetch
      const capturedSeries = series;
      const capturedChart = chart;
      loadData(symbol, timeframe, capturedSeries, capturedChart);
    }, 50);

    return () => {
      clearTimeout(t);
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Reload data when timeframe changes (no chart rebuild)
  useEffect(() => {
    if (symbol && seriesRef.current && chartRef.current) {
      loadData(symbol, timeframe, seriesRef.current, chartRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  async function loadData(sym: string, tf: TF, series: any, chart: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/historical/${encodeURIComponent(sym)}?timeframe=${tf}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 80)}`);
      }
      const json = await res.json();
      const raw: any[] = json.data || [];

      if (raw.length === 0) throw new Error("No data returned from API");

      // Convert to lightweight-charts candle format
      // For intraday (1D): date is a unix timestamp in seconds
      // For daily+: date is "YYYY-MM-DD" string — lw-charts accepts this directly
      const seen = new Set<any>();
      const chartData = raw
        .map((item) => {
          const t = typeof item.date === "number"
            ? item.date  // already unix seconds
            : String(item.date).slice(0, 10); // "YYYY-MM-DD"
          return {
            time: t as any,
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
          };
        })
        .filter((d) => {
          if (!isFinite(d.open) || !isFinite(d.close)) return false;
          if (seen.has(d.time)) return false;  // deduplicate
          seen.add(d.time);
          return true;
        })
        .sort((a, b) => {
          const ta = typeof a.time === "number" ? a.time : new Date(a.time + "T00:00:00Z").getTime();
          const tb = typeof b.time === "number" ? b.time : new Date(b.time + "T00:00:00Z").getTime();
          return ta - tb;
        });

      if (chartData.length === 0) throw new Error("No valid candles after filtering");

      // Ensure OHLC values are internally consistent (lw-charts rejects bad candles)
      const validCandles = chartData.filter((d) => {
        const realHigh = Math.max(d.open, d.close, d.high);
        const realLow = Math.min(d.open, d.close, d.low);
        return realHigh > 0 && realLow > 0 && realHigh >= realLow;
      }).map((d) => ({
        ...d,
        high: Math.max(d.open, d.close, d.high),
        low: Math.min(d.open, d.close, d.low),
      }));

      if (validCandles.length === 0) throw new Error("All candles invalid after OHLC check");

      series.setData(validCandles);
      chart.timeScale().fitContent();

      const first = validCandles[0];
      const last = validCandles[validCandles.length - 1];
      const change = last.close - first.open;
      const changePct = first.open !== 0 ? (change / first.open) * 100 : 0;
      setPriceInfo({ price: last.close, change, changePct });
    } catch (e: any) {
      console.error("[Chart] loadData error:", e);
      setError(e?.message ? String(e.message).slice(0, 80) : "Could not load chart data");
    } finally {
      setLoading(false);
    }
  }

  if (!symbol) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "12px",
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
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 6px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#F1F5F9", fontSize: "15px", fontWeight: 800, letterSpacing: "-0.01em" }}>
            {symbol}
          </span>
          {priceInfo && (
            <>
              <span style={{ color: "#F1F5F9", fontSize: "14px", fontWeight: 700 }}>
                ${priceInfo.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "3px", color: priceColor, fontSize: "12px", fontWeight: 600 }}>
                {isPositive
                  ? <TrendingUp style={{ width: "13px", height: "13px" }} />
                  : <TrendingDown style={{ width: "13px", height: "13px" }} />}
                {isPositive ? "+" : ""}{priceInfo.changePct.toFixed(2)}%
              </span>
            </>
          )}
          {loading && <span style={{ color: "#4B5563", fontSize: "11px" }}>Loading…</span>}
          {error && <span style={{ color: "#FF4F58", fontSize: "11px" }}>{error}</span>}
        </div>

        {/* Timeframe pills */}
        <div style={{ display: "flex", gap: "2px" }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "3px 9px", borderRadius: "8px",
                fontSize: "11px", fontWeight: 700,
                cursor: "pointer", border: "none", transition: "all 0.15s",
                background: timeframe === tf ? "rgba(0,163,255,0.18)" : "transparent",
                color: timeframe === tf ? "#00A3FF" : "#4B5563",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart mounts here */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, width: "100%" }} />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
