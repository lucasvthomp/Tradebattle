import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Award, User, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { motion } from "framer-motion";

interface TournamentLeaderboardProps {
  tournamentId: number;
  onViewFullLeaderboard?: () => void;
}

export function TournamentLeaderboard({ tournamentId, onViewFullLeaderboard }: TournamentLeaderboardProps) {
  const { formatCurrency, t } = useUserPreferences();

  // Fetch tournament leaderboard data
  const { data: leaderboardData, isLoading } = useQuery<{success: boolean; participants: any[]}>({
    queryKey: ['/api/tournaments', tournamentId, 'leaderboard'],
    enabled: !!tournamentId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const participants = leaderboardData?.participants || [];
  const topParticipants = participants.slice(0, 5); // Show top 5 participants

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">#{position}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="w-4 h-4" />
            <span>{t('leaderboard')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted/50 rounded-lg h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="w-4 h-4" />
            <span>{t('leaderboard')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('noData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="w-4 h-4" />
            <span>{t('leaderboard')}</span>
          </CardTitle>
          {participants.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onViewFullLeaderboard}
            >
              <Eye className="w-3 h-3 mr-1" />
              {t('all')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topParticipants.map((participant, index) => {
            const position = index + 1;
            const totalValue = participant.portfolioValue || participant.totalValue || 0;
            const startingBalance = 10000; // Tournament starting balance, should come from tournament data
            const profitLoss = totalValue - startingBalance;
            const isPositive = profitLoss >= 0;

            return (
              <motion.div
                key={participant.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/30 ${
                  position <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : 'bg-muted/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(position)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">
                      {participant.firstName || participant.displayName || participant.username || `Player ${participant.userId}`}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatCurrency(totalValue)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <div className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(profitLoss)}
                  </div>
                  <div className={`flex items-center text-xs ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {((profitLoss / startingBalance) * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {participants.length > 5 && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Showing top 5 of {participants.length} participants
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}