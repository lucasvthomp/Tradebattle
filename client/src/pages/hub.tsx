import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Clock, Trophy, Zap, DollarSign,
  ArrowRight, BarChart3, Plus, ChevronRight,
} from "lucide-react";

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

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const cardBase = {
    background: '#131F35',
    border: '1px solid #1E3050',
    borderRadius: '12px',
  };

  const stats = [
    { label: 'Balance', value: `$${(Number(user?.siteCash) || 0).toFixed(2)}`, color: '#E3B341', icon: DollarSign },
    { label: 'Wins', value: String(user?.tournamentWins || 0), color: '#28C76F', icon: Trophy },
    { label: 'Live', value: String(activeTournaments.length), color: '#8B5CF6', icon: Zap },
    { label: 'Trades', value: String(user?.totalTrades || 0), color: '#06B6D4', icon: BarChart3 },
  ];

  const quickActions = [
    { label: 'Trade Now', sub: 'Open a tournament', href: '/dashboard', color: '#28C76F', icon: TrendingUp },
    { label: 'Blitz', sub: '1v1 · 5 min match', href: '/blitz', color: '#8B5CF6', icon: Zap },
    { label: 'Tournaments', sub: 'Browse & join', href: '/tournaments', color: '#E3B341', icon: Trophy },
    { label: 'Leaderboard', sub: 'See where you rank', href: '/leaderboard', color: '#06B6D4', icon: BarChart3 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#06121F', padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#E2E8F0', margin: '0 0 4px' }}>
            {getGreeting()}, {user?.username}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            {activeTournaments.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(40,199,111,0.12)', border: '1px solid rgba(40,199,111,0.3)',
                fontSize: '12px', fontWeight: '600', color: '#28C76F',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#28C76F', display: 'inline-block' }} />
                {activeTournaments.length} live
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }} className="hub-stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              style={{ ...cardBase, padding: '16px', cursor: 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                <s.icon size={15} style={{ color: s.color, opacity: 0.7 }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }} className="hub-grid">

          {/* Left: tournaments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Quick Actions */}
            <div style={{ ...cardBase, padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#C9D1E2', marginBottom: '14px' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quickActions.map((a, i) => (
                  <Link key={a.href} href={a.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px', borderRadius: '10px', cursor: 'pointer',
                        background: `${a.color}0D`,
                        border: `1px solid ${a.color}30`,
                        transition: 'border-color 150ms ease',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                        background: `${a.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <a.icon size={16} style={{ color: a.color }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0' }}>{a.label}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{a.sub}</div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Tournaments */}
            {activeTournaments.length > 0 && (
              <div style={{ ...cardBase, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#C9D1E2' }}>Live Now</h2>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#E3B341', cursor: 'pointer' }}>View all <ChevronRight size={12} style={{ display: 'inline' }} /></span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTournaments.slice(0, 3).map((t: any, i: number) => (
                    <Link key={t.id} href="/tournaments">
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                          background: 'rgba(40,199,111,0.06)', border: '1px solid rgba(40,199,111,0.15)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            {t.participantCount || 0}/{t.maxPlayers} players · ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                          </div>
                        </div>
                        <div style={{
                          padding: '3px 8px', borderRadius: '20px',
                          background: 'rgba(40,199,111,0.15)', fontSize: '11px', fontWeight: '700', color: '#28C76F',
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
                  <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#C9D1E2' }}>Upcoming</h2>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '12px', color: '#E3B341', cursor: 'pointer' }}>View all <ChevronRight size={12} style={{ display: 'inline' }} /></span>
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcomingTournaments.slice(0, 3).map((t: any, i: number) => (
                    <Link key={t.id} href="/tournaments">
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                          background: '#0D1825', border: '1px solid #1E3050',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            {t.participantCount || 0}/{t.maxPlayers} · ${Number(t.buyInAmount || 0).toFixed(0)} buy-in
                          </div>
                        </div>
                        <Clock size={14} style={{ color: '#64748B' }} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTournaments.length === 0 && upcomingTournaments.length === 0 && (
              <div style={{ ...cardBase, padding: '32px', textAlign: 'center' }}>
                <Trophy size={32} style={{ color: '#1E3050', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '14px', color: '#C9D1E2', marginBottom: '4px' }}>No tournaments active</p>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Create one or join an existing tournament</p>
                <Link href="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '10px 20px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                      border: 'none', color: '#06121F', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Browse Tournaments
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Right: info panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Blitz teaser */}
            <Link href="/blitz">
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  borderRadius: '12px', padding: '20px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1A1040 0%, #0F1428 100%)',
                  border: '1px solid rgba(139,92,246,0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0' }}>Blitz Mode</div>
                    <div style={{ fontSize: '11px', color: '#8B5CF6' }}>1v1 · 5 minutes</div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#8A93A6', lineHeight: '1.5', margin: '0 0 12px' }}>
                  Instant matchmaking. Trade against a real opponent for 5 minutes — highest portfolio wins.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#8B5CF6' }}>
                  Find a match <ArrowRight size={12} />
                </div>
              </motion.div>
            </Link>

            {/* Account snapshot */}
            <div style={{ ...cardBase, padding: '18px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#C9D1E2', marginBottom: '12px' }}>Account</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Balance', value: `$${(Number(user?.siteCash) || 0).toFixed(2)}`, color: '#E3B341' },
                  { label: 'Tournament Wins', value: String(user?.tournamentWins || 0), color: '#28C76F' },
                  { label: 'Total Trades', value: String(user?.totalTrades || 0), color: '#06B6D4' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/deposit">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  style={{
                    width: '100%', marginTop: '14px', padding: '9px',
                    borderRadius: '8px', border: '1px solid rgba(227,179,65,0.3)',
                    background: 'rgba(227,179,65,0.08)', color: '#E3B341',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  Deposit Funds
                </motion.button>
              </Link>
            </div>

            {/* Market status */}
            <div style={{ ...cardBase, padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#C9D1E2', marginBottom: '10px' }}>Market</h3>
              {(() => {
                const hour = currentTime.getHours();
                const day = currentTime.getDay();
                const isWeekday = day >= 1 && day <= 5;
                const isOpen = isWeekday && hour >= 9 && hour < 16;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: isOpen ? '#28C76F' : '#EF4444',
                    }} />
                    <span style={{ fontSize: '13px', color: isOpen ? '#28C76F' : '#EF4444', fontWeight: '600' }}>
                      {isOpen ? 'Market Open' : 'Market Closed'}
                    </span>
                  </div>
                );
              })()}
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>Mon–Fri 9:30 AM – 4:00 PM ET</p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hub-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .hub-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
