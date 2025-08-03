import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WatchlistItem, StockPurchase, Tournament } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  Plus, 
  X,
  Star,
  StarOff,
  Eye,
  BarChart3,
  LineChart,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Bell,
  Settings,
  Download,
  Building,
  Trophy,
  Lock,
  Globe,
  Users,
  ChevronUp,
  ChevronDown,
  FileText,
  ArrowUpDown,
  Target,
  ShoppingCart,
  Coins
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketStatusDisclaimer } from "@/components/MarketStatusDisclaimer";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PortfolioSummaryWidget } from "@/components/portfolio/widgets/PortfolioSummaryWidget";
import { StockSearchBar } from "@/components/trading/StockSearchBar";
import { TournamentPerformanceChart } from "@/components/portfolio/widgets/TournamentPerformanceChart";
import { TournamentLeaderboard } from "@/components/tournaments/TournamentLeaderboard";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState("personal"); // personal or tournament
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedChartStock, setSelectedChartStock] = useState<string | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [buyShares, setBuyShares] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);

  // Watchlist specific state
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [watchlistStockData, setWatchlistStockData] = useState<{[key: string]: any}>({});

  // Portfolio queries
  const { data: personalPortfolio = [], isLoading: personalLoading, refetch: refetchPersonal } = useQuery({
    queryKey: ["/api/portfolio/personal"],
    enabled: !!user && activeTab === "personal",
  });

  // Tournament queries
  const { data: tournamentsResponse, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const userTournaments = (tournamentsResponse as any)?.data || [];
  const activeTournaments = userTournaments.filter((t: any) => t.status === 'active');

  // Tournament portfolio query
  const { data: tournamentPortfolio = [], isLoading: tournamentLoading, refetch: refetchTournament } = useQuery({
    queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    enabled: !!user && !!selectedTournament?.id && activeTab === "tournament",
  });

  // Tournament balance query
  const { data: tournamentBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    enabled: !!selectedTournament?.id && activeTab === "tournament",
  });

  // Watchlist query
  const { data: watchlist = [], isLoading: watchlistLoading, refetch: refetchWatchlist } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  // Popular stocks query
  const { data: popularStocksData, isLoading: popularStocksLoading } = useQuery({
    queryKey: ["/api/popular"],
    enabled: !!user,
  });

  // Auto-select first tournament when switching to tournament tab
  useEffect(() => {
    if (activeTab === "tournament" && activeTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(activeTournaments[0]);
    }
  }, [activeTab, activeTournaments, selectedTournament]);

  // Buy stock mutation
  const buyStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; companyName: string; shares: number; purchasePrice: number; tournamentId?: number }) => {
      if (data.tournamentId) {
        // Use the correct tournament endpoint
        return apiRequest("POST", `/api/tournaments/${data.tournamentId}/purchase`, {
          symbol: data.symbol,
          companyName: data.companyName,
          shares: data.shares,
          purchasePrice: data.purchasePrice
        });
      } else {
        // Personal portfolio endpoint
        return apiRequest("POST", "/api/personal-portfolio/purchase", {
          symbol: data.symbol,
          companyName: data.companyName,
          shares: data.shares,
          purchasePrice: data.purchasePrice
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Stock purchased successfully!" });
      setBuyDialogOpen(false);
      setBuyShares("");
      setSelectedStock(null);
      if (activeTab === "personal") {
        refetchPersonal();
      } else if (selectedTournament) {
        refetchTournament();
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament.id, "balance"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Unable to purchase stock",
        variant: "destructive",
      });
    },
  });

  // Sell stock mutation
  const sellStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; sharesToSell: number; currentPrice: number; tournamentId?: number }) => {
      const endpoint = data.tournamentId 
        ? `/api/tournaments/${data.tournamentId}/sell` 
        : "/api/personal-portfolio/sell";

      const payload = data.tournamentId 
        ? { symbol: data.symbol, sharesToSell: data.sharesToSell, currentPrice: data.currentPrice }
        : { symbol: data.symbol, sharesToSell: data.sharesToSell, currentPrice: data.currentPrice };

      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: () => {
      toast({ title: "Stock sold successfully!" });
      setSellDialogOpen(false);
      setSellAmount("");
      setSelectedSellStock(null);
      if (activeTab === "personal") {
        refetchPersonal();
      } else if (selectedTournament) {
        refetchTournament();
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament.id, "balance"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sale failed",
        description: error.message || "Unable to sell stock",
        variant: "destructive",
      });
    },
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: (stock: any) => 
      apiRequest("POST", "/api/watchlist", {
        symbol: stock.symbol,
        companyName: stock.shortName || stock.longName || stock.symbol,
      }),
    onSuccess: () => {
      toast({ title: "Added to watchlist!" });
      refetchWatchlist();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/watchlist/${id}`),
    onSuccess: () => {
      toast({ title: "Removed from watchlist!" });
      refetchWatchlist();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove from watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCurrentBalance = (): number => {
    if (activeTab === "personal") {
      return Number(user?.balance) || 0;
    } else if (selectedTournament && tournamentBalance) {
      return (tournamentBalance as any)?.balance || 0;
    }
    return 0;
  };

  const getCurrentPortfolio = (): any[] => {
    const personal = Array.isArray(personalPortfolio) ? personalPortfolio : [];
    // Handle API response structure for tournament portfolio
    const tournamentData = (tournamentPortfolio as any)?.data || tournamentPortfolio;
    const tournament = Array.isArray(tournamentData) ? tournamentData : [];
    return activeTab === "personal" ? personal : tournament;
  };

  const isPortfolioLoading = (): boolean => {
    return activeTab === "personal" ? personalLoading : tournamentLoading;
  };

  // Fetch real-time data for watchlist stocks with timeframe support
  useEffect(() => {
    if (watchlist.length > 0) {
      const fetchWatchlistData = async () => {
        const stockData: {[key: string]: any} = {};

        for (const stock of watchlist) {
          try {
            // Fetch current quote data first
            const quoteResponse = await apiRequest("GET", `/api/quote/${stock.symbol}`);
            const quoteData = await quoteResponse.json();

            const currentPrice = quoteData.data?.price || quoteData.data?.regularMarketPrice || 0;
            const marketCap = quoteData.data?.marketCap || 0;
            const volume = quoteData.data?.volume || quoteData.data?.regularMarketVolume || 0;

            // For 1D timeframe, use the daily change from quote data
            if (selectedTimeframe === '1D') {
              const changeAmount = quoteData.data?.change || quoteData.data?.regularMarketChange || 0;
              const previousClose = quoteData.data?.previousClose || (currentPrice - changeAmount);
              // Calculate percentage change manually if not provided
              let changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
              if (changePercent === 0 && previousClose > 0) {
                changePercent = (changeAmount / previousClose) * 100;
              }

              stockData[stock.symbol] = {
                ...quoteData.data,
                price: currentPrice,
                change: changeAmount,
                changePercent: changePercent,
                marketCap: marketCap,
                volume: volume,
                previousClose: previousClose // Use actual previous close from Yahoo Finance
              };
            } else {
              // For other timeframes, fetch historical data with proper error handling
              try {
                const historicalResponse = await fetch(`/api/historical/${stock.symbol}/${selectedTimeframe}`);

                // Check if response is ok and content type is JSON
                if (!historicalResponse.ok) {
                  throw new Error(`HTTP ${historicalResponse.status}`);
                }

                const contentType = historicalResponse.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  throw new Error('Response is not JSON');
                }

                const historicalData = await historicalResponse.json();

                let changeAmount = 0;
                let changePercent = 0;

                if (historicalData.success && historicalData.data && historicalData.data.length > 0) {
                  // Get the earliest price in the historical data (starting point for the timeframe)
                  // Use the FIRST data point (oldest) instead of last (newest) for proper timeframe comparison
                  const historicalPrice = historicalData.data[0].close;
                  changeAmount = currentPrice - historicalPrice;
                  changePercent = historicalPrice > 0 ? ((changeAmount / historicalPrice) * 100) : 0;

                  stockData[stock.symbol] = {
                    ...quoteData.data,
                    price: currentPrice,
                    change: changeAmount,
                    changePercent: changePercent,
                    marketCap: marketCap,
                    volume: volume,
                    previousClose: historicalPrice // This is the price at the timeframe start
                  };
                } else {
                  // Fallback to daily change
                  changeAmount = quoteData.data?.change || quoteData.data?.regularMarketChange || 0;
                  changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
                  const fallbackPreviousClose = quoteData.data?.previousClose || (currentPrice - changeAmount);

                  stockData[stock.symbol] = {
                    ...quoteData.data,
                    price: currentPrice,
                    change: changeAmount,
                    changePercent: changePercent,
                    marketCap: marketCap,
                    volume: volume,
                    previousClose: fallbackPreviousClose // Use actual previous close or calculate
                  };
                }
              } catch (histError) {
                console.error(`Historical data error for ${stock.symbol}:`, histError);
                // If historical data fails, use daily change as fallback
                const changeAmount = quoteData.data?.change || quoteData.data?.regularMarketChange || 0;
                const changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;

                stockData[stock.symbol] = {
                  ...quoteData.data,
                  price: currentPrice,
                  change: changeAmount,
                  changePercent: changePercent,
                  marketCap: marketCap,
                  volume: volume,
                  previousClose: currentPrice - changeAmount // Calculate from current price and change
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching data for ${stock.symbol}:`, error);
            stockData[stock.symbol] = null;
          }
        }

        setWatchlistStockData(stockData);
      };

      fetchWatchlistData();

      // Refresh data every 30 seconds
      const interval = setInterval(fetchWatchlistData, 30000);
      return () => clearInterval(interval);
    }
  }, [watchlist, selectedTimeframe]);

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your trading dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <MarketStatusDisclaimer />

      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Trading Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatCurrency(getCurrentBalance())}
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Personal Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="tournament" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Tournament Trading</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Portfolio Tab */}
            <TabsContent value="personal">
              <div className="space-y-4">
                {/* Portfolio Overview Bar */}
                <PortfolioSummaryWidget />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Trading Area - 2/3 width */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Portfolio Grid */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Your Holdings & Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PortfolioGrid selectedChartStock={selectedChartStock} onSelectStock={setSelectedChartStock} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar - 1/3 width */}
                  <div className="space-y-4">
                  {/* Watchlist Search */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Add to Watchlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StockSearchBar type="watchlist" placeholder="Search stocks to watch..." />
                    </CardContent>
                  </Card>

                  {/* Watchlist */}
                  <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Star className="w-4 h-4" />
                          <span>Watchlist</span>
                        </CardTitle>
                      <div className="flex items-center space-x-1">
                        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1D">1D</SelectItem>
                            <SelectItem value="5D">5D</SelectItem>
                            <SelectItem value="1M">1M</SelectItem>
                            <SelectItem value="3M">3M</SelectItem>
                            <SelectItem value="6M">6M</SelectItem>
                            <SelectItem value="1Y">1Y</SelectItem>
                            <SelectItem value="YTD">YTD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => {
                            // Manual refresh watchlist data
                            if (watchlist.length > 0) {
                              const fetchWatchlistData = async () => {
                                const stockData: {[key: string]: any} = {};
                                for (const stock of watchlist) {
                                  try {
                                    const quoteResponse = await apiRequest("GET", `/api/quote/${stock.symbol}`);
                                    const quoteData = await quoteResponse.json();
                                    const currentPrice = quoteData.data?.price || quoteData.data?.regularMarketPrice || 0;
                                    const changeAmount = quoteData.data?.change || quoteData.data?.regularMarketChange || 0;
                                    const changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
                                    stockData[stock.symbol] = {
                                      ...quoteData.data,
                                      price: currentPrice,
                                      change: changeAmount,
                                      changePercent: changePercent,
                                    };
                                  } catch (error) {
                                    console.error(`Error refreshing ${stock.symbol}:`, error);
                                    stockData[stock.symbol] = null;
                                  }
                                }
                                setWatchlistStockData(stockData);
                              };
                              fetchWatchlistData();
                            }
                          }}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    {/* Watchlist Content */}
                    {watchlistLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : watchlist.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-semibold mb-2">No watchlist items</h3>
                        <p className="text-xs text-muted-foreground">
                          Add stocks to monitor
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {watchlist.map((stock) => {
                          const stockData = watchlistStockData[stock.symbol];

                          if (!stockData) {
                            return (
                              <div
                                key={stock.id}
                                className="p-3 border rounded hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {stock.companyName}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
                                    Loading...
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          const currentPrice = stockData.price || 0;
                          const changeAmount = stockData.change || 0;
                          const changePercent = stockData.changePercent || 0;
                          const isPositive = changeAmount >= 0;

                          return (
                            <div
                              key={stock.id}
                              className="p-3 border rounded hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-sm">{stock.symbol}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {stock.companyName}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-sm">
                                    {formatCurrency(currentPrice)}
                                  </div>
                                  <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : ''}{formatCurrency(changeAmount)} ({changePercent.toFixed(2)}%)
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      setSelectedStock({ symbol: stock.symbol, shortName: stock.companyName });
                                      setBuyDialogOpen(true);
                                    }}
                                  >
                                    <ShoppingCart className="w-3 h-3 mr-1" />
                                    {t('buy')}
                                  </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => removeFromWatchlistMutation.mutate(stock.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tournament Trading Tab */}
            <TabsContent value="tournament" className="flex-1 overflow-hidden">
              {activeTournaments.length === 0 ? (
                <Card className="flex items-center justify-center h-full">
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Tournaments</h3>
                      <p className="text-muted-foreground mb-4">
                        Join or create a tournament to start competitive trading
                      </p>
                      <Button asChild>
                        <a href="/tournaments">
                          <Plus className="w-4 h-4 mr-2" />
                          Browse Tournaments
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Tournament Selector */}
                  <div className="flex items-center space-x-4 mb-4 p-3 bg-muted/60 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Tournament:</span>
                    </div>
                    <Select
                      value={selectedTournament?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const tournament = activeTournaments.find((t: any) => t.id.toString() === value);
                        setSelectedTournament(tournament);
                      }}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select tournament" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTournaments.map((tournament: any) => (
                          <SelectItem key={tournament.id} value={tournament.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <span>{tournament.name}</span>
                              <Badge variant={tournament.tournamentType === "crypto" ? "secondary" : "default"} className="text-xs">
                                {tournament.tournamentType === "crypto" ? "🪙" : "📈"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTournament && (
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {selectedTournament.currentPlayers} players
                      </Badge>
                    )}
                  </div>

                  {/* Tournament Content */}
                  {selectedTournament ? (
                    <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                      {/* Overview Bar */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {formatCurrency(
                                (getCurrentPortfolio() as any[]).reduce((total, holding) => 
                                  total + (holding.shares || 0) * (holding.currentPrice || 0), 0
                                ) + ((tournamentBalance as any)?.data?.balance || (tournamentBalance as any)?.balance || 0)
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <Coins className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Cash Balance</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {formatCurrency((tournamentBalance as any)?.data?.balance || (tournamentBalance as any)?.balance || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Profit/Loss</span>
                            </div>
                            <div className={`text-2xl font-bold ${
                              (getCurrentPortfolio() as any[]).reduce((total, holding) => 
                                total + (holding.shares || 0) * ((holding.currentPrice || 0) - (holding.purchasePrice || 0)), 0
                              ) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {((getCurrentPortfolio() as any[]).reduce((total, holding) => 
                                total + (holding.shares || 0) * ((holding.currentPrice || 0) - (holding.purchasePrice || 0)), 0
                              ) >= 0 ? '+' : '')}
                              {formatCurrency(
                                (getCurrentPortfolio() as any[]).reduce((total, holding) => 
                                  total + (holding.shares || 0) * ((holding.currentPrice || 0) - (holding.purchasePrice || 0)), 0
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <BarChart3 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">{t('holdings')}</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {(getCurrentPortfolio() as any[]).length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <Trophy className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">{t('buyIn')}</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {formatCurrency(selectedTournament.buyInAmount || 0)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Trading Interface */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="h-[500px]">
                            <TournamentPerformanceChart 
                              tournamentId={selectedTournament.id} 
                              selectedStock={selectedChartStock} 
                            />
                          </div>

                          {/* Buy Stocks Search */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Buy Stocks</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <StockSearchBar 
                              type="purchase" 
                              placeholder="Search stocks to buy..." 
                              tournamentId={selectedTournament?.id}
                              onStockSelect={(stock) => {
                                setSelectedStock(stock);
                                setBuyDialogOpen(true);
                              }}
                            />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Tournament Portfolio</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isPortfolioLoading() ? (
                                <div className="flex items-center justify-center py-8">
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                              ) : (getCurrentPortfolio() as any[]).length === 0 ? (
                                <div className="text-center py-8">
                                  <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                  <h3 className="text-lg font-semibold mb-2">No Holdings</h3>
                                  <p className="text-muted-foreground">Start trading to build your portfolio</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {/* Table Header */}
                                  <div className="grid grid-cols-7 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                                    <div>Symbol</div>
                                    <div>Shares</div>
                                    <div>Purchase Price</div>
                                    <div>Current Price</div>
                                    <div>Change</div>
                                    <div>Value</div>
                                    <div>Actions</div>
                                  </div>

                                  {(getCurrentPortfolio() as any[]).map((holding: any, index: number) => {
                                    const currentValue = (holding.shares || 0) * (holding.currentPrice || 0);
                                    const purchasePrice = holding.averagePurchasePrice || holding.purchasePrice || 0;
                                    const totalCost = holding.totalCost || ((holding.shares || 0) * purchasePrice);
                                    const gainLoss = currentValue - totalCost;
                                    const priceChange = (holding.currentPrice || 0) - purchasePrice;
                                    const priceChangePercent = totalCost > 0 ? (priceChange / purchasePrice) * 100 : 0;
                                    const isPositive = gainLoss >= 0;

                                    return (
                                      <div
                                        key={index}
                                        className="grid grid-cols-7 gap-2 px-3 py-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors items-center"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium text-sm text-foreground">
                                            {holding.symbol}
                                          </span>
                                          <span className="text-xs text-muted-foreground truncate">
                                            {holding.companyName || holding.symbol}
                                          </span>
                                        </div>

                                        <div className="text-sm">
                                          {holding.shares}
                                        </div>

                                        <div className="text-sm">
                                          {formatCurrency(purchasePrice)}
                                        </div>

                                        <div className="text-sm font-medium">
                                          {formatCurrency(holding.currentPrice || 0)}
                                        </div>

                                        <div className={`text-sm flex items-center gap-1 ${
                                          isPositive ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                          {isPositive ? (
                                            <TrendingUp className="h-3 w-3" />
                                          ) : (
                                            <TrendingDown className="h-3 w-3" />
                                          )}
                                          <div className="flex flex-col">
                                            <span>{isPositive ? '+' : ''}{formatCurrency(priceChange)}</span>
                                            <span className="text-xs">({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                                          </div>
                                        </div>

                                        <div className="text-sm font-medium">
                                          {formatCurrency(currentValue)}
                                        </div>

                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedChartStock(holding.symbol)}
                                            className="text-xs px-2 py-1 h-7"
                                            title="View chart"
                                          >
                                            <BarChart3 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedSellStock(holding);
                                              setSellDialogOpen(true);
                                            }}
                                            className="text-xs px-2 py-1 h-7"
                                          >
                                            Sell
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                        <div className="space-y-4">
                          {/* Watchlist Search */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Add to Watchlist</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <StockSearchBar type="watchlist" placeholder="Search stocks to watch..." />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Market Watch</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {watchlistLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Loading watchlist...</span>
                                </div>
                              ) : watchlist.length === 0 ? (
                                <div className="text-center py-8">
                                  <Star className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                                  <h3 className="font-semibold mb-2">No watchlist items</h3>
                                  <p className="text-xs text-muted-foreground">
                                    Add stocks to monitor
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {watchlist.map((stock) => {
                                    const stockData = watchlistStockData[stock.symbol];

                                    if (!stockData) {
                                      return (
                                        <div
                                          key={stock.id}
                                          className="p-3 border rounded hover:bg-muted/30 transition-colors"
                                        >
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <div className="font-semibold text-sm">{stock.symbol}</div>
                                              <div className="text-xs text-muted-foreground truncate">
                                                {stock.companyName}
                                              </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
                                              Loading...
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }

                                    const currentPrice = stockData.price || 0;
                                    const changeAmount = stockData.change || 0;
                                    const changePercent = stockData.changePercent || 0;
                                    const isPositive = changeAmount >= 0;

                                    return (
                                      <div
                                        key={stock.id}
                                        className="p-3 border rounded hover:bg-muted/30 transition-colors"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <div className="font-semibold text-sm">{stock.symbol}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                              {stock.companyName}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-semibold text-sm">
                                              {formatCurrency(currentPrice)}
                                            </div>
                                            <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                              {isPositive ? '+' : ''}{formatCurrency(changeAmount)} ({changePercent.toFixed(2)}%)
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => {
                                              setSelectedStock({ 
                                                symbol: stock.symbol, 
                                                shortName: stock.companyName,
                                                price: currentPrice
                                              });
                                              setBuyDialogOpen(true);
                                            }}
                                          >
                                            <ShoppingCart className="w-3 h-3 mr-1" />
                                            {t('buy')}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2"
                                            onClick={() => removeFromWatchlistMutation.mutate(stock.id)}
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Tournament Leaderboard */}
                          <TournamentLeaderboard 
                            tournamentId={selectedTournament.id}
                            onViewFullLeaderboard={() => setLeaderboardDialogOpen(true)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-muted-foreground">Select a tournament to start trading</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Tournament Leaderboard Dialog */}
      <TournamentLeaderboardDialog
        tournament={selectedTournament}
        isOpen={leaderboardDialogOpen}
        onClose={() => setLeaderboardDialogOpen(false)}
      />

      {/* Buy Stock Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Stock - {selectedStock?.symbol}</DialogTitle>
            <DialogDescription>
              Enter the number of shares you want to buy of {selectedStock?.shortName || selectedStock?.longName} at {selectedStock?.price ? formatCurrency(selectedStock.price) : ''} per share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="buyShares">Number of Shares</Label>
              <Input
                id="buyShares"
                type="number"
                min="1"
                step="1"
                value={buyShares}
                onChange={(e) => setBuyShares(e.target.value)}
                placeholder="Enter number of shares..."
              />
              {selectedStock?.price && buyShares && (
                <p className="text-sm text-muted-foreground mt-1">
                  Total cost: {formatCurrency(parseInt(buyShares) * selectedStock.price)}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const shares = parseInt(buyShares);
                  if (shares && shares > 0 && selectedStock && selectedStock.price) {
                    buyStockMutation.mutate({
                      symbol: selectedStock.symbol,
                      companyName: selectedStock.shortName || selectedStock.longName || selectedStock.companyName || selectedStock.symbol,
                      shares,
                      purchasePrice: selectedStock.price,
                      tournamentId: activeTab === "tournament" ? selectedTournament?.id : undefined,
                    });
                  }
                }}
                disabled={!buyShares || parseInt(buyShares) <= 0 || buyStockMutation.isPending}
              >
                {buyStockMutation.isPending ? "Purchasing..." : "Buy Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Stock Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Stock - {selectedSellStock?.symbol}</DialogTitle>
            <DialogDescription>
              Enter the number of shares you want to sell
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sellAmount">Shares to Sell</Label>
              <Input
                id="sellAmount"
                type="number"
                min="1"
                max={selectedSellStock?.shares || 0}
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="Enter number of shares to sell..."
              />
              <p className="text-sm text-muted-foreground mt-1">
                You own {selectedSellStock?.shares || 0} shares
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const sharesToSell = parseInt(sellAmount);
                  if (sharesToSell && selectedSellStock) {
                    sellStockMutation.mutate({
                      symbol: selectedSellStock.symbol,
                      sharesToSell,
                      currentPrice: selectedSellStock.currentPrice || selectedSellStock.purchasePrice || 0,
                      tournamentId: activeTab === "tournament" ? selectedTournament?.id : undefined,
                    });
                  }
                }}
                disabled={!sellAmount || parseInt(sellAmount) <= 0 || sellStockMutation.isPending}
              >
                {sellStockMutation.isPending ? "Selling..." : "Sell Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}