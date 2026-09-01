import { useMemo, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Dashboard from "./dashboard";
import {
  Lock, ArrowLeft
} from "lucide-react";
import { TradebattleIcon } from "@/components/tradebattle-icons";
import { motion } from "framer-motion";
import { Link } from "wouter";

const UP = "#67E7BF";
const DOWN = "#FF3D5A";
const GOLD = "#F2C76A";

function fmt(n: number) {
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ScanlineOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
    }} />
  );
}

// ── Spectator view ────────────────────────────────────────────────────────────
function SpectatorView({ tournament, tournamentId }: { tournament: any; tournamentId: number }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: leaderboardData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["/api/tournaments", tournamentId, "leaderboard"],
    refetchInterval: 15000,
  });

  const participants: any[] = (leaderboardData as any)?.participants || [];
  const startingBalance = parseFloat(tournament?.startingBalance) || 10000;
  const isLive = tournament?.status === "active";
  const isWaiting = tournament?.status === "waiting";

  const selectedParticipant = participants.find(p => p.userId === selectedUserId);

  const typeIcon = tournament?.tournamentType === "crypto" ? Bitcoin : TrendingUp;
  const TypeIcon = typeIcon;

  return (
    <div className="arena-page-shell tournament-view-page" style={{ minHeight: "calc(100dvh - 4rem)", background: "transparent", padding: "24px 20px 48px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Back */}
        <Link href="/tournaments">
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            marginBottom: "20px", background: "none", border: "none",
            color: "#4B6080", fontSize: "13px", fontWeight: 700, cursor: "pointer",
          }}>
            <ArrowLeft size={14} /> Arenas
          </button>
        </Link>

        {/* Tournament header */}
        <div style={{
          background: "linear-gradient(135deg, #0A1C2C 0%, #081622 100%)",
          border: `1px solid ${isLive ? "rgba(0,255,135,0.25)" : "rgba(0,163,255,0.15)"}`,
          borderRadius: "20px", padding: "24px 28px", marginBottom: "20px",
          position: "relative", overflow: "hidden",
          boxShadow: isLive ? "0 0 32px rgba(0,255,135,0.06)" : "0 0 24px rgba(0,163,255,0.05)",
        }}>
          <ScanlineOverlay />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div style={{
                    padding: "6px", borderRadius: "10px",
                    background: "rgba(0,163,255,0.1)", border: "1px solid rgba(0,163,255,0.2)",
                  }}>
                    <TypeIcon size={16} color="#67E7BF" />
                  </div>
                  <h1 style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 900, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>
                    {tournament?.name}
                  </h1>
                  {!tournament?.isPublic && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      padding: "2px 8px", borderRadius: "20px",
                      background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)",
                    }}>
                      <Lock size={10} color="#8A93A6" />
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#8A93A6" }}>Closed entry</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {isLive && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", borderRadius: "20px",
                      background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.3)",
                    }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: UP, animation: "pulse 1.5s infinite" }} />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: UP }}>LIVE</span>
                    </div>
                  )}
                  {isWaiting && (
                    <div style={{
                      padding: "3px 10px", borderRadius: "20px",
                      background: "rgba(0,163,255,0.1)", border: "1px solid rgba(0,163,255,0.25)",
                    }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#67E7BF" }}>WAITING FOR OPENING BELL</span>
                    </div>
                  )}
                  <span style={{ fontSize: "12px", color: "#4B6080", fontWeight: 600 }}>
                    {tournament?.tournamentType === "crypto" ? "Crypto" : "Stocks"}
                  </span>
                </div>
              </div>

              {/* Stats chips */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B6080", marginBottom: "2px" }}>Prize pool</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: GOLD, textShadow: `0 0 12px rgba(227,179,65,0.4)` }}>
                    {fmt((tournament?.currentPlayers || 0) * (parseFloat(tournament?.buyInAmount) || 0))}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B6080", marginBottom: "2px" }}>Entry fee</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#C9D1E2" }}>
                    {parseFloat(tournament?.buyInAmount) > 0 ? fmt(parseFloat(tournament?.buyInAmount)) : "No fee"}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B6080", marginBottom: "2px" }}>Players</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#C9D1E2" }}>
                    {tournament?.currentPlayers}/{tournament?.maxPlayers}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B6080", marginBottom: "2px" }}>Starting capital</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#C9D1E2" }}>{fmt(startingBalance)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: selectedParticipant ? "1fr 320px" : "1fr", gap: "16px" }} className="spectator-grid">

          {/* Leaderboard */}
          <div style={{
            background: "linear-gradient(135deg, #0A1C2C 0%, #081622 100%)",
            border: "1px solid rgba(0,163,255,0.12)", borderRadius: "20px",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid rgba(0,163,255,0.08)",
              background: "rgba(0,163,255,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TradebattleIcon name="rankings" size={15} color={GOLD} />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#C9D1E2" }}>Rankings</span>
                {!isLoading && (
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "1px 8px", borderRadius: "20px",
                    background: "rgba(0,163,255,0.1)", border: "1px solid rgba(0,163,255,0.2)", color: "#67E7BF",
                  }}>
                    {participants.length} players
                  </span>
                )}
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#4B6080", fontSize: "11px", fontWeight: 700,
                  opacity: isFetching ? 0.5 : 1,
                }}
              >
                <TradebattleIcon name="refresh" size={12} style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>

            {/* Rows */}
            {isLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#4B6080", fontSize: "13px" }}>Loading…</div>
            ) : participants.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <TradebattleIcon name="players" size={32} style={{ color: "#1C3E72", margin: "0 auto 12px", display: "block" }} />
                <p style={{ color: "#4B6080", fontSize: "13px", fontWeight: 600 }}>No participants yet</p>
              </div>
            ) : (
              <div>
                {participants.map((p: any, i: number) => {
                  const pctChange = startingBalance > 0 ? ((p.totalValue - startingBalance) / startingBalance) * 100 : 0;
                  const isUp = pctChange >= 0;
                  const isSelected = selectedUserId === p.userId;
                  const rankColors = ["#F2C76A", "#94A3B8", "#CD7F32"];
                  const rankColor = i < 3 ? rankColors[i] : "#4B6080";

                  return (
                    <motion.div
                      key={p.userId}
                      whileHover={{ backgroundColor: "rgba(0,163,255,0.04)" }}
                      onClick={() => setSelectedUserId(isSelected ? null : p.userId)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        background: isSelected ? "rgba(0,163,255,0.06)" : "transparent",
                        borderLeft: isSelected ? "3px solid #67E7BF" : "3px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* Rank */}
                      <div style={{
                        width: "28px", textAlign: "center", flexShrink: 0,
                        fontSize: i < 3 ? "16px" : "13px", fontWeight: 900, color: rankColor,
                      }}>
                        {i === 0 ? <TradebattleIcon name="rankings" size={18} color={GOLD} /> : `#${i + 1}`}
                      </div>

                      {/* Avatar */}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${rankColor}22, ${rankColor}08)`,
                        border: `2px solid ${rankColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 900, color: rankColor,
                      }}>
                        {p.username?.[0]?.toUpperCase() || "?"}
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#C9D1E2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.username}
                        </div>
                        <div style={{ fontSize: "11px", color: "#4B6080", fontWeight: 600, marginTop: "1px" }}>
                          Cash {fmt(p.balance)} · Holdings {fmt(p.stockValue || 0)}
                        </div>
                      </div>

                      {/* Portfolio value */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF" }}>
                          {fmt(p.totalValue)}
                        </div>
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "3px",
                          padding: "1px 6px", borderRadius: "6px",
                          background: isUp ? "rgba(0,255,135,0.1)" : "rgba(255,61,90,0.1)",
                          border: `1px solid ${isUp ? "rgba(0,255,135,0.25)" : "rgba(255,61,90,0.25)"}`,
                        }}>
                          {isUp ? <TradebattleIcon name="trend" size={10} color={UP} /> : <TradebattleIcon name="trend" size={10} color={DOWN} />}
                          <span style={{ fontSize: "10px", fontWeight: 800, color: isUp ? UP : DOWN }}>
                            {isUp ? "+" : ""}{pctChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Participant detail panel */}
          {selectedParticipant && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: "linear-gradient(135deg, #0A1C2C 0%, #081622 100%)",
                border: "1px solid rgba(0,163,255,0.15)", borderRadius: "20px",
                overflow: "hidden", alignSelf: "start",
              }}
            >
              {/* Panel header */}
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid rgba(0,163,255,0.08)",
                background: "rgba(0,163,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "rgba(0,163,255,0.12)", border: "2px solid rgba(0,163,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 900, color: "#67E7BF",
                  }}>
                    {selectedParticipant.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#C9D1E2" }}>{selectedParticipant.username}</div>
                    <div style={{ fontSize: "10px", color: "#4B6080", fontWeight: 600 }}>
                      Rank #{participants.findIndex((p: any) => p.userId === selectedParticipant.userId) + 1}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  style={{ background: "none", border: "none", color: "#4B6080", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}
                >×</button>
              </div>

              {/* Portfolio summary */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,163,255,0.06)" }}>
                {[
                  { label: "Total Value", value: fmt(selectedParticipant.totalValue), color: "#FFFFFF" },
                  { label: "Cash", value: fmt(selectedParticipant.balance), color: "#67E7BF" },
                  { label: "Holdings", value: fmt(selectedParticipant.stockValue || 0), color: "#C9D1E2" },
                  {
                    label: "P&L",
                    value: `${selectedParticipant.totalValue - startingBalance >= 0 ? "+" : ""}${fmt(selectedParticipant.totalValue - startingBalance)}`,
                    color: selectedParticipant.totalValue >= startingBalance ? UP : DOWN,
                  },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                    <span style={{ fontSize: "11px", color: "#4B6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{row.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 900, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Holdings */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B6080", marginBottom: "10px" }}>
                  Holdings
                </div>
                {(!selectedParticipant.stockHoldings || selectedParticipant.stockHoldings.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#4B6080", fontSize: "12px" }}>No open positions</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedParticipant.stockHoldings
                      .filter((h: any) => h.quantity > 0)
                      .map((h: any) => {
                        const pl = (h.currentPrice - h.averagePrice) * h.quantity;
                        const isUp = pl >= 0;
                        return (
                          <div key={h.symbol} style={{
                            padding: "10px 12px", borderRadius: "10px",
                            background: isUp ? "rgba(0,255,135,0.04)" : "rgba(255,61,90,0.04)",
                            border: `1px solid ${isUp ? "rgba(0,255,135,0.12)" : "rgba(255,61,90,0.12)"}`,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: "12px", fontWeight: 900, color: "#C9D1E2" }}>{h.symbol}</div>
                                <div style={{ fontSize: "10px", color: "#4B6080", marginTop: "1px" }}>
                                  {h.quantity} units @ {fmt(h.averagePrice)}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", fontWeight: 800, color: "#C9D1E2" }}>{fmt(h.currentValue)}</div>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: isUp ? UP : DOWN }}>
                                  {isUp ? "+" : ""}{fmt(pl)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .spectator-grid { grid-template-columns: 1fr !important; } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TournamentView() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const tournamentId = parseInt(params.id || "");

  const { data: tournamentData, isLoading } = useQuery({
    queryKey: ["/api/tournaments", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (!res.ok) throw new Error("Tournament not found");
      return res.json();
    },
    enabled: !isNaN(tournamentId) && !!user,
  });

  const tournament = (tournamentData as any)?.data;

  const isParticipant = useMemo(() => {
    if (!tournament || !user) return false;
    const ids: number[] = tournament.participantUserIds || [];
    return ids.includes(user.id) || tournament.creatorId === user.id;
  }, [tournament, user]);

  if (!user) {
    return (
      <div style={{ height: "calc(100dvh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#C9D1E2", fontWeight: 800 }}>Enter the arena</h2>
          <p style={{ color: "#4B6080" }}>Sign in to view this arena.</p>
        </div>
      </div>
    );
  }

  if (isNaN(tournamentId)) {
    return (
      <div style={{ height: "calc(100dvh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#C9D1E2", fontWeight: 800 }}>Invalid arena</h2>
          <Link href="/tournaments"><span style={{ color: "#67E7BF", cursor: "pointer" }}>Scout arenas</span></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ height: "calc(100dvh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#4B6080", fontSize: "14px", fontWeight: 600 }}>Loading arena…</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ height: "calc(100dvh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <TradebattleIcon name="rankings" size={48} style={{ color: "#1C3E72", margin: "0 auto 12px", display: "block" }} />
          <h2 style={{ color: "#C9D1E2", fontWeight: 800 }}>Arena not found</h2>
          <Link href="/tournaments"><span style={{ color: "#67E7BF", cursor: "pointer" }}>Scout arenas</span></Link>
        </div>
      </div>
    );
  }

  // Active participant → full trading dashboard
  if (isParticipant && tournament.status === "active") {
    return <Dashboard forcedTournamentId={tournamentId} />;
  }

  // Everyone else (spectators, waiting participants, completed) → spectator view
  return <SpectatorView tournament={tournament} tournamentId={tournamentId} />;
}
