import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingSidebar } from "@/components/trading/TradingSidebar";
import { WebsiteTour } from "@/components/tour/WebsiteTour";
import { Trophy } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  // Optional ?tournament=<id> to pre-select a specific tournament (e.g. from Blitz).
  const search = useSearch();
  const requestedTournamentId = useMemo(() => {
    const raw = new URLSearchParams(search).get("tournament");
    const id = raw ? parseInt(raw) : NaN;
    return Number.isNaN(id) ? null : id;
  }, [search]);

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

  // Auto-select a tournament; no forced default symbol — let user search.
  // Prefer the one named in the URL (?tournament=<id>, e.g. from Blitz),
  // falling back to the first active tournament.
  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournament) {
      const requested = requestedTournamentId
        ? activeTournaments.find((t: any) => t.id === requestedTournamentId)
        : null;
      setSelectedTournament(requested || activeTournaments[0]);
    }
  }, [activeTournaments, selectedTournament, requestedTournamentId]);

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

  // Stat bar derived values
  const { holdings, invested, totalPL, totalValue, pctChange } = useMemo(() => {
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
    return { holdings, invested, totalPL, totalValue, pctChange };
  }, [portfolioResponse, buyingPower, selectedTournament]);

  const handleOrderExecuted = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/tournaments", selectedTournament?.id, "balance"],
    });
    queryClient.invalidateQueries({
      queryKey: ["/api/portfolio/tournament", selectedTournament?.id],
    });
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!user) {
    return (
      <div
        style={{
          height: "calc(100dvh - 4rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#C9D1E2", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Please Log In
          </h2>
          <p style={{ color: "#8A93A6" }}>
            You need to be logged in to view your trading dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (activeTournaments.length === 0) {
    return (
      <div
        style={{
          height: "calc(100dvh - 4rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(227,179,65,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Trophy size={28} color="#E3B341" />
          </div>
          <h3 style={{ color: "#C9D1E2", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No Active Tournaments
          </h3>
          <p style={{ color: "#8A93A6", marginBottom: "1rem" }}>
            Join or create a tournament to start trading
          </p>
          <Button
            asChild
            style={{
              background: "linear-gradient(135deg, #00A3FF 0%, #0066CC 100%)",
              color: "#FFFFFF",
              border: "none",
            }}
          >
            <a href="/tournaments">Browse Tournaments</a>
          </Button>
        </div>
      </div>
    );
  }

  const plPositive = totalPL >= 0;
  const pctPositive = pctChange >= 0;

  return (
    <>
      <WebsiteTour />
      {/* Full viewport minus header, flex column */}
      <div
        style={{
          height: "calc(100dvh - 4rem)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "transparent",
        }}
      >
        {/* ── STAT BAR ─────────────────────────────────────────────── */}
        <div
          style={{
            height: 48,
            flexShrink: 0,
            background: "rgba(14, 36, 64, 0.95)",
            borderBottom: "1px solid rgba(0,163,255,0.15)",
            display: "flex",
            alignItems: "center",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            gap: 0,
            overflowX: "auto",
          }}
        >
          {/* Tournament name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              paddingRight: "1rem",
              borderRight: "1px solid rgba(0,163,255,0.15)",
              minWidth: 0,
              flexShrink: 1,
              maxWidth: 220,
            }}
          >
            <Trophy size={14} color="#E3B341" style={{ flexShrink: 0 }} />
            <span
              style={{
                color: "#E3B341",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedTournament?.name || "—"}
            </span>
          </div>

          {/* Portfolio total + % change */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              borderRight: "1px solid rgba(0,163,255,0.15)",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#8A93A6", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Portfolio
            </span>
            <span style={{ color: "#C9D1E2", fontSize: "0.9rem", fontWeight: 700 }}>
              {formatMoney(totalValue)}
            </span>
            <span
              style={{
                background: pctPositive ? "rgba(40,199,111,0.15)" : "rgba(255,79,88,0.15)",
                color: pctPositive ? "#28C76F" : "#FF4F58",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {pctPositive ? "+" : ""}{pctChange.toFixed(2)}%
            </span>
          </div>

          {/* Buying power */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              borderRight: "1px solid rgba(0,163,255,0.15)",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#8A93A6", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Cash
            </span>
            <span style={{ color: "#00A3FF", fontSize: "0.85rem", fontWeight: 600 }}>
              {formatMoney(buyingPower)}
            </span>
          </div>

          {/* P/L */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              paddingLeft: "1rem",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#8A93A6", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              P/L
            </span>
            <span
              style={{
                color: plPositive ? "#28C76F" : "#FF4F58",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {plPositive ? "+" : ""}{formatMoney(totalPL)}
            </span>
          </div>
        </div>

        {/* ── MAIN BODY: chart + sidebar ────────────────────────────── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "row",
          }}
        >
          {/* Chart — fills remaining space */}
          <div
            data-tour="chart-area"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              // On small screens, give it a fixed height and let sidebar stack below
            }}
            className="min-h-[280px] md:min-h-0"
          >
            <TradingViewChart symbol={selectedSymbol} />
          </div>

          {/* Trade panel sidebar — 330px fixed */}
          <div
            style={{
              width: 330,
              flexShrink: 0,
              background: "#0E2440",
              borderLeft: "1px solid rgba(0,163,255,0.12)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflowY: "auto",
            }}
            className="hidden md:flex"
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

        {/* Mobile: sidebar stacks below chart */}
        <div
          style={{
            background: "#0E2440",
            borderTop: "1px solid rgba(0,163,255,0.12)",
            flexShrink: 0,
            maxHeight: "55vh",
            overflowY: "auto",
          }}
          className="flex md:hidden"
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
