import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingSidebar } from "@/components/trading/TradingSidebar";
import { WebsiteTour } from "@/components/tour/WebsiteTour";
import { Trophy, Swords } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  const search = useSearch();
  const requestedTournamentId = useMemo(() => {
    const raw = new URLSearchParams(search).get("tournament");
    const id = raw ? parseInt(raw) : NaN;
    return Number.isNaN(id) ? null : id;
  }, [search]);

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
    return all.filter((t: any) => t.status === "active");
  }, [tournamentsResponse]);

  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      const requested = requestedTournamentId
        ? activeTournaments.find((t: any) => t.id === requestedTournamentId)
        : null;
      setSelectedTournament(requested || activeTournaments[0]);
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
          <h2 className="text-xl font-semibold mb-2" style={{ color: "#C9D1E2" }}>Please Log In</h2>
          <p style={{ color: "#8A93A6" }}>You need to be logged in to view your trading dashboard.</p>
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
            <Trophy size={32} color="#E3B341" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "#C9D1E2" }}>No Active Tournaments</h3>
            <p style={{ color: "#8A93A6" }}>Join a tournament to start trading</p>
          </div>
          <Button asChild style={{ background: "linear-gradient(135deg, #00A3FF, #0066CC)", color: "#fff" }}>
            <a href="/tournaments"><Swords className="w-4 h-4 mr-2 inline" />Browse Tournaments</a>
          </Button>
        </div>
      </div>
    );
  }

  const isUp = pctChange >= 0;
  const plIsUp = totalPL >= 0;

  // Glow color for the panel border based on P&L
  const panelGlow = isUp ? "rgba(0,255,135,0.18)" : "rgba(255,61,90,0.18)";
  const panelBorder = isUp ? "rgba(0,255,135,0.25)" : "rgba(255,61,90,0.25)";

  return (
    <>
      <WebsiteTour />
      <div
        style={{
          height: "calc(100dvh - 4rem)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          background: "transparent",
          gap: 0,
        }}
      >
        {/* ── LEFT: CHART — frameless, fills space ── */}
        <div
          data-tour="chart-area"
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}
          className="min-h-[260px] md:min-h-0"
        >
          <TradingViewChart symbol={selectedSymbol} />
        </div>

        {/* ── RIGHT: GAME PANEL ── */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: 320,
            flexShrink: 0,
            minHeight: 0,
            background: "linear-gradient(180deg, #0A1F3D 0%, #081729 100%)",
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
          className="flex md:hidden w-full"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            maxHeight: "58vh", overflowY: "auto",
            background: "linear-gradient(180deg, #0A1F3D 0%, #081729 100%)",
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
