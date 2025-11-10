import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Award,
  Calendar,
  BarChart3,
  ChevronRight,
  Zap,
  Star,
  Target,
  DollarSign,
  ArrowRight,
  Activity,
  Globe,
  Sparkles,
  Timer,
  PlayCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Link } from "wouter";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Hub() {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('goodMorning') || "Good Morning";
    if (hour < 17) return t('goodAfternoon') || "Good Afternoon"; 
    return t('goodEvening') || "Good Evening";
  };

  // Primary actions - streamlined and focused
  const primaryActions = [
    {
      title: t('dashboard'),
      description: t('dashboardDescription') || "Jump into your personal trading dashboard",
      href: "/dashboard",
      icon: BarChart3,
      accent: "from-blue-500 to-purple-600",
      feature: "trending"
    },
    {
      title: t('joinTournament'),
      description: t('joinTournamentDescription') || "Compete against traders worldwide",
      href: "/tournaments", 
      icon: Trophy,
      accent: "from-orange-500 to-red-600",
      feature: "hot"
    },
    {
      title: t('leaderboard'),
      description: t('leaderboardDescription') || "See where you stand globally",
      href: "/leaderboard",
      icon: Award,
      accent: "from-green-500 to-emerald-600",
      feature: "live"
    }
  ];

  // Secondary features - clean and minimal
  const secondaryFeatures = [
    { title: t('community'), href: "/people", icon: Users },
    { title: t('events') || "Events", href: "/events", icon: Calendar },
    { title: t('analytics'), href: "/analytics", icon: Activity }
  ];

  // Live stats - minimal and informative
  const liveStats = [
    { label: "Active Traders", value: "2,847", trend: "+12%" },
    { label: "Live Tournaments", value: "16", trend: "now" },
    { label: "Daily Volume", value: "$1.2M", trend: "+8%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-6 lg:py-8">
        
        {/* Personal Greeting Header */}
        <motion.div
          className="mb-8 lg:mb-10"
          {...fadeInUp}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight">
                {getGreeting()}, {user?.username || "Trader"}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2 flex items-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary/60" />
                {t('hubWelcomeMessage') || "Ready to make your mark on the markets?"}
              </p>
            </div>
            
            {/* Live indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Markets Live</span>
            </div>
          </div>
        </motion.div>

        {/* Primary Action Cards - Hero Section */}
        <motion.div
          className="mb-8 lg:mb-10"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
            {primaryActions.map((action, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Link href={action.href}>
                  <Card className="group relative overflow-hidden cursor-pointer border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.accent} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    {/* Feature badge */}
                    <div className="absolute top-4 right-4">
                      {action.feature === "trending" && (
                        <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-600 border-blue-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {action.feature === "hot" && (
                        <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-600 border-red-500/30">
                          <Zap className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                      {action.feature === "live" && (
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 border-green-500/30">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                          Live
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-4 lg:mb-6">
                        <div className={`p-3 lg:p-4 rounded-2xl bg-gradient-to-br ${action.accent} shadow-lg`}>
                          <action.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2 lg:mb-3 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
                        {action.description}
                      </p>
                      
                      <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform text-sm lg:text-base">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Bar - Minimal and Clean */}
        <motion.div
          className="mb-8 lg:mb-10"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Card className="border-0 bg-card/40 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-3 divide-x divide-border/50">
                {liveStats.map((stat, index) => (
                  <div key={index} className="text-center px-2 sm:px-4">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-xs text-primary font-medium">{stat.trend}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Features - Horizontal Strip */}
        <motion.div
          className="mb-8"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Quick Access</h2>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {secondaryFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Link href={feature.href}>
                  <Card className="group cursor-pointer border-0 bg-card/30 backdrop-blur-sm hover:bg-card/60 transition-all duration-200 hover:scale-105">
                    <CardContent className="p-4 lg:p-6 text-center">
                      <div className="flex justify-center mb-2 lg:mb-3">
                        <div className="p-2 lg:p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                          <feature.icon className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <h3 className="text-xs lg:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}