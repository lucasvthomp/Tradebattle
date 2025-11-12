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
      gradient: 'linear-gradient(135deg, #1a4d2e 0%, #1E2D3F 50%, #0d2619 100%)',
      borderColor: '#28C76F',
      badge: "Live",
      badgeColor: "#28C76F",
      decorIcon: Rocket,
      decorColor: '#28C76F',
    },
    {
      title: "Join Tournament",
      description: `${activeTournaments.length} active tournaments waiting`,
      href: "/tournaments",
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #4a3a1a 0%, #1E2D3F 50%, #2d2210 100%)',
      borderColor: '#E3B341',
      badge: "Ongoing",
      badgeColor: "#E3B341",
      decorIcon: Crown,
      decorColor: '#E3B341',
    },
    {
      title: "Leaderboard",
      description: "Compete for the top spot globally",
      href: "/leaderboard",
      icon: Award,
      gradient: 'linear-gradient(135deg, #1a2d4a 0%, #1E2D3F 50%, #0d1a2d 100%)',
      borderColor: '#3B82F6',
      badge: "Top 100",
      badgeColor: "#3B82F6",
      decorIcon: Star,
      decorColor: '#FFD700',
    }
  ];

  const quickStats = [
    {
      label: "Balance",
      value: formatCurrency(Number(user?.siteCash) || 0),
      icon: DollarSign,
      color: '#E3B341',
      gradient: 'linear-gradient(135deg, #4a3a1a 0%, #2a2415 100%)',
      decorSymbol: '$'
    },
    {
      label: "Active Trades",
      value: "12",
      icon: Activity,
      color: '#28C76F',
      gradient: 'linear-gradient(135deg, #1a4d2e 0%, #0f2a1a 100%)',
      decorSymbol: '↗'
    },
    {
      label: "Tournaments",
      value: activeTournaments.length,
      icon: Trophy,
      color: '#E3B341',
      gradient: 'linear-gradient(135deg, #3a2f1a 0%, #221a10 100%)',
      decorSymbol: '🏆'
    },
    {
      label: "Global Rank",
      value: "#152",
      icon: Award,
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #1a2d4a 0%, #0f1a2d 100%)',
      decorSymbol: '★'
    },
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

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Hero Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <motion.div
                className="flex items-center gap-3 mb-3"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="rounded-2xl p-2" style={{
                  background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 100%)',
                  boxShadow: '0 0 20px rgba(227, 179, 65, 0.4)'
                }}>
                  <Crown className="w-12 h-12" style={{ color: '#06121F' }} />
                </div>
                <h1 className="text-5xl font-black">
                  {getGreeting()}, <span style={{ color: '#E3B341' }}>{user?.username}</span>! 👋
                </h1>
              </motion.div>
              <p className="flex items-center gap-2 text-lg" style={{ color: '#8A93A6' }}>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#28C76F' }} />
                Ready to compete and win? 🚀
              </p>
            </div>

            {/* Balance Card */}
            <motion.div whileHover={{ scale: 1.03, rotate: 2 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="rounded-3xl shadow-2xl relative overflow-hidden border-none"
                style={{
                  background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 50%, #a8822c 100%)',
                  minWidth: '280px',
                  boxShadow: '0 10px 40px rgba(227, 179, 65, 0.4), 0 0 30px rgba(227, 179, 65, 0.2)'
                }}
              >
                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 opacity-20">
                  <div className="text-8xl">💰</div>
                </div>
                <div className="absolute -left-4 -bottom-4 opacity-20">
                  <DollarSign className="w-24 h-24" style={{ color: '#FFFFFF' }} />
                </div>

                <CardContent className="p-6 relative z-10">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-xl p-2" style={{
                      backgroundColor: 'rgba(6, 18, 31, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Coins className="w-5 h-5" style={{ color: '#06121F' }} />
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#06121F' }}>Your Balance</div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-5xl font-black" style={{
                      color: '#06121F',
                      textShadow: '0 2px 10px rgba(6, 18, 31, 0.3)'
                    }}>
                      {formatCurrency(Number(user?.siteCash) || 0)}
                    </span>
                    <span className="text-3xl">📈</span>
                  </div>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full h-12 font-bold text-base rounded-xl shadow-lg border-none" style={{
                        background: 'linear-gradient(135deg, #06121F 0%, #0a1929 100%)',
                        color: '#E3B341',
                        boxShadow: '0 4px 20px rgba(6, 18, 31, 0.6)'
                      }}>
                        <Zap className="w-5 h-5 mr-2" />
                        Trade Now ⚡
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08, y: -8, rotate: i % 2 === 0 ? 2 : -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className="transition-all rounded-2xl shadow-xl relative overflow-hidden border-none"
                style={{
                  background: stat.gradient,
                  boxShadow: `0 5px 30px rgba(0,0,0,0.4), 0 0 20px ${stat.color}30`
                }}
              >
                {/* Background decorative symbol - larger and more prominent */}
                <div className="absolute -right-2 -bottom-2 text-8xl font-bold opacity-15" style={{ color: stat.color }}>
                  {stat.decorSymbol}
                </div>

                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-xl p-2" style={{
                      background: `linear-gradient(135deg, ${stat.color}40, ${stat.color}20)`,
                      boxShadow: `0 0 20px ${stat.color}40`
                    }}>
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 opacity-60" style={{ color: stat.color }} />
                    </motion.div>
                  </div>
                  <div className="text-4xl font-black mb-1" style={{
                    color: '#FFFFFF',
                    textShadow: `0 2px 15px ${stat.color}40`
                  }}>{stat.value}</div>
                  <div className="text-sm font-semibold" style={{ color: '#A8B5C9' }}>{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary Action Cards */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          {primaryActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -8, rotate: i % 2 === 0 ? 1 : -1 }}
            >
              <Link href={action.href}>
                <Card
                  className="h-full cursor-pointer relative overflow-hidden group rounded-3xl shadow-2xl border-none"
                  style={{
                    background: action.gradient,
                    boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 30px ${action.borderColor}35`
                  }}
                >
                  {/* Glowing overlay on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-25"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${action.borderColor}60, transparent)` }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Decorative icon in background - more prominent */}
                  <div className="absolute right-2 bottom-2 opacity-15">
                    <action.decorIcon className="w-32 h-32" style={{ color: action.decorColor }} />
                  </div>

                  {/* Additional decorative elements */}
                  <div className="absolute left-4 top-4 opacity-10 text-4xl">
                    {i === 0 && '📊'}
                    {i === 1 && '🏆'}
                    {i === 2 && '⭐'}
                  </div>

                  {/* Badge */}
                  <Badge
                    className="absolute top-4 right-4 animate-pulse font-bold text-xs z-20 shadow-lg border-none"
                    style={{
                      background: `linear-gradient(135deg, ${action.badgeColor}, ${action.badgeColor}cc)`,
                      color: '#FFFFFF',
                      padding: '6px 12px'
                    }}
                  >
                    {action.badge}
                  </Badge>

                  <CardContent className="p-8 relative z-10">
                    {/* Main icon with animation */}
                    <motion.div
                      className="mb-5"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                        y: [0, -8, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <div className="rounded-2xl inline-block p-4" style={{
                        background: `linear-gradient(135deg, ${action.borderColor}40, ${action.borderColor}20)`,
                        boxShadow: `0 0 30px ${action.borderColor}50`
                      }}>
                        <action.icon className="w-14 h-14" style={{ color: action.borderColor }} />
                      </div>
                    </motion.div>

                    <h3 className="text-3xl font-black mb-3" style={{
                      color: '#FFFFFF',
                      textShadow: `0 2px 15px ${action.borderColor}40`
                    }}>{action.title}</h3>
                    <p className="text-base mb-6 leading-relaxed" style={{ color: '#B8C5D6' }}>
                      {action.description}
                    </p>

                    <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all text-base" style={{ color: action.borderColor }}>
                      <span>Let's Go</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
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
          whileHover={{ scale: 1.02 }}
        >
          <Link href="/tournaments">
            <Card
              className="cursor-pointer group relative overflow-hidden rounded-3xl shadow-2xl border-none"
              style={{
                background: 'linear-gradient(135deg, #4a3a1a 0%, #1E2D3F 40%, #2a1f0a 100%)',
                boxShadow: '0 15px 50px rgba(0,0,0,0.5), 0 0 40px rgba(227, 179, 65, 0.3)'
              }}
            >
              {/* Glowing overlay on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20"
                style={{ background: 'radial-gradient(circle at 50% 50%, #E3B341, transparent)' }}
                transition={{ duration: 0.3 }}
              />

              {/* Decorative trophy in background - more prominent */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-12">
                <Trophy className="w-72 h-72" style={{ color: '#E3B341' }} />
              </div>

              {/* Additional decorative elements */}
              <div className="absolute left-6 top-6 opacity-10 text-5xl">💎</div>
              <div className="absolute right-20 bottom-6 opacity-10 text-4xl">⚡</div>

              <CardContent className="p-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge
                      className="mb-4 animate-pulse font-bold text-sm border-none shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #E3B341, #c99a35)',
                        color: '#06121F'
                      }}
                    >
                      <Flame className="w-4 h-4 mr-1" />
                      LIVE NOW 🔥
                    </Badge>
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3" style={{
                      color: '#FFFFFF',
                      textShadow: '0 2px 20px rgba(227, 179, 65, 0.5)'
                    }}>
                      <div className="rounded-xl p-2" style={{
                        background: 'linear-gradient(135deg, #E3B34140, #E3B34120)',
                        boxShadow: '0 0 20px rgba(227, 179, 65, 0.4)'
                      }}>
                        <Trophy className="w-8 h-8" style={{ color: '#E3B341' }} />
                      </div>
                      {nextTournament?.name || "Weekly Championship"}
                    </h3>
                    <p className="text-base mb-5" style={{ color: '#B8C5D6' }}>
                      Prize Pool: <span className="text-3xl font-black" style={{
                        color: '#28C76F',
                        textShadow: '0 2px 15px rgba(40, 199, 111, 0.5)'
                      }}>$7,500 💵</span>
                    </p>
                    <div className="flex items-center gap-6 text-sm mb-6" style={{ color: '#B8C5D6' }}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                        backgroundColor: 'rgba(227, 179, 65, 0.1)',
                        border: '1px solid rgba(227, 179, 65, 0.2)'
                      }}>
                        <Users className="w-5 h-5" style={{ color: '#E3B341' }} />
                        <span className="font-bold">248 players 👥</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                        backgroundColor: 'rgba(227, 179, 65, 0.1)',
                        border: '1px solid rgba(227, 179, 65, 0.2)'
                      }}>
                        <Timer className="w-5 h-5" style={{ color: '#E3B341' }} />
                        <span className="font-bold">18h left ⏰</span>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="h-12 text-base font-bold shadow-lg border-none"
                        style={{
                          background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 100%)',
                          color: '#06121F',
                          boxShadow: '0 4px 20px rgba(227, 179, 65, 0.5)'
                        }}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Join Tournament Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="relative">
                    <motion.div
                      className="text-center p-8 rounded-2xl border-none"
                      style={{
                        background: 'linear-gradient(135deg, #1a4d2e 0%, #0d2619 100%)',
                        boxShadow: '0 10px 30px rgba(40, 199, 111, 0.3), 0 0 20px rgba(40, 199, 111, 0.2)'
                      }}
                      animate={{ scale: [1, 1.03, 1], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="mb-4 relative">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Crown className="w-20 h-20 mx-auto" style={{ color: '#E3B341' }} />
                        </motion.div>
                        <div className="absolute -right-4 -top-4 text-4xl">👑</div>
                      </div>
                      <div className="text-xl font-bold mb-3" style={{ color: '#FFFFFF' }}>First Place Wins</div>
                      <div className="text-5xl font-black mb-2" style={{
                        color: '#28C76F',
                        textShadow: '0 2px 20px rgba(40, 199, 111, 0.6)'
                      }}>$2,500</div>
                      <div className="text-3xl mb-3">🎯</div>
                      <p className="text-sm" style={{ color: '#A8B5C9' }}>Top 20 positions paid out 💰</p>
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
