import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, DollarSign, Crown, Target, Zap, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// Placeholder data for testing
const mockWageredData = [
  { id: 1, username: "TradeMaster", totalWagered: 125000, tournamentCount: 42 },
  { id: 2, username: "WallStreetWolf", totalWagered: 98500, tournamentCount: 38 },
  { id: 3, username: "BullRun2024", totalWagered: 87200, tournamentCount: 35 },
  { id: 4, username: "DiamondHands", totalWagered: 76300, tournamentCount: 31 },
  { id: 5, username: "QuantKing", totalWagered: 65400, tournamentCount: 28 },
  { id: 6, username: "AlphaSeeker", totalWagered: 54200, tournamentCount: 24 },
  { id: 7, username: "MarketMaven", totalWagered: 48900, tournamentCount: 22 },
  { id: 8, username: "RiskTaker", totalWagered: 43100, tournamentCount: 19 },
  { id: 9, username: "GoldRush", totalWagered: 38700, tournamentCount: 17 },
  { id: 10, username: "TechBull", totalWagered: 35200, tournamentCount: 15 },
];

const mockHighWagerTournaments = [
  { id: 1, name: "Elite Traders Championship", buyInAmount: 25000, currentPlayers: 48, maxPlayers: 50, status: "active" },
  { id: 2, name: "High Stakes Spring Classic", buyInAmount: 20000, currentPlayers: 42, maxPlayers: 100, status: "active" },
  { id: 3, name: "Pro League Finals", buyInAmount: 15000, currentPlayers: 35, maxPlayers: 75, status: "waiting" },
  { id: 4, name: "Diamond Tier Showdown", buyInAmount: 12500, currentPlayers: 28, maxPlayers: 50, status: "active" },
  { id: 5, name: "Master Class Tournament", buyInAmount: 10000, currentPlayers: 45, maxPlayers: 60, status: "active" },
  { id: 6, name: "Premium Traders League", buyInAmount: 8500, currentPlayers: 33, maxPlayers: 40, status: "waiting" },
  { id: 7, name: "Gold Standard Series", buyInAmount: 7500, currentPlayers: 29, maxPlayers: 50, status: "active" },
  { id: 8, name: "Platinum Championship", buyInAmount: 6000, currentPlayers: 22, maxPlayers: 30, status: "active" },
];

