import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import {
  Users,
  Trophy,
  Crown,
  Calendar,
  ChevronRight,
  Search,
  Activity,
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserX,
  Clock as ClockIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function People() {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch all users for browsing with polling for status updates
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/users/public'],
    enabled: !profileUserId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
    refetchInterval: 30000, // Poll every 30 seconds for status updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch specific user profile
  const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/public', profileUserId],
    enabled: !!profileUserId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch recent trades for profile view
  const { data: tradesResponse } = useQuery({
    queryKey: ['/api/users', profileUserId, 'trades'],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileUserId}/trades`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: !!profileUserId,
    staleTime: 30000,
  });

  // Fetch friend status for profile view
  const { data: friendStatusData } = useQuery({
    queryKey: ['/api/friends/status', profileUserId],
    queryFn: async () => {
      const res = await fetch(`/api/friends/status/${profileUserId}`);
      if (!res.ok) return { data: { status: 'none' } };
      return res.json();
    },
    enabled: !!profileUserId && !!user && String(user.id) !== profileUserId,
  });

  const friendStatus = (friendStatusData as any)?.data;

  // Friend mutations
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: number) => {
      const res = await apiRequest("POST", "/api/friends/request", { addresseeId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/status', profileUserId] });
      toast({ title: "Friend request sent!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/status', profileUserId] });
      toast({ title: "Friend request accepted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const declineFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/decline`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/status', profileUserId] });
      toast({ title: "Friend request declined" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await apiRequest("DELETE", `/api/friends/${friendshipId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/status', profileUserId] });
      toast({ title: "Friend removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Filter and sort users
  const filteredAndSortedUsers = (() => {
    let users = (allUsers as any)?.data || [];

    if (searchQuery) {
      users = users.filter((u: any) =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy !== "all") {
      users = users.filter((u: any) => u.subscriptionTier === filterBy);
    }

    switch (sortBy) {
      case "newest":
        return users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return users.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "trades":
        return users.sort((a: any, b: any) => (b.totalTrades || 0) - (a.totalTrades || 0));
      case "name":
        return users.sort((a: any, b: any) => (a.username || "").localeCompare(b.username || ""));
      default:
        return users;
    }
  })();

  // If viewing a specific user profile
  if (profileUserId) {
    if (isLoadingProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#E3B341' }}></div>
        </div>
      );
    }

    const profileData = (profileUser as any)?.data;

    return (
      <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
        <div className="container mx-auto py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-5xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Back Button */}
            <motion.div className="mb-6" variants={fadeInUp}>
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                {t('backToPeople')}
              </Button>
            </motion.div>

            {/* Profile Header */}
            <motion.div variants={fadeInUp}>
              <Card className="mb-8 shadow-2xl overflow-hidden" style={{ backgroundColor: '#111827', borderColor: '#E3B341', borderWidth: '2px' }}>
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Avatar */}
                    <div className="relative">
                      <AvatarWithStatus
                        className="w-32 h-32"
                        src={profileData?.profilePicture}
                        alt={profileData?.username}
                        fallback={`${profileData?.username?.[0]?.toUpperCase() || ''}${profileData?.username?.[1]?.toUpperCase() || ''}`}
                        lastActivity={profileData?.lastActivity}
                        statusSize="lg"
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-3 mb-3">
                        <h1 className="text-4xl font-black" style={{ color: '#F1F5F9' }}>
                          {profileData?.username}
                        </h1>
                        {profileData?.subscriptionTier === 'administrator' && (
                          <Badge className="animate-pulse" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                            <Crown className="w-4 h-4 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Badge style={{ backgroundColor: '#0F172A', color: '#F1F5F9', border: '1px solid #1F2937' }}>
                          <Calendar className="w-3 h-3 mr-1" style={{ color: '#E3B341' }} />
                          {t('memberSince')} {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                        </Badge>
                      </div>

                      {/* Friend Button */}
                      {user && String(user.id) !== profileUserId && (
                        <div className="mb-6">
                          {friendStatus?.status === 'none' && (
                            <Button
                              onClick={() => sendFriendRequestMutation.mutate(parseInt(profileUserId!))}
                              disabled={sendFriendRequestMutation.isPending}
                              className="border-0"
                              style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              {sendFriendRequestMutation.isPending ? "Sending..." : "Add Friend"}
                            </Button>
                          )}
                          {friendStatus?.status === 'pending_sent' && (
                            <Button disabled className="border-0" style={{ backgroundColor: '#1F2937', color: '#94A3B8' }}>
                              <ClockIcon className="w-4 h-4 mr-2" />
                              Request Sent
                            </Button>
                          )}
                          {friendStatus?.status === 'pending_received' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => acceptFriendRequestMutation.mutate(friendStatus.friendshipId)}
                                disabled={acceptFriendRequestMutation.isPending}
                                className="border-0"
                                style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#FFFFFF' }}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => declineFriendRequestMutation.mutate(friendStatus.friendshipId)}
                                disabled={declineFriendRequestMutation.isPending}
                                variant="outline"
                                className="border-0"
                                style={{ backgroundColor: '#1F2937', color: '#EF4444' }}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          )}
                          {friendStatus?.status === 'accepted' && (
                            <div className="flex items-center gap-3">
                              <Badge style={{ backgroundColor: '#10B98120', color: '#10B981', border: '1px solid #10B98140' }}>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Friends
                              </Badge>
                              <Button
                                onClick={() => removeFriendMutation.mutate(friendStatus.friendshipId)}
                                disabled={removeFriendMutation.isPending}
                                variant="ghost"
                                size="sm"
                                style={{ color: '#94A3B8' }}
                              >
                                Remove Friend
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stats Grid - 3 real stats only */}
                      <div className="grid grid-cols-3 gap-4">
                        <motion.div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}
                          whileHover={{ scale: 1.05, borderColor: '#E3B341' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <p className="text-xs" style={{ color: '#94A3B8' }}>{t('totalTrades')}</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#F1F5F9' }}>{profileData?.totalTrades || 0}</p>
                        </motion.div>

                        <motion.div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}
                          whileHover={{ scale: 1.05, borderColor: '#EF4444' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Flame className="w-4 h-4" style={{ color: '#EF4444' }} />
                            <p className="text-xs" style={{ color: '#94A3B8' }}>{t('tradingStreak')}</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#E3B341' }}>{profileData?.tradingStreak || 0}d</p>
                        </motion.div>

                        <motion.div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}
                          whileHover={{ scale: 1.05, borderColor: '#10B981' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Trophy className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <p className="text-xs" style={{ color: '#94A3B8' }}>{t('tournamentsJoined')}</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#10B981' }}>{profileData?.tournamentCount || 0}</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Trades */}
            <motion.div variants={fadeInUp}>
              <Card style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                    <ArrowRightLeft className="w-5 h-5" style={{ color: '#E3B341' }} />
                    {t('recentTrades')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const trades = (tradesResponse as any)?.data || [];
                    if (trades.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <ArrowRightLeft className="w-8 h-8 mx-auto mb-2" style={{ color: '#94A3B8', opacity: 0.5 }} />
                          <p className="text-sm" style={{ color: '#94A3B8' }}>{t('noTradesYet')}</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        {trades.map((trade: any) => (
                          <div
                            key={trade.id}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded" style={{ backgroundColor: trade.action === 'buy' ? '#10B98120' : '#EF444420' }}>
                                {trade.action === 'buy' ? (
                                  <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                                ) : (
                                  <TrendingDown className="w-4 h-4" style={{ color: '#EF4444' }} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                                  {trade.action === 'buy' ? t('bought') : t('sold')} {trade.symbol}
                                </p>
                                <p className="text-xs" style={{ color: '#94A3B8' }}>
                                  {trade.shares} shares @ ${parseFloat(trade.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold" style={{ color: trade.action === 'buy' ? '#EF4444' : '#10B981' }}>
                                {trade.action === 'buy' ? '-' : '+'}${parseFloat(trade.totalValue || (trade.shares * trade.price)).toFixed(2)}
                              </p>
                              <p className="text-xs" style={{ color: '#94A3B8' }}>
                                {trade.tradeDate ? new Date(trade.tradeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        </div>
      </div>
    );
  }

  // Main people browsing page
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-6 lg:mb-8" variants={fadeInUp}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#F1F5F9' }}>{t('people')}</h1>
          </motion.div>

          {/* Error State */}
          {usersError && (
            <motion.div variants={fadeInUp} className="mb-6">
              <Card style={{ backgroundColor: '#111827', borderColor: '#FF3333', borderWidth: '2px' }}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#FF3333' }}>{t('errorLoadingUsers')}</h3>
                  <p style={{ color: '#94A3B8' }} className="mb-4">
                    {(usersError as Error)?.message || 'Unable to load user data. Please try again.'}
                  </p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users/public'] })} style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                    {t('reloadPage')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#94A3B8' }} />
                <Input
                  placeholder={t('searchByName')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-md"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9', border: '1px solid #1F2937' }}
              >
                <option value="newest">{t('newestMembers')}</option>
                <option value="oldest">{t('oldestMembers')}</option>
                <option value="trades">{t('mostTrades')}</option>
                <option value="name">{t('alphabetical')}</option>
              </select>

              {/* Filter By */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 rounded-md"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9', border: '1px solid #1F2937' }}
              >
                <option value="all">{t('allMembers')}</option>
                <option value="administrator">{t('administrators')}</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm" style={{ color: '#94A3B8' }}>
              {t('showing')} {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? t('personUnit') : t('peopleUnit')}
              {searchQuery && ` ${t('matching')} "${searchQuery}"`}
              {filterBy !== "all" && ` (${filterBy})`}
            </div>
          </motion.div>

          {/* People Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersError ? (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#EF4444' }} />
                    <p className="text-lg mb-2" style={{ color: '#F1F5F9' }}>{t('errorLoadingUsers')}</p>
                    <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                      {t('tryAgain')}
                    </p>
                    <Button
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users/public'] })}
                      style={{ backgroundColor: '#E3B341', color: '#080C14' }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : isLoadingUsers ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="shadow-lg" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 rounded-lg mb-4" style={{ backgroundColor: '#0F172A' }}></div>
                        <div className="h-4 rounded mb-2" style={{ backgroundColor: '#0F172A' }}></div>
                        <div className="h-3 rounded w-3/4 mb-4" style={{ backgroundColor: '#0F172A' }}></div>
                        <div className="space-y-2">
                          <div className="h-3 rounded" style={{ backgroundColor: '#0F172A' }}></div>
                          <div className="h-3 rounded w-5/6" style={{ backgroundColor: '#0F172A' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#94A3B8' }} />
                  <p className="text-lg" style={{ color: '#94A3B8' }}>{t('noPeopleFound')}</p>
                </div>
              ) : (
                filteredAndSortedUsers.map((person: any) => (
                  <Card key={person.id} className="shadow-lg hover:shadow-xl transition-all cursor-pointer" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <AvatarWithStatus
                          className="w-16 h-16"
                          src={person.profilePicture}
                          alt={person.username}
                          fallback={`${person.username?.[0]?.toUpperCase() || ''}${person.username?.[1]?.toUpperCase() || ''}`}
                          lastActivity={person.lastActivity}
                          statusSize="md"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                            {person.username}
                          </h3>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            {t('memberSince')} {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats - Real data */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{person.totalTrades || 0}</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{t('totalTrades')}</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{person.tradingStreak || 0}d</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{t('tradingStreak')}</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                            {person.tournamentCount || 0}
                          </p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{t('tournaments')}</p>
                        </div>
                      </div>


                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/people/${person.id}`)}
                        style={{ backgroundColor: '#0F172A', borderColor: '#E3B341', color: '#E3B341' }}
                      >
                        {t('viewProfile')}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
