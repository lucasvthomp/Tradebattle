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
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const queryClient = useQueryClient();
  
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
                  <Bell className="w-4 h-4" />
                  <span>Preferences</span>
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
                          placeholder={`${user.firstName} ${user.lastName}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          Your display name as it appears to other users. Leave blank to use your full name.
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
                        {/* Mock achievements - these would come from the database */}
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">First Trade</p>
                            <p className="text-sm text-muted-foreground">Made your first stock purchase</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Premium Member</p>
                            <p className="text-sm text-muted-foreground">Upgraded to premium account</p>
                          </div>
                        </div>
                        <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">More achievements coming soon!</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Profile Visibility</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Show achievements</p>
                            <p className="text-sm text-muted-foreground">Display your trading achievements on public profile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Show join date</p>
                            <p className="text-sm text-muted-foreground">Display when you joined the platform</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Show trading stats</p>
                            <p className="text-sm text-muted-foreground">Display trading performance metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
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
                             user.subscriptionTier === 'premium' ? '$19.99/month' : 'Free'} • 
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
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = "/pricing"}
                      >
                        Change Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to receive updates and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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