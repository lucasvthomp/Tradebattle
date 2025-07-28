import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tournaments");

  // Fetch tournaments leaderboard data with 5-minute refresh
  const { data: tournamentLeaderboard, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments/leaderboard'],
    enabled: activeTab === "tournaments",
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000, // 4 minutes to allow fresh data
  });

  // Fetch personal leaderboard data with 5-minute refresh
  const { data: personalLeaderboard, isLoading: personalLoading } = useQuery({
    queryKey: ['/api/personal/leaderboard'],
    enabled: activeTab === "personal",
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000, // 4 minutes to allow fresh data
  });

  // Fetch streak leaderboard data with 5-minute refresh
  const { data: streakLeaderboard, isLoading: streakLoading } = useQuery({
    queryKey: ['/api/streak/leaderboard'],
    enabled: activeTab === "streak",
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    staleTime: 4 * 60 * 1000, // 4 minutes to allow fresh data
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            See how you rank against other traders in tournaments and personal portfolios
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tournaments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Streak
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tournaments" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tournamentLeaderboard?.data?.totalTournaments || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tournamentLeaderboard?.data?.totalParticipants || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tournamentLeaderboard?.data?.yourRank || "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tournament Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  {tournamentsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tournamentLeaderboard?.data?.rankings?.map((participant: any, index: number) => {
                        const rank = index + 1;
                        const percentageChange = participant.percentageChange || 0;
                        
                        return (
                          <div
                            key={participant.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              participant.userId === user?.id ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div>
                                <div className="font-semibold">{participant.username}</div>
                                <div className="text-sm text-muted-foreground">
                                  {participant.tournamentName} (ID: {participant.tournamentId}) • Starting: {formatCurrency(participant.startingBalance)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(participant.portfolioValue)}</div>
                              <div className={`text-sm flex items-center gap-1 ${
                                percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No tournament data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Traders</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{personalLeaderboard?.data?.totalTraders || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {personalLeaderboard?.data?.yourRank || "N/A"}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{personalLeaderboard?.data?.totalUsers || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Portfolio Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  {personalLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {personalLeaderboard?.data?.rankings?.map((trader: any, index: number) => {
                        const rank = index + 1;
                        const percentageChange = trader.percentageChange || 0;
                        
                        return (
                          <div
                            key={trader.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              trader.id === user?.id ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {trader.username}
                                  {trader.subscriptionTier === 'premium' && (
                                    <Badge variant="outline" className="text-xs">Premium</Badge>
                                  )}
                                  {trader.subscriptionTier === 'administrator' && (
                                    <Badge variant="outline" className="text-xs text-blue-600">Administrator</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(trader.portfolioValue)}</div>
                              <div className={`text-sm flex items-center gap-1 ${
                                percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No personal portfolio data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="streak" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{streakLeaderboard?.data?.totalTraders || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{streakLeaderboard?.data?.totalUsers || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {streakLeaderboard?.data?.yourRank || "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Streak Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  {streakLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {streakLeaderboard?.data?.rankings?.map((trader: any, index: number) => {
                        const rank = index + 1;
                        const streak = trader.tradingStreak || 0;
                        
                        return (
                          <div
                            key={trader.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              trader.id === user?.id ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {trader.username}
                                  {trader.subscriptionTier === 'premium' && (
                                    <Badge variant="outline" className="text-xs">Premium</Badge>
                                  )}
                                  {trader.subscriptionTier === 'administrator' && (
                                    <Badge variant="outline" className="text-xs text-blue-600">Administrator</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                {streak} {streak === 1 ? 'Day' : 'Days'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {streak === 0 ? 'No streak' : `${streak} consecutive trading days`}
                              </div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No trading streak data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}