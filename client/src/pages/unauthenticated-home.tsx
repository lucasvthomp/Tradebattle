import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, BarChart3, Bell, ChevronRight, DollarSign, Flag, LayoutGrid, ShieldCheck, Timer, TrendingUp } from "lucide-react";
import { type ReactNode } from "react";
import "./unauthenticated-home.css";

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
  { number: "01", icon: <LayoutGrid aria-hidden="true" /> title: "Choose your arena", body: "Enter an open arena or go head-to-head in Blitz." },
  { number: "02", icon: <TrendingUp aria-hidden="true" /> title: "Trade the board", body: "Build your positions with live market data and virtual capital." },
  { number: "03", icon: <Flag aria-hidden="true" /> title: "Take the win", body: "Finish above the field when the clock hits zero." },
];

const modes = [
  {
    className: "mode-tournament",
    icon: <BarChart3 aria-hidden="true" />,
    label: "MULTIPLAYER",
    title: "Arenas",
    body: "The full field experience. Read the market, make your move, and climb the board.",
    stats: ["Open field", "Free entry"],
    link: "Enter arenas"
  },
  {
    className: "mode-blitz",
    icon: <Timer aria-hidden="true" />,
    label: "HEAD-TO-HEAD",
    title: "Blitz",
    body: "A fast, focused matchup. Five minutes on the clock and one opponent to beat.",
    stats: ["1v1 match", "5 min rounds"],
    link: "Play Blitz"
  },
];

const promoCards = [
  {
    href: "/tournaments",
    className: "promo-arena",
    label: "MULTIPLAYER",
    title: "Take the field",
    body: "Join an open arena and outplay the board.",
    cta: "Enter arenas"
  },
  {
    href: "/blitz",
    className: "promo-blitz",
    label: "HEAD-TO-HEAD",
    title: "Beat the clock",
    body: "Five minutes. One rival. Make it count.",
    cta: "Play Blitz"
  },
  {
    href: "/shop",
    className: "promo-rewards",
    label: "PLAYER REWARDS",
    title: "Stack your edge",
    body: "Unlock perks for your next run.",
    cta: "Visit rewards"
  },
];

export default function UnauthenticatedHome() {

  return (
    <main className="arena-page">
      <section className="arena-hero arena-hero-simple" aria-labelledby="arena-hero-title">
        <MarketChartBackground />

        <div className="arena-shell">
          <div className="arena-hero-layout">
            <div className="arena-copy">
              <p className="arena-eyebrow"><Swords size={15} aria-hidden="true" /> PAPER TRADING / COMPETITIVE PLAY</p>
              <h1 id="arena-hero-title">Trade the market.<br /><em>Play to win.</em></h1>
              <p className="arena-lede">Build a virtual portfolio, make your read, and compete for the top of the rankings.</p>
              <div className="arena-actions">
                <Link href="/login" className="arena-primary-link">Log in <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link href="/signup" className="arena-secondary-link">Sign up <ChevronRight size={17} aria-hidden="true" /></Link>
              </div>
              <div className="arena-reassurance"><ShieldCheck size={16} aria-hidden="true" /> Virtual cash only · No deposits required</div>
            </div>

            <div className="arena-hero-signal" aria-label="A simulated market chart">
              <div className="arena-signal-top"><span>TRADEBATTLE / MARKET BOARD</span><span>SIMULATED</span></div>
              <div className="arena-signal-plot">
                <svg viewBox="0 0 620 280" preserveAspectRatio="none" role="presentation">
                  <path className="arena-signal-grid" d="M0 50H620M0 110H620M0 170H620M0 230H620M80 0V280M200 0V280M320 0V280M440 0V280M560 0V280" />
                  <path className="arena-signal-line" d="M0 214C38 207 52 222 82 194S129 154 158 176s35 44 68 22 42-84 75-55 42 63 76 43 43-77 78-57 42 57 77 30 42-61 77-42 36 30 51 12" />
                  <circle className="arena-signal-dot" cx="610" cy="117" r="5" />
                </svg>
              </div>
              <div className="arena-signal-caption">
                <span><TrendingUp size={15} aria-hidden="true" /> Read the tape</span>
                <span><Trophy size={15} aria-hidden="true" /> Climb the rankings</span>
              </div>
            </div>
          </div>

          <div className="arena-hero-proof" aria-label="How Tradebattle works">
            <div><span>01</span><strong>Choose a format</strong><small>Arenas or Blitz</small></div>
            <div><span>02</span><strong>Trade the board</strong><small>Virtual market data</small></div>
            <div><span>03</span><strong>Make your run</strong><small>Build your record</small></div>
          </div>
        </div>
      </section>

      <section className="arena-promo-rail" aria-labelledby="promo-title">
        <div className="arena-promo-heading">
          <div><p>THE TRADEBATTLE ARCADE</p><h2 id="promo-title">Choose your next move.</h2></div>
          <span>Three ways in.</span>
        </div>
        <div className="arena-promo-grid">
          {promoCards.map((card) => (
            <Link key={card.title} href={card.href} className={`arena-promo-card ${card.className}`}>
              <div className="arena-promo-copy">
                <span className="arena-promo-label">{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <strong>{card.cta}<ArrowRight size={15} aria-hidden="true" /></strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="arena-collectibles" aria-labelledby="collectibles-title">
        <div className="arena-collectibles-copy">
          <p>BUILD YOUR KIT</p>
          <h2 id="collectibles-title">Read the board. Bring the right energy.</h2>
        </div>
        <div className="arena-collectibles-items">
          <div className="arena-collectible"><TrendingUp size={18} aria-hidden="true" /><span>Read</span></div>
          <div className="arena-collectible"><ArrowUpRight size={18} aria-hidden="true" /><span>React</span></div>
          <div className="arena-collectible"><DollarSign size={18} aria-hidden="true" /><span>Stack</span></div>
          <div className="arena-collectible"><BarChart3 size={18} aria-hidden="true" /><span>Win</span></div>
          <div className="arena-collectible"><Bell size={18} aria-hidden="true" /><span>Ring in</span></div>
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
