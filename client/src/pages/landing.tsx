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
  Play
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#080C14' }}>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          className="text-center mb-20 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-6">
            <Badge className="px-4 py-2 text-sm font-semibold border-0" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Turn Trading Skills Into Real Money
            </Badge>
          </div>

          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span style={{ color: '#E3B341' }}>
              Compete. Trade. Win.
            </span>
            <br />
            <span style={{ color: '#F1F5F9' }}>The Trading Game</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            style={{ color: '#94A3B8' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Battle traders worldwide in real-time tournaments.
            <span className="font-bold" style={{ color: '#10B981' }}> Win real prizes</span> while trading with virtual money.
            <span className="inline-flex items-center mx-2">
              <Gamepad2 className="w-5 h-5 inline" style={{ color: '#E3B341' }} />
            </span>
            Risk-free. Skill-based. Pure competition.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="text-lg px-8 py-6 font-bold border-0" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Playing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/tournaments">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-bold" style={{ borderColor: '#E3B341', color: '#E3B341' }}>
                  <Trophy className="w-5 h-5 mr-2" />
                  View Tournaments
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {[
              { label: "Active Players", value: "10K+", icon: Users },
              { label: "Prize Pool", value: "$50K+", icon: DollarSign },
              { label: "Tournaments", value: "2,500+", icon: Trophy },
              { label: "Win Rate", value: "45%", icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="p-4 rounded-lg border transition-colors"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#E3B341' }} />
                <div className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#94A3B8' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            {
              icon: Trophy,
              title: "Competitive Tournaments",
              description: "Join daily tournaments with real prize pools. Climb the leaderboard and win actual money.",
              color: '#E3B341',
            },
            {
              icon: Zap,
              title: "Real-Time Trading",
              description: "Trade with live market data. Make split-second decisions like a pro trader in a risk-free environment.",
              color: '#10B981',
            },
            {
              icon: Award,
              title: "Skill-Based Rewards",
              description: "No gambling. Pure skill. Your trading strategy and timing determine your success.",
              color: '#4F46E5',
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full border overflow-hidden" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 mb-4" style={{ color: feature.color }} />
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#F1F5F9' }}>{feature.title}</h3>
                  <p style={{ color: '#94A3B8' }}>{feature.description}</p>
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
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#F1F5F9' }}>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative"
              >
                <Card className="border" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold mb-4 opacity-20" style={{ color: '#E3B341' }}>{item.step}</div>
                    <item.icon className="w-12 h-12 mx-auto mb-4" style={{ color: '#E3B341' }} />
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>{item.title}</h3>
                    <p style={{ color: '#94A3B8' }}>{item.desc}</p>
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
          style={{ backgroundColor: '#111827' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6" style={{ color: '#F1F5F9' }}>
              Ready to Make <span style={{ color: '#10B981' }}>Real Money</span>?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
              Join thousands of traders competing for prize pools. 100% free to start. No credit card needed.
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="text-xl px-12 py-8 font-bold border-0" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
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
