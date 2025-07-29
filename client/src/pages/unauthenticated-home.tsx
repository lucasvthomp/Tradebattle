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
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  Star,
  TrendingDown,
  LineChart
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

// Stock chart background SVG component
const StockChartBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
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
      <g stroke="#3b82f6" strokeWidth="0.5" opacity="0.2">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" />
        ))}
      </g>
      
      {/* Stock price line */}
      <path
        d="M 0 300 Q 100 250 200 280 T 400 200 T 600 160 T 800 120"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.8"
      />
      
      {/* Area under the curve */}
      <path
        d="M 0 300 Q 100 250 200 280 T 400 200 T 600 160 T 800 120 L 800 400 L 0 400 Z"
        fill="url(#stockGradient)"
      />
      
      {/* Data points */}
      {[
        { x: 0, y: 300 },
        { x: 200, y: 280 },
        { x: 400, y: 200 },
        { x: 600, y: 160 },
        { x: 800, y: 120 }
      ].map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#3b82f6"
          filter="url(#glow)"
          opacity="0.6"
        />
      ))}
    </svg>
  </div>
);

export default function UnauthenticatedHome() {
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
      description: "Enter trading competitions with different themes, durations, and prize pools",
      icon: Trophy
    },
    {
      step: "3",
      title: "Trade & Compete",
      description: "Buy and sell stocks with real market data, compete against other traders",
      icon: TrendingUp
    },
    {
      step: "4",
      title: "Win & Earn",
      description: "Top performers win prizes and climb the global leaderboards",
      icon: Award
    }
  ];

  const stats = [
    { label: "Active Traders", value: "10,000+", icon: Users },
    { label: "Tournaments Daily", value: "50+", icon: Trophy },
    { label: "Total Prizes", value: "$100K+", icon: DollarSign },
    { label: "Countries", value: "80+", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Stock Chart Background */}
      <section className="relative py-20 overflow-hidden">
        <StockChartBackground />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                The Future of Paper Trading
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Compete. Trade. Win.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                No risk, all reward.
              </p>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the world's most exciting paper trading competition platform. 
                Practice with real market data, compete in tournaments, and climb the global leaderboards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Trading Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-16" {...fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the thrill of trading without the risk. Our platform combines 
                real market data with competitive gaming elements.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-background">
                          <feature.icon className={`w-8 h-8 ${feature.color}`} />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
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
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-16" {...fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes and begin your journey to becoming a better trader
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center relative"
                >
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        {step.step}
                      </div>
                      {index < howItWorks.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-16 w-20 h-0.5 bg-border"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            {...fadeInUp}
          >
            <Card className="p-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Trading?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of traders who are already competing and improving their skills. 
                  Start your trading journey today with $10,000 in virtual money.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Create Free Account
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  <Shield className="inline w-4 h-4 mr-1" />
                  100% Free • No Credit Card Required • Real Market Data
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}