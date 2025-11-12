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

  const renderPodium = (data: any[], type: 'wagered' | 'growth') => {
    const top3 = data.slice(0, 3);
    const [first, second, third] = top3;

    return (
      <div className="mb-8 relative">
        {/* Podium Container */}
        <div className="flex items-end justify-center gap-6 mb-8 px-8">
          {/* 2nd Place - Left */}
          {second && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
              style={{ width: '200px' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 border-none shadow-2xl relative overflow-hidden mb-4"
                style={{
                  background: 'linear-gradient(135deg, #C9D1E2 0%, #9aa5b5 100%)',
                  boxShadow: '0 10px 40px rgba(201, 209, 226, 0.4)'
                }}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-20">🥈</div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                    background: 'rgba(6, 18, 31, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Award className="w-10 h-10" style={{ color: '#06121F' }} />
                  </div>
                  <div className="text-2xl font-black mb-2" style={{ color: '#06121F' }}>{second.username}</div>
                  <div className="text-3xl font-black" style={{ color: '#06121F' }}>
                    {type === 'wagered' ? formatCurrency(second.totalWagered) : `+${second.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 140 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full rounded-t-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #C9D1E2 0%, #8895a8 100%)',
                  boxShadow: '0 -5px 20px rgba(201, 209, 226, 0.3)'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-black" style={{ color: 'rgba(6, 18, 31, 0.8)' }}>2</div>
                  <div className="text-sm font-bold" style={{ color: 'rgba(6, 18, 31, 0.6)' }}>SILVER</div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 1st Place - Center (Tallest) */}
          {first && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
              style={{ width: '220px' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-2xl p-8 border-none shadow-2xl relative overflow-hidden mb-4"
                style={{
                  background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 50%, #a87d28 100%)',
                  boxShadow: '0 15px 50px rgba(227, 179, 65, 0.5)'
                }}
              >
                <div className="absolute -right-6 -top-6 text-8xl opacity-20">👑</div>
                <div className="absolute left-4 bottom-4 text-5xl opacity-15">🏆</div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
                    background: 'rgba(6, 18, 31, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Crown className="w-12 h-12" style={{ color: '#06121F' }} />
                  </div>
                  <div className="text-3xl font-black mb-3" style={{ color: '#06121F' }}>{first.username}</div>
                  <div className="text-4xl font-black" style={{ color: '#06121F' }}>
                    {type === 'wagered' ? formatCurrency(first.totalWagered) : `+${first.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 180 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-full rounded-t-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #E3B341 0%, #c99a35 50%, #9a7728 100%)',
                  boxShadow: '0 -5px 30px rgba(227, 179, 65, 0.4)'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-black" style={{ color: 'rgba(6, 18, 31, 0.8)' }}>1</div>
                  <div className="text-base font-bold" style={{ color: 'rgba(6, 18, 31, 0.6)' }}>GOLD</div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 3rd Place - Right */}
          {third && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
              style={{ width: '200px' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 border-none shadow-2xl relative overflow-hidden mb-4"
                style={{
                  background: 'linear-gradient(135deg, #CD7F32 0%, #a86628 100%)',
                  boxShadow: '0 10px 40px rgba(205, 127, 50, 0.4)'
                }}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-20">🥉</div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Target className="w-10 h-10" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div className="text-2xl font-black text-white mb-2">{third.username}</div>
                  <div className="text-3xl font-black text-white">
                    {type === 'wagered' ? formatCurrency(third.totalWagered) : `+${third.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 100 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full rounded-t-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #CD7F32 0%, #995d24 100%)',
                  boxShadow: '0 -5px 20px rgba(205, 127, 50, 0.3)'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-black text-white opacity-80">3</div>
                  <div className="text-sm font-bold text-white opacity-60">BRONZE</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#06121F' }}>
      {/* Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 20) % 100}%`,
              top: `${(i * 30) % 80}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 10 + i * 2,
              delay: i * 0.5,
              repeat: Infinity,
            }}
          >
            <Trophy className="w-20 h-20" style={{ color: '#E3B341' }} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="rounded-2xl p-3" style={{
              background: 'linear-gradient(135deg, #E3B341, #c99a35)',
              boxShadow: '0 4px 20px rgba(227, 179, 65, 0.4)'
            }}>
              <Trophy className="w-10 h-10" style={{ color: '#06121F' }} />
            </div>
            <h1 className="text-6xl font-black text-white">Global Leaderboards 🏆</h1>
          </div>
          <p className="text-xl text-[#8A93A6]">Top performers across all tournaments and categories</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 rounded-xl border-none shadow-lg" style={{
            background: 'linear-gradient(135deg, #1E2D3F 0%, #142538 100%)'
          }}>
            <TabsTrigger
              value="wagered"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F] rounded-lg text-base font-bold"
              style={activeTab === "wagered" ? {} : { color: '#8A93A6' }}
            >
              <DollarSign className="w-5 h-5 mr-2" style={{ color: activeTab === "wagered" ? undefined : '#8A93A6' }} />
              Total Wagered
            </TabsTrigger>
            <TabsTrigger
              value="highwager"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F] rounded-lg text-base font-bold"
              style={activeTab === "highwager" ? {} : { color: '#8A93A6' }}
            >
              <Trophy className="w-5 h-5 mr-2" style={{ color: activeTab === "highwager" ? undefined : '#8A93A6' }} />
              High Stakes
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#0A1A2F] rounded-lg text-base font-bold"
              style={activeTab === "growth" ? {} : { color: '#8A93A6' }}
            >
              <TrendingUp className="w-5 h-5 mr-2" style={{ color: activeTab === "growth" ? undefined : '#8A93A6' }} />
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
                background: 'linear-gradient(135deg, #1E2D3F 0%, #142538 100%)'
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
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-4 rounded-xl border-none transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(30, 45, 63, 0.6), rgba(20, 37, 56, 0.6))',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#142538] text-[#C9D1E2]">
                              {rank}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-white">{trader.username}</div>
                              <div className="text-sm text-[#8A93A6]">{trader.tournamentCount} tournaments</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black" style={{ color: '#E3B341' }}>
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
            <TabsContent value="growth" className="space-y-6">
              {/* Podium for Top 3 */}
              {renderPodium(mockGrowthData, 'growth')}

              {/* Remaining Rankings */}
              <Card className="rounded-2xl border-none shadow-xl" style={{
                background: 'linear-gradient(135deg, #1E2D3F 0%, #142538 100%)'
              }}>
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <TrendingUp className="w-7 h-7" style={{ color: '#28C76F' }} />
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
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-4 rounded-xl border-none transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(30, 45, 63, 0.6), rgba(20, 37, 56, 0.6))',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#142538] text-[#C9D1E2]">
                              {rank}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-white">{participant.username}</div>
                              <div className="text-sm text-[#8A93A6]">
                                {participant.tournamentName} • Started: {formatCurrency(participant.startingBalance)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#28C76F]">
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
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
        >
          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #E3B341 0%, #c99a35 100%)',
              boxShadow: '0 10px 30px rgba(227, 179, 65, 0.4)'
            }}>
              <CardContent className="p-6">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💰</div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-4 rounded-xl" style={{
                    background: 'rgba(6, 18, 31, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <DollarSign className="w-8 h-8" style={{ color: '#06121F' }} />
                  </div>
                  <div>
                    <div className="text-3xl font-black" style={{ color: '#06121F' }}>
                      {formatCurrency(652300)}
                    </div>
                    <div className="text-base font-bold" style={{ color: 'rgba(6, 18, 31, 0.7)' }}>
                      Total Volume
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #28C76F 0%, #1a9a55 100%)',
              boxShadow: '0 10px 30px rgba(40, 199, 111, 0.4)'
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

          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="rounded-2xl border-none shadow-xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
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
