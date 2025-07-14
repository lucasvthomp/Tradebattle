import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, TrendingUp, Archive } from "lucide-react";
import { format } from "date-fns";

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
}



export default function ArchivePage() {
  const { data: archivedTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments/archived'],
    queryFn: async () => {
      const res = await fetch('/api/tournaments/archived');
      if (!res.ok) {
        throw new Error('Failed to fetch archived tournaments');
      }
      const data = await res.json();
      return data.data as ArchivedTournament[];
    }
  });



  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Archive className="w-8 h-8" />
          Archive
        </h1>
        <p className="text-muted-foreground">
          View your completed tournaments
        </p>
      </div>

      <div className="grid gap-4">
        {tournamentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading archived tournaments...</p>
          </div>
        ) : archivedTournaments?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Completed Tournaments</h3>
              <p className="text-muted-foreground">
                You haven't participated in any completed tournaments yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          archivedTournaments?.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Code: {tournament.code}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{tournament.currentPlayers}/{tournament.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span>Duration: {tournament.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Started: {format(new Date(tournament.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Ended: {format(new Date(tournament.endedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}