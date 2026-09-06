import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FaArrowUpRightFromSquare, FaBolt, FaChartColumn, FaChevronRight, FaTrophy } from "react-icons/fa6";
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
            <stop offset="0%" stopColor="#f6c453" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f6c453" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="hub-chart-grid" d="M0 48H720M0 102H720M0 156H720M0 210H720M90 0V260M210 0V260M330 0V260M450 0V260M570 0V260M690 0V260" />
        <path className="hub-chart-area" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20v197H0Z" />
        <path className="hub-chart-glow" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20" />
        <path className="hub-chart-line" d="M0 206C31 196 49 204 73 184S116 131 144 152s41 54 69 35 40-91 74-67 35 46 66 27 47-94 80-67 49 86 80 55 49-96 81-75 54 42 80 23 42-34 46-20" />
        <circle className="hub-chart-dot" cx="674" cy="90" r="6" />
        <g transform="translate(594 45)">
          <rect className="hub-chart-tag" width="84" height="25" rx="6" />
          <text className="hub-chart-tag-text" x="12" y="16">MARKET READ</text>
        </g>
      </svg>
    </div>
  );
}

export default function Hub() {
  const { user } = useAuth();
  const { data: tournamentsData } = useQuery({ queryKey: ["/api/tournaments"] });
  const activeTournaments = (tournamentsData as any)?.data?.filter((t: any) => t.status === "active") || [];

  const wins = Number(user?.tournamentWins || 0);
  const trades = Number(user?.totalTrades || 0);
  const balance = Number(user?.siteCash || 0);
  const momentumUp = wins > 0;

  const overviewItems = [
    { label: "Tournaments", value: String(activeTournaments.length), note: "Open now", tone: "#f2c76a" },
    { label: "Buying power", value: `$${balance.toFixed(2)}`, note: "Arena cash", tone: "#f6c453" },
    { label: "Record", value: `${wins} win${wins === 1 ? "" : "s"}`, note: "Tournament wins", tone: "#9bd2bd" },
    { label: "Momentum", value: momentumUp ? `+${wins} win${wins === 1 ? "" : "s"}` : "Flat", note: "Your current run", tone: momentumUp ? "#f6c453" : "#b9acd6" },
  ];

  return (
    <div className="hub-screen">
      <div className="hub-shell">
        <motion.header className="hub-topbar" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35 }}>
          <div>
            <p className="hub-kicker">YOUR PLAYGROUND</p>
            <h1 className="hub-title">Ready when you are, {user?.username ?? "player"}.</h1>
          </div>
          <Link href="/tournaments" className="hub-outline-action">
            Find a match <FaArrowUpRightFromSquare size={14} />
          </Link>
        </motion.header>

        <motion.section className="hub-overview-bar" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.35, delay: 0.03 }} aria-label="Player overview">
          {overviewItems.map((item) => (
            <div key={item.label} className="hub-overview-item">
              <span className="hub-overview-label">{item.label}</span>
              <strong className="hub-overview-value" style={{ color: item.tone }}>{item.value}</strong>
              <span className="hub-overview-note">{item.note}</span>
            </div>
          ))}
        </motion.section>

        <motion.section className="hub-feature-banner" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.06 }}>
          <div className="hub-feature-copy">
            <p className="hub-feature-kicker"><span className="hub-live-dot" /> YOUR NEXT PLAY</p>
            <h2>{activeTournaments.length > 0 ? "Jump into a match." : "Pick your mode."}</h2>
            <p>Choose a room, make a move, and see how you stack up.</p>
            <Link href="/tournaments" className="hub-feature-action">
              {activeTournaments.length > 0 ? "Join a match" : "Pick an arena"} <FaArrowUpRightFromSquare size={14} />
            </Link>
          </div>
        </motion.section>

        <div className="hub-main-grid">
          <motion.section className="hub-panel hub-market-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.12 }}>
            <div className="hub-panel-heading">
              <div><h2>Quick market peek</h2><p>See what is moving before you play.</p></div>
              <FaChartColumn size={18} style={{ color: "#f6c453" }} />
            </div>
            <div className="hub-market-readout"><strong className="hub-market-number">Market</strong><span className="hub-market-change">SIMULATED</span></div>
            <HubMarketChart />
            <div className="hub-chart-footer"><span>Preview feed</span><span>5 MIN</span><span>Simulated feed</span></div>
          </motion.section>

          <motion.section className="hub-panel hub-launch-panel" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.18 }}>
            <div className="hub-panel-heading">
              <div><h2>Pick a match</h2><p>Two ways to play.</p></div>
              <span className="hub-panel-label">Play</span>
            </div>
            <div className="hub-launch-list">
              <Link href="/tournaments" className="hub-launch-card">
                <span className="hub-launch-icon gold"><FaTrophy size={18} /></span>
                <span className="hub-launch-copy"><strong>Arenas</strong><span>Play the field</span></span>
                <img className="hub-launch-art hub-launch-art-arena" src="/assets/tradebattle-chest-trophy-v2.png" alt="" aria-hidden="true" />
                <FaChevronRight className="hub-launch-arrow" size={14} />
              </Link>
              <Link href="/blitz" className="hub-launch-card">
                <span className="hub-launch-icon purple"><FaBolt size={18} /></span>
                <span className="hub-launch-copy"><strong>Blitz</strong><span>Race the clock</span></span>
                <img className="hub-launch-art hub-launch-art-blitz" src="/assets/tradebattle-chest-exchange-v2.png" alt="" aria-hidden="true" />
                <FaChevronRight className="hub-launch-arrow" size={14} />
              </Link>
            </div>
          </motion.section>
        </div>

        <motion.section className="hub-panel hub-live-panel hub-live-panel-full" variants={fadeIn} initial="initial" animate="animate" transition={{ duration: 0.4, delay: 0.24 }}>
          <div className="hub-panel-heading">
            <div><h2>Open now</h2><p>Jump into a match.</p></div>
            {activeTournaments.length > 0 && <span className="hub-live-chip"><span className="hub-live-dot" />Live</span>}
          </div>
          {activeTournaments.length > 0 ? (
            <div className="hub-live-list">
              {activeTournaments.slice(0, 4).map((t: any) => (
                <Link key={t.id} href={`/tournament/${t.id}`} className="hub-live-row">
                  <span />
                  <span className="hub-live-name">{t.name}</span>
                  <span className="hub-live-count">{t.participantCount || 0}/{t.maxPlayers}</span>
                  <FaChevronRight size={14} />
                </Link>
              ))}
              {activeTournaments.length > 4 && <Link href="/tournaments" className="hub-outline-action">See all arenas <FaArrowUpRightFromSquare size={14} /></Link>}
            </div>
          ) : (
            <div className="hub-empty-state"><strong>Nothing live yet.</strong><p>Check the upcoming arenas.</p><Link href="/tournaments">See upcoming matches →</Link></div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
