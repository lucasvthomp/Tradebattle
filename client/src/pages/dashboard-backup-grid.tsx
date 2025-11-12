import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, ChevronDown, Plus, Minus, AlertCircle } from "lucide-react";
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
  const [selectedPrice, setSelectedPrice] = useState<number>(150.00);
  const [priceChange, setPriceChange] = useState<number>(2.50);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(1.69);

  // OHLCV data
  const [ohlcv, setOhlcv] = useState({ open: 148.50, high: 151.20, low: 147.80, close: 150.00, volume: 12500000 });

  // Order form state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<string>('limit');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(150.00);
  const [timeInForce, setTimeInForce] = useState<string>('day');
  const [tradingSession, setTradingSession] = useState<string>('regular');

  // Chart controls
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1D');
  const [selectedInterval, setSelectedInterval] = useState<string>('1 minute');

  // Watchlist data (mock for now)
  const watchlistData = [
    { symbol: 'AAPL', netChange: 2.50, changePercent: 1.69, lastPrice: 150.00, volume: 12500000, avgVolume: 15000000 },
    { symbol: 'MSFT', netChange: -1.20, changePercent: -0.35, lastPrice: 340.50, volume: 8200000, avgVolume: 9000000 },
    { symbol: 'GOOGL', netChange: 5.80, changePercent: 4.12, lastPrice: 146.30, volume: 6500000, avgVolume: 7000000 },
    { symbol: 'TSLA', netChange: -3.40, changePercent: -1.58, lastPrice: 212.10, volume: 25000000, avgVolume: 22000000 },
    { symbol: 'NVDA', netChange: 12.60, changePercent: 2.94, lastPrice: 441.20, volume: 18000000, avgVolume: 16000000 },
  ];

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

  const estimatedCost = quantity * (orderType === 'limit' ? limitPrice : selectedPrice);
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
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>No Active Tournaments</h3>
          <p className="mb-4" style={{ color: '#8A8A8A' }}>
            Join or create a tournament to start trading
          </p>
          <Button asChild style={{ backgroundColor: '#5AC53A', color: '#000000' }}>
            <a href="/tournaments">Browse Tournaments</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex" style={{ backgroundColor: '#000000' }}>
      {/* LEFT SIDE: Chart Area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header Line: Symbol, Price, Change */}
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
            {selectedSymbol}
          </h1>
          <span className="text-xl font-medium" style={{ color: '#FFFFFF' }}>
            ${selectedPrice.toFixed(2)}
          </span>
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: priceChange >= 0 ? '#5AC53A' : '#EB5D2A' }}
          >
            {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Second Line: Buy/Sell Toggle + OHLCV */}
        <div className="flex items-center gap-4 mb-3">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => setOrderSide('buy')}
              className="h-7 px-3 text-xs font-medium"
              style={orderSide === 'buy'
                ? { backgroundColor: '#5AC53A', color: '#000000', border: 'none' }
                : { backgroundColor: 'transparent', color: '#8A8A8A', border: '1px solid #2A2A2A' }
              }
            >
              Buy
            </Button>
            <Button
              size="sm"
              onClick={() => setOrderSide('sell')}
              className="h-7 px-3 text-xs font-medium"
              style={orderSide === 'sell'
                ? { backgroundColor: '#EB5D2A', color: '#FFFFFF', border: 'none' }
                : { backgroundColor: 'transparent', color: '#8A8A8A', border: '1px solid #2A2A2A' }
              }
            >
              Sell
            </Button>
          </div>

          {/* OHLCV Stats */}
          <div className="flex items-center gap-3 text-xs" style={{ color: '#8A8A8A' }}>
            <span>O <span style={{ color: '#FFFFFF' }}>{ohlcv.open.toFixed(2)}</span></span>
            <span>H <span style={{ color: '#FFFFFF' }}>{ohlcv.high.toFixed(2)}</span></span>
            <span>L <span style={{ color: '#FFFFFF' }}>{ohlcv.low.toFixed(2)}</span></span>
            <span>C <span style={{ color: '#FFFFFF' }}>{ohlcv.close.toFixed(2)}</span></span>
            <span>V <span style={{ color: '#FFFFFF' }}>{(ohlcv.volume / 1000000).toFixed(2)}M</span></span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 relative" style={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A' }}>
          <AdvancedTradingChart
            selectedStock={selectedSymbol}
            tournamentId={selectedTournament?.id}
          />

          {/* Time Range Selector */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="flex gap-1">
              {['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'All'].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="h-6 px-2 text-xs"
                  style={selectedTimeRange === range
                    ? { backgroundColor: '#2A2A2A', color: '#FFFFFF', border: 'none' }
                    : { backgroundColor: 'transparent', color: '#8A8A8A', border: 'none' }
                  }
                >
                  {range}
                </Button>
              ))}
            </div>

            {/* Interval Selector */}
            <div className="ml-2">
              <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                <SelectTrigger className="h-6 text-xs border-none" style={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}>
                  <span className="text-xs">Interval: {selectedInterval}</span>
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
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

      {/* RIGHT SIDE: Watchlist + Order Panel */}
      <div className="w-80 flex flex-col" style={{ backgroundColor: '#0A0A0A', borderLeft: '1px solid #1A1A1A' }}>
        {/* Watchlist/Holdings Section */}
        <div className="border-b" style={{ borderColor: '#1A1A1A' }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: '#1A1A1A' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Watchlist</h3>
          </div>

          {/* Watchlist Table */}
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-1 px-3 py-2 text-xs font-medium border-b" style={{ color: '#8A8A8A', borderColor: '#1A1A1A' }}>
              <span className="col-span-1">Symbol</span>
              <span className="col-span-1 text-right">Change</span>
              <span className="col-span-1 text-right">%</span>
              <span className="col-span-1 text-right">Last</span>
              <span className="col-span-1 text-right">Vol</span>
              <span className="col-span-1 text-right">Avg</span>
            </div>

            {/* Table Rows */}
            {watchlistData.map((item) => (
              <button
                key={item.symbol}
                onClick={() => handleWatchlistClick(item)}
                className="w-full grid grid-cols-6 gap-1 px-3 py-2 text-xs hover:bg-opacity-50 transition-colors"
                style={{
                  backgroundColor: selectedSymbol === item.symbol ? '#1A1A1A' : 'transparent',
                  borderBottom: '1px solid #1A1A1A'
                }}
              >
                <span className="col-span-1 font-medium text-left" style={{ color: '#FFFFFF' }}>{item.symbol}</span>
                <span className="col-span-1 text-right" style={{ color: item.netChange >= 0 ? '#5AC53A' : '#EB5D2A' }}>
                  {item.netChange >= 0 ? '+' : ''}{item.netChange.toFixed(2)}
                </span>
                <span className="col-span-1 text-right" style={{ color: item.changePercent >= 0 ? '#5AC53A' : '#EB5D2A' }}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
                <span className="col-span-1 text-right" style={{ color: '#FFFFFF' }}>${item.lastPrice.toFixed(2)}</span>
                <span className="col-span-1 text-right" style={{ color: '#8A8A8A' }}>{(item.volume / 1000000).toFixed(1)}M</span>
                <span className="col-span-1 text-right" style={{ color: '#8A8A8A' }}>{(item.avgVolume / 1000000).toFixed(1)}M</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Execution Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Account Deficit Warning (conditional) */}
            {!hasEnoughFunds && orderType !== 'limit' && quantity > 0 && (
              <div className="p-2 rounded text-xs" style={{ backgroundColor: '#2A1A1A', color: '#EB5D2A', border: '1px solid #EB5D2A' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Your individual account is currently restricted because you have an account deficit. Some actions may not be available right now.</span>
                </div>
              </div>
            )}

            {/* Symbol + Price */}
            <div className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {selectedSymbol} ${selectedPrice.toFixed(2)}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-1">
              <Button
                onClick={() => setOrderSide('buy')}
                className="flex-1 h-8 text-xs font-medium"
                style={orderSide === 'buy'
                  ? { backgroundColor: '#5AC53A', color: '#000000', border: 'none' }
                  : { backgroundColor: '#1A1A1A', color: '#8A8A8A', border: '1px solid #2A2A2A' }
                }
              >
                Buy
              </Button>
              <Button
                onClick={() => setOrderSide('sell')}
                className="flex-1 h-8 text-xs font-medium"
                style={orderSide === 'sell'
                  ? { backgroundColor: '#EB5D2A', color: '#FFFFFF', border: 'none' }
                  : { backgroundColor: '#1A1A1A', color: '#8A8A8A', border: '1px solid #2A2A2A' }
                }
              >
                Sell
              </Button>
            </div>

            {/* Order Type */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A8A8A' }}>Order type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                  <SelectItem value="market" className="text-xs" style={{ color: '#FFFFFF' }}>Market</SelectItem>
                  <SelectItem value="limit" className="text-xs" style={{ color: '#FFFFFF' }}>Limit</SelectItem>
                  <SelectItem value="stop" className="text-xs" style={{ color: '#FFFFFF' }}>Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A8A8A' }}>Quantity</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs flex-1"
                  style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                />
                <Button
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {!hasEnoughFunds && quantity > 0 && (
                <p className="text-xs mt-1" style={{ color: '#EB5D2A' }}>
                  You don't have enough buying power to place this order. <a href="#" className="underline">Deposit funds</a>.
                </p>
              )}
            </div>

            {/* Limit Price (conditional) */}
            {orderType === 'limit' && (
              <div className="space-y-1">
                <label className="text-xs" style={{ color: '#8A8A8A' }}>Limit price</label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs flex-1"
                    style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                  />
                  <Button
                    size="sm"
                    onClick={() => setLimitPrice(Math.max(0.01, limitPrice - 0.01))}
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLimitPrice(limitPrice + 0.01)}
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8A8A8A' }}>
                  <span>Bid ${(selectedPrice - 0.05).toFixed(2)}</span>
                  <span>Ask ${(selectedPrice + 0.05).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Time in Force */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A8A8A' }}>Time in force</label>
              <Select value={timeInForce} onValueChange={setTimeInForce}>
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                  <SelectItem value="day" className="text-xs" style={{ color: '#FFFFFF' }}>Good for day</SelectItem>
                  <SelectItem value="gtc" className="text-xs" style={{ color: '#FFFFFF' }}>Good til canceled</SelectItem>
                  <SelectItem value="ioc" className="text-xs" style={{ color: '#FFFFFF' }}>Immediate or cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trading Session */}
            <div className="space-y-1">
              <label className="text-xs" style={{ color: '#8A8A8A' }}>Trading session</label>
              <Select value={tradingSession} onValueChange={setTradingSession}>
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                  <SelectItem value="regular" className="text-xs" style={{ color: '#FFFFFF' }}>Regular market hours</SelectItem>
                  <SelectItem value="extended" className="text-xs" style={{ color: '#FFFFFF' }}>Extended hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Cost */}
            <div className="pt-2 space-y-1 border-t" style={{ borderColor: '#1A1A1A' }}>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#8A8A8A' }}>Estimated cost</span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>${estimatedCost.toFixed(2)}</span>
              </div>
              {!hasEnoughFunds && quantity > 0 && (
                <div className="text-xs" style={{ color: '#EB5D2A' }}>Account deficit</div>
              )}
            </div>

            {/* Quote Line */}
            <div className="text-xs" style={{ color: '#8A8A8A' }}>
              Bid ${(selectedPrice - 0.05).toFixed(2)} · Mid ${selectedPrice.toFixed(2)} · Ask ${(selectedPrice + 0.05).toFixed(2)} · Last ${selectedPrice.toFixed(2)} · updated 11:59 AM · NYSE
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 h-9 text-xs font-medium"
                style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', border: '1px solid #2A2A2A' }}
              >
                Cancel
              </Button>
              <Button
                disabled={!hasEnoughFunds || quantity <= 0}
                className="flex-1 h-9 text-xs font-medium disabled:opacity-50"
                style={{
                  backgroundColor: orderSide === 'buy' ? '#5AC53A' : '#EB5D2A',
                  color: orderSide === 'buy' ? '#000000' : '#FFFFFF',
                  border: 'none'
                }}
              >
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
