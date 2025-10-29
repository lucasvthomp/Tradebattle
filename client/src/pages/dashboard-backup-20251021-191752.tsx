import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament } from "@shared/schema";
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
import { StockSearchBar } from "@/components/trading/StockSearchBar";
import { AdvancedTradingChart } from "@/components/portfolio/widgets/AdvancedTradingChart";
import { TournamentLeaderboard } from "@/components/tournaments/TournamentLeaderboard";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState("tournament"); // tournaments only
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedChartStock, setSelectedChartStock] = useState<string | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [buyShares, setBuyShares] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);



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
      }
    },
    onSuccess: () => {
      toast({ title: "Stock purchased successfully!" });
      setBuyDialogOpen(false);
      setBuyShares("");
      setSelectedStock(null);
      if (selectedTournament) {
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
      if (selectedTournament) {
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


  const getCurrentBalance = (): number => {
    if (selectedTournament && tournamentBalance) {
      return (tournamentBalance as any)?.balance || 0;
    }
    return 0;
  };

  const getCurrentPortfolio = (): any[] => {
    const tournamentData = (tournamentPortfolio as any)?.data || tournamentPortfolio;
    const tournament = Array.isArray(tournamentData) ? tournamentData : [];
    return tournament;
  };

  const isPortfolioLoading = (): boolean => {
    return tournamentLoading;
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
    <div className="h-[calc(100vh-4rem)] bg-background overflow-hidden">
      <MarketStatusDisclaimer />

      <div className="container mx-auto px-4 py-4 h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
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

          {/* Tournament Trading Section */}
          <div className="flex flex-col flex-1 overflow-hidden">
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
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden min-h-0">
                        <div className="lg:col-span-2 h-full">
                          <AdvancedTradingChart
                            selectedStock={selectedChartStock || "AAPL"}
                          />
                        </div>
                        <div className="space-y-4 h-full overflow-y-auto">
                          {/* Buy Stocks Search */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center space-x-2">
                                <ShoppingCart className="w-5 h-5" />
                                <span>Buy Stocks</span>
                              </CardTitle>
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

                          {/* Holdings Sidebar */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center space-x-2">
                                <Coins className="w-5 h-5" />
                                <span>Your Holdings</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isPortfolioLoading() ? (
                                <div className="flex items-center justify-center py-8">
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                              ) : (getCurrentPortfolio() as any[]).length === 0 ? (
                                <div className="text-center py-8">
                                  <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                  <h3 className="font-semibold mb-2">No Holdings</h3>
                                  <p className="text-xs text-muted-foreground">
                                    Start trading to build your portfolio
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {(getCurrentPortfolio() as any[]).map((holding: any, index: number) => {
                                    const currentValue = (holding.shares || 0) * (holding.currentPrice || 0);
                                    const purchasePrice = holding.averagePurchasePrice || holding.purchasePrice || 0;
                                    const totalCost = holding.totalCost || ((holding.shares || 0) * purchasePrice);
                                    const gainLoss = currentValue - totalCost;
                                    const isPositive = gainLoss >= 0;

                                    return (
                                      <div
                                        key={index}
                                        className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <div className="font-semibold text-sm">{holding.symbol}</div>
                                            <div className="text-xs text-muted-foreground">{holding.shares} shares</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-semibold text-sm">
                                              {formatCurrency(holding.currentPrice || 0)}
                                            </div>
                                            <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                              {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedChartStock(holding.symbol)}
                                            className="text-xs px-2 py-1 h-6 flex-1"
                                          >
                                            <BarChart3 className="h-3 w-3 mr-1" />
                                            Chart
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedSellStock(holding);
                                              setSellDialogOpen(true);
                                            }}
                                            className="text-xs px-2 py-1 h-6 flex-1"
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
          </div>
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