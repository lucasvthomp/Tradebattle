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
import { getMarketStatus } from "@shared/marketHours";
import { TradeHistory } from "./TradeHistory";
import { GameIcon } from "@/components/game-icons";

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
  // Pre-computed from dashboard for the game header
  totalValue?: number;
  pctChange?: number;
  totalPL?: number;
  plIsUp?: boolean;
  isUp?: boolean;
}

type ActiveView = "positions" | "history" | "trade";
type OrderSide = "buy" | "sell";
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
  totalValue: totalValueProp,
  pctChange: pctChangeProp,
  totalPL: totalPLProp,
  plIsUp: plIsUpProp,
  isUp: isUpProp,
}: TradingSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useUserPreferences();

  const [activeView, setActiveView] = useState<ActiveView>("positions");

  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [buyInMode, setBuyInMode] = useState<BuyInMode>("shares");
  const [quantity, setQuantity] = useState(1);
  const [dollarAmount, setDollarAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [lastTrade, setLastTrade] = useState<string | null>(null);

  const [marketStatus, setMarketStatus] = useState(() => getMarketStatus());
  const isCryptoTournament = selectedTournament?.tournamentType === "crypto";
  const arenaWaiting = selectedTournament?.status === "waiting";
  const tradingBlocked = arenaWaiting || (!marketStatus.isOpen && !isCryptoTournament);

  useEffect(() => {
    const interval = setInterval(() => setMarketStatus(getMarketStatus()), 1000);
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
  const totalPL = totalPLProp ?? holdings.reduce((sum: number, h: any) => sum + (h.profitLoss || 0), 0);
  const totalValue = totalValueProp ?? (buyingPower + invested);
  const pctChange = pctChangeProp ?? (startingBalance > 0 ? ((totalValue - startingBalance) / startingBalance) * 100 : 0);
  const isProfit = plIsUpProp ?? totalPL >= 0;
  const _isUp = isUpProp ?? pctChange >= 0;

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
    if (tradingBlocked || selectedTournament?.status !== "active") return false;
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
      setLastTrade(result.message);
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
    setBuyInMode("shares");
  };

  const buttonLabel = (() => {
    if (isSubmitting) return "Placing Order...";
    if (awaitingConfirm) return `Confirm ${orderSide === "buy" ? "BUY" : "SELL"}`;
    return `${orderSide === "buy" ? "BUY" : "SELL"} ${selectedSymbol || "—"}`;
  })();

  const statusLabel = arenaWaiting
    ? "Arena scheduled"
    : isCryptoTournament
      ? "Crypto open 24/7"
      : marketStatus.isOpen
        ? `Market open · closes ${marketStatus.closeLabel}`
        : `Market closed · opens ${marketStatus.nextOpenLabel}`;

  const fmtMoney = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      data-tour="trading-sidebar"
      className="flex flex-col h-full min-h-0"
      style={{ backgroundColor: "transparent" }}
      >
        {/* ── GAME HEADER: Big balance + P&L ── */}
      <div
        className="shrink-0 px-4 pt-4 pb-3 relative overflow-hidden"
        style={{
          background: isProfit
            ? "linear-gradient(160deg, var(--tb-gold-wash) 0%, var(--tb-surface-850) 60%)"
            : "linear-gradient(160deg, rgba(255,61,90,0.07) 0%, var(--tb-surface-850) 60%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <GameIcon name="briefcase" size={34} />
            <span className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "var(--tb-text-muted)" }}>Trading floor</span>
          </div>
          <GameIcon name="chart" size={28} />
        </div>
        {/* Subtle scanline texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
        }} />

        {/* Tournament selector */}
        <Select
          value={selectedTournament?.id?.toString() || ""}
          onValueChange={(value) => {
            const t = activeTournaments.find((t: any) => t.id.toString() === value);
            if (t) onTournamentChange(t);
          }}
        >
          <SelectTrigger
            className="h-7 text-[11px] font-bold mb-3 relative z-10"
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "var(--tb-text-muted)",
            }}
          >
            <SelectValue placeholder="Select arena" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: "var(--tb-surface-800)", borderColor: "var(--tb-purple-edge)" }}>
            {activeTournaments.map((t: any) => (
              <SelectItem key={t.id} value={t.id.toString()} style={{ color: "#F1F5F9" }}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Big balance */}
        <div className="relative z-10">
          <div style={{ color: "var(--tb-text-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
            Tournament Balance
          </div>
          <div style={{
            color: "#FFFFFF",
            fontSize: "1.9rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textShadow: isProfit ? "0 0 30px rgba(243,198,91,0.24)" : "0 0 30px rgba(255,61,90,0.3)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {fmtMoney(totalValue)}
          </div>

          {/* P/L row */}
          <div className="flex items-center gap-2 mt-2">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: isProfit ? "rgba(243,198,91,0.12)" : "rgba(255,61,90,0.12)",
              border: `1px solid ${isProfit ? "rgba(243,198,91,0.3)" : "rgba(255,61,90,0.3)"}`,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: isProfit ? "var(--tb-gold-500)" : "#FF3D5A",
              boxShadow: isProfit ? "0 0 12px rgba(243,198,91,0.22)" : "0 0 12px rgba(255,61,90,0.2)",
            }}>
              {isProfit ? "▲" : "▼"} {isProfit ? "+" : ""}{pctChange.toFixed(2)}%
            </div>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: isProfit ? "var(--tb-gold-500)" : "#FF3D5A",
            }}>
              {totalPL >= 0 ? "+" : ""}{fmtMoney(totalPL)}
            </span>

            {/* Cash chip */}
            <div style={{
              marginLeft: "auto",
              display: "inline-flex", alignItems: "center", gap: 3,
              background: "var(--tb-purple-wash)",
              border: "1px solid var(--tb-purple-edge)",
              borderRadius: 6,
              padding: "2px 7px",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--tb-gold-500)",
            }}>
              Cash {fmtMoney(buyingPower)}
            </div>
          </div>
        </div>
      </div>

      {/* ── MARKET / ARENA STATUS ── */}
      <div
        className={`trade-status-banner ${arenaWaiting ? "is-scheduled" : marketStatus.isOpen || isCryptoTournament ? "is-open" : "is-closed"}`}
        title={statusLabel}
      >
        {arenaWaiting ? (
          <Clock className="w-3.5 h-3.5 shrink-0" />
        ) : isCryptoTournament ? (
          <Zap className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 shrink-0" />
        )}
        <div className="min-w-0">
          <span className="trade-status-title">
            {arenaWaiting ? "Arena scheduled" : isCryptoTournament ? "Crypto market open" : marketStatus.isOpen ? "Stock market open" : "Stock market closed"}
          </span>
          <span className="trade-status-copy">{arenaWaiting ? "Trading unlocks when the start time is reached" : statusLabel}</span>
        </div>
      </div>

      {/* ── SYMBOL SEARCH ── */}
      <div
        className="px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}
      >
        <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--tb-text-subtle)" }} />
          <Input
            placeholder={selectedSymbol ? `${selectedSymbol} — change ticker` : "Scout ticker..."}
            value={showSearch ? searchQuery : ""}
            onFocus={() => setShowSearch(true)}
            onChange={(e) => { setShowSearch(true); setSearchQuery(e.target.value.toUpperCase()); }}
            className="h-9 pl-8 pr-8 text-sm font-bold"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "var(--tb-gold-500)",
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
              backgroundColor: "var(--tb-surface-800)", border: "1px solid var(--tb-purple-edge)",
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
                    <span className="text-sm font-black" style={{ color: "var(--tb-gold-500)" }}>{result.symbol}</span>
                    {result.name && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: "#64748B" }}>{result.name}</div>
                    )}
                  </div>
                  {result.exchange && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tb-text-muted)" }}>{result.exchange}</span>
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
        className="flex items-center shrink-0 px-3 py-2 gap-1.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
      >
        {([
          { id: "positions", label: "Positions" },
          { id: "history",   label: "History" },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className="flex-1 py-1.5 text-[11px] font-bold rounded-lg text-center transition-all"
            style={{
              color: activeView === id ? "var(--tb-text-strong)" : "var(--tb-text-subtle)",
              background: activeView === id ? "var(--tb-purple-wash)" : "transparent",
              border: activeView === id ? "1px solid var(--tb-purple-edge)" : "1px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { setActiveView("trade"); setQuantity(1); setAwaitingConfirm(false); }}
          className="flex-1 py-1.5 text-[11px] font-black rounded-lg text-center transition-all"
          style={{
            color: activeView === "trade" ? "var(--tb-purple-950)" : "var(--tb-text-muted)",
            background: activeView === "trade"
              ? "var(--tb-gradient-action)"
              : "transparent",
            border: activeView === "trade" ? "1px solid var(--tb-gold-edge)" : "1px solid var(--tb-purple-edge)",
            boxShadow: activeView === "trade" ? "0 0 18px var(--tb-gold-glow)" : "none",
          }}
        >
          Trade
        </button>
      </div>

      {lastTrade && (
        <div className="trade-success-banner" role="status">
          <span className="trade-success-mark">✓</span>
          <span>{lastTrade}</span>
          <button aria-label="Dismiss trade confirmation" onClick={() => setLastTrade(null)}>×</button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <ScrollArea className="flex-1 min-h-0">

        {/* POSITIONS VIEW */}
        {activeView === "positions" && (
          <div>
            {/* Holdings */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--tb-text-subtle)" }}>
                  Positions
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--tb-gold-wash)", color: "var(--tb-gold-500)" }}
                >
                  {holdings.length}
                </span>
              </div>

              {holdings.length === 0 ? (
                <div className="py-8 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--tb-text-subtle)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--tb-text-muted)" }}>No positions yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--tb-text-subtle)" }}>
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
                          backgroundColor: isSelected ? "var(--tb-purple-wash)" : "rgba(255,255,255,0.025)",
                          border: isSelected ? "1px solid var(--tb-purple-edge)" : "1px solid transparent",
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: isSelected ? "var(--tb-gold-500)" : "var(--tb-text-strong)" }}>
                              {h.symbol}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tb-text-muted)" }}
                            >
                              {h.shares} units
                            </span>
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--tb-text-subtle)" }}>
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
                              style={{ color: isPositive ? "var(--tb-gold-500)" : "#FF4F58" }}
                            >
                              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--tb-text-subtle)" }} />
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
                <ArrowLeft className="w-4 h-4" style={{ color: "var(--tb-text-muted)" }} />
              </button>
              {selectedSymbol ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black" style={{ color: "#FFFFFF" }}>{selectedSymbol}</span>
                    {companyName !== selectedSymbol && (
                      <span className="text-xs truncate" style={{ color: "var(--tb-text-subtle)" }}>{companyName}</span>
                    )}
                  </div>
                  <div className="text-lg font-black" style={{ color: "var(--tb-gold-500)", letterSpacing: "-0.02em" }}>
                    {formatCurrency(currentPrice)}
                  </div>
                </div>
              ) : (
                <span className="text-sm" style={{ color: "var(--tb-text-subtle)" }}>No symbol selected</span>
              )}
            </div>

            {/* BUY / SELL arcade toggle */}
            <div className="px-3 pt-3 pb-2">
              <div
                className="flex rounded-xl overflow-hidden gap-1.5"
                style={{ padding: "4px", backgroundColor: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => handleSideChange("buy")}
                  className="flex-1 py-1.5 text-sm font-black text-center rounded-lg transition-all"
                  style={
                    orderSide === "buy"
                      ? {
                          background: "var(--tb-gradient-action)",
                          color: "var(--tb-purple-950)",
                          boxShadow: "0 0 28px var(--tb-gold-glow), inset 0 1px 0 rgba(255,255,255,0.15)",
                          letterSpacing: "0.06em",
                        }
                      : { backgroundColor: "transparent", color: "#3a5040" }
                  }
                >
                  ▲ BUY
                </button>
                <button
                  onClick={() => handleSideChange("sell")}
                  className="flex-1 py-1.5 text-sm font-black text-center rounded-lg transition-all"
                  style={
                    orderSide === "sell"
                      ? {
                          background: "linear-gradient(135deg, #d93f47, #FF4F58)",
                          color: "#FFFFFF",
                          boxShadow: "0 0 28px rgba(255,79,88,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
                          letterSpacing: "0.06em",
                        }
                      : { backgroundColor: "transparent", color: "var(--tb-text-subtle)" }
                  }
                >
                  ▼ SELL
                </button>
              </div>
            </div>

            {/* Order form */}
            <div className="px-3 space-y-1 pb-2">
              {/* Buy In mode */}
              <div
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--tb-text-muted)" }}>
                  Buy In
                </span>
                <Select value={buyInMode} onValueChange={(v) => { setBuyInMode(v as BuyInMode); setAwaitingConfirm(false); }}>
                  <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent gap-1 text-sm font-bold" style={{ color: "var(--tb-gold-500)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--tb-surface-800)", borderColor: "var(--tb-purple-edge)" }}>
                    <SelectItem value="shares" style={{ color: "#F1F5F9" }}>
                      Units
                    </SelectItem>
                    <SelectItem value="dollars" style={{ color: "#F1F5F9" }}>Dollars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--tb-text-muted)" }}>
                  {buyInMode === "shares" ? "Units" : "Amount"}
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
                    <span className="text-sm mr-0.5" style={{ color: "var(--tb-text-subtle)" }}>$</span>
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
                  <span className="text-[10px]" style={{ color: "var(--tb-text-subtle)" }}>Est. units</span>
                  <span className="text-[10px] font-bold" style={{ color: "var(--tb-text-muted)" }}>{effectiveQuantity}</span>
                </div>
              )}

              {/* Price info strip */}
              <div
                className="rounded-xl p-3 mt-1 space-y-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--tb-text-subtle)" }}>Live quote</span>
                  <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{formatCurrency(currentPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "var(--tb-text-subtle)" }}>Bid</span>
                  <span className="text-[10px]" style={{ color: "var(--tb-text-subtle)" }}>{formatCurrency(bidPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "var(--tb-text-subtle)" }}>Ask</span>
                  <span className="text-[10px]" style={{ color: "var(--tb-text-subtle)" }}>{formatCurrency(askPrice)}</span>
                </div>
              </div>

              {/* Estimated total */}
              <div
                className="flex items-center justify-between py-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--tb-text-muted)" }}>
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
                  Exceeds buying power by {formatCurrency(estimatedTotal - buyingPower)}
                </div>
              )}
              {orderSide === "sell" && effectiveQuantity > ownedShares && ownedShares > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: "rgba(255,79,88,0.1)", color: "#FF4F58", border: "1px solid rgba(255,79,88,0.2)" }}
                >
                  You only own {ownedShares} units
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={() => { setAwaitingConfirm(false); setActiveView("positions"); }}
                  className="py-3 rounded-xl text-sm font-bold transition-colors"
                  style={{
                    width: "72px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "var(--tb-text-muted)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    flexShrink: 0,
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
                              ? "linear-gradient(135deg, var(--tb-gold-600), var(--tb-gold-500))"
                              : "var(--tb-gradient-action)",
                            color: awaitingConfirm ? "var(--tb-gold-300)" : "var(--tb-purple-950)",
                            boxShadow: awaitingConfirm
                              ? "0 0 32px rgba(243,198,91,0.52)"
                              : "0 0 20px rgba(243,198,91,0.28)",
                            border: awaitingConfirm ? "2px solid rgba(243,198,91,0.9)" : "1px solid rgba(243,198,91,0.42)",
                            letterSpacing: "0.05em",
                          }
                        : {
                            background: awaitingConfirm
                              ? "linear-gradient(135deg, #a83338, #cc3f46)"
                              : "linear-gradient(135deg, #d93f47, #FF4F58)",
                            color: "#FFFFFF",
                            boxShadow: awaitingConfirm
                              ? "0 0 32px rgba(255,79,88,0.7)"
                              : "0 0 20px rgba(255,79,88,0.4)",
                            border: awaitingConfirm ? "2px solid rgba(255,79,88,0.9)" : "1px solid rgba(255,79,88,0.3)",
                            letterSpacing: "0.05em",
                          }
                      : { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tb-text-subtle)", border: "1px solid transparent" }
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
