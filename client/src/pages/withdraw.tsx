import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  DollarSign,
  Minus,
  AlertTriangle,
  Bitcoin,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface Currency {
  code: string;
  name: string;
  network: string;
  estimatedFee: string;
  confirmationTime: string;
}

interface WithdrawalRequest {
  id: number;
  grossAmount: string;
  siteFee: string;
  transactionFee: string;
  netAmount: string;
  withdrawalMethod: string;
  destinationAddress: string | null;
  destinationCurrency: string | null;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
}

export default function Withdraw() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  const currentBalance = Number(user?.siteCash) || 0;
  const presetAmounts = [10, 25, 50, 100].filter(amt => amt <= currentBalance);

  // Fee calculation
  const SITE_FEE_PERCENTAGE = 25;
  const TRANSACTION_FEE_PERCENTAGE = 3;

  const getWithdrawalBreakdown = (withdrawAmount: number) => {
    const siteFee = withdrawAmount * (SITE_FEE_PERCENTAGE / 100);
    const transactionFee = withdrawAmount * (TRANSACTION_FEE_PERCENTAGE / 100);
    const totalFees = siteFee + transactionFee;
    const subtotal = withdrawAmount - totalFees;

    return {
      originalAmount: withdrawAmount,
      siteFee,
      transactionFee,
      totalFees,
      subtotal: Math.max(0, subtotal)
    };
  };

  const currentWithdrawAmount = selectedAmount || parseFloat(amount) || 0;
  const breakdown = getWithdrawalBreakdown(currentWithdrawAmount);

  // Fetch supported cryptocurrencies
  const { data: currenciesData } = useQuery({
    queryKey: ["/api/crypto/currencies"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/crypto/currencies");
      return response;
    },
  });

  const currencies: Currency[] = currenciesData?.currencies || [];

  // Fetch withdrawal history
  const { data: withdrawalsData, refetch: refetchWithdrawals } = useQuery({
    queryKey: ["/api/crypto/withdrawals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/crypto/withdrawals");
      return response;
    },
  });

  const withdrawals: WithdrawalRequest[] = withdrawalsData?.withdrawals || [];

  // Mutation for crypto withdrawal
  const cryptoWithdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; walletAddress: string; currency: string }) => {
      const response = await apiRequest("POST", "/api/crypto/withdraw", data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/withdrawals"] });
      setAmount("");
      setSelectedAmount(null);
      setWalletAddress("");
      setSelectedCurrency("");
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for $${data.grossAmount.toFixed(2)} has been submitted for admin review.`,
      });
      refetchWithdrawals();
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleCryptoWithdraw = () => {
    const withdrawAmount = selectedAmount || parseFloat(amount);
    const breakdown = getWithdrawalBreakdown(withdrawAmount);

    if (!walletAddress.trim()) {
      toast({
        title: "Wallet Address Required",
        description: "Please enter your crypto wallet address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCurrency) {
      toast({
        title: "Currency Required",
        description: "Please select a cryptocurrency",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount && withdrawAmount > 0 && withdrawAmount <= currentBalance && breakdown.subtotal >= 1) {
      cryptoWithdrawMutation.mutate({
        amount: withdrawAmount,
        walletAddress: walletAddress.trim(),
        currency: selectedCurrency,
      });
    }
  };

  const isValidAmount = () => {
    const withdrawAmount = selectedAmount || parseFloat(amount);
    const breakdown = getWithdrawalBreakdown(withdrawAmount);
    return withdrawAmount > 0 && withdrawAmount <= currentBalance && breakdown.subtotal >= 1;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_admin_approval":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case "approved":
      case "processing":
        return (
          <Badge className="gap-1 bg-blue-500">
            <Clock className="w-3 h-3" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "rejected":
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            {status === "rejected" ? "Rejected" : "Failed"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">

        {/* Header */}
        <motion.div
          className="mb-8"
          {...fadeUpItem}
        >
          <Link href="/hub">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Minus className="w-8 h-8 text-destructive" />
                Withdraw Funds
              </h1>
              <p className="text-muted-foreground mt-2">
                Request crypto withdrawal from your account
              </p>
            </div>
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Crypto Withdrawal Card */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-primary" />
                Crypto Withdrawal
              </CardTitle>
              <CardDescription>
                Withdraw to your crypto wallet • Subject to admin approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amounts */}
              {presetAmounts.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Select</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {presetAmounts.map((presetAmount) => (
                      <Button
                        key={presetAmount}
                        variant={selectedAmount === presetAmount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(presetAmount);
                          setAmount("");
                        }}
                        className="h-12"
                      >
                        {formatCurrency(presetAmount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Amount */}
              <div className="space-y-3">
                <Label htmlFor="custom-amount" className="text-sm font-medium">
                  Withdrawal Amount (USD)
                </Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="pl-10"
                    min="0"
                    step="0.01"
                    max={currentBalance}
                  />
                </div>
              </div>

              <Separator />

              {/* Cryptocurrency Selection */}
              <div className="space-y-3">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Select Cryptocurrency
                </Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.name} ({currency.network})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Address */}
              <div className="space-y-3">
                <Label htmlFor="wallet-address" className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Your Wallet Address
                </Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Fee Breakdown */}
              {currentWithdrawAmount > 0 && (
                <Card className="bg-muted/50 border-border">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-medium text-sm text-foreground">Withdrawal Breakdown</h4>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Withdrawal Amount:</span>
                        <span className="font-medium text-foreground">{formatCurrency(breakdown.originalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>Site Fee (-{SITE_FEE_PERCENTAGE}%):</span>
                        <span>-{formatCurrency(breakdown.siteFee)}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>Transaction Fee (-{TRANSACTION_FEE_PERCENTAGE}%):</span>
                        <span>-{formatCurrency(breakdown.transactionFee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium pt-1">
                        <span className="text-foreground">You will receive:</span>
                        <span className="text-green-500">
                          {formatCurrency(breakdown.subtotal)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warning for insufficient funds */}
              {(selectedAmount || parseFloat(amount)) > currentBalance && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Withdrawal amount cannot exceed your current balance of {formatCurrency(currentBalance)}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning for low payout */}
              {currentWithdrawAmount > 0 && breakdown.subtotal < 1 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    After fees, you would receive less than $1.00. Consider withdrawing a larger amount.
                  </AlertDescription>
                </Alert>
              )}

              {/* Withdraw Button */}
              <Button
                onClick={handleCryptoWithdraw}
                disabled={
                  cryptoWithdrawMutation.isPending ||
                  !isValidAmount() ||
                  currentBalance <= 0 ||
                  !walletAddress.trim() ||
                  !selectedCurrency
                }
                className="w-full h-12 font-semibold"
                size="lg"
                variant="destructive"
              >
                {cryptoWithdrawMutation.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>
                  Your recent withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            ${parseFloat(withdrawal.grossAmount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Net: ${parseFloat(withdrawal.netAmount).toFixed(2)} in {withdrawal.destinationCurrency?.toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(withdrawal.requestedAt).toLocaleString()}
                      </p>
                      {withdrawal.destinationAddress && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          To: {withdrawal.destinationAddress.slice(0, 10)}...{withdrawal.destinationAddress.slice(-8)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Important Notice */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> All withdrawals are subject to admin approval. Funds are deducted immediately,
              but payouts are processed manually. Double-check your wallet address and network before submitting.
            </AlertDescription>
          </Alert>
        </motion.div>

      </div>
    </div>
  );
}
