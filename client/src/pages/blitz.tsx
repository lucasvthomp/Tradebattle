import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, X, Swords, Trophy, Clock, DollarSign, Flame } from "lucide-react";

type MatchState = "idle" | "queued" | "vs" | "matched";

// Big cartoony countdown digit
function CountdownDigit({ value, color }: { value: number; color: string }) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 2.2, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.4, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        fontSize: "clamp(80px, 20vw, 140px)",
        fontWeight: 900,
        lineHeight: 1,
        color,
        textShadow: `0 0 40px ${color}99, 0 0 80px ${color}44`,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.04em",
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      }}
    >
      {value}
    </motion.div>
  );
}

// Pulsing ring behind the queue spinner
function PulseRing({ color }: { color: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

export default function Blitz() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const [vsCountdown, setVsCountdown] = useState(3);
  const [opponentName, setOpponentName] = useState<string>("Opponent");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if user is already in an active blitz tournament
  const { data: activeTournamentsData } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });
  const activeBlitz = (activeTournamentsData as any)?.data?.find(
    (t: any) => t.tournamentType === "blitz" && t.status === "active"
  );

  const queueMutation = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/blitz/queue")).json(),
    onSuccess: (data: any) => {
      if (data.status === "matched") {
        setTournamentId(data.tournamentId);
        if (data.opponentName) setOpponentName(data.opponentName);
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
          if (data.opponentName) setOpponentName(data.opponentName);
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

  useEffect(() => () => {
    clearPolling();
    apiRequest("DELETE", "/api/blitz/queue").catch(() => {});
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const countdownColor = vsCountdown === 1 ? "#FF3D5A" : vsCountdown === 2 ? "#FFB020" : "#00A3FF";

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px 60px", background: "transparent" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
            style={{ display: "inline-block", fontSize: "56px", marginBottom: "12px" }}
          >
            ⚡
          </motion.div>
          <h1 style={{
            fontSize: "clamp(28px, 8vw, 42px)", fontWeight: 900,
            color: "#F1F5F9", margin: "0 0 6px",
            letterSpacing: "-0.03em",
            textShadow: "0 0 32px rgba(0,163,255,0.35)",
          }}>
            Blitz Mode
          </h1>
          <p style={{ fontSize: "14px", color: "#4B5975", margin: 0, fontWeight: 600 }}>
            1v1 · 5-minute battles · instant matchmaking
          </p>
        </div>

        {/* ── Auth gate ── */}
        {!user ? (
          <div style={{
            background: "linear-gradient(160deg, #0C1E35, #091525)",
            border: "1px solid rgba(0,163,255,0.2)",
            borderRadius: "20px",
            textAlign: "center",
            padding: "48px 24px",
          }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚔️</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#F1F5F9", marginBottom: "8px" }}>
              Sign in to battle
            </h2>
            <p style={{ fontSize: "14px", color: "#4B5975", marginBottom: "28px" }}>
              Create an account to compete in 1v1 trading matches.
            </p>
            <Link href="/login">
              <button style={{
                padding: "13px 32px",
                background: "linear-gradient(135deg, #00A3FF, #0077CC)",
                border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "15px", fontWeight: 900, cursor: "pointer",
                boxShadow: "0 0 24px rgba(0,163,255,0.3)",
              }}>
                Sign In to Battle
              </button>
            </Link>
          </div>
        ) : activeBlitz ? (
          /* ── Already in an active blitz ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(160deg, #0A2018, #091525)",
              border: "2px solid rgba(0,255,135,0.3)",
              borderRadius: "20px",
              textAlign: "center",
              padding: "48px 24px",
              boxShadow: "0 0 40px rgba(0,255,135,0.08)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
              style={{ fontSize: "52px", marginBottom: "16px" }}
            >
              ⚔️
            </motion.div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#00FF87", marginBottom: "8px" }}>
              You're already in a battle!
            </h2>
            <p style={{ fontSize: "14px", color: "#4B5975", marginBottom: "28px" }}>
              Finish your active match before starting a new one.
            </p>
            <Link href={`/dashboard?tournament=${activeBlitz.id}`}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "13px 32px",
                  background: "linear-gradient(135deg, #00FF87, #00C853)",
                  border: "none", borderRadius: "12px",
                  color: "#041810", fontSize: "15px", fontWeight: 900,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 0 24px rgba(0,255,135,0.3)",
                }}
              >
                Return to Match <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div>
            <AnimatePresence mode="wait">

              {/* ── IDLE ── */}
              {matchState === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{
                    background: "linear-gradient(160deg, #0C1E35 0%, #091525 100%)",
                    border: "1px solid rgba(0,163,255,0.25)",
                    borderRadius: "20px",
                    textAlign: "center",
                    padding: "clamp(32px, 8vw, 56px) 24px",
                    boxShadow: "0 0 60px rgba(0,163,255,0.06)",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* Background glow blob */}
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "300px", height: "300px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(0,163,255,0.07) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }} />

                    <motion.div
                      animate={{
                        scale: [1, 1.08, 1],
                        boxShadow: ["0 0 0px rgba(0,163,255,0)", "0 0 40px rgba(0,163,255,0.2)", "0 0 0px rgba(0,163,255,0)"],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        width: "96px", height: "96px", borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(0,163,255,0.18), rgba(0,163,255,0.04))",
                        border: "2px solid rgba(0,163,255,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 28px",
                        fontSize: "44px",
                        position: "relative",
                      }}
                    >
                      ⚔️
                    </motion.div>

                    <h2 style={{
                      fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 900,
                      color: "#F1F5F9", marginBottom: "10px", letterSpacing: "-0.02em",
                    }}>
                      Ready to battle?
                    </h2>
                    <p style={{ fontSize: "14px", color: "#4B5975", maxWidth: "300px", margin: "0 auto 36px", lineHeight: 1.6 }}>
                      Trade against a real opponent for 5 minutes. Highest portfolio wins.
                    </p>

                    <motion.button
                      onClick={() => queueMutation.mutate()}
                      disabled={queueMutation.isPending}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,163,255,0.45)" }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: "16px 48px",
                        background: "linear-gradient(135deg, #00A3FF, #0077CC)",
                        border: "none", borderRadius: "14px",
                        color: "#fff", fontSize: "18px", fontWeight: 900,
                        cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        letterSpacing: "0.01em",
                        boxShadow: "0 0 28px rgba(0,163,255,0.3)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Zap size={20} fill="currentColor" /> Find Match
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── QUEUED ── */}
              {matchState === "queued" && (
                <motion.div key="queued" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{
                    background: "linear-gradient(160deg, #0C1E35 0%, #091525 100%)",
                    border: "1px solid rgba(0,163,255,0.25)",
                    borderRadius: "20px",
                    textAlign: "center",
                    padding: "clamp(32px, 8vw, 56px) 24px",
                  }}>
                    {/* Spinner with pulse rings */}
                    <div style={{ position: "relative", width: "96px", height: "96px", margin: "0 auto 28px" }}>
                      <PulseRing color="rgba(0,163,255,0.35)" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                        style={{
                          position: "absolute", inset: 0, borderRadius: "50%",
                          border: "3px solid transparent",
                          borderTopColor: "#00A3FF",
                          borderRightColor: "rgba(0,163,255,0.25)",
                        }}
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                        style={{
                          position: "absolute", inset: "12px", borderRadius: "50%",
                          border: "2px solid transparent",
                          borderTopColor: "rgba(0,163,255,0.5)",
                          borderLeftColor: "rgba(0,163,255,0.15)",
                        }}
                      />
                      <div style={{
                        position: "absolute", inset: "24px", borderRadius: "50%",
                        background: "rgba(0,163,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                      }}>⚔️</div>
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#F1F5F9", marginBottom: "6px" }}>
                      Searching for opponent...
                    </h2>

                    {/* Queue timer */}
                    <motion.div
                      animate={{ opacity: [1, 0.45, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                      style={{
                        fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 900,
                        color: "#00A3FF", marginBottom: "28px",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.03em",
                        textShadow: "0 0 24px rgba(0,163,255,0.5)",
                        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                      }}
                    >
                      {formatTime(queueSeconds)}
                    </motion.div>

                    <button
                      onClick={() => cancelMutation.mutate()}
                      style={{
                        padding: "10px 24px",
                        background: "rgba(255,61,90,0.1)",
                        border: "1px solid rgba(255,61,90,0.3)",
                        borderRadius: "10px", color: "#FF3D5A",
                        fontSize: "13px", fontWeight: 700, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── VS SCREEN ── */}
              {matchState === "vs" && (
                <motion.div key="vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{
                    background: "linear-gradient(160deg, #080E1C 0%, #091525 100%)",
                    border: "2px solid rgba(0,163,255,0.4)",
                    borderRadius: "20px",
                    padding: "clamp(32px, 8vw, 56px) 24px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 0 60px rgba(0,163,255,0.12)",
                  }}>
                    {/* Scanline shimmer */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
                      style={{
                        position: "absolute", top: 0, bottom: 0, width: "40%",
                        background: "linear-gradient(90deg, transparent, rgba(0,163,255,0.06), transparent)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Players */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "clamp(12px, 5vw, 40px)", marginBottom: "36px",
                    }}>
                      <motion.div
                        initial={{ x: -80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ textAlign: "center" }}
                      >
                        <div style={{
                          width: "80px", height: "80px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #0C1829, #0E2040)",
                          border: "3px solid #8B5CF6",
                          boxShadow: "0 0 24px rgba(139,92,246,0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 10px",
                          fontSize: "32px", fontWeight: 900, color: "#8B5CF6",
                        }}>
                          {user?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#E2E8F0" }}>{user?.username}</div>
                        <div style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.05em" }}>YOU</div>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{
                          fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900,
                          color: "#00A3FF", lineHeight: 1,
                          textShadow: "0 0 24px rgba(0,163,255,0.6)",
                        }}
                      >
                        VS
                      </motion.div>

                      <motion.div
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ textAlign: "center" }}
                      >
                        <div style={{
                          width: "80px", height: "80px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #1A0810, #200A10)",
                          border: "3px solid #FF3D5A",
                          boxShadow: "0 0 24px rgba(255,61,90,0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 10px",
                          fontSize: "32px", fontWeight: 900, color: "#FF3D5A",
                        }}>
                          {opponentName[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#E2E8F0" }}>{opponentName}</div>
                        <div style={{ fontSize: "11px", color: "#FF3D5A", fontWeight: 700, letterSpacing: "0.05em" }}>ENEMY</div>
                      </motion.div>
                    </div>

                    {/* Big cartoony countdown */}
                    <div style={{ position: "relative", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AnimatePresence mode="wait">
                        {vsCountdown > 0 ? (
                          <CountdownDigit key={vsCountdown} value={vsCountdown} color={countdownColor} />
                        ) : (
                          <motion.div
                            key="fight"
                            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            style={{
                              fontSize: "clamp(52px, 14vw, 90px)",
                              fontWeight: 900,
                              color: "#00FF87",
                              textShadow: "0 0 40px rgba(0,255,135,0.6), 0 0 80px rgba(0,255,135,0.3)",
                              letterSpacing: "-0.02em",
                              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                            }}
                          >
                            FIGHT!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <p style={{ fontSize: "13px", color: "#4B5975", marginTop: "8px", fontWeight: 600 }}>
                      Match starting…
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── MATCHED ── */}
              {matchState === "matched" && tournamentId && (
                <motion.div key="matched" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{
                    background: "linear-gradient(160deg, #061A10 0%, #091525 100%)",
                    border: "2px solid rgba(0,255,135,0.35)",
                    borderRadius: "20px",
                    textAlign: "center",
                    padding: "clamp(32px, 8vw, 56px) 24px",
                    boxShadow: "0 0 60px rgba(0,255,135,0.08)",
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.6, repeat: 3 }}
                      style={{ fontSize: "56px", marginBottom: "20px" }}
                    >
                      🏆
                    </motion.div>
                    <h2 style={{
                      fontSize: "clamp(24px, 7vw, 34px)", fontWeight: 900,
                      color: "#00FF87", marginBottom: "10px",
                      textShadow: "0 0 24px rgba(0,255,135,0.4)",
                    }}>
                      Match Found!
                    </h2>
                    <p style={{ fontSize: "14px", color: "#4B5975", marginBottom: "32px", lineHeight: 1.6 }}>
                      Your 5-minute battle has begun. Go trade!
                    </p>
                    <Link href={`/dashboard?tournament=${tournamentId}`}>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,255,135,0.4)" }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          padding: "16px 40px",
                          background: "linear-gradient(135deg, #00FF87, #00C853)",
                          border: "none", borderRadius: "14px",
                          color: "#041810", fontSize: "18px", fontWeight: 900,
                          cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "10px",
                          boxShadow: "0 0 28px rgba(0,255,135,0.3)",
                        }}
                      >
                        Enter Battle <ArrowRight size={20} />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* ── Info strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: "20px",
                background: "#0C1829",
                border: "1px solid rgba(0,163,255,0.1)",
                borderRadius: "16px",
                display: "flex", flexWrap: "wrap",
                gap: "4px",
                padding: "6px",
                justifyContent: "center",
              }}
            >
              {[
                { icon: <Zap size={15} fill="currentColor" />, color: "#00A3FF", text: "Instant matchmaking" },
                { icon: <Clock size={15} />, color: "#8B5CF6", text: "5-minute matches" },
                { icon: <DollarSign size={15} />, color: "#00FF87", text: "$10k starting balance" },
                { icon: <Trophy size={15} />, color: "#E3B341", text: "Highest portfolio wins" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "8px 16px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", color: "#7B8FA8", fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
