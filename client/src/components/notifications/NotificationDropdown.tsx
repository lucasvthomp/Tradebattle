import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, Trophy, DollarSign, Shield, Users, Mail, MessageSquare, UserCheck, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TournamentEndCelebration } from "@/components/tournaments/TournamentEndCelebration";
import { TournamentStartDialog } from "@/components/tournaments/TournamentStartDialog";

const typeIcons: Record<string, any> = {
  tournament_start: Trophy,
  tournament_end: Trophy,
  tournament_join: Users,
  tournament_invite: UserPlus,
  tournament_invite_accepted: UserCheck,
  chat_mention: MessageSquare,
  deposit: DollarSign,
  withdrawal: DollarSign,
  payout: DollarSign,
  achievement: Shield,
  tip: DollarSign,
  default: Bell,
};

const typeColors: Record<string, string> = {
  tournament_invite: '#67E7BF',
  tournament_invite_accepted: '#67E7BF',
  chat_mention: '#3B82F6',
};

function getIcon(type: string, color?: string) {
  const Icon = typeIcons[type] || typeIcons.default;
  return <Icon className="w-4 h-4 flex-shrink-0" style={color ? { color } : undefined} />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationDropdown() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [startDialogData, setStartDialogData] = useState<any>(null);

  const { data } = useQuery<{ data: any[]; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return { data: [], unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async ({ tournamentId, notificationId }: { tournamentId: number; notificationId: number }) => {
      await apiRequest("POST", `/api/tournaments/${tournamentId}/join`);
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Arena entry locked",
        description: "You’re in. Make your move.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Entry failed",
        description: error.message || "Couldn’t enter that arena",
        variant: "destructive",
      });
    },
  });

  const rejectInviteMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleNotificationClick = async (notif: any) => {
    // Handle navigation based on notification type
    if (notif.type === 'tournament_start' && notif.metadata?.tournamentId) {
      setOpen(false);
      // Fetch tournament details to show start dialog
      try {
        const tournamentRes = await apiRequest("GET", `/api/tournaments/${notif.metadata.tournamentId}`);
        const tournament = await tournamentRes.json();

        if (tournament) {
          setStartDialogData({
            id: tournament.id,
            name: tournament.name,
            startingBalance: parseFloat(tournament.startingBalance?.toString() || '10000'),
            prizePool: parseFloat(tournament.currentPot?.toString() || '0'),
            timeRemaining: new Date(tournament.endTime).getTime() - Date.now(),
            competitors: tournament.currentPlayers || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch tournament details:", error);
        // Navigate to tournaments page as fallback
        navigate('/tournaments');
      }
    } else if (notif.type === 'tournament_end' && notif.metadata?.tournamentId) {
      setOpen(false);
      // Fetch tournament details and results to show celebration
      try {
        const [tournamentRes, resultsRes] = await Promise.all([
          apiRequest("GET", `/api/tournaments/${notif.metadata.tournamentId}`),
          apiRequest("GET", `/api/tournaments/${notif.metadata.tournamentId}/results`)
        ]);

        const tournament = await tournamentRes.json();
        const resultsData = await resultsRes.json();

        if (resultsData.success && tournament) {
          setCelebrationData({
            tournament: {
              id: notif.metadata.tournamentId,
              name: tournament.name || notif.title.replace('Tournament "', '').replace('" Ended', ''),
              prizePool: parseFloat(tournament.currentPot?.toString() || '0'),
            },
            results: {
              winner: resultsData.data.winner,
              topThree: resultsData.data.topThree,
              userRank: notif.metadata.rank,
              userProfit: (notif.metadata.portfolioValue || 0) - (tournament.startingBalance || 10000),
              totalParticipants: resultsData.data.totalParticipants,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch tournament results:", error);
        toast({
          title: "Results unavailable",
          description: "Couldn’t load the final arena results",
          variant: "destructive",
        });
      }
    } else if (notif.type === 'chat_mention' && notif.metadata?.messageId && notif.metadata?.tournamentId) {
      setOpen(false);
      navigate(`/tournaments/${notif.metadata.tournamentId}?messageId=${notif.metadata.messageId}`);
    } else if (notif.type === 'tournament_invite' && notif.metadata?.tournamentCode) {
      setOpen(false);
      navigate(`/tournaments?join=${notif.metadata.tournamentCode}`);
    } else if (notif.type === 'tournament_invite_accepted' && notif.metadata?.tournamentId) {
      setOpen(false);
      navigate('/tournaments');
    }
  };

  const handleDropdownOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  return (
    <>
    <DropdownMenu open={open} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className="h-10 w-10 md:h-10 md:w-10 p-0 relative flex items-center justify-center hover:bg-muted/50 transition-colors min-w-[44px] min-h-[44px]"
          style={{ border: 'none' }}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#FF4F58", color: "#fff", fontSize: "10px" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[95vw] max-w-[380px]" style={{ background: "#0B1B2A", borderColor: "#0E2040" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #0E2040" }}>
          <span className="text-sm font-semibold" style={{ color: "#C9D1E2" }}>Alerts</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs min-h-[44px]"
              style={{ color: "#67E7BF" }}
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[70vh]">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: "#8A93A6" }} />
              <p className="text-sm" style={{ color: "#8A93A6" }}>No alerts yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  style={{
                    borderBottom: "1px solid #0E2040",
                    opacity: notif.read ? 0.6 : 1,
                  }}
                >
                  <div
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors min-h-[48px]"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div
                      className="mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: notif.read ? "#1a2332" : "rgba(0, 163, 255, 0.12)",
                        color: notif.read ? "#8A93A6" : (typeColors[notif.type] || "#67E7BF")
                      }}
                    >
                      {getIcon(notif.type, notif.read ? undefined : typeColors[notif.type])}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#C9D1E2" }}>{notif.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#8A93A6" }}>{notif.message}</p>
                      <p className="text-xs mt-1" style={{ color: "#5f6b7a" }}>{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#67E7BF" }} />
                    )}
                  </div>

                  {/* Tournament Invite Actions */}
                  {notif.type === 'tournament_invite' && !notif.read && notif.metadata?.tournamentId && (
                    <div className="flex items-center gap-2 px-4 pb-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptInviteMutation.mutate({
                            tournamentId: notif.metadata.tournamentId,
                            notificationId: notif.id
                          });
                        }}
                        disabled={acceptInviteMutation.isPending}
                        className="flex-1 h-11 text-xs font-bold min-h-[44px]"
                        style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectInviteMutation.mutate(notif.id);
                        }}
                        disabled={rejectInviteMutation.isPending}
                        className="flex-1 h-11 text-xs min-h-[44px]"
                        variant="outline"
                        style={{ borderColor: "#FF4F58", color: "#FF4F58" }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>

      {/* Tournament Start Dialog */}
      {startDialogData && (
        <TournamentStartDialog
          isOpen={!!startDialogData}
          onClose={() => {
            setStartDialogData(null);
            navigate('/tournaments');
          }}
          tournament={startDialogData}
        />
      )}

      {/* Tournament End Celebration Modal */}
      {celebrationData && (
        <TournamentEndCelebration
          isOpen={!!celebrationData}
          onClose={() => setCelebrationData(null)}
          tournament={celebrationData.tournament}
          results={celebrationData.results}
        />
      )}
    </>
  );
}
