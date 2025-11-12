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
      <div className="mb-12 relative">
        {/* Spotlight effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 -z-10">
          <div className="w-full h-full rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, #E3B341 0%, transparent 70%)',
            filter: 'blur(60px)'
          }} />
        </div>

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
                whileHover={{ scale: 1.08, y: -8 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-3xl p-7 border-none shadow-2xl relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #C9D1E2 0%, #a8b6c8 50%, #8895a8 100%)',
                  boxShadow: '0 15px 50px rgba(201, 209, 226, 0.5), 0 0 30px rgba(201, 209, 226, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 text-8xl opacity-15">🥈</div>
                <div className="absolute left-2 bottom-2 text-4xl opacity-10">⭐</div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                  }}
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />

                <div className="relative z-10 text-center">
                  <motion.div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: 'rgba(6, 18, 31, 0.4)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                    }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Award className="w-12 h-12" style={{ color: '#06121F' }} />
                  </motion.div>
                  <div className="text-2xl font-black mb-2" style={{
                    color: '#06121F',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>{second.username}</div>
                  <div className="text-3xl font-black" style={{
                    color: '#06121F',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>
                    {type === 'wagered' ? formatCurrency(second.totalWagered) : `+${second.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Pedestal */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 160, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #C9D1E2 0%, #a8b6c8 30%, #8895a8 100%)',
                  boxShadow: '0 -10px 40px rgba(201, 209, 226, 0.4), inset 0 2px 20px rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderBottom: 'none'
                }}
              >
                {/* Decorative lines on pedestal */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-white"></div>
                  <div className="absolute top-8 left-0 right-0 h-px bg-white opacity-50"></div>
                  <div className="absolute top-16 left-0 right-0 h-px bg-white opacity-50"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-7xl font-black mb-2"
                    style={{ color: 'rgba(6, 18, 31, 0.9)', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >2</motion.div>
                  <div className="text-base font-bold tracking-wider" style={{
                    color: 'rgba(6, 18, 31, 0.7)',
                    textShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>SILVER</div>
                </div>
              </motion.div>
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
                whileHover={{ scale: 1.08, y: -10 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -15, 0],
                  boxShadow: [
                    '0 20px 60px rgba(227, 179, 65, 0.5), 0 0 40px rgba(227, 179, 65, 0.3)',
                    '0 25px 70px rgba(227, 179, 65, 0.6), 0 0 50px rgba(227, 179, 65, 0.4)',
                    '0 20px 60px rgba(227, 179, 65, 0.5), 0 0 40px rgba(227, 179, 65, 0.3)'
                  ]
                }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="rounded-3xl p-8 border-none shadow-2xl relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #E3B341 30%, #c99a35 60%, #a87d28 100%)',
                  border: '4px solid rgba(255, 215, 0, 0.6)'
                }}
              >
                {/* Decorative elements */}
                <div className="absolute -right-8 -top-8 text-9xl opacity-20">👑</div>
                <div className="absolute left-3 bottom-3 text-6xl opacity-15">🏆</div>
                <div className="absolute right-3 bottom-3 text-3xl opacity-10">⭐</div>

                {/* Enhanced shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                  }}
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5
                  }}
                />

                {/* Particles/sparkles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 25}%`,
                    }}
                    animate={{
                      y: [-10, -20, -10],
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      delay: i * 0.3,
                      repeat: Infinity
                    }}
                  >
                    ✨
                  </motion.div>
                ))}

                <div className="relative z-10 text-center">
                  <motion.div
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: 'rgba(6, 18, 31, 0.4)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 30px rgba(0, 0, 0, 0.4)'
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <Crown className="w-14 h-14" style={{ color: '#06121F' }} />
                  </motion.div>
                  <div className="text-3xl font-black mb-3" style={{
                    color: '#06121F',
                    textShadow: '0 3px 15px rgba(0,0,0,0.3)'
                  }}>{first.username}</div>
                  <div className="text-4xl font-black" style={{
                    color: '#06121F',
                    textShadow: '0 3px 15px rgba(0,0,0,0.3)'
                  }}>
                    {type === 'wagered' ? formatCurrency(first.totalWagered) : `+${first.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Gold Pedestal */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 200, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, type: "spring" }}
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #E3B341 20%, #c99a35 50%, #9a7728 100%)',
                  boxShadow: '0 -15px 50px rgba(227, 179, 65, 0.5), inset 0 3px 30px rgba(255,215,0,0.4)',
                  border: '3px solid rgba(255, 215, 0, 0.5)',
                  borderBottom: 'none'
                }}
              >
                {/* Decorative lines on pedestal */}
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  <div className="absolute top-10 left-0 right-0 h-px bg-white opacity-60"></div>
                  <div className="absolute top-20 left-0 right-0 h-px bg-white opacity-60"></div>
                  <div className="absolute top-30 left-0 right-0 h-px bg-white opacity-60"></div>
                </div>

                {/* Animated glow */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, transparent 70%)'
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-8xl font-black mb-2"
                    style={{
                      color: 'rgba(6, 18, 31, 0.9)',
                      textShadow: '0 5px 15px rgba(0,0,0,0.4)'
                    }}
                    animate={{
                      scale: [1, 1.08, 1],
                      textShadow: [
                        '0 5px 15px rgba(0,0,0,0.4)',
                        '0 8px 20px rgba(0,0,0,0.5)',
                        '0 5px 15px rgba(0,0,0,0.4)'
                      ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >1</motion.div>
                  <div className="text-lg font-bold tracking-widest" style={{
                    color: 'rgba(6, 18, 31, 0.8)',
                    textShadow: '0 3px 8px rgba(0,0,0,0.3)'
                  }}>GOLD</div>
                </div>
              </motion.div>
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
                whileHover={{ scale: 1.08, y: -8 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-3xl p-7 border-none shadow-2xl relative overflow-hidden mb-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #CD7F32 0%, #b3692a 50%, #995d24 100%)',
                  boxShadow: '0 15px 50px rgba(205, 127, 50, 0.5), 0 0 30px rgba(205, 127, 50, 0.3)',
                  border: '3px solid rgba(205, 127, 50, 0.6)'
                }}
              >
                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 text-8xl opacity-15">🥉</div>
                <div className="absolute left-2 bottom-2 text-4xl opacity-10">🎖️</div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  }}
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />

                <div className="relative z-10 text-center">
                  <motion.div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                    }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="w-12 h-12 text-white" />
                  </motion.div>
                  <div className="text-2xl font-black text-white mb-2" style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.4)'
                  }}>{third.username}</div>
                  <div className="text-3xl font-black text-white" style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.4)'
                  }}>
                    {type === 'wagered' ? formatCurrency(third.totalWagered) : `+${third.percentageChange.toFixed(1)}%`}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Bronze Pedestal */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 130, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                className="w-full rounded-t-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #CD7F32 0%, #b3692a 30%, #995d24 100%)',
                  boxShadow: '0 -10px 40px rgba(205, 127, 50, 0.4), inset 0 2px 20px rgba(255,255,255,0.2)',
                  border: '2px solid rgba(205, 127, 50, 0.4)',
                  borderBottom: 'none'
                }}
              >
                {/* Decorative lines on pedestal */}
                <div className="absolute inset-0 opacity-25">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-white"></div>
                  <div className="absolute top-6 left-0 right-0 h-px bg-white opacity-50"></div>
                  <div className="absolute top-12 left-0 right-0 h-px bg-white opacity-50"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-7xl font-black text-white mb-2"
                    style={{ textShadow: '0 4px 10px rgba(0,0,0,0.4)' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >3</motion.div>
                  <div className="text-base font-bold tracking-wider text-white opacity-90" style={{
                    textShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>BRONZE</div>
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