const mockGrowthData = [
  { id: 1, username: "MoonShot", portfolioValue: 287500, startingBalance: 100000, percentageChange: 187.5, tournamentName: "Spring Growth Rally" },
  { id: 2, username: "VolatilityVince", portfolioValue: 245000, startingBalance: 100000, percentageChange: 145.0, tournamentName: "Tech Stocks Frenzy" },
  { id: 3, username: "GrowthGuru", portfolioValue: 198000, startingBalance: 100000, percentageChange: 98.0, tournamentName: "High Volatility Week" },
  { id: 4, username: "RocketTrader", portfolioValue: 176500, startingBalance: 100000, percentageChange: 76.5, tournamentName: "Momentum Masters" },
  { id: 5, username: "SmartMoney", portfolioValue: 165000, startingBalance: 100000, percentageChange: 65.0, tournamentName: "Value Investing Cup" },
  { id: 6, username: "TrendFollower", portfolioValue: 152000, startingBalance: 100000, percentageChange: 52.0, tournamentName: "Bull Market Sprint" },
  { id: 7, username: "SwingKing", portfolioValue: 143500, startingBalance: 100000, percentageChange: 43.5, tournamentName: "Swing Trading Pro" },
  { id: 8, username: "DayTraderPro", portfolioValue: 135200, startingBalance: 100000, percentageChange: 35.2, tournamentName: "Day Trading Finals" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [activeTab, setActiveTab] = useState("wagered");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-[#E3B341]" />;
      case 2:
        return <Award className="h-5 w-5 text-[#C9D1E2]" />;
      case 3:
        return <Target className="h-5 w-5 text-[#CD7F32]" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[#E3B341] text-[#0A1A2F]";
      case 2:
        return "bg-[#C9D1E2] text-[#0A1A2F]";
      case 3:
        return "bg-[#CD7F32] text-white";
      default:
        return "bg-[#142538] text-[#C9D1E2]";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8" style={{ color: '#E3B341' }} />
            <h1 className="text-4xl font-bold text-white">Leaderboards</h1>
          </div>
          <p className="text-[#8A93A6]">Top performers across all tournaments and categories</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1E2D3F] border border-[#2B3A4C]">
            <TabsTrigger
              value="wagered"
              className="text-[#8A93A6] data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F]"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Total Wagered
            </TabsTrigger>
            <TabsTrigger
              value="highwager"
              className="text-[#8A93A6] data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F]"
            >
              <Trophy className="h-4 w-4 mr-2" />
              High Stakes
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="text-[#8A93A6] data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F]"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Growth
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Total Wagered Tab */}
            <TabsContent value="wagered" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" style={{ color: '#E3B341' }} />
                    Top Traders by Total Wagered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockWageredData.map((trader, index) => {
                      const rank = index + 1;
                      return (
                        <motion.div
                          key={trader.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-[#2B3A4C] hover:border-[#E3B341] transition-all bg-[#1E2D3F]"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                              {rank <= 3 ? getRankIcon(rank) : rank}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{trader.username}</div>
                              <div className="text-sm text-[#8A93A6]">{trader.tournamentCount} tournaments</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg" style={{ color: '#E3B341' }}>
                              {formatCurrency(trader.totalWagered)}
                            </div>
                            <div className="text-xs text-[#8A93A6]">Total Wagered</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* High Wager Tournaments Tab */}
            <TabsContent value="highwager" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" style={{ color: '#E3B341' }} />
                    Highest Buy-In Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockHighWagerTournaments.map((tournament, index) => {
                      const rank = index + 1;
                      return (
                        <motion.div
                          key={tournament.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-[#2B3A4C] hover:border-[#E3B341] transition-all bg-[#1E2D3F]"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                              {rank <= 3 ? getRankIcon(rank) : rank}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{tournament.name}</div>
                              <div className="text-sm text-[#8A93A6]">
                                {tournament.currentPlayers}/{tournament.maxPlayers} players •
                                <span className={tournament.status === 'active' ? 'text-[#28C76F]' : 'text-[#E3B341]'}>
                                  {' '}{tournament.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg" style={{ color: '#E3B341' }}>
                              {formatCurrency(tournament.buyInAmount)}
                            </div>
                            <div className="text-xs text-[#8A93A6]">Buy-In</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Growth Tab */}
            <TabsContent value="growth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: '#E3B341' }} />
                    Highest Portfolio Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockGrowthData.map((participant, index) => {
                      const rank = index + 1;
                      return (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-[#2B3A4C] hover:border-[#E3B341] transition-all bg-[#1E2D3F]"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                              {rank <= 3 ? getRankIcon(rank) : rank}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{participant.username}</div>
                              <div className="text-sm text-[#8A93A6]">
                                {participant.tournamentName} • Started: {formatCurrency(participant.startingBalance)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-[#28C76F]">
                              +{participant.percentageChange.toFixed(1)}%
                            </div>
                            <div className="text-sm text-[#C9D1E2]">{formatCurrency(participant.portfolioValue)}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#142538]">
                  <DollarSign className="h-6 w-6" style={{ color: '#E3B341' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(652300)}</div>
                  <div className="text-sm text-[#8A93A6]">Total Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#142538]">
                  <Trophy className="h-6 w-6" style={{ color: '#E3B341' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">284</div>
                  <div className="text-sm text-[#8A93A6]">Active Tournaments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#142538]">
                  <Zap className="h-6 w-6" style={{ color: '#E3B341' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-sm text-[#8A93A6]">Active Traders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
