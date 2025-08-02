/*
 * TRADINGVIEW LIGHTWEIGHT CHARTS COMPONENT
 * =======================================
 * 
 * Features:
 * - Professional candlestick charts using TradingView's Lightweight Charts
 * - Integrates with portfolio holdings and Yahoo Finance API
 * - Dark theme optimized styling
 * - Manual data mode for custom testing/development
 * - Volume subplot for comprehensive market analysis
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
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

export function PerformanceChart() {
  const { user } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA");
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
   * Data format for TradingView Lightweight Charts:
   * - time: Unix timestamp or 'YYYY-MM-DD' format
   * - open, high, low, close: Price values
   * - volume: Trading volume for volume histogram
   */
  const manualCandlestickData = [
    { time: '2025-07-01', open: 150.00, high: 155.50, low: 148.75, close: 153.25 },
    { time: '2025-07-02', open: 153.25, high: 158.00, low: 152.00, close: 156.75 },
    { time: '2025-07-03', open: 156.75, high: 162.00, low: 155.50, close: 160.00 },
    { time: '2025-07-04', open: 160.00, high: 165.25, low: 158.75, close: 163.50 },
    { time: '2025-07-05', open: 163.50, high: 167.00, low: 161.25, close: 165.75 },
    { time: '2025-07-08', open: 165.75, high: 170.50, low: 164.00, close: 168.25 },
    { time: '2025-07-09', open: 168.25, high: 172.75, low: 166.50, close: 171.00 },
    { time: '2025-07-10', open: 171.00, high: 175.25, low: 169.75, close: 173.50 },
    { time: '2025-07-11', open: 173.50, high: 177.00, low: 172.25, close: 175.75 },
    { time: '2025-07-12', open: 175.75, high: 179.50, low: 174.00, close: 177.25 },
  ];

  const manualVolumeData = [
    { time: '2025-07-01', value: 1000000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-02', value: 1200000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-03', value: 1500000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-04', value: 1800000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-05', value: 2000000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-08', value: 2200000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-09', value: 2500000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-10', value: 2800000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-11', value: 3000000, color: 'rgba(76, 175, 80, 0.5)' },
    { time: '2025-07-12', value: 3200000, color: 'rgba(76, 175, 80, 0.5)' },
  ];

  // Get portfolio data to show available holdings
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = (portfolioData as any)?.data;
  const holdings = portfolio?.holdings || [];

  // Fetch historical candlestick data
  const fetchCandlestickData = async (symbol: string, timeframe: string) => {
    if (useManualData) {
      return {
        candlestick: manualCandlestickData,
        volume: manualVolumeData
      };
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/historical/${symbol}/${timeframe}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const candlestickData = data.data.map((item: any) => ({
          time: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));

        const volumeData = data.data.map((item: any) => ({
          time: item.date,
          value: item.volume || 0,
          color: item.close >= item.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)'
        }));

        return { candlestick: candlestickData, volume: volumeData };
      }
      return { candlestick: [], volume: [] };
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      return { candlestick: [], volume: [] };
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
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    // Position volume series at the bottom
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

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
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const data = await fetchCandlestickData(symbol, timeframe);
    
    if (data.candlestick.length > 0) {
      candlestickSeriesRef.current.setData(data.candlestick);
      volumeSeriesRef.current.setData(data.volume);
    }
  };

  // Initialize chart on mount
  useEffect(() => {
    const cleanup = initializeChart();
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
            <span>Trading Chart - {selectedSymbol}</span>
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
        <div className="h-[430px] w-full">
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