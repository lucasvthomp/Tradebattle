import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Check,
  Loader2,
  Wallet,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

interface BalanceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdraw';
}

export function BalanceManagementModal({ isOpen, onClose, initialTab = 'deposit' }: BalanceManagementModalProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);

  // Deposit state
  const [depositStep, setDepositStep] = useState<'select' | 'amount' | 'payment'>('select');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [minimumAmount, setMinimumAmount] = useState(1);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedWithdrawAmount, setSelectedWithdrawAmount] = useState<number | null>(null);

  const currentBalance = Number(user?.siteCash) || 0;

  const currencies = [
    { id: 'usdttrc20', name: 'USDT', network: 'TRC20', icon: '₮', color: '#26A17B' },
    { id: 'btc', name: 'Bitcoin', network: 'BTC', icon: '₿', color: '#F7931A' },
    { id: 'eth', name: 'Ethereum', network: 'ETH', icon: 'Ξ', color: '#627EEA' },
    { id: 'ltc', name: 'Litecoin', network: 'LTC', icon: 'Ł', color: '#345D9D' },
  ];

  // Fetch minimum when currency selected
  useEffect(() => {
    if (selectedCurrency) {
      fetch(`/api/crypto/minimum/${selectedCurrency}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => setMinimumAmount(data.minimum || 1))
        .catch(() => setMinimumAmount(1));
    }
  }, [selectedCurrency]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setActiveTab(initialTab);
        setDepositStep('select');
        setSelectedCurrency('');
        setDepositAmount('');
        setPayment(null);
        setDepositError('');
        setWithdrawAmount('');
        setSelectedWithdrawAmount(null);
      }, 300);
    }
  }, [isOpen, initialTab]);

  // Withdraw fee calculation
  const SITE_FEE_PERCENTAGE = 25;
  const TRANSACTION_FEE_PERCENTAGE = 3;

  const getWithdrawalBreakdown = (amount: number) => {
    const siteFee = amount * (SITE_FEE_PERCENTAGE / 100);
    const transactionFee = amount * (TRANSACTION_FEE_PERCENTAGE / 100);
    const totalFees = siteFee + transactionFee;
    const subtotal = amount - totalFees;

    return {
      originalAmount: amount,
      siteFee,
      transactionFee,
      totalFees,
      subtotal: Math.max(0, subtotal)
    };
  };

  const currentWithdrawAmountValue = selectedWithdrawAmount || parseFloat(withdrawAmount) || 0;
  const withdrawBreakdown = getWithdrawalBreakdown(currentWithdrawAmountValue);
  const presetWithdrawAmounts = [10, 25, 50, 100].filter(amt => amt <= currentBalance);

  // Copy address handler
  async function copyAddress() {
    if (!payment?.pay_address) return;
    try {
      await navigator.clipboard.writeText(payment.pay_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  // Create deposit handler
  async function createDeposit() {
    setDepositLoading(true);
    setDepositError('');

    try {
      const response = await fetch('/api/crypto/create-payment', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          currency: selectedCurrency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      setPayment(data);
      setDepositStep('payment');
      pollPaymentStatus(data.payment_id);
    } catch (error: any) {
      setDepositError(error.message);
    } finally {
      setDepositLoading(false);
    }
  }

  // Poll payment status
  function pollPaymentStatus(paymentId: string) {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crypto/payment/${paymentId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (data.payment_status === 'finished') {
          clearInterval(interval);
          toast({
            title: "Payment Received!",
            description: "Your balance has been updated successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          onClose();
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          clearInterval(interval);
          setDepositError('Payment failed or expired.');
          setDepositStep('amount');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000);
  }

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/balance/withdraw", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setWithdrawAmount("");
      setSelectedWithdrawAmount(null);
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${formatCurrency(data.amount || 0)} from your account.`,
      });
      onClose();
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
    const amount = selectedWithdrawAmount || parseFloat(withdrawAmount);
    const breakdown = getWithdrawalBreakdown(amount);

    if (amount && amount > 0 && amount <= currentBalance && breakdown.subtotal >= 1) {
      withdrawMutation.mutate(amount);
    }
  };

  const isValidWithdrawAmount = () => {
    const amount = selectedWithdrawAmount || parseFloat(withdrawAmount);
    const breakdown = getWithdrawalBreakdown(amount);
    return amount > 0 && amount <= currentBalance && breakdown.subtotal >= 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-2" style={{
        background: '#1E2D3F',
        borderColor: '#E3B341',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(227, 179, 65, 0.2)'
      }}>
        <DialogHeader className="pb-4" style={{ borderBottom: '1px solid #2B3A4C' }}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Wallet className="w-7 h-7" style={{ color: '#E3B341' }} />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold" style={{ color: '#C9D1E2' }}>
                Balance Management
              </DialogTitle>
              <p className="text-sm mt-1" style={{ color: '#8A93A6' }}>
                Current Balance: <span className="font-semibold" style={{ color: '#E3B341' }}>{formatCurrency(currentBalance)}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdraw')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl" style={{ background: '#06121F' }}>
            <TabsTrigger
              value="deposit"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E3B341] data-[state=active]:to-[#D4A537] data-[state=active]:text-[#06121F] rounded-lg text-base font-bold flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E3B341] data-[state=active]:to-[#D4A537] data-[state=active]:text-[#06121F] rounded-lg text-base font-bold flex items-center gap-2"
            >
              <TrendingDown className="w-5 h-5" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          {/* DEPOSIT TAB */}
          <TabsContent value="deposit" className="mt-6 space-y-6">
            <AnimatePresence mode="wait">
              {depositError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{depositError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Step 1: Select Currency */}
              {depositStep === 'select' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <p className="text-sm" style={{ color: '#8A93A6' }}>
                    Select a cryptocurrency to deposit
                  </p>
                  <div className="grid gap-3">
                    {currencies.map((currency) => (
                      <motion.button
                        key={currency.id}
                        onClick={() => {
                          setSelectedCurrency(currency.id);
                          setDepositStep('amount');
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
                        style={{
                          background: '#06121F',
                          borderColor: '#2B3A4C',
                        }}
                        whileHover={{
                          scale: 1.02,
                          borderColor: currency.color,
                          boxShadow: `0 0 20px ${currency.color}30`,
                        }}
                      >
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${currency.color}30, ${currency.color}15)`,
                            color: currency.color,
                          }}
                        >
                          {currency.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-lg font-semibold" style={{ color: '#C9D1E2' }}>
                            {currency.name}
                          </div>
                          <div className="text-sm" style={{ color: '#8A93A6' }}>
                            Network: {currency.network}
                          </div>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: currency.color }}>→</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Enter Amount */}
              {depositStep === 'amount' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setDepositStep('select')}
                    className="flex items-center gap-2 px-2"
                    style={{ color: '#8A93A6' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change Currency
                  </Button>

                  <Card className="p-4 border-2" style={{
                    background: '#06121F',
                    borderColor: `${currencies.find(c => c.id === selectedCurrency)?.color}40`,
                  }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{
                          background: `${currencies.find(c => c.id === selectedCurrency)?.color}20`,
                          color: currencies.find(c => c.id === selectedCurrency)?.color,
                        }}
                      >
                        {currencies.find(c => c.id === selectedCurrency)?.icon}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: '#C9D1E2' }}>
                          {currencies.find(c => c.id === selectedCurrency)?.name}
                        </div>
                        <div className="text-sm" style={{ color: '#8A93A6' }}>
                          {currencies.find(c => c.id === selectedCurrency)?.network}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6" style={{ color: '#E3B341' }} />
                      <Input
                        type="number"
                        placeholder={minimumAmount.toFixed(2)}
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        min={minimumAmount}
                        step="0.01"
                        className="pl-12 h-16 text-2xl font-bold border-2 rounded-xl"
                        style={{
                          background: '#06121F',
                          borderColor: '#2B3A4C',
                          color: '#C9D1E2',
                        }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>
                      Minimum: ${minimumAmount.toFixed(2)} • Maximum: $10,000
                    </p>
                  </div>

                  <Button
                    onClick={createDeposit}
                    disabled={depositLoading || !depositAmount || parseFloat(depositAmount) < minimumAmount}
                    className="w-full h-14 text-lg font-bold rounded-xl"
                    style={{
                      background: depositLoading || !depositAmount || parseFloat(depositAmount) < minimumAmount
                        ? '#2B3A4C'
                        : 'linear-gradient(135deg, #E3B341 0%, #D4A537 100%)',
                      color: depositLoading || !depositAmount || parseFloat(depositAmount) < minimumAmount
                        ? '#8A93A6'
                        : '#06121F',
                      boxShadow: depositLoading || !depositAmount || parseFloat(depositAmount) < minimumAmount
                        ? 'none'
                        : '0 4px 20px rgba(227, 179, 65, 0.3)',
                    }}
                  >
                    {depositLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Payment...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {depositStep === 'payment' && payment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* QR Code */}
                  <motion.div
                    className="p-1.5 rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, #E3B341 0%, #D4A537 100%)',
                      boxShadow: '0 8px 32px rgba(227, 179, 65, 0.4)',
                    }}
                    animate={{
                      boxShadow: [
                        '0 8px 32px rgba(227, 179, 65, 0.4)',
                        '0 8px 40px rgba(227, 179, 65, 0.6)',
                        '0 8px 32px rgba(227, 179, 65, 0.4)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="bg-white p-8 rounded-[20px] flex justify-center">
                      <QRCodeSVG
                        value={payment.pay_address}
                        size={256}
                        level="H"
                        fgColor="#E3B341"
                        bgColor="transparent"
                      />
                    </div>
                  </motion.div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                      Send to this address
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-xl border-2" style={{
                      background: '#06121F',
                      borderColor: '#2B3A4C',
                    }}>
                      <code className="flex-1 text-sm font-mono break-all" style={{ color: '#C9D1E2' }}>
                        {payment.pay_address}
                      </code>
                      <Button
                        size="sm"
                        onClick={copyAddress}
                        className="shrink-0"
                        style={{
                          background: copied ? '#28C76F' : '#E3B341',
                          color: '#06121F',
                        }}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                      Amount to send
                    </label>
                    <div className="p-5 rounded-xl border-2 text-center" style={{
                      background: 'linear-gradient(135deg, #E3B341 0%, #D4A537 100%)',
                      borderColor: '#E3B341',
                      boxShadow: '0 4px 20px rgba(227, 179, 65, 0.3)',
                    }}>
                      <div className="text-3xl font-black" style={{ color: '#06121F' }}>
                        {payment.pay_amount} {payment.pay_currency.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <Alert className="border-2" style={{
                    background: 'rgba(227, 179, 65, 0.1)',
                    borderColor: '#E3B341',
                  }}>
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#E3B341' }} />
                    <AlertDescription>
                      <div className="font-bold mb-1" style={{ color: '#E3B341' }}>
                        Waiting for payment...
                      </div>
                      <div className="text-sm" style={{ color: '#8A93A6' }}>
                        Checking every 5 seconds. Do not close this window.
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* WITHDRAW TAB */}
          <TabsContent value="withdraw" className="mt-6 space-y-6">
            {/* Preset Amounts */}
            {presetWithdrawAmounts.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {presetWithdrawAmounts.map((amount) => (
                    <motion.button
                      key={amount}
                      onClick={() => {
                        setSelectedWithdrawAmount(amount);
                        setWithdrawAmount('');
                      }}
                      className="p-4 rounded-xl border-2 font-bold text-lg transition-all"
                      style={{
                        background: selectedWithdrawAmount === amount
                          ? 'linear-gradient(135deg, #E3B341 0%, #D4A537 100%)'
                          : '#06121F',
                        borderColor: selectedWithdrawAmount === amount ? '#E3B341' : '#2B3A4C',
                        color: selectedWithdrawAmount === amount ? '#06121F' : '#C9D1E2',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {formatCurrency(amount)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                Custom Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#E3B341' }} />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setSelectedWithdrawAmount(null);
                  }}
                  min="0"
                  step="0.01"
                  max={currentBalance}
                  className="pl-12 h-14 text-lg font-semibold border-2 rounded-xl"
                  style={{
                    background: '#06121F',
                    borderColor: '#2B3A4C',
                    color: '#C9D1E2',
                  }}
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            {currentWithdrawAmountValue > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-5 border" style={{
                  background: 'rgba(227, 179, 65, 0.08)',
                  borderColor: '#2B3A4C',
                }}>
                  <h4 className="font-bold mb-4" style={{ color: '#C9D1E2' }}>
                    Withdrawal Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#8A93A6' }}>Withdrawal Amount:</span>
                      <span className="font-semibold" style={{ color: '#C9D1E2' }}>
                        {formatCurrency(withdrawBreakdown.originalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#FF4F58' }}>Site Fee (-{SITE_FEE_PERCENTAGE}%):</span>
                      <span className="font-semibold" style={{ color: '#FF4F58' }}>
                        -{formatCurrency(withdrawBreakdown.siteFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#FF4F58' }}>Transaction Fee (-{TRANSACTION_FEE_PERCENTAGE}%):</span>
                      <span className="font-semibold" style={{ color: '#FF4F58' }}>
                        -{formatCurrency(withdrawBreakdown.transactionFee)}
                      </span>
                    </div>
                    <div className="pt-3 mt-3 flex justify-between border-t" style={{ borderColor: '#2B3A4C' }}>
                      <span className="font-bold" style={{ color: '#C9D1E2' }}>You will receive:</span>
                      <span className="font-black text-xl" style={{ color: '#28C76F' }}>
                        {formatCurrency(withdrawBreakdown.subtotal)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Warnings */}
            {(selectedWithdrawAmount || parseFloat(withdrawAmount)) > currentBalance && (
              <Alert variant="destructive">
                <AlertDescription>
                  Withdrawal amount cannot exceed your current balance of {formatCurrency(currentBalance)}.
                </AlertDescription>
              </Alert>
            )}

            {currentWithdrawAmountValue > 0 && withdrawBreakdown.subtotal < 1 && (
              <Alert variant="destructive">
                <AlertDescription>
                  After fees, you would receive less than $1.00. Consider withdrawing a larger amount.
                </AlertDescription>
              </Alert>
            )}

            {/* Withdraw Button */}
            <Button
              onClick={handleWithdraw}
              disabled={
                withdrawMutation.isPending ||
                !isValidWithdrawAmount() ||
                currentBalance <= 0
              }
              className="w-full h-14 text-lg font-bold rounded-xl"
              style={{
                background: withdrawMutation.isPending || !isValidWithdrawAmount() || currentBalance <= 0
                  ? '#2B3A4C'
                  : '#FF4F58',
                color: withdrawMutation.isPending || !isValidWithdrawAmount() || currentBalance <= 0
                  ? '#8A93A6'
                  : '#FFFFFF',
                boxShadow: withdrawMutation.isPending || !isValidWithdrawAmount() || currentBalance <= 0
                  ? 'none'
                  : '0 4px 20px rgba(255, 79, 88, 0.3)',
              }}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw Funds'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
