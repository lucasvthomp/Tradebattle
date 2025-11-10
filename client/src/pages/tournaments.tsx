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
import { BuyInIncentiveBox } from "@/components/ui/buy-in-incentive-box";
import { TournamentCreationDialog } from "@/components/tournaments/TournamentCreationDialog";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";
import { ChatSystem } from "@/components/chat/ChatSystem";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 }
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
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6"
        >
          {/* Market Status Disclaimer */}

          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative">
                    <Trophy className="h-8 w-8 lg:h-10 lg:w-10 text-primary relative z-10" />
                    <div className="absolute inset-0 bg-primary/30 blur-xl animate-pulse" />
                  </div>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Tournaments
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground ml-0 lg:ml-14 font-medium">Join competitions and test your trading skills against the world</p>
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
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Timer className="w-4 h-4" />
                  <span className="hidden sm:inline">Upcoming</span>
                  <Badge variant="secondary" className="ml-1 bg-background/20 text-inherit border-0">
                    {sortedUpcoming.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="ongoing"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Ongoing</span>
                  <Badge variant="secondary" className="ml-1 bg-background/20 text-inherit border-0">
                    {sortedOngoing.length}
                  </Badge>
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
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {tournaments.map((tournament, index) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            type={type}
            index={index}
            onJoin={() => onJoinTournament(tournament)}
            isJoining={isJoining}
            onManage={() => onManage(tournament)}
            onOpenChat={() => onOpenChat(tournament.id)}
            onViewLeaderboard={onViewLeaderboard ? () => onViewLeaderboard(tournament) : undefined}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Tournament Card Component
function TournamentCard({
  tournament,
  type,
  index,
  onJoin,
  isJoining,
  onManage,
  onOpenChat,
  onViewLeaderboard
}: {
  tournament: any,
  type: "upcoming" | "ongoing",
  index: number,
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
  const isHighPot = currentPot >= 10000; // High value tournament threshold
  
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
      variants={cardVariants}
      custom={index}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="h-full"
    >
      <Card className={`h-full relative overflow-hidden group backdrop-blur-sm transition-all duration-500 border-2 ${
        isHighPot
          ? type === "ongoing"
            ? "border-green-500/50 hover:border-green-400 bg-gradient-to-br from-card via-green-500/5 to-emerald-500/10 shadow-lg shadow-green-500/20 hover:shadow-2xl hover:shadow-green-400/30"
            : "border-orange-500/50 hover:border-orange-400 bg-gradient-to-br from-card via-orange-500/5 to-red-500/10 shadow-lg shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-400/30"
          : type === "ongoing"
            ? "border-green-500/30 hover:border-green-500/60 bg-gradient-to-br from-card/95 via-card/90 to-green-500/5 hover:shadow-xl hover:shadow-green-500/10"
            : "border-orange-500/30 hover:border-orange-500/60 bg-gradient-to-br from-card/95 via-card/90 to-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10"
      }`}>
        {/* High pot crown indicator */}
        {isHighPot && (
          <div className="absolute top-3 right-3 z-20">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Crown className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            </motion.div>
          </div>
        )}

        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          type === "ongoing"
            ? "bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10"
            : "bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10"
        }`} />

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
            type === "ongoing"
              ? "bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-orange-400/10 to-transparent"
          }`} />
        </div>

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`p-2 rounded-lg shadow-lg ${
                    type === "ongoing"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30"
                      : "bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/30"
                  }`}
                >
                  <TournamentTypeIcon className="w-4 h-4 text-white" />
                </motion.div>
                {type === "ongoing" && (
                  <motion.div
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full border border-green-500/30"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">LIVE</span>
                  </motion.div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-foreground mb-2 truncate group-hover:text-primary transition-colors duration-300">
                {tournament.name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs font-semibold backdrop-blur-sm transition-all duration-300 ${
                  tournament.tournamentType === "crypto"
                    ? "border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                    : "border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                }`}>
                  {tournament.tournamentType === "crypto" ? "Crypto" : "Stocks"}
                </Badge>
                {!tournament.isPublic && (
                  <Badge variant="outline" className="text-xs font-semibold border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-500/10 backdrop-blur-sm hover:bg-purple-500/20 transition-all duration-300">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          {/* Current Pot - Enhanced */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className={`relative text-center py-5 rounded-xl border-2 overflow-hidden backdrop-blur-sm ${
              isHighPot
                ? type === "ongoing"
                  ? "bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-green-600/20 border-green-400/50 shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-br from-orange-500/20 via-red-500/15 to-orange-600/20 border-orange-400/50 shadow-lg shadow-orange-500/20"
                : type === "ongoing"
                  ? "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-600/10 border-green-500/30"
                  : "bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-600/10 border-orange-500/30"
            }`}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <DollarSign className={`w-5 h-5 ${
                    isHighPot ? "text-yellow-500" : "text-primary"
                  }`} />
                </motion.div>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Prize Pool</span>
              </div>
              <motion.div
                animate={isHighPot ? {
                  textShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                    "0 0 30px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.3)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`text-4xl font-black bg-gradient-to-r ${
                  isHighPot
                    ? "from-yellow-400 via-yellow-500 to-yellow-600"
                    : type === "ongoing"
                      ? "from-green-500 via-emerald-500 to-green-600"
                      : "from-orange-500 via-red-500 to-orange-600"
                } bg-clip-text text-transparent mb-1.5 drop-shadow-lg`}
              >
                {formatCurrency(currentPot)}
              </motion.div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{tournament.currentPlayers} player{tournament.currentPlayers !== 1 ? 's' : ''} joined</span>
              </div>
            </div>
          </motion.div>

          {/* Tournament Stats - Enhanced */}
          <div className="space-y-2.5 text-sm bg-gradient-to-br from-muted/40 via-muted/30 to-muted/40 backdrop-blur-sm rounded-lg p-3.5 border border-border/30">
            <div className="flex justify-between items-center group/stat">
              <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover/stat:text-foreground">
                <Users className="w-4 h-4" />
                <span className="font-medium">Players</span>
              </div>
              <span className="font-bold text-foreground">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex justify-between items-center group/stat">
              <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover/stat:text-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Duration</span>
              </div>
              <span className="font-bold text-foreground">{tournament.timeframe}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex justify-between items-center group/stat">
              <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover/stat:text-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">Buy-in</span>
              </div>
              <span className="font-bold text-foreground">{formatCurrency(tournament.buyInAmount)}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex justify-between items-center group/stat">
              <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover/stat:text-foreground">
                <Target className="w-4 h-4" />
                <span className="font-medium">Starting Balance</span>
              </div>
              <span className="font-bold text-foreground">{formatCurrency(tournament.startingBalance)}</span>
            </div>
          </div>

          {/* Time Information */}
          {type === "upcoming" && (
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: [
                  "0 0 0px rgba(249, 115, 22, 0)",
                  "0 0 20px rgba(249, 115, 22, 0.3)",
                  "0 0 0px rgba(249, 115, 22, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center p-3.5 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-lg border-2 border-orange-500/40 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Timer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {getTimeRemaining()}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onOpenChat}
                className="w-full transition-all duration-300 hover:shadow-lg"
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </motion.div>
            
            {type === "ongoing" && tournament.isPublic && !isParticipant ? (
              // Show "View" button for ongoing public tournaments where user is not a participant
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onViewLeaderboard}
                  className="w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20"
                  variant="outline"
                  size="sm"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </motion.div>
            ) : isCreator ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onManage}
                  className="w-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20"
                  variant="outline"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </motion.div>
            ) : type === "upcoming" ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onJoin}
                  disabled={isJoining || tournament.currentPlayers >= tournament.maxPlayers}
                  className={`w-full transition-all duration-300 font-bold ${
                    !(isJoining || tournament.currentPlayers >= tournament.maxPlayers)
                      ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:shadow-primary/30"
                      : ""
                  }`}
                  size="sm"
                >
                  {isJoining ? "Joining..." :
                   tournament.currentPlayers >= tournament.maxPlayers ? "Full" :
                   tournament.buyInAmount > 0 ? `Join - ${formatCurrency(tournament.buyInAmount)}` : "Join Free"
                  }
                </Button>
              </motion.div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Add ChatSystem to the main TournamentsPage
export { ChatSystem } from "@/components/chat/ChatSystem";