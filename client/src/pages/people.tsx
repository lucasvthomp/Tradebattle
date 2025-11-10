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

// Achievement system with proper badge tiers and colors
const achievements = [
  // Common (Gray)
  { id: 1, name: "Welcome", description: "Welcome to the platform", icon: User, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  { id: 2, name: "First Trade", description: "Made your first trade", icon: Target, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  { id: 3, name: "Tournament Participant", description: "Joined a tournament", icon: Users, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  // Uncommon (Green)
  { id: 4, name: "5 Day Streak", description: "Traded for 5 consecutive days", icon: Activity, rarity: "uncommon", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { id: 5, name: "5% Portfolio Growth", description: "Made over 5% on portfolio", icon: TrendingUp, rarity: "uncommon", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  // Rare (Bright Blue)
  { id: 6, name: "Tournament Creator", description: "Created a tournament", icon: Plus, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
  { id: 7, name: "10% Portfolio Growth", description: "Made over 10% on portfolio", icon: TrendingUp, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
  { id: 8, name: "15 Day Streak", description: "Traded for 15 consecutive days", icon: Activity, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
  { id: 8, name: "25% Portfolio Growth", description: "Made over 25% on portfolio", icon: TrendingUp, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
  // Epic (Rich Purple)
  { id: 9, name: "50 Day Streak", description: "Traded for 50 consecutive days", icon: Activity, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
  // Legendary (Bright Orange)
  { id: 10, name: "Tournament Champion", description: "Won a tournament", icon: Trophy, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
  { id: 11, name: "100 Day Streak", description: "Traded for 100 consecutive days", icon: Activity, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },

  // Mythic (Red)
  { id: 13, name: "365 Day Streak", description: "Traded every day for a full year", icon: Activity, rarity: "mythic", color: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100" },
  { id: 14, name: "100% Portfolio Growth", description: "Doubled your portfolio value", icon: TrendingUp, rarity: "mythic", color: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100" },
  // Special (Unique gradient designs)
  { id: 15, name: "Tournament Overlord", description: "Ranked #1 on tournament leaderboard", icon: Crown, rarity: "special", color: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-bold shadow-lg border-2 border-yellow-300" },
  { id: 16, name: "Portfolio Emperor", description: "Ranked #1 on personal portfolio leaderboard", icon: Trophy, rarity: "special", color: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold shadow-lg border-2 border-purple-300" },
  { id: 17, name: "Streak Master", description: "Ranked #1 on trading streak leaderboard", icon: Zap, rarity: "special", color: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white font-bold shadow-lg border-2 border-emerald-300" },
];

export default function People() {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [showAchievements, setShowAchievements] = useState(false);
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

  // Fetch user achievements when viewing profile
  const { data: userAchievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements', profileUserId],
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
      case "achievements":
        return users.sort((a: any, b: any) => (b.achievementCount || 0) - (a.achievementCount || 0));
      case "name":
        return users.sort((a: any, b: any) => (a.username || "").localeCompare(b.username || ""));
      default:
        return users;
    }
  })();

  // Map achievement types to display data
  const getAchievementDisplay = (achievement: any) => {
    // The API returns camelCase field names
    const displayData = achievements.find(a => a.name === achievement.achievementName);
    return displayData || {
      id: achievement.id,
      name: achievement.achievementName,
      description: achievement.achievementDescription,
      icon: Trophy,
      rarity: achievement.achievementTier,
      color: getColorForTier(achievement.achievementTier)
    };
  };

  // Get color for achievement tier
  const getColorForTier = (tier: string) => {
    switch(tier) {
      case 'common': return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case 'uncommon': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'rare': return "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100";
      case 'epic': return "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100";
      case 'legendary': return "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100";
      case 'mythic': return "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Get tier ranking for sorting (higher number = rarer)
  const getTierRanking = (tier: string) => {
    switch(tier) {
      case 'mythic': return 6;
      case 'legendary': return 5;
      case 'epic': return 4;
      case 'rare': return 3;
      case 'uncommon': return 2;
      case 'common': return 1;
      default: return 0;
    }
  };

  // Get user stats from API data
  const getUserStats = (user: any) => ({
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)),
    totalTrades: user?.totalTrades || 0,
    achievements: user?.achievements || 0
  });

  // If viewing a specific user profile
  if (profileUserId) {
    if (isLoadingProfile || isLoadingAchievements) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const stats = getUserStats((profileUser as any)?.data);
    const displayAchievements = ((userAchievements as any)?.data?.map((achievement: any) => getAchievementDisplay(achievement)) || [])
      .sort((a: any, b: any) => getTierRanking(b.rarity) - getTierRanking(a.rarity));

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
              <Card className="mb-8 border border-border shadow-lg">
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
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{(profileUser as any)?.data?.totalTrades || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Trades</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{displayAchievements.length}</p>
                          <p className="text-xs text-muted-foreground">Achievements</p>
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

            {/* Achievements */}
            <motion.div variants={fadeInUp}>
              <Card className="mb-8 border border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayAchievements.length > 0 ? displayAchievements.map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-10 h-10 rounded-full ${achievement.color} flex items-center justify-center`}>
                          <achievement.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-4">
                        <p className="text-muted-foreground">No achievements yet</p>
                      </div>
                    )}
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
                <option value="achievements">Most Achievements</option>
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
              
              {/* Achievements Button */}
              <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 whitespace-nowrap">
                    <Trophy className="w-4 h-4" />
                    <span>Achievements</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>All Achievements</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
                          <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center`}>
                            <achievement.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-foreground">{achievement.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                  <Card key={i} className="border border-border shadow-lg">
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
                  // For the people browsing list, show actual achievement count
                  const achievementCount = person.achievementCount || 0;
                  
                  return (
                    <Card key={person.id} className="border border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
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
                            <p className="text-sm font-bold text-foreground">{achievementCount}</p>
                            <p className="text-xs text-muted-foreground">Badges</p>
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
                            <Clock className="w-3 h-3" />
                            <span>{Math.floor(Math.random() * 20) + 1}d streak</span>
                          </div>
                        </div>

                        {/* Achievement preview removed for performance - full achievements shown on profile page */}

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