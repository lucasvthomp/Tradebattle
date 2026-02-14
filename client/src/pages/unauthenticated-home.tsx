import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Trophy, Users, Target, ArrowRight } from "lucide-react";

export default function UnauthenticatedHome() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#06121F',
      color: '#C9D1E2',
    }}>
      {/* Hero Section */}
      <section style={{
        padding: '120px 20px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(227, 179, 65, 0.1)',
          border: '1px solid rgba(227, 179, 65, 0.3)',
          borderRadius: '24px',
          padding: '6px 16px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#E3B341',
        }}>
          Stock Trading Tournaments
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: '700',
          lineHeight: '1.1',
          marginBottom: '20px',
          color: '#C9D1E2',
        }}>
          Trade Stocks.<br />
          Win Cash.
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#8A93A6',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
        }}>
          Compete in stock trading tournaments and win real money. No experience required.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px',
        }}>
          <Link href="/signup">
            <Button
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #E3B341, #c99a35)',
                color: '#080C14',
                fontWeight: '600',
                padding: '14px 32px',
                fontSize: '16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Get Started Free
              <ArrowRight style={{ marginLeft: '8px', width: '18px', height: '18px' }} />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              style={{
                background: 'transparent',
                border: '2px solid #2B3A4C',
                color: '#C9D1E2',
                fontWeight: '600',
                padding: '14px 32px',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#8A93A6',
          flexWrap: 'wrap',
        }}>
          <div>✓ Start with $10,000 virtual cash</div>
          <div>✓ Real-time stock data</div>
          <div>✓ Win real money</div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '48px',
          color: '#C9D1E2',
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {/* Feature 1 */}
          <div style={{
            background: '#1E2D3F',
            border: '1px solid #2B3A4C',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(227, 179, 65, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Users style={{ width: '24px', height: '24px', color: '#E3B341' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#C9D1E2',
            }}>
              Join a Tournament
            </h3>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Choose from daily tournaments with different buy-ins and prize pools. New tournaments start every day.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            background: '#1E2D3F',
            border: '1px solid #2B3A4C',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(40, 199, 111, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <TrendingUp style={{ width: '24px', height: '24px', color: '#28C76F' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#C9D1E2',
            }}>
              Trade Stocks
            </h3>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Buy and sell real stocks with your virtual balance. Trade as much as you want during the tournament.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            background: '#1E2D3F',
            border: '1px solid #2B3A4C',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(227, 179, 65, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Trophy style={{ width: '24px', height: '24px', color: '#E3B341' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#C9D1E2',
            }}>
              Win Cash Prizes
            </h3>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#8A93A6',
            }}>
              Top performers win real money. The more profit you make, the bigger your payout at the end.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          background: '#1E2D3F',
          border: '1px solid #2B3A4C',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '32px',
            color: '#C9D1E2',
          }}>
            Join Thousands of Traders
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
          }}>
            <div>
              <div style={{
                fontSize: '40px',
                fontWeight: '700',
                color: '#E3B341',
                marginBottom: '8px',
              }}>
                $125K+
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8A93A6',
              }}>
                Paid Out Monthly
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '40px',
                fontWeight: '700',
                color: '#E3B341',
                marginBottom: '8px',
              }}>
                10K+
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8A93A6',
              }}>
                Active Traders
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '40px',
                fontWeight: '700',
                color: '#E3B341',
                marginBottom: '8px',
              }}>
              Daily
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8A93A6',
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
        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#C9D1E2',
        }}>
          Ready to Start Trading?
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#8A93A6',
          marginBottom: '32px',
        }}>
          Create your free account and join your first tournament today.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #E3B341, #c99a35)',
              color: '#080C14',
              fontWeight: '600',
              padding: '16px 40px',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Get Started Free
          </Button>
        </Link>
        <div style={{
          marginTop: '16px',
          fontSize: '14px',
          color: '#8A93A6',
        }}>
          No credit card required • Free to start
        </div>
      </section>
    </div>
  );
}
