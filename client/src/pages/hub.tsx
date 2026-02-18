import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Trophy, Zap, Target, DollarSign, Flame, Star, ArrowRight, Activity, BarChart3, Plus, Bell, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Hub() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: tournamentsData } = useQuery({
    queryKey: ['/api/tournaments'],
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];
  const upcomingTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'upcoming') || [];
  const unreadNotifications = notificationsData?.unreadCount || 0;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Subtle background particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06121F',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle ambient particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: '#E3B341',
            left: particle.left,
            top: '-10px',
            pointerEvents: 'none',
            opacity: 0.15,
          }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Single ambient glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(227, 179, 65, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Compact Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#C9D1E2',
              marginBottom: '4px',
            }}>
              {getGreeting()}, {user?.username}
            </h1>
            <p style={{ fontSize: '14px', color: '#8A93A6' }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {unreadNotifications > 0 && (
            <Link href="/notifications">
              <motion.button
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(227, 179, 65, 0.1)',
                  border: '1px solid rgba(227, 179, 65, 0.3)',
                  borderRadius: '8px',
                  color: '#E3B341',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Bell size={16} />
                {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
              </motion.button>
            </Link>
          )}
        </div>

        {/* Stats Grid - More compact */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <Card style={{ padding: '20px', background: '#1E2D3F', border: '1px solid #2B3A4C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Balance
              </div>
              <DollarSign size={18} style={{ color: '#E3B341', opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#E3B341' }}>
              ${(Number(user?.siteCash) || 0).toFixed(2)}
            </div>
          </Card>

          <Card style={{ padding: '20px', background: '#1E2D3F', border: '1px solid #2B3A4C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Wins
              </div>
              <Trophy size={18} style={{ color: '#28C76F', opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#28C76F' }}>
              {user?.tournamentWins || 0}
            </div>
          </Card>

          <Card style={{ padding: '20px', background: '#1E2D3F', border: '1px solid #2B3A4C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Now
              </div>
              <Activity size={18} style={{ color: '#6366F1', opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366F1' }}>
              {activeTournaments.length}
            </div>
          </Card>

          <Card style={{ padding: '20px', background: '#1E2D3F', border: '1px solid #2B3A4C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Trades
              </div>
              <BarChart3 size={18} style={{ color: '#06B6D4', opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#06B6D4' }}>
              {user?.totalTrades || 0}
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}>

          {/* Left Column - Tournaments */}
          <div style={{ gridColumn: 'span 12 / span 12', '@media (min-width: 1024px)': { gridColumn: 'span 8 / span 8' } }}>

            {/* Live Tournaments */}
            {activeTournaments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#C9D1E2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#28C76F',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    Live Tournaments
                  </h2>
                  <Link href="/tournaments">
                    <span style={{ fontSize: '14px', color: '#E3B341', cursor: 'pointer', fontWeight: '500' }}>
                      View all →
                    </span>
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeTournaments.slice(0, 3).map((tournament: any) => (
                    <Link key={tournament.id} href="/tournaments">
                      <motion.div
                        whileHover={{ x: 4 }}
                        style={{
                          padding: '20px',
                          background: '#1E2D3F',
                          border: '1px solid #2B3A4C',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#28C76F'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2B3A4C'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#C9D1E2', marginBottom: '4px' }}>
                              {tournament.name}
                            </h3>
                            <div style={{ fontSize: '14px', color: '#E3B341', fontWeight: '500' }}>
                              ${tournament.buyInAmount || 0} buy-in • ${tournament.currentPot || 0} pool
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 10px',
                            background: 'rgba(40, 199, 111, 0.15)',
                            border: '1px solid rgba(40, 199, 111, 0.3)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#28C76F',
                            textTransform: 'uppercase',
                          }}>
                            Live
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#8A93A6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} />
                            {tournament.currentPlayers || 0} players
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} />
                            Ends {new Date(tournament.endTime).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#C9D1E2',
                marginBottom: '16px',
              }}>
                Quick Actions
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}>
                <Link href="/tournaments">
                  <motion.button
                    whileHover={{ y: -2 }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(227, 179, 65, 0.05) 100%)',
                      border: '1px solid rgba(227, 179, 65, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(227, 179, 65, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Plus size={20} style={{ color: '#E3B341' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#C9D1E2', marginBottom: '2px' }}>
                        Join Tournament
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A93A6' }}>
                        Compete now
                      </div>
                    </div>
                  </motion.button>
                </Link>

                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ y: -2 }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TrendingUp size={20} style={{ color: '#6366F1' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#C9D1E2', marginBottom: '2px' }}>
                        Portfolio
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A93A6' }}>
                        Track performance
                      </div>
                    </div>
                  </motion.button>
                </Link>

                <Link href="/leaderboard">
                  <motion.button
                    whileHover={{ y: -2 }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(40, 199, 111, 0.15) 0%, rgba(40, 199, 111, 0.05) 100%)',
                      border: '1px solid rgba(40, 199, 111, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(40, 199, 111, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Trophy size={20} style={{ color: '#28C76F' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#C9D1E2', marginBottom: '2px' }}>
                        Leaderboard
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A93A6' }}>
                        See rankings
                      </div>
                    </div>
                  </motion.button>
                </Link>

                <Link href="/shop">
                  <motion.button
                    whileHover={{ y: -2 }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(236, 72, 153, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Gift size={20} style={{ color: '#EC4899' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#C9D1E2', marginBottom: '2px' }}>
                        Rewards
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A93A6' }}>
                        Redeem codes
                      </div>
                    </div>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming & Activity */}
          <div style={{ gridColumn: 'span 12 / span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4 / span 4' } }}>

            {/* Upcoming Tournaments */}
            {upcomingTournaments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#C9D1E2',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Clock size={18} style={{ color: '#8A93A6' }} />
                  Coming Soon
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingTournaments.slice(0, 4).map((tournament: any) => (
                    <Card key={tournament.id} style={{
                      padding: '16px',
                      background: '#1E2D3F',
                      border: '1px solid #2B3A4C',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#C9D1E2', marginBottom: '8px' }}>
                        {tournament.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#E3B341', marginBottom: '8px', fontWeight: '500' }}>
                        ${tournament.buyInAmount || 0} buy-in
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A93A6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(tournament.startTime).toLocaleDateString()}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Tips */}
            <Card style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.08) 0%, rgba(227, 179, 65, 0.02) 100%)',
              border: '1px solid rgba(227, 179, 65, 0.2)',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#E3B341', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💡 Pro Tip
              </h3>
              <p style={{ fontSize: '13px', color: '#C9D1E2', lineHeight: '1.6' }}>
                Join tournaments early to scout competition and plan your strategy. The first hour is crucial for building momentum.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (min-width: 1024px) {
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        }
      `}</style>
    </div>
  );
}
