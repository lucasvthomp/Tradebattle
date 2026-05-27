import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Trophy, Users, Target, ArrowRight, Zap, DollarSign, Flame, Star, Sparkles, Clock, Award } from "lucide-react";
import { useState, useEffect } from "react";

export default function UnauthenticatedHome() {
  const [prizePool, setPrizePool] = useState(125000);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 34, seconds: 12 });

  // Simulate growing prize pool
  useEffect(() => {
    const interval = setInterval(() => {
      setPrizePool(prev => prev + Math.random() * 50);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1628 0%, #0C1E3A 50%, #0D2145 100%)',
      color: '#C9D1E2',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(227, 179, 65, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Hero Section */}
      <section style={{
        padding: '120px 20px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Trending Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '30px',
          padding: '8px 20px',
          marginBottom: '32px',
          fontSize: '14px',
          fontWeight: '700',
          color: '#4ADE80',
        }}>
          <Flame size={18} />
          <span>2,847 traders online now</span>
        </div>

        <h1 style={{
          fontSize: '64px',
          fontWeight: '800',
          lineHeight: '1.1',
          marginBottom: '24px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #C9D1E2 0%, #8A93A6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Trade Stocks.
          </span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Win Real Cash.
          </span>
        </h1>

        <p style={{
          fontSize: '22px',
          color: '#8A93A6',
          marginBottom: '40px',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: '1.5',
        }}>
          Join tournaments, compete with traders worldwide, and win actual money.
          <span style={{ color: '#E3B341', fontWeight: '600' }}> No experience needed.</span>
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px',
        }}>
          <Link href="/signup">
            <Button
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                color: '#091525',
                fontWeight: '700',
                padding: '18px 40px',
                fontSize: '18px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(227, 179, 65, 0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(227, 179, 65, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(227, 179, 65, 0.3)';
              }}
            >
              Start Playing Free
              <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              style={{
                background: 'transparent',
                border: '2px solid rgba(227, 179, 65, 0.5)',
                color: '#E3B341',
                fontWeight: '700',
                padding: '18px 40px',
                fontSize: '18px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E3B341';
                e.currentTarget.style.background = 'rgba(227, 179, 65, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(227, 179, 65, 0.5)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Quick Features */}
        <div style={{
          display: 'flex',
          gap: '40px',
          justifyContent: 'center',
          fontSize: '15px',
          color: '#8A93A6',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#E3B341" />
            <span>Start with $10,000 virtual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#22C55E" />
            <span>Real-time market data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#A78BFA" />
            <span>Win actual prizes</span>
          </div>
        </div>
      </section>

      {/* Live Prize Pool Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
          border: '2px solid rgba(227, 179, 65, 0.3)',
          borderRadius: '20px',
          padding: '48px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(227, 179, 65, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <Trophy size={32} color="#E3B341" />
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#C9D1E2',
            }}>
              Total Prize Pool This Month
            </h2>
          </div>
          <div style={{
            fontSize: '72px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '32px',
          }}>
            ${prizePool.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>

          {/* Countdown */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px 32px',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#4ADE80',
              fontWeight: '700',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
            }}>
              <Clock size={16} />
              Next Tournament Starts In
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#22C55E',
              fontFamily: 'monospace',
            }}>
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '56px',
          color: '#C9D1E2',
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {/* Step 1 */}
          <div style={{
            background: 'linear-gradient(135deg, #0C1829 0%, #2D3748 100%)',
            border: '2px solid rgba(227, 179, 65, 0.5)',
            borderRadius: '20px',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(227, 179, 65, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              opacity: 0.1,
            }}>
              <Users size={140} color="#E3B341" />
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(227, 179, 65, 0.3)',
            }}>
              <Users style={{ width: '28px', height: '28px', color: '#091525' }} />
            </div>
            <div style={{
              fontSize: '14px',
              color: '#E3B341',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Step 1
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#C9D1E2',
            }}>
              Join a Tournament
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Pick from daily tournaments with different buy-ins and prize pools. New ones start all day, every day.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'linear-gradient(135deg, #0C1829 0%, #2D3748 100%)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '20px',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(34, 197, 94, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              opacity: 0.1,
            }}>
              <TrendingUp size={140} color="#22C55E" />
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
            }}>
              <TrendingUp style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div style={{
              fontSize: '14px',
              color: '#4ADE80',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Step 2
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#C9D1E2',
            }}>
              Trade Stocks
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Buy and sell real stocks with live market data. Trade as much as you want with your virtual balance.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'linear-gradient(135deg, #0C1829 0%, #2D3748 100%)',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            borderRadius: '20px',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(147, 51, 234, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              opacity: 0.1,
            }}>
              <Trophy size={140} color="#9333EA" />
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)',
            }}>
              <Trophy style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div style={{
              fontSize: '14px',
              color: '#A78BFA',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Step 3
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#C9D1E2',
            }}>
              Win Cash Prizes
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Top performers win real money. The more profit you make, the bigger your payout when it ends.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0C1829 0%, #2D3748 100%)',
          border: '2px solid rgba(227, 179, 65, 0.3)',
          borderRadius: '20px',
          padding: '56px 40px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#C9D1E2',
          }}>
            Join Thousands of Traders
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
          }}>
            <div>
              <div style={{
                fontSize: '52px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
              }}>
                $125K+
              </div>
              <div style={{
                fontSize: '15px',
                color: '#8A93A6',
                fontWeight: '600',
              }}>
                Paid Out Monthly
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '52px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
              }}>
                10K+
              </div>
              <div style={{
                fontSize: '15px',
                color: '#8A93A6',
                fontWeight: '600',
              }}>
                Active Traders
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '52px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #A78BFA 0%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
              }}>
                Daily
              </div>
              <div style={{
                fontSize: '15px',
                color: '#8A93A6',
                fontWeight: '600',
              }}>
                New Tournaments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 20px 100px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '2px solid rgba(227, 179, 65, 0.4)',
          borderRadius: '24px',
          padding: '56px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(227, 179, 65, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '20px',
            color: '#C9D1E2',
            position: 'relative',
          }}>
            Ready to Start Trading?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#8A93A6',
            marginBottom: '40px',
            position: 'relative',
          }}>
            Create your free account and join your first tournament today.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                color: '#091525',
                fontWeight: '800',
                padding: '20px 48px',
                fontSize: '20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(227, 179, 65, 0.4)',
                transition: 'all 0.3s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(227, 179, 65, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(227, 179, 65, 0.4)';
              }}
            >
              Get Started Free
              <Sparkles style={{ marginLeft: '12px', width: '24px', height: '24px' }} />
            </Button>
          </Link>
          <div style={{
            marginTop: '24px',
            fontSize: '15px',
            color: '#8A93A6',
            position: 'relative',
          }}>
            No credit card required • Free forever • Win real money
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
