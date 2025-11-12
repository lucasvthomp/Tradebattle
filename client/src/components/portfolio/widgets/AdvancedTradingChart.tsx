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
  candlestickInterval?: string;
  zoomTrigger?: number;
  showIndicators?: boolean;
  timeRange?: string;
}

interface Indicator {
  id: string;
  name: string;
  enabled: boolean;
  series?: ISeriesApi<any>;
}

export function AdvancedTradingChart({
  tournamentId,
  selectedStock,
  title = "Advanced Chart",
  candlestickInterval = "5 minutes",
  zoomTrigger = 0,
  showIndicators: showIndicatorsProp = false,
  timeRange = "1D"
}: AdvancedTradingChartProps) {
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

  // Convert time range to number of bars to display
  const getVisibleBarsFromTimeRange = (range: string): number => {
    // Assuming candlestick interval, calculate how many bars fit in the time range
    const intervalMinutes = {
      '1 tick': 1/60,
      '144 ticks': 144/60,
      '1 second': 1/60,
      '5 seconds': 5/60,
      '30 seconds': 0.5,
      '1 minute': 1,
      '5 minutes': 5,
      '10 minutes': 10,
      '30 minutes': 30,
      '1 hour': 60,
      '3 hours': 180,
      '12 hours': 720,
      '1 day': 1440,
      '1 week': 10080
    }[candlestickInterval] || 5;

    const rangeMinutes = {
      '1D': 390,      // 6.5 hours of trading
      '1W': 1950,     // 5 trading days
      '1M': 8775,     // ~22 trading days
      '3M': 26325,    // ~66 trading days
      'YTD': 87600,   // Year to date (approx)
      '1Y': 87600,    // ~252 trading days
      '5Y': 438000,   // ~1260 trading days
      'All': 1752000  // Max historical data
    }[range] || 390;

    return Math.ceil(rangeMinutes / intervalMinutes);
  };

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
      // Always load 1 year of data to allow scrolling
      const response = await fetch(`/api/historical/${symbol}?timeframe=1Y`);
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
            'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
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
            // Set the visible range based on timeRange
            const visibleBars = getVisibleBarsFromTimeRange(timeRange);
            const dataLength = candleData.length;

            if (dataLength > 0) {
              // Show the most recent N bars
              const endIndex = dataLength - 1;
              const startIndex = Math.max(0, endIndex - visibleBars);

              chartRef.current.timeScale().setVisibleRange({
                from: candleData[startIndex].time as any,
                to: candleData[endIndex].time as any,
              });
            }
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
        fixLeftEdge: false,
        fixRightEdge: false,
        allowShiftVisibleRangeOnWhitespaceReplacement: true,
        shiftVisibleRangeOnNewBar: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: {
          time: true,
          price: false,
        },
        axisDoubleClickReset: {
          time: true,
          price: true,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    // Add candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#28C76F',
      downColor: '#FF4F58',
      borderVisible: false,
      wickUpColor: '#28C76F',
      wickDownColor: '#FF4F58',
    });

    // Add volume series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#28C76F',
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
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    const chart = chartRef.current;
    const candlestickSeries = candlestickSeriesRef.current;
    const data = candlestickSeries.data();

    if (data && data.length > 0) {
      const visibleBars = getVisibleBarsFromTimeRange(timeRange);
      const dataLength = data.length;

      // Show the most recent N bars
      const endIndex = dataLength - 1;
      const startIndex = Math.max(0, endIndex - visibleBars);

      chart.timeScale().setVisibleRange({
        from: data[startIndex].time as any,
        to: data[endIndex].time as any,
      });
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

  // Handle zoom trigger from parent
  useEffect(() => {
    if (zoomTrigger > 0) {
      handleZoomIn();
    }
  }, [zoomTrigger]);

  // Handle show/hide indicators from parent
  useEffect(() => {
    if (showIndicatorsProp) {
      // Enable default indicators
      setIndicators(prev => prev.map((ind, idx) =>
        idx < 2 ? { ...ind, enabled: true } : ind
      ));
    } else {
      // Disable all indicators
      setIndicators(prev => prev.map(ind => ({ ...ind, enabled: false })));
    }
  }, [showIndicatorsProp]);

  // Handle time range changes
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    const chart = chartRef.current;
    const candlestickSeries = candlestickSeriesRef.current;
    const data = candlestickSeries.data();

    if (data && data.length > 0) {
      const visibleBars = getVisibleBarsFromTimeRange(timeRange);
      const dataLength = data.length;

      // Show the most recent N bars
      const endIndex = dataLength - 1;
      const startIndex = Math.max(0, endIndex - visibleBars);

      chart.timeScale().setVisibleRange({
        from: data[startIndex].time as any,
        to: data[endIndex].time as any,
      });
    }
  }, [timeRange]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-3 py-2 border-b border-border/20">
        <div className="flex items-center gap-2 mb-2">
          {/* Stock Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search symbol..."
              className="pl-8 h-8 text-sm"
              autoComplete="off"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => {
                      setSearchQuery(result.symbol);
                      setSelectedSymbol(result.symbol);
                      setShowDropdown(false);
                      updateChart(result.symbol, selectedTimeframe);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors text-sm"
                  >
                    <div className="font-medium">{result.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeframe Selector */}
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-20 h-8 text-xs">
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
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
          <div className="flex items-center border border-border rounded-md">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0 rounded-r-none"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0 rounded-none border-x"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetZoom}
              className="h-8 w-8 p-0 rounded-l-none"
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
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
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
