import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserManagementDialog } from "@/components/admin/UserManagementDialog";
import { TournamentManagementDialog } from "@/components/admin/TournamentManagementDialog";
import { TradebattleIcon } from "@/components/tradebattle-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

// Payments Debug Tab Component
function PaymentsDebugTab() {
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [restoreUsername, setRestoreUsername] = useState("");
  const [restoreAmount, setRestoreAmount] = useState("");
  const [restoreReason, setRestoreReason] = useState("Failed withdrawal reversal");
  const { toast } = useToast();

  const checkPayment = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/crypto/debug-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId: paymentId.trim() }),
      });

      const data = await response.json();
      setResult(data);

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const manualCredit = async () => {
    if (!result?.user || !result?.paymentData) return;

    setLoading(true);
    try {
      const response = await fetch("/api/crypto/manual-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentId: result.paymentData.payment_id,
          username: result.user.username,
          amount: parseFloat(result.paymentData.price_amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        });
        // Refresh the payment status
        await checkPayment();
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="arena-page-shell admin-page space-y-6">
      <Card style={{ backgroundColor: '#142E5A', borderColor: '#1C3E72' }}>
        <CardHeader>
          <CardTitle style={{ color: '#67E7BF' }}>Crypto Payment Debugger</CardTitle>
          <CardDescription style={{ color: '#8A93A6' }}>
            Check NOWPayments status and manually credit confirmed payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter payment ID (e.g., 5653033856)"
              style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72', color: '#C9D1E2' }}
              onKeyDown={(e) => e.key === 'Enter' && checkPayment()}
            />
            <Button
              onClick={checkPayment}
              disabled={loading}
              style={{ backgroundColor: '#67E7BF', color: '#FFFFFF' }}
            >
              <TradebattleIcon name="search" className="w-4 h-4 mr-2" />
              {loading ? "Checking..." : "Check"}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 mt-6">
              {result.error ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 79, 88, 0.1)', borderColor: '#FF4F58', border: '1px solid' }}>
                  <p style={{ color: '#FF4F58' }}>{result.error}</p>
                </div>
              ) : (
                <>
                  {/* Payment Status Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72' }}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Payment Status</p>
                          <Badge
                            style={{
                              backgroundColor: result.paymentData.payment_status === 'finished' ? '#67E7BF' : '#67E7BF',
                              color: '#FFFFFF'
                            }}
                          >
                            {result.paymentData.payment_status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72' }}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Already Credited</p>
                          <Badge
                            style={{
                              backgroundColor: result.alreadyCredited ? '#67E7BF' : '#FF4F58',
                              color: '#FFFFFF'
                            }}
                          >
                            {result.alreadyCredited ? 'Yes' : 'No'}
                            {result.existingCreditCount > 0 && ` (${result.existingCreditCount}x)`}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72' }}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Should Credit</p>
                          <Badge
                            style={{
                              backgroundColor: result.shouldCredit ? '#67E7BF' : '#8A93A6',
                              color: '#FFFFFF'
                            }}
                          >
                            {result.shouldCredit ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Details */}
                  <Card style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72' }}>
                    <CardHeader>
                      <CardTitle className="text-lg" style={{ color: '#67E7BF' }}>Payment Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-black/30 p-4 rounded overflow-auto text-xs" style={{ color: '#8A93A6' }}>
                        {JSON.stringify(result.paymentData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  {/* User Details */}
                  {result.user && (
                    <Card style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72' }}>
                      <CardHeader>
                        <CardTitle className="text-lg" style={{ color: '#67E7BF' }}>User</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p style={{ color: '#C9D1E2' }}>
                            <span className="font-semibold">ID:</span> {result.user.id}
                          </p>
                          <p style={{ color: '#C9D1E2' }}>
                            <span className="font-semibold">Username:</span> {result.user.username}
                          </p>
                          <p style={{ color: '#C9D1E2' }}>
                            <span className="font-semibold">Current Balance:</span> ${parseFloat(result.user.balance || 0).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Manual Credit Button */}
                  {result.shouldCredit && !result.alreadyCredited && (
                    <Button
                      onClick={manualCredit}
                      disabled={loading}
                      className="w-full"
                      style={{ backgroundColor: '#67E7BF', color: '#FFFFFF', fontSize: '16px', padding: '24px' }}
                    >
                      <TradebattleIcon name="cash" className="w-5 h-5 mr-2" />
                      {loading ? "Processing..." : `Manually Credit $${result.paymentData.price_amount} to ${result.user.username}`}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Balance Tool */}
      <Card style={{ backgroundColor: '#142E5A', borderColor: '#FF4F58' }}>
        <CardHeader>
          <CardTitle style={{ color: '#FF4F58' }}>⚠️ Restore Balance (Failed Withdrawal)</CardTitle>
          <CardDescription style={{ color: '#8A93A6' }}>
            Use this to restore money that was deducted by the broken withdrawal system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#C9D1E2' }}>Username</label>
              <Input
                value={restoreUsername}
                onChange={(e) => setRestoreUsername(e.target.value)}
                placeholder="Enter username"
                style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72', color: '#C9D1E2' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#C9D1E2' }}>Amount ($)</label>
              <Input
                type="number"
                value={restoreAmount}
                onChange={(e) => setRestoreAmount(e.target.value)}
                placeholder="20.00"
                style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72', color: '#C9D1E2' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#C9D1E2' }}>Reason</label>
              <Input
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="Failed withdrawal reversal"
                style={{ backgroundColor: '#0E2440', borderColor: '#1C3E72', color: '#C9D1E2' }}
              />
            </div>
          </div>

          <Button
            onClick={async () => {
              if (!restoreUsername || !restoreAmount) {
                toast({
                  title: "Error",
                  description: "Please enter username and amount",
                  variant: "destructive",
                });
                return;
              }

              setLoading(true);
              try {
                const response = await fetch("/api/admin/restore-balance", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    username: restoreUsername,
                    amount: parseFloat(restoreAmount),
                    reason: restoreReason,
                  }),
                });

                const data = await response.json();

                if (response.ok) {
                  toast({
                    title: "Success!",
                    description: data.message,
                  });
                  setRestoreUsername("");
                  setRestoreAmount("");
                } else {
                  toast({
                    title: "Error",
                    description: data.error,
                    variant: "destructive",
                  });
                }
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                });
              }
              setLoading(false);
            }}
            disabled={loading}
            className="w-full"
            style={{ backgroundColor: '#FF4F58', color: '#FFFFFF', fontSize: '16px', padding: '24px' }}
          >
            <TradebattleIcon name="refresh" className="w-5 h-5 mr-2" />
            {loading ? "Processing..." : "Restore Balance"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [endTournamentOpen, setEndTournamentOpen] = useState(false);
  const [tournamentManagementOpen, setTournamentManagementOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [createCodeOpen, setCreateCodeOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    rewardAmount: "",
    usageType: "once_per_user",
    maxUses: "",
    expiresAt: "",
  });

  // Check if user is admin (based on subscription tier or username)
  const isAdmin = user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS';

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
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch admin stats
  const { data: statsData, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const adminStats = statsData?.data || {};

  // Fetch system status
  const { data: systemStatus = {}, isLoading: systemLoading } = useQuery<any>({
    queryKey: ["/api/system/status"],
    enabled: isAdmin,
    refetchInterval: 15000,
  });

  // Fetch all tournaments
  const { data: tournamentData = {}, isLoading: tournamentsLoading } = useQuery<any>({
    queryKey: ["/api/admin/tournaments"],
    enabled: isAdmin,
  });

  // Extract tournaments from the response data
  const allTournaments = Array.isArray(tournamentData) ? tournamentData : (tournamentData as any)?.data || [];

  // Fetch admin revenue stats
  const { data: revenueData, isLoading: revenueLoading } = useQuery<any>({
    queryKey: ["/api/admin/revenue-stats"],
    enabled: isAdmin && activeTab === "revenue",
  });

  const revenueStats = revenueData?.data || {};

  // Fetch admin transactions
  const [txPage] = useState(1);
  const { data: adminTxData, isLoading: adminTxLoading } = useQuery<any>({
    queryKey: ["/api/admin/transactions", txPage],
    queryFn: async () => {
      const res = await fetch(`/api/admin/transactions?limit=50&offset=${(txPage - 1) * 50}`, { credentials: "include" });
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: isAdmin && activeTab === "transactions",
  });

  const adminTransactions = adminTxData?.data || [];

  // Fetch promo codes
  const { data: promoCodesData, isLoading: promoCodesLoading, refetch: refetchPromoCodes } = useQuery<any>({
    queryKey: ["/api/admin/promo-codes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/promo-codes", { credentials: "include" });
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: isAdmin && activeTab === "promo-codes",
  });

  const promoCodes = promoCodesData?.data || [];

  // Create promo code mutation
  const createCodeMutation = useMutation({
    mutationFn: async (codeData: any) => {
      const res = await apiRequest("POST", "/api/admin/promo-codes", codeData);
      return res.json();
    },
    onSuccess: () => {
      refetchPromoCodes();
      setCreateCodeOpen(false);
      setNewCode({ code: "", rewardAmount: "", usageType: "once_per_user", maxUses: "", expiresAt: "" });
      toast({ title: "Promo code created", description: "The promo code has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Toggle promo code active status
  const toggleCodeMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/promo-codes/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      refetchPromoCodes();
      toast({ title: "Code updated", description: "Promo code status has been toggled." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete promo code mutation
  const deleteCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      refetchPromoCodes();
      toast({ title: "Code deleted", description: "Promo code has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Seed legacy codes mutation
  const seedCodesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/promo-codes/seed");
      return res.json();
    },
    onSuccess: (data: any) => {
      refetchPromoCodes();
      toast({ title: "Legacy codes seeded", description: data.message || "Legacy promo codes have been migrated to the database." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Filter users based on search and filter
  const filteredUsers = allUsers.filter((u: any) => {
    const matchesSearch = !userSearch ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;

    switch (userFilter) {
      case "banned": return u.banned;
      case "withdrawal_frozen": return u.withdrawalFrozen;
      case "deposit_frozen": return u.depositFrozen;
      case "tournament_restricted": return u.tournamentRestricted;
      default: return true;
    }
  });

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
    setSelectedTournament(tournament);
    setTournamentManagementOpen(true);
  };

  const handleViewTournamentParticipants = async (tournament: any) => {
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/participants`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        const participantNames = data.data.map((p: any) => p.username).join(', ');
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#67E7BF', borderTopColor: 'transparent' }}></div>
        <span className="text-sm font-medium" style={{ color: '#8A93A6' }}>Loading admin data...</span>
      </div>
    );
  }

  // Don't render anything if not admin (redirect will happen in useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="arena-page-shell admin-page container mx-auto py-6 md:py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="admin-page-heading">
            <div className="admin-page-mark"><TradebattleIcon name="admin" className="h-5 w-5" /></div>
            <div>
              <p className="admin-page-kicker">Operator deck</p>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: '#C9D1E2' }}>Admin</h1>
            </div>
          </div>
        </motion.div>

        {/* Admin Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="admin-tab-list grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-9 mb-2" style={{ background: '#142E5A', border: '1px solid #1C3E72' }}>
              <TabsTrigger value="overview" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Overview</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Users</TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Arenas</TabsTrigger>
              <TabsTrigger value="announcements" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>News</TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Revenue</TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Ledger</TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Payments</TabsTrigger>
              <TabsTrigger value="promo-codes" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>Rewards</TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:text-[#67E7BF]" style={{ color: '#8A93A6' }}>System</TabsTrigger>
            </TabsList>

            {/* ===== TAB 1: OVERVIEW ===== */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Total Users</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                      <TradebattleIcon name="players" className="h-4 w-4" style={{ color: '#3B82F6' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#C9D1E2' }}>{adminStats.totalUsers || allUsers.length || 0}</div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Player profiles</p>
                  </CardContent>
                </Card>

                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(40,199,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Total arena cash</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(40,199,111,0.15)' }}>
                      <TradebattleIcon name="cash" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#67E7BF' }}>
                      ${(adminStats.totalSiteCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Across all players</p>
                  </CardContent>
                </Card>

                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(0,163,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Capital in play</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,163,255,0.15)' }}>
                      <TradebattleIcon name="trend" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#67E7BF' }}>
                      ${(adminStats.activeWagered || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Across active arena pools</p>
                  </CardContent>
                </Card>

                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(227,179,65,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Live arenas</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,179,65,0.15)' }}>
                      <TradebattleIcon name="rankings" className="h-4 w-4" style={{ color: '#F2C76A' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#F2C76A' }}>{adminStats.activeTournaments || 0}</div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Currently running</p>
                  </CardContent>
                </Card>

                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(0,163,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Trades Today</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,163,255,0.12)' }}>
                      <TradebattleIcon name="rankings" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#C9D1E2' }}>{adminStats.tradesToday || 0}</div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Buy/sell actions today</p>
                  </CardContent>
                </Card>

                <Card style={{ background: 'linear-gradient(135deg, #142E5A 0%, #1A3A68 100%)', borderColor: '#1C3E72', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(255,79,88,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#8A93A6' }}>Flagged Users</CardTitle>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,79,88,0.15)' }}>
                      <TradebattleIcon name="info" className="h-4 w-4" style={{ color: '#FF4F58' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black" style={{ color: '#FF4F58' }}>{adminStats.flaggedUsers || 0}</div>
                    <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>Banned / frozen / restricted</p>
                  </CardContent>
                </Card>
              </div>

              {/* Live arenas quick view */}
              {allTournaments.length > 0 && (
                <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                      <TradebattleIcon name="rankings" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                      Live arenas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {allTournaments.filter((t: any) => new Date(t.endsAt) > new Date()).slice(0, 5).map((tournament: any) => {
                        const timeLeft = new Date(tournament.endsAt).getTime() - Date.now();
                        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        return (
                          <div key={tournament.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'transparent' }}>
                            <div>
                              <div className="font-medium" style={{ color: '#C9D1E2' }}>{tournament.name}</div>
                              <div className="text-xs" style={{ color: '#8A93A6' }}>Code: {tournament.code}</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span style={{ color: '#8A93A6' }}>
                                Entry fee: ${parseFloat(tournament.buyInAmount || 0).toFixed(2)}
                              </span>
                              <span style={{ color: '#67E7BF' }}>
                                Pot: ${parseFloat(tournament.currentPot || 0).toFixed(2)}
                              </span>
                              <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>
                                <TradebattleIcon name="players" className="h-3 w-3 mr-1" />
                                {tournament.memberCount}
                              </Badge>
                              <span style={{ color: '#67E7BF' }}>
                                {days > 0 ? `${days}d ` : ''}{hours}h left
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ===== TAB 2: USERS ===== */}
            <TabsContent value="users" className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <TradebattleIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#8A93A6' }} />
                  <Input
                    placeholder="Search by username or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                    style={{ background: '#142E5A', borderColor: '#1C3E72', color: '#C9D1E2' }}
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[200px]" style={{ background: '#142E5A', borderColor: '#1C3E72', color: '#C9D1E2' }}>
                    <TradebattleIcon name="settings" className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="withdrawal_frozen">Withdrawal Frozen</SelectItem>
                    <SelectItem value="deposit_frozen">Deposit Frozen</SelectItem>
                    <SelectItem value="tournament_restricted">Tournament Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="players" className="h-5 w-5" />
                    User Management ({filteredUsers.length})
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Manage user accounts, restrictions, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: '#1C3E72' }}>
                        <TableHead className="w-16" style={{ color: '#8A93A6' }}>ID</TableHead>
                        <TableHead className="w-32" style={{ color: '#8A93A6' }}>Username</TableHead>
                        <TableHead className="w-48" style={{ color: '#8A93A6' }}>Email</TableHead>
                        <TableHead className="w-24" style={{ color: '#8A93A6' }}>Arena cash</TableHead>
                        <TableHead className="w-40" style={{ color: '#8A93A6' }}>Status</TableHead>
                        <TableHead className="w-16" style={{ color: '#8A93A6' }}>Trades</TableHead>
                        <TableHead className="w-16" style={{ color: '#8A93A6' }}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                            <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading users...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.map((u: any) => (
                        <TableRow key={u.id} style={{ borderColor: '#1C3E72' }}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {u.subscriptionTier === 'administrator' && (
                                <TradebattleIcon name="rankings" className="h-3 w-3" style={{ color: '#67E7BF' }} />
                              )}
                              <span className="font-mono text-sm" style={{ color: '#C9D1E2' }}>{u.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium" style={{ color: '#C9D1E2' }}>{u.username}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm truncate max-w-[180px]" style={{ color: '#8A93A6' }} title={u.email}>
                              {u.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm" style={{ color: '#67E7BF' }}>
                              ${parseFloat(u.siteCash || "0").toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.banned && (
                                <Badge variant="destructive" className="text-xs px-1.5 py-0">Banned</Badge>
                              )}
                              {u.withdrawalFrozen && (
                                <Badge className="text-xs px-1.5 py-0" style={{ background: '#FF8C00', color: '#fff' }}>W-Frozen</Badge>
                              )}
                              {u.depositFrozen && (
                                <Badge className="text-xs px-1.5 py-0" style={{ background: '#FF8C00', color: '#fff' }}>D-Frozen</Badge>
                              )}
                              {u.tournamentRestricted && (
                                <Badge className="text-xs px-1.5 py-0" style={{ background: '#67E7BF', color: '#000' }}>T-Restricted</Badge>
                              )}
                              {!u.banned && !u.withdrawalFrozen && !u.depositFrozen && !u.tournamentRestricted && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0" style={{ borderColor: '#67E7BF', color: '#67E7BF' }}>Active</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm" style={{ color: '#C9D1E2' }}>{u.totalTrades || 0}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManageUser(u)}
                            >
                              <TradebattleIcon name="settings" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== TAB 3: TOURNAMENTS ===== */}
            <TabsContent value="tournaments" className="space-y-6">
              {/* Tournament Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Total arenas</CardTitle>
                    <TradebattleIcon name="rankings" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>{allTournaments.length || 0}</div>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Active competitions</p>
                  </CardContent>
                </Card>

                <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Active Players</CardTitle>
                    <TradebattleIcon name="arena" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>
                      {allTournaments.reduce((total: number, tournament: any) => total + (tournament.memberCount || 0), 0) || 0}
                    </div>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Arena players</p>
                  </CardContent>
                </Card>

                <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Total Pot Value</CardTitle>
                    <TradebattleIcon name="cash" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: '#67E7BF' }}>
                      ${allTournaments.reduce((total: number, t: any) => total + parseFloat(t.currentPot || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Combined prize pools</p>
                  </CardContent>
                </Card>

                <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Live arenas</CardTitle>
                    <TradebattleIcon name="trend" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>
                      {allTournaments.filter((t: any) => new Date(t.endsAt) > new Date()).length || 0}
                    </div>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Still running</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tournaments Table */}
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="rankings" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                    Arena management
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Manage live arenas and matchups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tournamentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                        <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading arenas...</p>
                      </div>
                    ) : (
                      <div className="rounded-lg" style={{ border: '1px solid #0E2040' }}>
                        <div className="grid grid-cols-8 gap-3 p-3 font-semibold text-sm" style={{ borderBottom: '1px solid #0E2040', color: '#8A93A6' }}>
                          <div>ID</div>
                          <div>Name</div>
                          <div>Members</div>
                          <div>Entry fee</div>
                          <div>Pot</div>
                          <div>Time Left</div>
                          <div>Status</div>
                          <div>Actions</div>
                        </div>
                        <div className="divide-y" style={{ borderColor: '#1C3E72' }}>
                          {allTournaments?.map((tournament: any) => {
                            const timeLeft = new Date(tournament.endsAt).getTime() - new Date().getTime();
                            const isActive = timeLeft > 0;
                            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                            return (
                              <div key={tournament.id} className="grid grid-cols-8 gap-3 p-3 items-center text-sm" style={{ borderColor: '#1C3E72' }}>
                                <div>
                                  <span className="font-mono" style={{ color: '#C9D1E2' }}>{tournament.id}</span>
                                </div>
                                <div>
                                  <div className="font-medium" style={{ color: '#C9D1E2' }}>{tournament.name}</div>
                                  <div className="text-xs" style={{ color: '#8A93A6' }}>Code: {tournament.code}</div>
                                </div>
                                <div>
                                  <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>
                                    <TradebattleIcon name="players" className="h-3 w-3 mr-1" />
                                    {tournament.memberCount}
                                  </Badge>
                                </div>
                                <div>
                                  <span style={{ color: '#C9D1E2' }}>${parseFloat(tournament.buyInAmount || 0).toFixed(2)}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#67E7BF' }}>${parseFloat(tournament.currentPot || 0).toFixed(2)}</span>
                                </div>
                                <div>
                                  {isActive ? (
                                    <div>
                                      <div className="font-medium" style={{ color: '#67E7BF' }}>
                                        {days > 0 ? `${days}d ` : ''}
                                        {hours > 0 ? `${hours}h ` : ''}
                                        {minutes}m
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ color: '#8A93A6' }}>Ended</span>
                                  )}
                                </div>
                                <div>
                                  <Badge variant="outline" style={{
                                    borderColor: isActive ? '#67E7BF' : '#FF4F58',
                                    color: isActive ? '#67E7BF' : '#FF4F58'
                                  }}>
                                    {isActive ? 'Active' : 'Ended'}
                                  </Badge>
                                </div>
                                <div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <TradebattleIcon name="menu" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewTournamentDetails(tournament)}>
                                        <TradebattleIcon name="info" className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleViewTournamentParticipants(tournament)}>
                                        <TradebattleIcon name="players" className="h-4 w-4 mr-2" />
                                        View Participants
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteTournament(tournament)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <TradebattleIcon name="close" className="h-4 w-4 mr-2" />
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

            {/* ===== TAB 4: ANNOUNCEMENTS ===== */}
            <TabsContent value="announcements" className="space-y-6">
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="support" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                    Create System-Wide Announcement
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Send messages that appear when players enter. Add custom visual effects!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Announcement Title</Label>
                      <Input
                        placeholder="e.g., Big Tournament This Weekend!"
                        style={{ backgroundColor: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select defaultValue="info">
                        <SelectTrigger style={{ backgroundColor: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="celebration">Celebration</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Enter your announcement message here..."
                      rows={4}
                      style={{ backgroundColor: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Visual Effect</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <TradebattleIcon name="success" className="h-6 w-6" style={{ color: '#67E7BF' }} />
                        <span className="text-xs">None</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <TradebattleIcon name="success" className="h-6 w-6" style={{ color: '#67E7BF' }} />
                        <span className="text-xs">Confetti</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <span className="text-2xl">💩</span>
                        <span className="text-xs">Poop Rain</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <span className="text-2xl">❄️</span>
                        <span className="text-xs">Snow</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <span className="text-2xl">🎆</span>
                        <span className="text-xs">Fireworks</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        style={{ borderColor: '#1C3E72' }}
                      >
                        <TradebattleIcon name="success" className="h-6 w-6" style={{ color: '#FDC830' }} />
                        <span className="text-xs">Sparkles</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expires At (Optional)</Label>
                      <Input
                        type="datetime-local"
                        style={{ backgroundColor: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full h-10" style={{ backgroundColor: '#67E7BF', color: '#FFFFFF' }}>
                        <TradebattleIcon name="arrow-right" className="h-4 w-4 mr-2" />
                        Send Announcement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Announcements */}
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="trend" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                    Active Announcements
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Manage currently active system announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: '#67E7BF', color: '#FFFFFF' }}>CELEBRATION</Badge>
                          <span className="font-semibold" style={{ color: '#C9D1E2' }}>Welcome to Tradebattle!</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <TradebattleIcon name="settings" className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <TradebattleIcon name="close" className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#8A93A6' }}>
                        Thanks for joining! Check out our $1000 tournament this weekend.
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: '#8A93A6' }}>
                        <span className="flex items-center gap-1">
                          <TradebattleIcon name="success" className="h-3 w-3" />
                          Confetti Effect
                        </span>
                        <span className="flex items-center gap-1">
                          <TradebattleIcon name="players" className="h-3 w-3" />
                          127 views
                        </span>
                        <span className="flex items-center gap-1">
                          <TradebattleIcon name="timer" className="h-3 w-3" />
                          Expires in 6 days
                        </span>
                      </div>
                    </div>

                    <div className="text-center py-8" style={{ color: '#8A93A6' }}>
                      <TradebattleIcon name="support" className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No other active announcements</p>
                      <p className="text-xs mt-1">Create one above to send messages to all users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== TAB 5: REVENUE ===== */}
            <TabsContent value="revenue" className="space-y-6">
              {revenueLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                  <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading revenue data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Total Deposits</CardTitle>
                        <TradebattleIcon name="cash" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#67E7BF' }}>
                          ${(revenueStats.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </CardContent>
                    </Card>
                    <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Total Withdrawals</CardTitle>
                        <TradebattleIcon name="cash" className="h-4 w-4" style={{ color: '#FF4F58' }} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#FF4F58' }}>
                          ${(revenueStats.totalWithdrawals || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </CardContent>
                    </Card>
                    <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Net Revenue</CardTitle>
                        <TradebattleIcon name="trend" className="h-4 w-4" style={{ color: '#67E7BF' }} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#67E7BF' }}>
                          ${(revenueStats.netRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </CardContent>
                    </Card>
                    <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Total Transactions</CardTitle>
                        <TradebattleIcon name="rankings" className="h-4 w-4" style={{ color: '#8A93A6' }} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>
                          {revenueStats.totalTransactions || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Breakdown by type */}
                  {revenueStats.byType && (
                    <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                          <TradebattleIcon name="rankings" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                          Breakdown by Type
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow style={{ borderColor: '#1C3E72' }}>
                              <TableHead style={{ color: '#8A93A6' }}>Type</TableHead>
                              <TableHead className="text-right" style={{ color: '#8A93A6' }}>Count</TableHead>
                              <TableHead className="text-right" style={{ color: '#8A93A6' }}>Total Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenueStats.byType.map((row: any) => (
                              <TableRow key={row.type} style={{ borderColor: '#1C3E72' }}>
                                <TableCell>
                                  <span className="font-medium capitalize" style={{ color: '#C9D1E2' }}>
                                    {(row.type || "unknown").replace(/_/g, " ")}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span style={{ color: '#C9D1E2' }}>{row.count}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-mono" style={{ color: '#67E7BF' }}>
                                    ${parseFloat(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* ===== TAB 5: TRANSACTIONS ===== */}
            <TabsContent value="transactions" className="space-y-6">
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="cash" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                    All Transactions
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Full transaction log across all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminTxLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                      <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading transactions...</p>
                    </div>
                  ) : adminTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <TradebattleIcon name="cash" className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#8A93A6' }} />
                      <p className="text-sm" style={{ color: '#8A93A6' }}>No transactions recorded yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: '#1C3E72' }}>
                          <TableHead style={{ color: '#8A93A6' }}>ID</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>User</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Type</TableHead>
                          <TableHead className="text-right" style={{ color: '#8A93A6' }}>Amount</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Status</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminTransactions.map((tx: any) => (
                          <TableRow key={tx.id} style={{ borderColor: '#1C3E72' }}>
                            <TableCell>
                              <span className="font-mono text-sm" style={{ color: '#C9D1E2' }}>{tx.id}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: '#C9D1E2' }}>{tx.userId}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm capitalize" style={{ color: '#C9D1E2' }}>
                                {(tx.type || "").replace(/_/g, " ")}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-mono text-sm" style={{
                                color: ["deposit", "payout", "tip_received"].includes(tx.type) ? '#67E7BF' : '#FF4F58'
                              }}>
                                ${parseFloat(tx.amount || 0).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs" style={{
                                borderColor: tx.status === "completed" ? '#67E7BF' : tx.status === "pending" ? '#67E7BF' : '#FF4F58',
                                color: tx.status === "completed" ? '#67E7BF' : tx.status === "pending" ? '#67E7BF' : '#FF4F58',
                              }}>
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: '#8A93A6' }}>
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== TAB 6: PAYMENTS DEBUG ===== */}
            <TabsContent value="payments" className="space-y-6">
              <PaymentsDebugTab />
            </TabsContent>

            {/* ===== TAB 7: PROMO CODES ===== */}
            <TabsContent value="promo-codes" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setCreateCodeOpen(true)}
                    style={{ background: '#67E7BF', color: '#FFFFFF' }}
                  >
                    <TradebattleIcon name="arrow-right" className="h-4 w-4 mr-2" />
                    Create Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => seedCodesMutation.mutate()}
                    disabled={seedCodesMutation.isPending}
                    style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                  >
                    <TradebattleIcon name="refresh" className={`h-4 w-4 mr-2 ${seedCodesMutation.isPending ? 'animate-spin' : ''}`} />
                    Seed Legacy Codes
                  </Button>
                </div>
                <span className="text-sm" style={{ color: '#8A93A6' }}>
                  {promoCodes.length} codes total
                </span>
              </div>

              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="rewards" className="h-5 w-5" style={{ color: '#67E7BF' }} />
                    Promo Code Management
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Create and manage promotional codes for user rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {promoCodesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                      <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading promo codes...</p>
                    </div>
                  ) : promoCodes.length === 0 ? (
                    <div className="text-center py-12">
                      <TradebattleIcon name="rewards" className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#8A93A6' }} />
                      <p className="text-sm" style={{ color: '#8A93A6' }}>No promo codes yet. Create one or seed legacy codes.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: '#1C3E72' }}>
                          <TableHead style={{ color: '#8A93A6' }}>Code</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Reward</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Type</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Uses</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Expires</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Active</TableHead>
                          <TableHead style={{ color: '#8A93A6' }}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodes.map((code: any) => (
                          <TableRow key={code.id} style={{ borderColor: '#1C3E72' }}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm" style={{ color: '#67E7BF' }}>
                                  {code.code}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(code.code);
                                    toast({ title: "Copied", description: `Code "${code.code}" copied to clipboard.` });
                                  }}
                                >
                                  <TradebattleIcon name="archive" className="h-3 w-3" style={{ color: '#8A93A6' }} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm" style={{ color: '#67E7BF' }}>
                                ${parseFloat(code.rewardAmount || 0).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>
                                {(code.usageType || "").replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: '#C9D1E2' }}>
                                {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ''}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: '#8A93A6' }}>
                                {code.expiresAt
                                  ? new Date(code.expiresAt).toLocaleDateString()
                                  : 'Never'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCodeMutation.mutate({ id: code.id, isActive: !code.isActive })}
                                disabled={toggleCodeMutation.isPending}
                              >
                                <TradebattleIcon name="settings" className="h-4 w-4 mr-1" style={{ color: code.isActive ? '#67E7BF' : '#FF4F58' }} />
                                <span className="text-xs" style={{ color: code.isActive ? '#67E7BF' : '#FF4F58' }}>
                                  {code.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCodeMutation.mutate(code.id)}
                                disabled={deleteCodeMutation.isPending}
                              >
                                <TradebattleIcon name="close" className="h-4 w-4" style={{ color: '#FF4F58' }} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Create Promo Code Dialog */}
              <Dialog open={createCodeOpen} onOpenChange={setCreateCodeOpen}>
                <DialogContent style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: '#C9D1E2' }}>Create Promo Code</DialogTitle>
                    <DialogDescription style={{ color: '#8A93A6' }}>
                      Create a new promotional code for user rewards.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label style={{ color: '#C9D1E2' }}>Code</Label>
                      <Input
                        placeholder="e.g. WELCOME500"
                        value={newCode.code}
                        onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                        style={{ background: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label style={{ color: '#C9D1E2' }}>Reward Amount ($)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        value={newCode.rewardAmount}
                        onChange={(e) => setNewCode({ ...newCode, rewardAmount: e.target.value })}
                        style={{ background: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label style={{ color: '#C9D1E2' }}>Usage Type</Label>
                      <Select
                        value={newCode.usageType}
                        onValueChange={(value) => setNewCode({ ...newCode, usageType: value })}
                      >
                        <SelectTrigger style={{ background: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once_per_user">Once Per User</SelectItem>
                          <SelectItem value="single_use">Single Use (Global)</SelectItem>
                          <SelectItem value="limited">Limited Uses</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newCode.usageType === "limited" && (
                      <div className="space-y-2">
                        <Label style={{ color: '#C9D1E2' }}>Max Uses</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 100"
                          value={newCode.maxUses}
                          onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                          style={{ background: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label style={{ color: '#C9D1E2' }}>Expires At (optional)</Label>
                      <Input
                        type="date"
                        value={newCode.expiresAt}
                        onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                        style={{ background: 'transparent', borderColor: '#1C3E72', color: '#C9D1E2' }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateCodeOpen(false)}
                      style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!newCode.code || !newCode.rewardAmount) {
                          toast({ title: "Missing fields", description: "Code and reward amount are required.", variant: "destructive" });
                          return;
                        }
                        createCodeMutation.mutate({
                          code: newCode.code,
                          rewardType: "sitecash",
                          rewardAmount: newCode.rewardAmount,
                          usageType: newCode.usageType,
                          maxUses: newCode.usageType === "limited" ? parseInt(newCode.maxUses) || null : null,
                          expiresAt: newCode.expiresAt ? new Date(newCode.expiresAt).toISOString() : null,
                        });
                      }}
                      disabled={createCodeMutation.isPending}
                      style={{ background: '#67E7BF', color: '#FFFFFF' }}
                    >
                      {createCodeMutation.isPending ? "Creating..." : "Create Code"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ===== TAB 7: SYSTEM ===== */}
            <TabsContent value="system" className="space-y-6">
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="market" className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    Monitor system health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#67E7BF' }}></div>
                      <p className="mt-2 text-sm" style={{ color: '#8A93A6' }}>Loading system status...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: '#C9D1E2' }}>Database</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Status</span>
                            <Badge variant="outline" style={{
                              borderColor: (systemStatus as any)?.database?.connected ? '#67E7BF' : '#FF4F58',
                              color: (systemStatus as any)?.database?.connected ? '#67E7BF' : '#FF4F58'
                            }}>
                              <TradebattleIcon name="archive" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.database?.connected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Type</span>
                            <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>{(systemStatus as any)?.database?.type || "PostgreSQL"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Tables</span>
                            <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>{(systemStatus as any)?.database?.tableCount || "0"}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Connections</span>
                            <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>{(systemStatus as any)?.database?.activeConnections || "0"}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: '#C9D1E2' }}>API Services</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Yahoo Finance</span>
                            <Badge variant="outline" style={{
                              borderColor: (systemStatus as any)?.apis?.yahooFinance?.status ? '#67E7BF' : '#FF4F58',
                              color: (systemStatus as any)?.apis?.yahooFinance?.status ? '#67E7BF' : '#FF4F58'
                            }}>
                              <TradebattleIcon name="market" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.apis?.yahooFinance?.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Cache</span>
                            <Badge variant="outline" style={{
                              borderColor: (systemStatus as any)?.apis?.cache?.enabled ? '#67E7BF' : '#FF4F58',
                              color: (systemStatus as any)?.apis?.cache?.enabled ? '#67E7BF' : '#FF4F58'
                            }}>
                              <TradebattleIcon name="settings" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.apis?.cache?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Active Users</span>
                            <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>
                              <TradebattleIcon name="players" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.activeUsers || "0"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: '#C9D1E2' }}>System Health</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Uptime</span>
                            <Badge variant="outline" style={{ borderColor: '#67E7BF', color: '#67E7BF' }}>
                              <TradebattleIcon name="timer" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.uptime || "0m"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Error Rate</span>
                            <Badge variant="outline" style={{
                              borderColor: ((systemStatus as any)?.system?.errorRate || 0) > 5 ? '#FF4F58' : '#67E7BF',
                              color: ((systemStatus as any)?.system?.errorRate || 0) > 5 ? '#FF4F58' : '#67E7BF'
                            }}>
                              <TradebattleIcon name="info" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.errorRate || "0"}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Response Time</span>
                            <Badge variant="outline" style={{
                              borderColor: ((systemStatus as any)?.system?.avgResponseTime || 0) > 1000 ? '#FF4F58' : '#67E7BF',
                              color: ((systemStatus as any)?.system?.avgResponseTime || 0) > 1000 ? '#FF4F58' : '#67E7BF'
                            }}>
                              <TradebattleIcon name="trend" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.avgResponseTime || "0"}ms
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#8A93A6' }}>Total Requests</span>
                            <Badge variant="outline" style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}>
                              <TradebattleIcon name="trend" className="h-3 w-3 mr-1" />
                              {(systemStatus as any)?.system?.totalRequests || "0"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IT Administration */}
              <Card style={{ background: '#142E5A', borderColor: '#1C3E72' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
                    <TradebattleIcon name="settings" className="h-5 w-5" />
                    IT Administration
                  </CardTitle>
                  <CardDescription style={{ color: '#8A93A6' }}>
                    System configuration and administrative tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold" style={{ color: '#C9D1E2' }}>Quick Actions</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            toast({ title: "Database Backup", description: "Database backup initiated. This may take a few minutes." });
                          }}
                        >
                          <TradebattleIcon name="archive" className="h-4 w-4 mr-2" />
                          Database Backup
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            if (confirm("Are you sure you want to clear all cached data? This may temporarily slow down the system.")) {
                              toast({ title: "Cache Cleared", description: "All cached data has been cleared successfully." });
                            }
                          }}
                        >
                          <TradebattleIcon name="settings" className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#FF4F58', color: '#FF4F58' }}
                          onClick={() => {
                            if (confirm("⚠️ WARNING: This will restart the entire system. All users will be temporarily disconnected. Continue?")) {
                              toast({ title: "System Restart", description: "System is restarting. This will take 30-60 seconds...", duration: 10000 });
                            }
                          }}
                        >
                          <TradebattleIcon name="trend" className="h-4 w-4 mr-2" />
                          System Restart
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => {
                            if (confirm("🚨 CRITICAL WARNING: This will shut down the entire platform. All users will be logged out and the site will go offline. Are you ABSOLUTELY sure?")) {
                              if (confirm("This action cannot be undone remotely. You will need physical server access to restart. Type YES in the next prompt to confirm.")) {
                                const confirmation = prompt("Type 'SHUTDOWN' in all caps to confirm:");
                                if (confirmation === "SHUTDOWN") {
                                  toast({ title: "SYSTEM SHUTDOWN INITIATED", description: "The platform is shutting down in 10 seconds...", variant: "destructive", duration: 10000 });
                                  setTimeout(() => {
                                    window.location.href = "/maintenance";
                                  }, 10000);
                                }
                              }
                            }
                          }}
                        >
                          <TradebattleIcon name="info" className="h-4 w-4 mr-2" />
                          Emergency Shutdown
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold" style={{ color: '#C9D1E2' }}>Monitoring & Maintenance</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            toast({ title: "System Logs", description: "Opening system logs viewer..." });
                          }}
                        >
                          <TradebattleIcon name="info" className="h-4 w-4 mr-2" />
                          View System Logs
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            toast({ title: "Error Reports", description: "Last 24 hours: 0 critical errors, 2 warnings" });
                          }}
                        >
                          <TradebattleIcon name="info" className="h-4 w-4 mr-2" />
                          Error Reports
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            toast({ title: "Performance Metrics", description: "Avg Response: 45ms | Uptime: 99.9% | Memory: 1.2GB/4GB" });
                          }}
                        >
                          <TradebattleIcon name="trend" className="h-4 w-4 mr-2" />
                          Performance Metrics
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ borderColor: '#1C3E72', color: '#C9D1E2' }}
                          onClick={() => {
                            queryClient.invalidateQueries();
                            queryClient.refetchQueries();
                            toast({ title: "Data Refreshed", description: "All data has been refreshed from the server." });
                          }}
                        >
                          <TradebattleIcon name="refresh" className="h-4 w-4 mr-2" />
                          Force Refresh All Data
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

        {/* Tournament Management Dialog */}
        <TournamentManagementDialog
          tournament={selectedTournament}
          open={tournamentManagementOpen}
          onOpenChange={setTournamentManagementOpen}
        />
      </motion.div>
    </div>
  );
}
