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
  const [withdrawStep, setWithdrawStep] = useState<'amount' | 'address' | 'confirm' | 'processing'>('amount');
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedWithdrawAmount, setSelectedWithdrawAmount] = useState<number | null>(null);
  const [withdrawCurrency, setWithdrawCurrency] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null);

  const currentBalance = Number(user?.siteCash) || 0;

  const currencies = [
    { id: 'btc',       name: 'Bitcoin',  network: 'BTC',   label: 'BTC',  color: '#F7931A', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/btc.png' },
    { id: 'eth',       name: 'Ethereum', network: 'ETH',   label: 'ETH',  color: '#627EEA', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/eth.png' },
    { id: 'ltc',       name: 'Litecoin', network: 'LTC',   label: 'LTC',  color: '#345D9D', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ltc.png' },
    { id: 'sol',       name: 'Solana',   network: 'SOL',   label: 'SOL',  color: '#9945FF', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/sol.png' },
    { id: 'usdttrc20', name: 'Tether',   network: 'TRC20', label: 'USDT', color: '#26A17B', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdt.png' },
    { id: 'usdc',      name: 'USD Coin', network: 'ERC20', label: 'USDC', color: '#2775CA', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdc.png' },
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
        setWithdrawStep('amount');
        setWithdrawAmount('');
        setSelectedWithdrawAmount(null);
        setWithdrawCurrency('');
        setWithdrawAddress('');
        setWithdrawalResult(null);
      }, 300);
    }
  }, [isOpen, initialTab]);

  // Withdraw fee calculation
  // Site takes 0% at withdrawal (we take 7.5% from tournament winnings instead)
  // NOWPayments charges max 0.5% transaction fee
  const SITE_FEE_PERCENTAGE = 0;
  const TRANSACTION_FEE_PERCENTAGE = 0.5;

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

        console.log('[Deposit] Payment status:', data);

        // Check for finished, confirmed, or partially_paid status
        if (data.payment_status === 'finished' || data.payment_status === 'confirmed' || data.payment_status === 'sending') {
          clearInterval(interval);
          toast({
            title: "Payment Received!",
            description: "Your balance has been updated successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          onClose();
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired' || data.payment_status === 'refunded') {
          clearInterval(interval);
          setDepositError('Payment failed or expired.');
          setDepositStep('amount');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000);
  }

  // Withdraw mutation - creates crypto payout
  const withdrawMutation = useMutation({
    mutationFn: async (params: { amount: number; currency: string; address: string }) => {
      console.log('[Withdraw] Sending request:', params);
      const response = await apiRequest("POST", "/api/crypto/withdraw", params);
      const data = await response.json();
      console.log('[Withdraw] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Withdrawal failed');
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('[Withdraw] Success:', data);
      setWithdrawalResult(data);
      setWithdrawStep('processing');

      // Poll withdrawal status
      pollWithdrawalStatus(data.withdrawalId);

      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal is being processed. This may take a few minutes.`,
      });
    },
    onError: (error: any) => {
      console.error('[Withdraw] Error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
      setWithdrawStep('amount');
    },
  });

  // Poll withdrawal status
  function pollWithdrawalStatus(withdrawalId: number) {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crypto/withdrawal-status/${withdrawalId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        console.log('[Withdrawal] Status:', data);

        if (data.status === 'sent' || data.status === 'confirmed') {
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          toast({
            title: "Withdrawal Complete!",
            description: `Your crypto has been sent to your wallet.`,
          });

          // Wait 2 seconds then close
          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          toast({
            title: "Withdrawal Failed",
            description: data.errorMessage || "The withdrawal could not be completed.",
            variant: "destructive",
          });
          setWithdrawStep('amount');
        }
      } catch (error) {
        console.error('Withdrawal status check failed:', error);
      }
    }, 5000);
  }

  const handleWithdraw = () => {
    const amount = selectedWithdrawAmount || parseFloat(withdrawAmount);
    const breakdown = getWithdrawalBreakdown(amount);

    if (amount && amount > 0 && amount <= currentBalance && breakdown.subtotal >= 1) {
      if (withdrawStep === 'amount') {
        setWithdrawStep('address');
      } else if (withdrawStep === 'address' && withdrawCurrency && withdrawAddress) {
        setWithdrawStep('confirm');
      } else if (withdrawStep === 'confirm') {
        withdrawMutation.mutate({
          amount,
          currency: withdrawCurrency,
          address: withdrawAddress,
        });
      }
    }
  };

  const isValidWithdrawAmount = () => {
    const amount = selectedWithdrawAmount || parseFloat(withdrawAmount);
    const breakdown = getWithdrawalBreakdown(amount);
    return amount > 0 && amount <= currentBalance && breakdown.subtotal >= 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border" style={{
        background: '#0C1829',
        borderColor: 'rgba(227,179,65,0.25)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(227,179,65,0.08)'
      }}>
        <DialogHeader className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: 'linear-gradient(135deg, rgba(227,179,65,0.2), rgba(227,179,65,0.06))',
              border: '1px solid rgba(227,179,65,0.3)',
            }}>
              <Wallet className="w-5 h-5" style={{ color: '#E3B341' }} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black" style={{ color: '#F1F5F9', letterSpacing: '-0.01em' }}>
                Wallet
              </DialogTitle>
              <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>
                Balance: <span className="font-black" style={{ color: '#E3B341' }}>{formatCurrency(currentBalance)}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdraw')} className="mt-3">
          <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <TabsTrigger
              value="deposit"
              className="rounded-lg text-sm font-black flex items-center gap-2 data-[state=active]:shadow-none"
              style={{ color: activeTab === 'deposit' ? '#000' : '#4B5563' }}
            >
              <TrendingUp className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="rounded-lg text-sm font-black flex items-center gap-2 data-[state=active]:shadow-none"
              style={{ color: activeTab === 'withdraw' ? '#000' : '#4B5563' }}
            >
              <TrendingDown className="w-4 h-4" />
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {currencies.map((currency) => (
                      <motion.button
                        key={currency.id}
                        onClick={() => {
                          setSelectedCurrency(currency.id);
                          setDepositStep('amount');
                        }}
                        style={{
                          aspectRatio: '1',
                          padding: '0',
                          background: 'rgba(255,255,255,0.03)',
                          border: '2px solid rgba(255,255,255,0.07)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        whileHover={{
                          scale: 1.04,
                          borderColor: currency.color,
                          boxShadow: `0 0 16px ${currency.color}40`,
                        }}
                      >
                        <img
                          src={currency.img}
                          alt={currency.label}
                          style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#C9D1E2' }}>
                          {currency.label}
                        </span>
                        <span style={{ fontSize: '10px', color: '#4B5563', marginTop: '-2px' }}>
                          {currency.network}
                        </span>
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
                    background: '#0C1829',
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
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: 'rgba(255,255,255,0.08)',
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
                        ? 'rgba(255,255,255,0.08)'
                        : 'linear-gradient(135deg, #E3B341 0%, #D4A537 100%)',
                      color: depositLoading || !depositAmount || parseFloat(depositAmount) < minimumAmount
                        ? '#8A93A6'
                        : '#0C1829',
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
                      background: '#0C1829',
                      borderColor: 'rgba(255,255,255,0.08)',
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
                          color: '#0C1829',
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
                      <div className="text-3xl font-black" style={{ color: '#0C1829' }}>
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
            <AnimatePresence mode="wait">
              {/* STEP 1: SELECT AMOUNT */}
              {withdrawStep === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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
                                : '#0C1829',
                              borderColor: selectedWithdrawAmount === amount ? '#E3B341' : 'rgba(255,255,255,0.08)',
                              color: selectedWithdrawAmount === amount ? '#0C1829' : '#C9D1E2',
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
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: 'rgba(255,255,255,0.08)',
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
                        borderColor: 'rgba(255,255,255,0.08)',
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
                            <span style={{ color: '#8A93A6' }}>Transaction Fee (-{TRANSACTION_FEE_PERCENTAGE}%):</span>
                            <span className="font-semibold" style={{ color: '#FF4F58' }}>
                              -{formatCurrency(withdrawBreakdown.transactionFee)}
                            </span>
                          </div>
                          <div className="pt-3 mt-3 flex justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
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

                  {/* Next Button */}
                  <Button
                    onClick={handleWithdraw}
                    disabled={!isValidWithdrawAmount() || currentBalance <= 0}
                    className="w-full h-14 text-lg font-bold rounded-xl"
                    style={{
                      background: !isValidWithdrawAmount() || currentBalance <= 0
                        ? 'rgba(255,255,255,0.08)'
                        : '#FF4F58',
                      color: !isValidWithdrawAmount() || currentBalance <= 0
                        ? '#8A93A6'
                        : '#FFFFFF',
                      boxShadow: !isValidWithdrawAmount() || currentBalance <= 0
                        ? 'none'
                        : '0 4px 20px rgba(255, 79, 88, 0.3)',
                    }}
                  >
                    Next: Enter Wallet Address
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: ENTER WALLET ADDRESS */}
              {withdrawStep === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setWithdrawStep('amount')}
                    className="mb-4"
                    style={{ color: '#8A93A6' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Amount
                  </Button>

                  {/* Select Currency */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {currencies.map((currency) => (
                        <motion.button
                          key={currency.id}
                          onClick={() => setWithdrawCurrency(currency.id)}
                          className="p-4 rounded-xl border-2 transition-all"
                          style={{
                            background: withdrawCurrency === currency.id
                              ? 'linear-gradient(135deg, rgba(227, 179, 65, 0.2), rgba(227, 179, 65, 0.1))'
                              : '#0C1829',
                            borderColor: withdrawCurrency === currency.id ? '#E3B341' : 'rgba(255,255,255,0.08)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-3xl mb-2">{currency.icon}</div>
                          <div className="font-bold" style={{ color: '#C9D1E2' }}>{currency.name}</div>
                          <div className="text-xs" style={{ color: '#8A93A6' }}>{currency.network}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Enter Wallet Address */}
                  {withdrawCurrency && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium" style={{ color: '#8A93A6' }}>
                        Your {currencies.find(c => c.id === withdrawCurrency)?.name} Wallet Address
                      </label>
                      <Input
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        placeholder="Enter your wallet address"
                        className="h-14 font-mono text-sm border-2 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#C9D1E2',
                        }}
                      />
                      <p className="text-xs" style={{ color: '#FF4F58' }}>
                        ⚠️ Double-check your address. Sending to the wrong address will result in permanent loss of funds.
                      </p>
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  <Button
                    onClick={handleWithdraw}
                    disabled={!withdrawCurrency || !withdrawAddress || withdrawAddress.length < 10}
                    className="w-full h-14 text-lg font-bold rounded-xl"
                    style={{
                      background: !withdrawCurrency || !withdrawAddress || withdrawAddress.length < 10
                        ? 'rgba(255,255,255,0.08)'
                        : '#FF4F58',
                      color: !withdrawCurrency || !withdrawAddress || withdrawAddress.length < 10
                        ? '#8A93A6'
                        : '#FFFFFF',
                    }}
                  >
                    Next: Review & Confirm
                  </Button>
                </motion.div>
              )}

              {/* STEP 3: CONFIRM WITHDRAWAL */}
              {withdrawStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setWithdrawStep('address')}
                    className="mb-4"
                    style={{ color: '#8A93A6' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Address
                  </Button>

                  <Card className="p-6 border-2" style={{
                    background: '#0C1829',
                    borderColor: '#E3B341',
                  }}>
                    <h3 className="text-xl font-bold mb-6" style={{ color: '#E3B341' }}>
                      Confirm Withdrawal
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Amount</p>
                        <p className="text-2xl font-black" style={{ color: '#C9D1E2' }}>
                          {formatCurrency(currentWithdrawAmountValue)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Cryptocurrency</p>
                        <p className="text-lg font-bold" style={{ color: '#C9D1E2' }}>
                          {currencies.find(c => c.id === withdrawCurrency)?.name} ({currencies.find(c => c.id === withdrawCurrency)?.network})
                        </p>
                      </div>

                      <div>
                        <p className="text-sm mb-1" style={{ color: '#8A93A6' }}>Wallet Address</p>
                        <code className="block p-3 rounded-lg text-sm font-mono break-all" style={{
                          background: '#0F1E33',
                          color: '#C9D1E2',
                        }}>
                          {withdrawAddress}
                        </code>
                      </div>

                      <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex justify-between mb-2">
                          <span style={{ color: '#8A93A6' }}>Transaction Fee</span>
                          <span style={{ color: '#FF4F58' }}>-{formatCurrency(withdrawBreakdown.transactionFee)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span style={{ color: '#C9D1E2' }}>You will receive</span>
                          <span style={{ color: '#28C76F' }}>{formatCurrency(withdrawBreakdown.subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Alert style={{ background: 'rgba(255, 79, 88, 0.1)', borderColor: '#FF4F58' }}>
                    <AlertDescription style={{ color: '#FF4F58' }}>
                      <strong>⚠️ Warning:</strong> Please verify your wallet address carefully. Cryptocurrency transactions cannot be reversed.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                    className="w-full h-14 text-lg font-bold rounded-xl"
                    style={{
                      background: '#FF4F58',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(255, 79, 88, 0.3)',
                    }}
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Withdrawal'
                    )}
                  </Button>
                </motion.div>
              )}

              {/* STEP 4: PROCESSING */}
              {withdrawStep === 'processing' && withdrawalResult && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-16 h-16 mx-auto" style={{ color: '#E3B341' }} />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#E3B341' }}>
                      Withdrawal Processing
                    </h3>
                    <p className="text-sm" style={{ color: '#8A93A6' }}>
                      Your withdrawal is being sent to the blockchain. This may take a few minutes.
                    </p>
                  </div>

                  <Card className="p-5" style={{ background: '#0C1829', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-sm space-y-2" style={{ color: '#8A93A6' }}>
                      <p>Amount: <span className="font-bold" style={{ color: '#C9D1E2' }}>{formatCurrency(withdrawalResult.amount)}</span></p>
                      <p>Currency: <span className="font-bold" style={{ color: '#C9D1E2' }}>{withdrawalResult.currency.toUpperCase()}</span></p>
                      <p>Status: <span className="font-bold" style={{ color: '#E3B341' }}>{withdrawalResult.status}</span></p>
                    </div>
                  </Card>

                  <Alert style={{ background: 'rgba(227, 179, 65, 0.1)', borderColor: '#E3B341' }}>
                    <AlertDescription style={{ color: '#8A93A6' }}>
                      You'll receive a notification when your withdrawal is complete. You can safely close this window.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
