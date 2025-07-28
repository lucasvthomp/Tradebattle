import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  DollarSign, 
  Plus, 
  Minus, 
  FileText, 
  Ban, 
  Crown,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserManagementDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ user, open, onOpenChange }: UserManagementDialogProps) {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [adminNote, setAdminNote] = useState(user?.adminNote || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUsernameMutation = useMutation({
    mutationFn: async (data: { userId: number; username: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/username`, { username: data.username });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; operation: "add" | "remove" }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/balance`, { 
        amount: data.amount,
        operation: data.operation 
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setBalanceAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update balance",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { userId: number; note: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/note`, { note: data.note });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin note updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/ban`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User banned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  const handleUsernameUpdate = () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateUsernameMutation.mutate({ userId: user.id, username: newUsername.trim() });
  };

  const handleBalanceUpdate = (operation: "add" | "remove") => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    updateBalanceMutation.mutate({ userId: user.id, amount, operation });
  };

  const handleNoteUpdate = () => {
    updateNoteMutation.mutate({ userId: user.id, note: adminNote });
  };

  const handleBanUser = () => {
    if (confirm("Are you sure you want to ban this user? This action cannot be undone.")) {
      banUserMutation.mutate(user.id);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.subscriptionTier === 'administrator' ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Manage User: {user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <div className="flex items-center gap-2">
                  {user.id}
                  {user.subscriptionTier === 'administrator' && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div>{user.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Balance:</span>
                <div className="font-mono">${parseFloat(user.balance || "0").toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Member Since:</span>
                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="username" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="username">Username</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="username" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="new-username">Change Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                  />
                  <Button 
                    onClick={handleUsernameUpdate}
                    disabled={updateUsernameMutation.isPending}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Username must be 3-15 characters and contain only letters, numbers, and underscores.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="balance-amount">Adjust Balance</Label>
                <div className="flex gap-2">
                  <Input
                    id="balance-amount"
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                  <Button 
                    onClick={() => handleBalanceUpdate("add")}
                    disabled={updateBalanceMutation.isPending}
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    onClick={() => handleBalanceUpdate("remove")}
                    disabled={updateBalanceMutation.isPending}
                    variant="destructive"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current balance: ${parseFloat(user.balance || "0").toLocaleString()}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="admin-note">Admin Notes</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes about this user (visible only to admins)"
                  rows={4}
                />
                <Button 
                  onClick={handleNoteUpdate}
                  disabled={updateNoteMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
                <p className="text-xs text-muted-foreground">
                  These notes are only visible to administrators and help track user interactions.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-3">
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Dangerous Actions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    These actions are permanent and cannot be undone.
                  </p>
                  <Button 
                    onClick={handleBanUser}
                    disabled={banUserMutation.isPending}
                    variant="destructive"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}