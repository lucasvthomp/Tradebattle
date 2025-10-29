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
  
  // Balance management state
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { t, language, currency, updatePreferences, formatCurrency } = useUserPreferences();
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

  const displayAchievements = ((userAchievements as any)?.data?.map(getAchievementDisplay) || [])
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

  // Balance management mutations
  const addMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest('POST', '/api/balance/add', { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setAddAmount("");
      toast({
        title: "Money Added",
        description: "The amount has been added to your account balance.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Money",
        description: error.message || "An error occurred while adding money to your account.",
        variant: "destructive",
      });
    },
  });

  const withdrawMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest('POST', '/api/balance/withdraw', { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setWithdrawAmount("");
      toast({
        title: "Money Withdrawn",
        description: "The amount has been withdrawn from your account balance.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Withdraw Money",
        description: error.message || "An error occurred while withdrawing money from your account.",
        variant: "destructive",
      });
    },
  });

  // Balance management handlers
  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      addMoneyMutation.mutate(amount);
    }
  };

  const handleWithdrawMoney = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0) {
      withdrawMoneyMutation.mutate(amount);
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

                {/* Balance Management for Testing */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Balance Management (Testing)</span>
                    </CardTitle>
                    <CardDescription>
                      Add or withdraw money from your account balance for testing purposes. This represents real money that can be cashed out.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Balance Display */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Account Balance</p>
                          <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(user?.balance || 0))}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Balance Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Add Money */}
                      <Card className="border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Plus className="w-4 h-4 text-green-600" />
                            <span>Add Money</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="addAmount">Amount to Add</Label>
                            <Input
                              id="addAmount"
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Enter amount..."
                              value={addAmount}
                              onChange={(e) => setAddAmount(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleAddMoney}
                            disabled={!addAmount || parseFloat(addAmount) <= 0 || addMoneyMutation.isPending}
                          >
                            {addMoneyMutation.isPending ? "Adding..." : "Add Money"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Withdraw Money */}
                      <Card className="border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-red-600" />
                            <span>Withdraw Money</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
                            <Input
                              id="withdrawAmount"
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Enter amount..."
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={handleWithdrawMoney}
                            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || withdrawMoneyMutation.isPending}
                          >
                            {withdrawMoneyMutation.isPending ? "Withdrawing..." : "Withdraw Money"}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 dark:text-amber-200">Testing Environment Notice</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            This balance management system is for testing purposes only. In production, money would be processed through secure payment gateways and banking systems.
                          </p>
                        </div>
                      </div>
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