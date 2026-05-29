import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Clock, Trophy, Zap, DollarSign,
  ArrowRight, BarChart3, Plus, ChevronRight, Target, Flame,
  Bolt, Star, Shield, Activity,
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

  const hour = currentTime.getHours();
  const day = currentTime.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isMarketOpen = isWeekday && hour >= 9 && hour < 16;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>

      {/* ===== HERO SECTION ===== */}
      <motion.div
        className="tour-hub-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          padding: '48px 32px 0',
          marginBottom: 0,
        }}
      >
        {/* Animated diagonal gradient sweep — slow depth movement */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(125deg, #06121F 0%, #091b32 20%, #0A1F3D 40%, #071627 60%, #06121F 80%, #091b32 100%)',
          backgroundSize: '400% 400%',
          animation: 'heroGradientSweep 18s ease infinite',
          zIndex: 0,
        }} />
        {/* Top-left radial blue glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '-60px',
          width: '500px',
          height: '320px',
          background: 'radial-gradient(ellipse at 30% 40%, rgba(0,163,255,0.13) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        {/* Bottom-right rank color glow */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '0',
          width: '400px',
          height: '220px',
          background: `radial-gradient(ellipse at 70% 70%, rgba(${rankRgb},0.09) 0%, transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        {/* Sharp bottom edge accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,163,255,0.4) 20%, rgba(0,163,255,0.15) 60%, transparent 100%)',
          zIndex: 2,
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '1100px', margin: '0 auto' }}>

          {/* Greeting + rank badge row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              margin: 0,
              background: 'linear-gradient(90deg, #FFFFFF 0%, #B8D4F0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.15,
            }}>
              {getGreeting()}, {user?.username}
            </h1>
            {/* Prominent rank badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '8px',
              background: `rgba(${rankRgb},0.14)`,
              border: `1px solid rgba(${rankRgb},0.4)`,
              boxShadow: `0 0 16px rgba(${rankRgb},0.15)`,
              flexShrink: 0,
              marginTop: '6px',
            }}>
              <Shield size={13} style={{ color: rankColor }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 900,
                color: rankColor,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {rankTitle} · Lv.{level}
              </span>
            </div>
          </div>

          {/* Date + live count row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
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
                {activeTournaments.length} live now
              </span>
            )}
          </div>

          {/* ===== STATS TICKER BAR ===== */}
          <div
            className="hub-stats"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              background: 'rgba(4,14,28,0.7)',
              border: '1px solid rgba(0,163,255,0.12)',
              borderRadius: '12px 12px 0 0',
              overflow: 'hidden',
              backdropFilter: 'blur(8px)',
            }}
          >
            {stats.map((s, i) => {
              const rgb = hexToRgb(s.color);
              const isLast = i === stats.length - 1;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 20px',
                    borderRight: isLast ? 'none' : '1px solid rgba(0,163,255,0.1)',
                    position: 'relative',
                  }}
                >
                  {/* Top accent line per stat */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `rgba(${rgb},0.55)`,
                    pointerEvents: 'none',
                  }} />
                  <s.icon size={16} style={{ color: s.color, opacity: 0.85, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B6080', lineHeight: 1 }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: s.color,
                      lineHeight: 1.2,
                      marginTop: '2px',
                      textShadow: `0 0 16px rgba(${rgb},0.45)`,
                    }}>
                      {s.value}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ===== XP PROGRESS BAR (bottom of hero) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'rgba(4,14,28,0.85)',
              border: '1px solid rgba(0,163,255,0.1)',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              padding: '10px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backdropFilter: 'blur(8px)',
              marginBottom: '32px',
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: rankColor,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}>
              Level {level} — {rankTitle} · {xp} XP · {progress}% to Level {level + 1}
            </span>
            <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                style={{
                  height: '100%',
                  borderRadius: '4px',
                  background: `linear-gradient(90deg, ${rankColor}, rgba(${rankRgb},0.7))`,
                  boxShadow: `0 0 10px rgba(${rankRgb},0.6)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="hub-progress-shimmer" style={{ position: 'absolute', inset: 0 }} />
              </motion.div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B6080', whiteSpace: 'nowrap' }}>
              Lv.{level + 1}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== MAIN BODY ===== */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="hub-grid">

          {/* ===== LEFT COLUMN ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* QUICK ACTIONS — 2x2 large tiles */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                border: '1px solid rgba(0,163,255,0.1)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: '#00A3FF' }} />
                <h2 style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#8A93A6',
                  margin: 0,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>Quick Actions</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {quickActions.map((a) => {
                  const aRgb = hexToRgb(a.color);
                  return (
                    <Link key={a.href + a.label} href={a.href}>
                      <motion.div
                        whileHover={{ scale: 1.02, boxShadow: `0 0 28px rgba(${aRgb},0.22)` }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          padding: '20px 18px',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          background: `linear-gradient(145deg, rgba(${aRgb},0.1) 0%, rgba(${aRgb},0.04) 100%)`,
                          border: `1px solid rgba(${aRgb},0.2)`,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'box-shadow 0.2s ease',
                        }}
                      >
                        {/* Corner accent */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '40px',
                          height: '2px',
                          background: `rgba(${aRgb},0.6)`,
                          borderRadius: '0 0 2px 0',
                        }} />
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: `rgba(${aRgb},0.15)`,
                          border: `1px solid rgba(${aRgb},0.3)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 16px rgba(${aRgb},0.15)`,
                        }}>
                          <a.icon size={20} style={{ color: a.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#C9D1E2', marginBottom: '3px' }}>{a.label}</div>
                          <div style={{ fontSize: '12px', color: '#4B6080' }}>{a.sub}</div>
                        </div>
                        <ChevronRight size={14} style={{ color: `rgba(${aRgb},0.5)`, alignSelf: 'flex-end' }} />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* DAILY CHALLENGES */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                border: '1px solid rgba(255,122,0,0.12)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: '#FF7A00' }} />
                <Flame size={14} style={{ color: '#FF7A00' }} />
                <h2 style={{
                  fontSize: '13px', fontWeight: 800, color: '#8A93A6',
                  margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Daily Challenges</h2>
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: '700', color: '#FF7A00',
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', borderRadius: '12px',
                        background: `rgba(${cRgb},0.05)`,
                        borderLeft: `3px solid rgba(${cRgb},${c.done ? '0.2' : '0.6'})`,
                        borderTop: `1px solid rgba(${cRgb},0.1)`,
                        borderRight: `1px solid rgba(${cRgb},0.08)`,
                        borderBottom: `1px solid rgba(${cRgb},0.08)`,
                        opacity: c.done ? 0.6 : 1,
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `rgba(${cRgb},0.15)`,
                        border: `1px solid rgba(${cRgb},0.25)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <c.icon size={15} style={{ color: c.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: c.done ? '#4B6080' : '#C9D1E2', textDecoration: c.done ? 'line-through' : 'none' }}>
                          {c.label}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px', fontWeight: 800, color: c.done ? '#4B6080' : '#00A3FF',
                        padding: '3px 10px', borderRadius: '20px',
                        background: c.done ? 'transparent' : 'rgba(0,163,255,0.1)',
                        border: c.done ? 'none' : '1px solid rgba(0,163,255,0.2)',
                        whiteSpace: 'nowrap',
                      }}>
                        +{c.xpReward} XP
                      </div>
                      {c.done && <span style={{ fontSize: '13px', color: '#28C76F', fontWeight: 800 }}>✓</span>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* LIVE TOURNAMENTS */}
            {activeTournaments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                  border: '1px solid rgba(0,255,135,0.12)',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: '#00FF87' }} />
                    <h2 style={{
                      fontSize: '13px', fontWeight: 800, color: '#8A93A6',
                      margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>Live Now</h2>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 700, color: '#00FF87',
                      padding: '1px 8px', borderRadius: '20px',
                      background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)',
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: '#00FF87', display: 'inline-block',
                        animation: 'hubPulse 1.4s ease-in-out infinite',
                      }} />
                      {activeTournaments.length} active
                    </span>
                  </div>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#00A3FF', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      View all <ChevronRight size={12} />
                    </span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeTournaments.slice(0, 3).map((t: any, i: number) => {
                    const pct = t.maxPlayers > 0 ? Math.round(((t.participantCount || 0) / t.maxPlayers) * 100) : 0;
                    const prizePool = Number(t.buyInAmount || 0) * (t.participantCount || 0);
                    return (
                      <Link key={t.id} href={`/tournament/${t.id}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.06 }}
                          whileHover={{ x: 3 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: 'rgba(0,255,135,0.04)',
                            borderLeft: '3px solid rgba(0,255,135,0.45)',
                            borderTop: '1px solid rgba(0,255,135,0.08)',
                            borderRight: '1px solid rgba(0,255,135,0.06)',
                            borderBottom: '1px solid rgba(0,255,135,0.06)',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9D1E2', marginBottom: '4px' }}>{t.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={10} style={{ color: '#4B6080', flexShrink: 0 }} />
                              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  borderRadius: '2px',
                                  background: 'linear-gradient(90deg, #00FF87, #28C76F)',
                                  boxShadow: '0 0 6px rgba(0,255,135,0.5)',
                                }} />
                              </div>
                              <span style={{ fontSize: '10px', color: '#4B6080', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {t.participantCount || 0}/{t.maxPlayers}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '4px',
                            flexShrink: 0,
                          }}>
                            <div style={{
                              padding: '3px 9px',
                              borderRadius: '20px',
                              background: 'rgba(227,179,65,0.12)',
                              border: '1px solid rgba(227,179,65,0.3)',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#E3B341',
                            }}>
                              ${prizePool.toFixed(0)} pool
                            </div>
                            <div style={{ fontSize: '10px', color: '#4B6080' }}>${Number(t.buyInAmount || 0).toFixed(0)} buy-in</div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* UPCOMING TOURNAMENTS */}
            {upcomingTournaments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{
                  background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                  border: '1px solid rgba(6,182,212,0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: '#06B6D4' }} />
                    <h2 style={{
                      fontSize: '13px', fontWeight: 800, color: '#8A93A6',
                      margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>Upcoming</h2>
                  </div>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#00A3FF', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      View all <ChevronRight size={12} />
                    </span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingTournaments.slice(0, 3).map((t: any, i: number) => {
                    const prizePool = Number(t.buyInAmount || 0) * (t.participantCount || 0);
                    return (
                      <Link key={t.id} href={`/tournament/${t.id}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.06 }}
                          whileHover={{ x: 3 }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                            background: 'rgba(6,182,212,0.03)',
                            borderLeft: '3px solid rgba(6,182,212,0.4)',
                            borderTop: '1px solid rgba(6,182,212,0.08)',
                            borderRight: '1px solid rgba(6,182,212,0.06)',
                            borderBottom: '1px solid rgba(6,182,212,0.06)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9D1E2', marginBottom: '2px' }}>{t.name}</div>
                            <div style={{ fontSize: '11px', color: '#4B6080' }}>
                              {t.participantCount || 0}/{t.maxPlayers} players · ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {prizePool > 0 && (
                              <div style={{
                                padding: '3px 9px', borderRadius: '20px',
                                background: 'rgba(227,179,65,0.1)', border: '1px solid rgba(227,179,65,0.25)',
                                fontSize: '11px', fontWeight: 800, color: '#E3B341',
                              }}>
                                ${prizePool.toFixed(0)} pool
                              </div>
                            )}
                            <Clock size={12} style={{ color: '#4B6080' }} />
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* EMPTY STATE */}
            {activeTournaments.length === 0 && upcomingTournaments.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                  border: '1px solid rgba(0,163,255,0.1)',
                  borderRadius: '16px',
                  padding: '48px 32px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
                  background: 'rgba(0,163,255,0.08)', border: '1px solid rgba(0,163,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(0,163,255,0.12)',
                }}>
                  <Trophy size={30} style={{ color: '#00A3FF', opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#C9D1E2', marginBottom: '6px' }}>No tournaments active</p>
                <p style={{ fontSize: '13px', color: '#4B6080', marginBottom: '20px' }}>Create one or join an existing tournament to compete</p>
                <Link href="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(0,163,255,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00A3FF, #0090E0)',
                      border: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0,163,255,0.25)',
                      transition: 'box-shadow 0.2s ease',
                    }}
                  >
                    <Plus size={14} /> Browse Tournaments
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* BLITZ CARD — biggest, most dramatic */}
            <Link href="/blitz">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(139,92,246,0.25)' }}
                style={{
                  borderRadius: '16px',
                  padding: '28px 24px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #17093A 0%, #0D0720 50%, #0A1020 100%)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.1)',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <ScanlineOverlay />
                {/* Purple radial glow behind the card */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* BLITZ MODE stencil header */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.2em',
                      color: 'rgba(139,92,246,0.6)',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      Game Mode
                    </div>
                    <div style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      letterSpacing: '0.06em',
                      color: '#E2E8F0',
                      textTransform: 'uppercase',
                      lineHeight: 1,
                      textShadow: '0 0 24px rgba(139,92,246,0.4)',
                    }}>
                      BLITZ MODE
                    </div>
                  </div>

                  {/* Lightning bolt with glow pulse */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))',
                    border: '1px solid rgba(139,92,246,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    animation: 'blitzGlow 2s ease-in-out infinite',
                    boxShadow: '0 0 24px rgba(139,92,246,0.35)',
                  }}>
                    <Zap size={30} color="#A78BFA" />
                  </div>

                  <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                    Instant matchmaking. Trade against a real opponent for 5 minutes. Highest portfolio wins.
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                  }}>
                    {['1v1', '5 min', 'Live prices'].map(tag => (
                      <span key={tag} style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: '#8B5CF6',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        textTransform: 'uppercase',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* FIND MATCH CTA */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Zap size={14} />
                    Find Match
                  </motion.div>
                </div>
              </motion.div>
            </Link>

            {/* RANK CARD — styled badge */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                border: `1px solid rgba(${rankRgb},0.2)`,
                borderRadius: '16px',
                padding: '20px',
                boxShadow: `0 0 24px rgba(${rankRgb},0.06)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: rankColor }} />
                <h3 style={{
                  fontSize: '13px', fontWeight: 800, color: '#8A93A6',
                  margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Your Rank</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                {/* Large rank badge — rounded square */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, rgba(${rankRgb},0.2) 0%, rgba(${rankRgb},0.08) 100%)`,
                  border: `2px solid rgba(${rankRgb},0.4)`,
                  boxShadow: `0 0 24px rgba(${rankRgb},0.25), inset 0 1px 0 rgba(${rankRgb},0.2)`,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  gap: '2px',
                }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: rankColor, lineHeight: 1 }}>{level}</span>
                  <span style={{ fontSize: '8px', fontWeight: 800, color: `rgba(${rankRgb},0.7)`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LEVEL</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: rankColor, marginBottom: '2px' }}>{rankTitle}</div>
                  <div style={{ fontSize: '12px', color: '#4B6080' }}>{xp} XP total</div>
                  {/* Progress bar */}
                  <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: '8px', position: 'relative' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                      style={{
                        height: '100%',
                        borderRadius: '3px',
                        background: rankColor,
                        boxShadow: `0 0 8px rgba(${rankRgb},0.7)`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div className="hub-progress-shimmer" style={{ position: 'absolute', inset: 0 }} />
                    </motion.div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#4B6080', marginTop: '3px' }}>{progress}% to Lv.{level + 1}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Tournament Wins', value: String(wins), color: '#28C76F' },
                  { label: 'Total Trades', value: String(trades), color: '#06B6D4' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#4B6080' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <Link href="/deposit">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  style={{
                    width: '100%', padding: '10px',
                    borderRadius: '8px', border: '1px solid rgba(0,163,255,0.2)',
                    background: 'rgba(0,163,255,0.08)', color: '#00A3FF',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  Deposit Funds
                </motion.button>
              </Link>
            </motion.div>

            {/* MARKET STATUS */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                background: 'linear-gradient(160deg, #0A1F3D 0%, #081729 100%)',
                border: `1px solid rgba(${isMarketOpen ? '0,255,135' : '255,79,88'},0.12)`,
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: '#4B6080' }} />
                <h3 style={{
                  fontSize: '13px', fontWeight: 800, color: '#8A93A6',
                  margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Market</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: isMarketOpen ? '#00FF87' : '#FF4F58',
                  boxShadow: isMarketOpen ? '0 0 10px rgba(0,255,135,0.7)' : '0 0 10px rgba(255,79,88,0.7)',
                  animation: isMarketOpen ? 'hubPulse 1.4s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '14px', color: isMarketOpen ? '#00FF87' : '#FF4F58', fontWeight: 700 }}>
                  {isMarketOpen ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#4B6080', marginTop: '6px', letterSpacing: '0.04em' }}>
                Mon–Fri · 9:30 AM – 4:00 PM ET
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hub-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hub-stats { flex-direction: column !important; }
        }
        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.25); }
        }
        @keyframes heroGradientSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blitzGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(139,92,246,0.35); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.6), 0 0 60px rgba(139,92,246,0.2); }
        }
        .hub-progress-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%);
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
