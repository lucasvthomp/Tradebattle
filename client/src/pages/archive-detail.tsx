import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Crown,
  Medal,
  Award,
  ChevronRight,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export default function ArchiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useUserPreferences();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['/api/tournaments/archived', id],
    queryFn: async () => {
      const res = await fetch('/api/tournaments/archived');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const all = data.data || [];
      return all.find((t: any) => t.id === parseInt(id || '0')) || null;
    },
    enabled: !!id,
  });

  // Fetch tournament results (payouts) if they exist
  const { data: tournamentResults } = useQuery({
    queryKey: ['/api/tournaments', id, 'results'],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${id}/results`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#E3B341' }} />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <div className="text-center">
          <Archive className="w-12 h-12 mx-auto mb-4" style={{ color: '#94A3B8' }} />
          <p className="text-lg mb-4" style={{ color: '#F1F5F9' }}>{t('tournamentNotFound')}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            {t('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5" style={{ color: '#E3B341' }} />;
      case 2: return <Medal className="w-5 h-5" style={{ color: '#94A3B8' }} />;
      case 3: return <Award className="w-5 h-5" style={{ color: '#D97706' }} />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4 flex items-center"
      >
        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
        {t('backToArchive')}
      </Button>

      {/* Tournament Header */}
      <Card className="mb-6" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
                {tournament.name}
              </h1>
              <Badge style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                Completed
              </Badge>
            </div>
            <Trophy className="w-8 h-8" style={{ color: '#E3B341' }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" style={{ color: '#E3B341' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>{t('players')}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
                {tournament.currentPlayers}/{tournament.maxPlayers}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>{t('startingCash')}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
                ${tournament.startingBalance?.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" style={{ color: '#06B6D4' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>{t('duration')}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
                {tournament.timeframe}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" style={{ color: '#94A3B8' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>{t('ended')}</span>
              </div>
              <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                {tournament.endedAt ? format(new Date(tournament.endedAt), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Leaderboard */}
      <Card style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#F1F5F9' }}>
            <Trophy className="w-5 h-5" style={{ color: '#E3B341' }} />
            {t('finalLeaderboard')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!tournament.participants || tournament.participants.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-8 h-8 mx-auto mb-2" style={{ color: '#94A3B8', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>{t('noParticipantsRecorded')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tournament.participants
                .sort((a: any, b: any) => a.position - b.position)
                .map((participant: any) => {
                  const isWinner = participant.position === 1;
                  const pnl = (participant.portfolioValue || 0) - tournament.startingBalance;
                  const pnlPercent = tournament.startingBalance > 0
                    ? ((pnl / tournament.startingBalance) * 100).toFixed(1)
                    : '0';

                  // Look up payout from tournament results
                  const resultRecord = tournamentResults?.find(
                    (r: any) => r.userId === participant.userId
                  );
                  const payout = resultRecord ? parseFloat(resultRecord.payout || '0') : null;

                  return (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: isWinner ? '#E3B34110' : '#0F172A',
                        border: isWinner ? '1px solid #E3B34140' : '1px solid #1F2937',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-center">
                          {getPositionIcon(participant.position) || (
                            <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>
                              #{participant.position}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                          {participant.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {payout !== null && payout > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                              +${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px]" style={{ color: '#94A3B8' }}>Payout</p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                            ${(participant.portfolioValue || 0).toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: pnl >= 0 ? '#10B981' : '#EF4444' }}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
