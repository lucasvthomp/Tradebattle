import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Award,
  BarChart3,
  Zap,
  DollarSign,
  ArrowRight,
  Crown,
  Timer,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Flame,
  Rocket,
  Swords,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

// ─── Animation Variants ────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Live Market Ticker ────────────────────────────────────────
function LiveMarketTicker({ stocks }: { stocks: any[] }) {
  if (!stocks || stocks.length === 0) {
    return (
      <div
        className="w-full overflow-hidden py-3 mb-6"
        style={{
          backgroundColor: 'rgba(8, 12, 20, 0.6)',
          borderBottom: '1px solid rgba(227, 179, 65, 0.15)',
        }}
      >
        <div className="flex gap-8 px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-12 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tripled = [...stocks, ...stocks, ...stocks];

  return (
    <div
      className="w-full overflow-hidden py-3 mb-6"
      style={{
        backgroundColor: 'rgba(8, 12, 20, 0.6)',
        borderBottom: '1px solid rgba(227, 179, 65, 0.15)',
      }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {tripled.map((stock: any, i: number) => {
          const isPositive = (stock.percentChange || stock.changesPercentage || 0) >= 0;
          const pctChange = stock.percentChange || stock.changesPercentage || 0;
          const price = stock.price || 0;
          return (
            <div key={i} className="flex items-center gap-2 px-2 shrink-0">
              <span className="font-bold text-sm" style={{ color: '#F1F5F9' }}>
                {stock.symbol}
              </span>
              <span className="text-sm" style={{ color: '#94A3B8' }}>
                ${typeof price === 'number' ? price.toFixed(2) : price}
              </span>
              <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{typeof pctChange === 'number' ? pctChange.toFixed(2) : pctChange}%
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Top Traders Spotlight ─────────────────────────────────────
function TopTradersSpotlight({ rankings, yourRank, formatCurrency }: { rankings: any[]; yourRank: number | null; formatCurrency: (n: number) => string }) {
  const medalColors = ['#E3B341', '#C0C0C0', '#CD7F32'];

  if (!rankings || rankings.length === 0) {
    return (
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: '#E3B34120' }}>
            <Crown className="w-5 h-5" style={{ color: '#E3B341' }} />
          </div>
          <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
            Top Traders
          </h2>
        </div>
        <Card className="rounded-xl border" style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardContent className="p-6 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: '#E3B34140' }} />
            <p className="text-sm font-semibold" style={{ color: '#64748B' }}>
              Join a tournament to see who's on top!
            </p>
            <Link href="/tournaments">
              <Button className="mt-3 h-9 text-sm font-bold rounded-lg border-none" style={{ background: 'linear-gradient(135deg, #E3B341, #F59E0B)', color: '#080C14' }}>
                Browse Tournaments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: '#E3B34120' }}>
            <Crown className="w-5 h-5" style={{ color: '#E3B341' }} />
          </div>
          <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
            Top Traders
          </h2>
        </div>
        <Link href="/leaderboard">
          <span className="text-sm font-semibold flex items-center gap-1" style={{ color: '#E3B341' }}>
            View All <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Trader Cards */}
      <motion.div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {rankings.slice(0, 5).map((trader: any, i: number) => (
          <motion.div key={i} variants={fadeUpItem} whileHover={{ y: -4 }} className="shrink-0">
            <Card
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{
                background: i === 0
                  ? 'linear-gradient(160deg, #1a1810 0%, #111827 100%)'
                  : 'linear-gradient(160deg, #111827 0%, #0f1520 100%)',
                borderColor: i < 3 ? `${medalColors[i]}40` : '#1F2937',
                boxShadow: i === 0 ? '0 4px 24px rgba(227, 179, 65, 0.15)' : undefined,
                minWidth: '160px',
                width: '180px',
              }}
            >
              <CardContent className="p-4">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                    style={{
                      backgroundColor: i < 3 ? `${medalColors[i]}20` : '#1F293740',
                      color: i < 3 ? medalColors[i] : '#94A3B8',
                      border: i < 3 ? `1px solid ${medalColors[i]}40` : undefined,
                    }}
                  >
                    {i === 0 ? <Crown className="w-4 h-4" /> : `#${i + 1}`}
                  </div>
                  {i === 0 && (
                    <Badge className="text-[10px] font-bold border-none" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                      LEADER
                    </Badge>
                  )}
                </div>

                {/* Username */}
                <div className="text-sm font-bold mb-1 truncate" style={{ color: '#F1F5F9' }}>
                  {trader.username || 'Trader'}
                </div>

                {/* Growth */}
                <div className="text-lg font-black" style={{ color: '#10B981' }}>
                  +{(trader.percentageChange || 0).toFixed(1)}%
                </div>

                {/* Tournament */}
                <div className="text-[11px] mt-1 truncate" style={{ color: '#64748B' }}>
                  {trader.tournamentName || 'Tournament'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Your Rank */}
      {yourRank && (
        <div className="mt-3 text-sm font-semibold" style={{ color: '#94A3B8' }}>
          You're ranked <span style={{ color: '#E3B341' }}>#{yourRank}</span> globally
        </div>
      )}
    </motion.div>
  );
}

// ─── Live Tournament Feed ──────────────────────────────────────
function LiveTournamentFeed({ tournaments, formatCurrency }: { tournaments: any[]; formatCurrency: (n: number) => string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Sort: active first, then waiting
  const sorted = [...tournaments]
    .filter((t: any) => t.status === 'active' || t.status === 'waiting')
    .sort((a: any, b: any) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return 0;
    })
    .slice(0, 4);

  if (sorted.length === 0) {
    return (
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
            <Swords className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
            Live Tournaments
          </h2>
        </div>
        <Card className="rounded-xl border" style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardContent className="p-6 text-center">
            <Swords className="w-10 h-10 mx-auto mb-3" style={{ color: '#E3B34140' }} />
            <p className="text-sm font-semibold" style={{ color: '#64748B' }}>
              No active tournaments right now — be the first to create one!
            </p>
            <Link href="/tournaments">
              <Button className="mt-3 h-9 text-sm font-bold rounded-lg border-none" style={{ background: 'linear-gradient(135deg, #E3B341, #F59E0B)', color: '#080C14' }}>
                Create Tournament
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
            <Swords className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
            Live Tournaments
          </h2>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-xs font-bold" style={{ color: '#EF4444' }}>LIVE</span>
          </span>
        </div>
        <Link href="/tournaments">
          <span className="text-sm font-semibold flex items-center gap-1" style={{ color: '#E3B341' }}>
            Browse All <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {sorted.map((tournament: any, i: number) => {
          const isActive = tournament.status === 'active';
          const pot = (tournament.currentPlayers || 0) * (tournament.buyInAmount || 0);
          const playerPct = tournament.maxPlayers ? ((tournament.currentPlayers || 0) / tournament.maxPlayers) * 100 : 0;

          return (
            <motion.div key={tournament.id || i} variants={fadeUpItem} whileHover={{ y: -3 }}>
              <Link href="/tournaments">
                <Card
                  className="cursor-pointer rounded-xl border overflow-hidden transition-all duration-300"
                  style={{
                    background: isActive
                      ? 'linear-gradient(160deg, #111827 0%, #0d1a15 100%)'
                      : 'linear-gradient(160deg, #111827 0%, #1a1710 100%)',
                    borderColor: '#1F2937',
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-sm md:text-base mb-1 truncate" style={{ color: '#F1F5F9', maxWidth: '180px' }}>
                          {tournament.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-[10px] font-bold border-none"
                            style={{
                              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(227, 179, 65, 0.2)',
                              color: isActive ? '#10B981' : '#E3B341',
                            }}
                          >
                            {isActive ? '● LIVE' : '◷ STARTING SOON'}
                          </Badge>
                          {tournament.tournamentType && (
                            <Badge
                              className="text-[10px] font-bold border-none"
                              style={{
                                backgroundColor: tournament.tournamentType === 'crypto' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                color: tournament.tournamentType === 'crypto' ? '#F97316' : '#3B82F6',
                              }}
                            >
                              {tournament.tournamentType === 'crypto' ? 'CRYPTO' : 'STOCKS'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {pot > 0 && (
                        <div className="text-right">
                          <div className="text-[11px] font-semibold" style={{ color: '#64748B' }}>Prize Pot</div>
                          <div className="text-base font-black" style={{ color: '#10B981' }}>
                            {formatCurrency(pot)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-semibold">{tournament.currentPlayers || 0}/{tournament.maxPlayers || '∞'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          {isActive && tournament.endTime
                            ? `${getCountdown(tournament.endTime)} left`
                            : tournament.scheduledStartTime
                              ? `Starts in ${getCountdown(tournament.scheduledStartTime)}`
                              : tournament.timeframe || '--'}
                        </span>
                      </div>
                      {tournament.buyInAmount > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span className="font-semibold">{formatCurrency(tournament.buyInAmount)} entry</span>
                        </div>
                      )}
                    </div>

                    {/* Player Fill Bar */}
                    {tournament.maxPlayers && (
                      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(playerPct, 100)}%`,
                            background: isActive
                              ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                              : 'linear-gradient(90deg, #E3B341, #F59E0B)',
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Your Stats Banner ─────────────────────────────────────────
function YourStatsBanner({ user, globalRank }: { user: any; globalRank: number | null }) {
  const stats = [
    {
      label: "Tournaments Won",
      value: user?.tournamentWins || 0,
      icon: Trophy,
      color: '#E3B341',
    },
    {
      label: "Trades Executed",
      value: user?.totalTrades || 0,
      icon: Activity,
      color: '#10B981',
    },
    {
      label: "Global Ranking",
      value: globalRank ? `#${globalRank}` : "Unranked",
      icon: Award,
      color: '#06B6D4',
    },
  ];

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="rounded-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1520 0%, #111827 50%, #151210 100%)',
          borderColor: '#1F2937',
        }}
      >
        <CardContent className="p-5 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="rounded-lg p-1.5" style={{ backgroundColor: '#E3B34120' }}>
              <Flame className="w-5 h-5" style={{ color: '#E3B341' }} />
            </div>
            <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
              Your Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="rounded-xl p-2" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold" style={{ color: '#64748B' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Trending Stocks Bar ───────────────────────────────────────
function TrendingStocksBar({ stocks }: { stocks: any[] }) {
  if (!stocks || stocks.length === 0) return null;

  // Sort by absolute % change, take top 4 movers
  const topMovers = [...stocks]
    .sort((a: any, b: any) => Math.abs(b.percentChange || b.changesPercentage || 0) - Math.abs(a.percentChange || a.changesPercentage || 0))
    .slice(0, Math.min(4, stocks.length));

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <h2 className="text-lg md:text-xl font-black font-display" style={{ color: '#F1F5F9' }}>
            Top Movers
          </h2>
        </div>
        <Link href="/dashboard">
          <span className="text-sm font-semibold flex items-center gap-1" style={{ color: '#10B981' }}>
            Trade Now <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topMovers.map((stock: any, i: number) => {
          const pctChange = stock.percentChange || stock.changesPercentage || 0;
          const isPositive = pctChange >= 0;
          const price = stock.price || 0;

          return (
            <motion.div key={i} whileHover={{ y: -3 }}>
              <Link href="/dashboard">
                <Card
                  className="cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden"
                  style={{
                    background: isPositive
                      ? 'linear-gradient(160deg, #111827 0%, #0d1a15 100%)'
                      : 'linear-gradient(160deg, #111827 0%, #1a0d0d 100%)',
                    borderColor: '#1F2937',
                  }}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: '#F1F5F9' }}>{stock.symbol}</span>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                      ) : (
                        <TrendingDown className="w-4 h-4" style={{ color: '#EF4444' }} />
                      )}
                    </div>
                    <div className="text-base md:text-lg font-black mb-1" style={{ color: '#F1F5F9' }}>
                      ${typeof price === 'number' ? price.toFixed(2) : price}
                    </div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: isPositive ? '#10B981' : '#EF4444' }}
                    >
                      {isPositive ? '+' : ''}{typeof pctChange === 'number' ? pctChange.toFixed(2) : pctChange}%
                    </div>

                    {/* Mini bar */}
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(Math.abs(pctChange) * 10, 100)}%`,
                          backgroundColor: isPositive ? '#10B981' : '#EF4444',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Bottom CTA ────────────────────────────────────────────────
function BottomCTA() {
  return (
    <motion.div
      className="mb-6 md:mb-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card
          className="rounded-2xl border-none overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #E3B341 0%, #D4A030 50%, #c99a35 100%)',
            boxShadow: '0 8px 40px rgba(227, 179, 65, 0.25)',
          }}
        >
          {/* Decorative bg icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Trophy className="absolute top-4 right-8 w-24 h-24 opacity-[0.08]" style={{ color: '#080C14' }} />
            <Rocket className="absolute bottom-4 left-8 w-20 h-20 opacity-[0.08]" style={{ color: '#080C14' }} />
          </div>

          <CardContent className="p-6 md:p-10 relative z-10 text-center">
            <h2 className="text-2xl md:text-4xl font-black font-display mb-3" style={{ color: '#080C14' }}>
              Ready to Dominate?
            </h2>
            <p className="text-sm md:text-base mb-6 max-w-md mx-auto" style={{ color: 'rgba(8, 12, 20, 0.7)' }}>
              Join a tournament, outsmart the competition, and claim your spot at the top.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tournaments">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="h-12 px-8 text-base font-bold rounded-xl border-none"
                    style={{
                      backgroundColor: '#080C14',
                      color: '#E3B341',
                    }}
                  >
                    <Swords className="w-5 h-5 mr-2" />
                    Enter Tournament
                  </Button>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="h-12 px-8 text-base font-bold rounded-xl"
                    style={{
                      borderColor: '#080C14',
                      color: '#080C14',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Start Trading
                  </Button>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── MAIN HUB COMPONENT ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export default function Hub() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ─── Data Queries ──────────────────────────────────────────
  const { data: tournamentsData } = useQuery({
    queryKey: ['/api/tournaments'],
  });

  const { data: publicTournaments } = useQuery({
    queryKey: ['/api/tournaments/public'],
  });

  const { data: growthLeaderboard } = useQuery({
    queryKey: ['/api/leaderboard/most-growth'],
  });

  const { data: popularStocks } = useQuery({
    queryKey: ['/api/popular'],
    refetchInterval: 60000,
  });

  // ─── Derived Data ─────────────────────────────────────────
  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];

  const userTournaments = tournamentsData?.data?.filter((t: any) =>
    t.status === 'active' && t.participants?.some((p: any) => p.userId === user?.id)
  ) || [];
  const activeTradesCount = userTournaments.length;

  const globalRank = (growthLeaderboard as any)?.data?.yourRank ?? null;
  const topRankings = (growthLeaderboard as any)?.data?.rankings ?? [];

  const tournamentList = (publicTournaments as any)?.data ?? [];

  const stockList = (popularStocks as any)?.data ?? [];

  const getTimeRemaining = () => {
    const nextTournament = activeTournaments[0];
    if (!nextTournament?.endTime) return "--";
    const end = new Date(nextTournament.endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  // ─── Static Data ──────────────────────────────────────────
  const primaryActions = [
    {
      title: "Trade Now",
      description: "Jump into action with your live portfolio",
      href: "/dashboard",
      icon: BarChart3,
      borderColor: '#10B981',
      badge: "Live",
      gradient: 'linear-gradient(160deg, #111827 0%, #0d1f1a 100%)',
      glowColor: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: "Join Tournament",
      description: `${activeTournaments.length} active tournaments waiting`,
      href: "/tournaments",
      icon: Trophy,
      borderColor: '#E3B341',
      badge: "Ongoing",
      gradient: 'linear-gradient(160deg, #111827 0%, #1a1810 100%)',
      glowColor: 'rgba(227, 179, 65, 0.15)',
    },
    {
      title: "Leaderboard",
      description: "Compete for the top spot globally",
      href: "/leaderboard",
      icon: Award,
      borderColor: '#06B6D4',
      badge: "Top 100",
      gradient: 'linear-gradient(160deg, #111827 0%, #0d1820 100%)',
      glowColor: 'rgba(6, 182, 212, 0.15)',
    }
  ];

  const quickStats = [
    {
      label: "Balance",
      value: formatCurrency(Number(user?.siteCash) || 0),
      icon: DollarSign,
      color: '#E3B341',
      gradient: 'linear-gradient(160deg, #111827 0%, #1a1710 100%)',
    },
    {
      label: "Active Trades",
      value: activeTradesCount,
      icon: Activity,
      color: '#10B981',
      gradient: 'linear-gradient(160deg, #111827 0%, #0d1f1a 100%)',
    },
    {
      label: "Tournaments",
      value: activeTournaments.length,
      icon: Trophy,
      color: '#8B5CF6',
      gradient: 'linear-gradient(160deg, #111827 0%, #15102a 100%)',
    },
    {
      label: "Global Rank",
      value: globalRank ? `#${globalRank}` : "--",
      icon: Award,
      color: '#06B6D4',
      gradient: 'linear-gradient(160deg, #111827 0%, #0d1820 100%)',
    },
  ];

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen relative overflow-hidden page-grid-bg"
      style={{ backgroundColor: '#080C14' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient gradient orb */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(227, 179, 65, 0.06) 0%, rgba(6, 182, 212, 0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ═══ Section 1: Live Market Ticker ═══ */}
      <div className="relative z-10">
        <LiveMarketTicker stocks={stockList} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10">
        {/* ═══ Section 2: Hero Header + Balance Card ═══ */}
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="rounded-xl md:rounded-2xl p-1.5 md:p-2" style={{
                  background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                }}>
                  <Crown className="w-8 h-8 md:w-12 md:h-12" style={{ color: '#080C14' }} />
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-display tracking-tight" style={{ color: '#F1F5F9' }}>
                  {getGreeting()}, <span style={{ color: '#E3B341' }}>{user?.username}</span>!
                </h1>
              </div>
              <motion.p
                className="flex items-center gap-2 text-sm md:text-base lg:text-lg"
                style={{ color: '#94A3B8' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                Your trading arena awaits
              </motion.p>
            </div>

            {/* Balance Card */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="w-full lg:w-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card
                className="rounded-2xl relative overflow-hidden border-none"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #E3B341, #D97706)',
                  minWidth: '100%',
                  boxShadow: '0 0 60px rgba(227, 179, 65, 0.2), 0 0 120px rgba(227, 179, 65, 0.05)',
                }}
              >
                <CardContent className="p-4 md:p-6 relative z-10">
                  <div className="mb-2 md:mb-3 flex items-center gap-2">
                    <div className="rounded-lg md:rounded-xl p-1.5 md:p-2" style={{ backgroundColor: 'rgba(8, 12, 20, 0.2)' }}>
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#080C14' }} />
                    </div>
                    <div className="text-xs md:text-sm font-bold" style={{ color: '#080C14' }}>Your Balance</div>
                  </div>
                  <div className="mb-3 md:mb-4">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-black" style={{ color: '#080C14' }}>
                      {formatCurrency(Number(user?.siteCash) || 0)}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full h-12 font-bold text-base rounded-xl border-none" style={{
                        background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                        color: '#FFFFFF',
                      }}>
                        <Zap className="w-5 h-5 mr-2" />
                        Trade Now
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ Section 3: Quick Stats ═══ */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {quickStats.map((stat, i) => (
            <motion.div key={i} variants={fadeUpItem} whileHover={{ y: -4 }}>
              <Card
                className="transition-all rounded-xl md:rounded-2xl relative overflow-hidden border"
                style={{
                  background: stat.gradient,
                  borderColor: '#1F2937',
                  borderTopWidth: '2px',
                  borderTopColor: stat.color,
                }}
              >
                <CardContent className="p-3 md:p-5 relative z-10">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="rounded-lg md:rounded-xl p-1.5 md:p-2" style={{ backgroundColor: `${stat.color}20` }}>
                      <stat.icon className="w-4 h-4 md:w-6 md:h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-semibold" style={{ color: '#94A3B8' }}>{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ Section 4: Primary Action Cards ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
          {primaryActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -4 }}
            >
              <Link href={action.href}>
                <Card
                  className="h-full cursor-pointer relative overflow-hidden group rounded-2xl border transition-all duration-300"
                  style={{ background: action.gradient, borderColor: '#1F2937' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${action.glowColor}`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${action.borderColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = '#1F2937';
                  }}
                >
                  <Badge
                    className="absolute top-4 right-4 font-bold text-xs z-20 border-none"
                    style={{ backgroundColor: action.borderColor, color: '#FFFFFF', padding: '4px 10px' }}
                  >
                    {action.badge}
                  </Badge>
                  <CardContent className="p-5 md:p-6 lg:p-8 relative z-10">
                    <div className="mb-4 md:mb-5">
                      <div
                        className="rounded-xl md:rounded-2xl inline-block p-3.5 md:p-5"
                        style={{ backgroundColor: `${action.borderColor}15`, border: `1px solid ${action.borderColor}25` }}
                      >
                        <action.icon className="w-10 h-10 md:w-14 md:h-14" style={{ color: action.borderColor }} />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-2 md:mb-3" style={{ color: '#FFFFFF' }}>
                      {action.title}
                    </h3>
                    <p className="text-sm md:text-base mb-4 md:mb-6 leading-relaxed" style={{ color: '#94A3B8' }}>
                      {action.description}
                    </p>
                    <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all text-sm md:text-base" style={{ color: action.borderColor }}>
                      <span>Let's Go</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ═══ Section 5: Top Traders Spotlight ═══ */}
        <TopTradersSpotlight
          rankings={topRankings}
          yourRank={globalRank}
          formatCurrency={formatCurrency}
        />

        {/* ═══ Section 6: Live Tournaments Feed ═══ */}
        <LiveTournamentFeed
          tournaments={tournamentList}
          formatCurrency={formatCurrency}
        />

        {/* ═══ Section 7: Your Stats Banner ═══ */}
        <YourStatsBanner user={user} globalRank={globalRank} />

        {/* ═══ Section 8: Trending Stocks Bar ═══ */}
        <TrendingStocksBar stocks={stockList} />

        {/* ═══ Section 9: Bottom CTA ═══ */}
        <BottomCTA />
      </div>
    </motion.div>
  );
}
