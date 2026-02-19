import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingSidebar } from "@/components/trading/TradingSidebar";
import { WebsiteTour } from "@/components/tour/WebsiteTour";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  // Fetch quote for selected symbol
  const { data: quoteResponse } = useQuery({
    queryKey: ["/api/quote", selectedSymbol],
    enabled: !!selectedSymbol,
    refetchInterval: 15000,
  });

  // Fetch company profile
  const { data: profileResponse } = useQuery({
    queryKey: ["/api/summary", selectedSymbol],
    enabled: !!selectedSymbol,
  });

  // Fetch tournaments
  const { data: tournamentsResponse } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const activeTournaments = useMemo(() => {
    const all = (tournamentsResponse as any)?.data || [];
    return all.filter((t: any) => t.status === "active");
  }, [tournamentsResponse]);

  // Auto-select first tournament and set default symbol
  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      const firstTournament = activeTournaments[0];
      setSelectedTournament(firstTournament);

      // Set default symbol based on tournament type
      const defaultSymbol = firstTournament.tournamentType === 'crypto' ? 'BTC-USD' : 'AAPL';
      setSelectedSymbol(defaultSymbol);
    }
  }, [activeTournaments, selectedTournament]);

  // Update symbol when tournament changes
  useEffect(() => {
    if (selectedTournament && selectedSymbol === "") {
      const defaultSymbol = selectedTournament.tournamentType === 'crypto' ? 'BTC-USD' : 'AAPL';
      setSelectedSymbol(defaultSymbol);
    }
  }, [selectedTournament, selectedSymbol]);

  // Fetch tournament balance
  const { data: balanceResponse } = useQuery({
    queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    enabled: !!selectedTournament?.id,
  });

  // Fetch portfolio
  const { data: portfolioResponse } = useQuery({
    queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    enabled: !!selectedTournament?.id,
  });

  // Derived values
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

  const handleOrderExecuted = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    });
    queryClient.invalidateQueries({
      queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    });
  };

  if (!user) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#080C14" }}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            Please Log In
          </h2>
          <p style={{ color: "#94A3B8" }}>
            You need to be logged in to view your trading dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (activeTournaments.length === 0) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#080C14" }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            No Active Tournaments
          </h3>
          <p className="mb-4" style={{ color: "#94A3B8" }}>
            Join or create a tournament to start trading
          </p>
          <Button asChild style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}>
            <a href="/tournaments">Browse Tournaments</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <WebsiteTour />
      <div
        className="h-screen flex flex-col md:flex-row"
        style={{ backgroundColor: "#080C14" }}
      >
      {/* LEFT: Chart fills ~5/7 of width */}
      <div data-tour="chart-area" className="flex-1 min-w-0 min-h-[350px] md:min-h-0 h-full">
        <TradingViewChart symbol={selectedSymbol} />
      </div>

      {/* RIGHT: Unified Sidebar ~2/7 of width */}
      <div
        className="w-full md:w-[265px] md:max-w-[265px] md:min-w-[220px] flex flex-col h-[60vh] md:h-full"
        style={{
          backgroundColor: "#111827",
          borderLeft: "1px solid #1F2937",
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
        />
      </div>
      </div>
    </>
  );
}
