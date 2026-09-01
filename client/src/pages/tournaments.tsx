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
  BarChart3,
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
  ShieldCheck,
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
            style={{ backgroundColor: '#081622', color: '#67E7BF', border: '2px solid #0A1C2C' }}
          >
            {p.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: '#081622', color: '#67E7BF', border: '2px solid #0A1C2C' }}
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
    refetchInterval: 10000,
  });

  // Fetch user's tournaments
  const { data: userTournaments, isLoading: userLoading } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments'],
    refetchInterval: 10000,
  });

  // Fetch archived tournaments (disabled — not shown in this layout)
  const { data: archivedTournaments } = useQuery<{data: any[]}>({
    queryKey: ['/api/tournaments/archived'],
    enabled: false,
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
              title: "Already in the arena",
              description: `You’re already on the ${tournament.name} board`,
            });
          } else {
            setTournamentToJoin(tournament);
            setJoinConfirmationOpen(true);
          }
          navigate('/tournaments', { replace: true });
        })
        .catch(error => {
          toast({
            title: "Arena not found",
            description: error.message || "That entry code didn’t match an arena",
            variant: "destructive"
          });
          navigate('/tournaments', { replace: true });
        });
    }
  }, [location, navigate, toast]);

  useEffect(() => {
    if (joinConfirmationOpen) {
      setJoinConfirmationOpen(false);
      setTournamentToJoin(null);
    }
  }, [location]);

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
      toast({ title: "Locked in", description: "You’re in — good luck on the board!" });
    },
    onError: (error: Error) => {
      toast({ title: "Couldn’t complete that move", description: error.message, variant: "destructive" });
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
      toast({ title: "Locked in", description: "You’re in — good luck on the board!" });
    },
    onError: (error: Error) => {
      toast({ title: "Couldn’t complete that move", description: error.message, variant: "destructive" });
    },
  });

  const handleJoinTournament = (tournament: any) => {
    if (joinTournamentMutation.isPending) return;
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

  // Apply base text/type/checkbox filters
  const applyBaseFilters = (tournaments: any[]) => {
    let filtered = tournaments.filter((t: any) =>
      (filterType === "all" || t.tournamentType === filterType) &&
      (searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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

  // Sort helper within a group
  const applySortBy = (tournaments: any[]) => {
    return [...tournaments].sort((a, b) => {
      switch (sortBy) {
        case "starting-soon":
          return new Date(a.scheduledStartTime || a.startedAt || a.createdAt).getTime() -
                 new Date(b.scheduledStartTime || b.startedAt || b.createdAt).getTime();
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

  // Build the three priority groups
  const { myActiveTournaments, otherLiveTournaments, upcomingTournaments } = useMemo(() => {
    const filtered = applyBaseFilters(allTournaments);

    const active = filtered.filter((t: any) => t.status === "active");
    const waiting = filtered.filter((t: any) => t.status === "waiting");

    const myActive = active.filter((t: any) =>
      t.creatorId === user?.id || t.participantUserIds?.includes(user?.id)
    );
    const otherLive = active.filter((t: any) =>
      t.creatorId !== user?.id && !t.participantUserIds?.includes(user?.id)
    );

    return {
      myActiveTournaments: applySortBy(myActive),
      otherLiveTournaments: applySortBy(otherLive),
      upcomingTournaments: applySortBy(waiting),
    };
  }, [allTournaments, filterType, searchQuery, sortBy, user?.id, showMyTournaments, showJoinable, showWithFriends, friendIds]);

  const totalCount = myActiveTournaments.length + otherLiveTournaments.length + upcomingTournaments.length;

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: '#67E7BF', filter: 'drop-shadow(0 0 12px rgba(0,163,255,0.4))' }} />
          <h2 className="text-xl font-black mb-2" style={{ color: '#C9D1E2', letterSpacing: '-0.02em' }}>Enter the arena</h2>
          <p style={{ color: '#4B6080' }}>Sign in to see open arenas.</p>
        </div>
      </div>
    );
  }

  const sharedListProps = {
    onManage: (tournament: any) => {
      setSelectedTournament(tournament);
      setManagementDialogOpen(true);
    },
    onJoinTournament: handleJoinTournament,
    onViewLeaderboard: (tournament: any) => {
      setSelectedLeaderboardTournament(tournament);
      setLeaderboardDialogOpen(true);
    },
    isJoining: joinTournamentMutation.isPending,
  };

  return (
    <div
      className="arena-page-shell tournaments-page min-h-[calc(100dvh-4rem)]"
      style={{ background: 'transparent' }}
    >
      <div className="container mx-auto px-4 lg:px-8" style={{ padding: 'clamp(16px, 3vh, 40px) clamp(16px, 2vw, 32px)' }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6"
        >
          <motion.div variants={fadeInUp} className="tournament-hero-strip">
            <div className="tournament-hero-copy">
              <p className="tournament-hero-kicker"><span className="tournament-live-dot" /> THE ARENA LOBBY</p>
              <h2>Choose your board.</h2>
              <p>Find a live field, lock in a matchup, and make your next clean read.</p>
              <div className="tournament-hero-stats" aria-label="Arena summary">
                <span><strong>{myActiveTournaments.length}</strong> Your live</span>
                <span><strong>{otherLiveTournaments.length}</strong> On now</span>
                <span><strong>{upcomingTournaments.length}</strong> Next up</span>
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeInUp}>
            <div
              className="tournament-lobby-header"
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(0,163,255,0.08)',
                marginBottom: '20px',
                paddingBottom: '20px',
              }}
            >
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
                      <BarChart3 style={{
                        width: 'clamp(20px, 2vw, 30px)',
                        height: 'clamp(20px, 2vw, 30px)',
                        color: '#67E7BF',
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
                      Arenas
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
                          (e.currentTarget as HTMLButtonElement).style.color = '#67E7BF';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,163,255,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,163,255,0.2)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#8A93A6';
                        }}
                      >
                        <Lock style={{ width: 'clamp(13px, 1.1vw, 16px)', height: 'clamp(13px, 1.1vw, 16px)' }} />
                        Enter by code
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      className="tournament-join-dialog max-w-[95vw] md:max-w-md"
                      style={{
                        background: '#0A1C2C',
                        border: '1px solid rgba(0,163,255,0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 0 40px rgba(0,163,255,0.08)',
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle style={{ color: '#C9D1E2', fontWeight: 800, letterSpacing: '-0.02em' }}>Enter a private arena</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="join-code"
                            className="text-base md:text-sm"
                            style={{ color: '#8A93A6', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
                          >
                            Arena code
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
                              ? 'linear-gradient(135deg, #67E7BF, #2EBF9A)'
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
                          {joinByCodeMutation.isPending ? "Joining the board..." : "Enter arena"}
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
                      background: 'linear-gradient(135deg, #67E7BF, #2EBF9A)',
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
                    Open arena
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
                  placeholder="Scout arenas..."
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
                    background: '#0A1C2C',
                    borderColor: 'rgba(0,163,255,0.15)',
                    borderRadius: '12px',
                    color: '#C9D1E2',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0A1C2C', borderColor: 'rgba(0,163,255,0.2)', borderRadius: '12px' }}>
                  <SelectItem value="all">All arenas</SelectItem>
                  <SelectItem value="stocks">Stock arenas</SelectItem>
                  <SelectItem value="crypto">Crypto arenas</SelectItem>
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
                    My arenas
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
                  background: '#0A1C2C',
                  borderColor: 'rgba(0,163,255,0.15)',
                  borderRadius: '12px',
                  color: '#C9D1E2',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#0A1C2C', borderColor: 'rgba(0,163,255,0.2)', borderRadius: '12px' }}>
                <SelectItem value="starting-soon">Opening soon</SelectItem>
                <SelectItem value="pot-high-low">Biggest prize pool</SelectItem>
                <SelectItem value="pot-low-high">Smallest prize pool</SelectItem>
                <SelectItem value="most-recent">Newest arenas</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Unified Tournament List */}
          <motion.div variants={fadeInUp}>
            <div className="mt-2">
              {totalCount === 0 ? (
                <div
                  className="text-center"
                  style={{
                    background: 'linear-gradient(135deg, #0A1C2C, #081622)',
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
                    <BarChart3 className="w-8 h-8" style={{ color: '#67E7BF', opacity: 0.5, filter: 'drop-shadow(0 0 6px rgba(0,163,255,0.3))' }} />
                  </div>
                  <h3 style={{ color: '#C9D1E2', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.125rem', marginBottom: '8px' }}>
                    No arenas on the board
                  </h3>
                  <p style={{ color: '#4B6080', fontSize: '0.875rem' }}>
                    Change the filters or open your own arena.
                  </p>
                </div>
              ) : (
                <motion.div
                  className="flex flex-col gap-3"
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                >
                  <AnimatePresence mode="popLayout">
                    {/* Priority 1: Your Active Tournaments */}
                    {myActiveTournaments.length > 0 && (
                      <>
                        <SectionDivider label="YOUR LIVE ARENAS" color="#67E7BF" />
                        {myActiveTournaments.map((tournament, index) => (
                          <HorizontalTournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            index={index}
                            type="live"
                            onJoin={() => handleJoinTournament(tournament)}
                            isJoining={joinTournamentMutation.isPending}
                            onManage={() => sharedListProps.onManage(tournament)}
                            onViewLeaderboard={() => sharedListProps.onViewLeaderboard(tournament)}
                          />
                        ))}
                      </>
                    )}

                    {/* Priority 2: Other Live Tournaments */}
                    {otherLiveTournaments.length > 0 && (
                      <>
                        <SectionDivider label="LIVE ON THE BOARD" color="#67E7BF" />
                        {otherLiveTournaments.map((tournament, index) => (
                          <HorizontalTournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            index={index}
                            type="live"
                            onJoin={() => handleJoinTournament(tournament)}
                            isJoining={joinTournamentMutation.isPending}
                            onManage={() => sharedListProps.onManage(tournament)}
                            onViewLeaderboard={() => sharedListProps.onViewLeaderboard(tournament)}
                          />
                        ))}
                      </>
                    )}

                    {/* Priority 3: Upcoming Tournaments */}
                    {upcomingTournaments.length > 0 && (
                      <>
                        <SectionDivider label="NEXT UP" color="#8A93A6" />
                        {upcomingTournaments.map((tournament, index) => (
                          <HorizontalTournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            index={index}
                            type="upcoming"
                            onJoin={() => handleJoinTournament(tournament)}
                            isJoining={joinTournamentMutation.isPending}
                            onManage={() => sharedListProps.onManage(tournament)}
                            onViewLeaderboard={() => sharedListProps.onViewLeaderboard(tournament)}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
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

// Section divider with label
function SectionDivider({ label, color }: { label: string; color: string }) {
  return (
    <motion.div
      variants={cardVariants}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingTop: '8px',
        paddingBottom: '2px',
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: '1px',
          background: `linear-gradient(to right, ${color}33, transparent)`,
        }}
      />
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
  const { toast } = useToast();
  const [, navigate] = useRouterLocation();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

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
          onClick={(e) => { e.stopPropagation(); navigate(`/tournament/${tournament.id}`); }}
          className="whitespace-nowrap"
          style={{
            padding: '8px 14px',
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.25)',
            borderRadius: '10px',
            color: '#67E7BF',
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
          <BarChart3 className="w-3.5 h-3.5" />
                  Rankings
        </button>
      );
    }

    if (isCreator && isWaiting) {
      return (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsStarting(true);
              try {
                await apiRequest("POST", `/api/tournaments/${tournament.id}/start-early`);
                queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
                queryClient.invalidateQueries({ queryKey: ['/api/tournaments/public'] });
              } catch (error: any) {
                toast({
                  title: "Couldn’t start the arena",
                  description: error.message,
                  variant: "destructive",
                });
              } finally {
                setIsStarting(false);
              }
            }}
            disabled={isStarting}
            className="whitespace-nowrap"
            style={{
              padding: '8px 14px',
              background: isStarting ? 'rgba(0,255,135,0.4)' : 'linear-gradient(135deg, #67E7BF, #00C853)',
              border: 'none',
              borderRadius: '10px',
              color: '#041810',
              fontSize: '0.8rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              minHeight: '40px',
              boxShadow: '0 0 14px rgba(0,255,135,0.25)',
              transition: 'all 0.2s',
              opacity: isStarting ? 0.7 : 1,
            }}
          >
            <Play className="w-3.5 h-3.5" />
            {isStarting ? "Starting..." : "Start"}
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
            background: 'linear-gradient(135deg, #67E7BF, #2EBF9A)',
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
          {isJoining ? "Joining the board..." :
           isFull ? "Full" :
           tournament.buyInAmount > 0 ? `Enter — ${formatCurrency(tournament.buyInAmount)}` : "Enter free"
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
        className="tournament-card-surface flex items-center gap-4 p-4 transition-all duration-200"
        onClick={() => navigate(`/tournament/${tournament.id}`)}
        role="button"
        title="View tournament"
        style={{
          background: 'linear-gradient(135deg, #0A1C2C 0%, #081622 100%)',
          borderRadius: '20px',
          cursor: 'pointer',
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
              <TournamentTypeIcon className="w-3.5 h-3.5" style={{ color: '#67E7BF' }} />
            </div>

            {/* Name */}
            <span className="font-extrabold text-sm truncate" style={{ color: '#C9D1E2', fontWeight: 800 }}>
              {tournament.name}
            </span>

            {/* High pot crown */}
            {isHighPot && (
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F2C76A', filter: 'drop-shadow(0 0 5px rgba(227,179,65,0.4))' }} />
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
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#67E7BF' }} />
                <span className="text-[10px] font-bold" style={{ color: '#67E7BF' }}>LIVE</span>
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
                <span className="text-[10px] font-semibold" style={{ color: '#8A93A6' }}>Closed entry</span>
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
                  color: isLive ? '#67E7BF' : '#F2C76A',
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
                color: '#F2C76A',
                textShadow: '0 0 12px rgba(227,179,65,0.4)',
              }}
            >
              {formatCurrency(currentPot)}
            </div>
          </div>

          {/* Entry fee stat chip */}
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
              Entry fee
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
