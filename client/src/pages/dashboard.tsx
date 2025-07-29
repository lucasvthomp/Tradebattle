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
  Search, 
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketStatusDisclaimer } from "@/components/MarketStatusDisclaimer";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

const SearchResultItem = ({ stock, isInWatchlist, onAdd }: { 
  stock: any; 
  isInWatchlist: boolean; 
  onAdd: () => void; 
}) => {
  const [stockQuote, setStockQuote] = useState<any>(null);
  const { formatCurrency } = useUserPreferences();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await apiRequest("GET", `/api/quote/${stock.symbol}`);
        const data = await response.json();
        setStockQuote(data.data);
      } catch (error) {
        console.error(`Error fetching quote for ${stock.symbol}:`, error);
      }
    };
    fetchQuote();
  }, [stock.symbol]);

  return (
    <div className="flex items-center justify-between p-3 hover:bg-background rounded transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-semibold text-sm">{stock.symbol}</div>
            <div className="text-xs text-muted-foreground truncate max-w-64">
              {stock.shortName || stock.longName || 'N/A'}
            </div>
          </div>
          <div className="text-right ml-2">
            {stockQuote ? (
              <div className="text-sm font-medium">
                {formatCurrency(stockQuote.price || stockQuote.regularMarketPrice || 0)}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Loading...</div>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="ml-2 flex-shrink-0"
        onClick={onAdd}
        disabled={isInWatchlist}
      >
        {isInWatchlist ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState("personal"); // personal or tournament
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  
  // Watchlist specific state
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState("");
  const [watchlistSearchResults, setWatchlistSearchResults] = useState<any[]>([]);
  const [isWatchlistSearching, setIsWatchlistSearching] = useState(false);
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

  // Stock search function
  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.success ? result.data : []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Buy stock mutation
  const buyStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; amount: number; tournamentId?: number }) => {
      const endpoint = data.tournamentId 
        ? "/api/portfolio/tournament/buy" 
        : "/api/portfolio/personal/buy";
      return apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      toast({ title: "Stock purchased successfully!" });
      setBuyDialogOpen(false);
      setBuyAmount("");
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
    mutationFn: async (data: { symbol: string; amount: number; tournamentId?: number }) => {
      const endpoint = data.tournamentId 
        ? "/api/portfolio/tournament/sell" 
        : "/api/portfolio/personal/sell";
      return apiRequest("POST", endpoint, data);
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
    const tournament = Array.isArray(tournamentPortfolio) ? tournamentPortfolio : [];
    return activeTab === "personal" ? personal : tournament;
  };

  const isPortfolioLoading = (): boolean => {
    return activeTab === "personal" ? personalLoading : tournamentLoading;
  };

  // Stock search functionality
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await apiRequest("GET", `/api/search/${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setSearchResults(data.results || []);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Watchlist search functionality
  useEffect(() => {
    if (watchlistSearchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(async () => {
        setIsWatchlistSearching(true);
        try {
          const response = await apiRequest("GET", `/api/search/${encodeURIComponent(watchlistSearchQuery)}`);
          const data = await response.json();
          setWatchlistSearchResults(data.data || data.results || []);
        } catch (error) {
          console.error("Watchlist search error:", error);
          setWatchlistSearchResults([]);
        } finally {
          setIsWatchlistSearching(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setWatchlistSearchResults([]);
    }
  }, [watchlistSearchQuery]);

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
              const changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
              const previousClose = quoteData.data?.previousClose || (currentPrice - changeAmount);
              
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
                  const historicalPrice = historicalData.data[historicalData.data.length - 1].close;
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
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your portfolio and participate in tournaments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatCurrency(getCurrentBalance())}
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
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
            <TabsContent value="personal" className="space-y-6">
              <div className="space-y-6">
                {/* Portfolio Grid - Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Portfolio */}
                  <div className="lg:col-span-3">
                    <PortfolioGrid />
                  </div>

                  {/* Stock Search Sidebar */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Search className="w-5 h-5" />
                          <span>Search Stocks</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          placeholder="Search by symbol or company name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        {isSearching && (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Searching...</span>
                          </div>
                        )}

                        {searchResults.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.slice(0, 10).map((stock, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div>
                                  <div className="font-medium">{stock.symbol}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {stock.shortName || stock.longName}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const isInWatchlist = watchlist.some(w => w.symbol === stock.symbol);
                                      if (isInWatchlist) {
                                        const watchlistItem = watchlist.find(w => w.symbol === stock.symbol);
                                        if (watchlistItem) {
                                          removeFromWatchlistMutation.mutate(watchlistItem.id);
                                        }
                                      } else {
                                        addToWatchlistMutation.mutate(stock);
                                      }
                                    }}
                                  >
                                    {watchlist.some(w => w.symbol === stock.symbol) ? (
                                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                                    ) : (
                                      <StarOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedStock(stock);
                                      setBuyDialogOpen(true);
                                    }}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Buy
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Watchlist - Full Width Bottom Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5" />
                        <span>Watchlist</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
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
                            <SelectItem value="YTD">YTD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Manual refresh function
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
                                      const changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
                                      const previousClose = quoteData.data?.previousClose || (currentPrice - changeAmount);
                                      
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
                                          const historicalPrice = historicalData.data[historicalData.data.length - 1].close;
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
                                          changeAmount = quoteData.data?.change || quoteData.data?.regularMarketChange || 0;
                                          changePercent = quoteData.data?.changePercent || quoteData.data?.regularMarketChangePercent || 0;
                                          
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
                                      } catch (histError) {
                                        console.error(`Manual refresh historical data error for ${stock.symbol}:`, histError);
                                        // Fallback to daily change
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
                            }
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search Bar for Adding Stocks */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Search stocks to add to watchlist..."
                        value={watchlistSearchQuery}
                        onChange={(e) => setWatchlistSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      
                      {isWatchlistSearching && (
                        <div className="flex items-center justify-center py-2">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Searching...</span>
                        </div>
                      )}

                      {watchlistSearchResults.length > 0 && (
                        <div className="border rounded-lg p-2 bg-muted/30 max-h-48 overflow-y-auto">
                          <div className="space-y-1">
                            {watchlistSearchResults.slice(0, 8).map((stock, index) => (
                              <SearchResultItem
                                key={index}
                                stock={stock}
                                isInWatchlist={watchlist.some(w => w.symbol === stock.symbol)}
                                onAdd={() => {
                                  addToWatchlistMutation.mutate(stock);
                                  setWatchlistSearchQuery("");
                                  setWatchlistSearchResults([]);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Watchlist Content */}
                    {watchlistLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading watchlist...</span>
                      </div>
                    ) : watchlist.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
                        <p className="text-sm text-muted-foreground">
                          Use the search bar above to add stocks to your watchlist
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="grid grid-cols-8 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                          <div className="col-span-2">Stock</div>
                          <div className="text-right">Current Price</div>
                          <div className="text-right">Previous Close</div>
                          <div className="text-right">Change</div>
                          <div className="text-right">Market Cap</div>
                          <div className="text-right">Volume</div>
                          <div className="text-center">Actions</div>
                        </div>

                        {watchlist.map((stock) => {
                          const stockData = watchlistStockData[stock.symbol];
                          
                          if (!stockData) {
                            return (
                              <div
                                key={stock.id}
                                className="grid grid-cols-8 gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors items-center"
                              >
                                <div className="col-span-2">
                                  <div className="font-semibold text-base">{stock.symbol}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {stock.companyName}
                                  </div>
                                </div>
                                <div className="col-span-5 text-center text-muted-foreground">
                                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                  Loading...
                                </div>
                                <div className="flex items-center justify-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFromWatchlistMutation.mutate(stock.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          // Use real Yahoo Finance data with timeframe-aware changes
                          const currentPrice = stockData.price || 0;
                          const changeAmount = stockData.change || 0;
                          const changePercent = stockData.changePercent || 0;
                          const marketCap = stockData.marketCap || 0;
                          const volume = stockData.volume || 0;
                          const previousClose = stockData.previousClose || 0;

                          const isPositive = changeAmount >= 0;
                          
                          // Format market cap in billions/millions
                          const formatMarketCap = (cap: number) => {
                            if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
                            if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
                            if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
                            if (cap >= 1e3) return `$${(cap / 1e3).toFixed(2)}K`;
                            return cap > 0 ? `$${cap.toFixed(0)}` : 'N/A';
                          };
                          
                          return (
                            <div
                              key={stock.id}
                              className="grid grid-cols-8 gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors items-center"
                            >
                              {/* Stock Info */}
                              <div className="col-span-2">
                                <div className="font-semibold text-base">{stock.symbol}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {stock.companyName}
                                </div>
                              </div>
                              
                              {/* Current Price */}
                              <div className="text-right">
                                <div className="font-semibold">
                                  {formatCurrency(currentPrice)}
                                </div>
                              </div>
                              
                              {/* Previous Close */}
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(previousClose)}
                                </div>
                              </div>
                              
                              {/* Change Amount & Percentage */}
                              <div className="text-right">
                                <div className={`font-medium ${
                                  isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  <div className="flex items-center justify-end space-x-1">
                                    {isPositive ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4" />
                                    )}
                                    <div>
                                      <div>{isPositive ? '+' : ''}{formatCurrency(changeAmount)}</div>
                                      <div className="text-xs">
                                        ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%) {selectedTimeframe.toUpperCase()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Market Cap */}
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {formatMarketCap(marketCap)}
                                </div>
                              </div>
                              
                              {/* Volume */}
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  {volume.toLocaleString()}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStock({ symbol: stock.symbol, shortName: stock.companyName });
                                    setBuyDialogOpen(true);
                                  }}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromWatchlistMutation.mutate(stock.id)}
                                >
                                  <X className="w-4 h-4" />
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
            </TabsContent>

            {/* Tournament Trading Tab */}
            <TabsContent value="tournament" className="space-y-6">
              {activeTournaments.length === 0 ? (
                <Card>
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
                <div className="space-y-6">
                  {/* Tournament Selector */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Tournament</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTournaments.map((tournament: any) => (
                          <div
                            key={tournament.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTournament?.id === tournament.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedTournament(tournament)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{tournament.name}</h4>
                              <Badge variant={tournament.tournamentType === "crypto" ? "secondary" : "default"}>
                                {tournament.tournamentType === "crypto" ? "🪙 Crypto" : "📈 Stocks"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>{tournament.currentPlayers} players</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tournament Trading Interface */}
                  {selectedTournament && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Portfolio */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Tournament Portfolio - {selectedTournament.name}</span>
                              <Badge variant="outline">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatCurrency((tournamentBalance as any)?.balance || 0)}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isPortfolioLoading() ? (
                              <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Loading portfolio...</span>
                              </div>
                            ) : (getCurrentPortfolio() as any[]).length === 0 ? (
                              <div className="text-center py-8">
                                <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Holdings</h3>
                                <p className="text-muted-foreground">
                                  Start trading to build your tournament portfolio
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {(getCurrentPortfolio() as any[]).map((holding: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <div className="font-semibold">{holding.symbol}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {holding.shares} shares × {formatCurrency(holding.currentPrice || 0)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {formatCurrency((holding.shares || 0) * (holding.currentPrice || 0))}
                                      </div>
                                      <div className={`text-sm ${
                                        ((holding.currentPrice || 0) - (holding.purchasePrice || 0)) >= 0 
                                          ? 'text-green-600' 
                                          : 'text-red-600'
                                      }`}>
                                        {((holding.currentPrice || 0) - (holding.purchasePrice || 0)) >= 0 ? '+' : ''}
                                        {formatCurrency((holding.currentPrice || 0) - (holding.purchasePrice || 0))}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedSellStock(holding);
                                        setSellDialogOpen(true);
                                      }}
                                    >
                                      Sell
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Tournament Search & Actions */}
                      <div className="space-y-6">
                        {/* Same search interface as personal */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Search className="w-5 h-5" />
                              <span>Search Stocks</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Input
                              placeholder="Search by symbol or company name..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            
                            {isSearching && (
                              <div className="flex items-center justify-center py-4">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Searching...</span>
                              </div>
                            )}

                            {searchResults.length > 0 && (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.slice(0, 10).map((stock, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div>
                                      <div className="font-medium">{stock.symbol}</div>
                                      <div className="text-sm text-muted-foreground truncate">
                                        {stock.shortName || stock.longName}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStock(stock);
                                        setBuyDialogOpen(true);
                                      }}
                                    >
                                      <ShoppingCart className="w-4 h-4 mr-1" />
                                      Buy
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Buy Stock Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Stock - {selectedStock?.symbol}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest in {selectedStock?.shortName || selectedStock?.longName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="buyAmount">Investment Amount ($)</Label>
              <Input
                id="buyAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Enter amount to invest..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const amount = parseFloat(buyAmount);
                  if (amount && selectedStock) {
                    buyStockMutation.mutate({
                      symbol: selectedStock.symbol,
                      amount,
                      tournamentId: activeTab === "tournament" ? selectedTournament?.id : undefined,
                    });
                  }
                }}
                disabled={!buyAmount || parseFloat(buyAmount) <= 0 || buyStockMutation.isPending}
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
              Enter the amount you want to sell
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sellAmount">Sell Amount ($)</Label>
              <Input
                id="sellAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="Enter amount to sell..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const amount = parseFloat(sellAmount);
                  if (amount && selectedSellStock) {
                    sellStockMutation.mutate({
                      symbol: selectedSellStock.symbol,
                      amount,
                      tournamentId: activeTab === "tournament" ? selectedTournament?.id : undefined,
                    });
                  }
                }}
                disabled={!sellAmount || parseFloat(sellAmount) <= 0 || sellStockMutation.isPending}
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