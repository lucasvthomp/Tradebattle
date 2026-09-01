import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { TradebattleIcon } from "@/components/tradebattle-icons";
import { useAuth } from "@/hooks/use-auth";
import "./hub.css";

function computeLevel(wins: number, trades: number) {
  const xp = wins * 120 + trades * 8;
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const currentLevelXP = Math.pow(level - 1, 2) * 40;
  const nextLevelXP = Math.pow(level, 2) * 40;
  const progress = nextLevelXP === currentLevelXP
    ? 100
    : Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  return { level, xp, progress: Math.min(progress, 100) };
}

function getRankTitle(level: number) {
  if (level >= 50) return { title: "Legend", color: "#ef8f9a" };
  if (level >= 30) return { title: "Elite", color: "#67e7bf" };
  if (level >= 20) return { title: "Expert", color: "#9bd2bd" };
  if (level >= 12) return { title: "Veteran", color: "#71d8bf" };
  if (level >= 6) return { title: "Market Runner", color: "#67e7bf" };
  return { title: "Rookie", color: "#91a6ba" };
}

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
  const { level, xp, progress } = computeLevel(wins, trades);
  const { title: rankTitle, color: rankColor } = getRankTitle(level);
  const balance = (Number(user?.siteCash) || 0).toFixed(2);
  const tagline = activeTournaments.length > 0
    ? `${activeTournaments.length} arena${activeTournaments.length > 1 ? "s" : ""} live now`
    : "Choose your next mode.";
  const ctaHref = activeTournaments.length > 0 ? "/dashboard" : "/tournaments";
  const ctaLabel = activeTournaments.length > 0 ? "Open live arena" : "Scout arenas";

  const stats = [
    { label: "Buying power", value: `$${balance}`, detail: "Virtual balance", color: "#67e7bf" },
    { label: "Tournament wins", value: String(wins), detail: "Career record", color: "#71d8bf" },
    { label: "Live arenas", value: String(activeTournaments.length), detail: "Open right now", color: "#f2c76a" },
    { label: "Total reps", value: String(trades), detail: "Trades logged", color: "#9ab5c2" },
  ];

  return (
    <div className="hub-screen">
      <div className="hub-shell">
        <motion.header className="hub-topbar" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35 }}>
          <div>
            <p className="hub-kicker">HOME BASE</p>
            <h1 className="hub-title">Welcome back, {user?.username ?? "player"}.</h1>
            <p className="hub-subtitle">{tagline}</p>
          </div>
          <div className="hub-top-actions">
            <span className="hub-rank-chip">{rankTitle} · LV.{level}</span>
          </div>
        </motion.header>

        <motion.section className="hub-feature-banner" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.04 }}>
          <div className="hub-feature-copy">
            <p className="hub-feature-kicker"><span className="hub-live-dot" /> LIVE BOARD</p>
            <h2>{activeTournaments.length ? "The board is moving." : "Your next run starts here."}</h2>
            <p>Choose your pressure level.</p>
            <button type="button" className="hub-feature-action" onClick={() => navigate(ctaHref)}>
              {ctaLabel}<ArrowUpRight size={15} />
            </button>
          </div>
        </motion.section>

        <motion.section className="hub-stat-grid" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35, delay: 0.06 }} aria-label="Player stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hub-stat-card" style={{ "--stat-color": stat.color } as React.CSSProperties}>
              <span className="hub-stat-label">{stat.label}</span>
              <strong className="hub-stat-value">{stat.value}</strong>
              <span className="hub-stat-detail">{stat.detail}</span>
            </div>
          ))}
        </motion.section>

        <div className="hub-main-grid">
          <motion.section className="hub-panel hub-market-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.12 }}>
            <div className="hub-panel-heading">
              <div><h2>Market pulse</h2><p>Read the rhythm before you choose a mode.</p></div>
              <TradebattleIcon name="market" size={18} style={{ color: "#20d8c2" }} />
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
                <span className="hub-launch-icon gold"><TradebattleIcon name="arena" size={18} /></span>
                <span className="hub-launch-copy"><strong>Arenas</strong><span>Compete for the prize pool · {activeTournaments.length} live</span></span>
                <ChevronRight className="hub-launch-arrow" size={16} />
              </Link>
              <Link href="/blitz" className="hub-launch-card">
                <span className="hub-launch-icon purple"><TradebattleIcon name="blitz" size={18} /></span>
                <span className="hub-launch-copy"><strong>Blitz</strong><span>1v1 rounds · 5 minutes · instant</span></span>
                <ChevronRight className="hub-launch-arrow" size={16} />
              </Link>
            </div>
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
            <div className="hub-progress-body" style={{ "--rank-color": rankColor } as React.CSSProperties}>
              <div className="hub-progress-head"><strong className="hub-progress-rank">{rankTitle}</strong><span className="hub-progress-level">LEVEL {level}</span></div>
              <div className="hub-progress-bar"><span style={{ width: `${progress}%` }} /></div>
              <div className="hub-progress-copy"><span>{xp} XP banked</span><span>{progress}% to next level</span></div>
              <div className="hub-progress-metrics"><div className="hub-progress-metric"><span>Wins</span><strong>{wins}</strong></div><div className="hub-progress-metric"><span>Reps</span><strong>{trades}</strong></div></div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
