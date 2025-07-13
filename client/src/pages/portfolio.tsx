import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

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

  // Fetch user's tournaments
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  // Get the first tournament for portfolio display
  const selectedTournament = tournaments.length > 0 ? tournaments[0] : null;

  // Fetch tournament balance
  const { data: balanceData } = useQuery({
    queryKey: ['tournament-balance', selectedTournament?.tournaments?.id, user?.id],
    queryFn: async () => {
      if (!selectedTournament?.tournaments?.id || !user?.id) return null;
      const response = await fetch(`/api/tournaments/${selectedTournament.tournaments.id}/balance`);
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : null;
      }
      return null;
    },
    enabled: !!selectedTournament?.tournaments?.id && !!user?.id,
  });

  // Fetch tournament purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ['tournament-purchases', selectedTournament?.tournaments?.id, user?.id],
    queryFn: async () => {
      if (!selectedTournament?.tournaments?.id || !user?.id) return [];
      const response = await fetch(`/api/tournaments/${selectedTournament.tournaments.id}/purchases`);
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : [];
      }
      return [];
    },
    enabled: !!selectedTournament?.tournaments?.id && !!user?.id,
  });

  // Fetch current prices for purchased stocks
  const purchasedSymbols = purchases.map((purchase: any) => purchase.symbol);
  const { data: stockPrices = {} } = useQuery({
    queryKey: ['purchased-stock-prices', purchasedSymbols],
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
    enabled: purchasedSymbols.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate portfolio metrics
  const portfolioValue = purchases.reduce((total: number, purchase: any) => {
    const currentPrice = stockPrices[purchase.symbol] || purchase.purchasePrice;
    return total + (currentPrice * purchase.shares);
  }, 0);

  const totalInvested = purchases.reduce((total: number, purchase: any) => {
    return total + (purchase.purchasePrice * purchase.shares);
  }, 0);

  const totalGainLoss = portfolioValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const currentBalance = balanceData?.balance || 0;
  const totalPortfolioValue = currentBalance + portfolioValue;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your portfolio</h2>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Overview</h1>
            <p className="text-muted-foreground">
              {selectedTournament ? 
                `Tournament: ${selectedTournament.tournaments.name}` : 
                "No active tournament selected"
              }
            </p>
          </motion.div>

          {selectedTournament ? (
            <>
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
                      Across {purchases.length} positions
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
                      {((currentBalance / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
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
                      Holdings ({purchases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {purchases.length > 0 ? (
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
                            {purchases.map((purchase: any) => {
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
                        <p className="text-muted-foreground">No holdings yet. Start trading to build your portfolio!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <motion.div className="text-center py-12" variants={fadeInUp}>
              <h2 className="text-2xl font-bold mb-4">No Active Tournament</h2>
              <p className="text-muted-foreground mb-6">
                Join or create a tournament to start building your portfolio
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}