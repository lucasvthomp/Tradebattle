import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Crown,
  Target,
  Zap,
  Award,
  Medal,
  Star,
  Sparkles,
  ArrowUp,
  Flame,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [activeTab, setActiveTab] = useState("highwager");

  // Fetch leaderboard data
  const { data: highWagerData, isLoading: loadingHighWager } = useQuery({
    queryKey: ['/api/leaderboard/highest-wager'],
  });
  const { data: growthData, isLoading: loadingGrowth } = useQuery({
    queryKey: ['/api/leaderboard/most-growth'],
  });
  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['/api/leaderboard/most-active'],
  });

  const highWagerRankings = (highWagerData as any)?.data?.rankings || [];
  const growthRankings = (growthData as any)?.data?.rankings || [];
  const activeRankings = (activeData as any)?.data?.rankings || [];

  // Floating particles animation
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * 5,
    x: Math.random() * 100,
  }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6" style={{ color: '#FFD700' }} />;
      case 2: return <Medal className="w-6 h-6" style={{ color: '#CBD5E1' }} />;
      case 3: return <Award className="w-6 h-6" style={{ color: '#CD7F32' }} />;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#CBD5E1';
    if (rank === 3) return '#CD7F32';
    if (rank <= 10) return '#60A5FA';
    if (rank <= 25) return '#A78BFA';
    return '#8A93A6';
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return '220px';
    if (rank === 2) return '180px';
    if (rank === 3) return '160px';
    return '0px';
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#1E2D3F' }}>
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );

  const RankingRow = ({ player, rank, showValue, valueIcon }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      whileHover={{ scale: 1.02, x: 8 }}
      className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer"
      style={{
        background: rank <= 3
          ? `linear-gradient(135deg, ${getRankColor(rank)}15, ${getRankColor(rank)}05)`
          : '#1E2D3F',
        borderColor: rank <= 3 ? getRankColor(rank) : '#2B3A4C',
        boxShadow: rank <= 3 ? `0 4px 20px ${getRankColor(rank)}30` : 'none',
      }}
    >
      {/* Rank & Icon */}
      <div className="flex items-center gap-3 min-w-[80px]">
        <motion.div
          className="text-2xl font-black"
          style={{ color: getRankColor(rank) }}
          animate={rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          #{rank}
        </motion.div>
        {getRankIcon(rank)}
      </div>

      {/* Avatar */}
      <Avatar className="w-12 h-12 border-2" style={{ borderColor: getRankColor(rank) }}>
        <AvatarFallback style={{
          background: `linear-gradient(135deg, ${getRankColor(rank)}, ${getRankColor(rank)}80)`,
          color: '#06121F',
          fontWeight: 'bold',
        }}>
          {player.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Username */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg" style={{ color: '#F1F5F9' }}>
            {player.username}
          </span>
          {player.userId === user?.id && (
            <Badge style={{ background: '#E3B341', color: '#06121F', fontSize: '11px' }}>
              You
            </Badge>
          )}
        </div>
        {rank <= 3 && (
          <motion.div
            className="text-xs font-semibold"
            style={{ color: getRankColor(rank) }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Top {rank} Player 🔥
          </motion.div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
        background: `${getRankColor(rank)}15`,
        border: `1px solid ${getRankColor(rank)}40`,
      }}>
        {valueIcon}
        <span className="font-black text-lg" style={{ color: getRankColor(rank) }}>
          {showValue}
        </span>
      </div>
    </motion.div>
  );

  const PodiumDisplay = ({ rankings }: any) => {
    if (rankings.length === 0) return null;

    const podiumOrder = [rankings[1], rankings[0], rankings[2]].filter(Boolean);

    return (
      <div className="flex items-end justify-center gap-4 mb-12 px-4">
        {podiumOrder.map((player, idx) => {
          const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
          const height = getPodiumHeight(actualRank);

          return (
            <motion.div
              key={player.userId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex flex-col items-center"
              style={{ flex: actualRank === 1 ? '0 0 160px' : '0 0 140px' }}
            >
              {/* Crown Animation for #1 */}
              {actualRank === 1 && (
                <motion.div
                  className="mb-3"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-12 h-12" style={{ color: '#FFD700' }} />
                </motion.div>
              )}

              {/* Avatar */}
              <motion.div
                className="relative mb-4"
                whileHover={{ scale: 1.1 }}
                animate={actualRank === 1 ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                    '0 0 40px rgba(255, 215, 0, 0.6)',
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  borderRadius: '50%',
                }}
              >
                <Avatar className="border-4" style={{
                  width: actualRank === 1 ? '100px' : '80px',
                  height: actualRank === 1 ? '100px' : '80px',
                  borderColor: getRankColor(actualRank),
                }}>
                  <AvatarFallback style={{
                    background: `linear-gradient(135deg, ${getRankColor(actualRank)}, ${getRankColor(actualRank)}80)`,
                    color: '#06121F',
                    fontSize: actualRank === 1 ? '32px' : '24px',
                    fontWeight: 'bold',
                  }}>
                    {player.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Rank Badge */}
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                  style={{
                    background: getRankColor(actualRank),
                    color: '#06121F',
                    boxShadow: `0 4px 12px ${getRankColor(actualRank)}60`,
                  }}
                >
                  #{actualRank}
                </div>
              </motion.div>

              {/* Username */}
              <div className="text-center mb-3 px-2">
                <div className="font-black text-lg mb-1" style={{ color: '#F1F5F9' }}>
                  {player.username}
                </div>
                <div className="text-sm font-semibold" style={{ color: getRankColor(actualRank) }}>
                  {formatCurrency(player.totalWagered || 0)}
                </div>
              </div>

              {/* Podium */}
              <motion.div
                className="w-full rounded-t-xl flex items-end justify-center pb-6"
                style={{
                  height: height,
                  background: `linear-gradient(180deg, ${getRankColor(actualRank)}40, ${getRankColor(actualRank)}20)`,
                  border: `2px solid ${getRankColor(actualRank)}`,
                  borderBottom: 'none',
                }}
                initial={{ height: 0 }}
                animate={{ height: height }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
              >
                {getRankIcon(actualRank)}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#06121F' }}>
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            background: 'radial-gradient(circle, #E3B341, transparent)',
            opacity: 0.3,
          }}
          animate={{
            y: ['-10vh', '110vh'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsing Glows */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15), transparent)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy className="w-24 h-24 mx-auto" style={{ color: '#FFD700' }} />
          </motion.div>

          <h1 className="text-6xl font-black mb-4" style={{
            background: 'linear-gradient(135deg, #FFD700, #E3B341, #FFD700)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient 3s ease infinite',
          }}>
            Leaderboard
          </h1>

          <motion.p
            className="text-xl font-semibold"
            style={{ color: '#8A93A6' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👑 Compete for glory • Track your rank • Dominate the charts
          </motion.p>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
              background: 'rgba(227, 179, 65, 0.15)',
              border: '2px solid #E3B341',
            }}>
              <Users className="w-5 h-5" style={{ color: '#E3B341' }} />
              <span className="font-black text-lg" style={{ color: '#E3B341' }}>
                {highWagerRankings.length} Players
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
              background: 'rgba(255, 79, 88, 0.15)',
              border: '2px solid #FF4F58',
            }}>
              <Flame className="w-5 h-5" style={{ color: '#FF4F58' }} />
              <span className="font-black text-lg" style={{ color: '#FF4F58' }}>
                LIVE
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-16 rounded-2xl mb-8" style={{
            background: '#1E2D3F',
            border: '2px solid #2B3A4C',
          }}>
            <TabsTrigger
              value="highwager"
              className="text-lg font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E3B341] data-[state=active]:to-[#FFD700] data-[state=active]:text-[#06121F]"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Highest Wager
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="text-lg font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#28C76F] data-[state=active]:to-[#22C55E] data-[state=active]:text-[#06121F]"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Most Growth
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="text-lg font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#60A5FA] data-[state=active]:to-[#3B82F6] data-[state=active]:text-[#06121F]"
            >
              <Zap className="w-5 h-5 mr-2" />
              Most Active
            </TabsTrigger>
          </TabsList>

          {/* Highest Wager Tab */}
          <TabsContent value="highwager" className="space-y-6">
            {loadingHighWager ? (
              <LoadingSkeleton />
            ) : highWagerRankings.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#2B3A4C' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Be the first!</p>
              </div>
            ) : (
              <>
                <PodiumDisplay rankings={highWagerRankings.slice(0, 3)} />

                <div className="space-y-3">
                  {highWagerRankings.slice(3, 20).map((player: any, idx: number) => (
                    <RankingRow
                      key={player.userId}
                      player={player}
                      rank={idx + 4}
                      showValue={formatCurrency(player.totalWagered || 0)}
                      valueIcon={<DollarSign className="w-5 h-5" />}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Most Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            {loadingGrowth ? (
              <LoadingSkeleton />
            ) : growthRankings.length === 0 ? (
              <div className="text-center py-20">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#2B3A4C' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Start trading!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {growthRankings.slice(0, 20).map((player: any, idx: number) => (
                  <RankingRow
                    key={player.userId}
                    player={player}
                    rank={idx + 1}
                    showValue={`${player.growth >= 0 ? '+' : ''}${(player.growth || 0).toFixed(1)}%`}
                    valueIcon={<ArrowUp className="w-5 h-5" style={{ color: '#28C76F' }} />}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Most Active Tab */}
          <TabsContent value="active" className="space-y-6">
            {loadingActive ? (
              <LoadingSkeleton />
            ) : activeRankings.length === 0 ? (
              <div className="text-center py-20">
                <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: '#2B3A4C' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Join tournaments!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRankings.slice(0, 20).map((player: any, idx: number) => (
                  <RankingRow
                    key={player.userId}
                    player={player}
                    rank={idx + 1}
                    showValue={`${player.tournamentsEntered || 0} tournaments`}
                    valueIcon={<Zap className="w-5 h-5" />}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
