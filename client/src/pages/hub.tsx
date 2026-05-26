import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Clock, Trophy, Zap, DollarSign, Activity,
  BarChart3, Plus, Bell, Gift, ArrowRight, Star, Flame, Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const TIPS = [
  "Diversify early — holding 1 stock is a gamble, not a strategy.",
  "Watch the clock. Selling at the right time beats buying at the right price.",
  "In blitz matches, volatility is your friend. Pick movers, not blue chips.",
  "The leaderboard shifts in the final 10 minutes. Don't sleep on late adjustments.",
  "Check pot size before joining — bigger pools mean more competition.",
];

export default function Hub() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: tournamentsData } = useQuery({ queryKey: ['/api/tournaments'] });
  const { data: notificationsData } = useQuery({ queryKey: ['/api/notifications'] });
  const { data: leaderboardData } = useQuery({ queryKey: ['/api/leaderboard'] });

  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];
  const upcomingTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'waiting') || [];
  const unreadNotifications = notificationsData?.unreadCount || 0;
  const topPlayers = leaderboardData?.users?.slice(0, 5) || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const cardBase = {
    background: '#172035',
    border: '1px solid #1E3050',
    borderRadius: '12px',
  };

  const statCard = (color: string, bg: string) => ({
    ...cardBase,
    borderTop: `2px solid ${color}`,
    background: bg,
    padding: '18px 20px',
  });

  return (
    <div style={{ minHeight: '100vh', padding: '32px 20px' }}>
      {/* Subtle ambient glow — one, not three */}
      <div style={{
        position: 'fixed', top: '15%', right: '8%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0,194,240,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(60px)',
      }} />

      <div className="max-w-7xl mx-auto relative">

        {/* ── Header ── */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#E2E8F0', marginBottom: '4px' }}>
              {getGreeting()}, <span style={{ color: '#00C2F0' }}>{user?.username}</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#8A93A6' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              {activeTournaments.length > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', background: 'rgba(40,199,111,0.12)',
                  border: '1px solid rgba(40,199,111,0.3)', borderRadius: '20px',
                  fontSize: '11px', fontWeight: '600', color: '#28C76F',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#28C76F', display: 'inline-block' }} />
                  {activeTournaments.length} LIVE
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadNotifications > 0 && (
              <Link href="/notifications">
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', background: 'rgba(227,179,65,0.08)',
                  border: '1px solid rgba(227,179,65,0.25)', borderRadius: '8px',
                  color: '#E3B341', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                }}>
                  <Bell size={14} /> {unreadNotifications}
                </button>
              </Link>
            )}
            <Link href="/deposit">
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'rgba(0,194,240,0.1)',
                border: '1px solid rgba(0,194,240,0.25)', borderRadius: '8px',
                color: '#00C2F0', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}>
                <DollarSign size={14} /> Deposit
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}
          className="hub-stats-grid">
          {[
            { label: 'Balance', value: `$${(Number(user?.siteCash) || 0).toFixed(2)}`, color: '#E3B341', bg: 'linear-gradient(160deg, #1a2038 0%, #1e2510 100%)', icon: <DollarSign size={16} /> },
            { label: 'Tournament Wins', value: user?.tournamentWins || 0, color: '#28C76F', bg: 'linear-gradient(160deg, #1a2038 0%, #0f2018 100%)', icon: <Trophy size={16} /> },
            { label: 'Active Tournaments', value: activeTournaments.length, color: '#00C2F0', bg: 'linear-gradient(160deg, #1a2038 0%, #0a1e30 100%)', icon: <Activity size={16} /> },
            { label: 'Total Trades', value: user?.totalTrades || 0, color: '#8B5CF6', bg: 'linear-gradient(160deg, #1a2038 0%, #1a1030 100%)', icon: <BarChart3 size={16} /> },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <div style={{ ...statCard(stat.color, stat.bg) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </span>
                  <span style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }} className="hub-main-grid">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Blitz teaser */}
            <motion.div whileHover={{ y: -2 }}>
              <Link href="/blitz">
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #1a1535 0%, #0f1e35 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={22} color="#fff" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#E2E8F0' }}>Blitz Mode</span>
                        <span style={{
                          padding: '2px 8px', background: 'rgba(139,92,246,0.2)',
                          border: '1px solid rgba(139,92,246,0.4)', borderRadius: '4px',
                          fontSize: '10px', fontWeight: '700', color: '#8B5CF6', textTransform: 'uppercase',
                        }}>NEW</span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#8A93A6' }}>
                        1v1 · 5-minute matches · instant matchmaking
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B5CF6', fontSize: '13px', fontWeight: '600' }}>
                    Find Match <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Live tournaments */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#28C76F', display: 'inline-block' }} />
                  Live Tournaments
                </h2>
                <Link href="/tournaments">
                  <span style={{ fontSize: '12px', color: '#8A93A6', cursor: 'pointer' }}>View all →</span>
                </Link>
              </div>

              {activeTournaments.length === 0 ? (
                <div style={{ ...cardBase, padding: '28px', textAlign: 'center' }}>
                  <Target size={28} style={{ color: '#8A93A6', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '12px' }}>No live tournaments right now</p>
                  <Link href="/tournaments">
                    <button style={{
                      padding: '8px 18px', background: 'rgba(227,179,65,0.1)',
                      border: '1px solid rgba(227,179,65,0.3)', borderRadius: '8px',
                      color: '#E3B341', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}>
                      Browse upcoming
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTournaments.slice(0, 4).map((t: any) => (
                    <Link key={t.id} href="/tournaments">
                      <motion.div whileHover={{ x: 3 }} style={{
                        ...cardBase, padding: '14px 18px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '3px' }}>{t.name}</div>
                          <div style={{ fontSize: '12px', color: '#8A93A6', display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {t.currentPlayers}</span>
                            <span style={{ color: '#E3B341' }}>${t.buyInAmount || 0} buy-in</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '3px 8px', background: 'rgba(40,199,111,0.12)',
                            border: '1px solid rgba(40,199,111,0.25)', borderRadius: '5px',
                            fontSize: '11px', fontWeight: '600', color: '#28C76F',
                          }}>LIVE</span>
                          <ArrowRight size={14} color="#8A93A6" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#E2E8F0', marginBottom: '12px' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { href: '/tournaments', icon: <Plus size={18} />, label: 'Join Tournament', sub: 'Compete for real prizes', color: '#E3B341' },
                  { href: '/dashboard', icon: <TrendingUp size={18} />, label: 'My Portfolio', sub: 'Track performance', color: '#6366F1' },
                  { href: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard', sub: 'See global rankings', color: '#28C76F' },
                  { href: '/shop', icon: <Gift size={18} />, label: 'Rewards', sub: 'Redeem promo codes', color: '#EC4899' },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div whileHover={{ y: -2 }} style={{
                      ...cardBase, padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                        background: `${action.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: action.color,
                      }}>
                        {action.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{action.label}</div>
                        <div style={{ fontSize: '11px', color: '#8A93A6' }}>{action.sub}</div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Top players */}
            <div style={{ ...cardBase, padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0' }}>Top Players</h3>
                <Link href="/leaderboard">
                  <span style={{ fontSize: '12px', color: '#8A93A6', cursor: 'pointer' }}>Full board →</span>
                </Link>
              </div>
              {topPlayers.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#8A93A6', textAlign: 'center', padding: '12px 0' }}>Loading...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topPlayers.map((player: any, i: number) => (
                    <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '20px', fontSize: '12px', fontWeight: '700', textAlign: 'center',
                        color: i === 0 ? '#E3B341' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#8A93A6',
                      }}>
                        {i + 1}
                      </span>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: '#1E3050', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#00C2F0', flexShrink: 0,
                      }}>
                        {player.username?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {player.username}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8A93A6' }}>{player.tournamentWins || 0} wins</div>
                      </div>
                      {i === 0 && <Star size={13} color="#E3B341" fill="#E3B341" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming tournaments */}
            {upcomingTournaments.length > 0 && (
              <div style={{ ...cardBase, padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0' }}>
                    <Clock size={13} style={{ display: 'inline', marginRight: '6px', color: '#8A93A6' }} />
                    Coming Soon
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingTournaments.slice(0, 3).map((t: any) => (
                    <Link key={t.id} href="/tournaments">
                      <div style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0', marginBottom: '2px' }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: '#8A93A6', display: 'flex', gap: '10px' }}>
                          <span style={{ color: '#E3B341' }}>${t.buyInAmount || 0}</span>
                          <span>{t.maxPlayers} players max</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pro tip */}
            <div style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, rgba(227,179,65,0.06) 0%, transparent 100%)',
              border: '1px solid rgba(227,179,65,0.15)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#E3B341', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Pro Tip
              </div>
              <p style={{ fontSize: '13px', color: '#C9D1E2', lineHeight: '1.6' }}>
                {TIPS[tipIndex]}
              </p>
            </div>

            {/* Market status */}
            <div style={{ ...cardBase, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: (() => {
                  const h = currentTime.getHours(), m = currentTime.getMinutes(), d = currentTime.getDay();
                  const open = (h > 9 || (h === 9 && m >= 30)) && h < 16 && d > 0 && d < 6;
                  return open ? '#28C76F' : '#EF4444';
                })(),
              }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#E2E8F0' }}>
                  Market {(() => {
                    const h = currentTime.getHours(), m = currentTime.getMinutes(), d = currentTime.getDay();
                    return (h > 9 || (h === 9 && m >= 30)) && h < 16 && d > 0 && d < 6 ? 'Open' : 'Closed';
                  })()}
                </div>
                <div style={{ fontSize: '11px', color: '#8A93A6' }}>NYSE · Mon–Fri 9:30–16:00 ET</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hub-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hub-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
