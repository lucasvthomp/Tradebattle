import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, DollarSign, Crown, Medal, Award, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [activeTab, setActiveTab] = useState("wagered");

  // Fetch total wagered leaderboard
  const { data: wageredLeaderboard, isLoading: wageredLoading } = useQuery({
    queryKey: ['/api/leaderboard/total-wagered'],
    enabled: activeTab === "wagered",
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000,
  });

  // Fetch highest wager tournaments
  const { data: highWagerLeaderboard, isLoading: highWagerLoading } = useQuery({
    queryKey: ['/api/leaderboard/highest-wager'],
    enabled: activeTab === "highwager",
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000,
  });

  // Fetch most growth leaderboard
  const { data: growthLeaderboard, isLoading: growthLoading } = useQuery({
    queryKey: ['/api/leaderboard/most-growth'],
    enabled: activeTab === "growth",
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000,
  });

  const getRankBadge = (rank: number) => {
    const badges = {
      1: {
        icon: <Crown className="h-5 w-5" />,
        bg: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600",
        ring: "ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/30",
        text: "text-yellow-900"
      },
      2: {
        icon: <Medal className="h-5 w-5" />,
        bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
        ring: "ring-2 ring-gray-400/50 shadow-lg shadow-gray-400/30",
        text: "text-gray-900"
      },
      3: {
        icon: <Award className="h-5 w-5" />,
        bg: "bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800",
        ring: "ring-2 ring-amber-600/50 shadow-lg shadow-amber-600/30",
        text: "text-amber-100"
      }
    };

    if (rank <= 3) {
      const badge = badges[rank as keyof typeof badges];
      return (
        <div className={`relative flex items-center justify-center w-12 h-12 rounded-full ${badge.bg} ${badge.ring}`}>
          <div className={badge.text}>
            {badge.icon}
          </div>
          {rank === 1 && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted border-2 border-border">
        <span className="text-lg font-bold text-muted-foreground">{rank}</span>
      </div>
    );
  };

  const getRowBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "bg-primary/10 border-primary hover:bg-primary/15";
    }

    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/5 via-yellow-400/10 to-amber-500/5 border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/5 via-gray-300/10 to-gray-400/5 border-gray-400/30 hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/5 via-amber-500/10 to-orange-600/5 border-amber-600/30 hover:border-amber-600/50 hover:shadow-lg hover:shadow-amber-600/20";
      default:
        return "bg-card border-border hover:border-primary/50 hover:bg-muted/50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-[1600px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-8 md:mb-10 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t('leaderboard')}
            </h1>
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            {t('leaderboardDescription')}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger
                value="wagered"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <DollarSign className="h-5 w-5" />
                <span className="hidden sm:inline">Total Wagered</span>
                <span className="sm:hidden">Wagered</span>
              </TabsTrigger>
              <TabsTrigger
                value="highwager"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <Trophy className="h-5 w-5" />
                <span className="hidden sm:inline">Highest Wager</span>
                <span className="sm:hidden">High</span>
              </TabsTrigger>
              <TabsTrigger
                value="growth"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="hidden sm:inline">Most Growth</span>
                <span className="sm:hidden">Growth</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="wagered" className="space-y-6">
                {/* Podium Display for Top 3 */}
                {!wageredLoading && (wageredLeaderboard as any)?.data?.rankings?.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-2 border-primary/20 p-4 sm:p-6 md:p-8 shadow-2xl"
                  >
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 md:mb-8 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500 animate-pulse" />
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                          Top 3 Champions
                        </span>
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500 animate-pulse" />
                      </h3>

                      <div className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
                        {/* 2nd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center border-4 border-gray-200 shadow-xl">
                              <Medal className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
                              2
                            </div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-gray-400/30 shadow-lg hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-lg mb-1 truncate">{(wageredLeaderboard as any).data.rankings[1].username}</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-gray-300 to-gray-600 bg-clip-text text-transparent mb-1">
                                {formatCurrency((wageredLeaderboard as any).data.rankings[1].totalWagered || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {(wageredLeaderboard as any).data.rankings[1].tournamentCount || 0} tournaments
                              </p>
                            </div>

                            {/* Podium */}
                            <div className="mt-4 bg-gradient-to-t from-gray-500 to-gray-400 h-32 lg:h-40 rounded-t-xl border-2 border-gray-300 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-4xl font-black text-white/80">2</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border-4 border-yellow-300 shadow-2xl">
                              <Crown className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                            </div>
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-2 -right-2 bg-yellow-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg"
                            >
                              1
                            </motion.div>
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              className="absolute -top-1 -left-1"
                            >
                              <Sparkles className="h-6 w-6 text-yellow-400" />
                            </motion.div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-yellow-500/30 to-amber-600/30 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-yellow-500/50 shadow-2xl hover:shadow-3xl hover:shadow-yellow-500/40 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-xl mb-1 truncate">{(wageredLeaderboard as any).data.rankings[0].username}</p>
                              <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-1">
                                {formatCurrency((wageredLeaderboard as any).data.rankings[0].totalWagered || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {(wageredLeaderboard as any).data.rankings[0].tournamentCount || 0} tournaments
                              </p>
                            </div>

                            {/* Podium - tallest */}
                            <div className="mt-4 bg-gradient-to-t from-amber-600 to-yellow-500 h-48 lg:h-56 rounded-t-xl border-2 border-yellow-400 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                              <motion.div
                                animate={{
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-transparent"
                              />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-5xl font-black text-white/90">1</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-800 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 flex items-center justify-center border-4 border-amber-500 shadow-xl">
                              <Award className="w-10 h-10 lg:w-12 lg:h-12 text-amber-100" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-amber-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
                              3
                            </div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-amber-600/30 shadow-lg hover:shadow-2xl hover:shadow-amber-600/30 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-lg mb-1 truncate">{(wageredLeaderboard as any).data.rankings[2].username}</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-800 bg-clip-text text-transparent mb-1">
                                {formatCurrency((wageredLeaderboard as any).data.rankings[2].totalWagered || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {(wageredLeaderboard as any).data.rankings[2].tournamentCount || 0} tournaments
                              </p>
                            </div>

                            {/* Podium */}
                            <div className="mt-4 bg-gradient-to-t from-orange-800 to-amber-700 h-24 lg:h-32 rounded-t-xl border-2 border-amber-600 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-4xl font-black text-white/80">3</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-primary" />
                      Complete Rankings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">All players ranked by cumulative tournament buy-ins</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {wageredLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
                        />
                      </div>
                    ) : (
                      <motion.div
                        className="space-y-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {(wageredLeaderboard as any)?.data?.rankings?.map((user: any, index: number) => {
                          const rank = index + 1;

                          return (
                            <motion.div
                              key={user.id}
                              variants={itemVariant}
                              whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.2 } }}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${getRowBackground(rank, false)}`}
                            >
                              <div className="flex items-center gap-4">
                                {getRankBadge(rank)}
                                <div>
                                  <div className="font-bold text-lg">{user.username}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Trophy className="h-3 w-3" />
                                    {user.tournamentCount || 0} tournaments entered
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                  {formatCurrency(user.totalWagered || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total wagered</div>
                              </div>
                            </motion.div>
                          );
                        }) || (
                          <div className="text-center py-12 text-muted-foreground">
                            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No wagering data available</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="highwager" className="space-y-6">
                {/* Podium Display for Top 3 Tournaments */}
                {!highWagerLoading && (highWagerLeaderboard as any)?.data?.rankings?.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-2 border-primary/20 p-8 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative">
                      <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                          Top 3 High Stakes Tournaments
                        </span>
                        <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
                      </h3>

                      <div className="flex items-end justify-center gap-4 lg:gap-8">
                        {/* 2nd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center border-4 border-gray-200 shadow-xl">
                              <Medal className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
                              2
                            </div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-gray-400/30 shadow-lg hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-lg mb-1 truncate">{(highWagerLeaderboard as any).data.rankings[1].name}</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-gray-300 to-gray-600 bg-clip-text text-transparent mb-1">
                                {formatCurrency((highWagerLeaderboard as any).data.rankings[1].buyInAmount || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                {(highWagerLeaderboard as any).data.rankings[1].currentPlayers}/{(highWagerLeaderboard as any).data.rankings[1].maxPlayers} players
                              </p>
                            </div>
                            <div className="mt-4 bg-gradient-to-t from-gray-500 to-gray-400 h-32 lg:h-40 rounded-t-xl border-2 border-gray-300 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-4xl font-black text-white/80">2</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border-4 border-yellow-300 shadow-2xl">
                              <Crown className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                            </div>
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-2 -right-2 bg-yellow-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg"
                            >
                              1
                            </motion.div>
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              className="absolute -top-1 -left-1"
                            >
                              <Sparkles className="h-6 w-6 text-yellow-400" />
                            </motion.div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-yellow-500/30 to-amber-600/30 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-yellow-500/50 shadow-2xl hover:shadow-3xl hover:shadow-yellow-500/40 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-xl mb-1 truncate">{(highWagerLeaderboard as any).data.rankings[0].name}</p>
                              <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-1">
                                {formatCurrency((highWagerLeaderboard as any).data.rankings[0].buyInAmount || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                {(highWagerLeaderboard as any).data.rankings[0].currentPlayers}/{(highWagerLeaderboard as any).data.rankings[0].maxPlayers} players
                              </p>
                            </div>
                            <div className="mt-4 bg-gradient-to-t from-amber-600 to-yellow-500 h-48 lg:h-56 rounded-t-xl border-2 border-yellow-400 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                              <motion.div
                                animate={{
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-transparent"
                              />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-5xl font-black text-white/90">1</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="flex flex-col items-center flex-1 max-w-xs"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="relative mb-4 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-800 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 flex items-center justify-center border-4 border-amber-500 shadow-xl">
                              <Award className="w-10 h-10 lg:w-12 lg:h-12 text-amber-100" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-amber-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
                              3
                            </div>
                          </motion.div>

                          <div className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 backdrop-blur-sm rounded-2xl p-4 w-full border-2 border-amber-600/30 shadow-lg hover:shadow-2xl hover:shadow-amber-600/30 transition-all duration-300">
                            <div className="text-center">
                              <p className="font-bold text-lg mb-1 truncate">{(highWagerLeaderboard as any).data.rankings[2].name}</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-800 bg-clip-text text-transparent mb-1">
                                {formatCurrency((highWagerLeaderboard as any).data.rankings[2].buyInAmount || 0)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                {(highWagerLeaderboard as any).data.rankings[2].currentPlayers}/{(highWagerLeaderboard as any).data.rankings[2].maxPlayers} players
                              </p>
                            </div>
                            <div className="mt-4 bg-gradient-to-t from-orange-800 to-amber-700 h-24 lg:h-32 rounded-t-xl border-2 border-amber-600 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-4xl font-black text-white/80">3</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-primary" />
                      All High Wager Tournaments
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Complete list of tournaments with the highest buy-in amounts</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {highWagerLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
                        />
                      </div>
                    ) : (
                      <motion.div
                        className="space-y-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {(highWagerLeaderboard as any)?.data?.rankings?.map((tournament: any, index: number) => {
                          const rank = index + 1;

                          return (
                            <motion.div
                              key={tournament.id}
                              variants={itemVariant}
                              whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.2 } }}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${getRowBackground(rank, false)}`}
                            >
                              <div className="flex items-center gap-4">
                                {getRankBadge(rank)}
                                <div>
                                  <div className="font-bold text-lg">{tournament.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {tournament.currentPlayers} / {tournament.maxPlayers} players
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                  {formatCurrency(tournament.buyInAmount || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Buy-in amount</div>
                              </div>
                            </motion.div>
                          );
                        }) || (
                          <div className="text-center py-12 text-muted-foreground">
                            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No high wager tournament data available</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="growth" className="space-y-6">
                <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Most Growth in Tournament
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Players with the highest percentage returns in a single tournament</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {growthLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
                        />
                      </div>
                    ) : (
                      <motion.div
                        className="space-y-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {(growthLeaderboard as any)?.data?.rankings?.map((participant: any, index: number) => {
                          const rank = index + 1;
                          const growth = participant.percentageChange || 0;
                          const isCurrentUser = participant.userId === user?.id;

                          return (
                            <motion.div
                              key={participant.id}
                              variants={itemVariant}
                              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${getRowBackground(rank, isCurrentUser)}`}
                            >
                              <div className="flex items-center gap-4">
                                {getRankBadge(rank)}
                                <div>
                                  <div className="font-bold text-lg flex items-center gap-2">
                                    {participant.username}
                                    {isCurrentUser && (
                                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {participant.tournamentName} • Starting: {formatCurrency(participant.startingBalance)}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                  {formatCurrency(participant.portfolioValue)}
                                </div>
                                <div className={`text-sm flex items-center justify-end gap-1 font-bold ${
                                  growth >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  <TrendingUp className="h-4 w-4" />
                                  {growth >= 0 ? '+' : ''}{growth.toFixed(2)}% Growth
                                </div>
                              </div>
                            </motion.div>
                          );
                        }) || (
                          <div className="text-center py-12 text-muted-foreground">
                            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No growth data available</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
