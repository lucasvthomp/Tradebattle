import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bitcoin, ArrowLeft, Copy, CheckCircle2, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  // Cleanup polling on unmount
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

      // Start polling for payment status
      const interval = setInterval(() => {
        checkPaymentStatus(response.paymentId);
      }, 10000); // Check every 10 seconds

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

        // Refresh page after 3 seconds to show updated balance
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: "#06121F" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/hub")}
            style={{ color: "#8A93A6" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: "#C9D1E2" }}>Deposit Funds</h1>
          <p className="mt-2" style={{ color: "#8A93A6" }}>
            Current Balance: <span style={{ color: "#E3B341", fontWeight: "600" }}>${parseFloat(user.siteCash || "0").toFixed(2)}</span>
          </p>
        </div>

        {!payment ? (
          /* Payment Creation Form */
          <Card style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#FF8C42" }}>
                  <Bitcoin className="w-6 h-6" style={{ color: "#06121F" }} />
                </div>
                <div>
                  <CardTitle style={{ color: "#C9D1E2" }}>Crypto Deposit</CardTitle>
                  <p className="text-sm mt-1" style={{ color: "#8A93A6" }}>
                    Deposit with cryptocurrency • Fast & Secure
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label style={{ color: "#C9D1E2" }}>Deposit Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="10000"
                  step="0.01"
                  style={{
                    background: "#06121F",
                    borderColor: "#2B3A4C",
                    color: "#C9D1E2"
                  }}
                />
                <p className="text-xs" style={{ color: "#8A93A6" }}>
                  Min: $1.00 • Max: $10,000.00
                </p>
              </div>

              {/* Currency Selection */}
              <div className="space-y-3">
                <Label style={{ color: "#C9D1E2" }}>Select Cryptocurrency</Label>
                <div className="grid gap-2">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setSelectedCurrency(currency.code)}
                      className="w-full p-4 rounded-lg border-2 text-left transition-all"
                      style={{
                        background: selectedCurrency === currency.code ? "#2B3A4C" : "#06121F",
                        borderColor: selectedCurrency === currency.code ? "#E3B341" : "#2B3A4C",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold" style={{ color: "#C9D1E2" }}>{currency.name}</p>
                          <p className="text-xs mt-1" style={{ color: "#8A93A6" }}>
                            Network: {currency.network} • Fee: {currency.estimatedFee}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "#8A93A6" }}>
                            {currency.confirmationTime}
                          </p>
                        </div>
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
                style={{
                  background: "#E3B341",
                  color: "#06121F",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  "Create Deposit"
                )}
              </Button>

              {/* Info Box */}
              <div className="p-4 rounded-lg" style={{ background: "#06121F", borderLeft: "3px solid #E3B341" }}>
                <p className="text-sm" style={{ color: "#8A93A6" }}>
                  <strong style={{ color: "#E3B341" }}>How it works:</strong> Create a deposit, send crypto to the provided address, and funds will be credited automatically once confirmed on the blockchain.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Payment Details & QR Code */
          <Card style={{ background: "#1E2D3F", borderColor: "#2B3A4C" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: "#C9D1E2" }}>Complete Your Deposit</CardTitle>
                {paymentStatus === "waiting" && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#E3B341", color: "#06121F" }}>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Awaiting Payment
                  </span>
                )}
                {paymentStatus === "confirming" && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#4B9FFF", color: "#06121F" }}>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Confirming...
                  </span>
                )}
                {paymentStatus === "finished" && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#28C76F", color: "#06121F" }}>
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed!
                  </span>
                )}
                {(paymentStatus === "failed" || paymentStatus === "expired") && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#FF4F58", color: "#06121F" }}>
                    <AlertCircle className="w-3 h-3" />
                    {paymentStatus === "expired" ? "Expired" : "Failed"}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Info */}
              <div className="p-4 rounded-lg" style={{ background: "#06121F" }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: "#8A93A6" }}>Deposit Amount:</span>
                  <span className="text-xl font-bold" style={{ color: "#E3B341" }}>
                    ${payment.priceAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span style={{ color: "#8A93A6" }}>Send Exactly:</span>
                  <span className="font-mono font-semibold" style={{ color: "#C9D1E2" }}>
                    {payment.payAmount} {payment.payCurrency.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-6 rounded-lg" style={{ background: "#FFFFFF" }}>
                <QRCodeSVG value={payment.payAddress} size={200} />
              </div>

              {/* Payment Address */}
              <div className="space-y-2">
                <Label style={{ color: "#C9D1E2" }}>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={payment.payAddress}
                    readOnly
                    className="font-mono text-sm"
                    style={{
                      background: "#06121F",
                      borderColor: "#2B3A4C",
                      color: "#C9D1E2"
                    }}
                  />
                  <Button
                    onClick={() => copyToClipboard(payment.payAddress)}
                    variant="outline"
                    size="icon"
                    style={{ borderColor: "#2B3A4C" }}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#28C76F" }} />
                    ) : (
                      <Copy className="w-4 h-4" style={{ color: "#8A93A6" }} />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg space-y-2" style={{ background: "#06121F" }}>
                <p className="text-sm font-semibold" style={{ color: "#E3B341" }}>
                  ⚠️ Important Instructions:
                </p>
                <ul className="text-sm space-y-1" style={{ color: "#8A93A6" }}>
                  <li>• Send <strong style={{ color: "#C9D1E2" }}>exactly {payment.payAmount} {payment.payCurrency.toUpperCase()}</strong></li>
                  <li>• Use the <strong style={{ color: "#C9D1E2" }}>{currencies.find(c => c.code === payment.payCurrency)?.network}</strong> network</li>
                  <li>• Funds will be credited after blockchain confirmation</li>
                  <li>• Do not refresh this page until payment is confirmed</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: "#2B3A4C", color: "#8A93A6" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => window.open(`https://nowpayments.io/payment/${payment.paymentId}`, "_blank")}
                  className="flex-1"
                  style={{ background: "#4B9FFF", color: "#06121F" }}
                >
                  View on NOWPayments
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposit History Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/deposit/history")}
            className="text-sm hover:underline"
            style={{ color: "#8A93A6" }}
          >
            View Deposit History →
          </button>
        </div>
      </div>
    </div>
  );
}
