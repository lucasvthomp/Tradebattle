import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, Clock, Trophy, ArrowRight, Shield, TrendingUp, X } from "lucide-react";

type MatchState = "idle" | "queued" | "matched";

export default function Blitz() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queueMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/blitz/queue"),
    onSuccess: (data: any) => {
      if (data.status === "matched") {
        setTournamentId(data.tournamentId);
        setMatchState("matched");
        clearPolling();
      } else {
        setMatchState("queued");
        startPolling();
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/blitz/queue"),
    onSuccess: () => {
      setMatchState("idle");
      setQueueSeconds(0);
      clearPolling();
    },
  });

  function startPolling() {
    clearPolling();
    // Poll status every 2s
    pollRef.current = setInterval(async () => {
      try {
        const data: any = await apiRequest("POST", "/api/blitz/queue");
        if (data.status === "matched") {
          setTournamentId(data.tournamentId);
          setMatchState("matched");
          clearPolling();
        }
      } catch {}
    }, 2000);

    // Queue timer
    timerRef.current = setInterval(() => {
      setQueueSeconds(s => s + 1);
    }, 1000);
  }

  function clearPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  }

  useEffect(() => () => clearPolling(), []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const cardStyle = {
    background: '#172035',
    border: '1px solid #1E3050',
    borderRadius: '12px',
    padding: '20px',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#E2E8F0', margin: 0 }}>Blitz Mode</h1>
              <p style={{ fontSize: '13px', color: '#8A93A6', margin: 0 }}>1v1 · 5-minute matches · instant matchmaking</p>
            </div>
          </div>
        </div>

        {/* Auth gate */}
        {!user ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
            <Zap size={36} color="#8B5CF6" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>Sign in to play Blitz</h2>
            <p style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '20px' }}>Create an account to compete in 1v1 trading matches.</p>
            <Link href="/login">
              <button style={{
                padding: '10px 24px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>
                Sign In
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="blitz-grid">

            {/* Matchmaking panel */}
            <div style={{ gridColumn: '1 / -1' }}>
              <AnimatePresence mode="wait">
                {matchState === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{
                      ...cardStyle,
                      borderTop: '2px solid #8B5CF6',
                      textAlign: 'center', padding: '40px 24px',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                          border: '2px solid rgba(139,92,246,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 20px',
                        }}
                      >
                        <Zap size={32} color="#8B5CF6" />
                      </motion.div>
                      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
                        Ready to battle?
                      </h2>
                      <p style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
                        You'll be matched with another player instantly. Trade for 5 minutes — highest portfolio value wins.
                      </p>
                      <button
                        onClick={() => queueMutation.mutate()}
                        disabled={queueMutation.isPending}
                        style={{
                          padding: '12px 32px',
                          background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                          border: 'none', borderRadius: '10px',
                          color: '#fff', fontSize: '15px', fontWeight: '700',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        }}
                      >
                        <Zap size={16} /> Find Match
                      </button>
                    </div>
                  </motion.div>
                )}

                {matchState === "queued" && (
                  <motion.div key="queued" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{
                      ...cardStyle,
                      borderTop: '2px solid #E3B341',
                      textAlign: 'center', padding: '40px 24px',
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: '56px', height: '56px', borderRadius: '50%',
                          border: '3px solid #1E3050',
                          borderTop: '3px solid #8B5CF6',
                          margin: '0 auto 20px',
                        }}
                      />
                      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#E2E8F0', marginBottom: '4px' }}>
                        Searching for opponent...
                      </h2>
                      <p style={{ fontSize: '22px', fontWeight: '700', color: '#8B5CF6', marginBottom: '20px', fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(queueSeconds)}
                      </p>
                      <button
                        onClick={() => cancelMutation.mutate()}
                        style={{
                          padding: '8px 20px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '8px', color: '#EF4444',
                          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {matchState === "matched" && tournamentId && (
                  <motion.div key="matched" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{
                      ...cardStyle,
                      borderTop: '2px solid #28C76F',
                      textAlign: 'center', padding: '40px 24px',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        style={{
                          width: '64px', height: '64px', borderRadius: '50%',
                          background: 'rgba(40,199,111,0.15)',
                          border: '2px solid rgba(40,199,111,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 16px',
                        }}
                      >
                        <Zap size={28} color="#28C76F" />
                      </motion.div>
                      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#28C76F', marginBottom: '6px' }}>
                        Match Found!
                      </h2>
                      <p style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '20px' }}>
                        Your 5-minute battle has started. Good luck!
                      </p>
                      <Link href={`/tournaments/${tournamentId}`}>
                        <button style={{
                          padding: '12px 28px',
                          background: 'linear-gradient(135deg, #28C76F, #20A85A)',
                          border: 'none', borderRadius: '10px',
                          color: '#fff', fontSize: '15px', fontWeight: '700',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        }}>
                          Enter Match <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How it works */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', marginBottom: '14px' }}>How It Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: <Users size={15} />, color: '#8B5CF6', text: 'Instantly matched with a real opponent' },
                  { icon: <Clock size={15} />, color: '#00C2F0', text: '5-minute match, starting balance of $10,000' },
                  { icon: <TrendingUp size={15} />, color: '#28C76F', text: 'Trade any stock — highest portfolio value wins' },
                  { icon: <Trophy size={15} />, color: '#E3B341', text: 'Win to climb the Blitz leaderboard' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: item.color, marginTop: '1px', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: '#C9D1E2', lineHeight: '1.5' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', marginBottom: '14px' }}>Rules</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Free to play — no buy-in required',
                  'Market hours don\'t apply in Blitz',
                  'No surrender — match runs full 5 minutes',
                  'Results are final once timer ends',
                ].map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Shield size={13} style={{ color: '#8A93A6', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#C9D1E2', lineHeight: '1.5' }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .blitz-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
