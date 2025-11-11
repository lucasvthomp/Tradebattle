import { Card, CardContent } from "@/components/ui/card";
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
  Gamepad2,
  Coins,
  Play
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Landing() {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingCoins, setFloatingCoins] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const coinInterval = setInterval(() => {
      setFloatingCoins(prev => [...prev.slice(-5), {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight
      }]);
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(coinInterval);
    };
  }, []);

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#06121F' }}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(227, 179, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(227, 179, 65, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {floatingCoins.map(coin => (
        <motion.div
          key={coin.id}
          initial={{ y: coin.y, x: coin.x, opacity: 0, scale: 0 }}
          animate={{
            y: -200,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            rotate: 360
          }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute pointer-events-none"
        >
          <Coins className="w-8 h-8" style={{ color: '#E3B341' }} />
        </motion.div>
      ))}

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: '#E3B341',
              left: \`\${Math.random() * 100}%\`,
              top: \`\${Math.random() * 100}%\`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              x: (mousePosition.x - window.innerWidth / 2) * (i * 0.01),
              y: (mousePosition.y - window.innerHeight / 2) * (i * 0.01),
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          className="text-center mb-20 mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={pulseAnimation}
            className="inline-block mb-6"
          >
            <Badge className="px-4 py-2 text-sm font-semibold border-0" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Turn Trading Skills Into Real Money
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Compete. Trade. Win.
            </span>
            <br />
            <span style={{ color: '#C9D1E2' }}>The Trading Game</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            style={{ color: '#8A93A6' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Battle traders worldwide in real-time tournaments.
            <span className="font-bold" style={{ color: '#28C76F' }}> Win real prizes</span> while trading with virtual money.
            <span className="inline-flex items-center mx-2">
              <Gamepad2 className="w-5 h-5 inline" style={{ color: '#E3B341' }} />
            </span>
            Risk-free. Skill-based. Pure competition.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-8 py-6 font-bold border-0" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Playing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/tournaments">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-bold" style={{ borderColor: '#E3B341', color: '#E3B341' }}>
                  <Trophy className="w-5 h-5 mr-2" />
                  View Tournaments
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { label: "Active Players", value: "10K+", icon: Users },
              { label: "Prize Pool", value: "$50K+", icon: DollarSign },
              { label: "Tournaments", value: "2,500+", icon: Trophy },
              { label: "Win Rate", value: "45%", icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#E3B341' }} />
                <div className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#8A93A6' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {[
            {
              icon: Trophy,
              title: "Competitive Tournaments",
              description: "Join daily tournaments with real prize pools. Climb the leaderboard and win actual money.",
              color: '#E3B341',
              gradient: 'from-yellow-500/20 to-orange-500/20'
            },
            {
              icon: Zap,
              title: "Real-Time Trading",
              description: "Trade with live market data. Make split-second decisions like a pro trader in a risk-free environment.",
              color: '#28C76F',
              gradient: 'from-green-500/20 to-emerald-500/20'
            },
            {
              icon: Award,
              title: "Skill-Based Rewards",
              description: "No gambling. Pure skill. Your trading strategy and timing determine your success.",
              color: '#4F46E5',
              gradient: 'from-indigo-500/20 to-purple-500/20'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="h-full border-0 overflow-hidden relative group" style={{ backgroundColor: '#1E2D3F' }}>
                <div className={\`absolute inset-0 bg-gradient-to-br \${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300\`} />
                <CardContent className="p-6 relative z-10">
                  <motion.div
                    className="mb-4 inline-block"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-12 h-12" style={{ color: feature.color }} />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#C9D1E2' }}>{feature.title}</h3>
                  <p style={{ color: '#8A93A6' }}>{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#C9D1E2' }}>
            Start Winning in <span style={{ color: '#E3B341' }}>3 Simple Steps</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Sign Up Free", desc: "Get $10,000 virtual cash instantly", icon: Sparkles },
              { step: "02", title: "Join Tournament", desc: "Enter competitions & start trading", icon: Target },
              { step: "03", title: "Win Prizes", desc: "Top traders win real money rewards", icon: DollarSign }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Card className="border-0" style={{ backgroundColor: '#1E2D3F' }}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold mb-4 opacity-20" style={{ color: '#E3B341' }}>{item.step}</div>
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <item.icon className="w-12 h-12 mx-auto mb-4" style={{ color: '#E3B341' }} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#C9D1E2' }}>{item.title}</h3>
                    <p style={{ color: '#8A93A6' }}>{item.desc}</p>
                  </CardContent>
                </Card>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2" style={{ color: '#E3B341' }} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center py-20 px-6 rounded-2xl relative overflow-hidden"
          style={{ backgroundColor: '#1E2D3F' }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              background: 'linear-gradient(45deg, #E3B341, #28C76F, #4F46E5)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6" style={{ color: '#C9D1E2' }}>
              Ready to Make <span style={{ color: '#28C76F' }}>Real Money</span>?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#8A93A6' }}>
              Join thousands of traders competing for prize pools. 100% free to start. No credit card needed.
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-xl px-12 py-8 font-bold border-0" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                  <Gamepad2 className="w-6 h-6 mr-3" />
                  Start Playing Now - It's Free
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
