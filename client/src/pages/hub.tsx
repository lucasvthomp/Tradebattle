import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Clock, Trophy, Zap, DollarSign, BarChart3, TrendingUp } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function computeLevel(wins: number, trades: number) {
  const xp = wins * 120 + trades * 8;
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const currentLevelXP = Math.pow(level - 1, 2) * 40;
  const nextLevelXP = Math.pow(level, 2) * 40;
  const progress =
    nextLevelXP === currentLevelXP
      ? 100
      : Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  return { level, xp, progress: Math.min(progress, 100), nextLevelXP, currentLevelXP };
}

function getRankTitle(level: number) {
  if (level >= 50) return { title: "Legend", color: "#FF4F58" };
  if (level >= 30) return { title: "Elite", color: "#00A3FF" };
  if (level >= 20) return { title: "Expert", color: "#8B5CF6" };
  if (level >= 12) return { title: "Veteran", color: "#06B6D4" };
  if (level >= 6) return { title: "Trader", color: "#28C76F" };
  return { title: "Rookie", color: "#8A93A6" };
}

function ScanlineOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function hexToRgb(hex: string): string {
  const map: Record<string, string> = {
    "#FF4F58": "255,79,88",
    "#00A3FF": "0,163,255",
    "#8B5CF6": "139,92,246",
    "#06B6D4": "6,182,212",
    "#28C76F": "40,199,111",
    "#8A93A6": "138,147,166",
    "#E3B341": "227,179,65",
    "#00FF87": "0,255,135",
    "#FF7A00": "255,122,0",
  };
  return map[hex] ?? "255,255,255";
}

// ─── subcomponents ─────────────────────────────────────────────────────────────

