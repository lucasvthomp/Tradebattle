import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WatchlistItem, InsertWatchlistItem, StockPurchase, InsertStockPurchase, Tournament, InsertTournament } from "@shared/schema";
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
  Building
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for tournament management
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [createdTournament, setCreatedTournament] = useState<Tournament | null>(null);
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    buyInAmount: '',
    startingCash: '10000',
    maxPlayers: '10'
  });
  const [joinForm, setJoinForm] = useState({
    code: ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  // State for stock trading
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedTradingStock, setSelectedTradingStock] = useState<any>(null);
  const [shareAmount, setShareAmount] = useState('');
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  
  // State for watchlist
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');
  const [showWatchlistSearchResults, setShowWatchlistSearchResults] = useState(false);

  // Fetch user tournaments
  const { data: userTournaments = [], isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['/api/tournaments'],
    enabled: !!user,
  });

  // Fetch popular stocks
  const { data: popularStocks = [], isLoading: isLoadingStocks } = useQuery({
    queryKey: ['/api/popular'],
    enabled: !!user,
  });

  // Fetch search results
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/search', searchQuery],
    enabled: !!user && searchQuery.length > 0,
  });

  // Fetch watchlist search results
  const { data: watchlistSearchResults = [], isLoading: isWatchlistSearching } = useQuery({
    queryKey: ['/api/search', watchlistSearchQuery],
    enabled: !!user && watchlistSearchQuery.length > 0,
  });

  // Fetch user watchlist
  const { data: watchlistItems = [], isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: !!user,
  });

  // Fetch tournament balance
  const { data: tournamentBalance } = useQuery({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'balance'],
    enabled: !!user && !!selectedTournament,
  });

  // Fetch tournament purchases
  const { data: tournamentPurchases = [] } = useQuery({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'purchases'],
    enabled: !!user && !!selectedTournament,
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournament: InsertTournament) => {
      const response = await apiRequest("/api/tournaments", {
        method: "POST",
        body: JSON.stringify(tournament),
      });
      return response;
    },
    onSuccess: (data) => {
      setCreatedTournament(data);
      setShowCreateDialog(false);
      setTournamentForm({ name: '', buyInAmount: '', startingCash: '10000', maxPlayers: '10' });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament Created!",
        description: `Tournament "${data.name}" created successfully. Share code: ${data.code}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(`/api/tournaments/${code}/join`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data) => {
      setShowJoinDialog(false);
      setJoinForm({ code: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Joined Tournament!",
        description: `Successfully joined tournament "${data.tournament.name}"`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Joining Tournament",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Purchase stock mutation
  const purchaseStockMutation = useMutation({
    mutationFn: async (purchase: any) => {
      if (!selectedTournament) {
        throw new Error("No tournament selected");
      }
      
      const response = await apiRequest(`/api/tournaments/${selectedTournament.id}/purchases`, {
        method: "POST",
        body: JSON.stringify(purchase),
      });
      return response;
    },
    onSuccess: () => {
      setIsBuyDialogOpen(false);
      setSelectedTradingStock(null);
      setShareAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', selectedTournament?.id, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', selectedTournament?.id, 'purchases'] });
      toast({
        title: "Stock Purchased!",
        description: "Your stock purchase was successful.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (item: InsertWatchlistItem) => {
      const response = await apiRequest("/api/watchlist", {
        method: "POST",
        body: JSON.stringify(item),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setWatchlistSearchQuery('');
      setShowWatchlistSearchResults(false);
      toast({
        title: "Added to Watchlist",
        description: "Stock added to your watchlist successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/watchlist/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Removed from Watchlist",
        description: "Stock removed from your watchlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  // Handle watchlist search
  const handleWatchlistSearch = (query: string) => {
    setWatchlistSearchQuery(query);
    setShowWatchlistSearchResults(query.length > 0);
  };

  // Handle add to watchlist
  const handleAddToWatchlist = (stock: any) => {
    addToWatchlistMutation.mutate({
      symbol: stock.symbol,
      companyName: stock.name,
      notes: '',
    });
  };

  // Handle remove from watchlist
  const removeFromWatchlist = (id: number) => {
    removeFromWatchlistMutation.mutate(id);
  };

  // Handle stock selection for trading
  const handleStockSelect = (stock: any) => {
    setSelectedTradingStock(stock);
    setIsBuyDialogOpen(true);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Handle purchase submission
  const handlePurchaseSubmit = () => {
    if (!selectedTradingStock || !shareAmount || !selectedTournament) return;
    
    const shares = parseInt(shareAmount);
    const totalCost = shares * selectedTradingStock.price;
    
    if (totalCost > parseFloat(tournamentBalance?.balance || '0')) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to make this purchase.",
        variant: "destructive",
      });
      return;
    }

    purchaseStockMutation.mutate({
      symbol: selectedTradingStock.symbol,
      companyName: selectedTradingStock.name,
      shares: shares,
      purchasePrice: selectedTradingStock.price,
      totalCost: totalCost,
    });
  };

  // Handle tournament creation
  const handleCreateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.buyInAmount || !tournamentForm.startingCash) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTournamentMutation.mutate({
      name: tournamentForm.name,
      buyInAmount: tournamentForm.buyInAmount,
      startingCash: tournamentForm.startingCash,
      maxPlayers: parseInt(tournamentForm.maxPlayers),
    });
  };

  // Handle tournament join
  const handleJoinTournament = () => {
    if (!joinForm.code) {
      toast({
        title: "Missing Code",
        description: "Please enter a tournament code.",
        variant: "destructive",
      });
      return;
    }

    joinTournamentMutation.mutate(joinForm.code);
  };

  // Format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tournament Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Create and join paper trading competitions
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Game
                </Button>
                <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
                  <Activity className="w-4 h-4 mr-2" />
                  Join Game
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Watchlist Section */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Your Watchlist ({watchlistItems.length})
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search to add stocks..."
                      value={watchlistSearchQuery}
                      onChange={(e) => handleWatchlistSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                    {showWatchlistSearchResults && (
                      <div className="absolute top-12 left-0 right-0 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {isWatchlistSearching ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <div className="mt-2 text-sm text-muted-foreground">Searching stocks...</div>
                          </div>
                        ) : watchlistSearchResults.length > 0 ? (
                          watchlistSearchResults.map((stock: any) => (
                            <div
                              key={stock.symbol}
                              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => handleAddToWatchlist(stock)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{stock.symbol}</div>
                                  <div className="text-sm text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${stock.price}</div>
                                  <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No stocks found for "{watchlistSearchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watchlistItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Symbol</th>
                          <th className="text-left py-3 px-4 font-medium">Company</th>
                          <th className="text-left py-3 px-4 font-medium">Price</th>
                          <th className="text-left py-3 px-4 font-medium">Change</th>
                          <th className="text-left py-3 px-4 font-medium">Volume</th>
                          <th className="text-left py-3 px-4 font-medium">Market Cap</th>
                          <th className="text-left py-3 px-4 font-medium">Sector</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {watchlistItems.map((stock: any) => {
                          const stockData = popularStocks.find(s => s.symbol === stock.symbol);
                          return (
                            <tr key={stock.id} className="border-b hover:bg-muted">
                              <td className="py-3 px-4 font-medium text-foreground">{stock.symbol}</td>
                              <td className="py-3 px-4 text-sm text-foreground max-w-[200px] truncate">{stock.companyName}</td>
                              <td className="py-3 px-4 text-sm font-medium text-foreground">
                                {stockData ? `$${stockData.price.toFixed(2)}` : 'Loading...'}
                              </td>
                              <td className="py-3 px-4">
                                {stockData ? (
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${
                                      stockData.change >= 0 ? "text-green-600" : "text-red-600"
                                    }`}>
                                      {stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)}
                                    </span>
                                    <span className={`text-xs ${
                                      stockData.change >= 0 ? "text-green-500" : "text-red-500"
                                    }`}>
                                      ({stockData.percentChange >= 0 ? '+' : ''}{stockData.percentChange.toFixed(2)}%)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Loading...</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground">
                                {stockData ? stockData.volume.toLocaleString() : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground">{stockData ? formatMarketCap(stockData.marketCap) : 'N/A'}</td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="text-xs">
                                  {stockData?.sector || 'N/A'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <LineChart className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromWatchlist(stock.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Your watchlist is empty</p>
                    <p className="text-sm text-muted-foreground">Search for stocks above to add them to your watchlist</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tournament Code Display */}
          {createdTournament && (
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Tournament Created Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-green-700">
                      <strong>Tournament:</strong> {createdTournament.name}
                    </p>
                    <p className="text-green-700">
                      <strong>Join Code:</strong> <span className="font-mono text-lg">{createdTournament.code}</span>
                    </p>
                    <p className="text-green-700">
                      <strong>Buy-in:</strong> ${createdTournament.buyInAmount}
                    </p>
                    <p className="text-green-700">
                      <strong>Starting Cash:</strong> ${createdTournament.startingCash}
                    </p>
                    <p className="text-sm text-green-600">
                      Share this code with other players so they can join your tournament!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tournament Selector */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Your Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userTournaments.length > 0 ? (
                  <div className="space-y-4">
                    {userTournaments.map((tournament: any) => (
                      <div 
                        key={tournament.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTournament?.id === tournament.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedTournament(tournament)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{tournament.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Code: {tournament.code} | Buy-in: ${tournament.buyInAmount} | Starting Cash: ${tournament.startingCash}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tournament.currentPlayers}/{tournament.maxPlayers} players
                            </p>
                          </div>
                          <Badge variant={tournament.status === 'waiting' ? 'secondary' : 'default'}>
                            {tournament.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No tournaments yet</p>
                    <p className="text-sm text-muted-foreground">Create your first tournament to start competing!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tournament Trading Section */}
          {selectedTournament && (
            <motion.div variants={fadeInUp} className="space-y-6">
              {/* Balance and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Tournament Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      ${tournamentBalance?.balance ? parseFloat(tournamentBalance.balance).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available for trading
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Building className="w-5 h-5 mr-2" />
                      Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {tournamentPurchases.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stocks owned
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +0.00%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total return
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Search */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Find Stocks to Trade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks to trade..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                    {showSearchResults && (
                      <div className="absolute top-12 left-0 right-0 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <div className="mt-2 text-sm text-muted-foreground">Searching stocks...</div>
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((stock: any) => (
                            <div
                              key={stock.symbol}
                              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => handleStockSelect(stock)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{stock.symbol}</div>
                                  <div className="text-sm text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${stock.price}</div>
                                  <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No stocks found for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Your Portfolio ({tournamentPurchases.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournamentPurchases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium text-sm">Symbol</th>
                            <th className="text-left py-2 px-2 font-medium text-sm">Company</th>
                            <th className="text-left py-2 px-2 font-medium text-sm">Shares</th>
                            <th className="text-left py-2 px-2 font-medium text-sm">Purchase Price</th>
                            <th className="text-left py-2 px-2 font-medium text-sm">Total Cost</th>
                            <th className="text-left py-2 px-2 font-medium text-sm">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tournamentPurchases.map((purchase: any) => (
                            <tr key={purchase.id} className="border-b hover:bg-muted">
                              <td className="py-2 px-2 font-medium text-sm">{purchase.symbol}</td>
                              <td className="py-2 px-2 text-xs max-w-[120px] truncate">{purchase.companyName}</td>
                              <td className="py-2 px-2 text-sm">{purchase.shares}</td>
                              <td className="py-2 px-2 text-sm">${parseFloat(purchase.purchasePrice).toFixed(2)}</td>
                              <td className="py-2 px-2 text-sm">${parseFloat(purchase.totalCost).toFixed(2)}</td>
                              <td className="py-2 px-2 text-xs text-muted-foreground">
                                {new Date(purchase.purchaseDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">No stocks in your portfolio yet</p>
                      <p className="text-sm text-muted-foreground">Search for stocks above to start trading</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Create Tournament Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tournament</DialogTitle>
            <DialogDescription>
              Set up a new paper trading competition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tournament-name">Tournament Name</Label>
              <Input
                id="tournament-name"
                placeholder="Enter tournament name"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="buy-in">Buy-in Amount ($)</Label>
              <Input
                id="buy-in"
                type="number"
                placeholder="0.00"
                value={tournamentForm.buyInAmount}
                onChange={(e) => setTournamentForm({ ...tournamentForm, buyInAmount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="starting-cash">Starting Cash ($)</Label>
              <Input
                id="starting-cash"
                type="number"
                placeholder="10000"
                value={tournamentForm.startingCash}
                onChange={(e) => setTournamentForm({ ...tournamentForm, startingCash: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="max-players">Max Players</Label>
              <Input
                id="max-players"
                type="number"
                min="2"
                max="10"
                placeholder="10"
                value={tournamentForm.maxPlayers}
                onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayers: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTournament}
                disabled={createTournamentMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Tournament Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Tournament</DialogTitle>
            <DialogDescription>
              Enter the tournament code to join
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tournament-code">Tournament Code</Label>
              <Input
                id="tournament-code"
                placeholder="Enter 8-character code"
                value={joinForm.code}
                onChange={(e) => setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })}
                maxLength={8}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleJoinTournament}
                disabled={joinTournamentMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {joinTournamentMutation.isPending ? "Joining..." : "Join Tournament"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buy Stock Dialog */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Stock</DialogTitle>
            <DialogDescription>
              {selectedTradingStock && (
                <div className="space-y-2">
                  <p><strong>{selectedTradingStock.symbol}</strong> - {selectedTradingStock.name}</p>
                  <p>Current price: <strong>${selectedTradingStock.price}</strong></p>
                  <p>Your balance: <strong>${tournamentBalance?.balance ? parseFloat(tournamentBalance.balance).toFixed(2) : '0.00'}</strong></p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shares">Number of shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                step="1"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                placeholder="Enter number of shares"
              />
            </div>
            {selectedTradingStock && shareAmount && parseInt(shareAmount) > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  Total cost: <strong>${(parseInt(shareAmount) * selectedTradingStock.price).toFixed(2)}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Remaining balance: <strong>${(parseFloat(tournamentBalance?.balance || '0') - (parseInt(shareAmount) * selectedTradingStock.price)).toFixed(2)}</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePurchaseSubmit}
                disabled={!shareAmount || parseInt(shareAmount) <= 0 || purchaseStockMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {purchaseStockMutation.isPending ? "Processing..." : "Buy Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}