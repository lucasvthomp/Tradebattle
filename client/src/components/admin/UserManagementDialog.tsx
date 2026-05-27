import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  DollarSign,
  Plus,
  Minus,
  FileText,
  Ban,
  Crown,
  User,
  ShieldCheck,
  ShieldOff,
  Wallet,
  Trophy
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
      toast({ title: "Success", description: "Username updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update username", variant: "destructive" });
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
      toast({ title: "Success", description: "Balance updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setBalanceAmount("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update balance", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { userId: number; note: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/note`, { note: data.note });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Admin note updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update note", variant: "destructive" });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/ban`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User banned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to ban user", variant: "destructive" });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/unban`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User unbanned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to unban user", variant: "destructive" });
    },
  });

  const freezeWithdrawalMutation = useMutation({
    mutationFn: async (data: { userId: number; frozen: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/freeze-withdrawal`, { frozen: data.frozen });
    },
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: `Withdrawals ${variables.frozen ? 'frozen' : 'unfrozen'} successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update withdrawal status", variant: "destructive" });
    },
  });

  const freezeDepositMutation = useMutation({
    mutationFn: async (data: { userId: number; frozen: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/freeze-deposit`, { frozen: data.frozen });
    },
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: `Deposits ${variables.frozen ? 'frozen' : 'unfrozen'} successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update deposit status", variant: "destructive" });
    },
  });

  const restrictTournamentMutation = useMutation({
    mutationFn: async (data: { userId: number; restricted: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}/restrict-tournament`, { restricted: data.restricted });
    },
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: `Tournament access ${variables.restricted ? 'restricted' : 'restored'} successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update tournament restriction", variant: "destructive" });
    },
  });

  const handleUsernameUpdate = () => {
    if (!newUsername.trim()) {
      toast({ title: "Error", description: "Username cannot be empty", variant: "destructive" });
      return;
    }
    updateUsernameMutation.mutate({ userId: user.id, username: newUsername.trim() });
  };

  const handleBalanceUpdate = (operation: "add" | "remove") => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    updateBalanceMutation.mutate({ userId: user.id, amount, operation });
  };

  const handleNoteUpdate = () => {
    updateNoteMutation.mutate({ userId: user.id, note: adminNote });
  };

  const handleBanToggle = () => {
    if (user.banned) {
      unbanUserMutation.mutate(user.id);
    } else {
      if (confirm("Are you sure you want to ban this user? They will not be able to log in.")) {
        banUserMutation.mutate(user.id);
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.subscriptionTier === 'administrator' ? (
              <Crown className="h-5 w-5" style={{ color: '#E3B341' }} />
            ) : (
              <User className="h-5 w-5" />
            )}
            Manage User: {user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info Header with Status Badges */}
          <div className="p-4 rounded-lg" style={{ background: 'transparent' }}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: '#8A93A6' }}>User ID:</span>
                <div className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                  {user.id}
                  {user.subscriptionTier === 'administrator' && (
                    <Crown className="h-4 w-4" style={{ color: '#E3B341' }} />
                  )}
                </div>
              </div>
              <div>
                <span style={{ color: '#8A93A6' }}>Email:</span>
                <div style={{ color: '#C9D1E2' }}>{user.email}</div>
              </div>
              <div>
                <span style={{ color: '#8A93A6' }}>Site Cash:</span>
                <div className="font-mono" style={{ color: '#28C76F' }}>${parseFloat(user.siteCash || "0").toLocaleString()}</div>
              </div>
              <div>
                <span style={{ color: '#8A93A6' }}>Member Since:</span>
                <div style={{ color: '#C9D1E2' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {user.banned && (
                <Badge variant="destructive" className="text-xs">Banned</Badge>
              )}
              {user.withdrawalFrozen && (
                <Badge className="text-xs" style={{ background: '#FF8C00', color: '#fff' }}>Withdrawals Frozen</Badge>
              )}
              {user.depositFrozen && (
                <Badge className="text-xs" style={{ background: '#FF8C00', color: '#fff' }}>Deposits Frozen</Badge>
              )}
              {user.tournamentRestricted && (
                <Badge className="text-xs" style={{ background: '#E3B341', color: '#000' }}>Tournament Restricted</Badge>
              )}
              {!user.banned && !user.withdrawalFrozen && !user.depositFrozen && !user.tournamentRestricted && (
                <Badge variant="outline" className="text-xs" style={{ borderColor: '#28C76F', color: '#28C76F' }}>No Restrictions</Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="username">Username</TabsTrigger>
              <TabsTrigger value="balance">Site Cash</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-4">
                {/* Ban / Unban */}
                <div className="p-4 rounded-lg" style={{ background: 'transparent', border: '1px solid #2B3A4C' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ban className="h-5 w-5" style={{ color: user.banned ? '#FF4F58' : '#8A93A6' }} />
                      <div>
                        <div className="font-medium" style={{ color: '#C9D1E2' }}>Account Ban</div>
                        <div className="text-xs" style={{ color: '#8A93A6' }}>
                          {user.banned ? 'User is currently banned and cannot log in' : 'User account is active'}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleBanToggle}
                      disabled={banUserMutation.isPending || unbanUserMutation.isPending}
                      variant={user.banned ? "default" : "destructive"}
                      size="sm"
                      style={user.banned ? { background: '#28C76F' } : {}}
                    >
                      {user.banned ? (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Unban
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Ban User
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Freeze Withdrawals */}
                <div className="p-4 rounded-lg" style={{ background: 'transparent', border: '1px solid #2B3A4C' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5" style={{ color: user.withdrawalFrozen ? '#FF8C00' : '#8A93A6' }} />
                      <div>
                        <div className="font-medium" style={{ color: '#C9D1E2' }}>Freeze Withdrawals</div>
                        <div className="text-xs" style={{ color: '#8A93A6' }}>
                          Prevent user from withdrawing site cash
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={user.withdrawalFrozen || false}
                      onCheckedChange={(checked) => {
                        freezeWithdrawalMutation.mutate({ userId: user.id, frozen: checked });
                      }}
                      disabled={freezeWithdrawalMutation.isPending}
                    />
                  </div>
                </div>

                {/* Freeze Deposits */}
                <div className="p-4 rounded-lg" style={{ background: 'transparent', border: '1px solid #2B3A4C' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5" style={{ color: user.depositFrozen ? '#FF8C00' : '#8A93A6' }} />
                      <div>
                        <div className="font-medium" style={{ color: '#C9D1E2' }}>Freeze Deposits</div>
                        <div className="text-xs" style={{ color: '#8A93A6' }}>
                          Prevent user from depositing site cash
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={user.depositFrozen || false}
                      onCheckedChange={(checked) => {
                        freezeDepositMutation.mutate({ userId: user.id, frozen: checked });
                      }}
                      disabled={freezeDepositMutation.isPending}
                    />
                  </div>
                </div>

                {/* Restrict Tournaments */}
                <div className="p-4 rounded-lg" style={{ background: 'transparent', border: '1px solid #2B3A4C' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5" style={{ color: user.tournamentRestricted ? '#E3B341' : '#8A93A6' }} />
                      <div>
                        <div className="font-medium" style={{ color: '#C9D1E2' }}>Restrict Tournaments</div>
                        <div className="text-xs" style={{ color: '#8A93A6' }}>
                          Prevent user from creating or joining tournaments
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={user.tournamentRestricted || false}
                      onCheckedChange={(checked) => {
                        restrictTournamentMutation.mutate({ userId: user.id, restricted: checked });
                      }}
                      disabled={restrictTournamentMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

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
                <p className="text-xs" style={{ color: '#8A93A6' }}>
                  Username must be 3-15 characters and contain only letters, numbers, and underscores.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="balance-amount">Adjust Site Cash</Label>
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
                <p className="text-xs" style={{ color: '#8A93A6' }}>
                  Current site cash: ${parseFloat(user.siteCash || "0").toLocaleString()}
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
                <p className="text-xs" style={{ color: '#8A93A6' }}>
                  These notes are only visible to administrators and help track user interactions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
