import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChartInner({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    // Create widget container structure
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";
    widgetContainer.appendChild(widgetDiv);

    // Attribution (required for free use)
    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML = `<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span style="color: #8A93A6; font-size: 11px;">Chart by TradingView</span></a>`;
    widgetContainer.appendChild(copyright);

    // Create and configure the script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "exchange",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      backgroundColor: "rgba(10, 14, 23, 1)",
      gridColor: "rgba(40, 199, 111, 0.06)",
      upColor: "#28C76F",
      downColor: "#FF4F58",
      borderUpColor: "#28C76F",
      borderDownColor: "#FF4F58",
      wickUpColor: "#28C76F",
      wickDownColor: "#FF4F58",
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      toolbar_bg: "#0A0E17",
      withdateranges: true,
      details: false,
      hotlist: false,
      studies: [],
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
