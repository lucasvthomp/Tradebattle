import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  Trophy,
  Calendar,
  Activity,
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  X,
  Crown,
} from "lucide-react";

export function UserProfileModal({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const { toast } = useToast();

  // Fetch selected user profile
  const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/users/public", userId],
    enabled: !!userId,
    retry: 3,
  });

  // Fetch recent trades
  const { data: tradesResponse } = useQuery({
    queryKey: ["/api/users", userId, "trades"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/trades`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Friend status
  const { data: friendStatusData } = useQuery({
    queryKey: ["/api/friends/status", userId],
    queryFn: async () => {
      const res = await fetch(`/api/friends/status/${userId}`);
      if (!res.ok) return { data: { status: "none" } };
      return res.json();
    },
    enabled: !!userId && !!user && String(user.id) !== userId,
  });

  const friendStatus = (friendStatusData as any)?.data;

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: number) => {
      const res = await apiRequest("POST", "/api/friends/request", { addresseeId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", userId] });
      toast({ title: "Friend request sent!" });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", userId] });
      toast({ title: "Friend request accepted!" });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const declineFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/decline`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", userId] });
      toast({ title: "Friend request declined" });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("DELETE", `/api/friends/${friendshipId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", userId] });
      toast({ title: "Friend removed" });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const profileData = (profileUser as any)?.data;
  const trades = (tradesResponse as any)?.data || [];

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div
              className="w-full max-w-md overflow-hidden"
              style={{
                backgroundColor: "#0C1829",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
              }}
            >
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: "#00A3FF" }}
                  />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <AvatarWithStatus
                          className="w-14 h-14"
                          src={profileData?.profilePicture}
                          alt={profileData?.username}
                          fallback={`${profileData?.username?.[0]?.toUpperCase() || ""}${profileData?.username?.[1]?.toUpperCase() || ""}`}
                          lastActivity={profileData?.lastActivity}
                          statusSize="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black" style={{ color: "#F1F5F9" }}>
                              {profileData?.username}
                            </h2>
                            {profileData?.subscriptionTier === "administrator" && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: "rgba(0,163,255,0.12)",
                                  color: "#00A3FF",
                                }}
                              >
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" style={{ color: "#4B5563" }} />
                            <span className="text-xs" style={{ color: "#4B5563" }}>
                              {t("memberSince")}{" "}
                              {profileData?.createdAt
                                ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "#4B5563" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[
                        {
                          icon: <Activity className="w-3.5 h-3.5" style={{ color: "#00A3FF" }} />,
                          label: t("totalTrades"),
                          value: profileData?.totalTrades || 0,
                          color: "#C9D1E2",
                        },
                        {
                          icon: <Flame className="w-3.5 h-3.5" style={{ color: "#FF4F58" }} />,
                          label: t("tradingStreak"),
                          value: `${profileData?.tradingStreak || 0}d`,
                          color: "#00A3FF",
                        },
                        {
                          icon: <Trophy className="w-3.5 h-3.5" style={{ color: "#28C76F" }} />,
                          label: t("tournamentsJoined"),
                          value: profileData?.tournamentCount || 0,
                          color: "#28C76F",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="text-center py-2.5 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="flex justify-center mb-1">{stat.icon}</div>
                          <div className="text-base font-black" style={{ color: stat.color }}>
                            {stat.value}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#4B5563" }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Friend button */}
                    {user && String(user.id) !== userId && (
                      <div className="mt-3">
                        {friendStatus?.status === "none" && (
                          <button
                            onClick={() => sendFriendRequestMutation.mutate(parseInt(userId!))}
                            disabled={sendFriendRequestMutation.isPending}
                            className="w-full py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            style={{
                              background: "linear-gradient(135deg, #28C76F, #20a35a)",
                              color: "#000",
                            }}
                          >
                            <UserPlus className="w-4 h-4 inline mr-1.5" />
                            {sendFriendRequestMutation.isPending ? "Sending..." : "Add Friend"}
                          </button>
                        )}
                        {friendStatus?.status === "pending_sent" && (
                          <div
                            className="w-full py-2 rounded-lg text-sm font-semibold text-center"
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#64748B" }}
                          >
                            <ClockIcon className="w-4 h-4 inline mr-1.5" />
                            Request Sent
                          </div>
                        )}
                        {friendStatus?.status === "pending_received" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                acceptFriendRequestMutation.mutate(friendStatus.friendshipId)
                              }
                              disabled={acceptFriendRequestMutation.isPending}
                              className="flex-1 py-2 rounded-lg text-sm font-bold"
                              style={{
                                background: "linear-gradient(135deg, #28C76F, #20a35a)",
                                color: "#000",
                              }}
                            >
                              <UserCheck className="w-4 h-4 inline mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                declineFriendRequestMutation.mutate(friendStatus.friendshipId)
                              }
                              disabled={declineFriendRequestMutation.isPending}
                              className="flex-1 py-2 rounded-lg text-sm font-bold"
                              style={{
                                backgroundColor: "rgba(255,79,88,0.1)",
                                color: "#FF4F58",
                                border: "1px solid rgba(255,79,88,0.2)",
                              }}
                            >
                              <UserX className="w-4 h-4 inline mr-1" />
                              Decline
                            </button>
                          </div>
                        )}
                        {friendStatus?.status === "accepted" && (
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm font-semibold flex items-center gap-1.5"
                              style={{ color: "#28C76F" }}
                            >
                              <UserCheck className="w-4 h-4" />
                              Friends
                            </span>
                            <button
                              onClick={() => removeFriendMutation.mutate(friendStatus.friendshipId)}
                              className="text-xs"
                              style={{ color: "#4B5563" }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recent Trades */}
                  <div className="p-5 max-h-64 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: "#00A3FF" }} />
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: "#4B5563" }}
                      >
                        {t("recentTrades")}
                      </span>
                    </div>
                    {trades.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm" style={{ color: "#4B5563" }}>
                          {t("noTradesYet")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trades.map((trade: any) => (
                          <div
                            key={trade.id}
                            className="flex items-center justify-between p-2.5 rounded-lg"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="p-1 rounded"
                                style={{
                                  backgroundColor:
                                    trade.action === "buy"
                                      ? "rgba(40,199,111,0.12)"
                                      : "rgba(255,79,88,0.12)",
                                }}
                              >
                                {trade.action === "buy" ? (
                                  <TrendingUp
                                    className="w-3.5 h-3.5"
                                    style={{ color: "#28C76F" }}
                                  />
                                ) : (
                                  <TrendingDown
                                    className="w-3.5 h-3.5"
                                    style={{ color: "#FF4F58" }}
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                                  {trade.action === "buy" ? t("bought") : t("sold")} {trade.symbol}
                                </p>
                                <p className="text-xs" style={{ color: "#4B5563" }}>
                                  {trade.shares} shares @ ${parseFloat(trade.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-sm font-bold"
                                style={{
                                  color: trade.action === "buy" ? "#FF4F58" : "#28C76F",
                                }}
                              >
                                {trade.action === "buy" ? "-" : "+"}$
                                {parseFloat(
                                  trade.totalValue || trade.shares * trade.price
                                ).toFixed(2)}
                              </p>
                              <p className="text-xs" style={{ color: "#4B5563" }}>
                                {trade.tradeDate
                                  ? new Date(trade.tradeDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
