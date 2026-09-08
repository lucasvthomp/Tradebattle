import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, ChevronRight, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import "./hub.css";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function HubMarketChart() {
  return (
    <div className="hub-chart" aria-label="Simulated market momentum chart">
      <svg viewBox="0 0 720 260" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="hubChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#20d8c2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#20d8c2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="hub-chart-grid" d="M0 48H720M0 102H720M0 156H720M0 210H720M90 0V260M210 0V260M330 0V260M450 0V260M570 0V260M690 0V260" />
        <path className="hub-chart-area" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20v197H0Z" />
        <path className="hub-chart-glow" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20" />
        <path className="hub-chart-line" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20" />
        <circle className="hub-chart-dot" cx="674" cy="90" r="6" />
        <g transform="translate(594 45)">
          <rect className="hub-chart-tag" width="84" height="25" rx="6" />
          <text className="hub-chart-tag-text" x="12" y="16">LIVE READ</text>
        </g>
      </svg>
    </div>
  );
}

export default function Hub() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: tournamentsData } = useQuery({ queryKey: ["/api/tournaments"] });
  const activeTournaments = (tournamentsData as any)?.data?.filter((t: any) => t.status === "active") || [];

  const wins = user?.tournamentWins || 0;
  const trades = user?.totalTrades || 0;
  const balance = (Number(user?.siteCash) || 0).toFixed(2);
  const ctaHref = activeTournaments.length > 0 ? "/dashboard" : "/tournaments";
  const ctaLabel = activeTournaments.length > 0 ? "Open live arena" : "Browse arenas";

  const stats = [
    { label: "Buying power", value: `$${balance}`, detail: "Virtual cash", color: "var(--hub-gold)" },
    { label: "Wins", value: String(wins), detail: "Tournament record", color: "var(--hub-purple-bright)" },
    { label: "Live arenas", value: String(activeTournaments.length), detail: "Open now", color: "var(--hub-gold)" },
    { label: "Trades", value: String(trades), detail: "Total moves", color: "var(--hub-purple-bright)" },
  ];

  return (
    <div className="hub-screen">
      <div className="hub-shell">
        <motion.header className="hub-topbar" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35 }}>
          <div>
            <p className="hub-kicker">HOME</p>
            <h1 className="hub-title">Welcome back, {user?.username ?? "player"}.</h1>
          </div>
          <div className="hub-top-actions">
            <button type="button" className="hub-top-play" onClick={() => navigate(ctaHref)}>{ctaLabel}<ArrowUpRight size={15} /></button>
          </div>
        </motion.header>

        <motion.section className="hub-overview-strip" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35, delay: 0.02 }} aria-label="Account overview">
          {stats.map((stat) => (
            <div key={stat.label} className="hub-overview-item">
              <span>{stat.label}</span>
              <strong style={{ color: stat.color }}>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          ))}
        </motion.section>

        <motion.section className="hub-feature-banner" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.04 }}>
          <div className="hub-feature-copy">
            <p className="hub-feature-kicker"><span className="hub-live-dot" /> FEATURED RUN</p>
            <h2>{activeTournaments.length ? "The board is moving." : "Pick your next match."}</h2>
            <p>Choose your format, read the board, and make the first move.</p>
            <button type="button" className="hub-feature-action" onClick={() => navigate(ctaHref)}>
              {ctaLabel}<ArrowUpRight size={15} />
            </button>
          </div>
          <img className="hub-feature-art" src="/assets/tradebattle-matchup-flat.png" alt="" aria-hidden="true" />
        </motion.section>

        <motion.section className="hub-ad-grid" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35, delay: 0.06 }} aria-label="Game modes">
          <Link href="/tournaments" className="hub-ad-card hub-ad-arena">
            <span className="hub-ad-label">ARENAS</span>
            <strong>Climb the board.</strong>
            <span>Longer runs. Bigger decisions.</span>
            <img src="/assets/tradebattle-badge-flat.png" alt="" aria-hidden="true" />
            <ArrowUpRight size={16} />
          </Link>
          <Link href="/blitz" className="hub-ad-card hub-ad-blitz">
            <span className="hub-ad-label">BLITZ</span>
            <strong>Five minutes. One rival.</strong>
            <span>Queue up and make it count.</span>
            <img src="/assets/tradebattle-matchup-flat.png" alt="" aria-hidden="true" />
            <ArrowUpRight size={16} />
          </Link>
        </motion.section>

        <div className="hub-main-grid">
          <motion.section className="hub-panel hub-market-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.12 }}>
            <div className="hub-panel-heading">
              <div><h2>Market pulse</h2><p>Read the rhythm before you choose a mode.</p></div>
              <BarChart3 size={18} style={{ color: "var(--hub-gold)" }} />
            </div>
            <div className="hub-market-readout"><strong className="hub-market-number">71.42</strong><span className="hub-market-change">+8.42%</span></div>
            <HubMarketChart />
            <div className="hub-chart-footer"><span>Momentum index</span><span>5M TAPE</span><span>Simulated feed</span></div>
          </motion.section>

          <motion.section className="hub-panel hub-launch-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.18 }}>
            <div className="hub-panel-heading">
              <div><h2>Quick launch</h2><p>Choose your pressure level.</p></div>
              <span className="hub-panel-label">Select mode</span>
            </div>
            <div className="hub-launch-list">
              <Link href="/tournaments" className="hub-launch-card">
                <span className="hub-launch-icon gold"><Trophy size={18} /></span>
                <span className="hub-launch-copy"><strong>Arenas</strong><span>Compete for the prize pool · {activeTournaments.length} live</span></span>
                <img className="hub-launch-art hub-launch-art-arena" src="/assets/tradebattle-badge-flat.png" alt="" aria-hidden="true" />
                <ChevronRight className="hub-launch-arrow" size={16} />
              </Link>
              <Link href="/blitz" className="hub-launch-card">
                <span className="hub-launch-icon purple"><Zap size={18} /></span>
                <span className="hub-launch-copy"><strong>Blitz</strong><span>1v1 rounds · 5 minutes · instant</span></span>
                <img className="hub-launch-art hub-launch-art-blitz" src="/assets/tradebattle-matchup-flat.png" alt="" aria-hidden="true" />
                <ChevronRight className="hub-launch-arrow" size={16} />
              </Link>
            </div>
            <div className="hub-launch-foot"><span className="hub-live-dot" />Virtual capital only. Your next round starts when you say go.</div>
          </motion.section>
        </div>

        <div className="hub-lower-grid">
          <motion.section className="hub-panel hub-live-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.24 }}>
            <div className="hub-panel-heading">
              <div><h2>Live arenas</h2><p>Open tables with room to make a move.</p></div>
              {activeTournaments.length > 0 && <span className="hub-live-chip"><span className="hub-live-dot" />Live</span>}
            </div>
            {activeTournaments.length > 0 ? (
              <div className="hub-live-list">
                {activeTournaments.slice(0, 4).map((t: any) => (
                  <Link key={t.id} href={`/tournament/${t.id}`} className="hub-live-row">
                    <span />
                    <span className="hub-live-name">{t.name}</span>
                    <span className="hub-live-count">{t.participantCount || 0}/{t.maxPlayers}</span>
                    <ChevronRight size={14} />
                  </Link>
                ))}
                {activeTournaments.length > 4 && <Link href="/tournaments" className="hub-outline-action">See all {activeTournaments.length} arenas <ArrowUpRight size={14} /></Link>}
              </div>
            ) : (
              <div className="hub-empty-state"><strong>No live arenas in your queue.</strong><p>There is always another table forming.</p><Link href="/tournaments">Browse upcoming arenas →</Link></div>
            )}
          </motion.section>

          <motion.section className="hub-panel hub-progress-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.3 }}>
            <div className="hub-panel-heading"><div><h2>Player trajectory</h2><p>Keep stacking clean decisions.</p></div><span className="hub-panel-label">Rank track</span></div>
            <div className="hub-progress-body">
              <div className="hub-progress-head"><strong className="hub-progress-rank">Your record</strong><span className="hub-progress-level">CURRENT RUN</span></div>
              <div className="hub-progress-metrics"><div className="hub-progress-metric"><span>Wins</span><strong>{wins}</strong></div><div className="hub-progress-metric"><span>Trades</span><strong>{trades}</strong></div></div>
              <Link href="/leaderboard" className="hub-outline-action hub-progress-link">View rankings <ArrowUpRight size={14} /></Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
