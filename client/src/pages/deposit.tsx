import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bitcoin, ArrowLeft, Copy, CheckCircle2, Loader2, AlertCircle, ExternalLink, Wallet, DollarSign, Clock, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CryptoPayment {
  paymentId: string;
  payAddress: string;
  payCurrency: string;
  payAmount: number;
  priceAmount: number;
  expirationTime: string;
}

interface Currency {
  code: string;
  name: string;
  network: string;
  estimatedFee: string;
  confirmationTime: string;
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Deposit() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("usdttrc20");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("waiting");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCurrencies();
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchCurrencies = async () => {
    try {
      const response = await apiRequest("GET", "/api/crypto/currencies");
      setCurrencies(response.currencies || []);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const handleCreatePayment = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 1) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is $1.00",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > 10000) {
      toast({
        title: "Maximum Deposit",
        description: "Maximum deposit amount is $10,000.00 per transaction",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/crypto/create-payment", {
        amount: amountNum,
        currency: selectedCurrency,
      });

      setPayment(response);
      setPaymentStatus("waiting");

      const interval = setInterval(() => {
        checkPaymentStatus(response.paymentId);
      }, 10000);

      setPollingInterval(interval);

      toast({
        title: "Payment Created",
        description: "Send crypto to the address below to complete your deposit",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await apiRequest("GET", `/api/crypto/payment/${paymentId}`);
      const status = response.paymentStatus;

      setPaymentStatus(status);

      if (status === "finished") {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        toast({
          title: "Deposit Confirmed! 🎉",
          description: `$${response.outcomeAmount} has been added to your balance`,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (status === "failed" || status === "expired" || status === "refunded") {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        toast({
          title: "Payment Failed",
          description: `Payment status: ${status}. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPayment(null);
    setAmount("");
    setPaymentStatus("waiting");
  };

  if (!user) {
    return null;
  }

  const presetAmounts = [10, 25, 50, 100];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div className="mb-8" {...fadeUpItem}>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Bitcoin className="w-8 h-8 text-primary" />
                Deposit Funds
              </h1>
              <p className="text-muted-foreground mt-2">
                Add crypto to your account securely
              </p>
            </div>
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    ${parseFloat(user.siteCash || "0").toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {!payment ? (
          /* Payment Creation Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Crypto Deposit
                </CardTitle>
                <CardDescription>
                  Fast & secure deposits with cryptocurrency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Deposit Amount (USD)</Label>

                  {/* Preset Amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {presetAmounts.map((preset) => (
                      <Button
                        key={preset}
                        variant={amount === preset.toString() ? "default" : "outline"}
                        onClick={() => setAmount(preset.toString())}
                        className="h-12"
                      >
                        ${preset}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max="10000"
                      step="0.01"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: $1.00 • Max: $10,000.00
                  </p>
                </div>

                <Separator />

                {/* Currency Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Cryptocurrency</Label>
                  <div className="grid gap-2">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => setSelectedCurrency(currency.code)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          selectedCurrency === currency.code
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{currency.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Network: {currency.network} • Fee: {currency.estimatedFee}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {currency.confirmationTime}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create Payment Button */}
                <Button
                  onClick={handleCreatePayment}
                  disabled={loading}
                  className="w-full h-12 font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Payment...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Create Deposit
                    </>
                  )}
                </Button>

                {/* Info Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How it works:</strong> Create a deposit, send crypto to the provided address,
                    and funds will be credited automatically once confirmed on the blockchain.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Payment Details & QR Code */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Complete Your Deposit</CardTitle>
                  {paymentStatus === "waiting" && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Payment
                    </Badge>
                  )}
                  {paymentStatus === "confirming" && (
                    <Badge className="gap-1 bg-blue-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Confirming...
                    </Badge>
                  )}
                  {paymentStatus === "finished" && (
                    <Badge className="gap-1 bg-green-500">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmed!
                    </Badge>
                  )}
                  {(paymentStatus === "failed" || paymentStatus === "expired") && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {paymentStatus === "expired" ? "Expired" : "Failed"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Info */}
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Deposit Amount:</span>
                      <span className="text-xl font-bold text-primary">
                        ${payment.priceAmount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Send Exactly:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {payment.payAmount} {payment.payCurrency.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-lg shadow-lg">
                    <QRCodeSVG value={payment.payAddress} size={200} />
                  </div>
                </div>

                {/* Payment Address */}
                <div className="space-y-2">
                  <Label>Deposit Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={payment.payAddress}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(payment.payAddress)}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">⚠️ Important Instructions:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Send <strong>exactly {payment.payAmount} {payment.payCurrency.toUpperCase()}</strong></li>
                      <li>• Use the <strong>{currencies.find(c => c.code === payment.payCurrency)?.network}</strong> network</li>
                      <li>• Funds will be credited after blockchain confirmation</li>
                      <li>• Do not refresh this page until payment is confirmed</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => window.open(`https://nowpayments.io/payment/${payment.paymentId}`, "_blank")}
                    className="flex-1"
                  >
                    View on NOWPayments
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Deposit History Link */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="link"
            onClick={() => navigate("/profile")}
            className="text-muted-foreground hover:text-foreground"
          >
            View Transaction History →
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
