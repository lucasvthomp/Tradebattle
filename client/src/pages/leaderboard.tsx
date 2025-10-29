import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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



  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">{t('leaderboard')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('leaderboardDescription')}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="wagered" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Wagered
              </TabsTrigger>
              <TabsTrigger value="highwager" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Highest Wager
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Growth
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wagered" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Amount Wagered Leaderboard</CardTitle>
                  <p className="text-sm text-muted-foreground">Top players by cumulative tournament buy-ins</p>
                </CardHeader>
                <CardContent>
                  {wageredLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(wageredLeaderboard as any)?.data?.rankings?.map((user: any, index: number) => {
                        const rank = index + 1;

                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div>
                                <div className="font-semibold">{user.username}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.tournamentCount || 0} tournaments entered
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(user.totalWagered || 0)}</div>
                              <div className="text-sm text-muted-foreground">Total wagered</div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No wagering data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highwager" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Highest Wager Tournaments</CardTitle>
                  <p className="text-sm text-muted-foreground">Tournaments with the highest buy-in amounts</p>
                </CardHeader>
                <CardContent>
                  {highWagerLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(highWagerLeaderboard as any)?.data?.rankings?.map((tournament: any, index: number) => {
                        const rank = index + 1;

                        return (
                          <div
                            key={tournament.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div>
                                <div className="font-semibold">{tournament.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {tournament.currentPlayers} / {tournament.maxPlayers} players
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(tournament.buyInAmount || 0)}</div>
                              <div className="text-sm text-muted-foreground">Buy-in amount</div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No high wager tournament data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Growth in Tournament</CardTitle>
                  <p className="text-sm text-muted-foreground">Players with the highest percentage returns in a single tournament</p>
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(growthLeaderboard as any)?.data?.rankings?.map((participant: any, index: number) => {
                        const rank = index + 1;
                        const growth = participant.percentageChange || 0;

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
                                  {participant.tournamentName} • Starting: {formatCurrency(participant.startingBalance)}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(participant.portfolioValue)}</div>
                              <div className={`text-sm flex items-center gap-1 font-semibold ${
                                growth >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {growth >= 0 ? '+' : ''}{growth.toFixed(2)}% Growth
                              </div>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No growth data available
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