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
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    checkSystemStatus();
    fetchCurrencies();
  }, [user, navigate]);

  const checkSystemStatus = async () => {
    try {
      console.log("[Deposit] Checking crypto system status...");
      const status = await apiRequest("GET", "/api/crypto/status");
      console.log("[Deposit] Status response:", status);

      // If we got an empty object or null, set error state
      if (!status || Object.keys(status).length === 0) {
        console.error("[Deposit] Received empty status response");
        setSystemStatus({
          configured: false,
          apiKeyValid: false,
          error: "Empty response from server - possible authentication issue",
          message: "Unable to check payment system status. Try refreshing the page or logging out and back in.",
        });
        return;
      }

      setSystemStatus(status);
    } catch (error: any) {
      console.error("[Deposit] Error checking system status:", error);
      setSystemStatus({
        configured: false,
        apiKeyValid: false,
        error: error.message || "Network error",
        message: "Failed to connect to payment system. Check your internet connection.",
      });
    }
  };

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

      // Check if response has error
      if (!response || !response.paymentId) {
        throw new Error("Invalid response from payment server. Please contact support.");
      }

      setPayment(response);
      setPaymentStatus("waiting");

      const interval = setInterval(() => {
        checkPaymentStatus(response.paymentId);
      }, 10000);

      setPollingInterval(interval);

      toast({
        title: "Payment Created! 🎉",
        description: "Your QR code is ready. Send crypto to complete your deposit.",
      });
    } catch (error: any) {
      console.error("Payment creation error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.status,
        data: error.data
      });

      // Better error messages
      let errorMessage = "Failed to create payment. ";

      // Check response data first (from apiRequest)
      const errorData = error.response?.data || error.data || error;

      if (errorData.error === "MISSING_API_KEYS" || errorData.error === "INVALID_API_KEY") {
        errorMessage = "⚠️ Payment system not configured. Administrator needs to add API keys.";
      } else if (errorData.error === "BELOW_MINIMUM") {
        errorMessage = errorData.message || "Amount too small for this cryptocurrency. Try a larger amount.";
      } else if (error.message?.includes("API key") || error.message?.includes("authentication")) {
        errorMessage = "⚠️ Payment system authentication failed. Please contact administrator.";
      } else if (error.message?.includes("minimum")) {
        errorMessage = "Amount too small for this cryptocurrency. Try a larger amount or different crypto.";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Deposit Failed",
        description: errorMessage,
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #06121F 0%, #0A1828 100%)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div className="mb-8" {...fadeUpItem}>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/hub")}
            style={{ color: '#C9D1E2' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: '#E3B341' }}>
                <Bitcoin className="w-10 h-10" style={{ color: '#E3B341' }} />
                Crypto Deposits
              </h1>
              <p className="mt-2 text-lg" style={{ color: '#8A93A6' }}>
                Fast, secure deposits with cryptocurrency • No fees • Instant credit
              </p>
            </div>
            <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#E3B341', borderWidth: '2px' }}>
              <CardContent className="p-6">
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: '#8A93A6' }}>Your Balance</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#E3B341' }}>
                    ${parseFloat(user.siteCash || "0").toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CRYPTO PAYMENT SYSTEM STATUS - DETAILED DEBUG INFO */}
        <Card className="mb-6" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
          <CardHeader>
            <CardTitle style={{ color: '#E3B341' }}>💳 Payment System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!systemStatus ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#8A93A6' }} />
                <span style={{ color: '#C9D1E2' }}>Checking payment system...</span>
              </div>
            ) : (
              <>
                {/* Configured Status */}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.configured ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span style={{ color: '#C9D1E2' }}>
                    <strong>API Keys:</strong> {systemStatus.configured ? '✅ Set in Railway' : '❌ NOT SET - Check Railway Variables'}
                  </span>
                </div>

                {/* API Valid Status */}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.apiKeyValid ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span style={{ color: '#C9D1E2' }}>
                    <strong>API Connection:</strong> {systemStatus.apiKeyValid ? '✅ Working' : '⚠️ Failed'}
                  </span>
                </div>

                {/* Environment */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span style={{ color: '#C9D1E2' }}>
                    <strong>Environment:</strong> {systemStatus.environment || 'production'}
                  </span>
                </div>

                {/* Currency Count */}
                {systemStatus.currencyCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span style={{ color: '#C9D1E2' }}>
                      <strong>Currencies:</strong> {systemStatus.currencyCount} available
                    </span>
                  </div>
                )}

                {/* Error Message - MOST IMPORTANT */}
                {systemStatus.error && (
                  <Alert className="mt-4 border-red-500 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-sm">
                      <strong className="text-red-500">🔥 EXACT ERROR:</strong>
                      <br />
                      <code className="text-xs bg-black/30 px-2 py-1 rounded mt-2 block">
                        {systemStatus.error}
                      </code>
                      <br />
                      <strong>What to tell developer:</strong>
                      <br />
                      "{systemStatus.message}"
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {systemStatus.configured && systemStatus.apiKeyValid && (
                  <Alert className="mt-4 border-green-500 bg-green-500/10">
                    <AlertCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="font-semibold" style={{ color: '#28C76F' }}>
                      {systemStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Debug Raw Response */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs" style={{ color: '#8A93A6' }}>
                    🔍 Show raw API response (for debugging)
                  </summary>
                  <pre className="text-xs bg-black/30 p-3 rounded mt-2 overflow-auto" style={{ color: '#C9D1E2' }}>
                    {JSON.stringify(systemStatus, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </CardContent>
        </Card>

        {!payment ? (
          /* Payment Creation Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
              <CardHeader style={{ backgroundColor: '#152233', borderBottom: '1px solid #2B3A4C' }}>
                <CardTitle className="flex items-center gap-3 text-xl" style={{ color: '#E3B341' }}>
                  <Wallet className="w-6 h-6" />
                  Create Crypto Deposit
                </CardTitle>
                <CardDescription style={{ color: '#8A93A6' }}>
                  Choose amount and cryptocurrency • Get instant QR code • Funds credited automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Deposit Amount</Label>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>

                  {/* Preset Amounts */}
                  <div className="grid grid-cols-4 gap-3">
                    {presetAmounts.map((preset) => (
                      <Button
                        key={preset}
                        variant={amount === preset.toString() ? "default" : "outline"}
                        onClick={() => setAmount(preset.toString())}
                        className="h-14 text-base font-semibold"
                      >
                        ${preset}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      type="number"
                      placeholder="Enter custom amount..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max="10000"
                      step="0.01"
                      className="pl-10 h-14 text-lg"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum: $1.00</span>
                    <span>Maximum: $10,000.00</span>
                  </div>
                </div>

                <Separator />

                {/* Currency Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Cryptocurrency</Label>
                  {currencies.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Loading payment options... If this persists, crypto deposits may not be configured yet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid gap-3">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => setSelectedCurrency(currency.code)}
                          className={`w-full p-5 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                            selectedCurrency === currency.code
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-base text-foreground">{currency.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Network: <span className="font-medium">{currency.network}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Fee: {currency.estimatedFee} • {currency.confirmationTime}
                              </p>
                            </div>
                            {selectedCurrency === currency.code && (
                              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Payment Button */}
                <Button
                  onClick={handleCreatePayment}
                  disabled={loading || !amount || parseFloat(amount) < 1 || currencies.length === 0}
                  className="w-full h-16 text-lg font-bold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Your Deposit...
                    </>
                  ) : currencies.length === 0 ? (
                    <>
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Crypto Deposits Unavailable
                    </>
                  ) : (
                    <>
                      <Bitcoin className="w-5 h-5 mr-2" />
                      Create Deposit & Get QR Code
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
