import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { StockHeader } from "@/components/trading/StockHeader";
import { AboutSection } from "@/components/trading/AboutSection";
import { HoldingsList } from "@/components/trading/HoldingsList";
import { OrderPanel } from "@/components/trading/OrderPanel";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
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

  // Auto-select first tournament
  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(activeTournaments[0]);
    }
  }, [activeTournaments, selectedTournament]);

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
  const change = quote?.change || 0;
  const percentChange = quote?.percentChange || 0;
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
    <div
      className="min-h-screen flex flex-col [@media(min-aspect-ratio:1/1)]:flex-row"
      style={{ backgroundColor: "#080C14" }}
    >
      {/* LEFT SIDE: Chart + Info */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Stock Header */}
        <StockHeader
          symbol={selectedSymbol}
          companyName={companyName}
          price={price}
          change={change}
          percentChange={percentChange}
        />

        {/* TradingView Chart */}
        <div
          className="flex-1 min-h-[400px] [@media(min-aspect-ratio:1/1)]:min-h-[500px] mx-2 [@media(min-aspect-ratio:1/1)]:mx-4 rounded-xl overflow-hidden"
          style={{ border: "1px solid #1F2937" }}
        >
          <TradingViewChart symbol={selectedSymbol} />
        </div>

        {/* Info Section (scrollable) */}
        <ScrollArea className="max-h-[400px] mx-2 [@media(min-aspect-ratio:1/1)]:mx-4 mt-2 mb-2">
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "#111827", border: "1px solid #1F2937" }}
          >
            <AboutSection symbol={selectedSymbol} />
            <HoldingsList
              tournamentId={selectedTournament?.id}
              selectedSymbol={selectedSymbol}
              onSelectStock={setSelectedSymbol}
            />
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT SIDE: Order Panel (full height) */}
      <div
        className="w-full [@media(min-aspect-ratio:1/1)]:w-96 flex flex-col"
        style={{
          backgroundColor: "#111827",
          borderLeft: "1px solid #1F2937",
        }}
      >
        <OrderPanel
          symbol={selectedSymbol}
          companyName={companyName}
          currentPrice={price}
          tournamentId={selectedTournament?.id}
          availableBuyingPower={buyingPower}
          ownedShares={ownedShares}
          onOrderExecuted={handleOrderExecuted}
          onSymbolChange={setSelectedSymbol}
          activeTournaments={activeTournaments}
          selectedTournament={selectedTournament}
          onTournamentChange={setSelectedTournament}
        />
      </div>
    </div>
  );
}
