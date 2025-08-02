/*
 * TRADINGVIEW LIGHTWEIGHT CHARTS COMPONENT
 * =======================================
 * 
 * Features:
 * - Professional price charts using TradingView's Lightweight Charts
 * - Integrates with portfolio holdings and Yahoo Finance API
 * - Dark theme optimized styling
 * - Manual data mode for custom testing/development
 * - Responsive design with timeframe dropdown
 * - Multiple timeframe support (1D, 5D, 1M, 3M, 6M, 1Y)
 * 
 * Usage:
 * - Select symbol from your portfolio holdings or default stocks
 * - Choose timeframe from dropdown menu
 * - Chart updates automatically with real market data
 * - Toggle manual mode for custom data testing
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

export function PerformanceChart() {
  const { user } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [useManualData, setUseManualData] = useState(false);

  /* 
   * MANUAL DATA UPDATE INSTRUCTIONS:
   * To update the chart data manually:
   * 1. Modify the data array below with your desired price values
   * 2. Toggle to "Manual" mode using the button in the chart header
   * 3. The chart will automatically refresh with your custom data
   * 
   * Data format for TradingView Lightweight Charts:
   * - time: Unix timestamp or 'YYYY-MM-DD' format
   * - value: Price value for line chart
   */
  const manualData = [
    { time: '2025-07-01', value: 153.25 },
    { time: '2025-07-02', value: 156.75 },
    { time: '2025-07-03', value: 160.00 },
    { time: '2025-07-04', value: 163.50 },
    { time: '2025-07-05', value: 165.75 },
    { time: '2025-07-08', value: 168.25 },
    { time: '2025-07-09', value: 171.00 },
    { time: '2025-07-10', value: 173.50 },
    { time: '2025-07-11', value: 175.75 },
    { time: '2025-07-12', value: 177.25 },
  ];

  // Get portfolio data to show available holdings
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = (portfolioData as any)?.data;
  const holdings = portfolio?.holdings || [];

  // Fetch historical price data
  const fetchChartData = async (symbol: string, timeframe: string) => {
    if (useManualData) {
      return manualData;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/historical/${symbol}?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const chartData = data.data.map((item: any) => ({
          time: typeof item.date === 'number' ? item.date : item.date,
          value: parseFloat(item.close) || 0
        }));
        // Sort by time to ensure proper left-to-right display
        chartData.sort((a, b) => {
          const timeA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime() / 1000;
          const timeB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime() / 1000;
          return timeA - timeB;
        });
        return chartData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize TradingView chart
  const initializeChart = () => {
    if (!chartContainerRef.current) return;

    // Remove existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.3)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Add line series using correct API
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#26a69a',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  // Update chart data
  const updateChart = async (symbol: string, timeframe: string) => {
    if (!seriesRef.current || !chartRef.current) return;

    const data = await fetchChartData(symbol, timeframe);
    
    if (data.length > 0) {
      seriesRef.current.setData(data);
      
      // Add a small delay to ensure data is loaded before fitting
      setTimeout(() => {
        if (chartRef.current) {
          // Fit the chart content to show all data from left to right
          chartRef.current.timeScale().fitContent();
        }
      }, 100);
    }
  };

  // Initialize chart on mount
  useEffect(() => {
    const cleanup = initializeChart();
    // Load initial data after chart is initialized
    setTimeout(() => {
      if (selectedSymbol && selectedTimeframe) {
        updateChart(selectedSymbol, selectedTimeframe);
      }
    }, 200);
    return cleanup;
  }, []);

  // Update chart when symbol or timeframe changes
  useEffect(() => {
    if (selectedSymbol && selectedTimeframe) {
      updateChart(selectedSymbol, selectedTimeframe);
    }
  }, [selectedSymbol, selectedTimeframe, useManualData]);

  // Set default symbol to first holding if available
  useEffect(() => {
    if (holdings.length > 0 && selectedSymbol === "NVDA") {
      setSelectedSymbol(holdings[0].symbol);
    }
  }, [holdings]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Price Chart - {selectedSymbol}</span>
            {useManualData && <span className="text-xs text-muted-foreground">(Manual Data)</span>}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Manual Data Toggle */}
            <Button
              size="sm"
              variant={useManualData ? "default" : "outline"}
              onClick={() => {
                setUseManualData(!useManualData);
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
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
              onClick={() => updateChart(selectedSymbol, selectedTimeframe)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[430px] w-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          <div 
            ref={chartContainerRef} 
            className="w-full h-full rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}