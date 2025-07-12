import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WatchlistItem, InsertWatchlistItem, PortfolioItem } from "@shared/schema";
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
  Newspaper,
  BookOpen,
  Target,
  Zap,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Bell,
  Settings,
  Download,
  Building,
  TrendingUpDown,
  ShoppingCart
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";

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

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  companyName: string;
  volume: number;
  marketCap: number;
  peRatio: number;
}

interface StockPerformance {
  symbol: string;
  timeFrame: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  historicalData: {
    date: string;
    price: number;
  }[];
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("1D");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [selectedStockQuote, setSelectedStockQuote] = useState<StockQuote | null>(null);
  const [buyShares, setBuyShares] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Fetch user balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery<{ balance: string }>({
    queryKey: ["/api/balance"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user portfolio
  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
    refetchInterval: 30000,
  });

  // Fetch watchlist
  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
    refetchInterval: 30000,
  });

  // Fetch portfolio performance data
  const { data: portfolioPerformance = [], isLoading: performanceLoading } = useQuery<StockPerformance[]>({
    queryKey: ["/api/portfolio/performance", selectedTimeFrame],
    queryFn: async () => {
      if (portfolio.length === 0) return [];
      
      const promises = portfolio.map(async (item) => {
        const res = await apiRequest("GET", `/api/performance/${item.symbol}/${selectedTimeFrame}`);
        return res.json();
      });
      
      const results = await Promise.all(promises);
      return results.map(r => r.data);
    },
    enabled: portfolio.length > 0,
    refetchInterval: user?.subscriptionTier === "novice" ? 
      (selectedTimeFrame === "1D" || selectedTimeFrame === "5D" ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000) : 
      (selectedTimeFrame === "1D" || selectedTimeFrame === "5D" ? 60 * 1000 : 5 * 60 * 1000),
  });

  // Search stocks
  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("GET", `/api/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
      toast({
        title: "Search failed",
        description: "Failed to search stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get stock quote for buy dialog
  const getStockQuote = async (symbol: string) => {
    try {
      const response = await apiRequest("GET", `/api/quote/${symbol}`);
      const data = await response.json();
      if (data.success) {
        setSelectedStockQuote(data.data);
      }
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      toast({
        title: "Quote failed",
        description: "Failed to fetch stock quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Buy stock mutation
  const buyStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; companyName: string; shares: number; price: string }) => {
      const response = await apiRequest("POST", "/api/portfolio/buy", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful",
        description: "Stock added to your portfolio!",
      });
      setShowBuyDialog(false);
      setSelectedStock(null);
      setSelectedStockQuote(null);
      setBuyShares(1);
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to buy stock. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle buy stock
  const handleBuyStock = () => {
    if (!selectedStock || !selectedStockQuote) return;
    
    const totalCost = selectedStockQuote.price * buyShares;
    const balance = parseFloat(balanceData?.balance || "0");
    
    if (totalCost > balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to make this purchase.",
        variant: "destructive",
      });
      return;
    }

    buyStockMutation.mutate({
      symbol: selectedStock.symbol,
      companyName: selectedStock.name,
      shares: buyShares,
      price: selectedStockQuote.price.toString(),
    });
  };

  // Handle search input change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchStocks(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle stock selection for buying
  const handleStockSelect = (stock: SearchResult) => {
    setSelectedStock(stock);
    getStockQuote(stock.symbol);
    setShowBuyDialog(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    if (!portfolioPerformance.length) return 0;
    
    return portfolioPerformance.reduce((total, perf) => {
      const portfolioItem = portfolio.find(p => p.symbol === perf.symbol);
      if (!portfolioItem) return total;
      
      return total + (perf.currentPrice * portfolioItem.shares);
    }, 0);
  };

  // Prepare chart data
  const chartData = portfolioPerformance.length > 0 && portfolioPerformance[0]?.historicalData ? 
    portfolioPerformance[0].historicalData.map((point, index) => ({
      date: point.date,
      ...portfolioPerformance.reduce((acc, perf) => {
        const portfolioItem = portfolio.find(p => p.symbol === perf.symbol);
        if (portfolioItem && perf.historicalData && perf.historicalData[index]) {
          acc[perf.symbol] = perf.historicalData[index].price * portfolioItem.shares;
        }
        return acc;
      }, {} as Record<string, number>),
      total: portfolioPerformance.reduce((total, perf) => {
        const portfolioItem = portfolio.find(p => p.symbol === perf.symbol);
        if (portfolioItem && perf.historicalData && perf.historicalData[index]) {
          return total + (perf.historicalData[index].price * portfolioItem.shares);
        }
        return total;
      }, 0)
    })) : [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
          <Button onClick={() => window.location.href = "/login"}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl font-bold text-black mb-2">
              Trading Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your portfolio and track your investments
            </p>
          </motion.div>

          {/* Balance Display */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {balanceLoading ? "Loading..." : formatCurrency(parseFloat(balanceData?.balance || "0"))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Available for trading
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Chart */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Portfolio Performance
                  </CardTitle>
                  <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="5D">5 Days</SelectItem>
                      <SelectItem value="1M">1 Month</SelectItem>
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="YTD">YTD</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                      <SelectItem value="5Y">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), "Portfolio Value"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#000000" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No portfolio data available</p>
                      <p className="text-sm">Start by buying your first stock below</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stock Search */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buy Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search stocks by symbol or company name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleStockSelect(stock)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{stock.symbol}</span>
                              <span className="text-gray-600">{stock.name}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {stock.type} • {stock.region}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Holdings */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Portfolio Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : portfolio.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.map((item) => {
                      const performance = portfolioPerformance.find(p => p.symbol === item.symbol);
                      const currentValue = performance ? performance.currentPrice * item.shares : 0;
                      const originalValue = parseFloat(item.purchasePrice) * item.shares;
                      const change = currentValue - originalValue;
                      const changePercent = originalValue > 0 ? (change / originalValue) * 100 : 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.symbol}</span>
                              <span className="text-gray-600">{item.companyName}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.shares} shares • Bought at {formatCurrency(parseFloat(item.purchasePrice))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(currentValue)}
                            </div>
                            <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Portfolio Value:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(calculatePortfolioValue())}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No stocks in your portfolio yet</p>
                    <p className="text-sm">Use the search above to buy your first stock</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Buy Stock Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Stock</DialogTitle>
            <DialogDescription>
              {selectedStock && `Purchase shares of ${selectedStock.name} (${selectedStock.symbol})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStockQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Price</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(selectedStockQuote.price)}
                  </div>
                </div>
                <div>
                  <Label>Available Balance</Label>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(parseFloat(balanceData?.balance || "0"))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="shares">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  min="1"
                  step="1"
                  value={buyShares}
                  onChange={(e) => setBuyShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Total Cost:</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(selectedStockQuote.price * buyShares)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Remaining Balance:</span>
                  <span className="font-semibold">
                    {formatCurrency(parseFloat(balanceData?.balance || "0") - (selectedStockQuote.price * buyShares))}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleBuyStock}
                  disabled={buyStockMutation.isPending || (selectedStockQuote.price * buyShares) > parseFloat(balanceData?.balance || "0")}
                  className="flex-1"
                >
                  {buyStockMutation.isPending ? "Processing..." : "Buy Stock"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBuyDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}