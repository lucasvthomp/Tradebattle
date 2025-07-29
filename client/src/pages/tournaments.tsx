import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  Search,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Bitcoin,
  Building,
  Filter,
  SortAsc,
  SortDesc,
  Timer,
  Target,
  Shield,
  Lock,
  Globe,
  Crown,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { TournamentManagementDialog } from "@/components/tournaments/TournamentManagementDialog";
import { TournamentCreationDialog } from "@/components/tournaments/TournamentCreationDialog";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";
import { MarketStatusDisclaimer } from "@/components/MarketStatusDisclaimer";
import { ChatSystem } from "@/components/chat/ChatSystem";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};



// Duration options for tournament creation
const DURATION_OPTIONS = [
  { value: "1 minute", label: "1 Minute", ms: 60 * 1000 },
  { value: "5 minutes", label: "5 Minutes", ms: 5 * 60 * 1000 },
  { value: "15 minutes", label: "15 Minutes", ms: 15 * 60 * 1000 },
  { value: "30 minutes", label: "30 Minutes", ms: 30 * 60 * 1000 },
  { value: "1 hour", label: "1 Hour", ms: 60 * 60 * 1000 },
  { value: "2 hours", label: "2 Hours", ms: 2 * 60 * 60 * 1000 },
  { value: "6 hours", label: "6 Hours", ms: 6 * 60 * 60 * 1000 },
  { value: "12 hours", label: "12 Hours", ms: 12 * 60 * 60 * 1000 },
  { value: "1 day", label: "1 Day", ms: 24 * 60 * 60 * 1000 },
  { value: "3 days", label: "3 Days", ms: 3 * 24 * 60 * 60 * 1000 },
  { value: "1 week", label: "1 Week", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "2 weeks", label: "2 Weeks", ms: 14 * 24 * 60 * 60 * 1000 },
  { value: "4 weeks", label: "4 Weeks", ms: 28 * 24 * 60 * 60 * 1000 }
];

// Start delay options (minimum 5 minutes)
const START_DELAY_OPTIONS = [
  { value: "5 minutes", label: "5 Minutes", ms: 5 * 60 * 1000 },
  { value: "15 minutes", label: "15 Minutes", ms: 15 * 60 * 1000 },
  { value: "30 minutes", label: "30 Minutes", ms: 30 * 60 * 1000 },
  { value: "1 hour", label: "1 Hour", ms: 60 * 60 * 1000 },
  { value: "2 hours", label: "2 Hours", ms: 2 * 60 * 60 * 1000 },
  { value: "6 hours", label: "6 Hours", ms: 6 * 60 * 60 * 1000 },
  { value: "12 hours", label: "12 Hours", ms: 12 * 60 * 60 * 1000 },
  { value: "1 day", label: "1 Day", ms: 24 * 60 * 60 * 1000 },
  { value: "3 days", label: "3 Days", ms: 3 * 24 * 60 * 60 * 1000 },
  { value: "1 week", label: "1 Week", ms: 7 * 24 * 60 * 60 * 1000 }
];

