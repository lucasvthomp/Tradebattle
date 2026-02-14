import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #06121F 0%, #0F172A 50%, #1E293B 100%)',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Welcome Section with Flair */}
        <div style={{
          marginBottom: '48px',
          background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(227, 179, 65, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(227, 179, 65, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            position: 'relative',
          }}>
            {getGreeting()}, {user?.username}! 👋
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#8A93A6',
            position: 'relative',
          }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Ready to make some moves?
          </p>
        </div>

        {/* Stats Overview with Gradients */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}>
          {/* Balance Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid #E3B341',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(227, 179, 65, 0.15)',
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              opacity: 0.1,
            }}>
              <DollarSign size={80} color="#E3B341" />
            </div>
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
              <Sparkles size={14} />
              Account Balance
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ${(Number(user?.siteCash) || 0).toFixed(2)}
            </div>
          </div>

          {/* Wins Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(147, 51, 234, 0.1)',
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              opacity: 0.1,
            }}>
              <Trophy size={80} color="#9333EA" />
            </div>
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
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#C9D1E2',
            }}>
              {user?.tournamentWins || 0}
            </div>
          </div>

          {/* Active Tournaments Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.1)',
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              opacity: 0.1,
            }}>
              <Flame size={80} color="#22C55E" />
            </div>
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
              <Flame size={14} />
              Active Now
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#C9D1E2',
            }}>
              {activeTournaments.length}
            </div>
          </div>
        </div>

        {/* Active Tournaments with Better Design */}
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
              <Zap size={24} color="#22C55E" />
              Live Tournaments
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {activeTournaments.slice(0, 3).map((tournament: any) => (
                <Link key={tournament.id} href="/tournaments">
                  <div style={{
                    background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#22C55E';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '200px',
                      height: '200px',
                      background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#C9D1E2', marginBottom: '6px' }}>
                          {tournament.name}
                        </div>
                        <div style={{ fontSize: '15px', color: '#E3B341', fontWeight: '600' }}>
                          ${tournament.buyIn} buy-in
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          background: 'white',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite',
                        }} />
                        LIVE
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#8A93A6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} />
                        <span style={{ fontWeight: '600' }}>{tournament.participants?.length || 0}</span> players
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} />
                        Ends {new Date(tournament.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions with Fun Gradients */}
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
            <Star size={24} color="#E3B341" />
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {/* Join Tournament - Gold Theme */}
            <Link href="/tournaments">
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid #E3B341',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(227, 179, 65, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%)';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(227, 179, 65, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  opacity: 0.1,
                }}>
                  <Trophy size={100} color="#E3B341" />
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#E3B341', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={20} />
                  Join Tournament
                  <ArrowRight size={18} />
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  Compete against others and win big prizes
                </div>
              </button>
            </Link>

            {/* Portfolio - Blue/Purple Theme */}
            <Link href="/dashboard">
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  opacity: 0.1,
                }}>
                  <TrendingUp size={100} color="#6366F1" />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#A5B4FC',
                  marginBottom: '10px',
                }}>
                  <TrendingUp size={20} />
                  View Portfolio
                  <ArrowRight size={18} />
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  Track your performance and gains
                </div>
              </button>
            </Link>

            {/* Leaderboard - Green Theme */}
            <Link href="/leaderboard">
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '2px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#22C55E';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  opacity: 0.1,
                }}>
                  <Target size={100} color="#22C55E" />
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#4ADE80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} />
                  Leaderboard
                  <ArrowRight size={18} />
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  See top traders and rankings
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Upcoming Tournaments */}
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
              <Clock size={24} color="#A78BFA" />
              Coming Soon
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}>
              {upcomingTournaments.slice(0, 3).map((tournament: any) => (
                <div key={tournament.id} style={{
                  background: 'linear-gradient(135deg, #1E2D3F 0%, #2D3748 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A855F7';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
