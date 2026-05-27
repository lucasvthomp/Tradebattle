import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Clock, ArrowLeft, Zap, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
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

  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [buyInMode, setBuyInMode] = useState<BuyInMode>("shares");
  const [quantity, setQuantity] = useState(1);
  const [dollarAmount, setDollarAmount] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);
  const [stopPrice, setStopPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const isCryptoTournament = selectedTournament?.tournamentType === "crypto";
  const tradingBlocked = !marketOpen && !isCryptoTournament;

  useEffect(() => {
    const interval = setInterval(() => setMarketOpen(isMarketOpen()), 30000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["/api/search", searchQuery, selectedTournament?.id],
    enabled: searchQuery.length >= 2 && !!selectedTournament?.id,
    queryFn: async () => {
      const params = new URLSearchParams(
        selectedTournament?.id ? { tournamentId: selectedTournament.id.toString() } : {}
      );
      const response = await fetch(`/api/search/${encodeURIComponent(searchQuery)}?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const results = (searchData as any)?.data || [];
    return results.slice(0, 8);
  }, [searchData, searchQuery]);

  const holdings = useMemo(() => {
    const raw = (portfolioData as any)?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((h: any) => h.shares > 0);
  }, [portfolioData]);

  const invested = holdings.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0);
  const totalPL = holdings.reduce((sum: number, h: any) => sum + (h.profitLoss || 0), 0);
  const totalValue = buyingPower + invested;
  const pctChange = startingBalance > 0 ? ((totalValue - startingBalance) / startingBalance) * 100 : 0;

  const formatMoney = (val: number) => {
    const abs = Math.abs(val);
    return (val < 0 ? "-" : "") + "$" + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const spread = currentPrice * 0.0001;
  const bidPrice = currentPrice > 0 ? currentPrice - spread : 0;
  const askPrice = currentPrice > 0 ? currentPrice + spread : 0;

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
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament.id, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/tournament", selectedTournament.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament.id, "trades"] });
      setActiveView("positions");
    } catch (error: any) {
      toast({ title: `${orderSide === "buy" ? "Buy" : "Sell"} failed`, description: error.message, variant: "destructive" });
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
    if (isSubmitting) return "Placing Order...";
    if (awaitingConfirm) return `⚡ Confirm ${orderSide === "buy" ? "BUY" : "SELL"}`;
    return `${orderSide === "buy" ? "BUY" : "SELL"} ${selectedSymbol || "—"}`;
  })();

  const isProfit = pctChange >= 0;

  return (
    <div
      data-tour="trading-sidebar"
      className="flex flex-col h-full min-h-0"
      style={{ backgroundColor: "#0C1829" }}
    >
      {/* ── HEADER: Tournament selector + portfolio scorecard ── */}
      <div
        className="p-3 shrink-0 space-y-2"
        style={{ borderBottom: "1px solid rgba(227,179,65,0.15)" }}
      >
        <Select
          value={selectedTournament?.id?.toString() || ""}
          onValueChange={(value) => {
            const t = activeTournaments.find((t: any) => t.id.toString() === value);
            if (t) onTournamentChange(t);
          }}
        >
          <SelectTrigger
            className="h-9 text-xs font-bold"
            style={{
              backgroundColor: "rgba(227,179,65,0.08)",
              borderColor: "rgba(227,179,65,0.25)",
              color: "#E3B341",
            }}
          >
            <SelectValue placeholder="Select Tournament" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: "#0F1E33", borderColor: "rgba(227,179,65,0.2)" }}>
            {activeTournaments.map((t: any) => (
              <SelectItem key={t.id} value={t.id.toString()} style={{ color: "#F1F5F9" }}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Portfolio scorecard — inline under tournament selector */}
        <div
          className="rounded-lg p-2.5 space-y-2"
          style={{
            background: `linear-gradient(135deg, ${isProfit ? "rgba(40,199,111,0.05)" : "rgba(255,79,88,0.05)"}, rgba(13,17,23,0.6))`,
            border: `1px solid ${isProfit ? "rgba(40,199,111,0.12)" : "rgba(255,79,88,0.12)"}`,
          }}
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#4B5563" }}>Portfolio</div>
              <div className="text-lg font-black" style={{ color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                {formatMoney(totalValue)}
              </div>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black"
              style={{
                backgroundColor: isProfit ? "rgba(40,199,111,0.12)" : "rgba(255,79,88,0.12)",
                color: isProfit ? "#28C76F" : "#FF4F58",
              }}
            >
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isProfit ? "+" : ""}{pctChange.toFixed(2)}%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Cash", value: formatMoney(buyingPower), color: "#C9D1E2" },
              { label: "Invested", value: formatMoney(invested), color: "#C9D1E2" },
              { label: "P / L", value: (totalPL >= 0 ? "+" : "") + formatMoney(totalPL), color: totalPL >= 0 ? "#28C76F" : "#FF4F58" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-1.5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <div className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#4B5563" }}>{s.label}</div>
                <div className="text-[10px] font-bold truncate" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MARKET STATUS BANNER ── */}
      {!isCryptoTournament && tradingBlocked && (
        <div
          className="px-3 py-2 flex items-center gap-2 shrink-0"
          style={{
            background: "linear-gradient(90deg, rgba(239,68,68,0.15), transparent)",
            borderBottom: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "#EF4444" }} />
          <div>
            <span className="text-xs font-bold" style={{ color: "#EF4444" }}>Market Closed</span>
            <span className="text-[10px] ml-2" style={{ color: "#64748B" }}>Mon–Fri 9:30–16:00 ET</span>
          </div>
        </div>
      )}
      {isCryptoTournament && (
        <div
          className="px-3 py-2 flex items-center gap-2 shrink-0"
          style={{
            background: "linear-gradient(90deg, rgba(40,199,111,0.12), transparent)",
            borderBottom: "1px solid rgba(40,199,111,0.2)",
          }}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#28C76F" }} />
          <span className="text-xs font-bold" style={{ color: "#28C76F" }}>Crypto — 24/7 Open</span>
        </div>
      )}

      {/* ── SYMBOL SEARCH ── */}
      <div
        className="px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4B5563" }} />
          <Input
            placeholder={selectedSymbol ? `${selectedSymbol} — change symbol` : "Search symbol..."}
            value={showSearch ? searchQuery : ""}
            onFocus={() => setShowSearch(true)}
            onChange={(e) => { setShowSearch(true); setSearchQuery(e.target.value.toUpperCase()); }}
            className="h-9 pl-8 pr-8 text-sm font-bold"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#E3B341",
            }}
          />
          {showSearch && (
            <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
            </button>
          )}
        </div>

        {showSearch && searchQuery.length >= 1 && (
          <div
            style={{
              position: "absolute", left: "12px", right: "12px", zIndex: 9999, top: "calc(100% + 2px)",
              backgroundColor: "#0F1E33", border: "1px solid rgba(227,179,65,0.25)",
              borderRadius: "12px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            }}
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
                  className="w-full px-3 py-2.5 text-left flex items-center justify-between transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(227,179,65,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div>
                    <span className="text-sm font-black" style={{ color: "#E3B341" }}>{result.symbol}</span>
                    {result.name && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: "#64748B" }}>{result.name}</div>
                    )}
                  </div>
                  {result.exchange && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#8A93A6" }}>{result.exchange}</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center">
                <span className="text-sm" style={{ color: "#64748B" }}>No results for "{searchQuery}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── TAB BAR ── */}
      <div
        className="flex items-center shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(["positions", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-all"
            style={{
              color: activeView === tab ? "#E3B341" : "#4B5563",
              borderBottom: activeView === tab ? "2px solid #E3B341" : "2px solid transparent",
              background: activeView === tab ? "rgba(227,179,65,0.05)" : "transparent",
            }}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={() => { setActiveView("trade"); setQuantity(1); setAwaitingConfirm(false); }}
          className="px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all"
          style={{
            color: activeView === "trade" ? "#28C76F" : "#4B5563",
            borderBottom: activeView === "trade" ? "2px solid #28C76F" : "2px solid transparent",
            background: activeView === "trade" ? "rgba(40,199,111,0.05)" : "transparent",
          }}
        >
          Trade
        </button>
      </div>

      {/* ── CONTENT ── */}
      <ScrollArea className="flex-1 min-h-0">

        {/* POSITIONS VIEW */}
        {activeView === "positions" && (
          <div>
            {/* Holdings */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4B5563" }}>
                  Holdings
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(227,179,65,0.12)", color: "#E3B341" }}
                >
                  {holdings.length}
                </span>
              </div>

              {holdings.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <p className="text-sm font-semibold" style={{ color: "#4B5563" }}>No positions yet</p>
                  <p className="text-xs mt-1" style={{ color: "#2D3748" }}>
                    Search a ticker above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {holdings.map((h: any) => {
                    const isSelected = h.symbol === selectedSymbol;
                    const isPositive = (h.profitLoss || 0) >= 0;
                    const changePercent = (h.averagePurchasePrice || 0) > 0
                      ? ((h.currentPrice - h.averagePurchasePrice) / h.averagePurchasePrice) * 100
                      : 0;

                    return (
                      <button
                        key={h.symbol}
                        onClick={() => handleHoldingClick(h.symbol)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: isSelected ? "rgba(227,179,65,0.08)" : "rgba(255,255,255,0.025)",
                          border: isSelected ? "1px solid rgba(227,179,65,0.3)" : "1px solid transparent",
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: isSelected ? "#E3B341" : "#F1F5F9" }}>
                              {h.symbol}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#8A93A6" }}
                            >
                              {h.shares} {isCryptoTournament ? "units" : "sh"}
                            </span>
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#4B5563" }}>
                            avg {formatCurrency(h.averagePurchasePrice || 0)}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className="text-sm font-bold" style={{ color: "#F1F5F9" }}>
                              {formatCurrency(h.currentValue || 0)}
                            </div>
                            <div
                              className="text-xs font-black"
                              style={{ color: isPositive ? "#28C76F" : "#FF4F58" }}
                            >
                              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: "#2D3748" }} />
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
            {/* Back + ticker header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={() => setActiveView("positions")}
                className="p-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: "#8A93A6" }} />
              </button>
              {selectedSymbol ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black" style={{ color: "#FFFFFF" }}>{selectedSymbol}</span>
                    {companyName !== selectedSymbol && (
                      <span className="text-xs truncate" style={{ color: "#4B5563" }}>{companyName}</span>
                    )}
                  </div>
                  <div className="text-lg font-black" style={{ color: "#E3B341", letterSpacing: "-0.02em" }}>
                    {formatCurrency(currentPrice)}
                  </div>
                </div>
              ) : (
                <span className="text-sm" style={{ color: "#4B5563" }}>No symbol selected</span>
              )}
            </div>

            {/* BUY / SELL arcade toggle */}
            <div className="px-3 pt-3 pb-2">
              <div
                className="flex rounded-lg overflow-hidden p-0.5 gap-0.5"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <button
                  onClick={() => handleSideChange("buy")}
                  className="flex-1 py-3 text-sm font-black text-center rounded-lg transition-all"
                  style={
                    orderSide === "buy"
                      ? {
                          background: "linear-gradient(135deg, #28C76F, #20a35a)",
                          color: "#000000",
                          boxShadow: "0 0 20px rgba(40,199,111,0.35)",
                        }
                      : { backgroundColor: "transparent", color: "#4B5563" }
                  }
                >
                  📈 BUY
                </button>
                <button
                  onClick={() => handleSideChange("sell")}
                  className="flex-1 py-3 text-sm font-black text-center rounded-lg transition-all"
                  style={
                    orderSide === "sell"
                      ? {
                          background: "linear-gradient(135deg, #FF4F58, #cc3f46)",
                          color: "#FFFFFF",
                          boxShadow: "0 0 20px rgba(255,79,88,0.35)",
                        }
                      : { backgroundColor: "transparent", color: "#4B5563" }
                  }
                >
                  📉 SELL
                </button>
              </div>
            </div>

            {/* Order form */}
            <div className="px-3 space-y-1 pb-2">
              {/* Order Type */}
              <div
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                  Order Type
                </span>
                <Select
                  value={orderType}
                  onValueChange={(v) => { setOrderType(v as OrderType); setAwaitingConfirm(false); }}
                >
                  <SelectTrigger
                    className="w-auto h-auto p-0 border-0 bg-transparent gap-1 text-sm font-bold"
                    style={{ color: "#E3B341" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "#0F1E33", borderColor: "rgba(227,179,65,0.2)" }}>
                    <SelectItem value="market" style={{ color: "#F1F5F9" }}>Market</SelectItem>
                    <SelectItem value="limit" style={{ color: "#F1F5F9" }}>Limit</SelectItem>
                    <SelectItem value="stop_market" style={{ color: "#F1F5F9" }}>Stop Market</SelectItem>
                    <SelectItem value="stop_limit" style={{ color: "#F1F5F9" }}>Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limit Price */}
              {(orderType === "limit" || orderType === "stop_limit") && (
                <div
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                    Limit Price
                  </span>
                  <Input
                    type="number" inputMode="decimal" min="0" step="0.01"
                    value={limitPrice || ""}
                    onChange={(e) => { setLimitPrice(parseFloat(e.target.value) || 0); setAwaitingConfirm(false); }}
                    placeholder="0.00"
                    className="w-28 h-9 md:h-7 text-right text-sm font-bold border-0 bg-transparent p-0"
                    style={{ color: "#E3B341" }}
                  />
                </div>
              )}

              {/* Stop Price */}
              {(orderType === "stop_market" || orderType === "stop_limit") && (
                <div
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                    Stop Price
                  </span>
                  <Input
                    type="number" inputMode="decimal" min="0" step="0.01"
                    value={stopPrice || ""}
                    onChange={(e) => { setStopPrice(parseFloat(e.target.value) || 0); setAwaitingConfirm(false); }}
                    placeholder="0.00"
                    className="w-28 h-9 md:h-7 text-right text-sm font-bold border-0 bg-transparent p-0"
                    style={{ color: "#E3B341" }}
                  />
                </div>
              )}

              {/* Buy In mode */}
              <div
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                  Buy In
                </span>
                <Select value={buyInMode} onValueChange={(v) => { setBuyInMode(v as BuyInMode); setAwaitingConfirm(false); }}>
                  <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent gap-1 text-sm font-bold" style={{ color: "#E3B341" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "#0F1E33", borderColor: "rgba(227,179,65,0.2)" }}>
                    <SelectItem value="shares" style={{ color: "#F1F5F9" }}>
                      {isCryptoTournament ? "Units" : "Shares"}
                    </SelectItem>
                    <SelectItem value="dollars" style={{ color: "#F1F5F9" }}>Dollars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                  {buyInMode === "shares" ? (isCryptoTournament ? "Units" : "Shares") : "Amount"}
                </span>
                {buyInMode === "shares" ? (
                  <Input
                    type="number" inputMode="numeric" min="0"
                    value={quantity || ""}
                    onChange={(e) => { setQuantity(Math.max(0, parseInt(e.target.value) || 0)); setAwaitingConfirm(false); }}
                    placeholder="0"
                    className="w-28 h-9 md:h-7 text-right text-sm font-black border-0 bg-transparent p-0"
                    style={{ color: "#FFFFFF" }}
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm mr-0.5" style={{ color: "#4B5563" }}>$</span>
                    <Input
                      type="number" inputMode="decimal" min="0" step="0.01"
                      value={dollarAmount || ""}
                      onChange={(e) => { setDollarAmount(Math.max(0, parseFloat(e.target.value) || 0)); setAwaitingConfirm(false); }}
                      placeholder="0.00"
                      className="w-28 h-9 md:h-7 text-right text-sm font-black border-0 bg-transparent p-0"
                      style={{ color: "#FFFFFF" }}
                    />
                  </div>
                )}
              </div>

              {buyInMode === "dollars" && effectiveQuantity > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px]" style={{ color: "#4B5563" }}>Est. Shares</span>
                  <span className="text-[10px] font-bold" style={{ color: "#8A93A6" }}>{effectiveQuantity}</span>
                </div>
              )}

              {/* Price info strip */}
              <div
                className="rounded-xl p-3 mt-1 space-y-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#4B5563" }}>Market Price</span>
                  <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{formatCurrency(currentPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "#2D3748" }}>Bid</span>
                  <span className="text-[10px]" style={{ color: "#4B5563" }}>{formatCurrency(bidPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "#2D3748" }}>Ask</span>
                  <span className="text-[10px]" style={{ color: "#4B5563" }}>{formatCurrency(askPrice)}</span>
                </div>
              </div>

              {/* Estimated total */}
              <div
                className="flex items-center justify-between py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8A93A6" }}>
                  Est. {orderSide === "buy" ? "Cost" : "Credit"}
                </span>
                <span className="text-base font-black" style={{ color: "#FFFFFF" }}>
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>

              {/* Validation warnings */}
              {orderSide === "buy" && estimatedTotal > buyingPower && estimatedTotal > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: "rgba(255,79,88,0.1)", color: "#FF4F58", border: "1px solid rgba(255,79,88,0.2)" }}
                >
                  ⚠ Exceeds buying power by {formatCurrency(estimatedTotal - buyingPower)}
                </div>
              )}
              {orderSide === "sell" && effectiveQuantity > ownedShares && ownedShares > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: "rgba(255,79,88,0.1)", color: "#FF4F58", border: "1px solid rgba(255,79,88,0.2)" }}
                >
                  ⚠ You only own {ownedShares} shares
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={() => { setAwaitingConfirm(false); setActiveView("positions"); }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#8A93A6",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-30"
                  style={
                    canSubmit
                      ? orderSide === "buy"
                        ? {
                            background: awaitingConfirm
                              ? "linear-gradient(135deg, #0d9668, #0d7e58)"
                              : "linear-gradient(135deg, #28C76F, #20a35a)",
                            color: "#000000",
                            boxShadow: awaitingConfirm
                              ? "0 0 24px rgba(40,199,111,0.6)"
                              : "0 0 16px rgba(40,199,111,0.3)",
                            border: awaitingConfirm ? "2px solid rgba(40,199,111,0.8)" : "none",
                          }
                        : {
                            background: awaitingConfirm
                              ? "linear-gradient(135deg, #cc3f46, #a83338)"
                              : "linear-gradient(135deg, #FF4F58, #cc3f46)",
                            color: "#FFFFFF",
                            boxShadow: awaitingConfirm
                              ? "0 0 24px rgba(255,79,88,0.6)"
                              : "0 0 16px rgba(255,79,88,0.3)",
                            border: awaitingConfirm ? "2px solid rgba(255,79,88,0.8)" : "none",
                          }
                      : { backgroundColor: "rgba(255,255,255,0.08)", color: "#4B5563" }
                  }
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
