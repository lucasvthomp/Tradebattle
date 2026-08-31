import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, TrendingUp, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { motion } from "framer-motion";

interface TournamentLeaderboardDialogProps {
  tournament: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TournamentLeaderboardDialog({ 
  tournament, 
  isOpen, 
  onClose 
}: TournamentLeaderboardDialogProps) {
  const { formatCurrency } = useUserPreferences();

  // Fetch tournament leaderboard data
  const { data: leaderboardData, isLoading } = useQuery<{participants: any[]}>({
    queryKey: ['/api/tournaments', tournament?.id, 'leaderboard'],
    enabled: isOpen && !!tournament?.id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const participants = leaderboardData?.participants || [];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const parseTimeframe = (timeframe: string): number => {
    const match = timeframe?.match(/(\d+)\s*(minute|minutes|day|days|week|weeks|month|months)/i);
    if (!match) return 28 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
      case 'minute': case 'minutes': return value * 60 * 1000;
      case 'day': case 'days': return value * 24 * 60 * 60 * 1000;
      case 'week': case 'weeks': return value * 7 * 24 * 60 * 60 * 1000;
      case 'month': case 'months': return value * 30 * 24 * 60 * 60 * 1000;
      default: return 28 * 24 * 60 * 60 * 1000;
    }
  };

  const getTimeRemaining = () => {
    const startedAt = tournament?.startedAt || tournament?.createdAt;
    if (!startedAt || !tournament?.timeframe) return "N/A";

    const endTime = new Date(startedAt).getTime() + parseTimeframe(tournament.timeframe);
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) return "Ended";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (!tournament) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>{tournament.name} - Standings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Prize pool</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(tournament.currentPlayers * tournament.buyInAmount)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Players</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{tournament.currentPlayers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">On the clock</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{getTimeRemaining()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Live standings</span>
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted/50 rounded-lg h-16" />
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No player data available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant, index) => {
                  const position = index + 1;
                  const portfolioValue = participant.portfolioValue || tournament.startingBalance;
                  const gainLoss = portfolioValue - tournament.startingBalance;
                  const gainLossPercent = ((gainLoss / tournament.startingBalance) * 100);
                  
                  return (
                    <motion.div
                      key={participant.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`transition-all duration-200 hover:shadow-md ${
                        position <= 3 ? 'border-primary/20 bg-primary/5' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {getRankIcon(position)}
                              <div>
                                <p className="font-medium">{participant.firstName || participant.username || `User ${participant.userId}`}</p>
                                <p className="text-sm text-muted-foreground">
                                  Board value: {formatCurrency(portfolioValue)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                              </div>
                              <div className={`text-sm ${
                                gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tournament Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Arena details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {tournament.tournamentType === "crypto" ? "Cryptocurrency" : "Stock Market"}</p>
                <p><span className="text-muted-foreground">Starting capital:</span> {formatCurrency(tournament.startingBalance)}</p>
              </div>
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Entry fee:</span> {tournament.buyInAmount > 0 ? formatCurrency(tournament.buyInAmount) : "No fee"}</p>
                <p><span className="text-muted-foreground">Entry:</span> <Badge variant={tournament.isPublic ? "secondary" : "outline"}>{tournament.isPublic ? "Open" : "Closed"}</Badge></p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
