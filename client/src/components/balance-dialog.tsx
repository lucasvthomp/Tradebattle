import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react";

interface BalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function BalanceDialog({ open, onOpenChange, currentBalance }: BalanceDialogProps) {
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/balance/deposit", { amount });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process deposit");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('success'),
        description: `${formatCurrency(parseFloat(depositAmount))} ${t('addedToAccount')}`,
      });
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || t('errorOccurred'),
        variant: "destructive",
      });
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/balance/withdraw", { amount });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process withdrawal");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('success'),
        description: `${formatCurrency(parseFloat(withdrawAmount))} ${t('withdrawnFromAccount')}`,
      });
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "There was an error processing your withdrawal.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (amount < 1) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is $1.00.",
        variant: "destructive",
      });
      return;
    }
    if (amount > 10000) {
      toast({
        title: "Maximum Deposit",
        description: "Maximum deposit amount is $10,000.00 per transaction.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (amount < 1) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is $1.00.",
        variant: "destructive",
      });
      return;
    }
    if (amount > currentBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You cannot withdraw more than your current balance.",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            My Balance
          </DialogTitle>
        </DialogHeader>

        {/* Current Balance Display */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(currentBalance)}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Deposit Funds
                </CardTitle>
                <CardDescription>
                  Add money to your trading account. Minimum: $1.00, Maximum: $10,000.00
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                      max="10000"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending || !depositAmount}
                  className="w-full"
                >
                  {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription>
                  Withdraw money from your trading account. Available: {formatCurrency(currentBalance)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                      max={currentBalance}
                      step="0.01"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !withdrawAmount || currentBalance <= 0}
                  className="w-full"
                  variant="outline"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}