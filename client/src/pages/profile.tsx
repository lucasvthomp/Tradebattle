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
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-black mb-2">My ORSATH</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </motion.div>

          {/* User Overview Card */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black">{user.firstName} {user.lastName}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Crown className="w-3 h-3 mr-1" />
                        {user.subscriptionTier ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 'Novice'} Plan
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
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
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Subscription</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="userId">User ID</Label>
                          <Input 
                            id="userId" 
                            value={user.id} 
                            className="bg-gray-50 cursor-not-allowed" 
                            disabled 
                          />
                          <p className="text-xs text-gray-500">
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
                            <p className="text-sm text-red-600">
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
                            <p className="text-sm text-red-600">
                              {form.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              id="email" 
                              type="email" 
                              {...form.register("email")}
                              className="pl-10" 
                              placeholder="Enter your email"
                            />
                          </div>
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-600">
                              {form.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="joinDate">Member Since</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      Manage your ORSATH subscription and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-black flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-blue-600" />
                            {user.subscriptionTier ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 'Novice'} Plan
                          </h3>
                          <p className="text-sm text-gray-600">
                            {user.subscriptionTier === 'novice' ? 'Free' : 
                             user.subscriptionTier === 'explorer' ? '$9.99/month' :
                             user.subscriptionTier === 'analyst' ? '$19.99/month' :
                             user.subscriptionTier === 'professional' ? '$49.99/month' : 'Free'} • 
                             Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-black">Plan Features</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {user.subscriptionTier === 'novice' ? (
                          <>
                            <li>✓ Limited watchlist (5 equities)</li>
                            <li>✓ Limited news access</li>
                            <li>✓ Email support</li>
                            <li>✓ Basic market insights</li>
                          </>
                        ) : user.subscriptionTier === 'explorer' ? (
                          <>
                            <li>✓ Access to 50+ research studies monthly</li>
                            <li>✓ Basic market news and insights</li>
                            <li>✓ Email support</li>
                            <li>✓ Basic portfolio tracking</li>
                            <li>✓ Weekend market analysis</li>
                          </>
                        ) : user.subscriptionTier === 'analyst' ? (
                          <>
                            <li>✓ Everything in Explorer</li>
                            <li>✓ Unlimited research studies access</li>
                            <li>✓ Priority breaking news alerts</li>
                            <li>✓ Advanced portfolio analytics</li>
                            <li>✓ Instant email news alerts</li>
                            <li>✓ Weekend support</li>
                          </>
                        ) : user.subscriptionTier === 'professional' ? (
                          <>
                            <li>✓ Everything in Analyst</li>
                            <li>✓ Custom case studies</li>
                            <li>✓ Priority support</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Limited watchlist (5 equities)</li>
                            <li>✓ Limited news access</li>
                            <li>✓ Email support</li>
                            <li>✓ Basic market insights</li>
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
                          <h4 className="font-medium text-black">Breaking News Alerts</h4>
                          <p className="text-sm text-gray-600">Get notified about urgent market developments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">Research Reports</h4>
                          <p className="text-sm text-gray-600">Weekly digest of new research studies</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">Watchlist Updates</h4>
                          <p className="text-sm text-gray-600">Changes to companies in your watchlist</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">Marketing Emails</h4>
                          <p className="text-sm text-gray-600">Product updates and promotional content</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-black">Display Settings</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">Dark Mode</h4>
                          <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                        </div>
                        <Switch 
                          checked={theme === "dark"}
                          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-black">Email Frequency</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" defaultChecked />
                          <span className="text-sm">Real-time (as they happen)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" />
                          <span className="text-sm">Daily digest</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="frequency" />
                          <span className="text-sm">Weekly summary</span>
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
                        <h4 className="font-medium text-black mb-2">Change Password</h4>
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
                          <h4 className="font-medium text-black">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-black mb-2">Active Sessions</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">Current Session</p>
                              <p className="text-xs text-gray-600">Chrome on macOS • New York, NY</p>
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
                        <h4 className="font-medium text-black">Account Actions</h4>
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