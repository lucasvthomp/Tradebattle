import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Users, 
  Crown, 
  Calendar, 
  Mail,
  AlertCircle,
  Settings,
  Trash2,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  Server,
  Activity,
  Globe,
  Database,
  Clock,
  AlertTriangle,
  Trophy,
  GamepadIcon
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteState, setDeleteState] = useState<{
    userEmail: string | null;
    step: 'first' | 'second' | null;
  }>({
    userEmail: null,
    step: null,
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminLogsOpen, setAdminLogsOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [endTournamentOpen, setEndTournamentOpen] = useState(false);

  // Check if user is admin (based on userId)
  const isAdmin = user?.userId === 0 || user?.userId === 1 || user?.userId === 2;

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [user, isAdmin, authLoading, toast, setLocation]);

  // Fetch all users (only if admin)
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Fetch admin logs for selected user
  const { data: adminLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs", selectedUser?.id],
    enabled: isAdmin && !!selectedUser?.id,
  });

  // Fetch system status
  const { data: systemStatus, isLoading: systemLoading } = useQuery({
    queryKey: ["/api/system/status"],
    enabled: isAdmin,
    refetchInterval: 15000, // Refresh every 15 seconds to show Yahoo Finance updates
  });

  // Fetch all tournaments
  const { data: tournamentData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/admin/tournaments"],
    enabled: isAdmin,
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Extract tournaments from the response data
  const allTournaments = tournamentData?.data || [];

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("DELETE", `/api/admin/users/${email}`);
    },
    onSuccess: (_, deletedEmail) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteState({ userEmail: null, step: null });
      toast({
        title: "User deleted",
        description: `User ${deletedEmail} has been successfully deleted.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, subscriptionTier }: { userId: number; subscriptionTier: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/subscription`, {
        subscriptionTier,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserOpen(false);
      toast({
        title: "User updated",
        description: "User premium status has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteState.userEmail) {
      deleteMutation.mutate(deleteState.userEmail);
    }
  };

  // Handle delete initiation
  const handleDeleteUser = (email: string) => {
    setDeleteState({ userEmail: email, step: 'first' });
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  // Handle view logs
  const handleViewLogs = (user: any) => {
    setSelectedUser(user);
    setAdminLogsOpen(true);
  };

  // Handle tournament actions
  const handleViewTournamentDetails = (tournament: any) => {
    const timeLeft = new Date(tournament.endsAt).getTime() - new Date().getTime();
    const isActive = timeLeft > 0;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    const timeDisplay = isActive 
      ? `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes}m remaining`
      : 'Tournament ended';
    
    toast({
      title: `Tournament: ${tournament.name}`,
      description: `Code: ${tournament.code} | ${tournament.memberCount} participants | ${timeDisplay} | Starting Balance: $${tournament.startingBalance}`,
      duration: 5000,
    });
  };

  const handleViewTournamentParticipants = async (tournament: any) => {
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/participants`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        const participantNames = data.data.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ');
        toast({
          title: `${tournament.name} Participants (${tournament.memberCount})`,
          description: participantNames || 'No participants yet',
          duration: 8000,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load participants",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      });
    }
  };

  const handleEndTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setEndTournamentOpen(true);
  };

  const confirmEndTournament = async () => {
    if (!selectedTournament) return;
    
    try {
      const response = await apiRequest(`/api/admin/tournaments/${selectedTournament.id}/end`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.success) {
        toast({
          title: "Tournament Ended",
          description: response.message,
          variant: "default",
        });
        
        // Refresh the tournaments list
        queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
        setEndTournamentOpen(false);
        setSelectedTournament(null);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to end tournament",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end tournament",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (authLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // Don't render anything if not admin (redirect will happen in useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive user management and system administration</p>
        </motion.div>

        {/* Admin Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="tournaments">Tournament Management</TabsTrigger>
              <TabsTrigger value="system">System Status</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                    <p className="text-xs text-gray-500">Registered accounts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                    <Crown className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allUsers?.filter(u => u.userId === 0 || u.userId === 1 || u.userId === 2).length || 0}
                    </div>
                    <p className="text-xs text-gray-500">System administrators</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                    <Activity className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allUsers?.filter(u => u.subscriptionTier === 'premium').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Premium subscribers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allUsers?.filter(u => u.subscriptionTier !== 'premium').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Free plan users</p>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 dark:bg-gray-800 font-semibold">
                        <div>User ID</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Premium</div>
                        <div>Created</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      <div className="divide-y">
                        {allUsers?.map((user) => (
                          <div key={user.id} className="grid grid-cols-7 gap-4 p-4 items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant={user.userId === 0 || user.userId === 1 || user.userId === 2 ? "default" : "secondary"}>
                                {user.userId === 0 || user.userId === 1 || user.userId === 2 ? (
                                  <Crown className="h-3 w-3 mr-1" />
                                ) : (
                                  <Users className="h-3 w-3 mr-1" />
                                )}
                                {user.userId}
                              </Badge>
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                            </div>
                            <div className="text-sm text-gray-500" title={user.email}>
                              {user.email.length > 8 ? `${user.email.substring(0, 8)}...` : user.email}
                            </div>
                            <div>
                              <Badge variant="outline" className={user.subscriptionTier === 'premium' ? "text-yellow-600" : "text-gray-600"}>
                                {user.subscriptionTier === 'premium' ? 'Premium' : 'Free'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </div>
                            <div>
                              <Badge variant="outline" className="text-green-600">
                                Active
                              </Badge>
                            </div>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewLogs(user)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Logs
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user.email)}
                                    disabled={user.userId === 0 || user.userId === 1 || user.userId === 2}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments" className="space-y-6">
              {/* Tournament Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                    <Trophy className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allTournaments?.length || 0}</div>
                    <p className="text-xs text-gray-500">Active competitions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                    <GamepadIcon className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allTournaments?.reduce((total, tournament) => total + tournament.memberCount, 0) || 0}
                    </div>
                    <p className="text-xs text-gray-500">Tournament participants</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Players</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allTournaments?.length ? Math.round((allTournaments?.reduce((total, tournament) => total + tournament.memberCount, 0) || 0) / allTournaments.length) : 0}
                    </div>
                    <p className="text-xs text-gray-500">Players per tournament</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                    <Activity className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allTournaments?.filter(t => new Date(t.endsAt) > new Date()).length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Still running</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tournaments Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tournament Management
                  </CardTitle>
                  <CardDescription>
                    Manage active tournaments and competitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tournamentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading tournaments...</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 dark:bg-gray-800 font-semibold">
                          <div>Tournament ID</div>
                          <div>Name</div>
                          <div>Members</div>
                          <div>Time Left</div>
                          <div>Status</div>
                          <div>Actions</div>
                        </div>
                        <div className="divide-y">
                          {allTournaments?.map((tournament) => {
                            const timeLeft = new Date(tournament.endsAt).getTime() - new Date().getTime();
                            const isActive = timeLeft > 0;
                            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            
                            return (
                              <div key={tournament.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    {tournament.id}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="font-medium">{tournament.name}</div>
                                  <div className="text-sm text-gray-500">Code: {tournament.code}</div>
                                </div>
                                <div>
                                  <Badge variant="outline" className="text-blue-600">
                                    <Users className="h-3 w-3 mr-1" />
                                    {tournament.memberCount}
                                  </Badge>
                                </div>
                                <div>
                                  {isActive ? (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {days > 0 ? `${days}d ` : ''}
                                        {hours > 0 ? `${hours}h ` : ''}
                                        {minutes}m
                                      </div>
                                      <div className="text-gray-500">remaining</div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      <div className="font-medium">Ended</div>
                                      <div>{new Date(tournament.endsAt).toLocaleDateString()}</div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Badge variant="outline" className={isActive ? "text-green-600" : "text-red-600"}>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {isActive ? 'Active' : 'Ended'}
                                  </Badge>
                                </div>
                                <div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewTournamentDetails(tournament)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleViewTournamentParticipants(tournament)}>
                                        <Users className="h-4 w-4 mr-2" />
                                        View Participants
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleEndTournament(tournament)}
                                        className="text-red-600 hover:text-red-700"
                                        disabled={!isActive}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        End Tournament
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Monitor system health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading system status...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Database</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Status</span>
                            <Badge variant="outline" className={systemStatus?.database?.connected ? "text-green-600" : "text-red-600"}>
                              <Database className="h-3 w-3 mr-1" />
                              {systemStatus?.database?.connected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Type</span>
                            <Badge variant="outline">{systemStatus?.database?.type || "PostgreSQL"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tables</span>
                            <Badge variant="outline">{systemStatus?.database?.tableCount || "0"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Connections</span>
                            <Badge variant="outline">{systemStatus?.database?.activeConnections || "0"}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">API Services</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Yahoo Finance</span>
                            <Badge variant="outline" className={systemStatus?.apis?.yahooFinance?.status ? "text-green-600" : "text-red-600"}>
                              <Globe className="h-3 w-3 mr-1" />
                              {systemStatus?.apis?.yahooFinance?.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Finnhub</span>
                            <Badge variant="outline" className={systemStatus?.apis?.finnhub?.status ? "text-green-600" : systemStatus?.apis?.finnhub?.keyExists ? "text-yellow-600" : "text-gray-600"}>
                              <Globe className="h-3 w-3 mr-1" />
                              {systemStatus?.apis?.finnhub?.status ? "Active" : systemStatus?.apis?.finnhub?.keyExists ? "Key Found" : "No Key"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Twelve Data</span>
                            <Badge variant="outline" className={systemStatus?.apis?.twelveData?.status ? "text-green-600" : systemStatus?.apis?.twelveData?.keyExists ? "text-yellow-600" : "text-gray-600"}>
                              <Globe className="h-3 w-3 mr-1" />
                              {systemStatus?.apis?.twelveData?.status ? "Active" : systemStatus?.apis?.twelveData?.keyExists ? "Key Found" : "No Key"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Polygon</span>
                            <Badge variant="outline" className={systemStatus?.apis?.polygon?.status ? "text-green-600" : systemStatus?.apis?.polygon?.keyExists ? "text-yellow-600" : "text-gray-600"}>
                              <Globe className="h-3 w-3 mr-1" />
                              {systemStatus?.apis?.polygon?.status ? "Active" : systemStatus?.apis?.polygon?.keyExists ? "Key Found" : "No Key"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cache</span>
                            <Badge variant="outline" className={systemStatus?.apis?.cache?.enabled ? "text-green-600" : "text-red-600"}>
                              <Settings className="h-3 w-3 mr-1" />
                              {systemStatus?.apis?.cache?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Users</span>
                            <Badge variant="outline" className="text-blue-600">
                              <Users className="h-3 w-3 mr-1" />
                              {systemStatus?.system?.activeUsers || "0"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">System Health</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Uptime</span>
                            <Badge variant="outline" className="text-green-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {systemStatus?.system?.uptime || "0m"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Error Rate</span>
                            <Badge variant="outline" className={systemStatus?.system?.errorRate > 5 ? "text-red-600" : "text-green-600"}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {systemStatus?.system?.errorRate || "0"}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Response Time</span>
                            <Badge variant="outline" className={systemStatus?.system?.avgResponseTime > 1000 ? "text-red-600" : "text-green-600"}>
                              <Activity className="h-3 w-3 mr-1" />
                              {systemStatus?.system?.avgResponseTime || "0"}ms
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Requests</span>
                            <Badge variant="outline" className="text-blue-600">
                              <Activity className="h-3 w-3 mr-1" />
                              {systemStatus?.system?.totalRequests || "0"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IT Administration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    IT Administration
                  </CardTitle>
                  <CardDescription>
                    System configuration and administrative tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="h-4 w-4 mr-2" />
                          Database Backup
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          System Restart
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Monitoring</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          View Logs
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Error Reports
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          Performance Metrics
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user premium status and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User</label>
                <p className="text-sm text-gray-600">
                  {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Premium Status</label>
                <Select
                  defaultValue={selectedUser?.subscriptionTier}
                  onValueChange={(value) => {
                    if (selectedUser) {
                      editUserMutation.mutate({
                        userId: selectedUser.id,
                        subscriptionTier: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Account</SelectItem>
                    <SelectItem value="premium">Premium Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Admin Logs Dialog */}
        <Dialog open={adminLogsOpen} onOpenChange={setAdminLogsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Admin Logs</DialogTitle>
              <DialogDescription>
                Administrative actions for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : adminLogs?.length ? (
                <div className="space-y-2">
                  {adminLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No admin logs found for this user
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* End Tournament Confirmation Dialog */}
        <AlertDialog open={endTournamentOpen} onOpenChange={setEndTournamentOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Tournament Early?</AlertDialogTitle>
              <AlertDialogDescription>
                This will immediately end the tournament <strong>"{selectedTournament?.name}"</strong> and mark it as completed.
                All participants will be notified and the tournament will be finalized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEndTournamentOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmEndTournament}>
                End Tournament
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteState.step === 'first'} onOpenChange={(open) => {
          if (!open) setDeleteState({ userEmail: null, step: null });
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for{' '}
                <strong>{deleteState.userEmail}</strong> and remove all their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => setDeleteState({ ...deleteState, step: 'second' })}
                className="bg-red-600 hover:bg-red-700"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Second Confirmation Dialog */}
        <AlertDialog open={deleteState.step === 'second'} onOpenChange={(open) => {
          if (!open) setDeleteState({ userEmail: null, step: null });
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently delete the user account for{' '}
                <strong>{deleteState.userEmail}</strong>. This will also delete:
                <ul className="mt-2 list-disc list-inside text-sm">
                  <li>All watchlist items</li>
                  <li>All user preferences</li>
                  <li>All session data</li>
                  <li>All related records</li>
                </ul>
                <br />
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}