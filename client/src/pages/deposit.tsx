import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Loader2, AlertCircle, CheckCircle2, Clock, Wallet } from 'lucide-react';

export default function Deposit() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usdttrc20');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Load status - NO CACHING
  useEffect(() => {
    fetch('/api/crypto/status', { cache: 'no-store' })
      .then(r => r.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  // Load currencies - NO CACHING
  useEffect(() => {
    if (status?.apiKeysSet) {
      fetch('/api/crypto/currencies', { cache: 'no-store' })
        .then(r => r.json())
        .then(data => setCurrencies(data.currencies || []))
        .catch(console.error);
    }
  }, [status]);

  // Copy address to clipboard
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

  // Create payment
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

      // Start polling for status
      pollPaymentStatus(data.payment_id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Poll payment status - NO CACHING
  function pollPaymentStatus(paymentId: string) {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crypto/payment/${paymentId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (data.payment_status === 'finished') {
          clearInterval(interval);
          setPayment(null);
          setAmount('');
          alert('Payment received! Your balance has been updated.');
          window.location.reload();
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          clearInterval(interval);
          setError('Payment failed or expired. Please try again.');
          setPayment(null);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000);
  }

  const currencyOptions = [
    { value: 'usdttrc20', label: 'USDT (TRC20)', icon: '₮' },
    { value: 'btc', label: 'Bitcoin', icon: '₿' },
    { value: 'eth', label: 'Ethereum', icon: 'Ξ' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06121F',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <Wallet size={32} color="#E3B341" />
            <h1 style={{
              color: '#C9D1E2',
              fontSize: '32px',
              fontWeight: '700',
              margin: 0,
            }}>
              Deposit Funds
            </h1>
          </div>
          <p style={{ color: '#8A93A6', fontSize: '16px', margin: 0 }}>
            Add funds to your Tradebattle account using cryptocurrency
          </p>
        </div>

        {/* Status Card */}
        <div style={{
          background: '#1E2D3F',
          border: '1px solid #2B3A4C',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            color: '#C9D1E2',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={20} />
            System Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {status?.apiKeysSet ? (
                <CheckCircle2 size={18} color="#28C76F" />
              ) : (
                <AlertCircle size={18} color="#FF4F58" />
              )}
              <span style={{
                color: status?.apiKeysSet ? '#28C76F' : '#FF4F58',
                fontWeight: '500',
              }}>
                API Keys: {status?.apiKeysSet ? 'Connected' : 'Not Configured'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#8A93A6',
              }} />
              <span style={{ color: '#8A93A6' }}>
                Environment: <span style={{ color: '#C9D1E2' }}>{status?.environment || 'loading...'}</span>
              </span>
            </div>

            {currencies.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#28C76F" />
                <span style={{ color: '#8A93A6' }}>
                  Currencies: <span style={{ color: '#C9D1E2' }}>{currencies.length} available</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!payment ? (
          // Deposit Form
          status?.apiKeysSet ? (
            <div style={{
              background: '#1E2D3F',
              border: '1px solid #2B3A4C',
              borderRadius: '12px',
              padding: '32px',
            }}>
              <h3 style={{
                color: '#C9D1E2',
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
              }}>
                Create Deposit
              </h3>

              {error && (
                <div style={{
                  background: 'rgba(255, 79, 88, 0.1)',
                  border: '1px solid #FF4F58',
                  borderRadius: '8px',
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

              {/* Amount Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#8A93A6',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Amount (USD)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  max="10000"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#06121F',
                    border: '2px solid #2B3A4C',
                    borderRadius: '8px',
                    color: '#C9D1E2',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E3B341'}
                  onBlur={(e) => e.target.style.borderColor = '#2B3A4C'}
                />
              </div>

              {/* Currency Selection */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  color: '#8A93A6',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  display: 'block',
                }}>
                  Select Cryptocurrency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {currencyOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedCurrency(option.value)}
                      style={{
                        padding: '16px',
                        background: selectedCurrency === option.value ? 'rgba(227, 179, 65, 0.1)' : '#06121F',
                        border: `2px solid ${selectedCurrency === option.value ? '#E3B341' : '#2B3A4C'}`,
                        borderRadius: '8px',
                        color: selectedCurrency === option.value ? '#E3B341' : '#C9D1E2',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCurrency !== option.value) {
                          e.currentTarget.style.borderColor = '#8A93A6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCurrency !== option.value) {
                          e.currentTarget.style.borderColor = '#2B3A4C';
                        }
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{option.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={createDeposit}
                disabled={loading || !amount || parseFloat(amount) < 1}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading || !amount || parseFloat(amount) < 1 ? '#2B3A4C' : '#E3B341',
                  color: loading || !amount || parseFloat(amount) < 1 ? '#8A93A6' : '#06121F',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !amount || parseFloat(amount) < 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading && amount && parseFloat(amount) >= 1) {
                    e.currentTarget.style.background = '#D4A537';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && amount && parseFloat(amount) >= 1) {
                    e.currentTarget.style.background = '#E3B341';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Creating Payment...
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    Create Deposit
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{
              background: '#1E2D3F',
              border: '1px solid #FF4F58',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
            }}>
              <AlertCircle size={48} color="#FF4F58" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#C9D1E2', fontSize: '20px', marginBottom: '8px' }}>
                Payment System Unavailable
              </h3>
              <p style={{ color: '#8A93A6', margin: 0 }}>
                The crypto payment system is not configured. Please contact support.
              </p>
            </div>
          )
        ) : (
          // Payment Display
          <div style={{
            background: '#1E2D3F',
            border: '1px solid #2B3A4C',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <h3 style={{
              color: '#C9D1E2',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Clock size={24} color="#E3B341" />
              Send Payment
            </h3>

            {/* QR Code */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <QRCodeSVG value={payment.pay_address} size={220} />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: '#8A93A6',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block',
              }}>
                Deposit Address
              </label>
              <div style={{
                background: '#06121F',
                border: '1px solid #2B3A4C',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <code style={{
                  flex: 1,
                  color: '#C9D1E2',
                  fontSize: '14px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}>
                  {payment.pay_address}
                </code>
                <button
                  onClick={copyAddress}
                  style={{
                    padding: '8px',
                    background: copied ? '#28C76F' : '#2B3A4C',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: '#8A93A6',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block',
              }}>
                Amount to Send
              </label>
              <div style={{
                background: '#06121F',
                border: '2px solid #E3B341',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{
                  color: '#E3B341',
                  fontSize: '28px',
                  fontWeight: '700',
                }}>
                  {payment.pay_amount} {payment.pay_currency.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{
              background: 'rgba(227, 179, 65, 0.1)',
              border: '1px solid #E3B341',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Loader2 size={20} color="#E3B341" style={{ animation: 'spin 1s linear infinite' }} />
              <div>
                <div style={{ color: '#E3B341', fontWeight: '600', marginBottom: '4px' }}>
                  Waiting for payment...
                </div>
                <div style={{ color: '#8A93A6', fontSize: '14px' }}>
                  Checking status every 5 seconds. Do not close this page.
                </div>
              </div>
            </div>
          </div>
        )}
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
