import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Crown,
  Award,
  Medal,
  Zap,
  ArrowUp,
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

  const { data: highWagerData, isLoading: loadingHighWager } = useQuery({ queryKey: ['/api/leaderboard/highest-wager'], refetchInterval: 30000 });
  const { data: growthData, isLoading: loadingGrowth } = useQuery({ queryKey: ['/api/leaderboard/most-growth'], refetchInterval: 30000 });
  const { data: activeData, isLoading: loadingActive } = useQuery({ queryKey: ['/api/leaderboard/most-active'], refetchInterval: 30000 });

  const highWagerRankings = (highWagerData as any)?.data?.rankings || [];
  const growthRankings = (growthData as any)?.data?.rankings || [];
  const activeRankings = (activeData as any)?.data?.rankings || [];

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#E3B341';
    if (rank === 2) return '#94A3B8';
    if (rank === 3) return '#CD7F32';
    if (rank <= 10) return '#60A5FA';
    return '#4B5563';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4" style={{ color: '#E3B341' }} />;
    if (rank === 2) return <Medal className="w-4 h-4" style={{ color: '#94A3B8' }} />;
    if (rank === 3) return <Award className="w-4 h-4" style={{ color: '#CD7F32' }} />;
    return null;
  };

  const LoadingSkeleton = () => (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#0C1829' }}>
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );

  const RankingRow = ({ player, rank, showValue, valueIcon }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.3) }}
      className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:brightness-110"
      style={{
        background: rank <= 3 ? `${getRankColor(rank)}10` : '#0C1829',
        borderColor: rank <= 3 ? `${getRankColor(rank)}40` : '#0E2040',
      }}
    >
      <div className="flex items-center gap-1.5 w-12 shrink-0">
        <span className="text-sm font-bold" style={{ color: getRankColor(rank) }}>#{rank}</span>
        {getRankIcon(rank)}
      </div>

      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: '#0C1829', color: getRankColor(rank) }}>
          {player.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold truncate" style={{ color: '#F1F5F9' }}>{player.username}</span>
          {player.userId === user?.id && (
            <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#E3B341', color: '#091525' }}>You</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {valueIcon}
        <span className="text-sm font-bold" style={{ color: getRankColor(rank) }}>{showValue}</span>
      </div>
    </motion.div>
  );

  const PodiumDisplay = ({ rankings }: any) => {
    if (rankings.length < 1) return null;
    const order = [rankings[1], rankings[0], rankings[2]].filter(Boolean);
    const heights = { 1: '100px', 2: '75px', 3: '60px' };
    const rankOf = (idx: number) => idx === 1 ? 1 : idx === 0 ? 2 : 3;

    return (
      <div className="flex items-end justify-center gap-3 mb-8 px-4">
        {order.map((player, idx) => {
          const rank = rankOf(idx);
          const color = getRankColor(rank);
          return (
            <motion.div
              key={player.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className="flex flex-col items-center"
              style={{ flex: rank === 1 ? '1 1 96px' : '1 1 80px', maxWidth: rank === 1 ? '120px' : '96px', minWidth: 0 }}
            >
              <Avatar style={{ width: rank === 1 ? '64px' : '52px', height: rank === 1 ? '64px' : '52px', marginBottom: '8px' }}>
                <AvatarFallback className="font-bold" style={{
                  fontSize: rank === 1 ? '20px' : '16px',
                  backgroundColor: '#0C1829',
                  color,
                }}>
                  {player.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="text-center mb-2 w-full px-1">
                <div className="text-sm font-bold truncate" style={{ color: '#F1F5F9' }}>{player.username}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>{formatCurrency(player.totalWagered || 0)}</div>
              </div>

              <div
                className="w-full rounded-t-lg flex items-center justify-center"
                style={{
                  height: heights[rank as keyof typeof heights],
                  background: `${color}20`,
                  border: `1px solid ${color}50`,
                  borderBottom: 'none',
                }}
              >
                <span className="text-lg font-black" style={{ color }}>#{rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)]" style={{ background: 'transparent' }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-7 h-7" style={{ color: '#E3B341' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>Leaderboard</h1>
            <p className="text-sm" style={{ color: '#8A93A6' }}>
              {highWagerRankings.length > 0 ? `${highWagerRankings.length} ranked players` : 'No rankings yet'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-10 mb-6" style={{ background: '#0C1829', border: '1px solid #0E2040' }}>
            <TabsTrigger value="highwager" className="text-sm font-semibold data-[state=active]:bg-[#E3B341] data-[state=active]:text-[#06121F]">
              <DollarSign className="w-4 h-4 mr-1.5" />
              Top Wager
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-sm font-semibold data-[state=active]:bg-[#28C76F] data-[state=active]:text-[#06121F]">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="active" className="text-sm font-semibold data-[state=active]:bg-[#60A5FA] data-[state=active]:text-[#06121F]">
              <Zap className="w-4 h-4 mr-1.5" />
              Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highwager">
            {loadingHighWager ? <LoadingSkeleton /> : highWagerRankings.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#0E2040' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Be the first!</p>
              </div>
            ) : (
              <>
                <PodiumDisplay rankings={highWagerRankings.slice(0, 3)} />
                <div className="space-y-1.5">
                  {highWagerRankings.slice(3, 20).map((player: any, idx: number) => (
                    <RankingRow key={player.userId} player={player} rank={idx + 4}
                      showValue={formatCurrency(player.totalWagered || 0)}
                      valueIcon={<DollarSign className="w-4 h-4" style={{ color: getRankColor(idx + 4) }} />}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="growth">
            {loadingGrowth ? <LoadingSkeleton /> : growthRankings.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: '#0E2040' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Start trading!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {growthRankings.slice(0, 20).map((player: any, idx: number) => (
                  <RankingRow key={player.userId} player={player} rank={idx + 1}
                    showValue={`${player.growth >= 0 ? '+' : ''}${(player.growth || 0).toFixed(1)}%`}
                    valueIcon={<ArrowUp className="w-4 h-4" style={{ color: '#28C76F' }} />}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {loadingActive ? <LoadingSkeleton /> : activeRankings.length === 0 ? (
              <div className="text-center py-16">
                <Zap className="w-12 h-12 mx-auto mb-3" style={{ color: '#0E2040' }} />
                <p style={{ color: '#8A93A6' }}>No rankings yet. Join tournaments!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeRankings.slice(0, 20).map((player: any, idx: number) => (
                  <RankingRow key={player.userId} player={player} rank={idx + 1}
                    showValue={`${player.tournamentsEntered || 0} played`}
                    valueIcon={<Users className="w-4 h-4" style={{ color: getRankColor(idx + 1) }} />}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
