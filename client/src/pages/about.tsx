import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Swords, Trophy, Users } from "lucide-react";
import { Link } from "wouter";

const pillars = [
  {
    icon: Swords,
    eyebrow: "01 / COMPETE",
    title: "Make every decision count.",
    description: "Trade with a virtual balance, build a position, and see how your strategy holds up when the clock is running.",
  },
  {
    icon: BarChart3,
    eyebrow: "02 / IMPROVE",
    title: "Turn reps into instincts.",
    description: "Review your moves, compare performance, and build a repeatable process without risking real capital.",
  },
  {
    icon: Users,
    eyebrow: "03 / CONNECT",
    title: "Find your edge together.",
    description: "Join a competitive community, follow the rankings, and learn from the players you keep chasing.",
  },
];

const principles = [
  { label: "Virtual capital", value: "$10K" },
  { label: "Market data", value: "LIVE" },
  { label: "The goal", value: "SKILL" },
];

export default function About() {
  return (
    <div className="arena-page min-h-[calc(100dvh-4rem)] overflow-hidden">
      <section className="arena-shell about-hero">
        <div className="about-hero-copy">
          <div className="arena-kicker"><span className="arena-status-dot" /> Built for the next move</div>
          <h1>Trading is more fun when there&apos;s something to prove.</h1>
          <p>
            Tradebattle is a skill-first trading competition platform. Practice with virtual capital,
            compete in focused formats, and build the confidence to trust your process.
          </p>
          <div className="about-hero-actions">
            <Link href="/signup" className="arena-primary-link">Enter the arena <ArrowRight size={17} /></Link>
            <Link href="/#how-it-works" className="arena-secondary-link">See how it works</Link>
          </div>
        </div>

        <div className="about-score-card" aria-label="Tradebattle platform summary">
          <div className="about-score-top">
            <span className="match-live"><i /> PLATFORM BRIEF</span>
            <span className="about-score-code">TB / 001</span>
          </div>
          <div className="about-score-title">Play the market.<br /><strong>Sharpen the player.</strong></div>
          <div className="about-chart" aria-hidden="true">
            <div className="about-chart-grid" />
            <svg viewBox="0 0 420 150" role="presentation">
              <defs>
                <linearGradient id="about-chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#67e7bf" stopOpacity="0.24" />
                  <stop offset="1" stopColor="#67e7bf" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 126 C35 124 45 112 76 116 S122 98 148 105 S189 88 214 92 S248 58 276 71 S310 54 338 48 S376 26 420 12 V150 H0Z" fill="url(#about-chart-fill)" />
              <path d="M0 126 C35 124 45 112 76 116 S122 98 148 105 S189 88 214 92 S248 58 276 71 S310 54 338 48 S376 26 420 12" fill="none" stroke="#67e7bf" strokeWidth="3" strokeLinecap="round" />
              <circle cx="420" cy="12" r="5" fill="#67e7bf" />
            </svg>
          </div>
          <div className="about-score-stats">
            <div><span>MODE</span><strong>SKILL-BASED</strong></div>
            <div><span>RISK</span><strong>VIRTUAL ONLY</strong></div>
            <div><span>PACE</span><strong>YOUR CALL</strong></div>
          </div>
        </div>
      </section>

      <section className="about-principles" aria-label="Tradebattle principles">
        <div className="arena-shell about-principles-row">
          {principles.map((principle) => (
            <div key={principle.label} className="about-principle">
              <span>{principle.label}</span>
              <strong>{principle.value}</strong>
            </div>
          ))}
          <div className="about-principle-note">No real-money trades. Just real competition.</div>
        </div>
      </section>

      <section className="arena-shell about-pillars">
        <div className="about-section-heading">
          <div>
            <div className="arena-kicker">Why Tradebattle</div>
            <h2>A cleaner way to get better at trading.</h2>
          </div>
          <p>Less noise. Better reps. Rankings that give your next session a reason to matter.</p>
        </div>
        <div className="about-pillar-grid">
          {pillars.map(({ icon: Icon, eyebrow, title, description }) => (
            <motion.article
              key={eyebrow}
              className="about-pillar-card"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <div className="about-pillar-icon"><Icon size={19} /></div>
              <div className="about-pillar-eyebrow">{eyebrow}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="arena-shell about-closer">
        <div className="about-closer-mark"><Trophy size={20} /></div>
        <div>
          <div className="arena-kicker">Your next move starts here</div>
          <h2>Bring a strategy.<br /><span>Leave with a sharper one.</span></h2>
        </div>
        <Link href="/signup" className="arena-primary-link">Create player profile <ArrowRight size={17} /></Link>
      </section>
    </div>
  );
}
