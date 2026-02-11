import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Play,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { TournamentManagementDialog } from "@/components/tournaments/TournamentManagementDialog";
import { TournamentCreationDialog } from "@/components/tournaments/TournamentCreationDialog";
import { TournamentLeaderboardDialog } from "@/components/tournaments/TournamentLeaderboardDialog";

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
        <Avatar key={p.userId} className="w-7 h-7" style={{ border: '2px solid #111827' }}>
          {p.profilePicture && (
            <AvatarImage src={p.profilePicture} className="object-cover" />
          )}
          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#1F2937', color: '#E3B341' }}>
            {p.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: '#1F2937', color: '#E3B341', border: '2px solid #111827' }}
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

  const [activeTab, setActiveTab] = useState("active");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [sortBy, setSortBy] = useState("starting-soon");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    enabled: activeTab === 'past' || activeTab === 'history',
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
      toast({ title: "Success", description: "Successfully joined tournament!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Success", description: "Successfully joined tournament!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleJoinTournament = (tournament: any) => {
    setTournamentToJoin(tournament);
    setJoinConfirmationOpen(true);
    setAgreementChecked(false);
  };

  const confirmJoinTournament = () => {
    if (tournamentToJoin && agreementChecked) {
      joinTournamentMutation.mutate(tournamentToJoin.id);
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

  // Active tab: combined waiting + active, sorted by priority
  const activeTournaments = useMemo(() => {
    const filtered = allTournaments.filter((t: any) =>
      (t.status === "waiting" || t.status === "active") &&
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return [...filtered].sort((a, b) => {
      const aIsParticipating = a.creatorId === user?.id || a.isParticipating;
      const bIsParticipating = b.creatorId === user?.id || b.isParticipating;
      const aIsActive = a.status === "active";
      const bIsActive = b.status === "active";

      // Priority 1: Active tournaments user IS participating in
      const aPriority = aIsActive && aIsParticipating ? 0
        : !aIsActive && (aIsParticipating || !aIsActive) ? 1  // Waiting/joinable
        : aIsActive && !aIsParticipating ? 2
        : 3;
      const bPriority = bIsActive && bIsParticipating ? 0
        : !bIsActive && (bIsParticipating || !bIsActive) ? 1
        : bIsActive && !bIsParticipating ? 2
        : 3;

      if (aPriority !== bPriority) return aPriority - bPriority;

      // Within same priority, sort by selected criteria
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
  }, [allTournaments, filterType, searchQuery, sortBy, user?.id]);

  // Past tab: completed/cancelled tournaments
  const pastTournaments = useMemo(() => {
    return (archivedTournaments?.data || []).filter((t: any) =>
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [archivedTournaments, filterType, searchQuery]);

  // History tab: user's personal participation history (same data, different perspective)
  const historyTournaments = pastTournaments;

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #080C14, #0F172A)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#F1F5F9' }}>Please Log In</h2>
          <p style={{ color: '#94A3B8' }}>You need to be logged in to view tournaments.</p>
        </div>
      </div>
    );
  }

  const getTabCount = () => {
    switch (activeTab) {
      case 'active': return activeTournaments.length;
      case 'past': return pastTournaments.length;
      case 'history': return historyTournaments.length;
      default: return 0;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto" style={{ background: 'linear-gradient(to bottom, #080C14, #0F172A)' }}>
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
                <Trophy style={{ width: 'clamp(28px, 3vw, 48px)', height: 'clamp(28px, 3vw, 48px)', color: '#E3B341' }} />
                <h1 className="font-black" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.75rem)', color: '#F1F5F9' }}>
                  Tournaments
                </h1>
              </div>
            </div>
            <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 16px)' }}>
              <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-lg border-0" style={{
                    height: 'clamp(32px, 2.5vh, 40px)',
                    padding: '0 clamp(12px, 1.5vw, 20px)',
                    fontSize: 'clamp(0.75rem, 1vw, 1rem)',
                    backgroundColor: '#1F2937',
                    color: '#F1F5F9',
                  }}>
                    <Lock style={{ width: 'clamp(12px, 1.2vw, 20px)', height: 'clamp(12px, 1.2vw, 20px)', marginRight: '8px' }} />
                    Join Private
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: '#F1F5F9' }}>Join Private Tournament</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="join-code" style={{ color: '#F1F5F9' }}>Tournament Code</Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter 8-character code"
                        maxLength={8}
                        style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
                      />
                    </div>
                    <Button
                      onClick={() => joinByCodeMutation.mutate(joinCode)}
                      disabled={joinCode.length !== 8 || joinByCodeMutation.isPending}
                      className="w-full border-0"
                      style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }}
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
                height: 'clamp(32px, 2.5vh, 40px)',
                padding: '0 clamp(12px, 1.5vw, 20px)',
                fontSize: 'clamp(0.75rem, 1vw, 1rem)',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#FFFFFF'
              }}>
                <Plus style={{ width: 'clamp(12px, 1.2vw, 20px)', height: 'clamp(12px, 1.2vw, 20px)', marginRight: '8px' }} />
                Create Tournament
              </Button>
            </div>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tournaments..."
                  className="pl-9 w-64"
                  style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40" style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stocks">Stocks Only</SelectItem>
                  <SelectItem value="crypto">Crypto Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                <SelectItem value="starting-soon">Starting Soonest</SelectItem>
                <SelectItem value="pot-high-low">Highest Pot</SelectItem>
                <SelectItem value="pot-low-high">Lowest Pot</SelectItem>
                <SelectItem value="most-recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ backgroundColor: '#111827' }}>
              <button
                onClick={() => setActiveTab('active')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300"
                style={activeTab === 'active'
                  ? { background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#94A3B8' }
                }
              >
                <Trophy className="w-4 h-4" />
                <span>Active</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: activeTab === 'active' ? 'rgba(255,255,255,0.2)' : '#1F2937',
                  color: activeTab === 'active' ? '#FFFFFF' : '#94A3B8',
                }}>
                  {activeTournaments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300"
                style={activeTab === 'past'
                  ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#94A3B8' }
                }
              >
                <Eye className="w-4 h-4" />
                <span>Past</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: activeTab === 'past' ? 'rgba(255,255,255,0.2)' : '#1F2937',
                  color: activeTab === 'past' ? '#FFFFFF' : '#94A3B8',
                }}>
                  {pastTournaments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300"
                style={activeTab === 'history'
                  ? { background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#94A3B8' }
                }
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'active' && (
                <TournamentList
                  tournaments={activeTournaments}
                  type="active"
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
              {activeTab === 'past' && (
                <TournamentList
                  tournaments={pastTournaments}
                  type="past"
                  onManage={() => {}}
                  onJoinTournament={() => {}}
                  onViewLeaderboard={(tournament) => {
                    setSelectedLeaderboardTournament(tournament);
                    setLeaderboardDialogOpen(true);
                  }}
                  isJoining={false}
                />
              )}
              {activeTab === 'history' && (
                <TournamentList
                  tournaments={historyTournaments}
                  type="history"
                  onManage={() => {}}
                  onJoinTournament={() => {}}
                  onViewLeaderboard={(tournament) => {
                    setSelectedLeaderboardTournament(tournament);
                    setLeaderboardDialogOpen(true);
                  }}
                  isJoining={false}
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
      <Dialog open={joinConfirmationOpen} onOpenChange={setJoinConfirmationOpen}>
        <DialogContent className="sm:max-w-[500px]" style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2" style={{ color: '#F1F5F9' }}>
              <Trophy className="w-5 h-5" style={{ color: '#E3B341' }} />
              <span>Join Tournament</span>
            </DialogTitle>
          </DialogHeader>

          {tournamentToJoin && (
            <div className="space-y-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#111827' }}>
                <h3 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>{tournamentToJoin.name}</h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  {tournamentToJoin.tournamentType === "crypto" ? "Cryptocurrency" : "Stock Market"} Tournament
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Players:</span>
                    <span style={{ color: '#F1F5F9' }}>{tournamentToJoin.currentPlayers}/{tournamentToJoin.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Duration:</span>
                    <span style={{ color: '#F1F5F9' }}>{tournamentToJoin.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Starting Balance:</span>
                    <span style={{ color: '#F1F5F9' }}>{formatCurrency(tournamentToJoin.startingBalance)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Status:</span>
                    <Badge style={{
                      backgroundColor: tournamentToJoin.isPublic ? '#1F2937' : '#1F2937',
                      color: tournamentToJoin.isPublic ? '#10B981' : '#8B5CF6',
                    }}>
                      {tournamentToJoin.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Buy-in:</span>
                    <span className="font-medium" style={{ color: '#F1F5F9' }}>
                      {tournamentToJoin.buyInAmount > 0 ? formatCurrency(tournamentToJoin.buyInAmount) : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Jackpot:</span>
                    <span className="font-bold" style={{ color: '#E3B341' }}>
                      {formatCurrency(tournamentToJoin.currentPot || (tournamentToJoin.buyInAmount * tournamentToJoin.currentPlayers))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
                <h4 className="font-medium mb-2" style={{ color: '#06B6D4' }}>Tournament Rules</h4>
                <ul className="text-sm space-y-1" style={{ color: '#94A3B8' }}>
                  {tournamentToJoin.isPublic ? (
                    <>
                      <li>Public tournaments cannot be cancelled early</li>
                      <li>Tournament will run for the full duration</li>
                    </>
                  ) : (
                    <>
                      <li>Private tournaments can be cancelled by the creator</li>
                      <li>Creator has full control over tournament settings</li>
                    </>
                  )}
                  <li>Virtual trading only - no real money at risk</li>
                  <li>Rankings based on portfolio performance</li>
                </ul>
              </div>

              {tournamentToJoin.buyInAmount > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <h4 className="font-medium mb-2" style={{ color: '#F59E0B' }}>Entry Fee Required</h4>
                  <p className="text-sm" style={{ color: '#FCD34D' }}>
                    This tournament requires a buy-in of <strong>{formatCurrency(tournamentToJoin.buyInAmount)}</strong>.
                    This fee contributes to the tournament jackpot.
                  </p>
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 rounded-lg" style={{ border: '1px solid #1F2937' }}>
                <Checkbox
                  id="tournament-agreement"
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                />
                <div>
                  <label htmlFor="tournament-agreement" className="text-sm font-medium cursor-pointer" style={{ color: '#F1F5F9' }}>
                    I agree to the tournament terms and conditions
                  </label>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    By joining, you agree to participate fairly and follow tournament rules.
                    {tournamentToJoin.buyInAmount > 0 && " Entry fee will be charged upon confirmation."}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 border-0"
                  onClick={() => {
                    setJoinConfirmationOpen(false);
                    setTournamentToJoin(null);
                    setAgreementChecked(false);
                  }}
                  style={{ backgroundColor: '#1F2937', color: '#F1F5F9' }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 border-0"
                  onClick={confirmJoinTournament}
                  disabled={!agreementChecked || joinTournamentMutation.isPending}
                  style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }}
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
  type: "active" | "past" | "history";
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
          {type === "active" ? "No active tournaments" : type === "past" ? "No past tournaments" : "No tournament history"}
        </h3>
        <p style={{ color: '#94A3B8' }}>
          {type === "active"
            ? "No tournaments are currently running. Create your own!"
            : type === "past"
            ? "No completed tournaments found."
            : "You haven't participated in any tournaments yet."
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
  type: "active" | "past" | "history";
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
    if (type === "past" || type === "history") {
      return (
        <Button
          onClick={onViewLeaderboard}
          className="border-0 whitespace-nowrap"
          size="sm"
          style={{ backgroundColor: '#1F2937', color: '#F1F5F9' }}
        >
          <Trophy className="w-3.5 h-3.5 mr-1.5" />
          Results
        </Button>
      );
    }

    if (isLive) {
      return (
        <Button
          onClick={onViewLeaderboard}
          className="border-0 whitespace-nowrap"
          size="sm"
          style={{ backgroundColor: '#1F2937', color: '#F59E0B' }}
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
            className="border-0 whitespace-nowrap"
            size="sm"
            style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Start
          </Button>
          <Button
            onClick={onManage}
            className="border-0 whitespace-nowrap"
            size="sm"
            style={{ backgroundColor: '#1F2937', color: '#F1F5F9' }}
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
          className="border-0 whitespace-nowrap"
          size="sm"
          style={!(isJoining || tournament.currentPlayers >= tournament.maxPlayers)
            ? { background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }
            : { backgroundColor: '#1F2937', color: '#94A3B8' }
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
          backgroundColor: '#111827',
          border: `1px solid ${isLive ? 'rgba(245, 158, 11, 0.3)' : '#1F2937'}`,
        }}
      >
        {/* Left: Icon + Name + Badges + Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{
              backgroundColor: isLive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            }}>
              <TournamentTypeIcon className="w-3.5 h-3.5" style={{ color: isLive ? '#F59E0B' : '#10B981' }} />
            </div>
            <span className="font-bold text-sm truncate" style={{ color: '#F1F5F9' }}>
              {tournament.name}
            </span>
            {isHighPot && <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#E3B341' }} />}
            {isLive && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>LIVE</span>
              </div>
            )}
            {!tournament.isPublic && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                <Lock className="w-2.5 h-2.5" style={{ color: '#8B5CF6' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#8B5CF6' }}>Private</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
            <span>{tournament.tournamentType === "crypto" ? "Crypto" : "Stocks"}</span>
            {getTimeRemaining() && (
              <>
                <span>|</span>
                <span style={{ color: isLive ? '#F59E0B' : '#10B981' }}>{getTimeRemaining()}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Stats columns */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Jackpot</div>
            <div className="text-sm font-bold" style={{ color: '#E3B341' }}>{formatCurrency(currentPot)}</div>
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
