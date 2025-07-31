import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Trophy, 
  Users, 
  Target, 
  BarChart3,
  Calendar,
  ShoppingBag,
  MessageCircle,
  Award,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Globe,
  PlayCircle,
  Activity,
  Settings,
  ChevronRight,
  Flame,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function Hub() {
  const { user } = useAuth();

  // Main feature cards (like the games in Stake)
  const mainFeatures = [
    {
      title: "DASHBOARD",
      subtitle: "Trading Hub",
      description: "Your personal trading command center",
      href: "/dashboard",
      gradient: "from-blue-500 to-purple-600",
      icon: BarChart3,
      players: "Active Now"
    },
    {
      title: "TOURNAMENTS",
      subtitle: "Compete & Win", 
      description: "Join competitive trading battles",
      href: "/tournaments",
      gradient: "from-yellow-500 to-orange-600",
      icon: Trophy,
      players: "12 Active"
    },
    {
      title: "LEADERBOARD",
      subtitle: "Global Rankings",
      description: "See where you rank worldwide",
      href: "/leaderboard", 
      gradient: "from-green-500 to-teal-600",
      icon: Award,
      players: "Updated Live"
    },
    {
      title: "PEOPLE",
      subtitle: "Community Hub",
      description: "Connect with fellow traders",
      href: "/people",
      gradient: "from-pink-500 to-rose-600", 
      icon: Users,
      players: "10K+ Traders"
    },
    {
      title: "EVENTS",
      subtitle: "Special Events",
      description: "Exclusive trading competitions",
      href: "/events",
      gradient: "from-indigo-500 to-blue-600",
      icon: Calendar,
      players: "Coming Soon"
    },
    {
      title: "SHOP",
      subtitle: "Power-ups & More",
      description: "Enhance your trading experience", 
      href: "/shop",
      gradient: "from-purple-500 to-pink-600",
      icon: ShoppingBag,
      players: "New Items"
    }
  ];

  // Promotions section (like Stake's promotions)
  const promotions = [
    {
      title: "Weekly Tournament",
      description: "Join this week's mega tournament with $1,000 prize pool",
      badge: "HOT",
      badgeColor: "bg-red-500",
      action: "Join Now",
      href: "/tournaments",
      gradient: "from-red-500/20 to-orange-500/20"
    },
    {
      title: "Trading Streak Bonus",
      description: "Trade for 7 days straight and unlock exclusive badges",
      badge: "NEW",
      badgeColor: "bg-green-500", 
      action: "Start Streak",
      href: "/dashboard",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      title: "Refer Friends",
      description: "Invite friends and both get bonus starting capital",
      badge: "REWARD",
      badgeColor: "bg-blue-500",
      action: "Invite",
      href: "/people",
      gradient: "from-blue-500/20 to-cyan-500/20"
    }
  ];

  // Quick stats
  const stats = [
    { label: "Your Rank", value: "#247", change: "+12" },
    { label: "Win Rate", value: "73%", change: "+5%" },
    { label: "Active Tournaments", value: "3", change: "" },
    { label: "Total Trades", value: "156", change: "+8" }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Welcome Header */}
      <motion.div 
        className="mb-8"
        {...fadeInUp}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName || user?.displayName || "Trader"}! 
            </h1>
            <p className="text-muted-foreground">
              Ready to dominate the markets today?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              Online
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  {stat.change && (
                    <div className="text-xs text-green-500 mt-1">{stat.change}</div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Promotion Banner */}
      <motion.div 
        className="mb-8"
        {...fadeInUp}
      >
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className="bg-red-500 hover:bg-red-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      LIVE EVENT
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Mega Trading Championship - $5,000 Prize Pool
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Limited time event ending in 2 days. 500+ participants competing!
                  </p>
                </div>
              </div>
              <Link href="/tournaments">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                  Join Battle
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Features Grid */}
      <motion.div 
        className="mb-8"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <PlayCircle className="w-5 h-5 mr-2" />
          Trading Hub
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={feature.href}>
                <Card className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <CardContent className="relative p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`p-3 rounded-full bg-gradient-to-br ${feature.gradient}`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-2">
                      {feature.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      {feature.players}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Promotions Section */}
      <motion.div 
        className="mb-8"
        {...fadeInUp}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Promotions
          </h2>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {promotions.map((promo, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${promo.badgeColor} hover:${promo.badgeColor}`}>
                      {promo.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {promo.description}
                  </p>
                  <Link href={promo.href}>
                    <Button variant="secondary" size="sm" className="w-full">
                      {promo.action}
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        {...fadeInUp}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Trading Dashboard
                  <ChevronRight className="ml-auto w-4 h-4" />
                </Button>
              </Link>
              <Link href="/tournaments">
                <Button variant="outline" className="w-full justify-start">
                  <Trophy className="w-4 h-4 mr-3" />
                  Join Tournament
                  <ChevronRight className="ml-auto w-4 h-4" />
                </Button>
              </Link>
              <Link href="/people">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-3" />
                  Browse Community
                  <ChevronRight className="ml-auto w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Joined "Tech Stocks Battle"</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Bought 50 shares of AAPL</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Ranked up to #247</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}