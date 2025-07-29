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

  // Tournament creation form state
  const [tournamentForm, setTournamentForm] = useState({
    name: "", // Tournament title
    maxPlayers: 10, // Max amount of players
    startingBalance: 10000, // Starting Fake Cash amount
    duration: "1 week", // Duration of the tournament
    startDelay: "5 minutes", // In how many minutes, hours, or days the tournament will start (minimum 5 minutes)
    isPublic: true, // Private or Public
    buyInAmount: 0 // Buy-in amount
  });

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

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (formData: typeof tournamentForm) => {
      const scheduledStartTime = new Date(Date.now() + START_DELAY_OPTIONS.find(opt => opt.value === formData.startDelay)!.ms);

      const res = await apiRequest("POST", "/api/tournaments", {
        ...formData,
        scheduledStartTime: scheduledStartTime.toISOString()
      });
      return res.json();
    },
    onSuccess: () => {
      setCreateDialogOpen(false);
      setTournamentForm({
        name: "",
        maxPlayers: 10,
        startingBalance: 10000,
        duration: "1 week",
        startDelay: "5 minutes",
        isPublic: true,
        buyInAmount: 0
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Success",
        description: "Tournament created successfully!",
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
    
    // Add user tournaments (overwrites public if same ID, adds private ones)
    userList.forEach(tournament => {
      tournamentMap.set(tournament.id, tournament);
    });
    
    return Array.from(tournamentMap.values());
  }, [publicTournaments, userTournaments]);

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

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Tournament</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Tournament Name */}
                    <div>
                      <Label htmlFor="tournament-name">Tournament Name</Label>
                      <Input
                        id="tournament-name"
                        value={tournamentForm.name}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter tournament name"
                      />
                    </div>

                    {/* Max Players */}
                    <div>
                      <Label>Max Players</Label>
                      <Input
                        type="number"
                        min="2"
                        max="100"
                        value={tournamentForm.maxPlayers}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      />
                    </div>

                    {/* Starting Balance and Buy-in */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Starting Fake Cash</Label>
                        <Input
                          type="number"
                          min="1000"
                          max="1000000"
                          step="1000"
                          value={tournamentForm.startingBalance}
                          onChange={(e) => setTournamentForm(prev => ({ ...prev, startingBalance: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Buy-in Amount ({formatCurrency(0)})</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          step="5"
                          value={tournamentForm.buyInAmount}
                          onChange={(e) => setTournamentForm(prev => ({ ...prev, buyInAmount: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {/* Duration and Start Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration</Label>
                        <Select 
                          value={tournamentForm.duration} 
                          onValueChange={(value) => setTournamentForm(prev => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Start Time</Label>
                        <Select 
                          value={tournamentForm.startDelay} 
                          onValueChange={(value) => setTournamentForm(prev => ({ ...prev, startDelay: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {START_DELAY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>



                    {/* Public/Private Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {tournamentForm.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        <div>
                          <Label>Tournament Visibility</Label>
                          <p className="text-sm text-muted-foreground">
                            {tournamentForm.isPublic ? "Public tournaments appear in the tournament browser" : "Private tournaments require a code to join"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={tournamentForm.isPublic}
                        onCheckedChange={(checked) => setTournamentForm(prev => ({ ...prev, isPublic: checked }))}
                      />
                    </div>

                    {/* Create Button */}
                    <Button 
                      onClick={() => createTournamentMutation.mutate(tournamentForm)}
                      disabled={createTournamentMutation.isPending || !tournamentForm.name}
                      className="w-full"
                    >
                      {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
    </div>
  );
}

// Tournament Grid Component
function TournamentGrid({ 
  tournaments, 
  type, 
  onManage,
  onOpenChat
}: { 
  tournaments: any[], 
  type: "upcoming" | "ongoing",
  onManage: (tournament: any) => void,
  onOpenChat: (tournamentId: number) => void
}) {
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/join`, {});
      return res.json();
    },
    onSuccess: () => {
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
            onJoin={() => joinTournamentMutation.mutate(tournament.id)}
            isJoining={joinTournamentMutation.isPending}
            onManage={() => onManage(tournament)}
            onOpenChat={() => onOpenChat(tournament.id)}
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
  onOpenChat
}: { 
  tournament: any, 
  type: "upcoming" | "ongoing", 
  onJoin: () => void,
  isJoining: boolean,
  onManage: () => void,
  onOpenChat: () => void
}) {
  const { formatCurrency } = useUserPreferences();
  const { user } = useAuth();
  
  const currentPot = tournament.currentPlayers * tournament.buyInAmount;
  const isCreator = tournament.creatorId === user?.id;
  
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

          {/* Action Buttons - Simplified */}
          <div className="space-y-2">
            <Button
              onClick={onOpenChat}
              className="w-full"
              variant="outline"
              size="sm"
            >
              Chat
            </Button>
            
            {isCreator ? (
              <Button
                onClick={onManage}
                className="w-full"
                variant="outline"
                size="sm"
              >
                Manage
              </Button>
            ) : (
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
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Add ChatSystem to the main TournamentsPage
export { ChatSystem } from "@/components/chat/ChatSystem";