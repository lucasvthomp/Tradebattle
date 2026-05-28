import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Trophy, Users, ArrowRight, Zap, Sparkles, Clock, Swords, Star, Flame } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Live chart canvas ────────────────────────────────────────────────────────
function LiveChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);

  const generate = useCallback(() => {
    const pts: number[] = [];
    let v = 0.5;
    for (let i = 0; i < 120; i++) {
      v += (Math.random() - 0.48) * 0.04;
      v = Math.max(0.08, Math.min(0.92, v));
      pts.push(v);
    }
    return pts;
  }, []);

  useEffect(() => {
    pointsRef.current = generate();
  }, [generate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let tick = 0;

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const dpr = window.devicePixelRatio;
      const W = canvas!.width;
      const H = canvas!.height;
      ctx.clearRect(0, 0, W, H);

      const pts = pointsRef.current;
      const n = pts.length;
      const step = W / (n - 1);
      const isUp = pts[n - 1] >= pts[0];
      const lineColor = isUp ? "#00FF87" : "#FF3D5A";
      const glowColor = isUp ? "rgba(0,255,135," : "rgba(255,61,90,";

      // Faint grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let r = 0; r <= 4; r++) {
        const y = (H / 4) * r;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let c = 0; c <= 6; c++) {
        const x = (W / 6) * c;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Gradient fill under line
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, glowColor + "0.18)");
      grad.addColorStop(0.6, glowColor + "0.04)");
      grad.addColorStop(1, glowColor + "0)");
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = i * step;
        const y = H - p * H * 0.8 - H * 0.1;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo((n - 1) * step, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Glow shadow pass
      ctx.save();
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 12 * dpr;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5 * dpr;
      ctx.lineJoin = "round";
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = i * step;
        const y = H - p * H * 0.8 - H * 0.1;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // Pulsing dot at tip
      const lx = (n - 1) * step;
      const ly = H - pts[n - 1] * H * 0.8 - H * 0.1;
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.08);
      ctx.beginPath();
      ctx.arc(lx, ly, (5 + pulse * 4) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = glowColor + (0.15 + pulse * 0.1) + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10 * dpr;
      ctx.fill();

      tick++;
      // Slowly evolve: push new point, drop oldest
      if (tick % 8 === 0) {
        const last = pts[pts.length - 1];
        let next = last + (Math.random() - 0.48) * 0.035;
        next = Math.max(0.08, Math.min(0.92, next));
        pointsRef.current = [...pts.slice(1), next];
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── Floating volatility bars ─────────────────────────────────────────────────
function VolatilityBars() {
  const bars = Array.from({ length: 28 }, (_, i) => ({
    h: 20 + Math.random() * 80,
    delay: i * 0.12,
    color: Math.random() > 0.45 ? "#00FF87" : "#FF3D5A",
    dur: 0.6 + Math.random() * 0.8,
  }));

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "80px", display: "flex", alignItems: "flex-end",
      gap: "3px", padding: "0 12px", pointerEvents: "none",
    }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          flex: 1, height: `${b.h}%`, borderRadius: "3px 3px 0 0",
          background: b.color,
          opacity: 0.55,
          animation: `barPulse ${b.dur}s ${b.delay}s ease-in-out infinite alternate`,
          boxShadow: `0 0 6px ${b.color}88`,
        }} />
      ))}
    </div>
  );
}

// ─── Ticker strip ─────────────────────────────────────────────────────────────
const TICKERS = [
  { sym: "AAPL", val: "+2.4%", up: true },
  { sym: "TSLA", val: "-1.8%", up: false },
  { sym: "NVDA", val: "+5.1%", up: true },
  { sym: "MSFT", val: "+0.9%", up: true },
  { sym: "AMZN", val: "-0.6%", up: false },
  { sym: "GOOGL", val: "+1.7%", up: true },
  { sym: "META", val: "+3.2%", up: true },
  { sym: "BTC",  val: "+4.8%", up: true },
  { sym: "ETH",  val: "-2.1%", up: false },
  { sym: "SPY",  val: "+0.4%", up: true },
];

