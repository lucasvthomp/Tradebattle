import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, Users, TrendingUp, Archive, Crown, Medal, Award, FileText, ArrowUpDown, DollarSign } from "lucide-react";
import { format } from "date-fns";
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
  const { formatCurrency } = useUserPreferences();

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

  // Fetch transaction history for personal portfolio
  const { data: transactionHistory, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/portfolio/personal/transactions'],
    queryFn: async () => {
      const res = await fetch('/api/portfolio/personal/transactions');
      if (!res.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!user
  });



  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Archive className="w-8 h-8" />
          Archive
        </h1>
        <p className="text-muted-foreground">
          View your completed tournaments and transaction history
        </p>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tournaments" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Completed Tournaments</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Transaction History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="mt-6">
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
                    <p className="text-sm text-muted-foreground">Tournament ID: {tournament.id}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
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
                
                {/* Final Results */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Final Results
                  </h4>
                  <div className="space-y-2">
                    {tournament.participants?.map((participant, index) => {
                      const getPositionIcon = (position: number) => {
                        switch (position) {
                          case 1: return <Crown className="w-4 h-4 text-yellow-500" />;
                          case 2: return <Medal className="w-4 h-4 text-gray-400" />;
                          case 3: return <Award className="w-4 h-4 text-amber-600" />;
                          default: return null;
                        }
                      };
                      
                      const getPositionBadge = (position: number) => {
                        switch (position) {
                          case 1: return "bg-yellow-100 text-yellow-800";
                          case 2: return "bg-gray-100 text-gray-800";
                          case 3: return "bg-amber-100 text-amber-800";
                          default: return "bg-blue-100 text-blue-800";
                        }
                      };
                      
                      return (
                        <div key={participant.userId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className={`${getPositionBadge(participant.position)} min-w-[3rem] justify-center`}>
                              #{participant.position}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {getPositionIcon(participant.position)}
                              <span className="font-medium">{participant.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${participant.portfolioValue?.toLocaleString() || 0}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="w-5 h-5" />
                <span>Personal Portfolio Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading transaction history...</p>
                </div>
              ) : transactionHistory?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
                  <p className="text-muted-foreground">
                    You haven't made any trades in your personal portfolio yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory?.map((transaction: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={transaction.type === 'buy' ? 'default' : 'secondary'}
                          className={transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {transaction.type === 'buy' ? 'BUY' : 'SELL'}
                        </Badge>
                        <div>
                          <div className="font-semibold">{transaction.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @ {formatCurrency(transaction.pricePerShare || 0)}/share
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}