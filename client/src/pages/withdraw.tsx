import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  XCircle
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
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
  const [showCryptoForm, setShowCryptoForm] = useState(false);

  const currentBalance = Number(user?.siteCash) || 0;
  const presetAmounts = [10, 25, 50, 100].filter(amt => amt <= currentBalance);

  // Fee calculation
  const SITE_FEE_PERCENTAGE = 25; // 25% site fee
  const TRANSACTION_FEE_PERCENTAGE = 3; // 3% transaction fee

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
      setShowCryptoForm(false);
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
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#E3B341", color: "#06121F" }}>
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case "approved":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#4B9FFF", color: "#06121F" }}>
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#28C76F", color: "#06121F" }}>
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "rejected":
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#FF4F58", color: "#FFFFFF" }}>
            <XCircle className="w-3 h-3" />
            {status === "rejected" ? "Rejected" : "Failed"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#8A93A6", color: "#06121F" }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: "#06121F" }}>
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <motion.div
          className="mb-8"
          {...fadeInUp}
        >
          <div className="flex items-center space-x-4">
            <Link href="/hub">
              <Button variant="ghost" size="sm" style={{ color: "#8A93A6" }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center" style={{ color: "#C9D1E2" }}>
                <Minus className="w-8 h-8 mr-3" style={{ color: "#FF4F58" }} />
                Withdraw Funds
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Current Balance Display */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "#8A93A6" }}>Available Balance</p>
                  <p className="text-3xl font-bold" style={{ color: "#C9D1E2" }}>
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12" style={{ color: "#8A93A6", opacity: 0.3 }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crypto Withdrawal Card */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#FF8C42" }}>
                  <Bitcoin className="w-6 h-6" style={{ color: "#06121F" }} />
                </div>
                <div>
                  <CardTitle style={{ color: "#C9D1E2" }}>Crypto Withdrawal</CardTitle>
                  <CardDescription style={{ color: "#8A93A6" }}>
                    Withdraw to your crypto wallet • Subject to admin approval
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              {/* Preset Amounts */}
              {presetAmounts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium" style={{ color: "#C9D1E2" }}>Quick Select</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {presetAmounts.map((presetAmount) => (
                      <Button
                        key={presetAmount}
                        variant={selectedAmount === presetAmount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(presetAmount);
                          setAmount("");
                        }}
                        className="h-12"
                        style={{
                          background: selectedAmount === presetAmount ? "#E3B341" : "transparent",
                          color: selectedAmount === presetAmount ? "#06121F" : "#C9D1E2",
                          borderColor: "#2B3A4C"
                        }}
                      >
                        {formatCurrency(presetAmount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-medium" style={{ color: "#C9D1E2" }}>
                  Withdrawal Amount (USD)
                </Label>
                <div className="relative mt-2">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#8A93A6" }} />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="pl-10"
                    style={{
                      background: "#06121F",
                      borderColor: "#2B3A4C",
                      color: "#C9D1E2"
                    }}
                    min="0"
                    step="0.01"
                    max={currentBalance}
                  />
                </div>
              </div>

              {/* Cryptocurrency Selection */}
              <div>
                <Label htmlFor="currency" className="text-sm font-medium" style={{ color: "#C9D1E2" }}>
                  Select Cryptocurrency
                </Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger style={{ background: "#06121F", borderColor: "#2B3A4C", color: "#C9D1E2" }}>
                    <SelectValue placeholder="Choose cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} style={{ color: "#C9D1E2" }}>
                        {currency.name} ({currency.network})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Address */}
              <div>
                <Label htmlFor="wallet-address" className="text-sm font-medium" style={{ color: "#C9D1E2" }}>
                  <Wallet className="w-4 h-4 inline mr-1" />
                  Your Wallet Address
                </Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-2 font-mono"
                  style={{
                    background: "#06121F",
                    borderColor: "#2B3A4C",
                    color: "#C9D1E2"
                  }}
                />
              </div>

              {/* Fee Breakdown */}
              {currentWithdrawAmount > 0 && (
                <div className="p-4 rounded-lg space-y-2" style={{ background: "#06121F" }}>
                  <h4 className="font-medium text-sm" style={{ color: "#C9D1E2" }}>Withdrawal Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "#8A93A6" }}>Withdrawal Amount:</span>
                      <span className="font-medium" style={{ color: "#C9D1E2" }}>{formatCurrency(breakdown.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: "#FF4F58" }}>
                      <span>Site Fee (-{SITE_FEE_PERCENTAGE}%):</span>
                      <span>-{formatCurrency(breakdown.siteFee)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: "#FF4F58" }}>
                      <span>Transaction Fee (-{TRANSACTION_FEE_PERCENTAGE}%):</span>
                      <span>-{formatCurrency(breakdown.transactionFee)}</span>
                    </div>
                    <div className="border-t pt-1 mt-2" style={{ borderColor: "#2B3A4C" }}>
                      <div className="flex justify-between font-medium">
                        <span style={{ color: "#8A93A6" }}>You will receive:</span>
                        <span style={{ color: "#28C76F" }}>
                          {formatCurrency(breakdown.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                style={{
                  background: "#E3B341",
                  color: "#06121F",
                  opacity: (cryptoWithdrawMutation.isPending || !isValidAmount() || !walletAddress.trim() || !selectedCurrency) ? 0.6 : 1
                }}
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
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
              <CardHeader>
                <CardTitle style={{ color: "#C9D1E2" }}>Withdrawal History</CardTitle>
                <CardDescription style={{ color: "#8A93A6" }}>
                  Your recent withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="p-4 rounded-lg"
                      style={{ background: "#06121F", borderLeft: "3px solid #E3B341" }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold" style={{ color: "#C9D1E2" }}>
                            ${parseFloat(withdrawal.grossAmount).toFixed(2)}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#8A93A6" }}>
                            Net: ${parseFloat(withdrawal.netAmount).toFixed(2)} in {withdrawal.destinationCurrency?.toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-xs" style={{ color: "#8A93A6" }}>
                        Requested: {new Date(withdrawal.requestedAt).toLocaleString()}
                      </p>
                      {withdrawal.destinationAddress && (
                        <p className="text-xs mt-1 font-mono" style={{ color: "#8A93A6" }}>
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
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Alert style={{ background: "#1E2D3F", borderColor: "#E3B341" }}>
            <AlertTriangle className="h-4 w-4" style={{ color: "#E3B341" }} />
            <AlertDescription style={{ color: "#8A93A6" }}>
              <strong style={{ color: "#E3B341" }}>Important:</strong> All withdrawals are subject to admin approval. Funds are deducted immediately, but payouts are processed manually. Double-check your wallet address and network before submitting.
            </AlertDescription>
          </Alert>
        </motion.div>

      </div>
    </div>
  );
}
