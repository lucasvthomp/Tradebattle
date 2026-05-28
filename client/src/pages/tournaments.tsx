import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation as useRouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { motion, AnimatePresence } from "framer-motion";
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
          <AvatarFallback
            className="text-[9px] font-semibold"
            style={{ backgroundColor: '#081729', color: '#00A3FF', border: '2px solid #0A1F3D' }}
          >
            {p.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: '#081729', color: '#00A3FF', border: '2px solid #0A1F3D' }}
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
      if (typeof tournamentIdOrCode === 'string') {
        const res = await apiRequest("POST", `/api/tournaments/code/${tournamentIdOrCode}/join`, {});
        return res.json();
      }
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
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#00A3FF', filter: 'drop-shadow(0 0 12px rgba(0,163,255,0.4))' }} />
          <h2 className="text-xl font-black mb-2" style={{ color: '#C9D1E2', letterSpacing: '-0.02em' }}>Please Log In</h2>
          <p style={{ color: '#4B6080' }}>You need to be logged in to view tournaments.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-auto"
      style={{
        background: 'transparent',
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8" style={{ padding: 'clamp(16px, 3vh, 40px) clamp(16px, 2vw, 32px)' }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(0,163,255,0.08)',
                marginBottom: '20px',
                paddingBottom: '20px',
              }}
            >
              {/* Scanline texture strip */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
                  background: 'linear-gradient(180deg, rgba(0,163,255,0.04) 0%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                  <div className="flex items-center mb-1" style={{ gap: 'clamp(10px, 1.2vw, 18px)' }}>
                    {/* Trophy icon in glowing container */}
                    <div style={{
                      width: 'clamp(40px, 4vw, 60px)',
                      height: 'clamp(40px, 4vw, 60px)',
                      borderRadius: '14px',
                      background: 'rgba(0,163,255,0.1)',
                      border: '1px solid rgba(0,163,255,0.25)',
                      boxShadow: '0 0 20px rgba(0,163,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Trophy style={{
                        width: 'clamp(20px, 2vw, 30px)',
                        height: 'clamp(20px, 2vw, 30px)',
                        color: '#00A3FF',
                        filter: 'drop-shadow(0 0 8px rgba(0,163,255,0.6))',
                      }} />
                    </div>
                    <h1
                      style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        color: '#FFFFFF',
                        letterSpacing: '-0.03em',
                        fontWeight: 900,
                        textShadow: '0 0 32px rgba(0,163,255,0.4), 0 0 64px rgba(0,163,255,0.15)',
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      Tournaments
                    </h1>
                  </div>
                  <p style={{
                    color: '#4B6080',
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginLeft: 'calc(clamp(40px,4vw,60px) + clamp(10px,1.2vw,18px))',
                  }}>
                    Compete &amp; Win
                  </p>
                </div>

                <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
                  {/* Join Private Button */}
                  <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        style={{
                          height: 'clamp(40px, 2.5vh, 46px)',
                          padding: '0 clamp(12px, 1.5vw, 20px)',
                          fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)',
                          background: 'rgba(0,163,255,0.08)',
                          border: '1px solid rgba(0,163,255,0.2)',
                          borderRadius: '10px',
                          color: '#8A93A6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,163,255,0.14)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,163,255,0.35)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#00A3FF';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,163,255,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,163,255,0.2)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#8A93A6';
                        }}
                      >
                        <Lock style={{ width: 'clamp(13px, 1.1vw, 16px)', height: 'clamp(13px, 1.1vw, 16px)' }} />
                        Join Private
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-[95vw] md:max-w-md"
                      style={{
                        background: '#0A1F3D',
                        border: '1px solid rgba(0,163,255,0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 0 40px rgba(0,163,255,0.08)',
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle style={{ color: '#C9D1E2', fontWeight: 800, letterSpacing: '-0.02em' }}>Join Private Tournament</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="join-code"
                            className="text-base md:text-sm"
                            style={{ color: '#8A93A6', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
                          >
                            Tournament Code
                          </Label>
                          <Input
                            id="join-code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter 8-character code"
                            maxLength={8}
                            className="text-base md:text-sm min-h-[44px] mt-1.5"
                            style={{
                              background: 'rgba(0,163,255,0.06)',
                              border: '1px solid rgba(0,163,255,0.15)',
                              borderRadius: '10px',
                              color: '#C9D1E2',
                              letterSpacing: '0.1em',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => joinByCodeMutation.mutate(joinCode)}
                          disabled={joinCode.length !== 8 || joinByCodeMutation.isPending}
                          className="w-full min-h-[44px] text-base md:text-sm"
                          style={{
                            background: joinCode.length === 8 && !joinByCodeMutation.isPending
                              ? 'linear-gradient(135deg, #00A3FF, #0077CC)'
                              : 'rgba(0,163,255,0.06)',
                            border: '1px solid rgba(0,163,255,0.2)',
                            borderRadius: '10px',
                            color: joinCode.length === 8 && !joinByCodeMutation.isPending ? '#FFFFFF' : '#4B6080',
                            fontWeight: 900,
                            cursor: joinCode.length === 8 && !joinByCodeMutation.isPending ? 'pointer' : 'not-allowed',
                            boxShadow: joinCode.length === 8 && !joinByCodeMutation.isPending ? '0 0 16px rgba(0,163,255,0.3)' : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          {joinByCodeMutation.isPending ? "Joining..." : "Join Tournament"}
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Create Tournament */}
                  <TournamentCreationDialog
                    isOpen={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                  />
                  <button
                    onClick={() => setCreateDialogOpen(true)}
                    style={{
                      height: 'clamp(40px, 2.5vh, 46px)',
                      padding: '0 clamp(12px, 1.5vw, 20px)',
                      fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)',
                      background: 'linear-gradient(135deg, #00A3FF, #0077CC)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: 900,
                      boxShadow: '0 0 20px rgba(0,163,255,0.3)',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(0,163,255,0.5)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,163,255,0.3)';
                    }}
                  >
                    <Plus style={{ width: 'clamp(14px, 1.2vw, 18px)', height: 'clamp(14px, 1.2vw, 18px)' }} />
                    Create Tournament
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#4B6080' }} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tournaments..."
                  className="pl-9 w-full sm:w-64"
                  style={{
                    background: 'rgba(0,163,255,0.06)',
                    border: '1px solid rgba(0,163,255,0.12)',
                    borderRadius: '12px',
                    color: '#C9D1E2',
                  }}
                />
              </div>
              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  style={{
                    background: '#0A1F3D',
                    borderColor: 'rgba(0,163,255,0.15)',
                    borderRadius: '12px',
                    color: '#C9D1E2',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0A1F3D', borderColor: 'rgba(0,163,255,0.2)', borderRadius: '12px' }}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stocks">Stocks Only</SelectItem>
                  <SelectItem value="crypto">Crypto Only</SelectItem>
                </SelectContent>
              </Select>
              {/* Checkboxes */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="my-tournaments"
                    checked={showMyTournaments}
                    onCheckedChange={(checked) => setShowMyTournaments(checked === true)}
                  />
                  <label htmlFor="my-tournaments" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#8A93A6' }}>
                    My Tournaments
                  </label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="joinable"
                    checked={showJoinable}
                    onCheckedChange={(checked) => setShowJoinable(checked === true)}
                  />
                  <label htmlFor="joinable" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#8A93A6' }}>
                    Joinable
                  </label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="with-friends"
                    checked={showWithFriends}
                    onCheckedChange={(checked) => setShowWithFriends(checked === true)}
                  />
                  <label htmlFor="with-friends" className="text-sm cursor-pointer whitespace-nowrap" style={{ color: '#8A93A6' }}>
                    With Friends
                  </label>
                </div>
              </div>
            </div>
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="w-full sm:w-48"
                style={{
                  background: '#0A1F3D',
                  borderColor: 'rgba(0,163,255,0.15)',
                  borderRadius: '12px',
                  color: '#C9D1E2',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#0A1F3D', borderColor: 'rgba(0,163,255,0.2)', borderRadius: '12px' }}>
                <SelectItem value="starting-soon">Starting Soonest</SelectItem>
                <SelectItem value="pot-high-low">Highest Pot</SelectItem>
                <SelectItem value="pot-low-high">Lowest Pot</SelectItem>
                <SelectItem value="most-recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp}>
            <div
              className="flex items-center gap-1.5"
              style={{
                background: 'rgba(0,163,255,0.04)',
                border: '1px solid rgba(0,163,255,0.08)',
                borderRadius: '14px',
                padding: '4px',
              }}
            >
              {/* Upcoming Tab */}
              <button
                onClick={() => setActiveTab('upcoming')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 transition-all duration-300"
                style={activeTab === 'upcoming' ? {
                  background: 'linear-gradient(135deg, rgba(0,163,255,0.2), rgba(0,163,255,0.08))',
                  border: '1px solid rgba(0,163,255,0.35)',
                  color: '#00A3FF',
                  boxShadow: '0 0 14px rgba(0,163,255,0.2)',
                  fontWeight: 900,
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#4B5975',
                  fontWeight: 600,
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <Trophy className="w-4 h-4" />
                <span>Upcoming</span>
                <span
                  style={activeTab === 'upcoming' ? {
                    background: 'rgba(0,163,255,0.15)',
                    color: '#00A3FF',
                    borderRadius: '20px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: '#4B5975',
                    borderRadius: '20px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                  }}
                >
                  {upcomingTournaments.length}
                </span>
              </button>

              {/* Live Tab */}
              <button
                onClick={() => setActiveTab('live')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 transition-all duration-300"
                style={activeTab === 'live' ? {
                  background: 'linear-gradient(135deg, rgba(0,255,135,0.18), rgba(0,255,135,0.06))',
                  border: '1px solid rgba(0,255,135,0.3)',
                  color: '#00FF87',
                  boxShadow: '0 0 14px rgba(0,255,135,0.2)',
                  fontWeight: 900,
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#4B5975',
                  fontWeight: 600,
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {activeTab === 'live' ? (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00FF87', flexShrink: 0 }} />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Live</span>
                <span
                  style={activeTab === 'live' ? {
                    background: 'rgba(0,255,135,0.15)',
                    color: '#00FF87',
                    borderRadius: '20px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: '#4B5975',
                    borderRadius: '20px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                  }}
                >
                  {liveTournaments.length}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-5">
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
      <div
        className="text-center"
        style={{
          background: 'linear-gradient(135deg, #0A1F3D, #081729)',
          border: '1px solid rgba(0,163,255,0.12)',
          borderRadius: '20px',
          padding: '48px 24px',
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(0,163,255,0.08)',
          border: '1px solid rgba(0,163,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 24px rgba(0,163,255,0.1)',
        }}>
          <Trophy className="w-8 h-8" style={{ color: '#00A3FF', opacity: 0.5, filter: 'drop-shadow(0 0 6px rgba(0,163,255,0.3))' }} />
        </div>
        <h3 style={{ color: '#C9D1E2', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.125rem', marginBottom: '8px' }}>
          {type === "upcoming" ? "No upcoming tournaments" : "No live tournaments"}
        </h3>
        <p style={{ color: '#4B6080', fontSize: '0.875rem' }}>
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
  const [, navigate] = useRouterLocation();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [isHovered, setIsHovered] = React.useState(false);

  const isLive = tournament.status === "active";
  const isWaiting = tournament.status === "waiting";
  const isCreator = tournament.creatorId === user?.id;
  const isParticipant = isCreator || (Array.isArray(tournament.participantUserIds) && tournament.participantUserIds.includes(user?.id));
  const canOpenDashboard = isLive && isParticipant;
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

  const getCardBorderStyle = () => {
    if (isLive) {
      return isHovered
        ? { border: '1px solid rgba(0,255,135,0.45)', boxShadow: '0 0 32px rgba(0,255,135,0.15)' }
        : { border: '1px solid rgba(0,255,135,0.25)', boxShadow: '0 0 24px rgba(0,255,135,0.08)' };
    }
    return isHovered
      ? { border: '1px solid rgba(0,163,255,0.35)', boxShadow: '0 0 28px rgba(0,163,255,0.12)' }
      : { border: '1px solid rgba(0,163,255,0.15)', boxShadow: '0 0 20px rgba(0,163,255,0.06)' };
  };

  const getActionButton = () => {
    if (isLive) {
      return (
        <button
          onClick={onViewLeaderboard}
          className="whitespace-nowrap"
          style={{
            padding: '8px 14px',
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.25)',
            borderRadius: '10px',
            color: '#00FF87',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            minHeight: '40px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,135,0.15)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,255,135,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,135,0.08)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </button>
      );
    }

    if (isCreator && isWaiting) {
      return (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await apiRequest("POST", `/api/tournaments/${tournament.id}/start-early`);
                window.location.reload();
              } catch (error: any) {
                console.error("Failed to start tournament:", error);
              }
            }}
            className="whitespace-nowrap"
            style={{
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #00FF87, #00C853)',
              border: 'none',
              borderRadius: '10px',
              color: '#041810',
              fontSize: '0.8rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '40px',
              boxShadow: '0 0 14px rgba(0,255,135,0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </button>
          <button
            onClick={onManage}
            className="whitespace-nowrap"
            style={{
              padding: '8px 14px',
              background: 'rgba(0,163,255,0.08)',
              border: '1px solid rgba(0,163,255,0.2)',
              borderRadius: '10px',
              color: '#8A93A6',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '40px',
              transition: 'all 0.2s',
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            Manage
          </button>
        </div>
      );
    }

    if (isWaiting) {
      const isFull = tournament.currentPlayers >= tournament.maxPlayers;
      return (
        <button
          onClick={onJoin}
          disabled={isJoining || isFull}
          className="whitespace-nowrap"
          style={!(isJoining || isFull) ? {
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #00A3FF, #0066CC)',
            border: 'none',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            minHeight: '40px',
            boxShadow: '0 0 16px rgba(0,163,255,0.3)',
            transition: 'all 0.2s',
          } : {
            padding: '8px 18px',
            background: 'rgba(75,96,128,0.1)',
            border: '1px solid rgba(75,96,128,0.2)',
            borderRadius: '10px',
            color: '#4B6080',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            cursor: 'not-allowed',
            minHeight: '40px',
          }}
          onMouseEnter={e => {
            if (!(isJoining || isFull)) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 22px rgba(0,163,255,0.45)';
            }
          }}
          onMouseLeave={e => {
            if (!(isJoining || isFull)) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(0,163,255,0.3)';
            }
          }}
        >
          {isJoining ? "Joining..." :
           isFull ? "Full" :
           tournament.buyInAmount > 0 ? `Join — ${formatCurrency(tournament.buyInAmount)}` : "Join Free"
          }
        </button>
      );
    }

    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex items-center gap-4 p-4 transition-all duration-200"
        onClick={canOpenDashboard ? () => navigate(`/dashboard?tournament=${tournament.id}`) : undefined}
        role={canOpenDashboard ? "button" : undefined}
        title={canOpenDashboard ? "Open trading dashboard" : undefined}
        style={{
          background: 'linear-gradient(135deg, #0A1F3D 0%, #081729 100%)',
          borderRadius: '20px',
          cursor: canOpenDashboard ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          ...getCardBorderStyle(),
        }}
      >
        {/* Scanline texture overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: '20px',
          }}
        />

        {/* Left: Icon + Name + Badges + Time */}
        <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-2 mb-1.5">
            {/* Type icon chip */}
            <div style={{
              padding: '5px',
              borderRadius: '8px',
              background: 'rgba(0,163,255,0.1)',
              border: '1px solid rgba(0,163,255,0.2)',
              flexShrink: 0,
            }}>
              <TournamentTypeIcon className="w-3.5 h-3.5" style={{ color: '#00A3FF' }} />
            </div>

            {/* Name */}
            <span className="font-extrabold text-sm truncate" style={{ color: '#C9D1E2', fontWeight: 800 }}>
              {tournament.name}
            </span>

            {/* High pot crown */}
            {isHighPot && (
              <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E3B341', filter: 'drop-shadow(0 0 5px rgba(227,179,65,0.4))' }} />
            )}

            {/* LIVE badge */}
            {isLive && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(0,255,135,0.1)',
                  border: '1px solid rgba(0,255,135,0.3)',
                  boxShadow: '0 0 8px rgba(0,255,135,0.1)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87' }} />
                <span className="text-[10px] font-bold" style={{ color: '#00FF87' }}>LIVE</span>
              </div>
            )}

            {/* Private badge */}
            {!tournament.isPublic && (
              <div
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(148,163,184,0.1)',
                  border: '1px solid rgba(148,163,184,0.2)',
                }}
              >
                <Lock className="w-2.5 h-2.5" style={{ color: '#8A93A6' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#8A93A6' }}>Private</span>
              </div>
            )}
          </div>

          {/* Subline: type + time */}
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: '#4B6080', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
              {tournament.tournamentType === "crypto" ? "Crypto" : "Stocks"}
            </span>
            {getTimeRemaining() && (
              <>
                <span style={{ color: 'rgba(75,96,128,0.5)' }}>|</span>
                <span style={{
                  color: isLive ? '#00FF87' : '#E3B341',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}>
                  {getTimeRemaining()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Stats columns */}
        <div className="hidden md:flex items-center gap-5" style={{ position: 'relative', zIndex: 1 }}>
          {/* Jackpot stat chip */}
          <div className="text-center">
            <div
              style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#4B6080',
                marginBottom: '3px',
                fontWeight: 600,
              }}
            >
              Jackpot
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: '#E3B341',
                textShadow: '0 0 12px rgba(227,179,65,0.4)',
              }}
            >
              {formatCurrency(currentPot)}
            </div>
          </div>

          {/* Buy-in stat chip */}
          <div className="text-center">
            <div
              style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#4B6080',
                marginBottom: '3px',
                fontWeight: 600,
              }}
            >
              Buy-in
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#C9D1E2' }}>
              {tournament.buyInAmount > 0 ? formatCurrency(tournament.buyInAmount) : "Free"}
            </div>
          </div>

          {/* Players stat chip */}
          <div className="text-center">
            <div
              style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#4B6080',
                marginBottom: '3px',
                fontWeight: 600,
              }}
            >
              Players
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#C9D1E2' }}>
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </div>
          </div>
        </div>

        {/* Right: Avatar stack + Action */}
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
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
