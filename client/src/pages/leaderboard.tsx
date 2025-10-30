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
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t('leaderboard')}
            </h1>
            <Trophy className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('leaderboardDescription')}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="max-w-6xl mx-auto">
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
                <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-primary" />
                      Total Amount Wagered Leaderboard
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Top players by cumulative tournament buy-ins</p>
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
                              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
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
                <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-primary" />
                      Highest Wager Tournaments
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Tournaments with the highest buy-in amounts</p>
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
                              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
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
