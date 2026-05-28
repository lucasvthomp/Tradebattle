import { useEffect, useRef, useState, memo } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { Search, TrendingUp, TrendingDown, Zap } from "lucide-react";

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

const UP_COLOR   = "#00FF87";
const DOWN_COLOR = "#FF3D5A";

function TradingViewChartInner({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const [timeframe, setTimeframe] = useState<TF>("1M");
  const [loading, setLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !symbol) return;

    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    seriesRef.current = null;
    setPriceInfo(null);
    setError(null);

    const t = setTimeout(() => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;

      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#7B8FA8",
          fontSize: 11,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
        grid: {
          vertLines: { color: "rgba(0,163,255,0.06)" },
          horzLines: { color: "rgba(0,163,255,0.06)" },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: "rgba(0,163,255,0.5)", width: 1, style: 3, labelBackgroundColor: "#0C1829" },
          horzLine: { color: "rgba(0,163,255,0.5)", width: 1, style: 3, labelBackgroundColor: "#0C1829" },
        },
        rightPriceScale: {
          borderColor: "rgba(0,163,255,0.12)",
          textColor: "#7B8FA8",
        },
        timeScale: {
          borderColor: "rgba(0,163,255,0.12)",
          timeVisible: true,
          secondsVisible: false,
        },
        width: w,
        height: h,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor:        UP_COLOR,
        downColor:      DOWN_COLOR,
        borderUpColor:  UP_COLOR,
        borderDownColor: DOWN_COLOR,
        wickUpColor:    UP_COLOR,
        wickDownColor:  DOWN_COLOR,
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

      loadData(symbol, timeframe, series, chart);
    }, 50);

    return () => {
      clearTimeout(t);
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

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

      const seen = new Set<any>();
      const chartData = raw
        .map((item) => {
          const t = typeof item.date === "number"
            ? item.date
            : String(item.date).slice(0, 10);
          return {
            time: t as any,
            open:  Number(item.open),
            high:  Number(item.high),
            low:   Number(item.low),
            close: Number(item.close),
          };
        })
        .filter((d) => {
          if (!isFinite(d.open) || !isFinite(d.close)) return false;
          if (seen.has(d.time)) return false;
          seen.add(d.time);
          return true;
        })
        .sort((a, b) => {
          const ta = typeof a.time === "number" ? a.time : new Date(a.time + "T00:00:00Z").getTime();
          const tb = typeof b.time === "number" ? b.time : new Date(b.time + "T00:00:00Z").getTime();
          return ta - tb;
        });

      if (chartData.length === 0) throw new Error("No valid candles after filtering");

      const validCandles = chartData.filter((d) => {
        const hi = Math.max(d.open, d.close, d.high);
        const lo = Math.min(d.open, d.close, d.low);
        return hi > 0 && lo > 0 && hi >= lo;
      }).map((d) => ({
        ...d,
        high: Math.max(d.open, d.close, d.high),
        low:  Math.min(d.open, d.close, d.low),
      }));

      if (validCandles.length === 0) throw new Error("All candles invalid after OHLC check");

      series.setData(validCandles);
      chart.timeScale().fitContent();

      const first = validCandles[0];
      const last  = validCandles[validCandles.length - 1];
      const change    = last.close - first.open;
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
        alignItems: "center", justifyContent: "center", gap: "16px",
        background: "radial-gradient(ellipse at center, rgba(0,163,255,0.04) 0%, transparent 70%)",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(0,163,255,0.15), rgba(0,163,255,0.05))",
          border: "2px solid rgba(0,163,255,0.2)",
          boxShadow: "0 0 24px rgba(0,163,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Search style={{ width: "28px", height: "28px", color: "#00A3FF" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#C9D1E2", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Pick a ticker to trade
          </div>
          <div style={{ color: "#4B5975", fontSize: "13px", marginTop: "6px", fontWeight: 500 }}>
            Try AAPL, TSLA, or BTC-USD
          </div>
        </div>
      </div>
    );
  }

  const isPositive  = priceInfo ? priceInfo.change >= 0 : true;
  const priceColor  = isPositive ? UP_COLOR : DOWN_COLOR;
  const glowColor   = isPositive ? "rgba(0,255,135,0.25)" : "rgba(255,61,90,0.25)";
  const bgGradient  = isPositive
    ? "linear-gradient(90deg, rgba(0,255,135,0.08), transparent)"
    : "linear-gradient(90deg, rgba(255,61,90,0.08), transparent)";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px 8px", flexShrink: 0,
        background: bgGradient,
        borderBottom: "1px solid rgba(0,163,255,0.08)",
      }}>
        {/* Left: symbol + price + change */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>

          {/* Ticker badge */}
          <div style={{
            padding: "3px 10px", borderRadius: "10px",
            background: "rgba(0,163,255,0.12)",
            border: "1px solid rgba(0,163,255,0.22)",
            boxShadow: "0 0 10px rgba(0,163,255,0.12)",
          }}>
            <span style={{ color: "#E0EEFF", fontSize: "13px", fontWeight: 900, letterSpacing: "0.04em" }}>
              {symbol}
            </span>
          </div>

          {priceInfo && (
            <>
              <span style={{
                color: "#FFFFFF", fontSize: "18px", fontWeight: 900,
                letterSpacing: "-0.02em",
                textShadow: `0 0 16px ${glowColor}`,
              }}>
                ${priceInfo.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "3px 10px", borderRadius: "10px",
                background: isPositive ? "rgba(0,255,135,0.12)" : "rgba(255,61,90,0.12)",
                border: `1px solid ${isPositive ? "rgba(0,255,135,0.25)" : "rgba(255,61,90,0.25)"}`,
                boxShadow: `0 0 10px ${glowColor}`,
              }}>
                {isPositive
                  ? <TrendingUp  style={{ width: "13px", height: "13px", color: priceColor }} />
                  : <TrendingDown style={{ width: "13px", height: "13px", color: priceColor }} />}
                <span style={{ color: priceColor, fontSize: "12px", fontWeight: 800 }}>
                  {isPositive ? "+" : ""}{priceInfo.changePct.toFixed(2)}%
                </span>
              </div>
            </>
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Zap style={{ width: "12px", height: "12px", color: "#00A3FF", opacity: 0.7 }} />
              <span style={{ color: "#4B5975", fontSize: "11px", fontWeight: 600 }}>Loading…</span>
            </div>
          )}
          {error && (
            <span style={{
              color: DOWN_COLOR, fontSize: "11px", fontWeight: 600,
              padding: "2px 8px", borderRadius: "8px",
              background: "rgba(255,61,90,0.08)",
              border: "1px solid rgba(255,61,90,0.2)",
            }}>
              {error}
            </span>
          )}
        </div>

        {/* Right: timeframe pills */}
        <div style={{ display: "flex", gap: "4px" }}>
          {TIMEFRAMES.map((tf) => {
            const active = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: "4px 11px", borderRadius: "10px",
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: active ? "1px solid rgba(0,163,255,0.4)" : "1px solid transparent",
                  background: active
                    ? "linear-gradient(135deg, rgba(0,163,255,0.22), rgba(0,163,255,0.1))"
                    : "transparent",
                  color: active ? "#00C8FF" : "#4B5975",
                  boxShadow: active ? "0 0 10px rgba(0,163,255,0.2)" : "none",
                }}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chart canvas ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1, minHeight: 0, width: "100%",
          background: "linear-gradient(180deg, rgba(0,163,255,0.015) 0%, transparent 30%)",
        }}
      />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
