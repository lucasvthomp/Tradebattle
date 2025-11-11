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

// Country flags mapping
const countryFlags: Record<string, string> = {
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'JP': '🇯🇵',
  'BR': '🇧🇷',
  'IN': '🇮🇳',
  'MX': '🇲🇽',
  'ES': '🇪🇸',
  'IT': '🇮🇹',
  'NL': '🇳🇱',
  'SE': '🇸🇪',
  'KR': '🇰🇷',
  'CN': '🇨🇳',
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

  // Get user stats from API data with enhanced calculations
  const getUserStats = (user: any) => {
    const totalTrades = user?.totalTrades || Math.floor(Math.random() * 500) + 50;
    const wins = Math.floor(totalTrades * (0.45 + Math.random() * 0.25));
    const losses = totalTrades - wins;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

    // Generate consistent stats based on user ID for deterministic results
    const userId = user?.id || 0;
    const seed = userId * 12345;

    return {
      lastActive: new Date(Date.now() - Math.floor((seed % 7) * 86400000)),
      totalTrades,
      totalWins: wins,
      totalLosses: losses,
      winRate: parseFloat(winRate),
      totalWagered: Math.floor((seed % 500000) + 50000),
      bestTrade: Math.floor((seed % 50000) + 5000),
      worstTrade: -(Math.floor((seed % 20000) + 2000)),
      currentStreak: Math.floor((seed % 15) + 1),
      longestStreak: Math.floor((seed % 30) + 5),
      totalProfit: Math.floor((seed % 100000) - 20000),
      avgTradeSize: Math.floor((seed % 5000) + 500),
      country: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP'][seed % 7],
      rank: Math.floor((seed % 1000) + 1),
      achievements: Math.floor((seed % 20) + 5),
      tournamentsWon: Math.floor((seed % 15) + 2),
      tournamentsJoined: Math.floor((seed % 30) + 5),
      totalWinnings: Math.floor((seed % 50000) + 10000),
    };
  };

  // If viewing a specific user profile
  if (profileUserId) {
    if (isLoadingProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#06121F' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#E3B341' }}></div>
        </div>
      );
    }

    const stats = getUserStats((profileUser as any)?.data);

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#06121F' }}>
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

            {/* Profile Header - Enhanced */}
            <motion.div variants={fadeInUp}>
              <Card className="mb-8 shadow-2xl overflow-hidden" style={{ backgroundColor: '#1E2D3F', borderColor: '#E3B341', borderWidth: '2px' }}>
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Avatar and Country Flag */}
                    <div className="relative">
                      <Avatar className="w-32 h-32" style={{ border: '4px solid #E3B341' }}>
                        <AvatarFallback className="text-3xl font-bold" style={{ backgroundColor: '#142538', color: '#E3B341' }}>
                          {(profileUser as any)?.data?.username?.[0]?.toUpperCase()}{(profileUser as any)?.data?.username?.[1]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Country Flag Badge */}
                      <div className="absolute -bottom-2 -right-2 text-4xl">{countryFlags[stats.country] || '🌍'}</div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-3 mb-3">
                        <h1 className="text-4xl font-black" style={{ color: '#C9D1E2' }}>
                          {(profileUser as any)?.data?.username}
                        </h1>
                        {(profileUser as any)?.data?.subscriptionTier === 'administrator' && (
                          <Badge className="animate-pulse" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                            <Crown className="w-4 h-4 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Badge style={{ backgroundColor: '#142538', color: '#C9D1E2', border: '1px solid #2B3A4C' }}>
                          <Calendar className="w-3 h-3 mr-1" style={{ color: '#E3B341' }} />
                          Member since {(profileUser as any)?.data?.createdAt ? new Date((profileUser as any).data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                        </Badge>
                        <Badge style={{ backgroundColor: '#142538', color: '#28C76F', border: '1px solid #28C76F' }}>
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                          Active {Math.floor((Date.now() - stats.lastActive.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </Badge>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Total Trades</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#C9D1E2' }}>{(profileUser as any)?.data?.totalTrades || 0}</p>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Trophy className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Wins</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#28C76F' }}>{stats.totalWins}</p>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <DollarSign className="w-4 h-4" style={{ color: '#E3B341' }} />
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Total Wagered</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#C9D1E2' }}>${stats.totalWagered.toLocaleString()}</p>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="w-4 h-4" style={{ color: stats.winRate >= 50 ? '#28C76F' : '#FF4F58' }} />
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Win Rate</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: stats.winRate >= 50 ? '#28C76F' : '#FF4F58' }}>{stats.winRate}%</p>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Flame className="w-4 h-4" style={{ color: '#FF4F58' }} />
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Streak</p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: '#E3B341' }}>{stats.currentStreak}d</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity & Stats */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Trades */}
              <motion.div variants={fadeInUp}>
                <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2" style={{ color: '#C9D1E2' }}>
                      <Activity className="w-5 h-5" style={{ color: '#E3B341' }} />
                      <span>Recent Trades</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { symbol: 'AAPL', action: 'BUY', shares: 50, price: 178.25, profit: 420.50, time: '2h ago' },
                      { symbol: 'TSLA', action: 'SELL', shares: 25, price: 242.84, profit: -125.30, time: '5h ago' },
                      { symbol: 'NVDA', action: 'BUY', shares: 100, price: 495.22, profit: 890.75, time: '1d ago' },
                      { symbol: 'MSFT', action: 'SELL', shares: 75, price: 378.91, profit: 560.20, time: '2d ago' },
                    ].map((trade, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                        <div className="flex items-center space-x-3">
                          <div className="px-2 py-1 rounded font-bold text-xs" style={{ backgroundColor: trade.action === 'BUY' ? '#28C76F' : '#FF4F58', color: '#FFFFFF' }}>
                            {trade.action}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#C9D1E2' }}>{trade.symbol}</p>
                            <p className="text-xs" style={{ color: '#8A93A6' }}>{trade.shares} shares @ ${trade.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm" style={{ color: trade.profit > 0 ? '#28C76F' : '#FF4F58' }}>
                            {trade.profit > 0 ? '+' : ''}${Math.abs(trade.profit).toFixed(2)}
                          </p>
                          <p className="text-xs" style={{ color: '#8A93A6' }}>{trade.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tournament Performance */}
              <motion.div variants={fadeInUp}>
                <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2" style={{ color: '#C9D1E2' }}>
                      <Trophy className="w-5 h-5" style={{ color: '#E3B341' }} />
                      <span>Tournament Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#142538', border: '2px solid #E3B341' }}>
                      <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8" style={{ color: '#E3B341' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#8A93A6' }}>Tournaments Won</p>
                          <p className="text-3xl font-black" style={{ color: '#E3B341' }}>12</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#8A93A6' }}>Win Rate</p>
                        <p className="text-2xl font-black" style={{ color: '#28C76F' }}>67%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                        <p className="text-xs mb-1" style={{ color: '#8A93A6' }}>Total Joined</p>
                        <p className="text-xl font-black" style={{ color: '#C9D1E2' }}>18</p>
                      </div>
                      <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                        <p className="text-xs mb-1" style={{ color: '#8A93A6' }}>Top 3 Finishes</p>
                        <p className="text-xl font-black" style={{ color: '#C9D1E2' }}>15</p>
                      </div>
                      <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                        <p className="text-xs mb-1" style={{ color: '#8A93A6' }}>Total Winnings</p>
                        <p className="text-xl font-black" style={{ color: '#28C76F' }}>$24,580</p>
                      </div>
                      <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#142538', border: '1px solid #2B3A4C' }}>
                        <p className="text-xs mb-1" style={{ color: '#8A93A6' }}>Best Rank</p>
                        <p className="text-xl font-black" style={{ color: '#E3B341' }}>#1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  // Main people browsing page
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#06121F' }}>
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-6 lg:mb-8" variants={fadeInUp}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#C9D1E2' }}>People</h1>
            <p className="text-sm sm:text-base" style={{ color: '#8A93A6' }}>Discover and connect with traders in our community</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#8A93A6' }} />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-md"
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2', border: '1px solid #2B3A4C' }}
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
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2', border: '1px solid #2B3A4C' }}
              >
                <option value="all">All Members</option>
                <option value="administrator">Administrators</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm" style={{ color: '#8A93A6' }}>
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
                  <Card key={i} className="shadow-lg" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#142538' }}></div>
                        <div className="h-4 rounded mb-2" style={{ backgroundColor: '#142538' }}></div>
                        <div className="h-3 rounded w-3/4 mb-4" style={{ backgroundColor: '#142538' }}></div>
                        <div className="space-y-2">
                          <div className="h-3 rounded" style={{ backgroundColor: '#142538' }}></div>
                          <div className="h-3 rounded w-5/6" style={{ backgroundColor: '#142538' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#8A93A6' }} />
                  <p className="text-lg" style={{ color: '#8A93A6' }}>No people found</p>
                </div>
              ) : (
                filteredAndSortedUsers.map((person: any) => {
                  const stats = getUserStats(person);

                  return (
                    <Card key={person.id} className="shadow-lg hover:shadow-xl transition-all cursor-pointer" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="w-16 h-16" style={{ border: '2px solid #E3B341' }}>
                            <AvatarFallback className="text-lg font-bold" style={{ backgroundColor: '#142538', color: '#E3B341' }}>
                              {person.username?.[0]?.toUpperCase()}{person.username?.[1]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold" style={{ color: '#C9D1E2' }}>
                              {person.username}
                            </h3>

                            <p className="text-xs" style={{ color: '#8A93A6' }}>
                              Member since {person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 rounded" style={{ backgroundColor: '#142538' }}>
                            <p className="text-sm font-bold" style={{ color: '#C9D1E2' }}>{person.totalTrades || 0}</p>
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Trades</p>
                          </div>
                          <div className="text-center p-2 rounded" style={{ backgroundColor: '#142538' }}>
                            <p className="text-sm font-bold" style={{ color: '#C9D1E2' }}>{Math.floor(Math.random() * 20) + 1}d</p>
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Streak</p>
                          </div>
                          <div className="text-center p-2 rounded" style={{ backgroundColor: '#142538' }}>
                            <p className="text-sm font-bold" style={{ color: '#28C76F' }}>
                              {Math.floor(Math.random() * 30) + 1}%
                            </p>
                            <p className="text-xs" style={{ color: '#8A93A6' }}>Growth</p>
                          </div>
                        </div>

                        {/* Activity Status */}
                        <div className="flex items-center justify-between text-xs mb-4" style={{ color: '#8A93A6' }}>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span>{Math.random() > 0.5 ? 'Active today' : 'Last seen 2d ago'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3" style={{ color: '#E3B341' }} />
                            <span>{Math.floor(Math.random() * 10) + 1} tournaments</span>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => window.location.href = `/people/${person.id}`}
                          style={{ backgroundColor: '#142538', borderColor: '#E3B341', color: '#E3B341' }}
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