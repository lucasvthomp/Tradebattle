import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, Crown, Calendar, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

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

  // Check if user has premium subscription
  const hasPremium = user?.subscriptionTier === 'premium';

  // Fetch personal portfolio balance and data
  const { data: personalPortfolio } = useQuery({
    queryKey: ['/api/personal-portfolio'],
    enabled: !!user && hasPremium,
  });

  // Fetch personal stock purchases
  const { data: personalPurchases = [] } = useQuery({
    queryKey: ['/api/personal-purchases'],
    enabled: !!user && hasPremium,
  });

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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate portfolio metrics
  const portfolioValue = personalPurchases.reduce((total: number, purchase: any) => {
    const currentPrice = stockPrices[purchase.symbol] || purchase.purchasePrice;
    return total + (currentPrice * purchase.shares);
  }, 0);

  const totalInvested = personalPurchases.reduce((total: number, purchase: any) => {
    return total + (purchase.purchasePrice * purchase.shares);
  }, 0);

  const totalGainLoss = portfolioValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const currentBalance = personalPortfolio?.balance || 10000;
  const totalPortfolioValue = currentBalance + portfolioValue;

  // Calculate days with personal portfolio
  const portfolioStartDate = user?.personalPortfolioStartDate ? new Date(user.personalPortfolioStartDate) : null;
  const daysWithPortfolio = portfolioStartDate ? 
    Math.floor((Date.now() - portfolioStartDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Initialize personal portfolio mutation
  const initializePortfolioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/personal-portfolio/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personal-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
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
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{daysWithPortfolio}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground">Portfolio streak</p>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Summary Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={fadeInUp}>
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

          {/* Holdings Table */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Personal Holdings ({personalPurchases.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalPurchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Symbol</th>
                          <th className="text-left py-2 px-4 font-medium">Shares</th>
                          <th className="text-left py-2 px-4 font-medium">Avg Cost</th>
                          <th className="text-left py-2 px-4 font-medium">Current Price</th>
                          <th className="text-left py-2 px-4 font-medium">Market Value</th>
                          <th className="text-left py-2 px-4 font-medium">Gain/Loss</th>
                          <th className="text-left py-2 px-4 font-medium">% Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personalPurchases.map((purchase: any) => {
                          const currentPrice = stockPrices[purchase.symbol] || purchase.purchasePrice;
                          const marketValue = currentPrice * purchase.shares;
                          const totalCost = purchase.purchasePrice * purchase.shares;
                          const gainLoss = marketValue - totalCost;
                          const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
                          
                          return (
                            <tr key={purchase.id} className="border-b hover:bg-accent/50">
                              <td className="py-2 px-4">
                                <div className="font-medium">{purchase.symbol}</div>
                              </td>
                              <td className="py-2 px-4">{purchase.shares}</td>
                              <td className="py-2 px-4">${purchase.purchasePrice.toFixed(2)}</td>
                              <td className="py-2 px-4">${currentPrice.toFixed(2)}</td>
                              <td className="py-2 px-4">${marketValue.toFixed(2)}</td>
                              <td className="py-2 px-4">
                                <span className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  ${gainLoss.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                <Badge variant={gainLoss >= 0 ? 'default' : 'destructive'}>
                                  {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                </Badge>
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
                    {!portfolioStartDate && (
                      <Button 
                        onClick={() => initializePortfolioMutation.mutate()}
                        disabled={initializePortfolioMutation.isPending}
                      >
                        {initializePortfolioMutation.isPending ? 'Starting...' : 'Start Personal Portfolio'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}