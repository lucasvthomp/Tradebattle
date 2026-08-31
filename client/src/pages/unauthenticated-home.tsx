import { Link } from "wouter";
import { ArrowRight, ChevronRight, Crown, ShieldCheck, Swords, Target, Timer, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import "./unauthenticated-home.css";

const formatTime = (total: number) => [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
  .map((part) => String(part).padStart(2, "0"))
  .join(":");

function PrimaryLink({ children, href = "/signup" }: { children: ReactNode; href?: string }) {
  return <Link href={href} className="arena-primary-link">{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

const steps = [
  { number: "01", icon: <Swords aria-hidden="true" />, title: "Choose a format", body: "Enter an open tournament or go head-to-head in Blitz." },
  { number: "02", icon: <TrendingUp aria-hidden="true" />, title: "Trade the board", body: "Build your portfolio with live market data and virtual cash." },
  { number: "03", icon: <Crown aria-hidden="true" />, title: "Take the win", body: "Finish above the field when the clock hits zero." },
];

const modes = [
  {
    className: "mode-tournament",
    icon: <Trophy aria-hidden="true" />,
    label: "MULTIPLAYER",
    title: "Tournaments",
    body: "The full field experience. Read the market, make your move, and climb the board.",
    stats: ["Open field", "Free entry"],
    link: "Enter tournaments",
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
        <div className="arena-grid" aria-hidden="true" />
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
              <p className="arena-lede">A live-market strategy game where every decision moves you up — or down — the leaderboard.</p>
              <div className="arena-actions">
                <PrimaryLink>Enter the arena</PrimaryLink>
                <Link href="/login" className="arena-secondary-link">I have an account <ChevronRight size={17} aria-hidden="true" /></Link>
              </div>
              <div className="arena-reassurance"><ShieldCheck size={16} aria-hidden="true" /> Virtual cash only · $10,000 starting balance</div>
            </div>

            <aside className="match-card" aria-label="Next tournament">
              <div className="match-card-top">
                <span className="match-live"><i aria-hidden="true" /> NEXT MATCH</span>
                <span className="match-level">OPEN</span>
              </div>

              <div className="match-title">
                <span className="match-trophy"><Trophy size={26} aria-hidden="true" /></span>
                <div><strong>Opening Bell</strong><small>Daily tournament · Open field</small></div>
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
