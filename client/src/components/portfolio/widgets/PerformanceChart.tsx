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
import { TrendingUp, RefreshCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

export function PerformanceChart() {
  const { user } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA");
  const [searchQuery, setSearchQuery] = useState<string>("NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search for companies/stocks as user types
  const searchCompanies = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSearchResults(data.data.slice(0, 8)); // Limit to 8 results
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchCompanies(value.trim());
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle selecting a search result
  const selectSearchResult = (result: any) => {
    const symbol = result.symbol;
    setSearchQuery(symbol);
    setSelectedSymbol(symbol);
    setShowDropdown(false);
    updateChart(symbol, selectedTimeframe);
  };

  // Handle Enter key for direct symbol search
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

  // Get portfolio data to show available holdings
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user
  });

  const portfolio = (portfolioData as any)?.data;
  const holdings = portfolio?.holdings || [];

  // Fetch historical price data
  const fetchChartData = async (symbol: string, timeframe: string) => {
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
        chartData.sort((a: any, b: any) => {
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
  }, [selectedSymbol, selectedTimeframe]);

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
          </CardTitle>
          <div className="flex items-center space-x-2 flex-1">
            {/* Symbol Search Bar with Autocomplete */}
            <div className="flex items-center space-x-1 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Search stocks, crypto..."
                  className="pl-8 w-full h-8"
                />
                
                {/* Search Results Dropdown */}
                {showDropdown && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto min-w-[350px]">
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
                              <div className="font-medium text-sm">{result.symbol}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {result.name}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                              {result.type}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

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