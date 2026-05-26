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

  // EXPLOSIVE background particles - 25 total for Times Square energy
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2, // Varied sizes 2-6px
    duration: Math.random() * 15 + 15, // Faster 15-30s
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.2, // Varied opacity 0.2-0.5
  }));

  // Shooting stars that streak across screen
  const shootingStars = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 60 + 20}%`,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 10,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06121F',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* EXPLOSIVE ambient particles - varied sizes and speeds */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: '#E3B341',
            left: particle.left,
            top: '-10px',
            pointerEvents: 'none',
            opacity: particle.opacity,
          }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, particle.opacity, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Shooting stars streaking across */}
      {shootingStars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          style={{
            position: 'absolute',
            width: '100px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #E3B341, transparent)',
            left: '-120px',
            top: star.top,
            pointerEvents: 'none',
          }}
          animate={{
            x: ['0vw', '120vw'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Multiple pulsing ambient glows for depth */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(227, 179, 65, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(40, 199, 111, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(80px)',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Compact Header */}
        <div className="mb-6 sm:mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2"
              style={{
                background: 'linear-gradient(135deg, #C9D1E2 0%, #E3B341 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              {getGreeting()}, {user?.username} 👋
            </motion.h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <p className="text-sm sm:text-base" style={{ color: '#8A93A6' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {activeTournaments.length > 0 && (
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 10px rgba(40, 199, 111, 0.3)',
                      '0 0 20px rgba(40, 199, 111, 0.6)',
                      '0 0 10px rgba(40, 199, 111, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(40, 199, 111, 0.15)',
                    border: '1px solid rgba(40, 199, 111, 0.4)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#28C76F',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#28C76F',
                    }}
                  />
                  {activeTournaments.length} LIVE NOW
                </motion.div>
              )}
            </div>
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

        {/* Stats Grid - Mobile responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Card className="p-3 sm:p-5" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #1A2937 100%)',
              border: '1px solid #2B3A4C',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A93A6' }}>
                  Balance
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#E3B341', opacity: 0.6 }} />
                </motion.div>
              </div>
              <motion.div
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{ color: '#E3B341' }}
                animate={{
                  textShadow: [
                    '0 0 10px rgba(227, 179, 65, 0.5)',
                    '0 0 20px rgba(227, 179, 65, 0.8)',
                    '0 0 10px rgba(227, 179, 65, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ${(Number(user?.siteCash) || 0).toFixed(2)}
              </motion.div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Card className="p-3 sm:p-5" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #1A2E24 100%)',
              border: '1px solid #2B3A4C',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A93A6' }}>
                  Wins
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#28C76F', opacity: 0.6 }} />
                </motion.div>
              </div>
              <motion.div
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{ color: '#28C76F' }}
                animate={{
                  textShadow: [
                    '0 0 10px rgba(40, 199, 111, 0.5)',
                    '0 0 20px rgba(40, 199, 111, 0.8)',
                    '0 0 10px rgba(40, 199, 111, 0.5)',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {user?.tournamentWins || 0}
              </motion.div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Card className="p-3 sm:p-5" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #1E2640 100%)',
              border: '1px solid #2B3A4C',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A93A6' }}>
                  Active Now
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6366F1', opacity: 0.6 }} />
                </motion.div>
              </div>
              <motion.div
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{ color: '#6366F1' }}
                animate={{
                  textShadow: [
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                    '0 0 20px rgba(99, 102, 241, 0.8)',
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {activeTournaments.length}
              </motion.div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Card className="p-3 sm:p-5" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #1A2E35 100%)',
              border: '1px solid #2B3A4C',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A93A6' }}>
                  Total Trades
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#06B6D4', opacity: 0.6 }} />
                </motion.div>
              </div>
              <motion.div
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{ color: '#06B6D4' }}
                animate={{
                  textShadow: [
                    '0 0 10px rgba(6, 182, 212, 0.5)',
                    '0 0 20px rgba(6, 182, 212, 0.8)',
                    '0 0 10px rgba(6, 182, 212, 0.5)',
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {user?.totalTrades || 0}
              </motion.div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* Left Column - Tournaments */}
          <div className="lg:col-span-8">

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
                  {activeTournaments.slice(0, 3).map((tournament: any, index: number) => (
                    <Link key={tournament.id} href="/tournaments">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                        whileHover={{ scale: 1.05, x: 8, boxShadow: '0 8px 30px rgba(40, 199, 111, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #1E2D3F 0%, #1A2E24 100%)',
                          border: '2px solid #2B3A4C',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    animate={{
                      boxShadow: [
                        '0 4px 20px rgba(227, 179, 65, 0.3)',
                        '0 8px 30px rgba(227, 179, 65, 0.5)',
                        '0 4px 20px rgba(227, 179, 65, 0.3)',
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.25) 0%, rgba(227, 179, 65, 0.1) 100%)',
                      border: '1px solid rgba(227, 179, 65, 0.5)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 90, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(227, 179, 65, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={20} style={{ color: '#E3B341' }} />
                    </motion.div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#E3B341', marginBottom: '2px' }}>
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
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    animate={{
                      boxShadow: [
                        '0 4px 20px rgba(99, 102, 241, 0.3)',
                        '0 8px 30px rgba(99, 102, 241, 0.5)',
                        '0 4px 20px rgba(99, 102, 241, 0.3)',
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <motion.div
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp size={20} style={{ color: '#6366F1' }} />
                    </motion.div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#6366F1', marginBottom: '2px' }}>
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
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    animate={{
                      boxShadow: [
                        '0 4px 20px rgba(40, 199, 111, 0.3)',
                        '0 8px 30px rgba(40, 199, 111, 0.5)',
                        '0 4px 20px rgba(40, 199, 111, 0.3)',
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 2.3, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(40, 199, 111, 0.25) 0%, rgba(40, 199, 111, 0.1) 100%)',
                      border: '1px solid rgba(40, 199, 111, 0.5)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [-5, 5, -5], y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(40, 199, 111, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trophy size={20} style={{ color: '#28C76F' }} />
                    </motion.div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#28C76F', marginBottom: '2px' }}>
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
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    animate={{
                      boxShadow: [
                        '0 4px 20px rgba(236, 72, 153, 0.3)',
                        '0 8px 30px rgba(236, 72, 153, 0.5)',
                        '0 4px 20px rgba(236, 72, 153, 0.3)',
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 2.7, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.1) 100%)',
                      border: '1px solid rgba(236, 72, 153, 0.5)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(236, 72, 153, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Gift size={20} style={{ color: '#EC4899' }} />
                    </motion.div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#EC4899', marginBottom: '2px' }}>
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
          <div className="lg:col-span-4">

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