export default function TournamentsPage() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("upcoming");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [sortBy, setSortBy] = useState("starting-soon");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentChatOpen, setTournamentChatOpen] = useState<number | null>(null);

  // State for join confirmation dialog
  const [joinConfirmationOpen, setJoinConfirmationOpen] = useState(false);
  const [tournamentToJoin, setTournamentToJoin] = useState<any>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);

  // State for leaderboard dialog
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [selectedLeaderboardTournament, setSelectedLeaderboardTournament] = useState<any>(null);

  // Tournament creation is now handled by TournamentCreationDialog component

  // Fetch public tournaments
  const { data: publicTournaments, isLoading: publicLoading } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments/public'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's tournaments (includes private tournaments they created/joined)
  const { data: userTournaments, isLoading: userLoading } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const tournamentsLoading = publicLoading || userLoading;

  // Join tournament by code mutation
  const joinByCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", `/api/tournaments/code/${code}/join`, {});
      return res.json();
    },
    onSuccess: () => {
      setJoinCodeDialogOpen(false);
      setJoinCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Success",
        description: "Successfully joined tournament!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join tournament by ID mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/join`, {});
      return res.json();
    },
    onSuccess: () => {
      setJoinConfirmationOpen(false);
      setTournamentToJoin(null);
      setAgreementChecked(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Success",
        description: "Successfully joined tournament!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to handle join tournament button click
  const handleJoinTournament = (tournament: any) => {
    setTournamentToJoin(tournament);
    setJoinConfirmationOpen(true);
    setAgreementChecked(false);
  };

  // Function to confirm join tournament
  const confirmJoinTournament = () => {
    if (tournamentToJoin && agreementChecked) {
      joinTournamentMutation.mutate(tournamentToJoin.id);
    }
  };

  // Tournament creation is now handled by TournamentCreationDialog component

  // Combine public tournaments and user's tournaments, removing duplicates
  const allTournaments = React.useMemo(() => {
    const publicList = publicTournaments?.data || [];
    const userList = userTournaments?.data || [];
    
    // Create a Map to avoid duplicates (user tournaments take priority)
    const tournamentMap = new Map();
    
    // Add public tournaments first
    publicList.forEach(tournament => {
      tournamentMap.set(tournament.id, tournament);
    });
    
    // Add user tournaments ONLY if they are:
    // 1. Public tournaments (to update with participation info), OR
    // 2. Private tournaments where user is participating (creator or participant)
    userList.forEach(tournament => {
      const isUserParticipating = tournament.creatorId === user?.id || tournament.isParticipating;
      
      if (tournament.isPublic || isUserParticipating) {
        tournamentMap.set(tournament.id, tournament);
      }
    });
    
    return Array.from(tournamentMap.values());
  }, [publicTournaments, userTournaments, user?.id]);

  // Filter and sort tournaments
  const processedTournaments = {
    upcoming: allTournaments.filter((t: any) => 
      t.status === "waiting" && 
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    ongoing: allTournaments.filter((t: any) => 
      t.status === "active" && 
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  };

  // Sort tournaments (prioritize participated tournaments first)
  const sortTournaments = (tournaments: any[]) => {
    return [...tournaments].sort((a, b) => {
      // Check if user is participating in each tournament
      const aIsParticipating = a.creatorId === user?.id || a.isParticipating;
      const bIsParticipating = b.creatorId === user?.id || b.isParticipating;
      
      // Prioritize tournaments user is participating in
      if (aIsParticipating && !bIsParticipating) return -1;
      if (!aIsParticipating && bIsParticipating) return 1;
      
      // Within participated tournaments, prioritize owned tournaments
      if (aIsParticipating && bIsParticipating) {
        const aIsOwner = a.creatorId === user?.id;
        const bIsOwner = b.creatorId === user?.id;
        
        if (aIsOwner && !bIsOwner) return -1;
        if (!aIsOwner && bIsOwner) return 1;
      }
      
      // Then sort by the selected criteria
      switch (sortBy) {
        case "starting-soon":
          return new Date(a.scheduledStartTime || a.createdAt).getTime() - new Date(b.scheduledStartTime || b.createdAt).getTime();
        case "pot-high-low":
          return (b.currentPlayers * b.buyInAmount) - (a.currentPlayers * a.buyInAmount);
        case "pot-low-high":
          return (a.currentPlayers * a.buyInAmount) - (b.currentPlayers * b.buyInAmount);
        case "most-recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const sortedUpcoming = sortTournaments(processedTournaments.upcoming);
  const sortedOngoing = sortTournaments(processedTournaments.ongoing);

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view tournaments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6"
        >
          {/* Market Status Disclaimer */}
          <MarketStatusDisclaimer />

          {/* Header */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Tournaments</h1>
              <p className="text-muted-foreground">Join competitions and test your trading skills</p>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Join Private
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Private Tournament</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="join-code">Tournament Code</Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter 8-character code"
                        maxLength={8}
                      />
                    </div>
                    <Button 
                      onClick={() => joinByCodeMutation.mutate(joinCode)}
                      disabled={joinCode.length !== 8 || joinByCodeMutation.isPending}
                      className="w-full"
                    >
                      {joinByCodeMutation.isPending ? "Joining..." : "Join Tournament"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <TournamentCreationDialog 
                isOpen={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)} 
              />
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </div>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tournaments..."
                  className="pl-9 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stocks">Stocks Only</SelectItem>
                  <SelectItem value="crypto">Crypto Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starting-soon">Starting Soonest</SelectItem>
                <SelectItem value="pot-high-low">Highest Pot</SelectItem>
                <SelectItem value="pot-low-high">Lowest Pot</SelectItem>
                <SelectItem value="most-recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tournament Tabs */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                  <Timer className="w-4 h-4" />
                  <span>Upcoming Tournaments ({sortedUpcoming.length})</span>
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Ongoing Tournaments ({sortedOngoing.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6">
                <TournamentGrid 
                  tournaments={sortedUpcoming} 
                  type="upcoming" 
                  onManage={(tournament) => {
                    setSelectedTournament(tournament);
                    setManagementDialogOpen(true);
                  }}
                  onOpenChat={(tournamentId) => setTournamentChatOpen(tournamentId)}
                  onJoinTournament={handleJoinTournament}
                  isJoining={joinTournamentMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="ongoing" className="mt-6">
                <TournamentGrid 
                  tournaments={sortedOngoing} 
                  type="ongoing" 
                  onManage={(tournament) => {
                    setSelectedTournament(tournament);
                    setManagementDialogOpen(true);
                  }}
                  onOpenChat={(tournamentId) => setTournamentChatOpen(tournamentId)}
                  onJoinTournament={handleJoinTournament}
                  onViewLeaderboard={(tournament) => {
                    setSelectedLeaderboardTournament(tournament);
                    setLeaderboardDialogOpen(true);
                  }}
                  isJoining={joinTournamentMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Tournament Management Dialog */}
      {selectedTournament && (
        <TournamentManagementDialog
          tournament={selectedTournament}
          isOpen={managementDialogOpen}
          onClose={() => {
            setManagementDialogOpen(false);
            setSelectedTournament(null);
          }}
        />
      )}

      {/* Tournament-specific Chat System */}
      {tournamentChatOpen && (
        <ChatSystem
          tournamentId={tournamentChatOpen}
          isOpen={true}
          onToggle={() => setTournamentChatOpen(null)}
        />
      )}

      {/* Tournament Leaderboard Dialog */}
      {selectedLeaderboardTournament && (
        <TournamentLeaderboardDialog
          tournament={selectedLeaderboardTournament}
          isOpen={leaderboardDialogOpen}
          onClose={() => {
            setLeaderboardDialogOpen(false);
            setSelectedLeaderboardTournament(null);
          }}
        />
      )}

      {/* Join Tournament Confirmation Dialog */}
      <Dialog open={joinConfirmationOpen} onOpenChange={setJoinConfirmationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Join Tournament</span>
            </DialogTitle>
          </DialogHeader>
          
          {tournamentToJoin && (
            <div className="space-y-6">
              {/* Tournament Basic Info */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-bold">{tournamentToJoin.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {tournamentToJoin.tournamentType === "crypto" ? "Cryptocurrency" : "Stock Market"} Tournament
                  </p>
                </div>

                {/* Tournament Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span>{tournamentToJoin.currentPlayers}/{tournamentToJoin.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{tournamentToJoin.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starting Balance:</span>
                      <span>{formatCurrency(tournamentToJoin.startingBalance)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={tournamentToJoin.isPublic ? "secondary" : "outline"}>
                        {tournamentToJoin.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy-in:</span>
                      <span className="font-medium">
                        {tournamentToJoin.buyInAmount > 0 ? formatCurrency(tournamentToJoin.buyInAmount) : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prize Pool:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(tournamentToJoin.currentPot || (tournamentToJoin.buyInAmount * tournamentToJoin.currentPlayers))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Type Specific Information */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Tournament Rules</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {tournamentToJoin.isPublic ? (
                    <>
                      <li>• Public tournaments cannot be cancelled early</li>
                      <li>• Tournament will run for the full duration</li>
                      <li>• All participants compete fairly until the end</li>
                    </>
                  ) : (
                    <>
                      <li>• Private tournaments can be cancelled by the creator</li>
                      <li>• Creator has full control over tournament settings</li>
                      <li>• Participants may be removed at creator's discretion</li>
                    </>
                  )}
                  <li>• Virtual trading only - no real money at risk</li>
                  <li>• Rankings based on portfolio performance</li>
                </ul>
              </div>

              {/* Buy-in Confirmation */}
              {tournamentToJoin.buyInAmount > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Entry Fee Required</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This tournament requires a buy-in of <strong>{formatCurrency(tournamentToJoin.buyInAmount)}</strong>.
                    This fee contributes to the tournament prize pool.
                  </p>
                </div>
              )}

              {/* Agreement Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  id="tournament-agreement" 
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                />
                <div>
                  <label htmlFor="tournament-agreement" className="text-sm font-medium cursor-pointer">
                    I agree to the tournament terms and conditions
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    By joining, you agree to participate fairly and follow tournament rules.
                    {tournamentToJoin.buyInAmount > 0 && " Entry fee will be charged upon confirmation."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setJoinConfirmationOpen(false);
                    setTournamentToJoin(null);
                    setAgreementChecked(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmJoinTournament}
                  disabled={!agreementChecked || joinTournamentMutation.isPending}
                >
                  {joinTournamentMutation.isPending ? "Joining..." : 
                   tournamentToJoin.buyInAmount > 0 ? `Join - ${formatCurrency(tournamentToJoin.buyInAmount)}` : "Join Free"
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tournament Grid Component
function TournamentGrid({ 
  tournaments, 
  type, 
  onManage,
  onOpenChat,
  onJoinTournament,
  onViewLeaderboard,
  isJoining
}: { 
  tournaments: any[], 
  type: "upcoming" | "ongoing",
  onManage: (tournament: any) => void,
  onOpenChat: (tournamentId: number) => void,
  onJoinTournament: (tournament: any) => void,
  onViewLeaderboard?: (tournament: any) => void,
  isJoining: boolean
}) {

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">No {type} tournaments</h3>
        <p className="text-muted-foreground">
          {type === "upcoming" 
            ? "No upcoming tournaments available. Create your own!" 
            : "No tournaments are currently running."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {tournaments.map((tournament) => (
          <TournamentCard 
            key={tournament.id} 
            tournament={tournament} 
            type={type}
            onJoin={() => onJoinTournament(tournament)}
            isJoining={isJoining}
            onManage={() => onManage(tournament)}
            onOpenChat={() => onOpenChat(tournament.id)}
            onViewLeaderboard={onViewLeaderboard ? () => onViewLeaderboard(tournament) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Tournament Card Component
function TournamentCard({ 
  tournament, 
  type, 
  onJoin, 
  isJoining,
  onManage,
  onOpenChat,
  onViewLeaderboard
}: { 
  tournament: any, 
  type: "upcoming" | "ongoing", 
  onJoin: () => void,
  isJoining: boolean,
  onManage: () => void,
  onOpenChat: () => void,
  onViewLeaderboard?: () => void
}) {
  const { formatCurrency } = useUserPreferences();
  const { user } = useAuth();
  
  const currentPot = tournament.currentPlayers * tournament.buyInAmount;
  const isCreator = tournament.creatorId === user?.id;
  const isParticipant = tournament.participants?.some((p: any) => p.userId === user?.id) || isCreator;
  
  const getTournamentTypeIcon = (tournamentType: string) => {
    return tournamentType === "crypto" ? Bitcoin : TrendingUp;
  };

  const TournamentTypeIcon = getTournamentTypeIcon(tournament.tournamentType);

  const getTimeRemaining = () => {
    if (type === "upcoming" && tournament.scheduledStartTime) {
      const timeLeft = new Date(tournament.scheduledStartTime).getTime() - Date.now();
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return `Starts in ${hours}h ${minutes}m`;
      }
      return "Starting soon";
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border bg-background">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-foreground mb-2 truncate">
                {tournament.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {tournament.tournamentType === "crypto" ? "Crypto" : "Stocks"}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <Badge variant={type === "upcoming" ? "secondary" : "default"} className="text-xs">
                  {type === "upcoming" ? "Upcoming" : "Live"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Pot - Clean */}
          <div className="text-center py-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Pot</div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentPot)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {tournament.currentPlayers} player{tournament.currentPlayers !== 1 ? 's' : ''} joined
            </div>
          </div>

          {/* Tournament Stats - Simplified */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Players</span>
              <span className="font-medium">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{tournament.timeframe}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Starting Balance</span>
              <span className="font-medium">{formatCurrency(tournament.startingBalance)}</span>
            </div>
          </div>

          {/* Time Information */}
          {type === "upcoming" && (
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {getTimeRemaining()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onOpenChat}
              className="w-full"
              variant="outline"
              size="sm"
            >
              Chat
            </Button>
            
            {type === "ongoing" && tournament.isPublic && !isParticipant ? (
              // Show "View" button for ongoing public tournaments where user is not a participant
              <Button
                onClick={onViewLeaderboard}
                className="w-full"
                variant="outline"
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            ) : isCreator ? (
              <Button
                onClick={onManage}
                className="w-full"
                variant="outline"
                size="sm"
              >
                Manage
              </Button>
            ) : type === "upcoming" ? (
              <Button
                onClick={onJoin}
                disabled={isJoining || tournament.currentPlayers >= tournament.maxPlayers}
                className="w-full"
                size="sm"
              >
                {isJoining ? "Joining..." : 
                 tournament.currentPlayers >= tournament.maxPlayers ? "Full" :
                 tournament.buyInAmount > 0 ? `Join - ${formatCurrency(tournament.buyInAmount)}` : "Join Free"
                }
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Add ChatSystem to the main TournamentsPage
export { ChatSystem } from "@/components/chat/ChatSystem";