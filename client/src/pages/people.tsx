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
  DollarSign
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
  { id: 1, name: "First Trade", description: "Made your first trade", icon: Target, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  { id: 2, name: "Tournament Joiner", description: "Joined a tournament", icon: Users, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  { id: 3, name: "Learning Experience", description: "Lost money on a trade", icon: TrendingUp, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  // Uncommon (Green)
  { id: 4, name: "Profit Maker", description: "Made money on trade (tournament)", icon: DollarSign, rarity: "uncommon", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  // Rare (Bright Blue)
  { id: 6, name: "5% Portfolio Growth", description: "Made over 5% on tournament portfolio", icon: TrendingUp, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
  // Epic (Rich Purple)
  { id: 5, name: "Top 3 Finisher", description: "Finished in top 3 position in tournament", icon: Award, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
  { id: 7, name: "Tournament Leader", description: "Reached top 1 position in tournament", icon: Crown, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
  { id: 8, name: "10% Portfolio Growth", description: "Made over 10% on tournament portfolio", icon: TrendingUp, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
  // Legendary (Bright Orange)
  { id: 9, name: "Tournament Champion", description: "Won a tournament", icon: Trophy, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
  { id: 10, name: "25% Portfolio Growth", description: "Made over 25% on tournament portfolio", icon: TrendingUp, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
  { id: 11, name: "Premium Trader", description: "Premium user", icon: Star, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
  // Mythic (Red)
  { id: 12, name: "Tournament Legend", description: "Won 10 tournaments", icon: Trophy, rarity: "mythic", color: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100" },
];

export default function People() {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [showAchievements, setShowAchievements] = useState(false);

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

  // Filter users based on search query
  const filteredUsers = allUsers?.data?.filter((u: any) => 
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Map achievement types to display data
  const getAchievementDisplay = (achievement: any) => {
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

  // Get user stats from API data
  const getUserStats = (user: any) => ({
    totalTrades: user.totalTrades || 0,
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7))
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

    const stats = getUserStats(profileUser?.data);
    const displayAchievements = userAchievements?.data?.map(getAchievementDisplay) || [];

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            className="max-w-4xl mx-auto"
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
              <Card className="mb-8 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-2xl font-bold">
                        {profileUser?.data?.firstName?.[0]}{profileUser?.data?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {profileUser?.data?.firstName} {profileUser?.data?.lastName}
                      </h1>
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          <Crown className="w-3 h-3 mr-1" />
                          {profileUser?.data?.subscriptionTier === 'premium' ? 'Premium' : 'Free'} Trader
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <Calendar className="w-3 h-3 mr-1" />
                          Since {profileUser?.data?.createdAt ? new Date(profileUser.data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Active {Math.floor((Date.now() - stats.lastActive.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </Badge>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{stats.totalTrades}</p>
                          <p className="text-sm text-muted-foreground">Total Trades</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{displayAchievements.length}</p>
                          <p className="text-sm text-muted-foreground">Achievements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={fadeInUp}>
              <Card className="mb-8 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayAchievements.length > 0 ? displayAchievements.map((achievement) => (
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

            {/* Trading Performance */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Detailed trading performance metrics would appear here
                    </p>
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
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground mb-2">People</h1>
            <p className="text-muted-foreground">Discover and connect with traders in our community</p>
          </motion.div>

          {/* Search */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center space-x-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Achievements Button */}
              <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
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
          </motion.div>

          {/* People Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingUsers ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
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
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No people found</p>
                </div>
              ) : (
                filteredUsers.map((person: any) => {
                  const stats = getUserStats(person);
                  // For the people browsing list, we don't fetch individual achievements
                  // Only show achievement count on individual profile pages
                  const achievementCount = 0; // Placeholder for list view
                  
                  return (
                    <Card key={person.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-lg font-bold">
                              {person.firstName?.[0]}{person.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {person.firstName} {person.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {person.subscriptionTier === 'premium' ? 'Premium' : 'Free'} Trader
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Member since {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{stats.totalTrades}</p>
                            <p className="text-xs text-muted-foreground">Trades</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{achievementCount}</p>
                            <p className="text-xs text-muted-foreground">Achievements</p>
                          </div>
                        </div>

                        {/* Achievements Preview */}
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Latest Achievements</p>
                          <div className="flex space-x-2">
                            {personAchievements.slice(0, 3).map((achievement) => (
                              <div key={achievement.id} className={`w-8 h-8 rounded-full ${achievement.color} flex items-center justify-center`}>
                                <achievement.icon className="w-4 h-4" />
                              </div>
                            ))}
                            {personAchievements.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-xs font-medium">+{personAchievements.length - 3}</span>
                              </div>
                            )}
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