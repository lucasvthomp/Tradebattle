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
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Bitcoin,
  Smartphone,
  Ticket
} from "lucide-react";

interface BalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

type PaymentMethod = 'crypto' | 'card' | 'cashapp' | 'code';

export function BalanceDialog({ open, onOpenChange, currentBalance }: BalanceDialogProps) {
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<PaymentMethod | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod | null>(null);
  const [balanceCode, setBalanceCode] = useState("");

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: PaymentMethod; code?: string }) => {
      const response = await apiRequest("POST", "/api/balance/deposit", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process deposit");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: `${formatCurrency(parseFloat(depositAmount))} has been added to your account.`,
      });
      setDepositAmount("");
      setDepositMethod(null);
      setBalanceCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "An error occurred while processing your deposit.",
        variant: "destructive",
      });
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: PaymentMethod }) => {
      const response = await apiRequest("POST", "/api/balance/withdraw", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process withdrawal");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Successful",
        description: `${formatCurrency(parseFloat(withdrawAmount))} has been withdrawn from your account.`,
      });
      setWithdrawAmount("");
      setWithdrawMethod(null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "An error occurred while processing your withdrawal.",
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
    if (!depositMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }
    if (depositMethod === 'code' && !balanceCode.trim()) {
      toast({
        title: "Enter Balance Code",
        description: "Please enter a valid balance code.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate({
      amount,
      method: depositMethod,
      code: depositMethod === 'code' ? balanceCode : undefined
    });
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
    if (!withdrawMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
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
    withdrawMutation.mutate({ amount, method: withdrawMethod });
  };

  const paymentMethods = {
    deposit: [
      { id: 'crypto', label: 'Cryptocurrency', icon: Bitcoin, color: '#E3B341' },
      { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: '#28C76F' },
      { id: 'cashapp', label: 'Cash App', icon: Smartphone, color: '#00D54B' },
      { id: 'code', label: 'Balance Code', icon: Ticket, color: '#3B82F6' },
    ],
    withdraw: [
      { id: 'crypto', label: 'Cryptocurrency', icon: Bitcoin, color: '#E3B341' },
      { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: '#28C76F' },
      { id: 'cashapp', label: 'Cash App', icon: Smartphone, color: '#00D54B' },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
            <Wallet className="w-5 h-5" style={{ color: '#E3B341' }} />
            Manage Balance
          </DialogTitle>
        </DialogHeader>

        {/* Current Balance Display */}
        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#1E2D3F', border: '1px solid #2B3A4C' }}>
          <p className="text-xs mb-1" style={{ color: '#8A93A6' }}>Available Balance</p>
          <p className="text-3xl font-bold" style={{ color: '#E3B341' }}>
            {formatCurrency(currentBalance)}
          </p>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6" style={{ backgroundColor: '#1E2D3F' }}>
            <TabsTrigger
              value="deposit"
              className="flex items-center gap-2"
              style={{ color: '#8A93A6' }}
            >
              <TrendingUp className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="flex items-center gap-2"
              style={{ color: '#8A93A6' }}
            >
              <TrendingDown className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                Select Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.deposit.map((method) => {
                  const Icon = method.icon;
                  const isSelected = depositMethod === method.id;
                  return (
                    <Card
                      key={method.id}
                      className="p-4 cursor-pointer transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isSelected ? '#1E2D3F' : '#142538',
                        borderColor: isSelected ? method.color : '#2B3A4C',
                        borderWidth: isSelected ? '2px' : '1px',
                      }}
                      onClick={() => setDepositMethod(method.id as PaymentMethod)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Icon className="w-6 h-6" style={{ color: method.color }} />
                        <span className="text-xs font-medium" style={{ color: isSelected ? '#C9D1E2' : '#8A93A6' }}>
                          {method.label}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            {depositMethod && depositMethod !== 'code' && (
              <div className="space-y-2">
                <Label htmlFor="deposit-amount" style={{ color: '#C9D1E2' }}>
                  Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4" style={{ color: '#8A93A6' }} />
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="pl-10"
                    style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Balance Code Input */}
            {depositMethod === 'code' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="balance-code" style={{ color: '#C9D1E2' }}>
                    Balance Code
                  </Label>
                  <Input
                    id="balance-code"
                    type="text"
                    placeholder="Enter your balance code"
                    value={balanceCode}
                    onChange={(e) => setBalanceCode(e.target.value)}
                    style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
                  />
                  <p className="text-xs" style={{ color: '#8A93A6' }}>
                    Enter the balance code you received to credit your account.
                  </p>
                </div>
              </div>
            )}

            {depositMethod && (
              <Button
                onClick={handleDeposit}
                disabled={depositMutation.isPending || (depositMethod === 'code' ? !balanceCode : !depositAmount)}
                className="w-full"
                style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}
              >
                {depositMutation.isPending ? "Processing..." : `Deposit via ${paymentMethods.deposit.find(m => m.id === depositMethod)?.label}`}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                Select Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.withdraw.map((method) => {
                  const Icon = method.icon;
                  const isSelected = withdrawMethod === method.id;
                  return (
                    <Card
                      key={method.id}
                      className="p-4 cursor-pointer transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isSelected ? '#1E2D3F' : '#142538',
                        borderColor: isSelected ? method.color : '#2B3A4C',
                        borderWidth: isSelected ? '2px' : '1px',
                      }}
                      onClick={() => setWithdrawMethod(method.id as PaymentMethod)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Icon className="w-6 h-6" style={{ color: method.color }} />
                        <span className="text-xs font-medium" style={{ color: isSelected ? '#C9D1E2' : '#8A93A6' }}>
                          {method.label}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            {withdrawMethod && (
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount" style={{ color: '#C9D1E2' }}>
                  Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4" style={{ color: '#8A93A6' }} />
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-10"
                    style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
                    min="1"
                    max={currentBalance}
                    step="0.01"
                  />
                </div>
                <p className="text-xs" style={{ color: '#8A93A6' }}>
                  Available: {formatCurrency(currentBalance)}
                </p>
              </div>
            )}

            {withdrawMethod && (
              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !withdrawAmount || currentBalance <= 0}
                className="w-full"
                style={{ backgroundColor: '#FF4F58', color: '#FFFFFF' }}
              >
                {withdrawMutation.isPending ? "Processing..." : `Withdraw via ${paymentMethods.withdraw.find(m => m.id === withdrawMethod)?.label}`}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
