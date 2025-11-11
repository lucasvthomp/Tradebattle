import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";

// Components
import { PortfolioStatsBar } from "@/components/dashboard/PortfolioStatsBar";
import { TradingExecutionWidget, OrderRequest } from "@/components/dashboard/widgets/TradingExecutionWidget";
import { HoldingsWidget } from "@/components/dashboard/widgets/HoldingsWidget";
import { AdvancedTradingChart } from "@/components/portfolio/widgets/AdvancedTradingChart";
import { BuyOrderDialog } from "@/components/dashboard/dialogs/BuyOrderDialog";
import { ShortOrderDialog } from "@/components/dashboard/dialogs/ShortOrderDialog";

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedChartStock, setSelectedChartStock] = useState<string>("AAPL");
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [shortDialogOpen, setShortDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderRequest | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [showHoldings, setShowHoldings] = useState(false);

  // Tournament queries
  const { data: tournamentsResponse } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const userTournaments = (tournamentsResponse as any)?.data || [];
  const activeTournaments = userTournaments.filter((t: any) => t.status === 'active');

  // Tournament portfolio query
  const { data: tournamentPortfolio = [], refetch: refetchTournament } = useQuery({
    queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    enabled: !!user && !!selectedTournament?.id,
  });

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

  // Advanced order execution
  const executeOrderMutation = useMutation({
    mutationFn: async (order: OrderRequest) => {
      if (!selectedTournament) return;

      const endpoint = `/api/tournaments/\${selectedTournament.id}/purchase`;
      const payload = {
        symbol: order.stock.symbol,
        companyName: order.stock.shortName || order.stock.longName || order.stock.symbol,
        shares: order.shares,
        purchasePrice: order.limitPrice || order.stock.price,
        orderType: order.orderType,
        stopLoss: order.stopLoss?.enabled ? order.stopLoss : undefined,
        takeProfit: order.takeProfit?.enabled ? order.takeProfit : undefined,
        timeInForce: order.timeInForce,
      };

      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: (_, order) => {
      const actionLabel = order.action === 'buy' ? 'Purchase' :
                         order.action === 'short_sell' ? 'Short sell' : 'Cover';
      toast({ title: `\${actionLabel} successful!` });
      setBuyDialogOpen(false);
      setShortDialogOpen(false);
      setCurrentOrder(null);
      if (selectedTournament) {
        refetchTournament();
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament.id, "balance"] });
      }
    },
    onError: (error: any, order) => {
      const actionLabel = order.action === 'buy' ? 'Purchase' :
                         order.action === 'short_sell' ? 'Short sell' : 'Cover';
      toast({
        title: `\${actionLabel} failed`,
        description: error.message || `Unable to execute \${actionLabel.toLowerCase()}`,
        variant: "destructive",
      });
    },
  });

  const handleOrderExecution = (order: OrderRequest) => {
    setCurrentOrder(order);
    if (order.action === 'buy' || order.action === 'short_cover') {
      setBuyDialogOpen(true);
    } else if (order.action === 'short_sell') {
      setShortDialogOpen(true);
    }
  };

  const handleConfirmOrder = (order: OrderRequest) => {
    executeOrderMutation.mutate(order);
  };

  // Sell stock mutation
  const sellStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; sharesToSell: number; currentPrice: number; tournamentId?: number }) => {
      const endpoint = data.tournamentId
        ? `/api/tournaments/\${data.tournamentId}/sell`
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
      return (tournamentBalance as any)?.balance || (tournamentBalance as any)?.data?.balance || 0;
    }
    return 0;
  };

  const getCurrentPortfolio = (): any[] => {
    const tournamentData = (tournamentPortfolio as any)?.data || tournamentPortfolio;
    const tournament = Array.isArray(tournamentData) ? tournamentData : [];
    return tournament;
  };

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const portfolio = getCurrentPortfolio();
    const cashBalance = getCurrentBalance();
    const holdingsValue = portfolio.reduce((total, holding) =>
      total + (holding.shares || 0) * (holding.currentPrice || 0), 0
    );
    const totalValue = holdingsValue + cashBalance;
    const profitLoss = portfolio.reduce((total, holding) =>
      total + (holding.shares || 0) * ((holding.currentPrice || 0) - (holding.purchasePrice || 0)), 0
    );
    const initialValue = selectedTournament?.buyInAmount || 10000;
    const profitLossPercent = ((totalValue - initialValue) / initialValue) * 100;

    return {
      totalValue,
      cashBalance,
      holdingsValue,
      profitLoss,
      profitLossPercent,
      holdingsCount: portfolio.length,
    };
  }, [tournamentPortfolio, tournamentBalance, selectedTournament]);

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

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#06121F' }}>
      {/* Tournament Trading Section */}
      {activeTournaments.length === 0 ? (
        <Card className="flex items-center justify-center flex-1 m-6" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
          <CardContent className="py-8">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: '#E3B341' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#C9D1E2' }}>No Active Tournaments</h3>
              <p className="mb-4" style={{ color: '#8A93A6' }}>
                Join or create a tournament to start competitive trading
              </p>
              <Button asChild style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                <a href="/tournaments">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Tournaments
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        selectedTournament && (
          <div className="flex flex-col flex-1">
            {/* Portfolio Stats Bar */}
            <PortfolioStatsBar
              portfolioValue={portfolioMetrics.totalValue}
              cashBalance={portfolioMetrics.cashBalance}
              profitLoss={portfolioMetrics.profitLoss}
              profitLossPercent={portfolioMetrics.profitLossPercent}
              rank={1}
              totalPlayers={selectedTournament.currentPlayers}
              selectedTournament={selectedTournament}
              activeTournaments={activeTournaments}
              onTournamentChange={(value) => {
                const tournament = activeTournaments.find((t: any) => t.id.toString() === value);
                setSelectedTournament(tournament);
              }}
            />

            {/* Main Content Area - Split Layout */}
            <div className="flex flex-1 gap-4 p-4">
              {/* Left Side - Chart (2/3 width) */}
              <div className="flex-[2] flex flex-col">
                <AdvancedTradingChart
                  selectedStock={selectedChartStock}
                  tournamentId={selectedTournament.id}
                />
              </div>

              {/* Right Side - Trading or Holdings (1/3 width) */}
              <div className="flex-1 flex flex-col">
                {showHoldings ? (
                  <HoldingsWidget
                    holdings={getCurrentPortfolio()}
                    isLoading={false}
                    onChartClick={(symbol) => setSelectedChartStock(symbol)}
                    onSellClick={(holding) => {
                      setSelectedSellStock(holding);
                      setSellDialogOpen(true);
                    }}
                    showHoldings={showHoldings}
                    onToggleView={() => setShowHoldings(!showHoldings)}
                  />
                ) : (
                  <TradingExecutionWidget
                    tournamentId={selectedTournament.id}
                    holdings={getCurrentPortfolio()}
                    onExecute={handleOrderExecution}
                    showHoldings={showHoldings}
                    onToggleView={() => setShowHoldings(!showHoldings)}
                  />
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* Tournament Leaderboard Dialog */}
      <TournamentLeaderboardDialog
        tournament={selectedTournament}
        isOpen={leaderboardDialogOpen}
        onClose={() => setLeaderboardDialogOpen(false)}
      />

      {/* Buy Order Dialog */}
      <BuyOrderDialog
        isOpen={buyDialogOpen}
        onClose={() => {
          setBuyDialogOpen(false);
          setCurrentOrder(null);
        }}
        onConfirm={handleConfirmOrder}
        initialOrder={currentOrder}
        balance={getCurrentBalance()}
      />

      {/* Short Order Dialog */}
      <ShortOrderDialog
        isOpen={shortDialogOpen}
        onClose={() => {
          setShortDialogOpen(false);
          setCurrentOrder(null);
        }}
        onConfirm={handleConfirmOrder}
        initialOrder={currentOrder}
        balance={getCurrentBalance()}
      />

      {/* Sell Stock Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#C9D1E2' }}>Sell Stock - {selectedSellStock?.symbol}</DialogTitle>
            <DialogDescription style={{ color: '#8A93A6' }}>
              Enter the number of shares you want to sell
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sellAmount" style={{ color: '#C9D1E2' }}>Shares to Sell</Label>
              <Input
                id="sellAmount"
                type="number"
                min="1"
                max={selectedSellStock?.shares || 0}
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="Enter number of shares to sell..."
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              <p className="text-sm mt-1" style={{ color: '#8A93A6' }}>
                You own {selectedSellStock?.shares || 0} shares
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSellDialogOpen(false)} style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
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
                      tournamentId: selectedTournament?.id,
                    });
                  }
                }}
                disabled={!sellAmount || parseInt(sellAmount) <= 0 || sellStockMutation.isPending}
                style={{ backgroundColor: '#FF4F58', color: '#FFFFFF' }}
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
