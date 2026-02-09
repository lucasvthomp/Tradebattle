import { useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Trophy,
  Crown,
  Calendar,
  ChevronRight,
  Search,
  Activity,
  Flame
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch all users for browsing
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/users/public'],
    enabled: !profileUserId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080C14' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#E3B341' }}></div>
        </div>
      );
    }

    const profileData = (profileUser as any)?.data;

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#080C14' }}>
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
                Back to People
              </Button>
            </motion.div>

            {/* Profile Header */}
            <motion.div variants={fadeInUp}>
              <Card className="mb-8 shadow-2xl overflow-hidden" style={{ backgroundColor: '#111827', borderColor: '#E3B341', borderWidth: '2px' }}>
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-32 h-32" style={{ border: '4px solid #E3B341' }}>
                        <AvatarFallback className="text-3xl font-bold" style={{ backgroundColor: '#0F172A', color: '#E3B341' }}>
                          {profileData?.username?.[0]?.toUpperCase()}{profileData?.username?.[1]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
                          Member since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                        </Badge>
                      </div>

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
                            <p className="text-xs" style={{ color: '#94A3B8' }}>Total Trades</p>
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
                            <p className="text-xs" style={{ color: '#94A3B8' }}>Trading Streak</p>
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
                            <p className="text-xs" style={{ color: '#94A3B8' }}>Tournaments Joined</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#10B981' }}>{profileData?.tournamentCount || 0}</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
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
    <div className="min-h-screen" style={{ backgroundColor: '#080C14' }}>
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-6 lg:mb-8" variants={fadeInUp}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#F1F5F9' }}>People</h1>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Discover and connect with traders in our community</p>
          </motion.div>

          {/* Error State */}
          {usersError && (
            <motion.div variants={fadeInUp} className="mb-6">
              <Card style={{ backgroundColor: '#111827', borderColor: '#FF3333', borderWidth: '2px' }}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#FF3333' }}>Error Loading Users</h3>
                  <p style={{ color: '#94A3B8' }} className="mb-4">
                    {(usersError as Error)?.message || 'Unable to load user data. Please try again.'}
                  </p>
                  <Button onClick={() => window.location.reload()} style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                    Reload Page
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
                  placeholder="Search by name or username..."
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
                <option value="newest">Newest Members</option>
                <option value="oldest">Oldest Members</option>
                <option value="trades">Most Trades</option>
                <option value="name">Alphabetical</option>
              </select>

              {/* Filter By */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 rounded-md"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9', border: '1px solid #1F2937' }}
              >
                <option value="all">All Members</option>
                <option value="administrator">Administrators</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm" style={{ color: '#94A3B8' }}>
              Showing {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'person' : 'people'}
              {searchQuery && ` matching "${searchQuery}"`}
              {filterBy !== "all" && ` (${filterBy} only)`}
            </div>
          </motion.div>

          {/* People Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersError ? (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#EF4444' }} />
                    <p className="text-lg mb-2" style={{ color: '#F1F5F9' }}>Failed to load people</p>
                    <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                      There was an error loading the user list. Please try again.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
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
                  <p className="text-lg" style={{ color: '#94A3B8' }}>No people found</p>
                </div>
              ) : (
                filteredAndSortedUsers.map((person: any) => (
                  <Card key={person.id} className="shadow-lg hover:shadow-xl transition-all cursor-pointer" style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16" style={{ border: '2px solid #E3B341' }}>
                          <AvatarFallback className="text-lg font-bold" style={{ backgroundColor: '#0F172A', color: '#E3B341' }}>
                            {person.username?.[0]?.toUpperCase()}{person.username?.[1]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                            {person.username}
                          </h3>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            Member since {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats - Real data */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{person.totalTrades || 0}</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>Trades</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{person.tradingStreak || 0}d</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>Streak</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ backgroundColor: '#0F172A' }}>
                          <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                            {person.tournamentCount || 0}
                          </p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>Tournaments</p>
                        </div>
                      </div>

                      {/* Member info */}
                      <div className="flex items-center justify-between text-xs mb-4" style={{ color: '#94A3B8' }}>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" style={{ color: '#E3B341' }} />
                          <span>Member since {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-3 h-3" style={{ color: '#E3B341' }} />
                          <span>{person.tournamentCount || 0} tournaments</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => window.location.href = `/people/${person.id}`}
                        style={{ backgroundColor: '#0F172A', borderColor: '#E3B341', color: '#E3B341' }}
                      >
                        View Profile
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
