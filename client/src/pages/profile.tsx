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

function TransactionHistory({ userId, formatCurrency }: { userId: number; formatCurrency: (n: number) => string }) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/user/transactions'],
    queryFn: async () => {
      const res = await fetch('/api/user/transactions', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  const txns = Array.isArray(transactions) ? transactions : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {txns.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.action?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                  <p className="text-xs text-muted-foreground">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: tx.newValue > tx.oldValue ? '#10B981' : '#EF4444' }}>
                    {tx.newValue > tx.oldValue ? '+' : ''}{formatCurrency(Number(tx.newValue) - Number(tx.oldValue))}
                  </p>
                  <p className="text-xs text-muted-foreground">Balance: {formatCurrency(Number(tx.newValue))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

function ChangePasswordSection() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('POST', '/api/auth/change-password', data);
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to change password", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div>
      <h4 className="font-medium text-foreground mb-2">Change Password</h4>
      <div className="space-y-3">
        <Input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
        <Input type="password" placeholder="New password (min 6 chars, 1 uppercase, 1 number)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
        >
          {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}

function TwoFactorSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  // 2FA is currently disabled system-wide
  const twoFactorDisabled = true;

  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/2fa/setup');
      return await res.json();
    },
    onSuccess: (data) => {
      setSetupData(data);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/auth/2fa/verify', { code });
    },
    onSuccess: () => {
      setSetupData(null);
      setVerifyCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "2FA Enabled", description: "Two-factor authentication is now active on your account." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid code", variant: "destructive" });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/auth/2fa/disable', { code });
    },
    onSuccess: () => {
      setShowDisable(false);
      setDisableCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been removed." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid code", variant: "destructive" });
    },
  });

  if (user?.twoFactorEnabled) {
    return (
      <div className="space-y-3">
        {twoFactorDisabled && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#94A3B820', border: '1px solid #94A3B840' }}>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              ⓘ Two-factor authentication is currently disabled system-wide for maintenance
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
            <p className="text-sm" style={{ color: '#10B981' }}>2FA is enabled on your account</p>
          </div>
          <Button variant="outline" onClick={() => setShowDisable(!showDisable)}>
            Disable 2FA
          </Button>
        </div>
        {showDisable && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">Enter your authenticator code to disable 2FA:</p>
            <div className="flex gap-2">
              <Input
                placeholder="6-digit code"
                value={disableCode}
                onChange={e => setDisableCode(e.target.value)}
                maxLength={6}
              />
              <Button
                onClick={() => disableMutation.mutate(disableCode)}
                disabled={disableCode.length !== 6 || disableMutation.isPending}
                variant="destructive"
              >
                {disableMutation.isPending ? "..." : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {twoFactorDisabled && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#94A3B820', border: '1px solid #94A3B840' }}>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            ⓘ Two-factor authentication is currently disabled system-wide for maintenance
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
        {!setupData && (
          <Button variant="outline" onClick={() => setupMutation.mutate()} disabled={twoFactorDisabled || setupMutation.isPending}>
            {setupMutation.isPending ? "Setting up..." : "Enable 2FA"}
          </Button>
        )}
      </div>
      {setupData && (
        <div className="mt-4 space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <div>
            <h5 className="font-medium text-foreground mb-2">Step 1: Scan QR Code</h5>
            <p className="text-sm text-muted-foreground mb-3">
              Scan this code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.otpauthUrl)}`}
                alt="2FA QR Code"
                width={200}
                height={200}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Or enter this key manually: <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: '#1F2937', color: '#E3B341' }}>{setupData.secret}</code>
            </p>
          </div>
          <div>
            <h5 className="font-medium text-foreground mb-2">Step 2: Enter Verification Code</h5>
            <div className="flex gap-2">
              <Input
                placeholder="6-digit code from your app"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                maxLength={6}
              />
              <Button
                onClick={() => verifyMutation.mutate(verifyCode)}
                disabled={verifyCode.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      const response = await apiRequest("PATCH", "/api/profile/picture", { profilePicture: base64Image });
      const result = await response.json();

      // Update the user data in the cache immediately with the full user object
      if (result.user) {
        // Force update the cache with the new user data
        queryClient.setQueryData(["/api/user"], result.user);

        // Also refetch to ensure consistency
        queryClient.refetchQueries({ queryKey: ["/api/user"] });
      }

      // Clear preview and file state
      setProfilePicturePreview(null);
      setProfilePictureFile(null);

      // Invalidate other queries that show profile picture
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
      // Clear preview on error too
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
    }
  };

  // Balance management mutations
  const addMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest('POST', '/api/balance/deposit', { amount });
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
          </motion.div>

          {/* User Overview Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-8 shadow-lg" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden relative"
                    style={{ border: '2px solid #1F2937' }}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '0.75rem'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
                        <User className="w-10 h-10" style={{ color: '#E3B341' }} />
                      </div>
                    )}
                    {/* Online status indicator - positioned at perfect square corner */}
                    <div
                      className="absolute w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: '#10B981',
                        borderColor: '#0F172A',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        bottom: '0',
                        right: '0'
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>{user.username}</h2>
                      {user?.subscriptionTier === 'administrator' && (
                        <span
                          className="text-sm font-semibold px-0"
                          style={{
                            background: 'linear-gradient(90deg, #FF6B35, #F7931E, #FDC830, #F37335, #FF6B35)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'gradientShift 3s ease infinite'
                          }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>{user.email}</p>
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {joinDate}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {currency} • {language}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('profile-picture-input')?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
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
            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 gap-1">
                <TabsTrigger value="transactions" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Transactions</span>
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

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                <TransactionHistory userId={user.id} formatCurrency={formatCurrency} />
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
                          <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(user?.siteCash || 0))}</p>
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
                      {/* Email Verification Status */}
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: user?.emailVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${user?.emailVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5" style={{ color: user?.emailVerified ? '#10B981' : '#EF4444' }} />
                          <div>
                            <h4 className="font-medium text-foreground">Email Verification</h4>
                            <p className="text-sm text-muted-foreground">
                              {user?.emailVerified ? 'Your email is verified' : 'Please verify your email to access all features'}
                            </p>
                          </div>
                        </div>
                        {!user?.emailVerified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiRequest('POST', '/api/auth/resend-verification');
                                toast({ title: 'Verification email sent', description: 'Check your inbox for the verification link.' });
                              } catch (err: any) {
                                toast({ title: 'Error', description: err.message, variant: 'destructive' });
                              }
                            }}
                          >
                            Resend Verification
                          </Button>
                        )}
                      </div>

                      <Separator />

                      <ChangePasswordSection />

                      <Separator />

                      <TwoFactorSection user={user} />

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