function TickerStrip() {
  const doubled = [...TICKERS, ...TICKERS];
  return (
    <div style={{
      overflow: "hidden", width: "100%",
      borderTop: "1px solid rgba(0,163,255,0.15)",
      borderBottom: "1px solid rgba(0,163,255,0.15)",
      background: "rgba(0,0,0,0.18)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        display: "flex", gap: "0",
        animation: "tickerScroll 22s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 24px",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: "#C9D1E2", fontSize: "12px", fontWeight: 800, letterSpacing: "0.05em" }}>{t.sym}</span>
            <span style={{
              color: t.up ? "#00FF87" : "#FF3D5A",
              fontSize: "12px", fontWeight: 700,
            }}>{t.val}</span>
            {t.up
              ? <TrendingUp size={11} color="#00FF87" />
              : <TrendingUp size={11} color="#FF3D5A" style={{ transform: "scaleY(-1)" }} />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UnauthenticatedHome() {
  const [prizePool, setPrizePool] = useState(125000);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 34, seconds: 12 });
  const [activePlayers] = useState(2847 + Math.floor(Math.random() * 200));

  useEffect(() => {
    const i = setInterval(() => setPrizePool(p => p + Math.random() * 40), 3000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      color: "#C9D1E2",
      overflowX: "hidden",
    }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* Deep gradient layers */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(160deg, #0A2952 0%, #0C3060 35%, #102868 60%, #0B2050 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,163,255,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 40% at 80% 60%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 40% 30% at 10% 70%, rgba(0,255,135,0.07) 0%, transparent 60%)",
        }} />

        {/* Live chart in background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          opacity: 0.35,
        }}>
          <LiveChartCanvas />
          <VolatilityBars />
        </div>

        {/* Dim vignette at bottom so text is readable */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, rgba(10,32,70,0.85), transparent)",
          pointerEvents: "none",
        }} />

        {/* Ticker strip at very top */}
        <div style={{ position: "relative", zIndex: 2, marginTop: "64px" }}>
          <TickerStrip />
        </div>

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 3,
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "clamp(40px,8vw,80px) 20px 60px",
          textAlign: "center",
        }}>

          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,255,135,0.05))",
            border: "1px solid rgba(0,255,135,0.35)",
            borderRadius: "30px", padding: "7px 18px",
            marginBottom: "28px", fontSize: "13px", fontWeight: 800,
            color: "#00FF87",
            boxShadow: "0 0 20px rgba(0,255,135,0.15)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#00FF87",
              boxShadow: "0 0 6px #00FF87",
              animation: "livePulse 1.4s ease-in-out infinite",
              display: "inline-block", flexShrink: 0,
            }} />
            <Flame size={14} />
            {activePlayers.toLocaleString()} traders online now
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: "clamp(38px, 9vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: "20px",
            letterSpacing: "-0.03em",
            maxWidth: "900px",
          }}>
            <span style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #C9D1E2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Trade Stocks.</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #00C8FF 0%, #0090E0 50%, #7B5CF6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(0,163,255,0.4))",
            }}>Win Real Cash.</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 3.5vw, 21px)",
            color: "#8BADE0",
            marginBottom: "44px",
            maxWidth: "580px",
            lineHeight: 1.55,
          }}>
            Compete in real-time trading tournaments using live market data.{" "}
            <span style={{ color: "#00C8FF", fontWeight: 700 }}>No experience needed.</span>
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <Link href="/signup">
              <button style={{
                padding: "17px 44px",
                background: "linear-gradient(135deg, #00A3FF, #0070E0)",
                border: "none", borderRadius: "14px",
                color: "#fff", fontSize: "17px", fontWeight: 900,
                cursor: "pointer", letterSpacing: "0.01em",
                boxShadow: "0 0 32px rgba(0,163,255,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                transition: "all 0.18s",
                display: "inline-flex", alignItems: "center", gap: "10px",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 48px rgba(0,163,255,0.55), 0 8px 24px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(0,163,255,0.4), 0 4px 16px rgba(0,0,0,0.3)"; }}
              >
                <Zap size={18} fill="currentColor" /> Start Playing Free
              </button>
            </Link>
            <Link href="/login">
              <button style={{
                padding: "17px 36px",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.18)",
                borderRadius: "14px",
                color: "#C9D1E2", fontSize: "17px", fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                Sign In
              </button>
            </Link>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: <Sparkles size={14} />, text: "$10k virtual to start", color: "#00A3FF" },
              { icon: <Zap size={14} fill="currentColor" />, text: "Live market data", color: "#00FF87" },
              { icon: <Trophy size={14} />, text: "Real cash prizes", color: "#E3B341" },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "30px", padding: "7px 16px",
                fontSize: "13px", fontWeight: 600,
                color: f.color, backdropFilter: "blur(6px)",
              }}>
                {f.icon} {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL + COUNTDOWN ── */}
      <section style={{ padding: "0 20px 70px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(0,163,255,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1.5px solid rgba(0,163,255,0.25)",
          borderRadius: "24px",
          padding: "clamp(28px,6vw,52px) clamp(20px,5vw,40px)",
          textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,163,255,0.08)",
        }}>
          <div style={{
            position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
            width: "500px", height: "300px",
            background: "radial-gradient(ellipse, rgba(0,163,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "16px",
          }}>
            <Trophy size={28} color="#E3B341" style={{ filter: "drop-shadow(0 0 8px rgba(227,179,65,0.5))" }} />
            <h2 style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: 800, color: "#C9D1E2", margin: 0 }}>
              Total Prize Pool This Month
            </h2>
          </div>
          <div style={{
            fontSize: "clamp(44px,12vw,80px)", fontWeight: 900,
            background: "linear-gradient(135deg, #00C8FF, #0080E0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "32px", letterSpacing: "-0.03em",
            filter: "drop-shadow(0 0 24px rgba(0,163,255,0.3))",
          }}>
            ${prizePool.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>

          <div style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            background: "rgba(0,255,135,0.08)",
            border: "1.5px solid rgba(0,255,135,0.25)",
            borderRadius: "16px", padding: "16px 32px",
            boxShadow: "0 0 24px rgba(0,255,135,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#00FF87", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              <Clock size={14} /> Next Tournament Starts In
            </div>
            <div style={{
              fontSize: "clamp(28px,8vw,40px)", fontWeight: 900,
              color: "#00FF87", fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(0,255,135,0.4)",
            }}>
              {String(countdown.hours).padStart(2,"0")}:{String(countdown.minutes).padStart(2,"0")}:{String(countdown.seconds).padStart(2,"0")}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "20px 20px 80px", maxWidth: "1160px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <h2 style={{
            fontSize: "clamp(26px,6vw,42px)", fontWeight: 900, color: "#F1F5F9",
            letterSpacing: "-0.02em", marginBottom: "12px",
          }}>How It Works</h2>
          <p style={{ color: "#6B8CB0", fontSize: "16px" }}>Three steps to your first cash win</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {[
            {
              step: "01", icon: <Users size={26} />, title: "Join a Tournament",
              desc: "Pick from daily tournaments with different buy-ins and prize pools. New ones start all day, every day.",
              color: "#00A3FF", glow: "rgba(0,163,255,0.2)", border: "rgba(0,163,255,0.3)",
              bg: "linear-gradient(135deg, rgba(0,163,255,0.1) 0%, rgba(0,163,255,0.03) 100%)",
            },
            {
              step: "02", icon: <TrendingUp size={26} />, title: "Trade Stocks",
              desc: "Buy and sell real stocks with live market data. Trade as much as you want with your virtual balance.",
              color: "#00FF87", glow: "rgba(0,255,135,0.2)", border: "rgba(0,255,135,0.3)",
              bg: "linear-gradient(135deg, rgba(0,255,135,0.1) 0%, rgba(0,255,135,0.03) 100%)",
            },
            {
              step: "03", icon: <Trophy size={26} />, title: "Win Cash Prizes",
              desc: "Top performers win real money. The more profit you make, the bigger your payout.",
              color: "#E3B341", glow: "rgba(227,179,65,0.2)", border: "rgba(227,179,65,0.3)",
              bg: "linear-gradient(135deg, rgba(227,179,65,0.1) 0%, rgba(227,179,65,0.03) 100%)",
            },
          ].map((c, i) => (
            <div key={i} style={{
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              borderRadius: "22px", padding: "clamp(24px,5vw,38px)",
              position: "relative", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${c.glow}`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div style={{
                position: "absolute", top: "16px", right: "20px",
                fontSize: "56px", fontWeight: 900, color: c.color,
                opacity: 0.08, letterSpacing: "-0.04em", lineHeight: 1,
              }}>{c.step}</div>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: `linear-gradient(135deg, ${c.color}33, ${c.color}11)`,
                border: `1px solid ${c.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "20px", color: c.color,
                boxShadow: `0 0 16px ${c.glow}`,
              }}>{c.icon}</div>
              <div style={{ fontSize: "12px", color: c.color, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Step {c.step}</div>
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#F1F5F9", marginBottom: "12px", letterSpacing: "-0.01em" }}>{c.title}</h3>
              <p style={{ fontSize: "15px", color: "#7090B0", lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "0 20px 80px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,163,255,0.06) 100%)",
          border: "1.5px solid rgba(0,163,255,0.18)",
          borderRadius: "24px",
          padding: "clamp(32px,6vw,56px) clamp(20px,5vw,40px)",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,163,255,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: 800, color: "#F1F5F9", marginBottom: "44px", letterSpacing: "-0.02em" }}>
            Join Thousands of Traders
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "40px", position: "relative" }}>
            {[
              { val: "$125K+", label: "Paid Out Monthly", color: "#00C8FF" },
              { val: "10K+",   label: "Active Traders",    color: "#00FF87" },
              { val: "Daily",  label: "New Tournaments",   color: "#A78BFA" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontSize: "clamp(34px,9vw,52px)", fontWeight: 900,
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}99)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  marginBottom: "10px", letterSpacing: "-0.03em",
                  filter: `drop-shadow(0 0 12px ${s.color}55)`,
                }}>{s.val}</div>
                <div style={{ fontSize: "14px", color: "#6B8CB0", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAME MODES ── */}
      <section style={{ padding: "0 20px 80px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "clamp(24px,6vw,38px)", fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "10px" }}>
            Two Ways to Play
          </h2>
          <p style={{ color: "#6B8CB0", fontSize: "15px" }}>Pick your battle style</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            {
              icon: "🏆", title: "Tournaments", badge: "Most Popular",
              badgeColor: "#E3B341", badgeBg: "rgba(227,179,65,0.15)",
              desc: "Multi-player competitions. Pick a buy-in, outlast the field, collect your share of the pot.",
              color: "#00A3FF", border: "rgba(0,163,255,0.3)",
              bg: "linear-gradient(135deg, rgba(0,163,255,0.1), rgba(0,163,255,0.03))",
            },
            {
              icon: "⚡", title: "Blitz Mode", badge: "1v1",
              badgeColor: "#8B5CF6", badgeBg: "rgba(139,92,246,0.15)",
              desc: "5-minute 1v1 duels. Instant matchmaking. Highest portfolio at the buzzer wins.",
              color: "#8B5CF6", border: "rgba(139,92,246,0.3)",
              bg: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.03))",
            },
          ].map((m, i) => (
            <div key={i} style={{
              background: m.bg, border: `1.5px solid ${m.border}`,
              borderRadius: "22px", padding: "clamp(24px,5vw,36px)",
              position: "relative",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${m.border}`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "40px" }}>{m.icon}</span>
                <span style={{
                  padding: "4px 12px", borderRadius: "20px",
                  background: m.badgeBg, color: m.badgeColor,
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em",
                }}>{m.badge}</span>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#F1F5F9", marginBottom: "10px" }}>{m.title}</h3>
              <p style={{ fontSize: "14px", color: "#6B8CB0", lineHeight: 1.6 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "0 20px 100px", maxWidth: "780px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(0,163,255,0.14) 0%, rgba(139,92,246,0.1) 100%)",
          border: "1.5px solid rgba(0,163,255,0.3)",
          borderRadius: "28px",
          padding: "clamp(36px,7vw,64px) clamp(24px,5vw,48px)",
          position: "relative", overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,163,255,0.08)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,163,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🚀</div>
          <h2 style={{
            fontSize: "clamp(28px,7vw,46px)", fontWeight: 900,
            color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: "16px",
            position: "relative",
            textShadow: "0 0 40px rgba(0,163,255,0.3)",
          }}>
            Ready to Start Trading?
          </h2>
          <p style={{ fontSize: "17px", color: "#7B9EC4", marginBottom: "40px", position: "relative", lineHeight: 1.6 }}>
            Create your free account and join your first tournament today.
          </p>
          <Link href="/signup">
            <button style={{
              padding: "18px 52px",
              background: "linear-gradient(135deg, #00A3FF, #0070E0)",
              border: "none", borderRadius: "16px",
              color: "#fff", fontSize: "18px", fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(0,163,255,0.4), 0 8px 24px rgba(0,0,0,0.3)",
              transition: "all 0.18s", position: "relative",
              display: "inline-flex", alignItems: "center", gap: "10px",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 60px rgba(0,163,255,0.55), 0 12px 32px rgba(0,0,0,0.3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(0,163,255,0.4), 0 8px 24px rgba(0,0,0,0.3)"; }}
            >
              Get Started Free <Sparkles size={20} />
            </button>
          </Link>
          <div style={{ marginTop: "20px", fontSize: "13px", color: "#4B6A8A", position: "relative" }}>
            No credit card required · Free forever · Win real money
          </div>
        </div>
      </section>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes barPulse {
          0%   { opacity: 0.35; }
          100% { opacity: 0.75; }
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
