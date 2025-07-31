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
  Languages,
  Upload,
  Camera
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
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";

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
  email: z.string().email("Invalid email address"),

  username: z.string().min(3, "Username must be at least 3 characters").max(15, "Username must be at most 15 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  

  const { t, language, currency, updatePreferences } = useUserPreferences();
  const queryClient = useQueryClient();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  
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

  const displayAchievements = (userAchievements ? userAchievements.map(getAchievementDisplay) : [])
    .sort((a: any, b: any) => getTierRanking(b.rarity) - getTierRanking(a.rarity));
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",

      username: user?.username || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",

        username: user.username || "",
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
    onError: (error: any) => {
      console.error("Profile update error:", error);
      let errorMessage = "An error occurred while updating your profile";
      
      // Handle specific error cases
      if (error.message) {
        if (error.message.includes("Username can only be changed once every two weeks")) {
          errorMessage = "Username can only be changed once every two weeks. Please try again later.";
        } else if (error.message.includes("Username")) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });



  const handleSaveProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicturePreview(result);
        uploadProfilePicture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (base64Image: string) => {
    try {
      const result = await apiRequest("PATCH", "/api/profile/picture", { profilePicture: base64Image });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/public"] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
    }
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
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <Calendar className="w-3 h-3 mr-1" />
                        Member since {joinDate}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => document.getElementById('profile-picture-input')?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="public" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="public" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Public Profile</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
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
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username"
                          {...form.register("username")}
                          placeholder={user?.username}
                        />
                        <p className="text-xs text-muted-foreground">
                          Username can only be changed once every 2 weeks. Contains only letters, numbers, and underscores.
                        </p>
                        {form.formState.errors.username && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.username.message}
                          </p>
                        )}
                      </div>
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
                          displayAchievements.map((achievement: any) => (
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

              <TabsContent value="account" className="space-y-6">
                {/* Profile Picture Upload */}
                <ProfilePictureUpload />
                
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