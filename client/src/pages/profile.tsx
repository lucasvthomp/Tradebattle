import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  Shield, 
  Download,
  Crown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  Users,
  DollarSign,
  Plus,
  Globe,
  Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PortfolioGraph } from "@/components/ui/portfolio-graph";

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

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  displayName: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t, language, currency, updatePreferences } = useUserPreferences();
  const queryClient = useQueryClient();
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  
  // Fetch user achievements for profile display
  const { data: userAchievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements', user?.id],
    enabled: !!user?.id,
  });

  // Achievement system with proper badge tiers and colors (matching people.tsx)
  const achievements = [
    // Common (Gray)
    { id: 1, name: "Welcome", description: "Welcome to the platform", icon: User, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
    { id: 2, name: "First Trade", description: "Made your first trade", icon: Target, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
    { id: 3, name: "Tournament Participant", description: "Joined a tournament", icon: Users, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
    { id: 4, name: "Learning Experience", description: "Lost money on a trade", icon: TrendingUp, rarity: "common", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
    // Uncommon (Green)
    { id: 5, name: "Profit Maker", description: "Made money on trade (tournament)", icon: DollarSign, rarity: "uncommon", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    { id: 7, name: "5% Portfolio Growth", description: "Made over 5% on any portfolio", icon: TrendingUp, rarity: "uncommon", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    // Rare (Bright Blue)
    { id: 6, name: "Tournament Creator", description: "Created a tournament", icon: Plus, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
    // Epic (Rich Purple)
    { id: 8, name: "Top 3 Finisher", description: "Finished in top 3 position in tournament", icon: Award, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
    { id: 9, name: "Tournament Leader", description: "Reached top 1 position in tournament", icon: Crown, rarity: "epic", color: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100" },
    { id: 10, name: "10% Portfolio Growth", description: "Made over 10% on any portfolio", icon: TrendingUp, rarity: "rare", color: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100" },
    // Legendary (Bright Orange)
    { id: 11, name: "Tournament Champion", description: "Won a tournament", icon: Trophy, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
    { id: 12, name: "25% Portfolio Growth", description: "Made over 25% on any portfolio", icon: TrendingUp, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
    { id: 13, name: "Premium Trader", description: "Premium user", icon: Star, rarity: "legendary", color: "bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-orange-100" },
    // Mythic (Red)
    { id: 14, name: "Tournament Legend", description: "Won 10 tournaments", icon: Trophy, rarity: "mythic", color: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100" },
    { id: 15, name: "100% Portfolio Growth", description: "Made over 100% on any portfolio", icon: TrendingUp, rarity: "mythic", color: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100" },
  ];

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

  const displayAchievements = (userAchievements?.data?.map(getAchievementDisplay) || [])
    .sort((a, b) => getTierRanking(b.rarity) - getTierRanking(a.rarity));
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      displayName: user?.displayName || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        displayName: user.displayName || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("Sending profile update data:", data);
      return await apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: (result) => {
      console.log("Profile update successful:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/public"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changeSubscriptionMutation = useMutation({
    mutationFn: async (newTier: string) => {
      const res = await apiRequest("PUT", "/api/user/subscription", {
        subscriptionTier: newTier
      });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been changed to ${updatedUser.subscriptionTier}.`,
      });
      setIsChangePlanDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  // Format join date
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : "Unknown";

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your public profile and account settings</p>
          </motion.div>

          {/* User Overview Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        <Crown className="w-3 h-3 mr-1" />
                        {user.subscriptionTier ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 'Novice'} Plan
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <Calendar className="w-3 h-3 mr-1" />
                        Member since {joinDate}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">
                    Change Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="public" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="public" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Public Profile</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Subscription</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Languages className="w-4 h-4" />
                  <span>{t('preferences')}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                      This information is visible to other users on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName"
                          {...form.register("displayName")}
                          placeholder={user?.firstName || "Your display name"}
                        />
                        <p className="text-xs text-muted-foreground">
                          Your display name as it appears to other users. Defaults to your first name.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Member Since</Label>
                        <Input 
                          value={joinDate} 
                          className="bg-muted cursor-not-allowed" 
                          disabled 
                        />
                        <p className="text-xs text-muted-foreground">
                          When you joined the platform
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          <Crown className="w-3 h-3 mr-1" />
                          {user.subscriptionTier ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 'Free'} Trader
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your subscription tier is visible to other users
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Trading Achievements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoadingAchievements ? (
                          <div className="col-span-full text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Loading achievements...</p>
                          </div>
                        ) : displayAchievements.length > 0 ? (
                          displayAchievements.map((achievement) => (
                            <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                              <div className={`w-10 h-10 rounded-full ${achievement.color} flex items-center justify-center`}>
                                <achievement.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{achievement.name}</p>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center p-4 border-2 border-dashed border-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">No achievements yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Portfolio Performance</h4>
                      <PortfolioGraph 
                        userId={user.id}
                        portfolioType="personal"
                        title="Your Portfolio Since Account Creation"
                        height={250}
                        showStats={true}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.preventDefault();
                        form.handleSubmit(handleSaveProfile)();
                      }}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Public Profile"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your private account information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="userId">User ID</Label>
                          <Input 
                            id="userId" 
                            value={user.userId !== null ? user.userId : "Not assigned"} 
                            className="bg-muted cursor-not-allowed" 
                            disabled 
                          />
                          <p className="text-xs text-muted-foreground">
                            Your unique account identifier
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            {...form.register("firstName")}
                            placeholder="Enter your first name"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            {...form.register("lastName")}
                            placeholder="Enter your last name"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email" 
                              type="email" 
                              {...form.register("email")}
                              className="pl-10" 
                              placeholder="Enter your email"
                            />
                          </div>
                          {form.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="joinDate">Member Since</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="joinDate" 
                              value={joinDate} 
                              className="pl-10" 
                              disabled 
                            />
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                            {user.subscriptionTier ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 'Novice'} Plan
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user.subscriptionTier === 'novice' ? 'Free' : 
                             user.subscriptionTier === 'premium' ? '$19.99/month' : 
                             user.subscriptionTier === 'administrator' ? 'Administrator' : 'Free'} • 
                             Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Plan Features</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {user.subscriptionTier === 'novice' ? (
                          <>
                            <li>✓ Tournament participation</li>
                            <li>✓ Basic watchlist</li>
                            <li>✓ Email support</li>
                            <li>✓ Competition leaderboards</li>
                          </>
                        ) : user.subscriptionTier === 'premium' ? (
                          <>
                            <li>✓ Everything in Free</li>
                            <li>✓ Personal portfolio trading</li>
                            <li>✓ Advanced analytics</li>
                            <li>✓ Priority support</li>
                            <li>✓ Unlimited watchlist</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Tournament participation</li>
                            <li>✓ Basic watchlist</li>
                            <li>✓ Email support</li>
                            <li>✓ Competition leaderboards</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex space-x-4">
                      <Button variant="outline">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Update Payment Method
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoices
                      </Button>
                      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            Change Plan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Change Your Subscription Plan</DialogTitle>
                            <DialogDescription>
                              Switch between Free and Premium tiers to access different features.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Free Tier */}
                            <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              user?.subscriptionTier === 'free' || user?.subscriptionTier === 'novice' || !user?.subscriptionTier
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">Free Tier</h3>
                                  <p className="text-sm text-muted-foreground">$0/month</p>
                                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <li>• Tournament participation</li>
                                    <li>• Basic watchlist</li>
                                    <li>• Email support</li>
                                    <li>• Competition leaderboards</li>
                                  </ul>
                                </div>
                                <Button 
                                  variant={user?.subscriptionTier === 'free' || user?.subscriptionTier === 'novice' || !user?.subscriptionTier ? "default" : "outline"}
                                  disabled={changeSubscriptionMutation.isPending || user?.subscriptionTier === 'free' || user?.subscriptionTier === 'novice' || !user?.subscriptionTier}
                                  onClick={() => changeSubscriptionMutation.mutate('free')}
                                >
                                  {changeSubscriptionMutation.isPending ? 'Switching...' : 
                                   (user?.subscriptionTier === 'free' || user?.subscriptionTier === 'novice' || !user?.subscriptionTier) ? 'Current' : 'Switch to Free'}
                                </Button>
                              </div>
                            </div>

                            {/* Premium Tier */}
                            <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              user?.subscriptionTier === 'premium'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground flex items-center">
                                    <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                                    Premium Tier
                                  </h3>
                                  <p className="text-sm text-muted-foreground">$19.99/month</p>
                                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <li>• Everything in Free</li>
                                    <li>• Personal portfolio trading</li>
                                    <li>• Advanced analytics</li>
                                    <li>• Priority support</li>
                                    <li>• Unlimited watchlist</li>
                                  </ul>
                                </div>
                                <Button 
                                  variant={user?.subscriptionTier === 'premium' ? "default" : "outline"}
                                  disabled={changeSubscriptionMutation.isPending || user?.subscriptionTier === 'premium'}
                                  onClick={() => changeSubscriptionMutation.mutate('premium')}
                                >
                                  {changeSubscriptionMutation.isPending ? 'Switching...' : 
                                   user?.subscriptionTier === 'premium' ? 'Current' : 'Upgrade to Premium'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>{t('preferences')}</CardTitle>
                    <CardDescription>
                      Manage your language, currency, and notification settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language and Currency Settings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center">
                        <Languages className="w-4 h-4 mr-2" />
                        {t('language')} & {t('currency')}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">{t('language')}</Label>
                          <Select 
                            value={language} 
                            onValueChange={(value) => updatePreferences(value, undefined)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Portuguese">Português</SelectItem>
                              <SelectItem value="Spanish">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currency">{t('currency')}</Label>
                          <Select 
                            value={currency} 
                            onValueChange={(value) => updatePreferences(undefined, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="BRL">BRL (R$)</SelectItem>
                              <SelectItem value="ARS">ARS ($)</SelectItem>
                              <SelectItem value="MXN">MXN ($)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                              <SelectItem value="COP">COP ($)</SelectItem>
                              <SelectItem value="CLP">CLP ($)</SelectItem>
                              <SelectItem value="PEN">PEN (S/)</SelectItem>
                              <SelectItem value="UYU">UYU ($U)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </h4>
                      <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Tournament Updates</h4>
                          <p className="text-sm text-muted-foreground">Get notified about tournament results and new competitions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Market Alerts</h4>
                          <p className="text-sm text-muted-foreground">Important market movements and trading opportunities</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Watchlist Updates</h4>
                          <p className="text-sm text-muted-foreground">Changes to companies in your watchlist</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Marketing Emails</h4>
                          <p className="text-sm text-muted-foreground">Product updates and promotional content</p>
                        </div>
                        <Switch />
                      </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Display Settings</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Dark Mode</h4>
                          <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                        </div>
                        <Switch 
                          checked={theme === "dark"}
                          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Email Frequency</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" defaultChecked />
                          <span className="text-sm text-foreground">Real-time (as they happen)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" />
                          <span className="text-sm text-foreground">Daily digest</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" />
                          <span className="text-sm text-foreground">Weekly summary</span>
                        </label>
                      </div>
                    </div>

                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and privacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Change Password</h4>
                        <div className="space-y-3">
                          <Input type="password" placeholder="Current password" />
                          <Input type="password" placeholder="New password" />
                          <Input type="password" placeholder="Confirm new password" />
                          <Button variant="outline">Update Password</Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-foreground mb-2">Active Sessions</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium text-foreground">Current Session</p>
                              <p className="text-xs text-muted-foreground">Chrome on macOS • New York, NY</p>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-3">
                          Sign Out All Other Sessions
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Account Actions</h4>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            Download Your Data
                          </Button>
                          <Button variant="destructive" className="w-full justify-start">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}