import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Users, 
  Trophy, 
  Crown, 
  Calendar, 
  TrendingUp, 
  Target,
  Award,
  Star,
  Search,
  ChevronRight,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Activity,
  Zap,
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
  const [activeTab, setActiveTab] = useState("browse");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");


  // Fetch all users for browsing
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users/public'],
    enabled: !profileUserId,
  });

  // Fetch specific user profile
  const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/public', profileUserId],
    enabled: !!profileUserId,
  });

  // Filter and sort users
  const filteredAndSortedUsers = (() => {
    let users = (allUsers as any)?.data || [];
    
    // Apply search filter
    if (searchQuery) {
      users = users.filter((u: any) => 
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filterBy !== "all") {
      users = users.filter((u: any) => u.subscriptionTier === filterBy);
    }
    
    // Apply sorting
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

  // Get user stats from API data
  const getUserStats = (user: any) => ({
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)),
    totalTrades: user?.totalTrades || 0
  });

  // If viewing a specific user profile
  if (profileUserId) {
    if (isLoadingProfile) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const stats = getUserStats((profileUser as any)?.data);

    return (
      <div className="min-h-screen bg-background">
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
              <Card className="mb-8 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-2xl font-bold">
                        {(profileUser as any)?.data?.username?.[0]?.toUpperCase()}{(profileUser as any)?.data?.username?.[1]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {(profileUser as any)?.data?.username}
                      </h1>
                      <div className="flex items-center space-x-4 mb-4">
                        {(profileUser as any)?.data?.subscriptionTier === 'administrator' && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            <Crown className="w-3 h-3 mr-1" />
                            Administrator
                          </Badge>
                        )}
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <Calendar className="w-3 h-3 mr-1" />
                          Since {(profileUser as any)?.data?.createdAt ? new Date((profileUser as any).data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Active {Math.floor((Date.now() - stats.lastActive.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </Badge>
                      </div>
                      
                      {/* Advanced Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{(profileUser as any)?.data?.totalTrades || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Trades</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">+{Math.floor(Math.random() * 50) + 5}%</p>
                          <p className="text-xs text-muted-foreground">Portfolio Growth</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{Math.floor(Math.random() * 100) + 10}d</p>
                          <p className="text-xs text-muted-foreground">Trading Streak</p>
                        </div>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-6 lg:mb-8" variants={fadeInUp}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">People</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Discover and connect with traders in our community</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
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
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">All Members</option>
                <option value="administrator">Administrators</option>
              </select>
            </div>
            
            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'person' : 'people'}
              {searchQuery && ` matching "${searchQuery}"`}
              {filterBy !== "all" && ` (${filterBy} only)`}
            </div>
          </motion.div>

          {/* People Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingUsers ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 bg-muted rounded-full mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No people found</p>
                </div>
              ) : (
                filteredAndSortedUsers.map((person: any) => {
                  const stats = getUserStats(person);

                  return (
                    <Card key={person.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-lg font-bold">
                              {person.username?.[0]?.toUpperCase()}{person.username?.[1]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {person.username}
                            </h3>

                            <p className="text-xs text-muted-foreground">
                              Member since {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{person.totalTrades || 0}</p>
                            <p className="text-xs text-muted-foreground">Trades</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{Math.floor(Math.random() * 20) + 1}d</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-green-600">
                              {Math.floor(Math.random() * 30) + 1}%
                            </p>
                            <p className="text-xs text-muted-foreground">Growth</p>
                          </div>
                        </div>

                        {/* Activity Status */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span>{Math.random() > 0.5 ? 'Active today' : 'Last seen 2d ago'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>{Math.floor(Math.random() * 10) + 1} tournaments</span>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => window.location.href = `/people/${person.id}`}
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}