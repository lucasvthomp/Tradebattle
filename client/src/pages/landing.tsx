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
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  DollarSign,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Trophy,
      title: "Competitive Trading",
      description: "Join tournaments with traders worldwide. Compete for real prizes with virtual money.",
      color: "text-yellow-500"
    },
    {
      icon: Target,
      title: "Risk-Free Trading",
      description: "Practice trading strategies without financial risk. Perfect for beginners and experts alike.",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Real Market Data",
      description: "Trade with authentic market prices and real-time data from major exchanges.",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with traders worldwide. Learn from the best and share your strategies.",
      color: "text-purple-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Get Started",
      description: "Create your free account and receive $10,000 in virtual trading money",
      icon: CheckCircle
    },
    {
      step: "2", 
      title: "Join Tournaments",
      description: "Browse public tournaments or create your own with custom rules and timeframes",
      icon: Target
    },
    {
      step: "3",
      title: "Trade & Compete",
      description: "Buy and sell stocks using real market data. Watch your portfolio grow in real-time",
      icon: TrendingUp
    },
    {
      step: "4",
      title: "Win & Learn",
      description: "Earn achievements, climb leaderboards, and improve your trading skills",
      icon: Award
    }
  ];

  const stats = [
    { label: "Active Traders", value: "10,000+", icon: Users },
    { label: "Tournaments Completed", value: "2,500+", icon: Trophy },
    { label: "Virtual Money Traded", value: "$50M+", icon: DollarSign },
    { label: "Countries", value: "85+", icon: Globe }
  ];

  // Stock market graph SVG background
  const stockGraphSVG = (
    <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.4 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Stock price lines */}
      <path d="M50,300 Q150,250 250,280 T450,200 T650,160 T750,140" 
            stroke="url(#grad1)" 
            strokeWidth="3" 
            fill="none" 
            filter="url(#glow)"/>
      
      <path d="M50,350 Q150,320 250,340 T450,280 T650,240 T750,220" 
            stroke="url(#grad1)" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.6"/>
            
      {/* Area fill */}
      <path d="M50,300 Q150,250 250,280 T450,200 T650,160 T750,140 L750,400 L50,400 Z" 
            fill="url(#grad1)" 
            opacity="0.1"/>
            
      {/* Data points */}
      <circle cx="250" cy="280" r="4" fill="#3b82f6" filter="url(#glow)"/>
      <circle cx="450" cy="200" r="4" fill="#8b5cf6" filter="url(#glow)"/>
      <circle cx="650" cy="160" r="4" fill="#06b6d4" filter="url(#glow)"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Stock Graph Background */}
      <section className="relative py-20 bg-gradient-to-br from-background via-primary/5 to-secondary/10 overflow-hidden">
        {/* Background Graph */}
        <div className="absolute inset-0 flex items-center justify-center">
          {stockGraphSVG}
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                🚀 No Risk, All Reward
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 leading-tight">
                Compete.{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Trade
                </span>{" "}
                Win.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join the world's most exciting paper trading competitions. 
                Practice with real market data, compete globally, and become a trading champion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/tournaments">
                    <Button size="lg" className="text-lg px-8 py-4 shadow-2xl hover:shadow-primary/20">
                      <Trophy className="w-5 h-5 mr-2" />
                      Join Tournament
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button size="lg" className="text-lg px-8 py-4 shadow-2xl hover:shadow-primary/20">
                      <Play className="w-5 h-5 mr-2" />
                      Start Trading
                    </Button>
                  </Link>
                )}
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 backdrop-blur-sm">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Learn How
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Why Choose ORSATH?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The ultimate platform for competitive paper trading with real market conditions
              </p>
            </motion.div>
            
            <motion.div 
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes and join the global trading competition
              </p>
            </motion.div>
            
            <motion.div 
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {howItWorks.map((step, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <CardContent className="p-6 text-center relative z-10">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-4 text-lg font-bold">
                        {step.step}
                      </div>
                      <step.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of traders competing in risk-free tournaments worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link href="/tournaments">
                    <Button size="lg" className="text-lg px-8 py-4">
                      <Trophy className="w-5 h-5 mr-2" />
                      Browse Tournaments
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button size="lg" className="text-lg px-8 py-4">
                      <Play className="w-5 h-5 mr-2" />
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      <Users className="w-5 h-5 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}