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
      <div className="container mx-auto py-8">
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
            <Card className="mb-8 border-0 shadow-lg relative overflow-hidden" style={{ backgroundColor: '#142538', borderColor: '#E3B341', borderWidth: '2px' }}>
              {/* Decorative gradient background */}
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #E3B341 0%, transparent 100%)' }} />

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden relative"
                    style={{ borderColor: '#E3B341', borderWidth: '3px', borderStyle: 'solid' }}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1E2D3F' }}>
                        <User className="w-10 h-10" style={{ color: '#E3B341' }} />
                      </div>
                    )}
                    {/* Online status indicator */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full" style={{ backgroundColor: '#28C76F', borderColor: '#142538', borderWidth: '2px', borderStyle: 'solid' }} />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>{user.username}</h2>
                      {user?.subscriptionTier === 'administrator' && (
                        <Badge style={{ backgroundColor: '#E3B341', color: '#06121F' }}>
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2" style={{ color: '#8A93A6' }}>{user.email}</p>
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge style={{ backgroundColor: '#28C76F20', color: '#28C76F', borderColor: '#28C76F', borderWidth: '1px' }}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {joinDate}
                      </Badge>
                      <Badge style={{ backgroundColor: '#3B82F620', color: '#3B82F6', borderColor: '#3B82F6', borderWidth: '1px' }}>
                        <Globe className="w-3 h-3 mr-1" />
                        {currency} • {language}
                      </Badge>
                      <Badge style={{ backgroundColor: '#E3B34120', color: '#E3B341', borderColor: '#E3B341', borderWidth: '1px' }}>
                        <Star className="w-3 h-3 mr-1" />
                        Level 1
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('profile-picture-input')?.click()}
                      style={{ borderColor: '#E3B341', color: '#E3B341' }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <Button
                      variant="outline"
                      style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Public Profile
                    </Button>
                  </div>
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
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Account</span>
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

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Member Since */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#142538', borderColor: '#E3B341', borderWidth: '2px' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Calendar className="w-5 h-5" style={{ color: '#E3B341' }} />
                          <Badge style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}>Active</Badge>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#8A93A6' }}>Member Since</p>
                        <p className="text-xl font-bold mt-1" style={{ color: '#C9D1E2' }}>
                          {joinDate}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Total Wagered */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-0 shadow-lg relative overflow-hidden" style={{ backgroundColor: '#142538', borderColor: '#E3B341', borderWidth: '2px' }}>
                      <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #E3B341 0%, transparent 100%)' }} />
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="w-5 h-5" style={{ color: '#E3B341' }} />
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <TrendingUp className="w-4 h-4" style={{ color: '#28C76F' }} />
                          </motion.div>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#8A93A6' }}>Total Wagered</p>
                        <p className="text-xl font-bold mt-1" style={{ color: '#E3B341' }}>
                          {formatCurrency(0)} {/* TODO: Connect to actual data */}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Tournament Wins */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-0 shadow-lg relative overflow-hidden" style={{ backgroundColor: '#142538', borderColor: '#28C76F', borderWidth: '2px' }}>
                      <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #28C76F 0%, transparent 100%)' }} />
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <Trophy className="w-5 h-5" style={{ color: '#E3B341' }} />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Crown className="w-4 h-4" style={{ color: '#E3B341' }} />
                          </motion.div>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#8A93A6' }}>Tournament Wins</p>
                        <p className="text-xl font-bold mt-1" style={{ color: '#28C76F' }}>
                          0 {/* TODO: Connect to actual data */}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Total Trades */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#142538', borderColor: '#3B82F6', borderWidth: '2px' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-5 h-5" style={{ color: '#3B82F6' }} />
                          <Badge style={{ backgroundColor: '#3B82F620', color: '#3B82F6', borderColor: '#3B82F6', borderWidth: '1px' }}>
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#8A93A6' }}>Total Trades</p>
                        <p className="text-xl font-bold mt-1" style={{ color: '#C9D1E2' }}>
                          0 {/* TODO: Connect to actual data */}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Activity Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-0 shadow-lg" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C', borderWidth: '2px' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2" style={{ color: '#C9D1E2' }}>
                            <TrendingUp className="w-5 h-5" style={{ color: '#E3B341' }} />
                            <span>Recent Trades</span>
                          </CardTitle>
                          <CardDescription style={{ color: '#8A93A6' }}>
                            Your latest trading activity
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" style={{ borderColor: '#E3B341', color: '#E3B341' }}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Empty state for now */}
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#8A93A6' }} />
                          <p className="text-sm font-medium" style={{ color: '#8A93A6' }}>No recent trades</p>
                          <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>
                            Start trading to see your activity here
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Achievements Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-0 shadow-lg" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C', borderWidth: '2px' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2" style={{ color: '#C9D1E2' }}>
                        <Award className="w-5 h-5" style={{ color: '#E3B341' }} />
                        <span>Achievements</span>
                      </CardTitle>
                      <CardDescription style={{ color: '#8A93A6' }}>
                        Unlock badges and rewards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* First Trade Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-3 rounded-lg text-center cursor-pointer"
                          style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8A93A620' }}>
                            <Target className="w-6 h-6" style={{ color: '#8A93A6' }} />
                          </div>
                          <p className="text-xs font-medium" style={{ color: '#8A93A6' }}>First Trade</p>
                        </motion.div>

                        {/* First Win Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-3 rounded-lg text-center cursor-pointer"
                          style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8A93A620' }}>
                            <Trophy className="w-6 h-6" style={{ color: '#8A93A6' }} />
                          </div>
                          <p className="text-xs font-medium" style={{ color: '#8A93A6' }}>First Win</p>
                        </motion.div>

                        {/* High Roller Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-3 rounded-lg text-center cursor-pointer"
                          style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8A93A620' }}>
                            <DollarSign className="w-6 h-6" style={{ color: '#8A93A6' }} />
                          </div>
                          <p className="text-xs font-medium" style={{ color: '#8A93A6' }}>High Roller</p>
                        </motion.div>

                        {/* Social Trader Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-3 rounded-lg text-center cursor-pointer"
                          style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8A93A620' }}>
                            <Users className="w-6 h-6" style={{ color: '#8A93A6' }} />
                          </div>
                          <p className="text-xs font-medium" style={{ color: '#8A93A6' }}>Social Trader</p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                {/* Profile Picture Upload */}
                <ProfilePictureUpload />
                
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account information and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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