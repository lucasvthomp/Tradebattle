import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Zap, ChevronRight } from "lucide-react";

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
  if (level >= 6) return { title: "Market Runner", color: "#28C76F" };
  return { title: "Rookie", color: "#8A93A6" };
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

function ScanlineOverlay() {
  return (
    <div
      className="arena-page-shell"
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

// ─── entrance animation variants ──────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ─── main page ─────────────────────────────────────────────────────────────────

export default function Hub() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: tournamentsData } = useQuery({ queryKey: ["/api/tournaments"] });

  const activeTournaments =
    (tournamentsData as any)?.data?.filter((t: any) => t.status === "active") || [];

  const wins = user?.tournamentWins || 0;
  const trades = user?.totalTrades || 0;
  const { level, xp, progress } = computeLevel(wins, trades);
  const { title: rankTitle, color: rankColor } = getRankTitle(level);
  const rankRgb = hexToRgb(rankColor);

  const balance = (Number(user?.siteCash) || 0).toFixed(2);

  // Dynamic tagline
  const getTagline = () => {
    if (!trades) return "Ready for your first move?";
    if (activeTournaments.length > 0)
      return `You’re in ${activeTournaments.length} live arena${activeTournaments.length > 1 ? "s" : ""}. Make it count.`;
    return "The board is live. What’s your call?";
  };

  const ctaLabel = activeTournaments.length > 0 ? "Open the trading floor" : "Scout arenas";
  const ctaHref = activeTournaments.length > 0 ? "/dashboard" : "/tournaments";

  const stats = [
    { label: "BUYING POWER", value: `$${balance}`, color: "#00A3FF" },
    { label: "WINS", value: String(wins), color: "#28C76F" },
    { label: "LIVE ARENAS", value: String(activeTournaments.length), color: "#E3B341" },
    { label: "TOTAL REPS", value: String(trades), color: "#06B6D4" },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100dvh - 4rem)",
        background: "#040D18",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          padding: "0 20px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO / WELCOME BANNER
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          className="tour-hub-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            paddingTop: "52px",
            paddingBottom: "40px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Ambient glow behind heading */}
          <div style={{
            position: "absolute",
            top: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "160px",
            background: `radial-gradient(ellipse at 50% 0%, rgba(${rankRgb},0.09) 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <h1
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Hey {user?.username ?? "there"},
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#5A7090",
                fontWeight: 500,
                marginBottom: "32px",
                lineHeight: 1.5,
              }}
            >
              {getTagline()}
            </p>

            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(0,163,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(ctaHref)}
              style={{
                height: "52px",
                padding: "0 40px",
                background: "linear-gradient(135deg, #0070CC, #00A3FF)",
                border: "none",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,163,255,0.2)",
                transition: "box-shadow 0.2s",
                display: "inline-block",
              }}
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </motion.section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — STATS STRIP
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          className="hub-stats"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "16px 0",
            marginBottom: "36px",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#2A3A50",
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: stat.color,
                  fontFamily: "'Courier New', monospace",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </motion.section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — ACTION TILES
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.4, delay: 0.18 }}
          style={{ marginBottom: "36px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
            className="hub-tiles"
          >
            {/* Tournaments tile */}
            <Link href="/tournaments">
              <motion.div
                whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(227,179,65,0.1)" }}
                style={{
                  padding: "28px 24px",
                  background: "#0A1628",
                  borderRadius: "12px",
                  borderTop: "3px solid #E3B341",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTopWidth: "3px",
                  borderTopColor: "#E3B341",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(227,179,65,0.1)",
                    border: "1px solid rgba(227,179,65,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Trophy size={20} style={{ color: "#E3B341" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "17px", fontWeight: 800, color: "#F0F4FF" }}>Arenas</span>
                  {activeTournaments.length > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#E3B341",
                        background: "rgba(227,179,65,0.12)",
                        border: "1px solid rgba(227,179,65,0.25)",
                        borderRadius: "20px",
                        padding: "2px 8px",
                      }}
                    >
                      {activeTournaments.length} live
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#4B5563", margin: 0 }}>
                  Compete for the prize pool
                </p>
              </motion.div>
            </Link>

            {/* Blitz tile */}
            <Link href="/blitz">
              <motion.div
                whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(139,92,246,0.15)" }}
                style={{
                  padding: "28px 24px",
                  background: "#0A1628",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTopWidth: "3px",
                  borderTopColor: "#8B5CF6",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                }}
              >
                <ScanlineOverlay />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon circle */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                      animation: "blitzGlow 2.2s ease-in-out infinite",
                    }}
                  >
                    <Zap size={20} style={{ color: "#A78BFA" }} />
                  </div>

                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ fontSize: "17px", fontWeight: 800, color: "#F0F4FF" }}>Blitz</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#4B5563", margin: 0 }}>
                    1v1 &middot; 5 min &middot; instant
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — LIVE NOW (only if active tournaments exist)
        ════════════════════════════════════════════════════════════════ */}
        {activeTournaments.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.26 }}
            style={{ marginBottom: "36px" }}
          >
            {/* Section heading */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#28C76F",
                  boxShadow: "0 0 8px rgba(40,199,111,0.8)",
                  display: "inline-block",
                  animation: "hubPulse 1.4s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#2A3A50",
                }}
              >
                LIVE NOW
              </span>
            </div>

            <div
              style={{
                background: "#0A1628",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              {activeTournaments.slice(0, 3).map((t: any, i: number) => (
                <Link key={t.id} href={`/tournament/${t.id}`}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 18px",
                      borderBottom: i < Math.min(activeTournaments.length, 3) - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,163,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#C9D1E2",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                        }}
                      >
                        {t.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#4B5563",
                        fontFamily: "'Courier New', monospace",
                        flexShrink: 0,
                      }}
                    >
                      {t.participantCount || 0}/{t.maxPlayers}
                    </span>
                    <ChevronRight size={14} style={{ color: "#2A3A50", flexShrink: 0 }} />
                  </div>
                </Link>
              ))}

              {activeTournaments.length > 3 && (
                <Link href="/tournaments">
                  <div
                    style={{
                      padding: "12px 18px",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#00A3FF", fontWeight: 700 }}>
                      See all {activeTournaments.length} arenas →
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — RANK / LEVEL
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.4, delay: 0.34 }}
        >
          <div
            style={{
              background: "#0A1628",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            {/* Rank badge */}
            <div
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: "20px",
                background: `rgba(${rankRgb},0.1)`,
                border: `1px solid rgba(${rankRgb},0.25)`,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: rankColor,
                  textTransform: "uppercase",
                }}
              >
                {rankTitle} · LV.{level}
              </span>
            </div>

            {/* XP bar + label */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  height: "5px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "3px",
                  overflow: "hidden",
                  marginBottom: "6px",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${rankColor}, rgba(${rankRgb},0.5))`,
                    borderRadius: "3px",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#2A3A50",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {xp} XP &nbsp;·&nbsp; {progress}% to Level {level + 1}
              </span>
            </div>
          </div>
        </motion.section>

      </div>

      {/* ─── keyframe styles ─── */}
      <style>{`
        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes blitzGlow {
          0%, 100% { box-shadow: 0 0 14px rgba(139,92,246,0.2); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.55), 0 0 50px rgba(139,92,246,0.15); }
        }
        .hub-tiles {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 480px) {
          .hub-tiles {
            grid-template-columns: 1fr !important;
          }
          .hub-stats {
            gap: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
