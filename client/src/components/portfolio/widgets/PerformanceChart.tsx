/*
 * CANDLESTICK CHART COMPONENT
 * ===========================
 * 
 * Features:
 * - Real-time candlestick charts using Plotly.js
 * - Integrates with portfolio holdings and Yahoo Finance API
 * - Dark theme optimized styling
 * - Manual data mode for custom testing/development
 * - Volume subplot for comprehensive market analysis
 * - Responsive design with interactive controls
 * - Multiple timeframe support (1D, 5D, 1M, 3M, 6M, 1Y)
 * 
 * Usage:
 * - Live Mode: Fetches real market data from Yahoo Finance
 * - Manual Mode: Uses predefined data array (editable in code)
 * - Symbol selector shows portfolio holdings when available
 * - Refresh button updates data on demand
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

declare global {
  interface Window {
    Plotly: any;
  }
}

export function PerformanceChart() {
  const { user } = useAuth();
  const plotRef = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA"); // Default to NVDA
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [useManualData, setUseManualData] = useState(false);

  /* 
   * MANUAL DATA UPDATE INSTRUCTIONS:
   * To update the candlestick data manually:
   * 1. Modify the data array below with your desired OHLCV values
   * 2. Toggle to "Manual" mode using the button in the chart header
   * 3. The chart will automatically refresh with your custom data
   * 
   * Data format:
   * - date: 'YYYY-MM-DD' format
   * - open: Opening price for the day
   * - high: Highest price for the day
   * - low: Lowest price for the day
   * - close: Closing price for the day
   * - volume: Trading volume for the day
   */
  const manualCandlestickData = [
    { date: '2025-07-01', open: 150.00, high: 155.50, low: 148.75, close: 153.25, volume: 1000000 },
    { date: '2025-07-02', open: 153.25, high: 158.00, low: 152.00, close: 156.75, volume: 1200000 },
    { date: '2025-07-03', open: 156.75, high: 162.00, low: 155.50, close: 160.00, volume: 1500000 },
    { date: '2025-07-04', open: 160.00, high: 165.25, low: 158.75, close: 163.50, volume: 1800000 },
    { date: '2025-07-05', open: 163.50, high: 167.00, low: 161.25, close: 165.75, volume: 2000000 },
    { date: '2025-07-08', open: 165.75, high: 170.50, low: 164.00, close: 168.25, volume: 2200000 },
    { date: '2025-07-09', open: 168.25, high: 172.75, low: 166.50, close: 171.00, volume: 2500000 },
    { date: '2025-07-10', open: 171.00, high: 175.25, low: 169.75, close: 173.50, volume: 2800000 },
    { date: '2025-07-11', open: 173.50, high: 177.00, low: 172.25, close: 175.75, volume: 3000000 },
    { date: '2025-07-12', open: 175.75, high: 179.50, low: 174.00, close: 177.25, volume: 3200000 },
    // Add more data points here as needed...
  ];

  // Get portfolio data to show available holdings
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = (portfolioData as any)?.data;
  const holdings = portfolio?.holdings || [];

  // Fetch historical candlestick data for the selected symbol
  const fetchCandlestickData = async (symbol: string, timeframe: string) => {
    // Return manual data if manual mode is enabled
    if (useManualData) {
      return manualCandlestickData;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/historical/${symbol}/${timeframe}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create candlestick chart
  const createCandlestickChart = async (symbol: string, timeframe: string) => {
    if (!plotRef.current || !window.Plotly) return;

    const data = await fetchCandlestickData(symbol, timeframe);
    
    if (data.length === 0) {
      // Show message if no data available
      plotRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full text-muted-foreground">
          <p>No candlestick data available for ${symbol}</p>
        </div>
      `;
      return;
    }

    // Prepare data for Plotly candlestick chart
    const candlestickTrace = {
      x: data.map((item: any) => item.date),
      open: data.map((item: any) => item.open),
      high: data.map((item: any) => item.high),
      low: data.map((item: any) => item.low),
      close: data.map((item: any) => item.close),
      type: 'candlestick',
      name: symbol,
      increasing: {
        line: { color: '#22c55e' }, // Green for increasing
        fillcolor: '#22c55e'
      },
      decreasing: {
        line: { color: '#ef4444' }, // Red for decreasing
        fillcolor: '#ef4444'
      }
    };

    // Volume trace (optional)
    const volumeTrace = {
      x: data.map((item: any) => item.date),
      y: data.map((item: any) => item.volume || 0),
      type: 'bar',
      name: 'Volume',
      yaxis: 'y2',
      marker: { color: 'rgba(158, 158, 158, 0.3)' },
      showlegend: false
    };

    // Layout configuration for dark theme
    const layout = {
      title: {
        text: `${symbol} - ${timeframe} Candlestick Chart${useManualData ? ' (Manual Data)' : ''}`,
        font: { color: 'white', size: 18 }
      },
      xaxis: {
        title: 'Date',
        titlefont: { color: 'white' },
        tickfont: { color: 'white' },
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        type: 'date'
      },
      yaxis: {
        title: 'Price ($)',
        titlefont: { color: 'white' },
        tickfont: { color: 'white' },
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        domain: [0.3, 1]
      },
      yaxis2: {
        title: 'Volume',
        titlefont: { color: 'white' },
        tickfont: { color: 'white' },
        overlaying: 'y',
        side: 'right',
        domain: [0, 0.25],
        showgrid: false
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { l: 60, r: 60, t: 60, b: 60 },
      showlegend: true,
      legend: {
        font: { color: 'white' },
        bgcolor: 'rgba(0,0,0,0.3)',
        bordercolor: 'rgba(255, 255, 255, 0.2)',
        borderwidth: 1
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      modeBarButtonsToAdd: [
        {
          name: 'Refresh Data',
          icon: window.Plotly.Icons.refresh,
          click: () => createCandlestickChart(symbol, timeframe)
        }
      ]
    };

    // Create the plot
    window.Plotly.newPlot(plotRef.current, [candlestickTrace, volumeTrace], layout, config);
  };

  // Update chart when symbol or timeframe changes
  useEffect(() => {
    if (selectedSymbol && selectedTimeframe) {
      createCandlestickChart(selectedSymbol, selectedTimeframe);
    }
  }, [selectedSymbol, selectedTimeframe]);

  // Initialize chart on mount
  useEffect(() => {
    // Set default symbol to first holding if available
    if (holdings.length > 0 && !selectedSymbol) {
      setSelectedSymbol(holdings[0].symbol);
    }
  }, [holdings]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Candlestick Chart</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Manual Data Toggle */}
            <Button
              size="sm"
              variant={useManualData ? "default" : "outline"}
              onClick={() => {
                setUseManualData(!useManualData);
                // Refresh chart when toggling manual data
                setTimeout(() => createCandlestickChart(selectedSymbol, selectedTimeframe), 100);
              }}
              className="text-xs"
            >
              {useManualData ? "Manual" : "Live"}
            </Button>

            {/* Symbol Selector */}
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Symbol" />
              </SelectTrigger>
              <SelectContent>
                {holdings.length > 0 ? (
                  holdings.map((holding: any) => (
                    <SelectItem key={holding.symbol} value={holding.symbol}>
                      {holding.symbol}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="NVDA">NVDA</SelectItem>
                    <SelectItem value="AAPL">AAPL</SelectItem>
                    <SelectItem value="MSFT">MSFT</SelectItem>
                    <SelectItem value="GOOGL">GOOGL</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Timeframe Selector */}
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe} disabled={useManualData}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="5D">5D</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => createCandlestickChart(selectedSymbol, selectedTimeframe)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading candlestick data...</span>
            </div>
          )}
          <div 
            ref={plotRef} 
            className="w-full h-full"
            style={{ minHeight: '450px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}