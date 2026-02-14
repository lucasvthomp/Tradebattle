import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Trophy, Zap, Target, DollarSign, Flame, Star, ArrowRight, Sparkles } from "lucide-react";

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

  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];
  const upcomingTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'upcoming') || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // MASSIVE PARTICLE SYSTEM - 60 particles with variety
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const shapes = ['circle', 'star', 'sparkle', 'diamond'];
    const colors = ['#E3B341', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899'];

    return {
      id: i,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: Math.random() * 8 + 2, // 2-10px
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 12 + 12, // 12-24s
      delay: Math.random() * 8,
      shouldPulse: Math.random() > 0.5,
    };
  });

  // ROTATING GEOMETRIC SHAPES
  const geometricShapes = Array.from({ length: 7 }).map((_, i) => ({
    id: i,
    type: i % 2 === 0 ? 'square' : 'triangle',
    size: Math.random() * 80 + 60,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    rotation: Math.random() * 360,
    duration: Math.random() * 20 + 20,
    color: ['#E3B341', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 6)],
  }));

  const shootingStars = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    delay: i * 3 + Math.random() * 2,
  }));

  const ambientGlows = [
    { top: '10%', left: '15%', color: '#E3B341' },
    { top: '60%', right: '20%', color: '#8B5CF6' },
    { bottom: '15%', left: '40%', color: '#06B6D4' },
    { top: '40%', right: '50%', color: '#EC4899' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #06121F 0%, #0F172A 50%, #1E293B 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* MASSIVE PARTICLE SYSTEM */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'diamond' ? '3px' : '0',
            background: particle.color,
            left: particle.left,
            top: '-10px',
            pointerEvents: 'none',
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            transform: particle.shape === 'diamond' ? 'rotate(45deg)' :
                      particle.shape === 'star' ? 'rotate(0deg)' : 'none',
            clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                     particle.shape === 'sparkle' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(particle.id) * 150, Math.cos(particle.id) * 100],
            opacity: [0, 1, 1, 0],
            scale: particle.shouldPulse ? [1, 1.5, 1, 1.3, 1] : 1,
            rotate: particle.shape === 'diamond' ? [45, 405] : particle.shape === 'star' ? [0, 720] : 0,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* ROTATING GEOMETRIC SHAPES */}
      {geometricShapes.map((shape) => (
        <motion.div
          key={shape.id}
          style={{
            position: 'absolute',
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            top: shape.top,
            left: shape.left,
            pointerEvents: 'none',
            opacity: 0.08,
            background: `linear-gradient(135deg, ${shape.color}40, ${shape.color}10)`,
            border: `2px solid ${shape.color}30`,
            borderRadius: shape.type === 'square' ? '12px' : '0',
            clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          style={{
            position: 'absolute',
            width: '200px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #E3B341, #F59E0B, transparent)',
            top: `${Math.random() * 60}%`,
            left: '-200px',
            pointerEvents: 'none',
            transform: 'rotate(-45deg)',
            boxShadow: '0 0 20px #E3B341, 0 0 40px #F59E0B',
          }}
          animate={{
            x: ['0vw', '130vw'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: star.delay,
            repeatDelay: 6,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Ambient Glows */}
      {ambientGlows.map((glow, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glow.color}50 0%, transparent 70%)`,
            pointerEvents: 'none',
            filter: 'blur(80px)',
            ...glow,
          }}
          animate={{
            scale: [1, 1.5, 1.2, 1],
            opacity: [0.3, 0.7, 0.5, 0.3],
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Welcome Section with EXPLOSIVE Animation */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{
          marginBottom: '48px',
          background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(227, 179, 65, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* COLOR-SHIFTING BACKGROUND */}
          <motion.div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
            animate={{
              background: [
                'radial-gradient(circle, rgba(227, 179, 65, 0.2) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(227, 179, 65, 0.2) 0%, transparent 70%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.h1
            style={{
              fontSize: '42px',
              fontWeight: '700',
              marginBottom: '8px',
              position: 'relative',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
                'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                'linear-gradient(135deg, #8B5CF6 0%, #E3B341 100%)',
                'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
              ],
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {getGreeting()}, {user?.username}! 👋
          </motion.h1>
          <p style={{
            fontSize: '16px',
            color: '#8A93A6',
            position: 'relative',
          }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Ready to make some moves?
          </p>
        </motion.div>

        {/* Stats Overview with GRADIENT ANIMATED TEXT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}>
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.12,
              y: -8,
              boxShadow: '0 20px 50px rgba(227, 179, 65, 0.4)',
            }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid #E3B341',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            <motion.div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                opacity: 0.1,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <DollarSign size={80} color="#E3B341" />
            </motion.div>
            <div style={{
              color: '#E3B341',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={14} />
              </motion.div>
              Account Balance
            </div>
            <motion.div
              style={{
                fontSize: '36px',
                fontWeight: '700',
              }}
              animate={{
                background: [
                  'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                  'linear-gradient(135deg, #F59E0B 0%, #E3B341 100%)',
                  'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                ],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: [
                  '0 0 20px rgba(227, 179, 65, 0.3)',
                  '0 0 40px rgba(227, 179, 65, 0.6)',
                  '0 0 20px rgba(227, 179, 65, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ${(Number(user?.siteCash) || 0).toFixed(2)}
            </motion.div>
          </motion.div>

          {/* Wins Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.12,
              y: -8,
              boxShadow: '0 20px 50px rgba(147, 51, 234, 0.4)',
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            <motion.div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                opacity: 0.1,
              }}
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy size={80} color="#9333EA" />
            </motion.div>
            <div style={{
              color: '#A78BFA',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Trophy size={14} />
              Tournament Wins
            </div>
            <motion.div
              style={{
                fontSize: '36px',
                fontWeight: '700',
              }}
              animate={{
                background: [
                  'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  'linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)',
                  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                  'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                ],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {user?.tournamentWins || 0}
            </motion.div>
          </motion.div>

          {/* Active Tournaments Card with HOT badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.12,
              y: -8,
              boxShadow: '0 20px 50px rgba(34, 197, 94, 0.4)',
            }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            {/* ANIMATED "HOT" BADGE */}
            <motion.div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #FF4F58 0%, #F59E0B 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 2,
                boxShadow: '0 4px 20px rgba(255, 79, 88, 0.5)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                rotate: [-3, 3, -3],
                boxShadow: [
                  '0 4px 20px rgba(255, 79, 88, 0.5)',
                  '0 4px 30px rgba(255, 79, 88, 0.8)',
                  '0 4px 20px rgba(255, 79, 88, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame size={12} />
              HOT
            </motion.div>
            <motion.div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                opacity: 0.1,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame size={80} color="#22C55E" />
            </motion.div>
            <div style={{
              color: '#4ADE80',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame size={14} />
              </motion.div>
              Active Now
            </div>
            <motion.div
              style={{
                fontSize: '36px',
                fontWeight: '700',
              }}
              animate={{
                background: [
                  'linear-gradient(135deg, #10B981 0%, #4ADE80 100%)',
                  'linear-gradient(135deg, #4ADE80 0%, #06B6D4 100%)',
                  'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  'linear-gradient(135deg, #10B981 0%, #4ADE80 100%)',
                ],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {activeTournaments.length}
            </motion.div>
          </motion.div>
        </div>

        {/* Active Tournaments with COLOR-SHIFTING */}
        {activeTournaments.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#C9D1E2',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Zap size={24} color="#22C55E" />
              </motion.div>
              Live Tournaments
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {activeTournaments.slice(0, 3).map((tournament: any, idx: number) => (
                <Link key={tournament.id} href="/tournaments">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{
                      scale: 1.08,
                      y: -6,
                      boxShadow: '0 20px 60px rgba(34, 197, 94, 0.3)',
                    }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                  }}>
                    {/* COLOR-SHIFTING BACKGROUND */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                      }}
                      animate={{
                        background: [
                          'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
                          'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, #1E2D3F 50%, #2D3748 100%)',
                          'linear-gradient(135deg, #1E2D3F 0%, rgba(6, 182, 212, 0.1) 50%, #2D3748 100%)',
                          'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
                        ],
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '200px',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                      animate={{
                        background: [
                          'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
                          'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
                          'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
                        ],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#C9D1E2', marginBottom: '6px' }}>
                          {tournament.name}
                        </div>
                        <div style={{ fontSize: '15px', color: '#E3B341', fontWeight: '600' }}>
                          ${tournament.buyIn} buy-in
                        </div>
                      </div>
                      <motion.div
                        style={{
                          background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        animate={{
                          boxShadow: [
                            '0 4px 12px rgba(34, 197, 94, 0.3)',
                            '0 4px 25px rgba(34, 197, 94, 0.6)',
                            '0 4px 12px rgba(34, 197, 94, 0.3)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.span
                          style={{
                            width: '8px',
                            height: '8px',
                            background: 'white',
                            borderRadius: '50%',
                          }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        LIVE
                      </motion.div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#8A93A6', position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} />
                        <span style={{ fontWeight: '600' }}>{tournament.participants?.length || 0}</span> players
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} />
                        Ends {new Date(tournament.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions with PULSING CTAs */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#C9D1E2',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Star size={24} color="#E3B341" />
            </motion.div>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {/* Join Tournament - EXPLOSIVE GOLD */}
            <Link href="/tournaments">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    '0 0 30px rgba(227, 179, 65, 0.3)',
                    '0 0 50px rgba(227, 179, 65, 0.6)',
                    '0 0 30px rgba(227, 179, 65, 0.3)',
                  ],
                }}
                whileHover={{
                  scale: 1.15,
                  y: -8,
                  boxShadow: '0 20px 60px rgba(227, 179, 65, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  delay: 0.4,
                }}
                style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                border: '2px solid #E3B341',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    opacity: 0.15,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Trophy size={120} color="#E3B341" />
                </motion.div>
                {/* NEW BADGE */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #FF4F58 0%, #F59E0B 100%)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '800',
                    zIndex: 2,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  NEW!
                </motion.div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#E3B341', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                  <Trophy size={20} />
                  Join Tournament
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6', position: 'relative', zIndex: 1 }}>
                  Compete against others and win big prizes
                </div>
              </motion.button>
            </Link>

            {/* Portfolio - PURPLE/BLUE */}
            <Link href="/dashboard">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    '0 0 30px rgba(99, 102, 241, 0.2)',
                    '0 0 50px rgba(99, 102, 241, 0.4)',
                    '0 0 30px rgba(99, 102, 241, 0.2)',
                  ],
                }}
                whileHover={{
                  scale: 1.15,
                  y: -8,
                  boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                  delay: 0.5,
                }}
                style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    opacity: 0.12,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TrendingUp size={120} color="#6366F1" />
                </motion.div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#A5B4FC',
                  marginBottom: '10px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <TrendingUp size={20} />
                  View Portfolio
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6', position: 'relative', zIndex: 1 }}>
                  Track your performance and gains
                </div>
              </motion.button>
            </Link>

            {/* Leaderboard - GREEN */}
            <Link href="/leaderboard">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    '0 0 30px rgba(34, 197, 94, 0.2)',
                    '0 0 50px rgba(34, 197, 94, 0.4)',
                    '0 0 30px rgba(34, 197, 94, 0.2)',
                  ],
                }}
                whileHover={{
                  scale: 1.15,
                  y: -8,
                  boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                  delay: 0.6,
                }}
                style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '2px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    opacity: 0.12,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Target size={120} color="#22C55E" />
                </motion.div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#4ADE80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                  <Target size={20} />
                  Leaderboard
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6', position: 'relative', zIndex: 1 }}>
                  See top traders and rankings
                </div>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Upcoming Tournaments with NEW badge */}
        {upcomingTournaments.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#C9D1E2',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Clock size={24} color="#A78BFA" />
              </motion.div>
              Coming Soon
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}>
              {upcomingTournaments.slice(0, 3).map((tournament: any, idx: number) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.12,
                    y: -6,
                    boxShadow: '0 20px 50px rgba(168, 85, 247, 0.3)',
                  }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                  background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  {/* NEW BADGE */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '800',
                      zIndex: 2,
                      boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    NEW!
                  </motion.div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#C9D1E2', marginBottom: '8px' }}>
                    {tournament.name}
                  </div>
                  <div style={{ fontSize: '15px', color: '#E3B341', fontWeight: '600', marginBottom: '12px' }}>
                    ${tournament.buyIn} buy-in
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#A78BFA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '600',
                  }}>
                    <Clock size={14} />
                    Starts {new Date(tournament.startTime).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
