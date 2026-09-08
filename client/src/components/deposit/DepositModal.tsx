import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Loader2, AlertCircle, CheckCircle2, Wallet, ArrowLeft } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'amount' | 'payment'>('select');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minimumAmount, setMinimumAmount] = useState(1);

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
        setStep('select');
        setSelectedCurrency('');
        setAmount('');
        setPayment(null);
        setError('');
      }, 300);
    }
  }, [isOpen]);

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

  async function createDeposit() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/crypto/create-payment', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: selectedCurrency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      setPayment(data);
      setStep('payment');
      pollPaymentStatus(data.payment_id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function pollPaymentStatus(paymentId: string) {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crypto/payment/${paymentId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (data.payment_status === 'finished') {
          clearInterval(interval);
          alert('Payment received! Your arena cash has been updated.');
          window.location.reload();
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          clearInterval(interval);
          setError('Payment failed or expired.');
          setStep('amount');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000);
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 20, 42, 0.95)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#0B1B2A',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #0E2040',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #0E2040',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step !== 'select' && (
              <button
                onClick={() => {
                  if (step === 'payment') {
                    setStep('amount');
                    setPayment(null);
                  } else {
                    setStep('select');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8A93A6',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Wallet size={24} color="#67E7BF" />
            <h2 style={{ color: '#C9D1E2', fontSize: '20px', fontWeight: '600', margin: 0 }}>
              Add arena cash
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8A93A6',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(255, 79, 88, 0.1)',
              border: '1px solid #FF4F58',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={18} color="#FF4F58" />
              <span style={{ color: '#FF4F58', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Step 1: Select Currency */}
          {step === 'select' && (
            <div>
              <p style={{ color: '#8A93A6', fontSize: '14px', marginBottom: '20px' }}>
                Choose a crypto rail for your cash add
              </p>
              <div style={{ display: 'grid', gap: '12px' }}>
                {currencies.map((currency) => (
                  <button
                    key={currency.id}
                    onClick={() => {
                      setSelectedCurrency(currency.id);
                      setStep('amount');
                    }}
                    style={{
                      background: 'transparent',
                      border: '2px solid #0E2040',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = currency.color;
                      e.currentTarget.style.background = `${currency.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#0E2040';
                      e.currentTarget.style.background = '#091525';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: `${currency.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: currency.color,
                      fontWeight: '600',
                    }}>
                      {currency.icon}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ color: '#C9D1E2', fontSize: '16px', fontWeight: '600' }}>
                        {currency.name}
                      </div>
                      <div style={{ color: '#8A93A6', fontSize: '13px' }}>
                        {currency.network}
                      </div>
                    </div>
                    <div style={{ color: currency.color, fontSize: '20px' }}>→</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 'amount' && (
            <div>
              <div style={{
                background: 'transparent',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: `2px solid ${currencies.find(c => c.id === selectedCurrency)?.color}40`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${currencies.find(c => c.id === selectedCurrency)?.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: currencies.find(c => c.id === selectedCurrency)?.color,
                  }}>
                    {currencies.find(c => c.id === selectedCurrency)?.icon}
                  </div>
                  <div>
                    <div style={{ color: '#C9D1E2', fontSize: '14px', fontWeight: '600' }}>
                      {currencies.find(c => c.id === selectedCurrency)?.name}
                    </div>
                    <div style={{ color: '#8A93A6', fontSize: '12px' }}>
                      {currencies.find(c => c.id === selectedCurrency)?.network}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8A93A6', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                  Amount (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8A93A6',
                    fontSize: '20px',
                    fontWeight: '600',
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    placeholder={minimumAmount.toFixed(2)}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min={minimumAmount}
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 36px',
                      background: 'transparent',
                      border: '2px solid #0E2040',
                      borderRadius: '12px',
                      color: '#C9D1E2',
                      fontSize: '20px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#67E7BF'}
                    onBlur={(e) => e.target.style.borderColor = '#0E2040'}
                  />
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8A93A6' }}>
                  Minimum: ${minimumAmount.toFixed(2)} • Maximum: $10,000
                </div>
              </div>

              <button
                onClick={createDeposit}
                disabled={loading || !amount || parseFloat(amount) < minimumAmount}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading || !amount || parseFloat(amount) < minimumAmount
                    ? '#0E2040'
                    : '#67E7BF',
                  color: loading || !amount || parseFloat(amount) < minimumAmount
                    ? '#8A93A6'
                    : '#091525',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !amount || parseFloat(amount) < minimumAmount
                    ? 'not-allowed'
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Preparing payment...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && payment && (
            <div>
              {/* QR Code with gold styling */}
              <div style={{
                background: 'linear-gradient(135deg, #67E7BF 0%, #2EBF9A 100%)',
                padding: '4px',
                borderRadius: '20px',
                marginBottom: '20px',
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <QRCodeSVG
                    value={payment.pay_address}
                    size={200}
                    level="H"
                    fgColor="#67E7BF"
                    bgColor="transparent"
                  />
                </div>
              </div>

              {/* Address */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#8A93A6', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                  Send to this address
                </label>
                <div style={{
                  background: 'transparent',
                  border: '1px solid #0E2040',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <code style={{
                    flex: 1,
                    color: '#C9D1E2',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}>
                    {payment.pay_address}
                  </code>
                  <button
                    onClick={copyAddress}
                    style={{
                      padding: '8px',
                      background: copied ? '#67E7BF' : '#0E2040',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#8A93A6', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                  Amount to send
                </label>
                <div style={{
                  background: 'linear-gradient(135deg, #67E7BF 0%, #2EBF9A 100%)',
                  border: '2px solid #67E7BF',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#091525', fontSize: '24px', fontWeight: '700' }}>
                    {payment.pay_amount} {payment.pay_currency.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{
                background: 'rgba(0, 163, 255, 0.1)',
                border: '1px solid #67E7BF',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Loader2 size={20} color="#67E7BF" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#67E7BF', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                    Waiting for payment...
                  </div>
                  <div style={{ color: '#8A93A6', fontSize: '12px' }}>
                    Checking every 5 seconds
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
