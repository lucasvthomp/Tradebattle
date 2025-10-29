import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tournament } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  DollarSign,
  Trophy,
  Users,
  Settings,
  Layout,
  Grid3x3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketStatusDisclaimer } from "@/components/MarketStatusDisclaimer";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";
import { Responsive, WidthProvider, Layout as GridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@/styles/grid-layout.css";

// Widget Components
import { PortfolioValueWidget } from "@/components/dashboard/widgets/PortfolioValueWidget";
import { TradingExecutionWidget, OrderRequest } from "@/components/dashboard/widgets/TradingExecutionWidget";
import { HoldingsWidget } from "@/components/dashboard/widgets/HoldingsWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { LeaderboardWidget } from "@/components/dashboard/widgets/LeaderboardWidget";
import { BuyOrderDialog } from "@/components/dashboard/dialogs/BuyOrderDialog";
import { ShortOrderDialog } from "@/components/dashboard/dialogs/ShortOrderDialog";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget type definition
type WidgetType = 'portfolio' | 'buyStocks' | 'holdings' | 'chart' | 'leaderboard';

interface WidgetConfig {
  i: string;
  type: WidgetType;
  enabled: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
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
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  // Track window dimensions for responsive sizing
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic row height based on viewport
  const calculateRowHeight = () => {
    // Available height: viewport height minus header (4rem) and dashboard controls (~8rem)
    const availableHeight = dimensions.height - 192; // ~12rem in pixels
    // Divide by number of rows (7) to get optimal row height
    const calculatedHeight = Math.floor(availableHeight / 7);
    // Ensure minimum height of 60px and maximum of 120px
    return Math.max(60, Math.min(120, calculatedHeight));
  };

  const rowHeight = calculateRowHeight();

  // Widget configuration state
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { i: 'portfolio', type: 'portfolio', enabled: true },
    { i: 'buyStocks', type: 'buyStocks', enabled: true },
    { i: 'holdings', type: 'holdings', enabled: true },
    { i: 'chart', type: 'chart', enabled: true },
    { i: 'leaderboard', type: 'leaderboard', enabled: true },
  ]);

  // Widget size constraints
  const widgetConstraints: Record<string, any> = {
    portfolio: { minW: 3, minH: 3, maxW: 4, maxH: 4 },
    buyStocks: { minW: 3, minH: 2, maxW: 4, maxH: 4 },
    leaderboard: { minW: 3, minH: 3, maxW: 4, maxH: 4 },
    chart: { minW: 4, minH: 3, maxW: 12, maxH: 8 },
    holdings: { minW: 3, minH: 3, maxW: 6, maxH: 4 },
  };

  // Apply constraints to layout items
  const applyConstraints = (layout: any[]) => {
    return layout.map(item => ({
      ...item,
      ...widgetConstraints[item.i],
      // Enforce y position doesn't exceed maxRows
      y: Math.min(item.y, 4),
      // Enforce height doesn't push off screen
      h: Math.min(item.h, widgetConstraints[item.i]?.maxH || 4)
    }));
  };

  // Load saved layout from localStorage
  const [layouts, setLayouts] = useState<any>(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      const parsed = JSON.parse(savedLayouts);
      // Apply constraints to saved layouts
      return {
        lg: applyConstraints(parsed.lg || []),
        md: applyConstraints(parsed.md || []),
        sm: applyConstraints(parsed.sm || []),
        xs: applyConstraints(parsed.xs || [])
      };
    }
    return {
      lg: [
        { i: 'portfolio', x: 0, y: 0, w: 3, h: 3, ...widgetConstraints.portfolio },
        { i: 'buyStocks', x: 3, y: 0, w: 3, h: 3, ...widgetConstraints.buyStocks },
        { i: 'leaderboard', x: 6, y: 0, w: 3, h: 3, ...widgetConstraints.leaderboard },
        { i: 'chart', x: 0, y: 3, w: 7, h: 4, ...widgetConstraints.chart },
        { i: 'holdings', x: 7, y: 3, w: 5, h: 4, ...widgetConstraints.holdings },
      ],
      md: [
        { i: 'portfolio', x: 0, y: 0, w: 4, h: 3, ...widgetConstraints.portfolio },
        { i: 'buyStocks', x: 5, y: 0, w: 5, h: 3, ...widgetConstraints.buyStocks },
        { i: 'leaderboard', x: 0, y: 3, w: 4, h: 4, ...widgetConstraints.leaderboard },
        { i: 'chart', x: 4, y: 3, w: 6, h: 4, ...widgetConstraints.chart },
        { i: 'holdings', x: 0, y: 7, w: 10, h: 3, ...widgetConstraints.holdings },
      ],
      sm: [
        { i: 'portfolio', x: 0, y: 0, w: 6, h: 3, ...widgetConstraints.portfolio },
        { i: 'buyStocks', x: 0, y: 3, w: 6, h: 3, ...widgetConstraints.buyStocks },
        { i: 'chart', x: 0, y: 6, w: 6, h: 4, ...widgetConstraints.chart },
        { i: 'holdings', x: 0, y: 10, w: 6, h: 3, ...widgetConstraints.holdings },
        { i: 'leaderboard', x: 0, y: 13, w: 6, h: 4, ...widgetConstraints.leaderboard },
      ],
      xs: [
        { i: 'portfolio', x: 0, y: 0, w: 4, h: 3, ...widgetConstraints.portfolio },
        { i: 'buyStocks', x: 0, y: 3, w: 4, h: 3, ...widgetConstraints.buyStocks },
        { i: 'chart', x: 0, y: 6, w: 4, h: 4, ...widgetConstraints.chart },
        { i: 'holdings', x: 0, y: 10, w: 4, h: 3, ...widgetConstraints.holdings },
        { i: 'leaderboard', x: 0, y: 13, w: 4, h: 3, ...widgetConstraints.leaderboard },
      ],
    };
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
    enabled: !!user && !!selectedTournament?.id,
  });

  // Tournament balance query
  const { data: tournamentBalance, isLoading: balanceLoading } = useQuery({
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

      const endpoint = `/api/tournaments/${selectedTournament.id}/purchase`;
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
      toast({ title: `${actionLabel} successful!` });
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
        title: `${actionLabel} failed`,
        description: error.message || `Unable to execute ${actionLabel.toLowerCase()}`,
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
      return (tournamentBalance as any)?.balance || (tournamentBalance as any)?.data?.balance || 0;
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

  // Save layout to localStorage with constraints
  const handleLayoutChange = (layout: any, layouts: any) => {
    // Apply constraints before saving
    const constrainedLayouts = {
      lg: applyConstraints(layouts.lg || []),
      md: applyConstraints(layouts.md || []),
      sm: applyConstraints(layouts.sm || []),
      xs: applyConstraints(layouts.xs || [])
    };
    setLayouts(constrainedLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(constrainedLayouts));
  };

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w =>
      w.i === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  // Reset to default layout
  const resetLayout = () => {
    localStorage.removeItem('dashboard-layouts');
    window.location.reload();
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
    <div className="h-[calc(100vh-4rem)] bg-background overflow-hidden px-4 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Trading Dashboard</h1>

              {/* Tournament Selector */}
              {activeTournaments.length > 0 && selectedTournament && (
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <Select
                    value={selectedTournament?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const tournament = activeTournaments.find((t: any) => t.id.toString() === value);
                      setSelectedTournament(tournament);
                    }}
                  >
                    <SelectTrigger className="w-[250px] h-8">
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
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedTournament.currentPlayers}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatCurrency(getCurrentBalance())}
              </Badge>

              {/* Widget Customization Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layout className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onInteractOutside={(e) => e.preventDefault()}>
                  <DropdownMenuLabel>Widgets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {widgets.map(widget => (
                    <DropdownMenuCheckboxItem
                      key={widget.i}
                      checked={widget.enabled}
                      onCheckedChange={() => toggleWidget(widget.i)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {widget.type === 'portfolio' && 'Portfolio Value'}
                      {widget.type === 'buyStocks' && 'Trading Execution'}
                      {widget.type === 'holdings' && 'Holdings'}
                      {widget.type === 'chart' && 'Trading Chart'}
                      {widget.type === 'leaderboard' && 'Leaderboard'}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetLayout}>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Reset Layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
      </motion.div>

      {/* Tournament Trading Section */}
      {activeTournaments.length === 0 ? (
        <Card className="flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
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
        selectedTournament && (
          <div className="overflow-hidden" style={{ height: `${dimensions.height - 192}px` }}>
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
              rowHeight={rowHeight}
              onLayoutChange={handleLayoutChange}
              compactType="vertical"
              preventCollision={true}
              isDraggable={true}
              isResizable={true}
              resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'n', 'e', 'w']}
              isBounded={true}
              margin={[8, 8]}
              verticalCompact={true}
            >
                      {widgets.find(w => w.i === 'portfolio')?.enabled && (
                        <div key="portfolio">
                          <PortfolioValueWidget
                            portfolioValue={portfolioMetrics.totalValue}
                            cashBalance={portfolioMetrics.cashBalance}
                            profitLoss={portfolioMetrics.profitLoss}
                            profitLossPercent={portfolioMetrics.profitLossPercent}
                          />
                        </div>
                      )}

                      {widgets.find(w => w.i === 'chart')?.enabled && (
                        <div key="chart">
                          <ChartWidget
                            selectedStock={selectedChartStock}
                            tournamentId={selectedTournament.id}
                            onExpand={() => setIsChartExpanded(!isChartExpanded)}
                            isExpanded={isChartExpanded}
                          />
                        </div>
                      )}

                      {widgets.find(w => w.i === 'buyStocks')?.enabled && (
                        <div key="buyStocks">
                          <TradingExecutionWidget
                            tournamentId={selectedTournament.id}
                            holdings={getCurrentPortfolio()}
                            onExecute={handleOrderExecution}
                          />
                        </div>
                      )}

                      {widgets.find(w => w.i === 'holdings')?.enabled && (
                        <div key="holdings">
                          <HoldingsWidget
                            holdings={getCurrentPortfolio()}
                            isLoading={isPortfolioLoading()}
                            onChartClick={(symbol) => setSelectedChartStock(symbol)}
                            onSellClick={(holding) => {
                              setSelectedSellStock(holding);
                              setSellDialogOpen(true);
                            }}
                          />
                        </div>
                      )}

                      {widgets.find(w => w.i === 'leaderboard')?.enabled && (
                        <div key="leaderboard">
                          <LeaderboardWidget
                            tournamentId={selectedTournament.id}
                            onViewFull={() => setLeaderboardDialogOpen(true)}
                          />
                        </div>
                      )}
            </ResponsiveGridLayout>
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
                      tournamentId: selectedTournament?.id,
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
