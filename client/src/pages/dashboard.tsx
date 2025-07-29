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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio */}
                <div className="lg:col-span-2">
                  <PortfolioGrid />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Stock Search */}
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

                  {/* Watchlist */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5" />
                        <span>Watchlist</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {watchlistLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : watchlist.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No stocks in watchlist
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {watchlist.map((stock) => (
                            <div
                              key={stock.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div>
                                <div className="font-medium">{stock.symbol}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {stock.companyName}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromWatchlistMutation.mutate(stock.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStock({ symbol: stock.symbol, shortName: stock.companyName });
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