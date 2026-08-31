import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, Trophy, Users, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface Participant {
  userId: number;
  name: string;
  finalBalance: number;
  portfolioValue: number;
  position: number;
}

interface ArchivedTournament {
  id: number;
  name: string;
  code: string;
  maxPlayers: number;
  currentPlayers: number;
  timeframe: string;
  createdAt: string;
  endedAt: string;
  startingBalance: number;
  participants: Participant[];
}

export default function ArchivePage() {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: archivedTournaments, isLoading } = useQuery({
    queryKey: ['/api/tournaments/archived'],
    queryFn: async () => {
      const res = await fetch('/api/tournaments/archived');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data.data as ArchivedTournament[];
    }
  });

  const filtered = (archivedTournaments || []).filter((t) =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="arena-page-shell container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#F1F5F9' }}>
          <Archive className="w-6 h-6" style={{ color: '#00A3FF' }} />
          {t('archive')}
        </h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#94A3B8' }} />
        <Input
          placeholder={t('searchTournaments')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          style={{ backgroundColor: '#0C1A2E', borderColor: '#0E2040', color: '#F1F5F9' }}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#00A3FF' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: '#94A3B8', opacity: 0.5 }} />
          <p style={{ color: '#94A3B8' }}>
            {searchQuery ? t('noMatchingTournaments') : t('noCompletedTournaments')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tournament) => {
            const winner = tournament.participants?.find((p) => p.position === 1);
            return (
              <a
                key={tournament.id}
                href={`/archive/${tournament.id}`}
                className="flex items-center justify-between p-4 rounded-lg transition-colors hover:border-[#00A3FF]"
                style={{ backgroundColor: '#0C1A2E', border: '1px solid #0E2040' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate" style={{ color: '#F1F5F9' }}>
                      {tournament.name}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0" style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                      Completed
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: '#94A3B8' }}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </span>
                    <span>
                      {tournament.endedAt ? new Date(tournament.endedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                    {winner && (
                      <span className="flex items-center gap-1" style={{ color: '#00A3FF' }}>
                        <Crown className="w-3 h-3" />
                        {winner.name}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
