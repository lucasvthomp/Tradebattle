import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Award,
  BarChart3,
  Zap,
  Star,
  DollarSign,
  ArrowRight,
  Flame,
  Crown,
  Sparkles,
  Timer,
  Users,
  Activity,
  TrendingUp,
  Target,
  Rocket,
  Coins,
  LineChart,
  PieChart,
  Percent
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

const FloatingIcons = () => {
  const icons = [
    { Icon: Trophy, color: '#E3B341', delay: 0, x: '10%', y: '20%' },
    { Icon: DollarSign, color: '#28C76F', delay: 1, x: '85%', y: '15%' },
    { Icon: Crown, color: '#E3B341', delay: 2, x: '75%', y: '65%' },
    { Icon: Star, color: '#FFD700', delay: 3, x: '15%', y: '75%' },
    { Icon: Rocket, color: '#FF4F58', delay: 1.5, x: '50%', y: '10%' },
    { Icon: TrendingUp, color: '#28C76F', delay: 2.5, x: '90%', y: '45%' },
    { Icon: Target, color: '#3B82F6', delay: 0.5, x: '5%', y: '50%' },
    { Icon: Coins, color: '#E3B341', delay: 3.5, x: '30%', y: '85%' },
    { Icon: Zap, color: '#FFD700', delay: 2, x: '60%', y: '80%' },
    { Icon: LineChart, color: '#3B82F6', delay: 1, x: '40%', y: '25%' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: item.x,
            top: item.y,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            rotate: [0, 15, -15, 0],
            opacity: [0.08, 0.2, 0.08],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + i * 0.5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <item.Icon className="w-20 h-20" style={{ color: item.color }} />
        </motion.div>
      ))}

      {/* Animated currency symbols */}
      {['$', '€', '¥', '₿'].map((symbol, i) => (
        <motion.div
          key={`symbol-${i}`}
          className="absolute text-6xl font-bold"
          style={{
            left: `${25 + i * 20}%`,
            top: `${40 + (i % 2) * 30}%`,
            color: i % 2 === 0 ? '#E3B341' : '#28C76F',
            opacity: 0.06,
          }}
          animate={{
            y: [-40, 40, -40],
            rotate: [0, 20, -20, 0],
            opacity: [0.03, 0.12, 0.03],
          }}
          transition={{
            duration: 6 + i,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default function Hub() {
  const { user } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch tournaments
  const { data: tournamentsData } = useQuery({
    queryKey: ['/api/tournaments'],
  });

  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];
  const nextTournament = activeTournaments[0];

  const primaryActions = [
    {
      title: "Trade Now",
      description: "Jump into action with your live portfolio",
      href: "/dashboard",
      icon: BarChart3,
      bgColor: '#1E2D3F',
      borderColor: '#28C76F',
      badge: "Live",
      badgeColor: "#28C76F",
    },
    {
      title: "Join Tournament",
      description: `${activeTournaments.length} active tournaments waiting`,
      href: "/tournaments",
      icon: Trophy,
      bgColor: '#1E2D3F',
      borderColor: '#E3B341',
      badge: "Ongoing",
      badgeColor: "#E3B341",
    },
    {
      title: "Leaderboard",
      description: "Compete for the top spot globally",
      href: "/leaderboard",
      icon: Crown,
      bgColor: '#1E2D3F',
      borderColor: '#E3B341',
      badge: "Top 100",
      badgeColor: "#E3B341",
    }
  ];

  const quickStats = [
    { label: "Balance", value: formatCurrency(Number(user?.siteCash) || 0), icon: DollarSign, color: '#E3B341' },
    { label: "Active Trades", value: "12", icon: Activity, color: '#28C76F' },
    { label: "Tournaments", value: activeTournaments.length, icon: Trophy, color: '#E3B341' },
    { label: "Global Rank", value: "#152", icon: Award, color: '#3B82F6' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#06121F' }}>
      {/* Floating Background */}
      <FloatingIcons />

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(227, 179, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(227, 179, 65, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto py-8 relative z-10">
        {/* Hero Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <motion.div
                className="flex items-center gap-3 mb-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown className="w-10 h-10" style={{ color: '#E3B341' }} />
                <h1 className="text-5xl font-black">
                  {getGreeting()}, <span style={{ color: '#E3B341' }}>{user?.username}</span>!
                </h1>
              </motion.div>
              <p className="text-xl flex items-center gap-2" style={{ color: '#8A93A6' }}>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#28C76F' }} />
                Ready to compete and win?
              </p>
            </div>

            {/* Balance Card */}
            <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#E3B341', borderWidth: '2px' }} className="min-w-[280px]">
              <CardContent className="p-6">
                <div className="text-sm mb-1" style={{ color: '#8A93A6' }}>Your Balance</div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8" style={{ color: '#E3B341' }} />
                  <span className="text-3xl font-black" style={{ color: '#E3B341' }}>
                    {formatCurrency(Number(user?.siteCash) || 0)}
                  </span>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full mt-4 font-bold" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                    <Zap className="w-4 h-4 mr-2" />
                    Trade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }} className="transition-all hover:border-[#E3B341]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 opacity-50" style={{ color: '#E3B341' }} />
                    </motion.div>
                  </div>
                  <div className="text-2xl font-black mb-1" style={{ color: '#C9D1E2' }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: '#8A93A6' }}>{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary Action Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {primaryActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Link href={action.href}>
                <Card
                  className="h-full cursor-pointer relative overflow-hidden group"
                  style={{
                    backgroundColor: action.bgColor,
                    borderColor: action.borderColor,
                    borderWidth: '2px'
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10"
                    style={{ backgroundColor: action.borderColor }}
                    transition={{ duration: 0.3 }}
                  />

                  <Badge
                    className="absolute top-4 right-4 animate-pulse font-bold"
                    style={{ backgroundColor: action.badgeColor, color: '#FFFFFF' }}
                  >
                    {action.badge}
                  </Badge>

                  <CardContent className="p-8 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <action.icon className="w-16 h-16 mb-4" style={{ color: action.borderColor }} />
                    </motion.div>

                    <h3 className="text-3xl font-black mb-3" style={{ color: '#C9D1E2' }}>{action.title}</h3>
                    <p className="mb-6 text-sm" style={{ color: '#8A93A6' }}>{action.description}</p>

                    <div className="flex items-center gap-2 font-bold group-hover:gap-3 transition-all" style={{ color: action.borderColor }}>
                      <span>Let's Go</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Tournament */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <Link href="/tournaments">
            <Card
              className="cursor-pointer group relative overflow-hidden"
              style={{ backgroundColor: '#1E2D3F', borderColor: '#E3B341', borderWidth: '2px' }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-10"
                style={{ backgroundColor: '#E3B341' }}
                transition={{ duration: 0.3 }}
              />

              <CardContent className="p-5 relative z-10">
                <div className="grid md:grid-cols-2 gap-5 items-center">
                  <div>
                    <Badge
                      className="mb-3 animate-pulse font-bold text-xs"
                      style={{ backgroundColor: '#E3B341', color: '#06121F' }}
                    >
                      <Flame className="w-3 h-3 mr-1" />
                      LIVE NOW
                    </Badge>
                    <h3 className="text-2xl font-black mb-3 flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                      <Trophy className="w-7 h-7" style={{ color: '#E3B341' }} />
                      {nextTournament?.name || "Weekly Championship"}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#8A93A6' }}>
                      Prize Pool: <span className="text-2xl font-black" style={{ color: '#28C76F' }}>$7,500</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs mb-4" style={{ color: '#8A93A6' }}>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" style={{ color: '#E3B341' }} />
                        <span className="font-semibold">248 players</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4" style={{ color: '#E3B341' }} />
                        <span className="font-semibold">18h left</span>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="font-bold"
                        style={{ backgroundColor: '#E3B341', color: '#06121F' }}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Join Tournament Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="relative">
                    <motion.div
                      className="text-center p-5 rounded-lg"
                      style={{ backgroundColor: '#142538', borderColor: '#2B3A4C', borderWidth: '1px' }}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Crown className="w-14 h-14 mx-auto mb-3" style={{ color: '#E3B341' }} />
                      <div className="text-lg font-bold mb-2" style={{ color: '#C9D1E2' }}>First Place Wins</div>
                      <div className="text-3xl font-black" style={{ color: '#28C76F' }}>$2,500</div>
                      <p className="text-xs mt-2" style={{ color: '#8A93A6' }}>Top 20 positions paid out</p>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
