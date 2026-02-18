import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  TrendingUp,
  Trophy,
  Users,
  Target,
  Zap,
  ArrowRight,
  DollarSign,
  Award,
  Sparkles,
  Play,
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  Gamepad2,
  LineChart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { user } = useAuth();

  // Subtle particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0A0F1C', color: '#F1F5F9' }}>
      {/* Subtle background particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: '#E3B341',
            left: p.left,
            top: '-10px',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Ambient glows */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '20%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(227, 179, 65, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(100px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(100px)',
      }} />

      <div className="container mx-auto px-6 py-16 relative z-10 max-w-7xl">

        {/* Hero Section */}
        <motion.div
          className="text-center mb-24 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge
              className="px-5 py-2.5 text-sm font-semibold border-0 cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.15) 0%, rgba(227, 179, 65, 0.05) 100%)',
                border: '1px solid rgba(227, 179, 65, 0.3)',
                color: '#E3B341',
              }}
            >
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Skill-based trading competition platform
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ letterSpacing: '-0.02em' }}
          >
            <span style={{ color: '#F1F5F9' }}>Trade Smart.</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Win Real Money.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
            style={{ color: '#94A3B8' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Compete in real-time trading tournaments using live market data.
            <span className="font-semibold" style={{ color: '#10B981' }}> Zero risk</span>, pure skill.
            Win cash prizes backed by your trading performance.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="text-base px-8 py-6 font-bold border-0 h-14"
                  style={{
                    background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                    color: '#0A0F1C',
                    boxShadow: '0 4px 20px rgba(227, 179, 65, 0.3)',
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/tournaments">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 font-semibold h-14"
                  style={{
                    borderColor: '#2B3A4C',
                    color: '#C9D1E2',
                    background: 'rgba(30, 45, 63, 0.5)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  View Live Tournaments
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { value: "$250K+", label: "Total Prizes", subtext: "Awarded" },
              { value: "15K+", label: "Active Traders", subtext: "Competing" },
              { value: "5,000+", label: "Tournaments", subtext: "Completed" },
              { value: "4.8★", label: "User Rating", subtext: "Avg Score" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                style={{
                  padding: '20px 16px',
                  borderRadius: '12px',
                  background: 'rgba(30, 45, 63, 0.4)',
                  border: '1px solid #2B3A4C',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="text-3xl font-black mb-1" style={{ color: '#E3B341' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#C9D1E2' }}>
                  {stat.label}
                </div>
                <div className="text-xs" style={{ color: '#64748B' }}>
                  {stat.subtext}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Why Tradebattle */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
              The Platform Designed for <span style={{ color: '#E3B341' }}>Serious Traders</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
              Built from the ground up for competitive trading. Not gambling. Not luck. Pure skill.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: LineChart,
                title: "Real Market Data",
                description: "Trade with live Yahoo Finance data. Same information used by professional traders worldwide.",
                color: '#E3B341',
              },
              {
                icon: Shield,
                title: "Zero Financial Risk",
                description: "Virtual portfolios with real market movements. Learn, compete, and win without risking your own money.",
                color: '#10B981',
              },
              {
                icon: Trophy,
                title: "Cash Prize Pools",
                description: "Top performers win real money. Multiple payout structures. Daily, weekly, and special tournaments.",
                color: '#6366F1',
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Card
                  className="h-full p-8"
                  style={{
                    background: 'rgba(30, 45, 63, 0.4)',
                    border: '1px solid #2B3A4C',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl mb-5 flex items-center justify-center"
                    style={{
                      background: `rgba(${feature.color === '#E3B341' ? '227, 179, 65' : feature.color === '#10B981' ? '16, 185, 129' : '99, 102, 241'}, 0.15)`,
                      border: `1px solid rgba(${feature.color === '#E3B341' ? '227, 179, 65' : feature.color === '#10B981' ? '16, 185, 129' : '99, 102, 241'}, 0.3)`,
                    }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#94A3B8' }}>
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
              Start Competing in <span style={{ color: '#E3B341' }}>Under 2 Minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-20 left-1/3 w-1/3 h-0.5 opacity-20" style={{ background: '#E3B341' }} />
            <div className="hidden md:block absolute top-20 right-0 w-1/3 h-0.5 opacity-20" style={{ background: '#E3B341' }} />

            {[
              {
                step: "01",
                title: "Create Free Account",
                desc: "Sign up in 30 seconds. Get $10,000 virtual cash instantly.",
                icon: Sparkles
              },
              {
                step: "02",
                title: "Join a Tournament",
                desc: "Browse active tournaments. Choose your buy-in level and compete.",
                icon: Target
              },
              {
                step: "03",
                title: "Trade & Win",
                desc: "Beat the competition. Top performers take home real cash prizes.",
                icon: DollarSign
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div
                  className="p-8 rounded-xl text-center relative z-10"
                  style={{
                    background: 'rgba(30, 45, 63, 0.4)',
                    border: '1px solid #2B3A4C',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    className="text-6xl font-black mb-4 absolute top-4 right-4 opacity-10"
                    style={{ color: '#E3B341' }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.2) 0%, rgba(227, 179, 65, 0.05) 100%)',
                      border: '2px solid rgba(227, 179, 65, 0.3)',
                    }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: '#E3B341' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
                    {item.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#94A3B8' }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
              Everything You Need to <span style={{ color: '#E3B341' }}>Compete & Win</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Gamepad2, title: "Live Tournaments", desc: "Daily competitions with varying buy-ins and prize pools" },
              { icon: BarChart3, title: "Real-Time Charts", desc: "Professional-grade charting tools and market analysis" },
              { icon: Users, title: "Global Leaderboards", desc: "Compete against thousands of traders worldwide" },
              { icon: Award, title: "Achievement System", desc: "Unlock badges and climb the ranking tiers" },
              { icon: Clock, title: "Instant Payouts", desc: "Winners receive payouts immediately after tournaments end" },
              { icon: CheckCircle2, title: "Fair Play Guarantee", desc: "Anti-cheat systems and verified transactions" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-4 p-5 rounded-lg"
                style={{
                  background: 'rgba(30, 45, 63, 0.3)',
                  border: '1px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B3A4C'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(227, 179, 65, 0.15)',
                    border: '1px solid rgba(227, 179, 65, 0.3)',
                  }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: '#E3B341' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center py-20 px-8 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(227, 179, 65, 0.2)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}>
              Ready to Compete?
            </h2>
            <p className="text-xl mb-8" style={{ color: '#94A3B8' }}>
              Join 15,000+ traders. 100% free to start. No credit card required.
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button
                  size="lg"
                  className="text-lg px-12 py-8 font-bold border-0 h-16"
                  style={{
                    background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                    color: '#0A0F1C',
                    boxShadow: '0 10px 40px rgba(227, 179, 65, 0.3)',
                  }}
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Trading Free
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <p className="text-sm mt-6" style={{ color: '#64748B' }}>
              Get $10,000 virtual cash instantly • Start competing in under 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
