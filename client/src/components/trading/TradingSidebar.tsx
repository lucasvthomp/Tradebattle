import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Search, X, Clock, ArrowLeft } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
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
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length >= 1,
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

  // Order logic
  const estimatedTotal = quantity * currentPrice;
  const maxBuyShares = currentPrice > 0 ? Math.floor(buyingPower / currentPrice) : 0;

  const canSubmit = (() => {
    if (tradingBlocked) return false;
    if (!selectedTournament?.id || !selectedSymbol || quantity <= 0 || currentPrice <= 0)
      return false;
    if (orderSide === "buy" && estimatedTotal > buyingPower) return false;
    if (orderSide === "sell" && quantity > ownedShares) return false;
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
        quantity,
        currentMarketPrice: currentPrice,
      };
      const result = await executeOrder(order);
      toast({ title: result.message });
      setQuantity(1);
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
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    setAwaitingConfirm(false);
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
    setAwaitingConfirm(false);
  };

  const buttonLabel = (() => {
    if (isSubmitting) return "Submitting...";
    if (awaitingConfirm) return `Confirm ${orderSide === "buy" ? "Buy" : "Sell"}`;
    return `${orderSide === "buy" ? "Buy" : "Sell"} ${selectedSymbol}`;
  })();

  return (
    <div className="flex flex-col h-full min-h-0">
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
              className="h-9"
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

      {/* Market Closed Banner */}
      {tradingBlocked && (
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
              Market Closed
            </div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>
              Mon-Fri 9:30 AM - 4:00 PM ET
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div
        className="flex items-center shrink-0"
        style={{ borderBottom: "1px solid #1F2937" }}
      >
        <button
          onClick={() => setActiveView("positions")}
          className="flex-1 py-2.5 text-xs font-semibold text-center transition-colors"
          style={{
            color: activeView === "positions" ? "#E3B341" : "#94A3B8",
            borderBottom:
              activeView === "positions" ? "2px solid #E3B341" : "2px solid transparent",
          }}
        >
          Positions
        </button>
        <button
          onClick={() => setActiveView("history")}
          className="flex-1 py-2.5 text-xs font-semibold text-center transition-colors"
          style={{
            color: activeView === "history" ? "#E3B341" : "#94A3B8",
            borderBottom:
              activeView === "history" ? "2px solid #E3B341" : "2px solid transparent",
          }}
        >
          History
        </button>
        <button
          onClick={() => {
            setActiveView("trade");
            setQuantity(1);
            setAwaitingConfirm(false);
          }}
          className="px-3 py-2.5 flex items-center justify-center transition-colors"
          style={{
            color: activeView === "trade" ? "#10B981" : "#94A3B8",
            borderBottom:
              activeView === "trade" ? "2px solid #10B981" : "2px solid transparent",
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area — scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        {/* POSITIONS VIEW */}
        {activeView === "positions" && (
          <div>
            {/* Compact Summary Stats (2x2 grid) */}
            <div
              className="grid grid-cols-2 gap-px"
              style={{ backgroundColor: "#1F2937", borderBottom: "1px solid #1F2937" }}
            >
              {[
                { label: "Cash", value: formatMoney(buyingPower), color: "#F1F5F9" },
                { label: "Invested", value: formatMoney(invested), color: "#F1F5F9" },
                {
                  label: "% Change",
                  value: (pctChange >= 0 ? "+" : "") + pctChange.toFixed(2) + "%",
                  color: pctChange >= 0 ? "#10B981" : "#EF4444",
                },
                {
                  label: "P/L",
                  value: (totalPL >= 0 ? "+" : "") + formatMoney(totalPL),
                  color: totalPL >= 0 ? "#10B981" : "#EF4444",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-2.5 px-2"
                  style={{ backgroundColor: "#111827" }}
                >
                  <span
                    className="text-[9px] uppercase tracking-wide"
                    style={{ color: "#64748B" }}
                  >
                    {s.label}
                  </span>
                  <span className="text-sm font-bold mt-0.5" style={{ color: s.color }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Holdings List */}
            <div className="px-3 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#F1F5F9" }}>
                  Holdings
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: "rgba(6, 182, 212, 0.12)", color: "#06B6D4" }}
                >
                  {holdings.length}
                </span>
              </div>

              {holdings.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
                    No holdings yet
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#64748B" }}>
                    Press + to search and buy stocks
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {holdings.map((h: any) => {
                    const isSelected = h.symbol === selectedSymbol;
                    const isPositive = (h.profitLoss || 0) >= 0;
                    const changePercent =
                      (h.averagePurchasePrice || 0) > 0
                        ? ((h.currentPrice - h.averagePurchasePrice) / h.averagePurchasePrice) *
                          100
                        : 0;

                    return (
                      <button
                        key={h.symbol}
                        onClick={() => handleHoldingClick(h.symbol)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded transition-colors hover:bg-[#0F172A]"
                        style={{
                          backgroundColor: isSelected ? "#0F172A" : "transparent",
                          borderLeft: isSelected
                            ? "2px solid #06B6D4"
                            : "2px solid transparent",
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-bold"
                              style={{ color: isSelected ? "#06B6D4" : "#FFFFFF" }}
                            >
                              {h.symbol}
                            </span>
                            <span className="text-[10px]" style={{ color: "#64748B" }}>
                              {h.shares} shares
                            </span>
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#94A3B8" }}>
                            Avg {formatCurrency(h.averagePurchasePrice || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>
                            {formatCurrency(h.currentValue || 0)}
                          </div>
                          <div
                            className="text-[10px] font-medium"
                            style={{ color: isPositive ? "#10B981" : "#EF4444" }}
                          >
                            {isPositive ? "+" : ""}
                            {changePercent.toFixed(1)}% ({isPositive ? "+" : ""}
                            {formatCurrency(h.profitLoss || 0)})
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

        {/* TRADE VIEW */}
        {activeView === "trade" && (
          <div>
            {/* Back button + symbol header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 shrink-0"
              style={{ borderBottom: "1px solid #1F2937" }}
            >
              <button
                onClick={() => setActiveView("positions")}
                className="p-1 rounded hover:bg-[#0F172A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "#06B6D4" }}>
                  {selectedSymbol}
                </span>
                <span className="text-xs" style={{ color: "#94A3B8" }}>
                  {companyName !== selectedSymbol ? companyName : ""}
                </span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
                  {formatCurrency(currentPrice)}
                </span>
              </div>
            </div>

            {/* Stock Search */}
            <div className="px-3 py-2" style={{ borderBottom: "1px solid #1F2937" }}>
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#94A3B8" }}
                />
                <Input
                  placeholder="Search symbol or company..."
                  value={showSearch ? searchQuery : ""}
                  onFocus={() => setShowSearch(true)}
                  onChange={(e) => {
                    setShowSearch(true);
                    setSearchQuery(e.target.value.toUpperCase());
                  }}
                  className="h-8 pl-8 pr-8 text-xs"
                  style={{
                    backgroundColor: "#080C14",
                    borderColor: "#1F2937",
                    color: "#FFFFFF",
                  }}
                />
                {showSearch && (
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {showSearch && searchQuery.length >= 1 ? (
              <div style={{ borderBottom: "1px solid #1F2937" }}>
                {isSearching ? (
                  <div className="px-3 py-2 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result: any) => (
                    <button
                      key={result.symbol}
                      onClick={() => handleSearchSelect(result.symbol)}
                      className="w-full px-3 py-2 text-left hover:bg-[#0F172A] flex items-center justify-between transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(31, 41, 55, 0.5)",
                        backgroundColor:
                          result.symbol === selectedSymbol ? "#0F172A" : "transparent",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: "#06B6D4" }}>
                            {result.symbol}
                          </span>
                          {result.type && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "rgba(148, 163, 184, 0.15)",
                                color: "#94A3B8",
                              }}
                            >
                              {result.type}
                            </span>
                          )}
                        </div>
                        {result.name && (
                          <div
                            className="text-[10px] mt-0.5 truncate"
                            style={{ color: "#94A3B8" }}
                          >
                            {result.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        {result.exchange && (
                          <div className="text-[10px]" style={{ color: "#64748B" }}>
                            {result.exchange}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center">
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      No results for "{searchQuery}"
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Buy/Sell Tabs */}
                <div className="flex">
                  <button
                    onClick={() => handleSideChange("buy")}
                    className="flex-1 py-2.5 text-sm font-bold text-center transition-colors"
                    style={{
                      background:
                        orderSide === "buy"
                          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))"
                          : "transparent",
                      color: orderSide === "buy" ? "#10B981" : "#94A3B8",
                      borderBottom:
                        orderSide === "buy" ? "2px solid #10B981" : "2px solid transparent",
                    }}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleSideChange("sell")}
                    className="flex-1 py-2.5 text-sm font-bold text-center transition-colors"
                    style={{
                      background:
                        orderSide === "sell"
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))"
                          : "transparent",
                      color: orderSide === "sell" ? "#EF4444" : "#94A3B8",
                      borderBottom:
                        orderSide === "sell" ? "2px solid #EF4444" : "2px solid transparent",
                    }}
                  >
                    Sell
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {/* Shares Input */}
                  <div>
                    <label
                      className="text-xs font-medium mb-1 block"
                      style={{ color: "#94A3B8" }}
                    >
                      Shares
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                        className="h-8 w-8 p-0"
                        style={{
                          backgroundColor: "#080C14",
                          borderColor: "#1F2937",
                          color: "#FFFFFF",
                        }}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="h-8 text-center flex-1"
                        style={{
                          backgroundColor: "#080C14",
                          borderColor: "#1F2937",
                          color: "#FFFFFF",
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="h-8 w-8 p-0"
                        style={{
                          backgroundColor: "#080C14",
                          borderColor: "#1F2937",
                          color: "#FFFFFF",
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Quick select buttons */}
                    <div className="flex gap-1.5 mt-2">
                      {orderSide === "buy" ? (
                        <>
                          {[1, 5, 10, 25].map((n) => (
                            <button
                              key={n}
                              onClick={() => handleQuantityChange(n)}
                              className="flex-1 text-[10px] py-1 rounded font-medium transition-colors"
                              style={{
                                backgroundColor:
                                  quantity === n ? "rgba(16, 185, 129, 0.2)" : "#080C14",
                                color: quantity === n ? "#10B981" : "#94A3B8",
                                border: `1px solid ${quantity === n ? "#10B981" : "#1F2937"}`,
                              }}
                            >
                              {n}
                            </button>
                          ))}
                          {maxBuyShares > 0 && (
                            <button
                              onClick={() => handleQuantityChange(maxBuyShares)}
                              className="flex-1 text-[10px] py-1 rounded font-medium transition-colors"
                              style={{
                                backgroundColor:
                                  quantity === maxBuyShares
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : "#080C14",
                                color: quantity === maxBuyShares ? "#10B981" : "#E3B341",
                                border: `1px solid ${quantity === maxBuyShares ? "#10B981" : "#1F2937"}`,
                              }}
                            >
                              Max
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {ownedShares > 0 && (
                            <>
                              {[1, Math.ceil(ownedShares / 4), Math.ceil(ownedShares / 2)]
                                .filter(
                                  (n, i, arr) =>
                                    n > 0 && arr.indexOf(n) === i && n <= ownedShares
                                )
                                .map((n) => (
                                  <button
                                    key={n}
                                    onClick={() => handleQuantityChange(n)}
                                    className="flex-1 text-[10px] py-1 rounded font-medium transition-colors"
                                    style={{
                                      backgroundColor:
                                        quantity === n ? "rgba(239, 68, 68, 0.2)" : "#080C14",
                                      color: quantity === n ? "#EF4444" : "#94A3B8",
                                      border: `1px solid ${quantity === n ? "#EF4444" : "#1F2937"}`,
                                    }}
                                  >
                                    {n}
                                  </button>
                                ))}
                              <button
                                onClick={() => handleQuantityChange(ownedShares)}
                                className="flex-1 text-[10px] py-1 rounded font-medium transition-colors"
                                style={{
                                  backgroundColor:
                                    quantity === ownedShares
                                      ? "rgba(239, 68, 68, 0.2)"
                                      : "#080C14",
                                  color: quantity === ownedShares ? "#EF4444" : "#E3B341",
                                  border: `1px solid ${quantity === ownedShares ? "#EF4444" : "#1F2937"}`,
                                }}
                              >
                                All ({ownedShares})
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {orderSide === "sell" && quantity > ownedShares && (
                      <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>
                        You only own {ownedShares} shares
                      </p>
                    )}
                  </div>

                  {/* Market Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      Market Price
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>

                  {/* Owned Position */}
                  {ownedShares > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#94A3B8" }}>
                        You Own
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                        {ownedShares} shares
                      </span>
                    </div>
                  )}

                  <Separator style={{ backgroundColor: "#1F2937" }} />

                  {/* Estimated Cost / Credit */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                      Est. {orderSide === "buy" ? "Cost" : "Credit"}
                    </span>
                    <span className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                      {formatCurrency(estimatedTotal)}
                    </span>
                  </div>

                  {orderSide === "buy" && estimatedTotal > buyingPower && (
                    <p className="text-xs" style={{ color: "#EF4444" }}>
                      Exceeds buying power by {formatCurrency(estimatedTotal - buyingPower)}
                    </p>
                  )}

                  {/* After-trade balance preview */}
                  {orderSide === "buy" && canSubmit && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#64748B" }}>
                        Remaining Power
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>
                        {formatCurrency(buyingPower - estimatedTotal)}
                      </span>
                    </div>
                  )}
                  {orderSide === "sell" && canSubmit && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#64748B" }}>
                        New Balance
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>
                        {formatCurrency(buyingPower + estimatedTotal)}
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="w-full h-10 font-bold text-sm disabled:opacity-40"
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
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
