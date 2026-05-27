import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, Clock, Trophy, ArrowRight, Shield, TrendingUp, X, Swords } from "lucide-react";

type MatchState = "idle" | "queued" | "vs" | "matched";

export default function Blitz() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const [vsCountdown, setVsCountdown] = useState(3);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queueMutation = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/blitz/queue")).json(),
    onSuccess: (data: any) => {
      if (data.status === "matched") {
        setTournamentId(data.tournamentId);
        triggerVsScreen(data.tournamentId);
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

  function triggerVsScreen(tId: number) {
    setTournamentId(tId);
    setMatchState("vs");
    setVsCountdown(3);
    let c = 3;
    const countTimer = setInterval(() => {
      c -= 1;
      setVsCountdown(c);
      if (c <= 0) {
        clearInterval(countTimer);
        setMatchState("matched");
      }
    }, 1000);
  }

  function startPolling() {
    clearPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data: any = await (await apiRequest("GET", "/api/blitz/status")).json();
        if (data.matched) {
          clearPolling();
          triggerVsScreen(data.tournamentId);
        }
      } catch {}
    }, 2000);

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
    background: '#0D1117',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '20px',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#080C14' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(227,179,65,0.25), rgba(227,179,65,0.08))',
              border: '1px solid rgba(227,179,65,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#E3B341" />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#F1F5F9', margin: 0, letterSpacing: '-0.02em' }}>Blitz Mode</h1>
              <p style={{ fontSize: '12px', color: '#4B5563', margin: 0 }}>1v1 · 5-minute matches · instant matchmaking</p>
            </div>
          </div>
        </div>

        {/* Auth gate */}
        {!user ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚔️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#F1F5F9', marginBottom: '8px' }}>Sign in to play Blitz</h2>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px' }}>Create an account to compete in 1v1 trading matches.</p>
            <Link href="/login">
              <button style={{
                padding: '12px 28px', background: 'linear-gradient(135deg, #E3B341, #c99a35)',
                border: 'none', borderRadius: '10px', color: '#000',
                fontSize: '14px', fontWeight: '900', cursor: 'pointer',
              }}>
                Sign In to Battle
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="blitz-grid">

            {/* Matchmaking panel */}
            <div style={{ gridColumn: '1 / -1' }}>
              <AnimatePresence mode="wait">

                {/* IDLE */}
                {matchState === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div style={{
                      background: 'linear-gradient(160deg, #0D1117 0%, #080C14 100%)',
                      border: '1px solid rgba(227,179,65,0.2)',
                      borderRadius: '16px',
                      textAlign: 'center', padding: '48px 24px',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 0 0 rgba(227,179,65,0)', '0 0 0 20px rgba(227,179,65,0.07)', '0 0 0 0 rgba(227,179,65,0)'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          width: '84px', height: '84px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(227,179,65,0.15), rgba(227,179,65,0.05))',
                          border: '2px solid rgba(227,179,65,0.35)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 24px', fontSize: '36px',
                        }}
                      >
                        ⚔️
                      </motion.div>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#F1F5F9', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        Ready to battle?
                      </h2>
                      <p style={{ fontSize: '14px', color: '#4B5563', maxWidth: '320px', margin: '0 auto 28px' }}>
                        Trade against a real opponent for 5 minutes. Highest portfolio wins.
                      </p>
                      <motion.button
                        onClick={() => queueMutation.mutate()}
                        disabled={queueMutation.isPending}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '14px 40px',
                          background: 'linear-gradient(135deg, #E3B341, #c99a35)',
                          border: 'none', borderRadius: '12px',
                          color: '#000', fontSize: '16px', fontWeight: '900',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                          letterSpacing: '0.01em', boxShadow: '0 0 24px rgba(227,179,65,0.3)',
                        }}
                      >
                        <Zap size={18} /> Find Match
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* QUEUED */}
                {matchState === "queued" && (
                  <motion.div key="queued" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div style={{
                      background: 'linear-gradient(160deg, #0D1117 0%, #080C14 100%)',
                      border: '1px solid rgba(227,179,65,0.2)',
                      borderRadius: '16px',
                      textAlign: 'center', padding: '48px 24px',
                    }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                          style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            border: '2px solid transparent',
                            borderTopColor: '#E3B341', borderRightColor: 'rgba(227,179,65,0.2)',
                          }}
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                          style={{
                            position: 'absolute', inset: '10px', borderRadius: '50%',
                            border: '2px solid transparent',
                            borderTopColor: 'rgba(227,179,65,0.4)', borderLeftColor: 'rgba(227,179,65,0.15)',
                          }}
                        />
                        <div style={{
                          position: 'absolute', inset: '18px', borderRadius: '50%',
                          background: 'rgba(227,179,65,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px',
                        }}>
                          ⚔️
                        </div>
                      </div>

                      <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#F1F5F9', marginBottom: '4px' }}>
                        Searching for opponent...
                      </h2>
                      <motion.p
                        style={{ fontSize: '32px', fontWeight: '900', color: '#E3B341', marginBottom: '24px', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {formatTime(queueSeconds)}
                      </motion.p>
                      <button
                        onClick={() => cancelMutation.mutate()}
                        style={{
                          padding: '8px 20px',
                          background: 'rgba(255,79,88,0.08)',
                          border: '1px solid rgba(255,79,88,0.25)',
                          borderRadius: '8px', color: '#FF4F58',
                          fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VS SCREEN */}
                {matchState === "vs" && (
                  <motion.div key="vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{
                      background: 'linear-gradient(160deg, #0E0818 0%, #080C14 100%)',
                      border: '1px solid rgba(227,179,65,0.4)',
                      borderRadius: '16px',
                      padding: '48px 24px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* VS layout */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                        {/* You */}
                        <motion.div
                          initial={{ x: -60, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          style={{ textAlign: 'center' }}
                        >
                          <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1E2D3F, #2B3A4C)',
                            border: '3px solid #8B5CF6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px',
                            fontSize: '28px', fontWeight: '900', color: '#8B5CF6',
                          }}>
                            {user?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0' }}>{user?.username}</div>
                          <div style={{ fontSize: '11px', color: '#8B5CF6' }}>You</div>
                        </motion.div>

                        {/* VS */}
                        <motion.div
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.35, delay: 0.2, ease: 'backOut' }}
                          style={{ fontSize: '36px', fontWeight: '900', color: '#E3B341', lineHeight: 1 }}
                        >
                          VS
                        </motion.div>

                        {/* Opponent */}
                        <motion.div
                          initial={{ x: 60, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          style={{ textAlign: 'center' }}
                        >
                          <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1E2D3F, #2B3A4C)',
                            border: '3px solid #FF4F58',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px',
                          }}>
                            <Zap size={28} color="#FF4F58" />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0' }}>Opponent</div>
                          <div style={{ fontSize: '11px', color: '#FF4F58' }}>Enemy</div>
                        </motion.div>
                      </div>

                      <motion.div
                        key={vsCountdown}
                        initial={{ scale: 1.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ fontSize: '52px', fontWeight: '900', color: vsCountdown === 0 ? '#28C76F' : '#E3B341', lineHeight: 1 }}
                      >
                        {vsCountdown === 0 ? 'FIGHT!' : vsCountdown}
                      </motion.div>
                      <p style={{ fontSize: '13px', color: '#64748B', marginTop: '12px' }}>Match starting...</p>
                    </div>
                  </motion.div>
                )}

                {/* MATCHED */}
                {matchState === "matched" && tournamentId && (
                  <motion.div key="matched" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{
                      background: 'linear-gradient(160deg, #0A1F14 0%, #080C14 100%)',
                      border: '1px solid rgba(40,199,111,0.4)',
                      borderRadius: '16px',
                      textAlign: 'center', padding: '48px 24px',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: 'rgba(40,199,111,0.15)',
                          border: '2px solid rgba(40,199,111,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 20px',
                        }}
                      >
                        <Swords size={30} color="#28C76F" />
                      </motion.div>
                      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#28C76F', marginBottom: '8px' }}>
                        Match Found!
                      </h2>
                      <p style={{ fontSize: '14px', color: '#8A93A6', marginBottom: '24px' }}>
                        Your 5-minute battle has started. Good luck!
                      </p>
                      <Link href={`/dashboard?tournament=${tournamentId}`}>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            padding: '13px 32px',
                            background: 'linear-gradient(135deg, #28C76F, #20A85A)',
                            border: 'none', borderRadius: '12px',
                            color: '#fff', fontSize: '16px', fontWeight: '800',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                          }}
                        >
                          Enter Match <ArrowRight size={18} />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How it works */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#E3B341', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>How It Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { emoji: '⚡', color: '#E3B341', text: 'Instantly matched with a real opponent' },
                  { emoji: '⏱️', color: '#28C76F', text: '5-minute match, starting balance of $10,000' },
                  { emoji: '📈', color: '#28C76F', text: 'Trade any stock — highest portfolio value wins' },
                  { emoji: '🏆', color: '#E3B341', text: 'Win to climb the Blitz leaderboard' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ flexShrink: 0, fontSize: '15px', lineHeight: 1.4 }}>{item.emoji}</span>
                    <span style={{ fontSize: '13px', color: '#8A93A6', lineHeight: '1.5' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#E3B341', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rules</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Free to play — no buy-in required',
                  "Market hours don't apply in Blitz",
                  'No surrender — match runs full 5 minutes',
                  'Results are final once timer ends',
                ].map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Shield size={13} style={{ color: '#4B5563', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#8A93A6', lineHeight: '1.5' }}>{rule}</span>
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
