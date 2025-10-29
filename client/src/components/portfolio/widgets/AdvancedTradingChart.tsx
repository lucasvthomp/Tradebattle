/*
 * ADVANCED TRADING CHART COMPONENT
 * =================================
 *
 * Professional candlestick chart with advanced features:
 * - Candlestick chart with OHLC data
 * - Volume overlay histogram
 * - Zoom and pan controls
 * - Multiple timeframes (1H, 1D, 1W, 1M, 3M, 6M, YTD, 1Y, 5Y)
 * - Technical indicators (MA, EMA, RSI, MACD, Bollinger Bands)
 * - Search functionality with autocomplete
 * - Crosshair with price/time details
 * - Price scale on right, time scale on bottom
 * - Dark theme optimized
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, RefreshCw, Search, Settings, Plus, Minus, Maximize2, BarChart3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  PriceScaleMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries
} from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi
} from 'lightweight-charts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface AdvancedTradingChartProps {
  tournamentId?: number;
  selectedStock?: string | null;
  title?: string;
}

interface Indicator {
  id: string;
  name: string;
  enabled: boolean;
  series?: ISeriesApi<any>;
}

export function AdvancedTradingChart({ tournamentId, selectedStock, title = "Advanced Chart" }: AdvancedTradingChartProps) {
  const { user } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const currentDataRef = useRef<any[]>([]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>(selectedStock || "NVDA");
  const [searchQuery, setSearchQuery] = useState<string>(selectedStock || "NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: 'ma20', name: 'MA(20)', enabled: false },
    { id: 'ma50', name: 'MA(50)', enabled: false },
    { id: 'ema12', name: 'EMA(12)', enabled: false },
    { id: 'ema26', name: 'EMA(26)', enabled: false },
  ]);

  // Update chart when selectedStock prop changes
  useEffect(() => {
    if (selectedStock && selectedStock !== selectedSymbol) {
      setSelectedSymbol(selectedStock);
      setSearchQuery(selectedStock);
      setTimeout(() => updateChart(selectedStock, selectedTimeframe), 100);
    }
  }, [selectedStock]);

  // Search for companies/stocks
  const searchCompanies = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data)) {
        setSearchResults(data.data.slice(0, 8));
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      searchCompanies(value.trim());
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const symbol = result.symbol;
    setSearchQuery(symbol);
    setSelectedSymbol(symbol);
    setShowDropdown(false);
    updateChart(symbol, selectedTimeframe);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setSelectedSymbol(searchQuery.trim().toUpperCase());
        updateChart(searchQuery.trim().toUpperCase(), selectedTimeframe);
        setShowDropdown(false);
      }
    }
  };

  // Calculate simple moving average
  const calculateSMA = (data: any[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push({
        time: data[i].time,
        value: sum / period
      });
    }
    return sma;
  };

  // Calculate exponential moving average
  const calculateEMA = (data: any[], period: number) => {
    const ema = [];
    const multiplier = 2 / (period + 1);

    // Calculate initial SMA for the first EMA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    let previousEMA = sum / period;

    ema.push({
      time: data[period - 1].time,
      value: previousEMA
    });

    // Calculate EMA for remaining data points
    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i].close - previousEMA) * multiplier + previousEMA;
      ema.push({
        time: data[i].time,
        value: currentEMA
      });
      previousEMA = currentEMA;
    }

    return ema;
  };

  // Fetch and update chart data
  const fetchChartData = async (symbol: string, timeframe: string) => {
    try {
      const response = await fetch(`/api/historical/${symbol}?timeframe=${timeframe}`);
      const data = await response.json();

      if (data.success && data.data) {
        const candleData = data.data.map((item: any) => ({
          time: item.date,
          open: parseFloat(item.open) || 0,
          high: parseFloat(item.high) || 0,
          low: parseFloat(item.low) || 0,
          close: parseFloat(item.close) || 0,
        }));

        const volumeData = data.data.map((item: any) => ({
          time: item.date,
          value: parseFloat(item.volume) || 0,
          color: parseFloat(item.close) >= parseFloat(item.open) ?
            'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
        }));

        // Sort by time
        candleData.sort((a: any, b: any) => {
          const timeA = new Date(a.time).getTime() / 1000;
          const timeB = new Date(b.time).getTime() / 1000;
          return timeA - timeB;
        });

        volumeData.sort((a: any, b: any) => {
          const timeA = new Date(a.time).getTime() / 1000;
          const timeB = new Date(b.time).getTime() / 1000;
          return timeA - timeB;
        });

        return { candleData, volumeData, rawData: data.data };
      }
      return { candleData: [], volumeData: [], rawData: [] };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return { candleData: [], volumeData: [], rawData: [] };
    }
  };

  // Update indicators
  const updateIndicators = (rawData: any[]) => {
    if (!chartRef.current || rawData.length === 0) return;

    // Store current data for later use
    currentDataRef.current = rawData;

    // Clear all existing indicator series
    indicatorSeriesRef.current.forEach((series) => {
      chartRef.current!.removeSeries(series);
    });
    indicatorSeriesRef.current.clear();

    // Add enabled indicators
    indicators.forEach(indicator => {
      if (!indicator.enabled) return;

      let indicatorData: any[] = [];
      const priceData = rawData.map(d => ({
        time: d.date,
        close: parseFloat(d.close)
      }));

      switch (indicator.id) {
        case 'ma20':
          indicatorData = calculateSMA(priceData, 20);
          break;
        case 'ma50':
          indicatorData = calculateSMA(priceData, 50);
          break;
        case 'ema12':
          indicatorData = calculateEMA(priceData, 12);
          break;
        case 'ema26':
          indicatorData = calculateEMA(priceData, 26);
          break;
      }

      if (indicatorData.length > 0) {
        const color = indicator.id.startsWith('ma')
          ? (indicator.id === 'ma20' ? '#2962FF' : '#1E88E5')
          : (indicator.id === 'ema12' ? '#FF6D00' : '#F57C00');

        const series = chartRef.current!.addSeries(LineSeries, {
          color: color,
          lineWidth: 2,
          title: indicator.name,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        series.setData(indicatorData);
        indicatorSeriesRef.current.set(indicator.id, series);
      }
    });
  };

  // Update chart
  const updateChart = async (symbol: string, timeframe: string) => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !chartRef.current) return;

    setIsLoading(true);
    try {
      const { candleData, volumeData, rawData } = await fetchChartData(symbol, timeframe);

      if (candleData.length > 0) {
        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // Update indicators
        updateIndicators(rawData);

        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error updating chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle indicator
  const toggleIndicator = (indicatorId: string) => {
    setIndicators(prevIndicators => {
      const updatedIndicators = prevIndicators.map(ind =>
        ind.id === indicatorId ? { ...ind, enabled: !ind.enabled } : ind
      );

      // Re-apply indicators using current data
      setTimeout(() => {
        if (currentDataRef.current.length > 0) {
          updateIndicators(currentDataRef.current);
        }
      }, 0);

      return updatedIndicators;
    });
  };

  // Initialize chart
  const initializeChart = () => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#758696',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        fixLeftEdge: true,
        fixRightEdge: true,
        allowShiftVisibleRangeOnWhitespaceReplacement: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    // Add candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add volume series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const { from, to } = timeScale.getVisibleRange() || { from: 0, to: 0 };
      const range = to - from;
      const newRange = range * 0.8;
      const center = (from + to) / 2;
      timeScale.setVisibleRange({
        from: center - newRange / 2,
        to: center + newRange / 2,
      });
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const { from, to } = timeScale.getVisibleRange() || { from: 0, to: 0 };
      const range = to - from;
      const newRange = range * 1.2;
      const center = (from + to) / 2;
      timeScale.setVisibleRange({
        from: center - newRange / 2,
        to: center + newRange / 2,
      });
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  useEffect(() => {
    const cleanup = initializeChart();
    setTimeout(() => {
      if (selectedSymbol && selectedTimeframe) {
        updateChart(selectedSymbol, selectedTimeframe);
      }
    }, 200);
    return cleanup;
  }, []);

  useEffect(() => {
    if (selectedSymbol && selectedTimeframe) {
      updateChart(selectedSymbol, selectedTimeframe);
    }
  }, [selectedSymbol, selectedTimeframe]);

  // Auto-refresh chart data every 1 minute
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (selectedSymbol && selectedTimeframe) {
        console.log(`Auto-refreshing chart data for ${selectedSymbol} at ${new Date().toLocaleTimeString()}`);
        updateChart(selectedSymbol, selectedTimeframe);
      }
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(refreshInterval);
  }, [selectedSymbol, selectedTimeframe]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>{selectedSymbol}</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Symbol Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Search stocks..."
                className="pl-8 w-48 h-8"
              />

              {showDropdown && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full right-0 w-80 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                      Searching...
                    </div>
                  ) : (
                    searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => selectSearchResult(result)}
                        className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{result.symbol}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {result.name || result.shortName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Timeframe Selector */}
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="5Y">5Y</SelectItem>
              </SelectContent>
            </Select>

            {/* Indicators Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Indicators</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {indicators.map(indicator => (
                  <DropdownMenuCheckboxItem
                    key={indicator.id}
                    checked={indicator.enabled}
                    onCheckedChange={() => toggleIndicator(indicator.id)}
                  >
                    {indicator.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border border-border rounded-md">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetZoom}
                className="h-8 w-8 p-0"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateChart(selectedSymbol, selectedTimeframe)}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="h-full w-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          <div
            ref={chartContainerRef}
            className="w-full h-full [&_a]:hidden"
            style={{
              position: 'relative'
            }}
          />
        </div>
      </div>
    </div>
  );
}
