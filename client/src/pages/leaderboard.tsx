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
        return <Award className="h-5 w-5 text-[#CBD5E1]" />;
      case 3:
        return <Target className="h-5 w-5 text-[#CD7F32]" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-[#FFD700] via-[#E3B341] to-[#c99a35] text-[#080C14]";
      case 2:
        return "bg-gradient-to-br from-[#CBD5E1] via-[#94A3B8] to-[#64748B] text-[#080C14]";
      case 3:
        return "bg-gradient-to-br from-[#CD7F32] via-[#b3692a] to-[#995d24] text-white";
      default:
        return "bg-[#0F172A] text-[#F1F5F9]";
    }
  };

  const renderPodium = (data: any[], type: 'wagered' | 'growth') => {
    const top3 = data.slice(0, 3);
    const [first, second, third] = top3;

    return (
      <div className="mb-12 relative">

        {/* Podium Container */}
        <div className="flex items-end justify-center gap-8 mb-8 px-8">
          {/* 2nd Place - Left (Silver) */}
          {second && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center"
              style={{ width: '220px' }}
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-3xl p-7 border-none shadow-2xl relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #64748B 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(8, 12, 20, 0.3)' }}
                  >
                    <Award className="w-12 h-12" style={{ color: '#080C14' }} />
                  </div>
                  <div className="text-2xl font-black mb-2" style={{ color: '#080C14' }}>{second.username}</div>
                  <div className="text-3xl font-black" style={{ color: '#080C14' }}>
                    {type === 'wagered' ? formatCurrency(second.totalWagered) : `+${second.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              <div
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  height: 160,
                  background: 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 50%, #64748B 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderBottom: 'none'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-black mb-2" style={{ color: 'rgba(8, 12, 20, 0.9)' }}>2</div>
                  <div className="text-base font-bold tracking-wider" style={{ color: 'rgba(8, 12, 20, 0.7)' }}>SILVER</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place - Center (Gold - Tallest) */}
          {first && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
              className="flex flex-col items-center"
              style={{ width: '240px' }}
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-3xl p-8 shadow-lg relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #E3B341 30%, #c99a35 60%, #a87d28 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.4)'
                }}
              >
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(8, 12, 20, 0.3)' }}
                  >
                    <Crown className="w-14 h-14" style={{ color: '#080C14' }} />
                  </div>
                  <div className="text-3xl font-black mb-3" style={{ color: '#080C14' }}>{first.username}</div>
                  <div className="text-4xl font-black" style={{ color: '#080C14' }}>
                    {type === 'wagered' ? formatCurrency(first.totalWagered) : `+${first.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              <div
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  height: 200,
                  background: 'linear-gradient(180deg, #FFD700 0%, #E3B341 30%, #c99a35 60%, #9a7728 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderBottom: 'none'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-8xl font-black mb-2" style={{ color: 'rgba(8, 12, 20, 0.9)' }}>1</div>
                  <div className="text-lg font-bold tracking-widest" style={{ color: 'rgba(8, 12, 20, 0.8)' }}>GOLD</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place - Right (Bronze) */}
          {third && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center"
              style={{ width: '220px' }}
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-3xl p-7 border-none shadow-2xl relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #CD7F32 0%, #b3692a 50%, #995d24 100%)',
                  border: '2px solid rgba(205, 127, 50, 0.4)'
                }}
              >
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-2">{third.username}</div>
                  <div className="text-3xl font-black text-white">
                    {type === 'wagered' ? formatCurrency(third.totalWagered) : `+${third.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              <div
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  height: 130,
                  background: 'linear-gradient(180deg, #CD7F32 0%, #b3692a 50%, #995d24 100%)',
                  border: '1px solid rgba(205, 127, 50, 0.3)',
                  borderBottom: 'none'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-black text-white mb-2">3</div>
                  <div className="text-base font-bold tracking-wider text-white opacity-90">BRONZE</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#080C14' }}>
      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="rounded-2xl p-3" style={{
              backgroundColor: '#E3B341',
            }}>
              <Trophy className="w-10 h-10" style={{ color: '#080C14' }} />
            </div>
            <h1 className="text-6xl font-black text-white">Global Leaderboards 🏆</h1>
          </div>
          <p className="text-xl text-[#94A3B8]">Top performers across all tournaments and categories</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 rounded-xl border-none shadow-lg" style={{
            background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)'
          }}>
            <TabsTrigger
              value="wagered"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#080C14] rounded-lg text-base font-bold"
              style={activeTab === "wagered" ? {} : { color: '#94A3B8' }}
            >
              <DollarSign className="w-5 h-5 mr-2" style={{ color: activeTab === "wagered" ? undefined : '#94A3B8' }} />
              Total Wagered
            </TabsTrigger>
            <TabsTrigger
              value="highwager"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#080C14] rounded-lg text-base font-bold"
              style={activeTab === "highwager" ? {} : { color: '#94A3B8' }}
            >
              <Trophy className="w-5 h-5 mr-2" style={{ color: activeTab === "highwager" ? undefined : '#94A3B8' }} />
              High Stakes
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#080C14] rounded-lg text-base font-bold"
              style={activeTab === "growth" ? {} : { color: '#94A3B8' }}
            >
              <TrendingUp className="w-5 h-5 mr-2" style={{ color: activeTab === "growth" ? undefined : '#94A3B8' }} />
              Top Growth
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Total Wagered Tab */}
            <TabsContent value="wagered" className="space-y-6">
              {/* Podium for Top 3 */}
              {renderPodium(mockWageredData, 'wagered')}

              {/* Remaining Rankings */}
              <Card className="rounded-2xl border-none shadow-xl" style={{
                background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)'
              }}>
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <DollarSign className="w-7 h-7" style={{ color: '#E3B341' }} />
                    <span style={{ color: '#FFFFFF' }}>Complete Rankings 📊</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {mockWageredData.slice(3).map((trader, index) => {
                      const rank = index + 4;
                      return (
                        <motion.div
                          key={trader.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between p-4 rounded-xl border-none transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.6), rgba(15, 23, 42, 0.6))',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#0F172A] text-[#F1F5F9]">
                              {rank}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-white">{trader.username}</div>
                              <div className="text-sm text-[#94A3B8]">{trader.tournamentCount} tournaments</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black" style={{ color: '#E3B341' }}>
                              {formatCurrency(trader.totalWagered)}
                            </div>
                            <div className="text-xs text-[#94A3B8]">Total Wagered</div>
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
                          className="flex items-center justify-between p-4 rounded-lg border border-[#1F2937] hover:border-[#E3B341] transition-all bg-[#111827]"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                              {rank <= 3 ? getRankIcon(rank) : rank}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{tournament.name}</div>
                              <div className="text-sm text-[#94A3B8]">
                                {tournament.currentPlayers}/{tournament.maxPlayers} players •
                                <span className={tournament.status === 'active' ? 'text-[#10B981]' : 'text-[#E3B341]'}>
                                  {' '}{tournament.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg" style={{ color: '#E3B341' }}>
                              {formatCurrency(tournament.buyInAmount)}
                            </div>
                            <div className="text-xs text-[#94A3B8]">Buy-In</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Growth Tab */}
            <TabsContent value="growth" className="space-y-6">
              {/* Podium for Top 3 */}
              {renderPodium(mockGrowthData, 'growth')}

              {/* Remaining Rankings */}
              <Card className="rounded-2xl border-none shadow-xl" style={{
                background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)'
              }}>
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <TrendingUp className="w-7 h-7" style={{ color: '#10B981' }} />
                    <span style={{ color: '#FFFFFF' }}>Complete Rankings 📈</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {mockGrowthData.slice(3).map((participant, index) => {
                      const rank = index + 4;
                      return (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between p-4 rounded-xl border-none transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.6), rgba(15, 23, 42, 0.6))',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#0F172A] text-[#F1F5F9]">
                              {rank}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-white">{participant.username}</div>
                              <div className="text-sm text-[#94A3B8]">
                                {participant.tournamentName} • Started: {formatCurrency(participant.startingBalance)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#10B981]">
                              +{participant.percentageChange.toFixed(1)}%
                            </div>
                            <div className="text-sm text-[#F1F5F9]">{formatCurrency(participant.portfolioValue)}</div>
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
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
        >
          <motion.div whileHover={{ y: -3 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 100%)'
            }}>
              <CardContent className="p-6">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💰</div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-4 rounded-xl" style={{
                    background: 'rgba(8, 12, 20, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <DollarSign className="w-8 h-8" style={{ color: '#080C14' }} />
                  </div>
                  <div>
                    <div className="text-3xl font-black" style={{ color: '#080C14' }}>
                      {formatCurrency(652300)}
                    </div>
                    <div className="text-base font-bold" style={{ color: 'rgba(8, 12, 20, 0.7)' }}>
                      Total Volume
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            }}>
              <CardContent className="p-6">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🏆</div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-4 rounded-xl" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">284</div>
                    <div className="text-base font-bold text-white opacity-80">
                      Active Tournaments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
            }}>
              <CardContent className="p-6">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">⚡</div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-4 rounded-xl" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">1,247</div>
                    <div className="text-base font-bold text-white opacity-80">
                      Active Traders
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
