import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, ChevronDown, Plus, Minus, AlertCircle, MousePointer, TrendingUpIcon, Square, ZoomIn, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedTradingChart } from "@/components/portfolio/widgets/AdvancedTradingChart";

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Order form state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<string>('limit');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(150.00);
  const [timeInForce, setTimeInForce] = useState<string>('day');
  const [tradingSession, setTradingSession] = useState<string>('regular');

  // Independent trade ticker state
  const [tradeSymbol, setTradeSymbol] = useState<string>('');
  const [tradePrice, setTradePrice] = useState<number>(0);

  // Chart controls
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1D');
  const [selectedInterval, setSelectedInterval] = useState<string>('1 minute');
  const [candlestickInterval, setCandlestickInterval] = useState<string>('5 minutes');
  const [chartMode, setChartMode] = useState<'cursor' | 'draw' | 'shape'>('cursor');
  const [chartZoomTrigger, setChartZoomTrigger] = useState(0);
  const [showIndicators, setShowIndicators] = useState(false);

  // Fetch real watchlist data from Yahoo Finance
  const { data: popularStocksResponse } = useQuery({
    queryKey: ["/api/popular"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const watchlistData = useMemo(() => {
    const stocks = (popularStocksResponse as any)?.data || [];
    return stocks.map((stock: any) => ({
      symbol: stock.symbol,
      netChange: stock.change || 0,
      changePercent: stock.percentChange || 0,
      lastPrice: stock.price || 0,
      volume: stock.volume || 0,
      avgVolume: stock.volume || 0,
    }));
  }, [popularStocksResponse]);

  // Tournament queries
  const { data: tournamentsResponse } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const userTournaments = (tournamentsResponse as any)?.data || [];
  const activeTournaments = userTournaments.filter((t: any) => t.status === 'active');

  // Tournament balance query
  const { data: tournamentBalance } = useQuery({
    queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    enabled: !!selectedTournament?.id,
  });

  // Fetch real quote for selected symbol
  const { data: selectedQuoteResponse } = useQuery({
    queryKey: ["/api/quote", selectedSymbol],
    enabled: !!selectedSymbol,
    refetchInterval: 15000,
  });

  // Update price state when quote data arrives
  useEffect(() => {
    const quoteData = (selectedQuoteResponse as any)?.data;
    if (quoteData) {
      setSelectedPrice(quoteData.price || 0);
      setPriceChange(quoteData.change || 0);
      setPriceChangePercent(quoteData.percentChange || 0);
    }
  }, [selectedQuoteResponse]);

  // Fetch quote for trade symbol (independent from chart symbol)
  const { data: tradeQuoteResponse } = useQuery({
    queryKey: ["/api/quote", tradeSymbol],
    enabled: !!tradeSymbol && tradeSymbol.length >= 1,
    refetchInterval: 15000,
  });

  // Update trade price when trade quote arrives
  useEffect(() => {
    const quoteData = (tradeQuoteResponse as any)?.data;
    if (quoteData) {
      setTradePrice(quoteData.price || 0);
    }
  }, [tradeQuoteResponse]);

  // Auto-select first tournament
  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(activeTournaments[0]);
    }
  }, [activeTournaments, selectedTournament]);

  const getCurrentBalance = (): number => {
    if (selectedTournament && tournamentBalance) {
      return (tournamentBalance as any)?.balance || (tournamentBalance as any)?.data?.balance || 0;
    }
    return 0;
  };

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTournament || !tradeSymbol) return;
      const price = tradePrice > 0 ? tradePrice : selectedPrice;
      return apiRequest("POST", `/api/tournaments/${selectedTournament.id}/purchase`, {
        symbol: tradeSymbol,
        companyName: tradeSymbol,
        shares: quantity,
        purchasePrice: price,
      });
    },
    onSuccess: () => {
      toast({ title: `Bought ${quantity} shares of ${tradeSymbol}` });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament?.id, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/tournament", selectedTournament?.id] });
      setQuantity(1);
    },
    onError: (error: any) => {
      toast({ title: "Buy failed", description: error.message, variant: "destructive" });
    },
  });

  // Sell mutation
  const sellMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTournament || !tradeSymbol) return;
      const price = tradePrice > 0 ? tradePrice : selectedPrice;
      return apiRequest("POST", `/api/tournaments/${selectedTournament.id}/sell`, {
        symbol: tradeSymbol,
        sharesToSell: quantity,
        currentPrice: price,
      });
    },
    onSuccess: () => {
      toast({ title: `Sold ${quantity} shares of ${tradeSymbol}` });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament?.id, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/tournament", selectedTournament?.id] });
      setQuantity(1);
    },
    onError: (error: any) => {
      toast({ title: "Sell failed", description: error.message, variant: "destructive" });
    },
  });

  const handleExecuteTrade = () => {
    if (orderSide === 'buy') {
      buyMutation.mutate();
    } else {
      sellMutation.mutate();
    }
  };

  const estimatedCost = quantity * (orderType === 'limit' ? limitPrice : (tradePrice > 0 ? tradePrice : selectedPrice));
  const buyingPower = getCurrentBalance();
  const hasEnoughFunds = estimatedCost <= buyingPower;

  const handleWatchlistClick = (item: any) => {
    setSelectedSymbol(item.symbol);
    setSelectedPrice(item.lastPrice);
    setPriceChange(item.netChange);
    setPriceChangePercent(item.changePercent);
    setLimitPrice(item.lastPrice);
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your trading dashboard.</p>
        </div>
      </div>
    );
  }

  if (activeTournaments.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#06121F' }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>No Active Tournaments</h3>
          <p className="mb-4" style={{ color: '#8A93A6' }}>
            Join or create a tournament to start trading
          </p>
          <Button asChild style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}>
            <a href="/tournaments">Browse Tournaments</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col [@media(min-aspect-ratio:1/1)]:flex-row" style={{ backgroundColor: '#06121F' }}>
      {/* Chart Area - Full width on portrait, flex-1 on landscape */}
      <div className="flex-1 flex flex-col p-2 [@media(min-aspect-ratio:1/1)]:p-4">
        {/* Single Horizontal Header Line: All Elements on Same Y-Axis - Responsive wrapping on portrait */}
        <div className="flex flex-wrap items-center gap-2 [@media(min-aspect-ratio:1/1)]:gap-3 mb-3 px-2 [@media(min-aspect-ratio:1/1)]:px-4 py-2 [@media(min-aspect-ratio:1/1)]:py-3 rounded-2xl" style={{
          backgroundColor: '#1E2D3F',
          border: '1px solid #2B3A4C',
        }}>
          {/* Ticker Symbol */}
          <h1 className="text-lg [@media(min-aspect-ratio:1/1)]:text-2xl font-bold tracking-tight" style={{ color: '#E3B341' }}>
            {selectedSymbol}
          </h1>

          {/* Current Price */}
          <span className="text-base [@media(min-aspect-ratio:1/1)]:text-xl font-semibold" style={{
            color: '#FFFFFF',
          }}>
            ${selectedPrice.toFixed(2)}
          </span>

          {/* Change and Percentage */}
          <span
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              color: priceChange >= 0 ? '#28C76F' : '#FF4F58',
              backgroundColor: priceChange >= 0 ? 'rgba(40, 199, 111, 0.15)' : 'rgba(255, 79, 88, 0.15)',
              border: `1px solid ${priceChange >= 0 ? 'rgba(40, 199, 111, 0.3)' : 'rgba(255, 79, 88, 0.3)'}`
            }}
          >
            {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </span>

          {/* Buy/Sell Toggle Pills */}
          <div className="flex gap-2 [@media(min-aspect-ratio:1/1)]:gap-3 [@media(min-aspect-ratio:1/1)]:ml-2">
            <motion.button
              onClick={() => setOrderSide('buy')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 [@media(min-aspect-ratio:1/1)]:h-9 px-3 [@media(min-aspect-ratio:1/1)]:px-4 text-xs [@media(min-aspect-ratio:1/1)]:text-sm rounded-xl font-semibold transition-all"
              style={orderSide === 'buy'
                ? {
                    backgroundColor: '#28C76F',
                    color: '#FFFFFF',
                    border: '2px solid #28C76F'
                  }
                : {
                    backgroundColor: '#0A1A2F',
                    color: '#8A93A6',
                    border: '2px solid #2B3A4C'
                  }
              }
            >
              Buy
            </motion.button>
            <motion.button
              onClick={() => setOrderSide('sell')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 [@media(min-aspect-ratio:1/1)]:h-9 px-3 [@media(min-aspect-ratio:1/1)]:px-4 text-xs [@media(min-aspect-ratio:1/1)]:text-sm rounded-xl font-semibold transition-all"
              style={orderSide === 'sell'
                ? {
                    backgroundColor: '#FF4F58',
                    color: '#FFFFFF',
                    border: '2px solid #FF4F58'
                  }
                : {
                    backgroundColor: '#0A1A2F',
                    color: '#8A93A6',
                    border: '2px solid #2B3A4C'
                  }
              }
            >
              Sell
            </motion.button>
          </div>

          {/* Chart Control Icons - Hidden on portrait screens */}
          <div className="hidden [@media(min-aspect-ratio:1/1)]:flex items-center gap-2">
            <motion.button
              onClick={() => {
                setChartMode('cursor');
                toast({ description: "Cursor tool activated" });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#142538] transition-all"
              style={{
                backgroundColor: chartMode === 'cursor' ? '#142538' : 'transparent',
                boxShadow: 'none'
              }}
              title="Cursor tool"
            >
              <MousePointer className="w-4 h-4" style={{ color: chartMode === 'cursor' ? '#FFFFFF' : '#8A93A6' }} />
            </motion.button>
            <motion.button
              onClick={() => {
                setChartMode('draw');
                toast({ description: "Draw tool activated - Feature coming soon" });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[#142538] transition-all"
              style={{
                backgroundColor: chartMode === 'draw' ? '#142538' : 'transparent',
                boxShadow: 'none'
              }}
              title="Draw tool"
            >
              <TrendingUpIcon className="w-3 h-3" style={{ color: chartMode === 'draw' ? '#FFFFFF' : '#8A93A6' }} />
            </motion.button>
            <motion.button
              onClick={() => {
                setChartMode('shape');
                toast({ description: "Shape tool activated - Feature coming soon" });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[#142538] transition-all"
              style={{
                backgroundColor: chartMode === 'shape' ? '#142538' : 'transparent',
                boxShadow: 'none'
              }}
              title="Shape tool"
            >
              <Square className="w-3 h-3" style={{ color: chartMode === 'shape' ? '#FFFFFF' : '#8A93A6' }} />
            </motion.button>
            <motion.button
              onClick={() => {
                setChartZoomTrigger(prev => prev + 1);
                toast({ description: "Zooming in..." });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[#142538] transition-all"
              style={{ backgroundColor: 'transparent' }}
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" style={{ color: '#8A93A6' }} />
            </motion.button>
            <motion.button
              onClick={() => {
                setShowIndicators(!showIndicators);
                toast({ description: showIndicators ? "Indicators hidden" : "Indicators visible" });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[#142538] transition-all"
              style={{
                backgroundColor: showIndicators ? '#142538' : 'transparent',
                boxShadow: 'none'
              }}
              title="Toggle indicators"
            >
              <BarChart3 className="w-3 h-3" style={{ color: showIndicators ? '#FFFFFF' : '#8A93A6' }} />
            </motion.button>
            <motion.button
              onClick={() => {
                toast({ description: "Settings - Feature coming soon" });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[#142538] transition-all"
              style={{ backgroundColor: 'transparent' }}
              title="Settings"
            >
              <SettingsIcon className="w-3 h-3" style={{ color: '#8A93A6' }} />
            </motion.button>
          </div>

          {/* Candlestick Interval Dropdown */}
          <Select value={candlestickInterval} onValueChange={setCandlestickInterval}>
            <SelectTrigger
              className="h-7 w-24 [@media(min-aspect-ratio:1/1)]:w-32 text-xs [@media(min-aspect-ratio:1/1)]:text-sm font-medium rounded-md"
              style={{
                backgroundColor: '#0A1A2F',
                border: '1px solid #2B3A4C',
                color: '#E3B341',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', border: '1px solid #2B3A4C' }}>
              <SelectItem value="1 tick" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 tick</SelectItem>
              <SelectItem value="144 ticks" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>144 ticks</SelectItem>
              <SelectItem value="1 second" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 second</SelectItem>
              <SelectItem value="5 seconds" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>5 seconds</SelectItem>
              <SelectItem value="30 seconds" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>30 seconds</SelectItem>
              <SelectItem value="1 minute" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 minute</SelectItem>
              <SelectItem value="5 minutes" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>5 minutes</SelectItem>
              <SelectItem value="10 minutes" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>10 minutes</SelectItem>
              <SelectItem value="30 minutes" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>30 minutes</SelectItem>
              <SelectItem value="1 hour" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 hour</SelectItem>
              <SelectItem value="3 hours" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>3 hours</SelectItem>
              <SelectItem value="12 hours" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>12 hours</SelectItem>
              <SelectItem value="1 day" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 day</SelectItem>
              <SelectItem value="1 week" className="text-xs hover:bg-[#142538]" style={{ color: '#C9D1E2' }}>1 week</SelectItem>
            </SelectContent>
          </Select>

          {/* Tournament Selector - Full width on portrait */}
          <Select value={selectedTournament?.id?.toString()} onValueChange={(value) => {
            const tournament = activeTournaments.find((t: any) => t.id.toString() === value);
            setSelectedTournament(tournament);
          }}>
            <SelectTrigger className="w-full [@media(min-aspect-ratio:1/1)]:w-56 h-10 rounded-xl text-xs [@media(min-aspect-ratio:1/1)]:text-sm font-semibold border-2" style={{
              backgroundColor: '#1A2838',
              borderColor: '#2B3A4C',
              color: '#E3B341'
            }}>
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
              {activeTournaments.map((tournament: any) => (
                <SelectItem
                  key={tournament.id}
                  value={tournament.id.toString()}
                  className="text-sm hover:bg-[#142538]"
                  style={{ color: '#C9D1E2' }}
                >
                  {tournament.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="flex-1 relative rounded-2xl overflow-hidden" style={{
          backgroundColor: '#1E2D3F',
          border: '1px solid #2B3A4C',
        }}>
          <AdvancedTradingChart
            selectedStock={selectedSymbol}
            tournamentId={selectedTournament?.id}
            candlestickInterval={candlestickInterval}
            zoomTrigger={chartZoomTrigger}
            showIndicators={showIndicators}
            timeRange={selectedTimeRange}
          />

          {/* Time Range Selector */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3">
            <div className="flex gap-1.5">
              {['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'All'].map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-5 px-1.5 text-[10px] font-medium rounded-md transition-all"
                  style={selectedTimeRange === range
                    ? {
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: '#8A93A6',
                        border: 'none'
                      }
                  }
                >
                  {range}
                </motion.button>
              ))}
            </div>

            {/* Interval Selector */}
            <div className="ml-2">
              <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                <SelectTrigger className="h-6 text-xs border-none" style={{ backgroundColor: '#2B3A4C', color: '#FFFFFF' }}>
                  <span className="text-xs">Interval: {selectedInterval}</span>
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C' }}>
                  <SelectItem value="1 tick" className="text-xs" style={{ color: '#FFFFFF' }}>1 tick</SelectItem>
                  <SelectItem value="144 ticks" className="text-xs" style={{ color: '#FFFFFF' }}>144 ticks</SelectItem>
                  <SelectItem value="1 second" className="text-xs" style={{ color: '#FFFFFF' }}>1 second</SelectItem>
                  <SelectItem value="30 seconds" className="text-xs" style={{ color: '#FFFFFF' }}>30 seconds</SelectItem>
                  <SelectItem value="1 minute" className="text-xs" style={{ color: '#FFFFFF' }}>1 minute</SelectItem>
                  <SelectItem value="5 minutes" className="text-xs" style={{ color: '#FFFFFF' }}>5 minutes</SelectItem>
                  <SelectItem value="15 minutes" className="text-xs" style={{ color: '#FFFFFF' }}>15 minutes</SelectItem>
                  <SelectItem value="30 minutes" className="text-xs" style={{ color: '#FFFFFF' }}>30 minutes</SelectItem>
                  <SelectItem value="1 hour" className="text-xs" style={{ color: '#FFFFFF' }}>1 hour</SelectItem>
                  <SelectItem value="4 hours" className="text-xs" style={{ color: '#FFFFFF' }}>4 hours</SelectItem>
                  <SelectItem value="1 day" className="text-xs" style={{ color: '#FFFFFF' }}>1 day</SelectItem>
                  <SelectItem value="1 week" className="text-xs" style={{ color: '#FFFFFF' }}>1 week</SelectItem>
                  <SelectItem value="Custom" className="text-xs" style={{ color: '#FFFFFF' }}>Custom interval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Watchlist + Order Panel - Full width on portrait, stacked vertically */}
      <div className="w-full [@media(min-aspect-ratio:1/1)]:w-96 flex flex-col" style={{
        backgroundColor: '#1E2D3F',
        borderLeft: '1px solid #2B3A4C',
      }}>
        {/* TOP HALF: Watchlist Section - Smaller max height on portrait */}
        <div className="h-auto max-h-64 [@media(min-aspect-ratio:1/1)]:h-1/2 flex flex-col overflow-y-auto" style={{ borderBottom: '1px solid #2B3A4C' }}>
          <div className="px-3 py-3 border-b flex items-center justify-between sticky top-0 z-10" style={{
            borderColor: '#2B3A4C',
            backgroundColor: '#1E2D3F',
          }}>
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5" style={{ color: '#E3B341' }}>
              <span className="text-sm">📊</span>
              WATCHLIST
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
              backgroundColor: 'rgba(227, 179, 65, 0.15)',
              color: '#E3B341',
              border: '1px solid rgba(227, 179, 65, 0.3)',
            }}>
              {watchlistData.length}
            </span>
          </div>

          {/* Watchlist Table */}
          <div className="flex-1">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-1.5 px-2 py-1.5 text-[10px] font-medium border-b sticky top-[52px] z-10" style={{
              color: '#8A93A6',
              borderColor: '#142538',
              backgroundColor: '#1E2D3F'
            }}>
              <span className="col-span-1">Symbol</span>
              <span className="col-span-1 text-right">Change</span>
              <span className="col-span-1 text-right">%</span>
              <span className="col-span-1 text-right">Last</span>
              <span className="col-span-1 text-right">Vol</span>
              <span className="col-span-1 text-right">Avg</span>
            </div>

            {/* Table Rows */}
            {watchlistData.map((item) => (
              <motion.button
                key={item.symbol}
                onClick={() => handleWatchlistClick(item)}
                className="w-full grid grid-cols-6 gap-1.5 px-2 py-2 text-[10px] transition-all hover:bg-[#142538]"
                style={{
                  backgroundColor: selectedSymbol === item.symbol ? '#142538' : 'transparent',
                  borderBottom: '1px solid #2B3A4C',
                  borderLeft: selectedSymbol === item.symbol ? '2px solid #10B981' : '2px solid transparent',
                }}
              >
                <span className="col-span-1 font-bold text-left" style={{
                  color: selectedSymbol === item.symbol ? '#E3B341' : '#FFFFFF'
                }}>{item.symbol}</span>
                <span className="col-span-1 text-right font-semibold" style={{ color: item.netChange >= 0 ? '#28C76F' : '#FF4F58' }}>
                  {item.netChange >= 0 ? '+' : ''}{item.netChange.toFixed(2)}
                </span>
                <span className="col-span-1 text-right font-semibold" style={{ color: item.changePercent >= 0 ? '#28C76F' : '#FF4F58' }}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
                <span className="col-span-1 text-right font-medium" style={{ color: '#C9D1E2' }}>\${item.lastPrice.toFixed(2)}</span>
                <span className="col-span-1 text-right" style={{ color: '#8A93A6' }}>{(item.volume / 1000000).toFixed(1)}M</span>
                <span className="col-span-1 text-right" style={{ color: '#8A93A6' }}>{(item.avgVolume / 1000000).toFixed(1)}M</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* BOTTOM HALF: Trade Execution Panel - Auto height on portrait */}
        <div className="h-auto [@media(min-aspect-ratio:1/1)]:h-1/2 flex flex-col overflow-y-auto">
          {/* Trade Execution Header */}
          <div className="px-3 py-3 border-b flex items-center justify-between sticky top-0 z-10" style={{
            borderColor: '#2B3A4C',
            backgroundColor: '#1E2D3F',
          }}>
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5" style={{ color: '#10B981' }}>
              <span className="text-sm">💰</span>
              TRADE EXECUTION
            </h3>
          </div>

          <div className="p-2 space-y-2">
            {/* Account Deficit Warning (conditional) */}
            {!hasEnoughFunds && orderType !== 'limit' && quantity > 0 && (
              <div className="p-2 rounded text-xs" style={{ backgroundColor: '#2A1A1A', color: '#FF4F58', border: '1px solid #FF4F58' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Your individual account is currently restricted because you have an account deficit. Some actions may not be available right now.</span>
                </div>
              </div>
            )}

            {/* Stock Symbol Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium" style={{ color: '#8A93A6' }}>Stock Symbol</label>
              <Input
                type="text"
                placeholder="Enter ticker (e.g., AAPL)"
                value={tradeSymbol}
                onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                className="h-7 text-sm uppercase"
                style={{
                  backgroundColor: '#142538',
                  border: `1px solid ${tradeSymbol ? '#E3B341' : '#2B3A4C'}`,
                  color: '#FFFFFF',
                }}
              />
              {tradeSymbol && (
                <div className="text-[10px] font-medium" style={{ color: '#E3B341' }}>
                  Ready to trade {tradeSymbol}
                </div>
              )}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-3">
              <Button
                onClick={() => setOrderSide('buy')}
                className="flex-1 h-7 text-sm font-medium"
                style={orderSide === 'buy'
                  ? { backgroundColor: '#28C76F', color: '#000000', border: 'none' }
                  : { backgroundColor: '#0A1A2F', color: '#8A93A6', border: '1px solid #2B3A4C' }
                }
              >
                Buy
              </Button>
              <Button
                onClick={() => setOrderSide('sell')}
                className="flex-1 h-7 text-sm font-medium"
                style={orderSide === 'sell'
                  ? { backgroundColor: '#FF4F58', color: '#FFFFFF', border: 'none' }
                  : { backgroundColor: '#0A1A2F', color: '#8A93A6', border: '1px solid #2B3A4C' }
                }
              >
                Sell
              </Button>
            </div>

            {/* Order Type */}
            <div className="space-y-1">
              <label className="text-[10px]" style={{ color: '#8A93A6' }}>Order type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="h-7 text-sm" style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C' }}>
                  <SelectItem value="market" className="text-xs" style={{ color: '#FFFFFF' }}>Market</SelectItem>
                  <SelectItem value="limit" className="text-xs" style={{ color: '#FFFFFF' }}>Limit</SelectItem>
                  <SelectItem value="stop" className="text-xs" style={{ color: '#FFFFFF' }}>Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A93A6' }}>Quantity</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs flex-1"
                  style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                />
                <Button
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {!hasEnoughFunds && quantity > 0 && (
                <p className="text-xs mt-1" style={{ color: '#FF4F58' }}>
                  You don't have enough buying power to place this order. <a href="#" className="underline">Deposit funds</a>.
                </p>
              )}
            </div>

            {/* Limit Price (conditional) */}
            {orderType === 'limit' && (
              <div className="space-y-1">
                <label className="text-xs" style={{ color: '#8A93A6' }}>Limit price</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs flex-1"
                    style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                  />
                  <Button
                    size="sm"
                    onClick={() => setLimitPrice(Math.max(0.01, limitPrice - 0.01))}
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLimitPrice(limitPrice + 0.01)}
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8A93A6' }}>
                  <span>Bid \${(tradePrice > 0 ? tradePrice : selectedPrice - 0.05).toFixed(2)}</span>
                  <span>Ask \${(tradePrice > 0 ? tradePrice : selectedPrice + 0.05).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Time in Force */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A93A6' }}>Time in force</label>
              <Select value={timeInForce} onValueChange={setTimeInForce}>
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C' }}>
                  <SelectItem value="day" className="text-xs" style={{ color: '#FFFFFF' }}>Good for day</SelectItem>
                  <SelectItem value="gtc" className="text-xs" style={{ color: '#FFFFFF' }}>Good til canceled</SelectItem>
                  <SelectItem value="ioc" className="text-xs" style={{ color: '#FFFFFF' }}>Immediate or cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trading Session */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A93A6' }}>Trading session</label>
              <Select value={tradingSession} onValueChange={setTradingSession}>
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0A1A2F', borderColor: '#2B3A4C' }}>
                  <SelectItem value="regular" className="text-xs" style={{ color: '#FFFFFF' }}>Regular market hours</SelectItem>
                  <SelectItem value="extended" className="text-xs" style={{ color: '#FFFFFF' }}>Extended hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Cost */}
            <div className="pt-2 space-y-1 border-t" style={{ borderColor: '#142538' }}>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#8A93A6' }}>Estimated cost</span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>\${estimatedCost.toFixed(2)}</span>
              </div>
              {!hasEnoughFunds && quantity > 0 && (
                <div className="text-xs" style={{ color: '#FF4F58' }}>Account deficit</div>
              )}
            </div>

            {/* Quote Line */}
            <div className="text-xs" style={{ color: '#8A93A6' }}>
              Bid \${(tradePrice > 0 ? tradePrice : selectedPrice - 0.05).toFixed(2)} · Mid \${(tradePrice > 0 ? tradePrice : selectedPrice).toFixed(2)} · Ask \${(tradePrice > 0 ? tradePrice : selectedPrice + 0.05).toFixed(2)} · Last \${(tradePrice > 0 ? tradePrice : selectedPrice).toFixed(2)} · updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} · NYSE
            </div>

            {/* Action Buttons - Touch-friendly on portrait (44px minimum) */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 h-12 [@media(min-aspect-ratio:1/1)]:h-9 text-sm [@media(min-aspect-ratio:1/1)]:text-xs font-medium"
                style={{ backgroundColor: '#0A1A2F', color: '#FFFFFF', border: '1px solid #2B3A4C' }}
              >
                Cancel
              </Button>
              <Button
                disabled={!hasEnoughFunds || quantity <= 0 || !tradeSymbol || buyMutation.isPending || sellMutation.isPending}
                onClick={handleExecuteTrade}
                className="flex-1 h-12 [@media(min-aspect-ratio:1/1)]:h-9 text-sm [@media(min-aspect-ratio:1/1)]:text-xs font-medium disabled:opacity-50"
                style={{
                  backgroundColor: orderSide === 'buy' ? '#28C76F' : '#FF4F58',
                  color: orderSide === 'buy' ? '#000000' : '#FFFFFF',
                  border: 'none'
                }}
              >
                {(buyMutation.isPending || sellMutation.isPending) ? 'Executing...' : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${tradeSymbol || '...'}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
