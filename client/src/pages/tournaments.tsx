import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation as useRouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Users,
  Clock,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  Bitcoin,
  Timer,
  Shield,
  Lock,
  Crown,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { TournamentManagementDialog } from "@/components/tournaments/TournamentManagementDialog";
import { TournamentCreationDialog } from "@/components/tournaments/TournamentCreationDialog";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";
import { TournamentJoinConfirmation } from "@/components/tournaments/TournamentJoinConfirmation";

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
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const parseTimeframe = (timeframe: string): number => {
  const match = timeframe.match(/(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks|month|months)/i);
  if (!match) return 28 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'minute': case 'minutes': return value * 60 * 1000;
    case 'hour': case 'hours': return value * 60 * 60 * 1000;
    case 'day': case 'days': return value * 24 * 60 * 60 * 1000;
    case 'week': case 'weeks': return value * 7 * 24 * 60 * 60 * 1000;
    case 'month': case 'months': return value * 30 * 24 * 60 * 60 * 1000;
    default: return 28 * 24 * 60 * 60 * 1000;
  }
};

// Participant Avatar Stack component
function ParticipantAvatarStack({ participants, totalCount }: {
  participants: { userId: number; username: string; profilePicture: string | null }[];
  totalCount: number;
}) {
  const maxShow = 5;
  const shown = participants.slice(0, maxShow);
  const overflow = totalCount - maxShow;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.userId} className="w-7 h-7">
          {p.profilePicture && (
            <AvatarImage src={p.profilePicture} className="object-cover" />
          )}
          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#0C1829', color: '#00A3FF' }}>
            {p.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: '#0C1829', color: '#00A3FF', border: '2px solid #0C1A2E' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default function TournamentsPage() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();
  const [location, navigate] = useRouterLocation();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [sortBy, setSortBy] = useState("starting-soon");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyTournaments, setShowMyTournaments] = useState(false);
  const [showJoinable, setShowJoinable] = useState(false);
  const [showWithFriends, setShowWithFriends] = useState(false);

  const [joinConfirmationOpen, setJoinConfirmationOpen] = useState(false);
  const [tournamentToJoin, setTournamentToJoin] = useState<any>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);

  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [selectedLeaderboardTournament, setSelectedLeaderboardTournament] = useState<any>(null);

  // Fetch public tournaments
  const { data: publicTournaments, isLoading: publicLoading } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments/public'],
    refetchInterval: 30000,
  });

  // Fetch user's tournaments
  const { data: userTournaments, isLoading: userLoading } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments'],
    refetchInterval: 30000,
  });

  // Fetch archived tournaments (for Past and History tabs)
  const { data: archivedTournaments } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments/archived'],
    enabled: false, // archived tournaments not shown in new 2-tab layout
  });

  // Fetch friends for "With Friends" filter
  const { data: friendsData } = useQuery<{data: any[]}>({
    queryKey: ['/api/friends'],
  });
  const friendIds = useMemo(() => (friendsData?.data || []).map((f: any) => f.userId), [friendsData]);

  // Handle URL join parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const joinParam = params.get('join');

    if (joinParam) {
      // Fetch tournament by code
      apiRequest('GET', `/api/tournaments/code/${joinParam}`)
        .then(response => response.json())
        .then((result: any) => {
          const tournament = result.data ?? result;
          if (tournament.alreadyJoined) {
            toast({
              title: "Already Joined",
              description: `You're already in ${tournament.name}`,
            });
          } else {
            setTournamentToJoin(tournament);
            setJoinConfirmationOpen(true);
          }
          // Clean URL
          navigate('/tournaments', { replace: true });
        })
        .catch(error => {
          toast({
            title: "Tournament Not Found",
            description: error.message || "Invalid tournament code",
            variant: "destructive"
          });
          navigate('/tournaments', { replace: true });
        });
    }
  }, [location, navigate, toast]);

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
      toast({ title: "Success", description: "Successfully joined tournament!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Join tournament by ID or code mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentIdOrCode: number | string) => {
      // If it's a string (code), use the code endpoint
      if (typeof tournamentIdOrCode === 'string') {
        const res = await apiRequest("POST", `/api/tournaments/code/${tournamentIdOrCode}/join`, {});
        return res.json();
      }
      // Otherwise use the ID endpoint
      const res = await apiRequest("POST", `/api/tournaments/${tournamentIdOrCode}/join`, {});
      return res.json();
    },
    onSuccess: () => {
      setJoinConfirmationOpen(false);
      setTournamentToJoin(null);
      setAgreementChecked(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({ title: "Success", description: "Successfully joined tournament!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleJoinTournament = (tournament: any) => {
    setTournamentToJoin(tournament);
    setJoinConfirmationOpen(true);
  };

  const confirmJoinTournament = () => {
    if (tournamentToJoin) {
      joinTournamentMutation.mutate(tournamentToJoin.code || tournamentToJoin.id);
      // Don't close immediately - let onSuccess handle it
    }
  };

  // Combine public tournaments and user's tournaments, removing duplicates
  const allTournaments = useMemo(() => {
    const publicList = publicTournaments?.data || [];
    const userList = userTournaments?.data || [];
    const tournamentMap = new Map();

    publicList.forEach((tournament: any) => {
      tournamentMap.set(tournament.id, tournament);
    });

    userList.forEach((tournament: any) => {
      const isUserParticipating = tournament.creatorId === user?.id || tournament.isParticipating;
      if (tournament.isPublic || isUserParticipating) {
        tournamentMap.set(tournament.id, tournament);
      }
    });

    return Array.from(tournamentMap.values());
  }, [publicTournaments, userTournaments, user?.id]);

  // Apply checkbox filters helper
  const applyCheckboxFilters = (tournaments: any[]) => {
    let filtered = tournaments;
    if (showMyTournaments) {
      filtered = filtered.filter((t: any) =>
        t.creatorId === user?.id || t.participantUserIds?.includes(user?.id)
      );
    }
    if (showJoinable) {
      filtered = filtered.filter((t: any) =>
        t.currentPlayers < t.maxPlayers && !t.participantUserIds?.includes(user?.id)
      );
    }
    if (showWithFriends) {
      filtered = filtered.filter((t: any) =>
        t.participantUserIds?.some((id: number) => friendIds.includes(id))
      );
    }
    return filtered;
  };

  // Upcoming tab: waiting tournaments
  const upcomingTournaments = useMemo(() => {
    let filtered = allTournaments.filter((t: any) =>
      t.status === "waiting" &&
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    filtered = applyCheckboxFilters(filtered);

    return [...filtered].sort((a, b) => {
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
  }, [allTournaments, filterType, searchQuery, sortBy, user?.id, showMyTournaments, showJoinable, showWithFriends, friendIds]);

  // Live tab: active tournaments
  const liveTournaments = useMemo(() => {
    let filtered = allTournaments.filter((t: any) =>
      t.status === "active" &&
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    filtered = applyCheckboxFilters(filtered);

    return [...filtered].sort((a, b) => {
      const aIsParticipating = a.creatorId === user?.id || a.participantUserIds?.includes(user?.id);
      const bIsParticipating = b.creatorId === user?.id || b.participantUserIds?.includes(user?.id);
      if (aIsParticipating && !bIsParticipating) return -1;
      if (!aIsParticipating && bIsParticipating) return 1;

      switch (sortBy) {
        case "starting-soon":
          return new Date(a.startedAt || a.createdAt).getTime() - new Date(b.startedAt || b.createdAt).getTime();
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
  }, [allTournaments, filterType, searchQuery, sortBy, user?.id, showMyTournaments, showJoinable, showWithFriends, friendIds]);

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#F1F5F9' }}>Please Log In</h2>
          <p style={{ color: '#94A3B8' }}>You need to be logged in to view tournaments.</p>
        </div>
      </div>
    );
  }

  const getTabCount = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingTournaments.length;
      case 'live': return liveTournaments.length;
      default: return 0;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto" style={{ background: 'transparent' }}>
      <div className="container mx-auto px-4 lg:px-8" style={{ padding: 'clamp(16px, 3vh, 40px) clamp(16px, 2vw, 32px)' }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center mb-3" style={{ gap: 'clamp(8px, 1vw, 16px)' }}>
                <Trophy style={{ width: 'clamp(28px, 3vw, 48px)', height: 'clamp(28px, 3vw, 48px)', color: '#00A3FF' }} />
                <h1 className="font-black" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.75rem)', color: '#F1F5F9' }}>
                  Tournaments
                </h1>
              </div>
            </div>
            <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 16px)' }}>
              <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-lg border-0" style={{
                    height: 'clamp(44px, 2.5vh, 48px)',
                    padding: '0 clamp(12px, 1.5vw, 20px)',
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                    backgroundColor: '#0C1829',
                    color: '#F1F5F9',
                  }}>
                    <Lock style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)', marginRight: '8px' }} />
                    Join Private
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-md" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: '#F1F5F9' }}>Join Private Tournament</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="join-code" className="text-base md:text-sm" style={{ color: '#F1F5F9' }}>Tournament Code</Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter 8-character code"
                        maxLength={8}
                        className="text-base md:text-sm min-h-[44px]"
                        style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}
                      />
                    </div>
                    <Button
                      onClick={() => joinByCodeMutation.mutate(joinCode)}
                      disabled={joinCode.length !== 8 || joinByCodeMutation.isPending}
                      className="w-full border-0 min-h-[44px] text-base md:text-sm"
                      style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
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
              <Button onClick={() => setCreateDialogOpen(true)} className="rounded-lg border-0" style={{
                height: 'clamp(44px, 2.5vh, 48px)',
                padding: '0 clamp(12px, 1.5vw, 20px)',
                fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                background: 'linear-gradient(135deg, #0D1E35, #334155)',
                color: '#FFFFFF'
              }}>
                <Plus style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)', marginRight: '8px' }} />
                Create Tournament
              </Button>
            </div>
          </motion.div>

          {/* Search and Filter Controls - Mobile Responsive */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
              {/* Search - Full width on mobile */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tournaments..."
                  className="pl-9 w-full sm:w-64"
                  style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}
                />
              </div>
              {/* Type Filter - Responsive width */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stocks">Stocks Only</SelectItem>
                  <SelectItem value="crypto">Crypto Only</SelectItem>
                </SelectContent>
              </Select>
              {/* Checkboxes - Hidden on mobile, shown on md+ */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="my-tournaments"
                    checked={showMyTournaments}
                    onCheckedChange={(checked) => setShowMyTournaments(checked === true)}
                  />
                  <label htmlFor="my-tournaments" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#F1F5F9' }}>
                    My Tournaments
                  </label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="joinable"
                    checked={showJoinable}
                    onCheckedChange={(checked) => setShowJoinable(checked === true)}
                  />
                  <label htmlFor="joinable" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#F1F5F9' }}>
                    Joinable
                  </label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="with-friends"
                    checked={showWithFriends}
                    onCheckedChange={(checked) => setShowWithFriends(checked === true)}
                  />
                  <label htmlFor="with-friends" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#F1F5F9' }}>
                    With Friends
                  </label>
                </div>
              </div>
            </div>
            {/* Sort - Full width on mobile */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
                <SelectItem value="starting-soon">Starting Soonest</SelectItem>
                <SelectItem value="pot-high-low">Highest Pot</SelectItem>
                <SelectItem value="pot-low-high">Lowest Pot</SelectItem>
                <SelectItem value="most-recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300"
                style={activeTab === 'upcoming'
                  ? { backgroundColor: '#10B981', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#FFFFFF' }
                }
              >
                <Trophy className="w-4 h-4" />
                <span>Upcoming</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: activeTab === 'upcoming' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  color: '#FFFFFF',
                }}>
                  {upcomingTournaments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300"
                style={activeTab === 'live'
                  ? { background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#FFFFFF' }
                }
              >
                <Play className="w-4 h-4" />
                <span>Live</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: activeTab === 'live' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  color: '#FFFFFF',
                }}>
                  {liveTournaments.length}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'upcoming' && (
                <TournamentList
                  tournaments={upcomingTournaments}
                  type="upcoming"
                  onManage={(tournament) => {
                    setSelectedTournament(tournament);
                    setManagementDialogOpen(true);
                  }}
                  onJoinTournament={handleJoinTournament}
                  onViewLeaderboard={(tournament) => {
                    setSelectedLeaderboardTournament(tournament);
                    setLeaderboardDialogOpen(true);
                  }}
                  isJoining={joinTournamentMutation.isPending}
                />
              )}
              {activeTab === 'live' && (
                <TournamentList
                  tournaments={liveTournaments}
                  type="live"
                  onManage={(tournament) => {
                    setSelectedTournament(tournament);
                    setManagementDialogOpen(true);
                  }}
                  onJoinTournament={handleJoinTournament}
                  onViewLeaderboard={(tournament) => {
                    setSelectedLeaderboardTournament(tournament);
                    setLeaderboardDialogOpen(true);
                  }}
                  isJoining={joinTournamentMutation.isPending}
                />
              )}
            </div>
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
      {tournamentToJoin && (
        <TournamentJoinConfirmation
          isOpen={joinConfirmationOpen}
          onClose={() => {
            setJoinConfirmationOpen(false);
            setTournamentToJoin(null);
          }}
          onConfirm={confirmJoinTournament}
          tournament={{
            name: tournamentToJoin.name,
            buyIn: tournamentToJoin.buyInAmount || 0,
            prizePool: tournamentToJoin.currentPot || (tournamentToJoin.buyInAmount * tournamentToJoin.currentPlayers) || 0,
            startingBalance: tournamentToJoin.startingBalance,
            startsAt: tournamentToJoin.startTime,
            endsAt: tournamentToJoin.endTime
          }}
          isLoading={joinTournamentMutation.isPending}
        />
      )}
    </div>
  );
}

// Tournament List Component - renders vertical list of horizontal cards
function TournamentList({
  tournaments,
  type,
  onManage,
  onJoinTournament,
  onViewLeaderboard,
  isJoining
}: {
  tournaments: any[];
  type: "upcoming" | "live";
  onManage: (tournament: any) => void;
  onJoinTournament: (tournament: any) => void;
  onViewLeaderboard: (tournament: any) => void;
  isJoining: boolean;
}) {
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#94A3B8', opacity: 0.3 }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#F1F5F9' }}>
          {type === "upcoming" ? "No upcoming tournaments" : "No live tournaments"}
        </h3>
        <p style={{ color: '#94A3B8' }}>
          {type === "upcoming"
            ? "No tournaments are waiting to start. Create your own!"
            : "No tournaments are currently live."
          }
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {tournaments.map((tournament, index) => (
          <HorizontalTournamentCard
            key={tournament.id}
            tournament={tournament}
            index={index}
            type={type}
            onJoin={() => onJoinTournament(tournament)}
            isJoining={isJoining}
            onManage={() => onManage(tournament)}
            onViewLeaderboard={() => onViewLeaderboard(tournament)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Horizontal Tournament Card
function HorizontalTournamentCard({
  tournament,
  index,
  type,
  onJoin,
  isJoining,
  onManage,
  onViewLeaderboard
}: {
  tournament: any;
  index: number;
  type: "upcoming" | "live";
  onJoin: () => void;
  isJoining: boolean;
  onManage: () => void;
  onViewLeaderboard: () => void;
}) {
  const { formatCurrency } = useUserPreferences();
  const { user } = useAuth();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const isLive = tournament.status === "active";
  const isWaiting = tournament.status === "waiting";
  const isCreator = tournament.creatorId === user?.id;
  const isParticipant = tournament.participants?.some((p: any) => p.userId === user?.id) || isCreator;
  const currentPot = tournament.currentPot || (tournament.currentPlayers * tournament.buyInAmount);
  const isHighPot = currentPot >= 10000;
  const TournamentTypeIcon = tournament.tournamentType === "crypto" ? Bitcoin : TrendingUp;
  const participantPreviews = tournament.participantPreviews || [];

  // Update countdown every second
  React.useEffect(() => {
    if (isLive || isWaiting) {
      const interval = setInterval(() => forceUpdate(), 1000);
      return () => clearInterval(interval);
    }
  }, [isLive, isWaiting]);

  const getTimeRemaining = () => {
    if (isWaiting && tournament.scheduledStartTime) {
      const timeLeft = new Date(tournament.scheduledStartTime).getTime() - Date.now();
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        if (days > 0) return `Starts in ${days}d ${hours}h`;
        if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
        return `Starts in ${minutes}m ${seconds}s`;
      }
      return "Starting soon";
    }
    if (isLive) {
      const startedAt = tournament.startedAt || tournament.createdAt;
      if (startedAt && tournament.timeframe) {
        const endTime = new Date(startedAt).getTime() + parseTimeframe(tournament.timeframe);
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) return "Ending soon";
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m ${seconds}s remaining`;
      }
    }
    return null;
  };

  const getActionButton = () => {
    if (isLive) {
      return (
        <Button
          onClick={onViewLeaderboard}
          className="border-0 whitespace-nowrap min-h-[44px] md:min-h-0 text-base md:text-sm"
          size="sm"
          style={{ backgroundColor: '#0C1829', color: '#10B981' }}
        >
          <Trophy className="w-3.5 h-3.5 mr-1.5" />
          Leaderboard
        </Button>
      );
    }

    if (isCreator && isWaiting) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              try {
                await apiRequest("POST", `/api/tournaments/${tournament.id}/start-early`);
                window.location.reload();
              } catch (error: any) {
                console.error("Failed to start tournament:", error);
              }
            }}
            className="border-0 whitespace-nowrap min-h-[44px] md:min-h-0 text-base md:text-sm"
            size="sm"
            style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Start
          </Button>
          <Button
            onClick={onManage}
            className="border-0 whitespace-nowrap min-h-[44px] md:min-h-0 text-base md:text-sm"
            size="sm"
            style={{ backgroundColor: '#0C1829', color: '#F1F5F9' }}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Manage
          </Button>
        </div>
      );
    }

    if (isWaiting) {
      return (
        <Button
          onClick={onJoin}
          disabled={isJoining || tournament.currentPlayers >= tournament.maxPlayers}
          className="border-0 whitespace-nowrap min-h-[44px] md:min-h-0 text-base md:text-sm"
          size="sm"
          style={!(isJoining || tournament.currentPlayers >= tournament.maxPlayers)
            ? { backgroundColor: '#10B981', color: '#FFFFFF' }
            : { backgroundColor: '#0C1829', color: '#94A3B8' }
          }
        >
          {isJoining ? "Joining..." :
           tournament.currentPlayers >= tournament.maxPlayers ? "Full" :
           tournament.buyInAmount > 0 ? `Join - ${formatCurrency(tournament.buyInAmount)}` : "Join Free"
          }
        </Button>
      );
    }

    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
    >
      <div
        className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
        style={{
          backgroundColor: '#0C1829',
          border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : '#0E2040'}`,
        }}
      >
        {/* Left: Icon + Name + Badges + Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{
              backgroundColor: isLive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            }}>
              <TournamentTypeIcon className="w-3.5 h-3.5" style={{ color: isLive ? '#10B981' : '#10B981' }} />
            </div>
            <span className="font-bold text-sm truncate" style={{ color: '#F1F5F9' }}>
              {tournament.name}
            </span>
            {isHighPot && <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3FF' }} />}
            {isLive && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
                <span className="text-[10px] font-bold" style={{ color: '#10B981' }}>LIVE</span>
              </div>
            )}
            {!tournament.isPublic && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                <Lock className="w-2.5 h-2.5" style={{ color: '#94A3B8' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>Private</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
            <span>{tournament.tournamentType === "crypto" ? "Crypto" : "Stocks"}</span>
            {getTimeRemaining() && (
              <>
                <span>|</span>
                <span style={{ color: isLive ? '#10B981' : '#10B981' }}>{getTimeRemaining()}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Stats columns */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Jackpot</div>
            <div className="text-sm font-bold" style={{ color: '#00A3FF' }}>{formatCurrency(currentPot)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Buy-in</div>
            <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
              {tournament.buyInAmount > 0 ? formatCurrency(tournament.buyInAmount) : "Free"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Players</div>
            <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </div>
          </div>
        </div>

        {/* Right: Avatar stack + Action */}
        <div className="flex items-center gap-3">
          {participantPreviews.length > 0 && (
            <div className="hidden lg:block">
              <ParticipantAvatarStack
                participants={participantPreviews}
                totalCount={tournament.currentPlayers}
              />
            </div>
          )}
          {getActionButton()}
        </div>
      </div>
    </motion.div>
  );
}
