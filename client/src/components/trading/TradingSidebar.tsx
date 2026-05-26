import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { executeOrder, type OrderRequest } from "@/lib/orderEngine";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isMarketOpen } from "@shared/marketHours";
import { TradeHistory } from "./TradeHistory";

interface TradingSidebarProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  selectedTournament: any;
  onTournamentChange: (tournament: any) => void;
  activeTournaments: any[];
  buyingPower: number;
  portfolioData: any;
  companyName: string;
  currentPrice: number;
  ownedShares: number;
  onOrderExecuted: () => void;
  startingBalance: number;
}

type ActiveView = "positions" | "history" | "trade";
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop_market" | "stop_limit";
type BuyInMode = "shares" | "dollars";

export function TradingSidebar({
  selectedSymbol,
  onSymbolChange,
  selectedTournament,
  onTournamentChange,
  activeTournaments,
  buyingPower,
  portfolioData,
  companyName,
  currentPrice,
  ownedShares,
  onOrderExecuted,
  startingBalance,
}: TradingSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useUserPreferences();

  const [activeView, setActiveView] = useState<ActiveView>("positions");

  // Order form state
  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [buyInMode, setBuyInMode] = useState<BuyInMode>("shares");
  const [quantity, setQuantity] = useState(1);
  const [dollarAmount, setDollarAmount] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);
  const [stopPrice, setStopPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  // Market hours
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const isCryptoTournament = selectedTournament?.tournamentType === "crypto";
  const tradingBlocked = !marketOpen && !isCryptoTournament;

  useEffect(() => {
    const interval = setInterval(() => setMarketOpen(isMarketOpen()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Stock search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["/api/search", searchQuery, selectedTournament?.id],
    enabled: searchQuery.length >= 1 && !!selectedTournament?.id,
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedTournament?.id && { tournamentId: selectedTournament.id.toString() })
      });
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const results = (searchData as any)?.data || [];
    return results.slice(0, 8);
  }, [searchData, searchQuery]);

  // Holdings data
  const holdings = useMemo(() => {
    const raw = (portfolioData as any)?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((h: any) => h.shares > 0);
  }, [portfolioData]);

  // Portfolio summary calculations
  const invested = holdings.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0);
  const totalPL = holdings.reduce((sum: number, h: any) => sum + (h.profitLoss || 0), 0);
  const totalValue = buyingPower + invested;
  const pctChange =
    startingBalance > 0 ? ((totalValue - startingBalance) / startingBalance) * 100 : 0;

  const formatMoney = (val: number) => {
    const abs = Math.abs(val);
    return (
      (val < 0 ? "-" : "") +
      "$" +
      abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  };

  // Bid/Ask spread (simulated ~0.02% spread from market price)
  const spread = currentPrice * 0.0001;
  const bidPrice = currentPrice > 0 ? currentPrice - spread : 0;
  const askPrice = currentPrice > 0 ? currentPrice + spread : 0;

  // Order logic — compute effective quantity and total
  const effectiveQuantity = buyInMode === "dollars" && currentPrice > 0
    ? Math.floor(dollarAmount / currentPrice)
    : quantity;
  const estimatedTotal = effectiveQuantity * currentPrice;

  const canSubmit = (() => {
    if (tradingBlocked) return false;
    if (!selectedTournament?.id || !selectedSymbol || currentPrice <= 0) return false;
    if (effectiveQuantity <= 0) return false;
    if (orderSide === "buy" && estimatedTotal > buyingPower) return false;
    if (orderSide === "sell" && effectiveQuantity > ownedShares) return false;
    return true;
  })();

  const handleSubmit = async () => {
    if (!awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }

    setIsSubmitting(true);
    setAwaitingConfirm(false);
    try {
      const order: OrderRequest = {
        tournamentId: selectedTournament.id,
        symbol: selectedSymbol,
        companyName,
        side: orderSide,
        quantity: effectiveQuantity,
        currentMarketPrice: currentPrice,
      };
      const result = await executeOrder(order);
      toast({ title: result.message });
      setQuantity(1);
      setDollarAmount(0);
      onOrderExecuted();
      queryClient.invalidateQueries({
        queryKey: ["/api/tournaments", selectedTournament.id, "balance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/portfolio/tournament", selectedTournament.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/tournaments", selectedTournament.id, "trades"],
      });
      // Go back to positions after successful trade
      setActiveView("positions");
    } catch (error: any) {
      toast({
        title: `${orderSide === "buy" ? "Buy" : "Sell"} failed`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSideChange = (side: OrderSide) => {
    setOrderSide(side);
    setAwaitingConfirm(false);
    setOrderType("market");
    setBuyInMode("shares");
  };

  const handleSearchSelect = (sym: string) => {
    onSymbolChange(sym);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleHoldingClick = (symbol: string) => {
    onSymbolChange(symbol);
    setActiveView("trade");
    setQuantity(1);
    setDollarAmount(0);
    setAwaitingConfirm(false);
    setOrderType("market");
    setBuyInMode("shares");
  };

  const buttonLabel = (() => {
    if (isSubmitting) return "Submitting...";
    if (awaitingConfirm) return `Confirm ${orderSide === "buy" ? "Buy" : "Short"}`;
    return `${orderSide === "buy" ? "Buy" : "Short"} ${selectedSymbol}`;
  })();

  return (
    <div data-tour="trading-sidebar" className="flex flex-col h-full min-h-0">
      {/* Tournament Selector + Buying Power — always visible */}
      <div className="p-3 space-y-2 shrink-0" style={{ borderBottom: "1px solid #1F2937" }}>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "#94A3B8" }}>
            Tournament
          </label>
          <Select
            value={selectedTournament?.id?.toString() || ""}
            onValueChange={(value) => {
              const t = activeTournaments.find((t: any) => t.id.toString() === value);
              if (t) onTournamentChange(t);
            }}
          >
            <SelectTrigger
              className="h-11 md:h-9"
              style={{ backgroundColor: "#080C14", borderColor: "#1F2937", color: "#E3B341" }}
            >
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#111827", borderColor: "#1F2937" }}>
              {activeTournaments.map((t: any) => (
                <SelectItem key={t.id} value={t.id.toString()} style={{ color: "#F1F5F9" }}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#94A3B8" }}>
            Buying Power
          </span>
          <span className="text-sm font-semibold" style={{ color: "#E3B341" }}>
            {formatCurrency(buyingPower)}
          </span>
        </div>
      </div>

      {/* Market Status Banner */}
      {!isCryptoTournament && tradingBlocked && (
        <div
          className="px-4 py-3 flex items-center gap-3 shrink-0"
          style={{
            backgroundColor: "#2D1215",
            borderBottom: "1px solid #5C2327",
          }}
        >
          <Clock className="w-4 h-4 shrink-0" style={{ color: "#EF4444" }} />
          <div>
            <div className="text-xs font-bold" style={{ color: "#EF4444" }}>
              Stock Market Closed
            </div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>
              Mon-Fri 9:30 AM - 4:00 PM ET
            </div>
          </div>
        </div>
      )}

      {/* Crypto Market Always Open Banner */}
      {isCryptoTournament && (
        <div
          className="px-4 py-3 flex items-center gap-3 shrink-0"
          style={{
            backgroundColor: "#1A2E1F",
            borderBottom: "1px solid #2D5A3D",
          }}
        >
          <Clock className="w-4 h-4 shrink-0" style={{ color: "#28C76F" }} />
          <div>
            <div className="text-xs font-bold" style={{ color: "#28C76F" }}>
              Crypto Market - 24/7 Trading
            </div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>
              Trade anytime, anywhere
            </div>
          </div>
        </div>
      )}

      {/* Persistent Symbol Search Bar */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: "1px solid #1F2937" }}>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "#94A3B8" }}
          />
          <Input
            placeholder={selectedSymbol || "Search symbol..."}
            value={showSearch ? searchQuery : ""}
            onFocus={() => setShowSearch(true)}
            onChange={(e) => {
              setShowSearch(true);
              setSearchQuery(e.target.value.toUpperCase());
            }}
            className="h-9 pl-8 pr-8 text-sm"
            style={{
              backgroundColor: "#080C14",
              borderColor: "#1F2937",
              color: "#FFFFFF",
            }}
          />
          {showSearch && (
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
            </button>
          )}
        </div>
        {/* Search Results Dropdown */}
        {showSearch && searchQuery.length >= 1 && (
          <div
            className="absolute left-3 right-3 z-50 rounded-lg overflow-hidden"
            style={{ backgroundColor: "#111827", border: "1px solid #1F2937", marginTop: "4px" }}
          >
            {isSearching ? (
              <div className="px-3 py-2 space-y-1.5">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result: any) => (
                <button
                  key={result.symbol}
                  onClick={() => { handleSearchSelect(result.symbol); setActiveView("trade"); setQuantity(1); setAwaitingConfirm(false); }}
                  className="w-full px-3 py-2.5 text-left hover:bg-[#0F172A] flex items-center justify-between transition-colors"
                  style={{ borderBottom: "1px solid rgba(31,41,55,0.5)" }}
                >
                  <div>
                    <span className="text-sm font-bold" style={{ color: "#06B6D4" }}>{result.symbol}</span>
                    {result.name && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: "#94A3B8" }}>{result.name}</div>
                    )}
                  </div>
                  {result.exchange && (
                    <span className="text-xs ml-2" style={{ color: "#64748B" }}>{result.exchange}</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center">
                <span className="text-sm" style={{ color: "#94A3B8" }}>No results for "{searchQuery}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center shrink-0"
        style={{ borderBottom: "1px solid #1F2937" }}
      >
        <button
          onClick={() => setActiveView("positions")}
          className="flex-1 py-3 md:py-2.5 text-sm font-semibold text-center transition-colors min-h-[44px]"
          style={{
            color: activeView === "positions" ? "#E3B341" : "#94A3B8",
            borderBottom: activeView === "positions" ? "2px solid #E3B341" : "2px solid transparent",
          }}
        >
          Positions
        </button>
        <button
          onClick={() => setActiveView("history")}
          className="flex-1 py-3 md:py-2.5 text-sm font-semibold text-center transition-colors min-h-[44px]"
          style={{
            color: activeView === "history" ? "#E3B341" : "#94A3B8",
            borderBottom: activeView === "history" ? "2px solid #E3B341" : "2px solid transparent",
          }}
        >
          History
        </button>
        <button
          onClick={() => { setActiveView("trade"); setQuantity(1); setAwaitingConfirm(false); }}
          className="px-4 py-3 md:py-2.5 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
          style={{
            color: activeView === "trade" ? "#10B981" : "#94A3B8",
            borderBottom: activeView === "trade" ? "2px solid #10B981" : "2px solid transparent",
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area — scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        {/* POSITIONS VIEW */}
        {activeView === "positions" && (
          <div>
            {/* Portfolio Summary */}
            <div className="px-3 pt-3 pb-2 space-y-1.5" style={{ borderBottom: "1px solid #1F2937" }}>
              {[
                { label: "Cash", value: formatMoney(buyingPower), color: "#F1F5F9" },
                { label: "Invested", value: formatMoney(invested), color: "#F1F5F9" },
                {
                  label: "P/L",
                  value: (totalPL >= 0 ? "+" : "") + formatMoney(totalPL),
                  color: totalPL >= 0 ? "#10B981" : "#EF4444",
                },
                {
                  label: "Return",
                  value: (pctChange >= 0 ? "+" : "") + pctChange.toFixed(2) + "%",
                  color: pctChange >= 0 ? "#10B981" : "#EF4444",
                },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#64748B" }}>{s.label}</span>
                  <span className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Holdings List */}
            <div className="px-3 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Holdings</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: "rgba(6, 182, 212, 0.12)", color: "#06B6D4" }}
                >
                  {holdings.length}
                </span>
              </div>

              {holdings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: "#94A3B8" }}>No holdings yet</p>
                  <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                    Search a symbol above to trade
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {holdings.map((h: any) => {
                    const isSelected = h.symbol === selectedSymbol;
                    const isPositive = (h.profitLoss || 0) >= 0;
                    const changePercent =
                      (h.averagePurchasePrice || 0) > 0
                        ? ((h.currentPrice - h.averagePurchasePrice) / h.averagePurchasePrice) * 100
                        : 0;

                    return (
                      <button
                        key={h.symbol}
                        onClick={() => handleHoldingClick(h.symbol)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-[#0F172A]"
                        style={{
                          backgroundColor: isSelected ? "#0F172A" : "transparent",
                          borderLeft: isSelected ? "2px solid #06B6D4" : "2px solid transparent",
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: isSelected ? "#06B6D4" : "#FFFFFF" }}>
                              {h.symbol}
                            </span>
                            <span className="text-xs" style={{ color: "#64748B" }}>
                              {h.shares} {isCryptoTournament ? "units" : "sh"}
                            </span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                            Avg {formatCurrency(h.averagePurchasePrice || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                            {formatCurrency(h.currentValue || 0)}
                          </div>
                          <div className="text-xs font-medium" style={{ color: isPositive ? "#10B981" : "#EF4444" }}>
                            {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY VIEW */}
        {activeView === "history" && (
          <TradeHistory tournamentId={selectedTournament?.id} />
        )}

        {/* TRADE VIEW — Robinhood Legend style */}
        {activeView === "trade" && (
          <div>
            {/* Back button */}
            <div
              className="flex items-center px-3 py-2 shrink-0"
              style={{ borderBottom: "1px solid #1F2937" }}
            >
              <button
                onClick={() => setActiveView("positions")}
                className="p-1 rounded hover:bg-[#0F172A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </button>
            </div>

            {/* Ticker + Price Header */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                  {selectedSymbol}
                </span>
                {companyName !== selectedSymbol && (
                  <span className="text-xs truncate" style={{ color: "#64748B" }}>
                    {companyName}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold mt-0.5" style={{ color: "#FFFFFF" }}>
                {formatCurrency(currentPrice)}
              </div>
            </div>

            {/* Buy / Short Tabs */}
            <>
                <div className="flex mx-4 rounded-lg overflow-hidden" style={{ border: "1px solid #1F2937" }}>
                  <button
                    onClick={() => handleSideChange("buy")}
                    className="flex-1 py-3 md:py-2 text-base md:text-sm font-semibold text-center transition-colors min-h-[48px]"
                    style={{
                      backgroundColor: orderSide === "buy" ? "#10B981" : "transparent",
                      color: orderSide === "buy" ? "#000000" : "#94A3B8",
                    }}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleSideChange("sell")}
                    className="flex-1 py-3 md:py-2 text-base md:text-sm font-semibold text-center transition-colors min-h-[48px]"
                    style={{
                      backgroundColor: orderSide === "sell" ? "#EF4444" : "transparent",
                      color: orderSide === "sell" ? "#FFFFFF" : "#94A3B8",
                    }}
                  >
                    Short
                  </button>
                </div>

                {/* Order Form — Robinhood Legend rows */}
                <div className="px-4 pt-4 space-y-0">
                  {/* Order Type Row */}
                  <div
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid #1F2937" }}
                  >
                    <span className="text-sm" style={{ color: "#F1F5F9" }}>Order Type</span>
                    <Select value={orderType} onValueChange={(v) => { setOrderType(v as OrderType); setAwaitingConfirm(false); }}>
                      <SelectTrigger
                        className="w-auto h-auto p-0 border-0 bg-transparent gap-1"
                        style={{ color: "#10B981" }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: "#111827", borderColor: "#1F2937" }}>
                        <SelectItem value="market" style={{ color: "#F1F5F9" }}>Market</SelectItem>
                        <SelectItem value="limit" style={{ color: "#F1F5F9" }}>Limit</SelectItem>
                        <SelectItem value="stop_market" style={{ color: "#F1F5F9" }}>Stop Market</SelectItem>
                        <SelectItem value="stop_limit" style={{ color: "#F1F5F9" }}>Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limit Price Row (only for limit / stop limit) */}
                  {(orderType === "limit" || orderType === "stop_limit") && (
                    <div
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid #1F2937" }}
                    >
                      <span className="text-sm" style={{ color: "#F1F5F9" }}>Limit Price</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={limitPrice || ""}
                        onChange={(e) => { setLimitPrice(parseFloat(e.target.value) || 0); setAwaitingConfirm(false); }}
                        placeholder="0.00"
                        className="w-28 h-11 md:h-7 text-right text-base md:text-sm border-0 bg-transparent p-0"
                        style={{ color: "#10B981" }}
                      />
                    </div>
                  )}

                  {/* Stop Price Row (only for stop market / stop limit) */}
                  {(orderType === "stop_market" || orderType === "stop_limit") && (
                    <div
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid #1F2937" }}
                    >
                      <span className="text-sm" style={{ color: "#F1F5F9" }}>Stop Price</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={stopPrice || ""}
                        onChange={(e) => { setStopPrice(parseFloat(e.target.value) || 0); setAwaitingConfirm(false); }}
                        placeholder="0.00"
                        className="w-28 h-11 md:h-7 text-right text-base md:text-sm border-0 bg-transparent p-0"
                        style={{ color: "#10B981" }}
                      />
                    </div>
                  )}

                  {/* Buy In Row */}
                  <div
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid #1F2937" }}
                  >
                    <span className="text-sm" style={{ color: "#F1F5F9" }}>
                      {orderSide === "buy" ? "Buy In" : "Short In"}
                    </span>
                    <Select value={buyInMode} onValueChange={(v) => { setBuyInMode(v as BuyInMode); setAwaitingConfirm(false); }}>
                      <SelectTrigger
                        className="w-auto h-auto p-0 border-0 bg-transparent gap-1"
                        style={{ color: "#10B981" }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: "#111827", borderColor: "#1F2937" }}>
                        <SelectItem value="shares" style={{ color: "#F1F5F9" }}>
                          {isCryptoTournament ? "Units" : "Shares"}
                        </SelectItem>
                        <SelectItem value="dollars" style={{ color: "#F1F5F9" }}>Dollars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Row */}
                  <div
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid #1F2937" }}
                  >
                    <span className="text-sm" style={{ color: "#F1F5F9" }}>
                      {buyInMode === "shares" ? (isCryptoTournament ? "Units" : "Shares") : "Amount"}
                    </span>
                    {buyInMode === "shares" ? (
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={quantity || ""}
                        onChange={(e) => { setQuantity(Math.max(0, parseInt(e.target.value) || 0)); setAwaitingConfirm(false); }}
                        placeholder="0"
                        className="w-28 h-11 md:h-7 text-right text-base md:text-sm border-0 bg-transparent p-0"
                        style={{ color: "#FFFFFF" }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm mr-0.5" style={{ color: "#64748B" }}>$</span>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={dollarAmount || ""}
                          onChange={(e) => { setDollarAmount(Math.max(0, parseFloat(e.target.value) || 0)); setAwaitingConfirm(false); }}
                          placeholder="0.00"
                          className="w-28 h-11 md:h-7 text-right text-base md:text-sm border-0 bg-transparent p-0"
                          style={{ color: "#FFFFFF" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Dollars mode: show estimated shares */}
                  {buyInMode === "dollars" && effectiveQuantity > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[11px]" style={{ color: "#64748B" }}>
                        Est. Shares
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
                        {effectiveQuantity}
                      </span>
                    </div>
                  )}

                  {/* Market Price + Bid/Ask */}
                  <div className="pt-3 pb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "#F1F5F9" }}>Market Price</span>
                      <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                        {formatCurrency(currentPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px]" style={{ color: "#64748B" }}>Bid</span>
                      <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                        {formatCurrency(bidPrice)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between mt-0.5 pb-3"
                      style={{ borderBottom: "1px solid #1F2937" }}
                    >
                      <span className="text-[11px]" style={{ color: "#64748B" }}>Ask</span>
                      <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                        {formatCurrency(askPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                      Estimated {orderSide === "buy" ? "Cost" : "Credit"}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
                      {formatCurrency(estimatedTotal)}
                    </span>
                  </div>

                  {orderSide === "buy" && estimatedTotal > buyingPower && (
                    <p className="text-xs pb-1" style={{ color: "#EF4444" }}>
                      Exceeds buying power by {formatCurrency(estimatedTotal - buyingPower)}
                    </p>
                  )}
                  {orderSide === "sell" && effectiveQuantity > ownedShares && ownedShares > 0 && (
                    <p className="text-xs pb-1" style={{ color: "#EF4444" }}>
                      You only own {ownedShares} shares
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 pb-4">
                    <Button
                      onClick={() => {
                        setAwaitingConfirm(false);
                        setActiveView("positions");
                      }}
                      className="flex-1 h-12 md:h-10 font-semibold text-base md:text-sm min-h-[48px]"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #1F2937",
                        color: "#94A3B8",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1 h-12 md:h-10 font-bold text-base md:text-sm disabled:opacity-40 min-h-[48px]"
                      style={{
                        background: awaitingConfirm
                          ? orderSide === "buy"
                            ? "linear-gradient(135deg, #0d9668, #0591a3)"
                            : "linear-gradient(135deg, #c53030, #c05621)"
                          : orderSide === "buy"
                            ? "linear-gradient(135deg, #10B981, #06B6D4)"
                            : "linear-gradient(135deg, #EF4444, #F97316)",
                        color: orderSide === "buy" ? "#000000" : "#FFFFFF",
                        border: awaitingConfirm ? "2px solid #FFFFFF" : "none",
                      }}
                    >
                      {buttonLabel}
                    </Button>
                  </div>
                </div>
            </>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
