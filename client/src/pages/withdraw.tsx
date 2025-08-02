import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  DollarSign,
  Minus,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Withdraw() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const currentBalance = Number(user?.siteCash) || 0;
  const presetAmounts = [10, 25, 50, 100].filter(amt => amt <= currentBalance);

  // Mutation for withdrawing site cash
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawAmount: number) => {
      const response = await apiRequest("POST", "/api/balance/withdraw", { amount: withdrawAmount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setAmount("");
      setSelectedAmount(null);
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${formatCurrency(data.amount || 0)} from your account.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    const withdrawAmount = selectedAmount || parseFloat(amount);
    if (withdrawAmount && withdrawAmount > 0 && withdrawAmount <= currentBalance) {
      withdrawMutation.mutate(withdrawAmount);
    }
  };

  const isValidAmount = () => {
    const withdrawAmount = selectedAmount || parseFloat(amount);
    return withdrawAmount > 0 && withdrawAmount <= currentBalance;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          {...fadeInUp}
        >
          <div className="flex items-center space-x-4">
            <Link href="/hub">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Minus className="w-8 h-8 mr-3 text-red-500" />
                Withdraw Funds
              </h1>
              <p className="text-muted-foreground mt-1">
                Withdraw funds from your account balance
              </p>
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
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdrawal Form */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Amount</CardTitle>
              <CardDescription>
                Choose a preset amount or enter a custom withdrawal amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amounts */}
              {presetAmounts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Quick Select</Label>
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
                      >
                        {formatCurrency(presetAmount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-medium">
                  Custom Amount
                </Label>
                <div className="relative mt-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                    min="0"
                    step="0.01"
                    max={currentBalance}
                  />
                </div>
              </div>

              {/* Warning for insufficient funds */}
              {(selectedAmount || parseFloat(amount)) > currentBalance && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Withdrawal amount cannot exceed your current balance of {formatCurrency(currentBalance)}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Withdraw Button */}
              <Button 
                onClick={handleWithdraw}
                disabled={
                  withdrawMutation.isPending || 
                  !isValidAmount() ||
                  currentBalance <= 0
                }
                className="w-full"
                variant="destructive"
              >
                {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Withdrawals are processed immediately and cannot be undone. 
              Make sure you enter the correct amount before proceeding.
            </AlertDescription>
          </Alert>
        </motion.div>

      </div>
    </div>
  );
}