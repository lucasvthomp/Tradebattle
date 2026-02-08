import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch tournaments
  const { data: tournamentsData } = useQuery({
    queryKey: ['/api/tournaments'],
  });

  const activeTournaments = tournamentsData?.data?.filter((t: any) => t.status === 'active') || [];
  const nextTournament = activeTournaments[0];

  const getTimeRemaining = () => {
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

  const primaryActions = [
    {
      title: "Trade Now",
      description: "Jump into action with your live portfolio",
      href: "/dashboard",
      icon: BarChart3,
      borderColor: '#28C76F',
      badge: "Live",
    },
    {
      title: "Join Tournament",
      description: `${activeTournaments.length} active tournaments waiting`,
      href: "/tournaments",
      icon: Trophy,
      borderColor: '#E3B341',
      badge: "Ongoing",
    },
    {
      title: "Leaderboard",
      description: "Compete for the top spot globally",
      href: "/leaderboard",
      icon: Award,
      borderColor: '#3B82F6',
      badge: "Top 100",
    }
  ];

  const quickStats = [
    {
      label: "Balance",
      value: formatCurrency(Number(user?.siteCash) || 0),
      icon: DollarSign,
      color: '#E3B341',
    },
    {
      label: "Active Trades",
      value: "--",
      icon: Activity,
      color: '#28C76F',
    },
    {
      label: "Tournaments",
      value: activeTournaments.length,
      icon: Trophy,
      color: '#E3B341',
    },
    {
      label: "Global Rank",
      value: "--",
      icon: Award,
      color: '#3B82F6',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#06121F' }}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10">
        {/* Hero Header */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="rounded-xl md:rounded-2xl p-1.5 md:p-2" style={{
                  backgroundColor: '#E3B341',
                }}>
                  <Crown className="w-8 h-8 md:w-12 md:h-12" style={{ color: '#06121F' }} />
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black" style={{ color: '#C9D1E2' }}>
                  {getGreeting()}, <span style={{ color: '#E3B341' }}>{user?.username}</span>!
                </h1>
              </div>
              <p className="flex items-center gap-2 text-sm md:text-base lg:text-lg" style={{ color: '#8A93A6' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C76F' }} />
                Ready to compete and win?
              </p>
            </div>

            {/* Balance Card */}
            <motion.div whileHover={{ y: -3 }} className="w-full lg:w-auto">
              <Card
                className="rounded-2xl relative overflow-hidden border-none"
                style={{
                  background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 50%, #a8822c 100%)',
                  minWidth: '100%',
                }}
              >
                <CardContent className="p-4 md:p-6 relative z-10">
                  <div className="mb-2 md:mb-3 flex items-center gap-2">
                    <div className="rounded-lg md:rounded-xl p-1.5 md:p-2" style={{
                      backgroundColor: 'rgba(6, 18, 31, 0.2)',
                    }}>
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#06121F' }} />
                    </div>
                    <div className="text-xs md:text-sm font-bold" style={{ color: '#06121F' }}>Your Balance</div>
                  </div>
                  <div className="mb-3 md:mb-4">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-black" style={{ color: '#06121F' }}>
                      {formatCurrency(Number(user?.siteCash) || 0)}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full h-12 font-bold text-base rounded-xl border-none" style={{
                        backgroundColor: '#06121F',
                        color: '#E3B341',
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

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
            >
              <Card
                className="transition-all rounded-xl md:rounded-2xl relative overflow-hidden border"
                style={{
                  backgroundColor: '#1E2D3F',
                  borderColor: '#2B3A4C',
                }}
              >
                <CardContent className="p-3 md:p-5 relative z-10">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="rounded-lg md:rounded-xl p-1.5 md:p-2" style={{
                      backgroundColor: `${stat.color}20`,
                    }}>
                      <stat.icon className="w-4 h-4 md:w-6 md:h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-semibold" style={{ color: '#8A93A6' }}>{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
          {primaryActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <Link href={action.href}>
                <Card
                  className="h-full cursor-pointer relative overflow-hidden group rounded-2xl border transition-colors"
                  style={{
                    backgroundColor: '#1E2D3F',
                    borderColor: '#2B3A4C',
                  }}
                >
                  {/* Badge */}
                  <Badge
                    className="absolute top-4 right-4 font-bold text-xs z-20 border-none"
                    style={{
                      backgroundColor: action.borderColor,
                      color: '#FFFFFF',
                      padding: '4px 10px'
                    }}
                  >
                    {action.badge}
                  </Badge>

                  <CardContent className="p-5 md:p-6 lg:p-8 relative z-10">
                    <div className="mb-4 md:mb-5">
                      <div className="rounded-xl md:rounded-2xl inline-block p-3 md:p-4" style={{
                        backgroundColor: `${action.borderColor}20`,
                      }}>
                        <action.icon className="w-10 h-10 md:w-12 md:h-12" style={{ color: action.borderColor }} />
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-2 md:mb-3" style={{ color: '#FFFFFF' }}>
                      {action.title}
                    </h3>
                    <p className="text-sm md:text-base mb-4 md:mb-6 leading-relaxed" style={{ color: '#8A93A6' }}>
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

        {/* Featured Tournament */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 md:mb-10"
        >
          <Link href="/tournaments">
            <Card
              className="cursor-pointer group relative overflow-hidden rounded-2xl border transition-colors"
              style={{
                backgroundColor: '#1E2D3F',
                borderColor: '#2B3A4C',
              }}
            >
              <CardContent className="p-4 md:p-6 lg:p-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                  <div>
                    <Badge
                      className="mb-3 md:mb-4 font-bold text-xs md:text-sm border-none"
                      style={{
                        backgroundColor: '#E3B341',
                        color: '#06121F'
                      }}
                    >
                      {nextTournament ? 'LIVE NOW' : 'TOURNAMENTS'}
                    </Badge>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 md:mb-4 flex items-center gap-2 md:gap-3" style={{ color: '#FFFFFF' }}>
                      <div className="rounded-lg md:rounded-xl p-1.5 md:p-2" style={{
                        backgroundColor: '#E3B34120',
                      }}>
                        <Trophy className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#E3B341' }} />
                      </div>
                      {nextTournament?.name || "No Active Tournaments"}
                    </h3>
                    {nextTournament && (
                      <>
                        <p className="text-sm md:text-base mb-4 md:mb-5" style={{ color: '#8A93A6' }}>
                          Buy-in: <span className="text-xl md:text-2xl font-black" style={{ color: '#28C76F' }}>
                            {formatCurrency(nextTournament.buyInAmount || 0)}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm mb-4 md:mb-6" style={{ color: '#8A93A6' }}>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                            backgroundColor: 'rgba(227, 179, 65, 0.1)',
                            border: '1px solid rgba(227, 179, 65, 0.2)'
                          }}>
                            <Users className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <span className="font-bold">{nextTournament.currentPlayers || 0} players</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                            backgroundColor: 'rgba(227, 179, 65, 0.1)',
                            border: '1px solid rgba(227, 179, 65, 0.2)'
                          }}>
                            <Timer className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <span className="font-bold">{getTimeRemaining()} left</span>
                          </div>
                        </div>
                      </>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="h-12 text-base font-bold border-none"
                        style={{
                          backgroundColor: '#E3B341',
                          color: '#06121F',
                        }}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {nextTournament ? 'Join Tournament Now' : 'Browse Tournaments'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="relative">
                    <div
                      className="text-center p-8 rounded-2xl"
                      style={{
                        backgroundColor: '#142538',
                        border: '1px solid #2B3A4C',
                      }}
                    >
                      <div className="mb-4">
                        <Crown className="w-16 h-16 mx-auto" style={{ color: '#E3B341' }} />
                      </div>
                      <div className="text-lg font-bold mb-3" style={{ color: '#C9D1E2' }}>First Place Wins</div>
                      <div className="text-4xl font-black mb-4" style={{ color: '#28C76F' }}>
                        {nextTournament ? formatCurrency((nextTournament.buyInAmount || 0) * (nextTournament.currentPlayers || 0) * 0.5) : '--'}
                      </div>
                      <p className="text-sm" style={{ color: '#8A93A6' }}>Top positions paid out</p>
                    </div>
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
