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
  Edit2,
  Check,
  X
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
    userId: number | null;
    step: 'first' | 'second' | null;
  }>({
    userId: null,
    step: null,
  });
  
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newIdValue, setNewIdValue] = useState<string>('');

  // Check if user is admin (ID 3 or 4)
  const isAdmin = user?.id === 3 || user?.id === 4;

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
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User account has been successfully deleted.",
      });
      setDeleteState({ userId: null, step: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      setDeleteState({ userId: null, step: null });
    },
  });

  // Update user ID mutation
  const updateUserIdMutation = useMutation({
    mutationFn: async ({ oldId, newId }: { oldId: number; newId: number }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${oldId}/id`, { newId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User ID Updated",
        description: "User ID has been successfully updated.",
      });
      setEditingUserId(null);
      setNewIdValue('');
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const handleDeleteClick = (userId: number) => {
    console.log('Delete clicked for user:', userId);
    setDeleteState({
      userId: userId,
      step: 'first'
    });
  };

  const handleFirstConfirmation = () => {
    console.log('First confirmation clicked, moving to second step');
    setDeleteState(prev => ({
      ...prev,
      step: 'second'
    }));
  };

  const handleSecondConfirmation = () => {
    console.log('Second confirmation clicked, deleting user:', deleteState.userId);
    if (deleteState.userId) {
      deleteUserMutation.mutate(deleteState.userId);
    }
  };

  const handleCancelDelete = () => {
    console.log('Delete cancelled');
    setDeleteState({
      userId: null,
      step: null
    });
  };

  const handleEditId = (userId: number) => {
    setEditingUserId(userId);
    setNewIdValue(userId.toString());
  };

  const handleSaveId = () => {
    if (editingUserId && newIdValue) {
      const newId = parseInt(newIdValue);
      if (!isNaN(newId) && newId > 0) {
        updateUserIdMutation.mutate({ oldId: editingUserId, newId });
      } else {
        toast({
          title: "Invalid ID",
          description: "Please enter a valid positive number.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNewIdValue('');
  };

  const canDeleteUser = (targetUserId: number) => {
    // Admin cannot delete another admin
    return !(targetUserId === 3 || targetUserId === 4);
  };

  const getSelectedUserName = () => {
    if (!deleteState.userId || !allUsers) return '';
    const selectedUser = allUsers.find((u: any) => u.id === deleteState.userId);
    return selectedUser?.firstName && selectedUser?.lastName 
      ? `${selectedUser.firstName} ${selectedUser.lastName}`
      : selectedUser?.email?.split('@')[0] || 'Unknown User';
  };

  if (authLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-red-600" />
                  Admin Panel
                </h1>
                <p className="text-gray-600">System administration and user management</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Administrator Access
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Admin Stats */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-black">{allUsers?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Free Users</p>
                    <p className="text-2xl font-bold text-black">
                      {allUsers?.filter(u => u.subscriptionTier === 'novice').length || 0}
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Users</p>
                    <p className="text-2xl font-bold text-black">
                      {allUsers?.filter(u => u.subscriptionTier !== 'novice').length || 0}
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users List */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  All Users ({allUsers?.length || 0})
                </CardTitle>
                <CardDescription>
                  Complete list of all registered users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User ID</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Subscription</th>
                        <th className="text-left py-3 px-4 font-medium">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-blue-600">
                            {editingUserId === user.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={newIdValue}
                                  onChange={(e) => setNewIdValue(e.target.value)}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  min="1"
                                  disabled={updateUserIdMutation.isPending}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSaveId}
                                  disabled={updateUserIdMutation.isPending}
                                  className="p-1"
                                >
                                  <Check className="w-3 h-3 text-green-600" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={updateUserIdMutation.isPending}
                                  className="p-1"
                                >
                                  <X className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 group">
                                <span>#{user.id}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditId(user.id)}
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500" />
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {user.firstName?.charAt(0) || user.email?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-black">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.email?.split('@')[0] || 'Unknown'
                                  }
                                </p>
                                {(user.id === 3 || user.id === 4) && (
                                  <Badge className="bg-red-100 text-red-800 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{user.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${
                              user.subscriptionTier === 'professional' ? 'bg-purple-100 text-purple-800' :
                              user.subscriptionTier === 'analyst' ? 'bg-green-100 text-green-800' :
                              user.subscriptionTier === 'explorer' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <Crown className="w-3 h-3 mr-1" />
                              {user.subscriptionTier ? 
                                user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1) : 
                                'Novice'
                              }
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {user.createdAt 
                                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Unknown'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {canDeleteUser(user.id) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(user.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Double Confirmation Dialog */}
      <AlertDialog 
        open={!!deleteState.step}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteState.step === 'first' ? 'Delete User Account?' : 'Are you absolutely sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              {deleteState.step === 'first' ? (
                <div>
                  You are about to delete the account for <strong>{getSelectedUserName()}</strong>.
                  This action cannot be undone and will permanently remove all user data including:
                  <ul className="list-disc ml-4 mt-2">
                    <li>User profile information</li>
                    <li>Watchlist items</li>
                    <li>Account history</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <span className="text-red-600 font-medium">FINAL CONFIRMATION</span>
                  <br />
                  This is your last chance to cancel. Deleting <strong>{getSelectedUserName()}</strong>'s account 
                  will permanently remove all their data from the system. This action is irreversible.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteState.step === 'first' ? handleFirstConfirmation : handleSecondConfirmation}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteState.step === 'first' ? 'Yes, Delete Account' : 'Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}