/** SVG rank ring — two concentric circles, one dim track, one colored arc */
function RankRing({
  level,
  progress,
  rankColor,
}: {
  level: number;
  progress: number;
  rankColor: string;
}) {
  const SIZE = 72;
  const STROKE = 5;
  const R = (SIZE - STROKE * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = (progress / 100) * CIRC;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      {/* dim track */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={STROKE}
      />
      {/* progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={rankColor}
        strokeWidth={STROKE}
        strokeLinecap="butt"
        strokeDasharray={`${dash} ${CIRC - dash}`}
        strokeDashoffset={0}
      />
      {/* level number — counter-rotate so text is upright */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={rankColor}
        fontSize="18"
        fontWeight="900"
        fontFamily="'Courier New', monospace"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {level}
      </text>
    </svg>
  );
}

// ─── main page ─────────────────────────────────────────────────────────────────

export default function Hub() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredOp, setHoveredOp] = useState<string | null>(null);
  const [hoveredTournament, setHoveredTournament] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: tournamentsData } = useQuery({ queryKey: ["/api/tournaments"] });

  const activeTournaments =
    (tournamentsData as any)?.data?.filter((t: any) => t.status === "active") || [];
  const upcomingTournaments =
    (tournamentsData as any)?.data?.filter((t: any) => t.status === "upcoming") || [];

  const wins = user?.tournamentWins || 0;
  const trades = user?.totalTrades || 0;
  const { level, xp, progress } = computeLevel(wins, trades);
  const { title: rankTitle, color: rankColor } = getRankTitle(level);
  const rankRgb = hexToRgb(rankColor);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const hour = currentTime.getHours();
  const day = currentTime.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isMarketOpen = isWeekday && hour >= 9 && hour < 16;

  const balance = (Number(user?.siteCash) || 0).toFixed(2);

  // Operations nav entries
  const ops = [
    { id: "dashboard", label: "DASHBOARD", sub: "Overview", href: "/dashboard", color: "#00A3FF" },
    { id: "tournaments", label: "TOURNAMENTS", sub: "Compete", href: "/tournaments", color: "#28C76F" },
    { id: "blitz", label: "BLITZ", sub: "1v1 · 5 min", href: "/blitz", color: "#8B5CF6" },
    { id: "leaderboard", label: "LEADERBOARD", sub: "Rankings", href: "/leaderboard", color: "#E3B341" },
    { id: "deposit", label: "DEPOSIT", sub: "Fund wallet", href: "/deposit", color: "#06B6D4" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#040D18", display: "flex", flexDirection: "column" }}>

      {/* ════════════════════════════════════════════════════════════════════════
          BAND 1 — COMMAND STRIP
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="tour-hub-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          minHeight: "140px",
          background: "#040D18",
          borderBottom: "1px solid rgba(0,163,255,0.18)",
          boxShadow: "0 1px 0 rgba(0,163,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "0",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* subtle top-left radial */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "400px",
          height: "140px",
          background: `radial-gradient(ellipse at 0% 50%, rgba(${rankRgb},0.06) 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />

        {/* ── IDENTITY BLOCK (far left) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {/* Rank ring */}
          <RankRing level={level} progress={progress} rankColor={rankColor} />

          {/* Name + rank label */}
          <div>
            <div style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#F0F4FF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {user?.username ?? "—"}
            </div>
            <div style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: rankColor,
              marginTop: "3px",
            }}>
              {rankTitle} &nbsp;·&nbsp; LV.{level}
            </div>
            <div style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#2A3A50",
              marginTop: "2px",
            }}>
              {getGreeting()}
            </div>
          </div>
        </div>

        {/* thin separator */}
        <div style={{ width: "1px", height: "70px", background: "rgba(0,163,255,0.1)", margin: "0 24px", flexShrink: 0 }} />

        {/* ── XP BAR (middle, ~40% width) ── */}
        <div style={{ flex: "0 0 38%", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2A3A50" }}>
              XP PROGRESS
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#5A7090", fontFamily: "'Courier New', monospace" }}>
              {xp} / {Math.pow(level, 2) * 40}
            </span>
          </div>
          <div style={{
            height: "6px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "2px",
            overflow: "hidden",
            position: "relative",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${rankColor}, rgba(${rankRgb},0.5))`,
                borderRadius: "2px",
                position: "relative",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
            <span style={{ fontSize: "9px", color: "#2A3A50", fontFamily: "'Courier New', monospace" }}>
              LV.{level}
            </span>
            <span style={{ fontSize: "9px", color: "#2A3A50", fontFamily: "'Courier New', monospace" }}>
              {progress}% TO LV.{level + 1}
            </span>
          </div>
        </div>

        {/* thin separator */}
        <div style={{ width: "1px", height: "70px", background: "rgba(0,163,255,0.1)", margin: "0 24px", flexShrink: 0 }} />

        {/* ── STATUS TICKER (far right) ── */}
        <div
          className="hub-stats"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "stretch",
            gap: "0",
            flexShrink: 0,
          }}
        >
          {[
            { label: "BALANCE", value: `$${balance}`, color: "#00A3FF" },
            { label: "WINS", value: String(wins), color: "#28C76F" },
            { label: "TRADES", value: String(trades), color: "#06B6D4" },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "0 20px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(0,163,255,0.1)",
              }}
            >
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#2A3A50",
                marginBottom: "4px",
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: "22px",
                fontWeight: 900,
                color: item.color,
                fontFamily: "'Courier New', monospace",
                lineHeight: 1,
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* market status dot — far right edge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          marginLeft: "20px",
          paddingLeft: "20px",
          borderLeft: "1px solid rgba(0,163,255,0.1)",
          flexShrink: 0,
        }}>
          <div style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: isMarketOpen ? "#28C76F" : "#FF4F58",
            boxShadow: isMarketOpen ? "0 0 8px rgba(40,199,111,0.7)" : "none",
            animation: isMarketOpen ? "hubPulse 2s ease-in-out infinite" : "none",
          }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              color: isMarketOpen ? "#28C76F" : "#FF4F58",
              lineHeight: 1,
            }}>
              {isMarketOpen ? "MKT OPEN" : "MKT CLOSED"}
            </span>
            <span style={{ fontSize: "9px", color: "#2A3A50", marginTop: "2px", letterSpacing: "0.04em" }}>
              NYSE · 9:30–16:00 ET
            </span>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          BAND 2 — ARENA (3-column grid)
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "220px 1fr 260px",
        gridTemplateRows: "1fr",
        minHeight: 0,
      }}>

        {/* ══ COLUMN 1: OPERATIONS ══ */}
        <div style={{
          background: "rgba(0,0,0,0.25)",
          borderRight: "1px solid rgba(0,163,255,0.08)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          gap: 0,
        }}>
          {/* heading */}
          <div style={{
            padding: "0 20px 14px",
            borderBottom: "1px solid rgba(0,163,255,0.06)",
            marginBottom: "8px",
          }}>
            <span style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#2A3A50",
            }}>
              NAVIGATION
            </span>
          </div>

          {ops.map((op) => {
            const isHovered = hoveredOp === op.id;
            const opRgb = hexToRgb(op.color);
            return (
              <Link key={op.id} href={op.href}>
                <div
                  onMouseEnter={() => setHoveredOp(op.id)}
                  onMouseLeave={() => setHoveredOp(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 20px",
                    cursor: "pointer",
                    background: isHovered ? `rgba(${opRgb},0.07)` : "transparent",
                    borderLeft: isHovered ? `2px solid ${op.color}` : "2px solid transparent",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  {/* color square */}
                  <div style={{
                    width: "10px",
                    height: "10px",
                    background: op.color,
                    flexShrink: 0,
                    opacity: isHovered ? 1 : 0.5,
                    transition: "opacity 0.15s",
                  }} />
                  <div>
                    <div style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: isHovered ? "#F0F4FF" : "#5A7090",
                      transition: "color 0.15s",
                      lineHeight: 1,
                    }}>
                      {op.label}
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: isHovered ? op.color : "#2A3A50",
                      marginTop: "3px",
                      transition: "color 0.15s",
                    }}>
                      {op.sub}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* separator line */}
          <div style={{ flex: 1 }} />
          <div style={{ padding: "14px 20px 0", borderTop: "1px solid rgba(0,163,255,0.06)" }}>
            <div style={{ fontSize: "9px", color: "#2A3A50", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>
              SYS · {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
          </div>
        </div>

        {/* ══ COLUMN 2: LIVE CONTENT ══ */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          padding: "24px",
          gap: 0,
        }}>

          {/* section label */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}>
            <span style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#2A3A50",
            }}>
              ACTIVE TOURNAMENTS
            </span>
            {activeTournaments.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#28C76F",
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(40,199,111,0.8)",
                  animation: "hubPulse 1.4s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#28C76F",
                  letterSpacing: "0.1em",
                  fontFamily: "'Courier New', monospace",
                }}>
                  {activeTournaments.length} LIVE
                </span>
              </span>
            )}
            <div style={{ flex: 1, height: "1px", background: "rgba(0,163,255,0.07)" }} />
            <Link href="/tournaments">
              <span style={{ fontSize: "10px", color: "#00A3FF", cursor: "pointer", letterSpacing: "0.08em", fontWeight: 700 }}>
                VIEW ALL
              </span>
            </Link>
          </div>

          {/* live tournament slots */}
          {activeTournaments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "32px" }}>
              {activeTournaments.slice(0, 6).map((t: any, i: number) => {
                const pct = t.maxPlayers > 0 ? Math.round(((t.participantCount || 0) / t.maxPlayers) * 100) : 0;
                const prizePool = Number(t.buyInAmount || 0) * (t.participantCount || 0);
                const isHov = hoveredTournament === t.id;
                return (
                  <Link key={t.id} href={`/tournament/${t.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onMouseEnter={() => setHoveredTournament(t.id)}
                      onMouseLeave={() => setHoveredTournament(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px 18px",
                        borderBottom: "1px solid rgba(0,163,255,0.06)",
                        background: isHov ? "rgba(0,163,255,0.04)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        position: "relative",
                      }}
                    >
                      {/* left accent line appears on hover */}
                      {isHov && (
                        <div style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "2px",
                          background: "#28C76F",
                        }} />
                      )}

                      {/* live dot */}
                      <div style={{ flexShrink: 0 }}>
                        <div style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#28C76F",
                          boxShadow: "0 0 8px rgba(40,199,111,0.8)",
                          animation: "hubPulse 1.4s ease-in-out infinite",
                        }} />
                      </div>

                      {/* tournament name + fill bar */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: isHov ? "#F0F4FF" : "#C9D1E2",
                          marginBottom: "6px",
                          transition: "color 0.15s",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {t.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            flex: 1,
                            height: "3px",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "1px",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "#28C76F",
                              borderRadius: "1px",
                              transition: "width 0.4s ease",
                            }} />
                          </div>
                          <span style={{
                            fontSize: "11px",
                            color: "#5A7090",
                            fontFamily: "'Courier New', monospace",
                            flexShrink: 0,
                          }}>
                            {t.participantCount || 0}/{t.maxPlayers}
                          </span>
                        </div>
                      </div>

                      {/* prize pool badge */}
                      {prizePool > 0 && (
                        <div style={{
                          padding: "4px 10px",
                          background: "rgba(227,179,65,0.08)",
                          border: "1px solid rgba(227,179,65,0.2)",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#E3B341",
                          fontFamily: "'Courier New', monospace",
                          flexShrink: 0,
                          borderRadius: "3px",
                        }}>
                          ${prizePool.toFixed(0)}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: "32px 0",
              marginBottom: "32px",
              borderBottom: "1px solid rgba(0,163,255,0.06)",
            }}>
              <div style={{ fontSize: "13px", color: "#2A3A50", fontWeight: 600 }}>
                No live tournaments at this time.
              </div>
              <Link href="/tournaments">
                <span style={{ fontSize: "12px", color: "#00A3FF", cursor: "pointer", fontWeight: 700, marginTop: "6px", display: "inline-block" }}>
                  Browse all tournaments
                </span>
              </Link>
            </div>
          )}

          {/* upcoming tournaments */}
          {upcomingTournaments.length > 0 && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}>
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#2A3A50",
                }}>
                  UPCOMING
                </span>
                <div style={{ flex: 1, height: "1px", background: "rgba(0,163,255,0.07)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {upcomingTournaments.slice(0, 4).map((t: any, i: number) => {
                  const prizePool = Number(t.buyInAmount || 0) * (t.participantCount || 0);
                  const isHov = hoveredTournament === t.id + 9000;
                  return (
                    <Link key={t.id} href={`/tournament/${t.id}`}>
                      <div
                        onMouseEnter={() => setHoveredTournament(t.id + 9000)}
                        onMouseLeave={() => setHoveredTournament(null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "13px 18px",
                          borderBottom: "1px solid rgba(0,163,255,0.05)",
                          background: isHov ? "rgba(0,163,255,0.03)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          opacity: 0.7,
                        }}
                      >
                        <Clock size={11} style={{ color: "#2A3A50", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#8A93A6",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#2A3A50", marginTop: "2px" }}>
                            {t.participantCount || 0}/{t.maxPlayers} registered &nbsp;·&nbsp; ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                          </div>
                        </div>
                        {prizePool > 0 && (
                          <span style={{
                            fontSize: "11px",
                            color: "#5A7090",
                            fontFamily: "'Courier New', monospace",
                          }}>
                            ${prizePool.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ══ COLUMN 3: BLITZ PANEL ══ */}
        <Link href="/blitz">
          <div style={{
            height: "100%",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(170deg, #110828 0%, #0C0520 40%, #08041A 100%)",
            borderLeft: "1px solid rgba(139,92,246,0.2)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
          }}>
            <ScanlineOverlay />

            {/* ambient purple glow */}
            <div style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", padding: "28px 24px" }}>
              {/* BLITZ heading */}
              <div style={{ marginBottom: "auto" }}>
                <div style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(139,92,246,0.5)",
                  marginBottom: "8px",
                }}>
                  GAME MODE
                </div>
                <div style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#E2D8FF",
                  lineHeight: 1,
                  textShadow: "0 0 32px rgba(139,92,246,0.5)",
                }}>
                  BLITZ
                </div>
              </div>

              {/* lightning icon with pulse */}
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "28px 0",
                animation: "blitzGlow 2.2s ease-in-out infinite",
              }}>
                <Zap size={28} style={{ color: "#A78BFA" }} />
              </div>

              <div style={{ fontSize: "12px", color: "#5A7090", lineHeight: "1.7", marginBottom: "28px" }}>
                Instant matchmaking. Trade against a live opponent for 5 minutes.
                Highest portfolio value wins.
              </div>

              {/* tags */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px" }}>
                {["1V1", "5 MIN", "LIVE"].map((tag) => (
                  <span key={tag} style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#8B5CF6",
                    padding: "3px 8px",
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "2px",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* DEPLOY button (always at bottom) */}
              <div style={{ marginTop: "auto" }}>
                <motion.div
                  whileHover={{ boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                    border: "none",
                    borderRadius: "4px",
                    color: "#F0E8FF",
                    fontWeight: 900,
                    fontSize: "13px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    textAlign: "center",
                    boxShadow: "0 4px 24px rgba(139,92,246,0.3)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  DEPLOY
                </motion.div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── keyframe styles ─── */}
      <style>{`
        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes blitzGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 44px rgba(139,92,246,0.65), 0 0 70px rgba(139,92,246,0.2); }
        }
        @media (max-width: 900px) {
          .hub-arena { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hub-stats { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}
