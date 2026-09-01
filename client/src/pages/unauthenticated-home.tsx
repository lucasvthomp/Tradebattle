import { Link } from "wouter";
import { ArrowRight, ChevronRight, Crown, ShieldCheck, Swords, Target, Timer, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import "./unauthenticated-home.css";

const formatTime = (total: number) => [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
  .map((part) => String(part).padStart(2, "0"))
  .join(":");

const marketPath = "M-30 348 C18 326 47 360 86 330 S143 286 184 314 S227 350 273 306 S330 266 370 292 S416 320 456 277 S506 251 544 272 S582 326 621 294 S664 242 704 261 S744 312 786 279 S833 227 875 245 S912 287 953 260 S1002 214 1041 236 S1074 278 1116 248 S1160 195 1203 218 S1245 259 1286 226 S1330 178 1371 202 S1426 174 1470 188";

function MarketChartBackground() {
  return (
    <div className="market-chart-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 620" preserveAspectRatio="none" role="presentation">
        <defs>
          <linearGradient id="market-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#67e7bf" stopOpacity="0.22" />
            <stop offset="0.62" stopColor="#67e7bf" stopOpacity="0.04" />
            <stop offset="1" stopColor="#67e7bf" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="market-line-glow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#4b9fcb" stopOpacity="0.2" />
            <stop offset="0.48" stopColor="#67e7bf" stopOpacity="0.92" />
            <stop offset="1" stopColor="#b2ffe7" stopOpacity="0.74" />
          </linearGradient>
          <filter id="market-line-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g className="market-chart-guides">
          <path d="M0 102 H1440 M0 210 H1440 M0 318 H1440 M0 426 H1440 M0 534 H1440" />
          <path d="M126 0 V620 M348 0 V620 M570 0 V620 M792 0 V620 M1014 0 V620 M1236 0 V620" />
        </g>

        <path className="market-chart-shadow" pathLength={1} d={marketPath} />
        <path className="market-chart-area" d={`${marketPath} V620 H-30 Z`} />
        <path className="market-chart-line" pathLength={1} d={marketPath} />
        <path className="market-chart-highlight" d={marketPath} />
        <circle className="market-chart-node" cx="1116" cy="248" r="5" />
      </svg>
    </div>
  );
}

function PrimaryLink({ children, href = "/signup" }: { children: ReactNode; href?: string }) {
  return <Link href={href} className="arena-primary-link">{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

const steps = [
  { number: "01", icon: <Swords aria-hidden="true" />, title: "Choose your arena", body: "Enter an open arena or go head-to-head in Blitz." },
  { number: "02", icon: <TrendingUp aria-hidden="true" />, title: "Trade the board", body: "Build your positions with live market data and virtual capital." },
  { number: "03", icon: <Crown aria-hidden="true" />, title: "Take the win", body: "Finish above the field when the clock hits zero." },
];

const modes = [
  {
    className: "mode-tournament",
    icon: <Trophy aria-hidden="true" />,
    label: "MULTIPLAYER",
    title: "Arenas",
    body: "The full field experience. Read the market, make your move, and climb the board.",
    stats: ["Open field", "Free entry"],
    link: "Enter arenas",
  },
  {
    className: "mode-blitz",
    icon: <Zap aria-hidden="true" />,
    label: "HEAD-TO-HEAD",
    title: "Blitz",
    body: "A fast, focused matchup. Five minutes on the clock and one opponent to beat.",
    stats: ["1v1 match", "5 min rounds"],
    link: "Play Blitz",
  },
];

export default function UnauthenticatedHome() {
  const [seconds, setSeconds] = useState(2 * 60 * 60 + 34 * 60 + 12);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => current > 0 ? current - 1 : 3 * 60 * 60);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="arena-page">
      <section className="arena-hero" aria-labelledby="arena-hero-title">
        <MarketChartBackground />
        <div className="arena-glow arena-glow-one" aria-hidden="true" />
        <div className="arena-glow arena-glow-two" aria-hidden="true" />

        <div className="arena-shell">
          <div className="arena-status">
            <span className="arena-status-dot" aria-hidden="true" />
            <span>ARENA LIVE</span>
            <span className="arena-status-divider" aria-hidden="true" />
            <span className="arena-status-secondary">2,903 PLAYERS ONLINE</span>
          </div>

          <div className="arena-hero-layout">
            <div className="arena-copy">
              <p className="arena-eyebrow"><Swords size={15} aria-hidden="true" /> PAPER TRADING / COMPETITIVE PLAY</p>
              <h1 id="arena-hero-title">Trade smarter.<br /><em>Win the board.</em></h1>
              <p className="arena-lede">A live-market strategy game where every decision moves you up — or down — the rankings.</p>
              <div className="arena-actions">
                <PrimaryLink>Enter the arena</PrimaryLink>
                <Link href="/login" className="arena-secondary-link">I already play <ChevronRight size={17} aria-hidden="true" /></Link>
              </div>
              <div className="arena-reassurance"><ShieldCheck size={16} aria-hidden="true" /> Virtual cash only · $10,000 starting balance</div>
            </div>

            <aside className="match-card" aria-label="Next arena">
              <div className="match-card-top">
                <span className="match-live"><i aria-hidden="true" /> NEXT MATCH</span>
                <span className="match-level">OPEN</span>
              </div>

              <div className="match-title">
                <span className="match-trophy"><Trophy size={26} aria-hidden="true" /></span>
                <div><strong>Opening Bell</strong><small>Daily arena · Open field</small></div>
              </div>

              <div className="match-countdown">
                <span>STARTS IN</span>
                <strong>{formatTime(seconds)}</strong>
              </div>

              <div className="match-board">
                <div className="match-board-heading"><span>LIVE BOARD</span><span>VALUE</span></div>
                <div className="match-board-row"><span><Users size={16} aria-hidden="true" /> Players</span><strong>48 / 100</strong></div>
                <div className="match-board-row"><span><Target size={16} aria-hidden="true" /> Entry</span><strong>FREE</strong></div>
                <div className="match-board-row"><span><Crown size={16} aria-hidden="true" /> Prize pool</span><strong>$2,500</strong></div>
              </div>

              <Link href="/signup" className="match-join">Claim your spot <ArrowRight size={16} aria-hidden="true" /></Link>
            </aside>
          </div>

          <div className="arena-score-strip" aria-label="Arena stats">
            <div><span><TrendingUp size={16} aria-hidden="true" /> MARKET STATUS</span><strong className="positive">OPEN</strong></div>
            <div><span><Timer size={16} aria-hidden="true" /> ACTIVE ARENAS</span><strong>12</strong></div>
            <div><span><Trophy size={16} aria-hidden="true" /> PAID OUT THIS MONTH</span><strong>$125K+</strong></div>
          </div>
        </div>
      </section>

      <section className="arena-section arena-modes" id="modes" aria-labelledby="modes-title">
        <div className="arena-section-heading">
          <p>PICK YOUR FORMAT</p>
          <h2 id="modes-title">Two ways to play.</h2>
        </div>
        <div className="mode-grid">
          {modes.map((mode) => (
            <article className={`mode-card ${mode.className}`} key={mode.title}>
              <div className="mode-card-top"><span className="mode-label">{mode.label}</span><span className="mode-card-art">{mode.icon}</span></div>
              <h3>{mode.title}</h3>
              <p>{mode.body}</p>
              <div className="mode-stats">{mode.stats.map((stat) => <span key={stat}>{stat}</span>)}</div>
              <Link href="/signup" className="mode-link">{mode.link}<ArrowRight size={17} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="arena-section arena-how" id="how-it-works" aria-labelledby="how-title">
        <div className="arena-section-heading">
          <p>THE GAME LOOP</p>
          <h2 id="how-title">Ready. Set. Trade.</h2>
        </div>
        <div className="how-steps">
          {steps.map((step) => (
            <article className="how-step" key={step.number}>
              <span className="how-step-number">{step.number}</span>
              <span className="how-step-icon">{step.icon}</span>
              <div><h3>{step.title}</h3><p>{step.body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="arena-final" aria-labelledby="final-title">
        <div className="arena-final-content">
          <p><Zap size={15} aria-hidden="true" /> YOUR FIRST MATCH IS FREE</p>
          <h2 id="final-title">Make your first move.</h2>
          <PrimaryLink>Start playing free</PrimaryLink>
        </div>
      </section>
    </main>
  );
}
