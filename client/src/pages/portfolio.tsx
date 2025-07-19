import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, Crown, Calendar, Lock, ShoppingCart, Minus, RefreshCw, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PortfolioGraph } from "@/components/ui/portfolio-graph";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Portfolio() {
  const { user } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [streakInfoOpen, setStreakInfoOpen] = useState(false);

  // Check if user has premium or administrator subscription
  const hasPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'administrator';

  // Fetch personal portfolio balance and data
  const { data: personalPortfolioData } = useQuery({
    queryKey: ['/api/personal-portfolio'],
    enabled: !!user && hasPremium,
    refetchInterval: user?.subscriptionTier === 'free' ? 10 * 60 * 1000 : 30000, // Free: 10 minutes, Premium/Admin: 30 seconds
    staleTime: 0, // Always consider data stale to ensure fresh streak calculation
  });

  const personalPortfolio = personalPortfolioData?.data;

  // Fetch personal stock purchases
  const { data: personalPurchasesData } = useQuery({
    queryKey: ['/api/personal-purchases'],
    enabled: !!user && hasPremium,
    refetchInterval: user?.subscriptionTier === 'free' ? 10 * 60 * 1000 : 30000, // Free: 10 minutes, Premium/Admin: 30 seconds
  });

  const personalPurchases = personalPurchasesData?.data || [];

  // Fetch current prices for personal stocks
  const purchasedSymbols = personalPurchases.map((purchase: any) => purchase.symbol);
  const { data: stockPrices = {} } = useQuery({
    queryKey: ['personal-stock-prices', purchasedSymbols],
    queryFn: async () => {
      if (purchasedSymbols.length === 0) return {};
      
      const promises = purchasedSymbols.map(async (symbol: string) => {
        try {
          const response = await fetch(`/api/quote/${symbol}`);
          if (response.ok) {
            const result = await response.json();
            return result.success ? { symbol, price: result.data.price } : null;
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return null;
        }
      });
      const results = await Promise.all(promises);
      const prices: {[key: string]: number} = {};
      results.forEach(result => {
        if (result) {
          prices[result.symbol] = result.price;
        }
      });
      return prices;
    },
    enabled: purchasedSymbols.length > 0 && hasPremium,
    refetchInterval: user?.subscriptionTier === 'free' ? 10 * 60 * 1000 : 30000, // Free: 10 minutes, Premium/Admin: 30 seconds
  });

  // Calculate portfolio metrics
  const portfolioValue = personalPurchases.reduce((total: number, purchase: any) => {
    const purchasePrice = parseFloat(purchase.purchasePrice);
    const currentPrice = stockPrices[purchase.symbol] || purchasePrice;
    return total + (currentPrice * purchase.shares);
  }, 0);

  const totalInvested = personalPurchases.reduce((total: number, purchase: any) => {
    const purchasePrice = parseFloat(purchase.purchasePrice);
    return total + (purchasePrice * purchase.shares);
  }, 0);

  const currentBalance = parseFloat(personalPortfolio?.balance) || 10000;
  const totalPortfolioValue = currentBalance + portfolioValue;
  
  // Initial deposit amount (money given to user)
  const initialDeposit = parseFloat(user?.totalDeposited) || 10000;
  
  // Calculate gain/loss based on initial deposit vs current total portfolio value
  const totalGainLoss = totalPortfolioValue - initialDeposit;
  const totalGainLossPercent = initialDeposit > 0 ? (totalGainLoss / initialDeposit) * 100 : 0;

  // Calculate days with personal portfolio
  const portfolioStartDate = user?.portfolioCreatedAt ? new Date(user.portfolioCreatedAt) : null;
  const daysWithPortfolio = portfolioStartDate ? 
    Math.floor((Date.now() - portfolioStartDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Get trading streak from portfolio data
  const tradingStreak = personalPortfolio?.tradingStreak || 0;

  // Purchase stock mutation
  const purchaseStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; companyName: string; shares: number; purchasePrice: number }) => {
      const response = await fetch('/api/personal-portfolio/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Purchase failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stock Purchased",
        description: "Successfully purchased stock in your personal portfolio",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setPurchaseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase stock",
        variant: "destructive",
      });
    },
  });

  // Sell stock mutation
  const sellStockMutation = useMutation({
    mutationFn: async (data: { purchaseId: number; sharesToSell: number; currentPrice: number }) => {
      const response = await fetch('/api/personal-portfolio/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Sale failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stock Sold",
        description: "Successfully sold stock from your personal portfolio",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setSellDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell stock",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your portfolio</h2>
        </div>
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <div className="bg-card border rounded-lg p-8">
              <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Premium Feature</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Personal Portfolio is a premium feature that requires a subscription
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">Premium Features Include:</span>
                </div>
                <ul className="text-left max-w-md mx-auto space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>Personal portfolio tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>Separate balance from tournaments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>Portfolio performance tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>Daily portfolio streak counter</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    onClick={() => window.location.href = '/premium'}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-2"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-500" />
                  Personal Portfolio
                </h1>
                <p className="text-muted-foreground">
                  Your private trading portfolio - separate from tournaments
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{tradingStreak}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => setStreakInfoOpen(true)}
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Trading streak</p>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Summary Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8" variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Initial Deposit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${initialDeposit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Starting amount given
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Cash: ${currentBalance.toFixed(2)} | Stocks: ${portfolioValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalGainLoss.toFixed(2)}
                </div>
                <p className={`text-xs ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInvested.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {personalPurchases.length} positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalPortfolioValue > 0 ? ((currentBalance / totalPortfolioValue) * 100).toFixed(1) : '0'}% of portfolio
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Performance Graph */}
          <motion.div variants={fadeInUp}>
            <PortfolioGraph 
              userId={user.id}
              portfolioType="personal"
              title="Detailed Portfolio Performance"
              height={400}
              showStats={true}
              className="mb-8"
            />
          </motion.div>

          {/* Holdings Table */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Personal Holdings ({personalPurchases.length})
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {user?.subscriptionTier === 'free' ? '10min' : '30sec'} refresh
                      </span>
                    </div>
                    <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Stock
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buy Stock</DialogTitle>
                      </DialogHeader>
                      <PurchaseDialog 
                        currentBalance={currentBalance}
                        onPurchase={purchaseStockMutation.mutate}
                        isPending={purchaseStockMutation.isPending}
                      />
                    </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalPurchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Stock</th>
                          <th className="text-right py-2 px-4 font-medium">Shares</th>
                          <th className="text-right py-2 px-4 font-medium">Total Purchase Value</th>
                          <th className="text-right py-2 px-4 font-medium">Current Value</th>
                          <th className="text-right py-2 px-4 font-medium">Change</th>
                          <th className="text-right py-2 px-4 font-medium">Purchase Price</th>
                          <th className="text-right py-2 px-4 font-medium">Current Price</th>
                          <th className="text-right py-2 px-4 font-medium">Per Share Change</th>
                          <th className="text-center py-2 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personalPurchases.map((purchase: any) => {
                          const purchasePrice = parseFloat(purchase.purchasePrice);
                          const currentPrice = stockPrices[purchase.symbol] || purchasePrice;
                          const perShareChange = currentPrice - purchasePrice;
                          const perSharePercentChange = ((perShareChange / purchasePrice) * 100);
                          const totalPurchaseValue = purchasePrice * purchase.shares;
                          const currentValue = currentPrice * purchase.shares;
                          const totalValueChange = currentValue - totalPurchaseValue;
                          const totalValuePercentChange = ((totalValueChange / totalPurchaseValue) * 100);
                          
                          return (
                            <tr key={purchase.id} className="border-b hover:bg-accent/50">
                              <td className="py-2 px-4">
                                <div className="font-medium">{purchase.symbol}</div>
                              </td>
                              <td className="py-2 px-4 text-right font-medium">{purchase.shares}</td>
                              <td className="py-2 px-4 text-right font-medium">${totalPurchaseValue.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right font-medium">${currentValue.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right">
                                <div className={`${totalValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>${totalValueChange.toFixed(2)}</div>
                                  <div className="text-xs">({totalValuePercentChange.toFixed(2)}%)</div>
                                </div>
                              </td>
                              <td className="py-2 px-4 text-right">${purchasePrice.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right">${currentPrice.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right">
                                <div className={`${perShareChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>${perShareChange.toFixed(2)}</div>
                                  <div className="text-xs">({perSharePercentChange.toFixed(2)}%)</div>
                                </div>
                              </td>
                              <td className="py-2 px-4 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStock({ ...purchase, currentPrice });
                                    setSellDialogOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4 mr-1" />
                                  Sell
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Your personal portfolio is empty. Start by making your first trade!
                    </p>
                    <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Your First Stock
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buy Stock</DialogTitle>
                        </DialogHeader>
                        <PurchaseDialog 
                          currentBalance={currentBalance}
                          onPurchase={purchaseStockMutation.mutate}
                          isPending={purchaseStockMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sell Dialog */}
          <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sell Stock</DialogTitle>
              </DialogHeader>
              {selectedStock && (
                <SellDialog 
                  stock={selectedStock}
                  onSell={sellStockMutation.mutate}
                  isPending={sellStockMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Trading Streak Info Dialog */}
          <Dialog open={streakInfoOpen} onOpenChange={setStreakInfoOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Trading Streak Explained
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">What is a Trading Streak?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your trading streak counts consecutive days where you made at least one trade (buy or sell) in your personal portfolio.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">How it Works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Day 1:</strong> You buy AAPL → Streak: 1 day</li>
                    <li>• <strong>Day 2:</strong> You sell NVDA → Streak: 2 days</li>
                    <li>• <strong>Day 3:</strong> No trades → Streak: 0 days (resets)</li>
                    <li>• <strong>Day 4:</strong> You buy MSFT → Streak: 1 day (starts fresh)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Tips to Maintain Your Streak:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Make at least one trade every day</li>
                    <li>• Both buying and selling count as trading activity</li>
                    <li>• Tournament trades don't count toward personal streak</li>
                    <li>• Streak resets if you skip a day without trading</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Current Streak:</strong> {tradingStreak} {tradingStreak === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}

// Purchase Dialog Component
function PurchaseDialog({ 
  currentBalance, 
  onPurchase, 
  isPending 
}: { 
  currentBalance: number; 
  onPurchase: (data: any) => void; 
  isPending: boolean; 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [shares, setShares] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoadingSearch(true);
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.data.slice(0, 10)); // Limit to 10 results
        }
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const fetchStockPrice = async (stockSymbol: string) => {
    setIsLoadingPrice(true);
    try {
      const response = await fetch(`/api/quote/${stockSymbol.toUpperCase()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentPrice(result.data.price);
        }
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleStockSelect = (stock: any) => {
    setSelectedStock(stock);
    setSearchQuery('');
    setSearchResults([]);
    fetchStockPrice(stock.symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !shares || !currentPrice) return;
    
    const totalCost = parseFloat(shares) * currentPrice;
    if (totalCost > currentBalance) {
      alert('Insufficient balance for this purchase');
      return;
    }

    onPurchase({
      symbol: selectedStock.symbol,
      companyName: selectedStock.name,
      shares: parseInt(shares),
      purchasePrice: currentPrice,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!selectedStock ? (
        <div className="space-y-2">
          <Label htmlFor="search">Search for a stock</Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchStocks(e.target.value);
            }}
            placeholder="Search by company name or symbol..."
            className="w-full"
          />
          
          {isLoadingSearch && (
            <div className="text-center py-2">
              <span className="text-muted-foreground">Searching stocks...</span>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleStockSelect(stock)}
                  className="w-full p-3 text-left hover:bg-accent/50 border-b last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground truncate">{stock.name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{stock.exchange}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border rounded-md p-3">
            <div>
              <div className="font-medium">{selectedStock.symbol}</div>
              <div className="text-sm text-muted-foreground">{selectedStock.name}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStock(null);
                setCurrentPrice(null);
                setShares('');
              }}
            >
              Change
            </Button>
          </div>

          <div>
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Enter number of shares"
              min="1"
            />
          </div>

          {isLoadingPrice && (
            <div className="text-center py-2">
              <span className="text-muted-foreground">Loading current price...</span>
            </div>
          )}

          {currentPrice && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Price:</span>
                <span className="font-medium">${currentPrice.toFixed(2)}</span>
              </div>
              {shares && (
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-medium">${(parseFloat(shares) * currentPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Available Balance:</span>
                <span className="font-medium">${currentBalance.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!selectedStock || !shares || !currentPrice || isPending || isLoadingPrice}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isPending ? 'Purchasing...' : 'Purchase Stock'}
          </Button>
        </div>
      )}
    </form>
  );
}

// Sell Dialog Component
function SellDialog({ 
  stock, 
  onSell, 
  isPending 
}: { 
  stock: any; 
  onSell: (data: any) => void; 
  isPending: boolean; 
}) {
  const [sharesToSell, setSharesToSell] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharesToSell || parseInt(sharesToSell) <= 0) return;

    onSell({
      purchaseId: stock.id,
      sharesToSell: parseInt(sharesToSell),
      currentPrice: stock.currentPrice,
    });
  };

  const saleValue = sharesToSell ? parseInt(sharesToSell) * stock.currentPrice : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Stock:</span>
          <span className="font-medium">{stock.symbol}</span>
        </div>
        <div className="flex justify-between">
          <span>Shares Owned:</span>
          <span className="font-medium">{stock.shares}</span>
        </div>
        <div className="flex justify-between">
          <span>Current Price:</span>
          <span className="font-medium">${stock.currentPrice.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="sharesToSell">Shares to Sell</Label>
        <Input
          id="sharesToSell"
          type="number"
          value={sharesToSell}
          onChange={(e) => setSharesToSell(e.target.value)}
          placeholder="Enter number of shares to sell"
          min="1"
          max={stock.shares}
        />
      </div>

      {sharesToSell && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Sale Value:</span>
            <span className="font-medium">${saleValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining Shares:</span>
            <span className="font-medium">{stock.shares - parseInt(sharesToSell)}</span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!sharesToSell || parseInt(sharesToSell) <= 0 || parseInt(sharesToSell) > stock.shares || isPending}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        {isPending ? 'Selling...' : 'Sell Stock'}
      </Button>
    </form>
  );
}