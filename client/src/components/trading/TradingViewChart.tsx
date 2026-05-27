import { useEffect, useRef, memo } from "react";
import { Search } from "lucide-react";

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChartInner({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !symbol) return;

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    widgetContainer.appendChild(widgetDiv);

    // Hide the attribution bar (kept in DOM for TradingView compliance but invisible)
    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.style.display = "none";
    widgetContainer.appendChild(copyright);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "exchange",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      backgroundColor: "rgba(10, 22, 40, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => { container.innerHTML = ""; };
  }, [symbol]);

  if (!symbol) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(10, 22, 40, 1)",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "rgba(0,163,255,0.06)",
            border: "1px solid rgba(0,163,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search style={{ width: "20px", height: "20px", color: "#00A3FF", opacity: 0.6 }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#C9D1E2", fontSize: "14px", fontWeight: 600 }}>Search a ticker to begin</div>
          <div style={{ color: "#2D3748", fontSize: "12px", marginTop: "4px" }}>e.g. AAPL, TSLA, BTC-USD</div>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export const TradingViewChart = memo(TradingViewChartInner);
