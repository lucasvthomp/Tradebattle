import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingSidebar } from "@/components/trading/TradingSidebar";
import { WebsiteTour } from "@/components/tour/WebsiteTour";
import { GameIcon } from "@/components/game-icons";

interface DashboardProps {
  forcedTournamentId?: number;
  [key: string]: any;
}

export default function Dashboard({ forcedTournamentId }: DashboardProps = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  const search = useSearch();
  const requestedTournamentId = useMemo(() => {
    if (forcedTournamentId) return forcedTournamentId;
    const raw = new URLSearchParams(search).get("tournament");
    const id = raw ? parseInt(raw) : NaN;
    return Number.isNaN(id) ? null : id;
  }, [search, forcedTournamentId]);

  const { data: quoteResponse } = useQuery({
    queryKey: ["/api/quote", selectedSymbol],
    enabled: !!selectedSymbol,
    refetchInterval: 15000,
  });

  const { data: profileResponse } = useQuery({
    queryKey: ["/api/summary", selectedSymbol],
    enabled: !!selectedSymbol,
  });

  const { data: tournamentsResponse } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const activeTournaments = useMemo(() => {
    const all = (tournamentsResponse as any)?.data || [];
    // Keep scheduled arenas visible so players can see the countdown before
    // the trading floor opens. Orders remain disabled until the server marks
    // the arena active.
    return all.filter((t: any) => t.status === "active" || t.status === "waiting");
  }, [tournamentsResponse]);

  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      const requested = requestedTournamentId
        ? activeTournaments.find((t: any) => t.id === requestedTournamentId)
        : null;
      setSelectedTournament(requested || activeTournaments.find((t: any) => t.status === "active") || activeTournaments[0]);
    }
  }, [activeTournaments, selectedTournament, requestedTournamentId]);

  const { data: balanceResponse } = useQuery({
    queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    enabled: !!selectedTournament?.id,
  });

  const { data: portfolioResponse } = useQuery({
    queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    enabled: !!selectedTournament?.id,
  });

  const quote = (quoteResponse as any)?.data;
  const price = quote?.price || 0;
  const companyName = (profileResponse as any)?.data?.name || selectedSymbol;
  const buyingPower = (balanceResponse as any)?.data?.balance || 0;

  const ownedShares = useMemo(() => {
    const holdings = (portfolioResponse as any)?.data || [];
    if (!Array.isArray(holdings)) return 0;
    const pos = holdings.find((h: any) => h.symbol === selectedSymbol);
    return pos?.shares || 0;
  }, [portfolioResponse, selectedSymbol]);

  const { totalPL, totalValue, pctChange } = useMemo(() => {
    const holdings = Array.isArray((portfolioResponse as any)?.data)
      ? (portfolioResponse as any).data.filter((h: any) => h.shares > 0)
      : [];
    const invested = holdings.reduce((s: number, h: any) => s + (h.currentValue || 0), 0);
    const totalPL = holdings.reduce((s: number, h: any) => s + (h.profitLoss || 0), 0);
    const totalValue = buyingPower + invested;
    const pctChange =
      selectedTournament?.startingBalance > 0
        ? ((totalValue - selectedTournament.startingBalance) / selectedTournament.startingBalance) * 100
        : 0;
    return { totalPL, totalValue, pctChange };
  }, [portfolioResponse, buyingPower, selectedTournament]);

  const handleOrderExecuted = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament?.id, "balance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/portfolio/tournament", selectedTournament?.id] });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100dvh - 4rem)" }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: "#C9D1E2" }}>Enter the arena</h2>
          <p style={{ color: "#8A93A6" }}>Sign in to open the trading floor.</p>
        </div>
      </div>
    );
  }

  if (activeTournaments.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100dvh - 4rem)" }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, rgba(227,179,65,0.2), rgba(227,179,65,0.05))", border: "1px solid rgba(227,179,65,0.3)" }}>
            <GameIcon name="trophy" size={58} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "#C9D1E2" }}>No live arenas</h3>
            <p style={{ color: "#8A93A6" }}>Enter an arena to start your run</p>
          </div>
          <Button asChild style={{ background: "linear-gradient(135deg, #D5A73C, #F3C65B)", color: "#241137" }}>
            <a href="/tournaments"><GameIcon name="swords" size={24} className="mr-2 inline-block align-middle" />Scout arenas</a>
          </Button>
        </div>
      </div>
    );
  }

  const arenaIsScheduled = selectedTournament?.status === "waiting";

  const isUp = pctChange >= 0;
  const plIsUp = totalPL >= 0;

  // Glow color for the panel border based on P&L
  const panelGlow = isUp ? "rgba(243,198,91,0.18)" : "rgba(255,61,90,0.18)";
  const panelBorder = isUp ? "rgba(243,198,91,0.30)" : "rgba(255,61,90,0.25)";

  return (
    <>
      <WebsiteTour />
      <div
        className="arena-page-shell trading-page"
        style={{
          height: "calc(100dvh - 4rem)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          background: "transparent",
          gap: 0,
        }}
      >
        {arenaIsScheduled && (
          <div
            className="trade-scheduled-banner"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 320,
              zIndex: 5,
            }}
          >
            <span className="trade-scheduled-dot" />
            <span>{selectedTournament?.name || "This arena"} is scheduled to open soon. Trading unlocks when the arena goes live.</span>
          </div>
        )}
        {/* ── LEFT: CHART — frameless, fills space ── */}
        <div
          data-tour="chart-area"
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}
          className="min-h-[260px] md:min-h-0"
        >
          <TradingViewChart symbol={selectedSymbol} tournamentId={selectedTournament?.id} />
        </div>

        {/* ── RIGHT: GAME PANEL ── */}
        <div
          className="trading-sidebar-rail hidden md:flex flex-col"
          style={{
            width: 320,
            flexShrink: 0,
            minHeight: 0,
            background: "var(--tb-gradient-panel)",
            borderLeft: `1px solid ${panelBorder}`,
            boxShadow: `-4px 0 32px ${panelGlow}`,
            transition: "border-color 1s ease, box-shadow 1s ease",
          }}
        >
          <TradingSidebar
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            selectedTournament={selectedTournament}
            onTournamentChange={setSelectedTournament}
            activeTournaments={activeTournaments}
            buyingPower={buyingPower}
            portfolioData={portfolioResponse}
            companyName={companyName}
            currentPrice={price}
            ownedShares={ownedShares}
            onOrderExecuted={handleOrderExecuted}
            startingBalance={selectedTournament?.startingBalance || 0}
            totalValue={totalValue}
            pctChange={pctChange}
            totalPL={totalPL}
            plIsUp={plIsUp}
            isUp={isUp}
          />
        </div>

        {/* Mobile sidebar */}
        <div
          className="trading-sidebar-rail flex md:hidden w-full"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            maxHeight: "58vh", overflowY: "auto",
            background: "var(--tb-gradient-panel)",
            borderTop: `1px solid ${panelBorder}`,
            boxShadow: `0 -4px 32px ${panelGlow}`,
          }}
        >
          <TradingSidebar
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            selectedTournament={selectedTournament}
            onTournamentChange={setSelectedTournament}
            activeTournaments={activeTournaments}
            buyingPower={buyingPower}
            portfolioData={portfolioResponse}
            companyName={companyName}
            currentPrice={price}
            ownedShares={ownedShares}
            onOrderExecuted={handleOrderExecuted}
            startingBalance={selectedTournament?.startingBalance || 0}
            totalValue={totalValue}
            pctChange={pctChange}
            totalPL={totalPL}
            plIsUp={plIsUp}
            isUp={isUp}
          />
        </div>
      </div>
    </>
  );
}
