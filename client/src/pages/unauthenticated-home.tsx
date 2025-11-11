import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  TrendingUp,
  Trophy,
  Users,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  DollarSign,
  Award,
  Sparkles,
  Flame,
  Crown,
  TrendingDown,
  Activity,
  Timer
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

// Animated floating money icons
const FloatingMoney = () => {
  const money = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {money.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <DollarSign className="w-6 h-6" style={{ color: '#28C76F' }} />
        </motion.div>
      ))}
    </div>
  );
};

// Live ticker animation
const LiveTicker = () => {
  const tickers = [
    { symbol: "AAPL", change: "+2.4%", color: "text-[#28C76F]" },
    { symbol: "TSLA", change: "+5.7%", color: "text-[#28C76F]" },
    { symbol: "NVDA", change: "-1.2%", color: "text-[#FF3333]" },
    { symbol: "MSFT", change: "+3.1%", color: "text-[#28C76F]" },
    { symbol: "GOOGL", change: "+1.8%", color: "text-[#28C76F]" },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-b border-border/30 overflow-hidden">
      <motion.div
        className="flex items-center py-2 gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...tickers, ...tickers, ...tickers].map((ticker, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold text-sm">{ticker.symbol}</span>
            <span className={`text-sm font-semibold ${ticker.color}`}>{ticker.change}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Prize pool counter
const PrizeCounter = () => {
  const [amount, setAmount] = useState(125000);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(prev => prev + Math.random() * 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="text-5xl md:text-7xl font-black mb-4"
      style={{ color: '#28C76F' }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
    </motion.div>
  );
};

export default function UnauthenticatedHome() {
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Trophy,
      title: "Win Real Cash",
      description: "Top 10 winners share prize pools up to $50K per tournament",
      highlight: "$50K",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Zap,
      title: "Instant Action",
      description: "New tournaments every hour. Jump in and compete instantly",
      highlight: "24/7",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Zero Risk",
      description: "Practice with $10,000 virtual money. Keep 100% of real winnings",
      highlight: "Free",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Crown,
      title: "Climb Ranks",
      description: "Earn XP, unlock achievements, and dominate the leaderboards",
      highlight: "XP",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const recentWinners = [
    { username: "TraderKing", amount: "$2,450", rank: 1 },
    { username: "BullMarket", amount: "$1,800", rank: 2 },
    { username: "WolfOfWS", amount: "$1,200", rank: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a2f] via-[#162539] to-[#0f1e2e] text-white overflow-hidden">
      {/* Live Ticker */}
      <LiveTicker />

      {/* Floating Money Background */}
      <FloatingMoney />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-block mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Badge className="px-6 py-2 text-base font-bold" style={{ backgroundColor: '#28C76F', borderColor: '#28C76F' }}>
                  <Flame className="w-5 h-5 mr-2 inline animate-pulse" />
                  🔥 2,847 Players Online Now
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Trade. Compete.
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#28C76F] to-[#22c55e] bg-clip-text text-transparent">
                  Win Cash.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                The world's most exciting stock trading game
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Join tournaments, compete with real traders, win real money. No experience required.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="text-lg px-10 py-7 font-bold" style={{ backgroundColor: '#28C76F' }}>
                      Start Playing Free
                      <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/tournaments">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="text-lg px-10 py-7 font-bold border-2 hover:bg-white/10">
                      <Trophy className="mr-2 w-6 h-6" />
                      View Tournaments
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: '#28C76F' }} />
                  <span>Start with $10,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" style={{ color: '#FFD700' }} />
                  <span>Win Real Money</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Join</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2240] border-[#28C76F]/30 border-2">
              <CardContent className="p-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="w-10 h-10" style={{ color: '#FFD700' }} />
                  <h2 className="text-3xl font-bold">Total Prize Pool This Month</h2>
                </div>
                <PrizeCounter />
                <p className="text-gray-400 text-lg mb-6">
                  Join the action and claim your share
                </p>

                {/* Next Tournament Countdown */}
                <div className="flex items-center justify-center gap-4 text-2xl font-mono font-bold">
                  <Timer className="w-6 h-6" style={{ color: '#28C76F' }} />
                  <span>Next Tournament:</span>
                  <span style={{ color: '#28C76F' }}>
                    {String(countdown.hours).padStart(2, '0')}:
                    {String(countdown.minutes).padStart(2, '0')}:
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              <Crown className="inline w-8 h-8 mr-3" style={{ color: '#FFD700' }} />
              Recent Winners
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recentWinners.map((winner, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2240] border-[#28C76F]/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">
                        {winner.rank === 1 && "🥇"}
                        {winner.rank === 2 && "🥈"}
                        {winner.rank === 3 && "🥉"}
                      </div>
                      <div className="text-xl font-bold mb-2">{winner.username}</div>
                      <div className="text-3xl font-black mb-1" style={{ color: '#28C76F' }}>
                        {winner.amount}
                      </div>
                      <div className="text-sm text-gray-400">Just won!</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Thousands Play Daily
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                >
                  <Card className={`h-full bg-gradient-to-br ${feature.color} border-0 relative overflow-hidden`}>
                    <CardContent className="p-6 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-10 -right-10 opacity-20"
                      >
                        <feature.icon className="w-32 h-32" />
                      </motion.div>
                      <feature.icon className="w-12 h-12 mb-4" />
                      <div className="text-4xl font-black mb-2">{feature.highlight}</div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm opacity-90">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-[#28C76F] to-[#22c55e] border-0">
              <CardContent className="p-16">
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                  Ready to Win?
                </h2>
                <p className="text-xl text-white/90 mb-10">
                  Join 10,000+ traders competing for real cash prizes every day
                </p>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-white text-[#28C76F] hover:bg-gray-100 text-xl px-12 py-8 font-black">
                      Create Free Account
                      <Sparkles className="ml-3 w-6 h-6" />
                    </Button>
                  </motion.div>
                </Link>
                <p className="text-sm text-white/70 mt-6">
                  No credit card • No risk • Real prizes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
