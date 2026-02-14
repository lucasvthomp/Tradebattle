import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Clock } from "lucide-react";

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
      background: '#06121F',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Welcome Section */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#C9D1E2',
            marginBottom: '8px',
          }}>
            {getGreeting()}, {user?.username}
          </h1>
          <p style={{ fontSize: '16px', color: '#8A93A6' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}>
          <div style={{
            background: '#1E2D3F',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #2B3A4C',
          }}>
            <div style={{ color: '#8A93A6', fontSize: '14px', marginBottom: '8px' }}>
              Account Balance
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#E3B341' }}>
              ${(Number(user?.siteCash) || 0).toFixed(2)}
            </div>
          </div>

          <div style={{
            background: '#1E2D3F',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #2B3A4C',
          }}>
            <div style={{ color: '#8A93A6', fontSize: '14px', marginBottom: '8px' }}>
              Tournament Wins
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#C9D1E2' }}>
              {user?.tournamentWins || 0}
            </div>
          </div>

          <div style={{
            background: '#1E2D3F',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #2B3A4C',
          }}>
            <div style={{ color: '#8A93A6', fontSize: '14px', marginBottom: '8px' }}>
              Active Tournaments
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#C9D1E2' }}>
              {activeTournaments.length}
            </div>
          </div>
        </div>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#C9D1E2',
              marginBottom: '20px',
            }}>
              Active Now
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {activeTournaments.slice(0, 3).map((tournament: any) => (
                <Link key={tournament.id} href="/tournaments">
                  <div style={{
                    background: '#1E2D3F',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #2B3A4C',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E3B341';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2B3A4C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#C9D1E2', marginBottom: '4px' }}>
                          {tournament.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                          ${tournament.buyIn} buy-in
                        </div>
                      </div>
                      <div style={{
                        background: '#28C76F20',
                        color: '#28C76F',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        Live
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#8A93A6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} />
                        {tournament.participants?.length || 0} players
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        Ends {new Date(tournament.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#C9D1E2',
            marginBottom: '20px',
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            <Link href="/tournaments">
              <button style={{
                width: '100%',
                background: '#1E2D3F',
                border: '2px solid #E3B341',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(227, 179, 65, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1E2D3F';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#E3B341', marginBottom: '8px' }}>
                  Join Tournament
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  Compete against others for prizes
                </div>
              </button>
            </Link>

            <Link href="/dashboard">
              <button style={{
                width: '100%',
                background: '#1E2D3F',
                border: '2px solid #2B3A4C',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8A93A6';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2B3A4C';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#C9D1E2',
                  marginBottom: '8px',
                }}>
                  <TrendingUp size={20} />
                  View Portfolio
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  Track your trading performance
                </div>
              </button>
            </Link>

            <Link href="/leaderboard">
              <button style={{
                width: '100%',
                background: '#1E2D3F',
                border: '2px solid #2B3A4C',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8A93A6';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2B3A4C';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#C9D1E2', marginBottom: '8px' }}>
                  Leaderboard
                </div>
                <div style={{ fontSize: '14px', color: '#8A93A6' }}>
                  See top traders and rankings
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Upcoming Tournaments Preview */}
        {upcomingTournaments.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#C9D1E2',
              marginBottom: '20px',
            }}>
              Coming Soon
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}>
              {upcomingTournaments.slice(0, 3).map((tournament: any) => (
                <div key={tournament.id} style={{
                  background: '#1E2D3F',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #2B3A4C',
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#C9D1E2', marginBottom: '8px' }}>
                    {tournament.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '12px' }}>
                    ${tournament.buyIn} buy-in
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#E3B341',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
