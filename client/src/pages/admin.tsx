import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserManagementDialog } from "@/components/admin/UserManagementDialog";
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
  GamepadIcon,
  DollarSign,
  RefreshCw
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
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [endTournamentOpen, setEndTournamentOpen] = useState(false);

  // Check if user is admin (based on subscription tier)
  const isAdmin = user?.subscriptionTier === 'administrator';

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
  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
    staleTime: 0, // Always refetch for fresh balance data
    gcTime: 0, // Don't cache balance data (renamed from cacheTime in v5)
  });

  // Fetch system status
  const { data: systemStatus = {}, isLoading: systemLoading } = useQuery<any>({
    queryKey: ["/api/system/status"],
    enabled: isAdmin,
    refetchInterval: 15000, // Refresh every 15 seconds to show Yahoo Finance updates
  });

  // Fetch all tournaments
  const { data: tournamentData = {}, isLoading: tournamentsLoading } = useQuery<any>({
    queryKey: ["/api/admin/tournaments"],
    enabled: isAdmin,
  });

  // Extract tournaments from the response data
  const allTournaments = Array.isArray(tournamentData) ? tournamentData : (tournamentData as any)?.data || [];

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

  // Handle manage user
  const handleManageUser = (user: any) => {
    setSelectedUser(user);
    setUserManagementOpen(true);
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

  const handleDeleteTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setEndTournamentOpen(true);
  };

  const confirmDeleteTournament = async () => {
    if (!selectedTournament) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/admin/tournaments/${selectedTournament.id}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Tournament Deleted",
          description: data.message,
          variant: "default",
        });
        
        // Refresh the tournaments list
        queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
        setEndTournamentOpen(false);
        setSelectedTournament(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete tournament",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tournament",
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
    <div className="container mx-auto py-6 md:py-8">
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
                    <div className="text-2xl font-bold">{allUsers.length || 0}</div>
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
                      {allUsers?.filter((u: any) => u.subscriptionTier === 'administrator').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">System administrators</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allUsers.length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Platform users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                    <Crown className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allUsers.filter((u: any) => u.subscriptionTier === 'administrator').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Admin accounts</p>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">User ID</TableHead>
                        <TableHead className="w-32">Username</TableHead>
                        <TableHead className="w-64">Email</TableHead>
                        <TableHead className="w-24">Balance</TableHead>
                        <TableHead className="w-28">Created</TableHead>
                        <TableHead className="w-20">Role</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                          </TableCell>
                        </TableRow>
                      ) : allUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.subscriptionTier === 'administrator' && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-mono text-sm">{user.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{user.username}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm" title={user.email}>
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-mono text-sm">
                                ${parseFloat(user.siteCash || "0").toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.subscriptionTier === 'administrator' ? 'default' : 'secondary'}>
                              {user.subscriptionTier === 'administrator' ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleManageUser(user)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                    <div className="text-2xl font-bold">{allTournaments.length || 0}</div>
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
                      {allTournaments.reduce((total: number, tournament: any) => total + (tournament.memberCount || 0), 0) || 0}
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
                      {allTournaments.length ? Math.round((allTournaments.reduce((total: number, tournament: any) => total + (tournament.memberCount || 0), 0) || 0) / allTournaments.length) : 0}
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
                      {allTournaments.filter((t: any) => new Date(t.endsAt) > new Date()).length || 0}
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
                                        onClick={() => handleDeleteTournament(tournament)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Tournament
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
                            <Badge variant="outline" className={(systemStatus as any)?.database?.connected ? "text-green-600" : "text-red-600"}>
                              <Database className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.database?.connected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Type</span>
                            <Badge variant="outline">{(systemStatus as any)?.database?.type || "PostgreSQL"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tables</span>
                            <Badge variant="outline">{(systemStatus as any)?.database?.tableCount || "0"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Connections</span>
                            <Badge variant="outline">{(systemStatus as any)?.database?.activeConnections || "0"}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">API Services</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Yahoo Finance</span>
                            <Badge variant="outline" className={(systemStatus as any)?.apis?.yahooFinance?.status ? "text-green-600" : "text-red-600"}>
                              <Globe className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.apis?.yahooFinance?.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cache</span>
                            <Badge variant="outline" className={(systemStatus as any)?.apis?.cache?.enabled ? "text-green-600" : "text-red-600"}>
                              <Settings className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.apis?.cache?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Users</span>
                            <Badge variant="outline" className="text-blue-600">
                              <Users className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.activeUsers || "0"}
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
                              {(systemStatus as any)?.system?.uptime || "0m"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Error Rate</span>
                            <Badge variant="outline" className={((systemStatus as any)?.system?.errorRate || 0) > 5 ? "text-red-600" : "text-green-600"}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.errorRate || "0"}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Response Time</span>
                            <Badge variant="outline" className={((systemStatus as any)?.system?.avgResponseTime || 0) > 1000 ? "text-red-600" : "text-green-600"}>
                              <Activity className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.avgResponseTime || "0"}ms
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
                            <span className="text-sm">Status:</span>
                            <Badge variant="outline" className="text-green-600">
                              <Database className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Type:</span>
                            <Badge variant="outline">PostgreSQL</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tables:</span>
                            <Badge variant="outline">10</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Connections:</span>
                            <Badge variant="outline">2</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">APIs</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Yahoo Finance:</span>
                            <Badge variant="outline" className="text-green-600">
                              <Activity className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cache:</span>
                            <Badge variant="outline" className="text-green-600">
                              <Database className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">Performance</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Users:</span>
                            <Badge variant="outline">{allUsers.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Tournaments:</span>
                            <Badge variant="outline">{allTournaments.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Error Rate:</span>
                            <Badge variant="outline" className="text-green-600">0%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Actions
                  </CardTitle>
                  <CardDescription>
                    Administrative controls and maintenance operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Cache Management</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="h-4 w-4 mr-2" />
                          Refresh Data
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">System Control</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="h-4 w-4 mr-2" />
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </motion.div>



        {/* Delete Tournament Confirmation Dialog */}
        <AlertDialog open={endTournamentOpen} onOpenChange={setEndTournamentOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tournament Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the tournament <strong>"{selectedTournament?.name}"</strong> and all its data.
                This action cannot be undone and will remove all participants, purchases, and tournament history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEndTournamentOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTournament} className="bg-red-600 hover:bg-red-700">
                Delete Tournament
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

        {/* User Management Dialog */}
        <UserManagementDialog
          user={selectedUser}
          open={userManagementOpen}
          onOpenChange={setUserManagementOpen}
        />
      </motion.div>
    </div>
  );
}