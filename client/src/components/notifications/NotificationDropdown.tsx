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
  tournament_invite: '#E3B341',
  tournament_invite_accepted: '#28C76F',
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
        title: "Joined tournament!",
        description: "You've successfully joined the tournament",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join tournament",
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

  const handleNotificationClick = (notif: any) => {
    // Handle navigation based on notification type
    if (notif.type === 'chat_mention' && notif.metadata?.messageId && notif.metadata?.tournamentId) {
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
    <DropdownMenu open={open} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 md:h-10 md:w-10 p-0 relative flex items-center justify-center hover:bg-muted/50 transition-colors min-w-[44px] min-h-[44px]"
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
      <DropdownMenuContent align="end" className="w-[95vw] max-w-[380px]" style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2B3A4C" }}>
          <span className="text-sm font-semibold" style={{ color: "#C9D1E2" }}>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs min-h-[44px]"
              style={{ color: "#E3B341" }}
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
              <p className="text-sm" style={{ color: "#8A93A6" }}>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  style={{
                    borderBottom: "1px solid #2B3A4C",
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
                        backgroundColor: notif.read ? "#1a2332" : "rgba(227, 179, 65, 0.15)",
                        color: notif.read ? "#8A93A6" : (typeColors[notif.type] || "#E3B341")
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
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#E3B341" }} />
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
  );
}
