import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Clock, Trophy, Zap, DollarSign,
  ArrowRight, BarChart3, Plus, ChevronRight, Target, Flame,
} from "lucide-react";

function computeLevel(wins: number, trades: number) {
  const xp = wins * 120 + trades * 8;
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const currentLevelXP = Math.pow(level - 1, 2) * 40;
  const nextLevelXP = Math.pow(level, 2) * 40;
  const progress = nextLevelXP === currentLevelXP ? 100 : Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
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

// Scanline texture overlay — only used on the Blitz teaser card
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

// Convert a hex color like "#00A3FF" to "0,163,255" for rgba() usage
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

export default function Hub() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: tournamentsData } = useQuery({ queryKey: ['/api/tournaments'] });

  const activeTournaments = (tournamentsData as any)?.data?.filter((t: any) => t.status === 'active') || [];
  const upcomingTournaments = (tournamentsData as any)?.data?.filter((t: any) => t.status === 'upcoming') || [];

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

  const cardBase = {
    background: "linear-gradient(135deg, #0A1F3D 0%, #081729 100%)",
    border: "1px solid rgba(0,163,255,0.12)",
    borderRadius: "16px",
  };

  const sectionLabel = {
    fontSize: "0.6rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#4B6080",
  };

  const stats = [
    { label: 'Balance', value: `$${(Number(user?.siteCash) || 0).toFixed(2)}`, color: '#00A3FF', icon: DollarSign },
    { label: 'Wins', value: String(wins), color: '#28C76F', icon: Trophy },
    { label: 'Live', value: String(activeTournaments.length), color: '#8B5CF6', icon: Zap },
    { label: 'Trades', value: String(trades), color: '#06B6D4', icon: BarChart3 },
  ];

  const quickActions = [
    { label: 'Trade Now', sub: 'Open a tournament', href: '/tournaments', color: '#28C76F', icon: TrendingUp },
    { label: 'Blitz', sub: '1v1 · 5 min match', href: '/blitz', color: '#8B5CF6', icon: Zap },
    { label: 'Tournaments', sub: 'Browse & join', href: '/tournaments', color: '#00A3FF', icon: Trophy },
    { label: 'Leaderboard', sub: 'See where you rank', href: '/leaderboard', color: '#06B6D4', icon: BarChart3 },
  ];

  // Daily challenges — derived from user stats so they feel personalized
  const challenges = [
    { label: 'Place 3 trades today', icon: TrendingUp, color: '#28C76F', xpReward: 50, done: trades > 0 },
    { label: 'Join a tournament', icon: Trophy, color: '#00A3FF', xpReward: 80, done: wins > 0 },
    { label: 'Try Blitz mode', icon: Zap, color: '#8B5CF6', xpReward: 60, done: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header + Level Bar */}
        <motion.div
          className="tour-hub-hero"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '28px',
            padding: '20px 22px',
            borderRadius: '16px',
            borderBottom: '1px solid rgba(0,163,255,0.08)',
            position: 'relative',
          }}
        >
          {/* Radial blue glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            background: "radial-gradient(ellipse at 30% 50%, rgba(0,163,255,0.07) 0%, transparent 70%)",
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          {/* Sharp horizontal accent line at the bottom of the hero — game-UI style rule */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(0,163,255,0.4) 0%, rgba(0,163,255,0.1) 40%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  margin: 0,
                  textShadow: '0 0 30px rgba(0,163,255,0.2)',
                }}>
                  {getGreeting()}, {user?.username}
                </h1>
                {/* Rank chip next to the username */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px', borderRadius: '6px',
                  background: `rgba(${rankRgb},0.12)`,
                  border: `1px solid rgba(${rankRgb},0.3)`,
                  fontSize: '11px', fontWeight: 800, color: rankColor,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {rankTitle} · Lv.{level}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#4B6080', fontWeight: 600 }}>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                {activeTournaments.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.25)',
                    fontSize: '12px', fontWeight: '600', color: '#00FF87',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#00FF87', display: 'inline-block',
                      boxShadow: '0 0 6px rgba(0,255,135,0.8)',
                      animation: 'hubPulse 1.4s ease-in-out infinite',
                    }} />
                    {activeTournaments.length} live
                  </span>
                )}
              </div>
            </div>

            {/* Level badge */}
            <div style={{
              padding: '12px 16px', borderRadius: '12px', minWidth: '160px',
              background: 'linear-gradient(135deg, #0A1F3D, #081729)',
              border: `1px solid rgba(${rankRgb},0.3)`,
              boxShadow: `0 0 20px rgba(${rankRgb},0.1)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ ...sectionLabel, color: rankColor }}>{rankTitle}</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#E2E8F0' }}>Lv.{level}</span>
              </div>
              {/* Progress bar with animated shimmer instead of scanlines */}
              <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  style={{ height: '100%', borderRadius: '3px', background: rankColor, boxShadow: `0 0 8px ${rankColor}88`, position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', inset: 0, animation: 'hubShimmer 1.8s ease-in-out infinite' }} className="hub-progress-shimmer" />
                </motion.div>
              </div>
              <div style={{ ...sectionLabel, marginTop: '5px' }}>{xp} XP · {progress}% to Lv.{level + 1}</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }} className="hub-stats">
          {stats.map((s, i) => {
            const rgb = hexToRgb(s.color);
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #0A1F3D 0%, #081729 100%)',
                  border: `1px solid rgba(${rgb},0.2)`,
                  /* Top-edge glow — lit-from-above game UI trope */
                  boxShadow: `0 -1px 0 0 rgba(${rgb},0.45), 0 0 16px rgba(${rgb},0.06)`,
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'default',
                  overflow: 'hidden',
                }}
              >
                {/* Diagonal corner accent — top-left */}
                <div style={{
                  position: 'absolute',
                  top: 6,
                  left: -6,
                  width: '18px',
                  height: '2px',
                  background: s.color,
                  opacity: 0.55,
                  transform: 'rotate(45deg)',
                  transformOrigin: 'left center',
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={sectionLabel}>{s.label}</span>
                  <s.icon size={15} style={{ color: s.color, opacity: 0.8 }} />
                </div>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 900, color: s.color,
                  textShadow: `0 0 20px rgba(${rgb},0.4)`,
                }}>{s.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }} className="hub-grid">

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Quick Actions */}
            <div style={{ ...cardBase, padding: '20px' }}>
              <h2 style={{
                fontSize: '14px', fontWeight: 800, color: '#C9D1E2',
                marginBottom: '14px', letterSpacing: '-0.01em',
                borderLeft: '3px solid #00A3FF', paddingLeft: '10px',
              }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quickActions.map((a) => {
                  const aRgb = hexToRgb(a.color);
                  return (
                    <Link key={a.href + a.label} href={a.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '14px', borderRadius: '14px', cursor: 'pointer',
                          background: `linear-gradient(135deg, rgba(${aRgb},0.08), rgba(${aRgb},0.03))`,
                          border: `1px solid rgba(${aRgb},0.2)`,
                        }}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: `rgba(${aRgb},0.15)`,
                          border: `1px solid rgba(${aRgb},0.25)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <a.icon size={16} style={{ color: a.color }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#C9D1E2' }}>{a.label}</div>
                          <div style={{ fontSize: '11px', color: '#4B6080', marginTop: '1px' }}>{a.sub}</div>
                        </div>
                        <ArrowRight size={13} style={{ color: `rgba(${aRgb},0.5)`, flexShrink: 0 }} />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Daily Challenges */}
            <div style={{ ...cardBase, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Flame size={15} style={{ color: '#FF7A00' }} />
                <h2 style={{
                  fontSize: '14px', fontWeight: 800, color: '#C9D1E2',
                  margin: 0, letterSpacing: '-0.01em',
                  borderLeft: '3px solid #FF7A00', paddingLeft: '10px',
                }}>Daily Challenges</h2>
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: '600', color: '#FF7A00',
                  padding: '2px 8px', borderRadius: '20px',
                  background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.25)',
                }}>
                  Resets in {24 - currentTime.getHours()}h
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {challenges.map((c, i) => {
                  const cRgb = hexToRgb(c.color);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '12px',
                        background: `rgba(${cRgb},0.05)`,
                        /* Left-edge colored bar instead of full background tint */
                        borderLeft: `3px solid rgba(${cRgb},${c.done ? '0.2' : '0.55'})`,
                        borderTop: `1px solid rgba(${cRgb},0.12)`,
                        borderRight: `1px solid rgba(${cRgb},0.08)`,
                        borderBottom: `1px solid rgba(${cRgb},0.08)`,
                        opacity: c.done ? 0.6 : 1,
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: `rgba(${cRgb},0.15)`,
                        border: `1px solid rgba(${cRgb},0.25)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <c.icon size={14} style={{ color: c.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: c.done ? '#4B6080' : '#C9D1E2', textDecoration: c.done ? 'line-through' : 'none' }}>
                          {c.label}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px', fontWeight: 800, color: c.done ? '#4B6080' : '#00A3FF',
                        padding: '3px 8px', borderRadius: '20px',
                        background: c.done ? 'transparent' : 'rgba(0,163,255,0.1)',
                        border: c.done ? 'none' : '1px solid rgba(0,163,255,0.2)',
                      }}>
                        +{c.xpReward} XP
                      </div>
                      {c.done && <span style={{ fontSize: '12px', color: '#4B6080' }}>✓</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Live Tournaments */}
            {activeTournaments.length > 0 && (
              <div style={{ ...cardBase, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{
                    fontSize: '14px', fontWeight: 800, color: '#C9D1E2',
                    letterSpacing: '-0.01em',
                    borderLeft: '3px solid #00FF87', paddingLeft: '10px',
                  }}>Live Now</h2>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#00A3FF', cursor: 'pointer', fontWeight: 600 }}>View all <ChevronRight size={12} style={{ display: 'inline' }} /></span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTournaments.slice(0, 3).map((t: any, i: number) => (
                    <Link key={t.id} href={`/tournament/${t.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          background: 'rgba(0,255,135,0.04)',
                          /* Left-edge colored bar for tournament rows */
                          borderLeft: '3px solid rgba(0,255,135,0.5)',
                          borderTop: '1px solid rgba(0,255,135,0.1)',
                          borderRight: '1px solid rgba(0,255,135,0.08)',
                          borderBottom: '1px solid rgba(0,255,135,0.08)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9D1E2' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#4B6080', marginTop: '2px' }}>
                            {t.participantCount || 0}/{t.maxPlayers} players · ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                          </div>
                        </div>
                        <div style={{
                          padding: '3px 8px', borderRadius: '20px',
                          background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)',
                          fontSize: '11px', fontWeight: 800, color: '#00FF87',
                        }}>LIVE</div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingTournaments.length > 0 && (
              <div style={{ ...cardBase, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{
                    fontSize: '14px', fontWeight: 800, color: '#C9D1E2',
                    letterSpacing: '-0.01em',
                    borderLeft: '3px solid #06B6D4', paddingLeft: '10px',
                  }}>Upcoming</h2>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#00A3FF', cursor: 'pointer', fontWeight: 600 }}>View all <ChevronRight size={12} style={{ display: 'inline' }} /></span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcomingTournaments.slice(0, 3).map((t: any, i: number) => (
                    <Link key={t.id} href={`/tournament/${t.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          background: 'rgba(0,163,255,0.03)',
                          /* Left-edge colored bar for upcoming rows */
                          borderLeft: '3px solid rgba(6,182,212,0.4)',
                          borderTop: '1px solid rgba(0,163,255,0.08)',
                          borderRight: '1px solid rgba(0,163,255,0.06)',
                          borderBottom: '1px solid rgba(0,163,255,0.06)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9D1E2' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#4B6080', marginTop: '2px' }}>
                            {t.participantCount || 0}/{t.maxPlayers} · ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                          </div>
                        </div>
                        <Clock size={14} style={{ color: '#4B6080' }} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTournaments.length === 0 && upcomingTournaments.length === 0 && (
              <div style={{ ...cardBase, padding: '32px', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                  background: 'rgba(0,163,255,0.08)', border: '1px solid rgba(0,163,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(0,163,255,0.1)',
                }}>
                  <Trophy size={28} style={{ color: '#00A3FF', opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#C9D1E2', marginBottom: '4px' }}>No tournaments active</p>
                <p style={{ fontSize: '13px', color: '#4B6080', marginBottom: '16px' }}>Create one or join an existing tournament</p>
                <Link href="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '10px 20px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00A3FF, #0090E0)',
                      border: 'none', color: '#FFFFFF', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0,163,255,0.3)',
                    }}
                  >
                    <Plus size={14} /> Browse Tournaments
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Blitz teaser — the ONE place we use ScanlineOverlay */}
            <Link href="/blitz">
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  borderRadius: '16px', padding: '20px', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #130D2A, #0A1020)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.06)',
                }}
              >
                <ScanlineOverlay />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                    }}>
                      <Zap size={16} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E8F0', letterSpacing: '-0.02em' }}>Blitz Mode</div>
                      <div style={{ fontSize: '11px', color: '#8B5CF6' }}>1v1 · 5 minutes</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#8A93A6', lineHeight: '1.5', margin: '0 0 12px' }}>
                    Instant matchmaking. Trade against a real opponent for 5 minutes — highest portfolio wins.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: '#8B5CF6' }}>
                    Find a match <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Rank card */}
            <div style={{ ...cardBase, padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{
                  fontSize: '13px', fontWeight: 800, color: '#C9D1E2',
                  margin: 0, letterSpacing: '-0.01em',
                  borderLeft: `3px solid ${rankColor}`, paddingLeft: '10px',
                }}>Your Rank</h3>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: rankColor,
                  padding: '2px 8px', borderRadius: '12px',
                  background: `rgba(${rankRgb},0.12)`,
                  border: `1px solid rgba(${rankRgb},0.25)`,
                }}>
                  {rankTitle}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                  background: `rgba(${rankRgb},0.15)`,
                  border: `2px solid rgba(${rankRgb},0.35)`,
                  boxShadow: `0 0 16px rgba(${rankRgb},0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: '900', color: rankColor,
                }}>
                  {level}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...sectionLabel, marginBottom: '4px' }}>Level {level} · {xp} XP total</div>
                  {/* Progress bar with animated shimmer */}
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      style={{ height: '100%', borderRadius: '3px', background: rankColor, boxShadow: `0 0 8px ${rankColor}88`, position: 'relative', overflow: 'hidden' }}
                    >
                      <div className="hub-progress-shimmer" style={{ position: 'absolute', inset: 0, animation: 'hubShimmer 1.8s ease-in-out infinite' }} />
                    </motion.div>
                  </div>
                  <div style={{ ...sectionLabel, marginTop: '3px' }}>{progress}% to Lv.{level + 1}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Tournament Wins', value: String(wins), color: '#28C76F' },
                  { label: 'Total Trades', value: String(trades), color: '#06B6D4' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#4B6080' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/deposit">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  style={{
                    width: '100%', marginTop: '14px', padding: '9px',
                    borderRadius: '8px', border: '1px solid rgba(0,163,255,0.2)',
                    background: 'rgba(0,163,255,0.08)', color: '#00A3FF',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Deposit Funds
                </motion.button>
              </Link>
            </div>

            {/* Market status */}
            <div style={{ ...cardBase, padding: '16px' }}>
              <h3 style={{
                fontSize: '13px', fontWeight: 800, color: '#C9D1E2',
                marginBottom: '10px', letterSpacing: '-0.01em',
                borderLeft: '3px solid #4B6080', paddingLeft: '10px',
              }}>Market</h3>
              {(() => {
                const hour = currentTime.getHours();
                const day = currentTime.getDay();
                const isWeekday = day >= 1 && day <= 5;
                const isOpen = isWeekday && hour >= 9 && hour < 16;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: isOpen ? '#00FF87' : '#FF4F58',
                      boxShadow: isOpen ? '0 0 8px rgba(0,255,135,0.7)' : '0 0 8px rgba(255,79,88,0.7)',
                      animation: isOpen ? 'hubPulse 1.4s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{ fontSize: '13px', color: isOpen ? '#00FF87' : '#FF4F58', fontWeight: '600' }}>
                      {isOpen ? 'Market Open' : 'Market Closed'}
                    </span>
                  </div>
                );
              })()}
              <p style={{ ...sectionLabel, marginTop: '6px', display: 'block' }}>Mon–Fri 9:30 AM – 4:00 PM ET</p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hub-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .hub-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes hubShimmer {
          0% { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%); background-size: 200% 100%; background-position: -100% 0; }
          100% { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%); background-size: 200% 100%; background-position: 200% 0; }
        }
        .hub-progress-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: hubShimmerMove 1.8s ease-in-out infinite;
        }
        @keyframes hubShimmerMove {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
