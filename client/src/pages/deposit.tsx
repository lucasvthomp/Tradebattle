import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Loader2, AlertCircle, CheckCircle2, Clock, Wallet, X, RefreshCw } from 'lucide-react';

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
  const [minimumAmount, setMinimumAmount] = useState<number>(1);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);

  // Load pending deposits from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pendingDeposits');
    if (saved) {
      try {
        const deposits = JSON.parse(saved);
        // Filter out expired deposits (older than 24 hours)
        const valid = deposits.filter((d: any) => {
          const age = Date.now() - d.createdAt;
          return age < 24 * 60 * 60 * 1000; // 24 hours
        });
        setPendingDeposits(valid);
        localStorage.setItem('pendingDeposits', JSON.stringify(valid));
      } catch (e) {
        console.error('Failed to load pending deposits:', e);
      }
    }
  }, []);

  // Save payment to localStorage when created
  useEffect(() => {
    if (payment) {
      const deposit = {
        ...payment,
        createdAt: Date.now(),
        amount: amount,
        currency: selectedCurrency,
      };
      const existing = pendingDeposits.filter(d => d.payment_id !== payment.payment_id);
      const updated = [...existing, deposit];
      setPendingDeposits(updated);
      localStorage.setItem('pendingDeposits', JSON.stringify(updated));
    }
  }, [payment]);

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

  // Fetch minimum amount when currency changes
  useEffect(() => {
    if (selectedCurrency) {
      fetch(`/api/crypto/minimum/${selectedCurrency}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => setMinimumAmount(data.minimum || 1))
        .catch(() => setMinimumAmount(1)); // Default to $1 on error
    }
  }, [selectedCurrency]);

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

  // Resume existing payment
  function resumePayment(deposit: any) {
    setPayment(deposit);
    setAmount(deposit.amount);
    setSelectedCurrency(deposit.currency);
    pollPaymentStatus(deposit.payment_id);
  }

  // Cancel/dismiss payment
  function cancelPayment(paymentId?: string) {
    if (paymentId) {
      // Remove from pending deposits
      const updated = pendingDeposits.filter(d => d.payment_id !== paymentId);
      setPendingDeposits(updated);
      localStorage.setItem('pendingDeposits', JSON.stringify(updated));
    }
    setPayment(null);
    setError('');
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
          // Remove from pending
          const updated = pendingDeposits.filter(d => d.payment_id !== paymentId);
          setPendingDeposits(updated);
          localStorage.setItem('pendingDeposits', JSON.stringify(updated));
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
    { value: 'btc',       label: 'BTC',  name: 'Bitcoin',  img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/btc.png' },
    { value: 'eth',       label: 'ETH',  name: 'Ethereum', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/eth.png' },
    { value: 'ltc',       label: 'LTC',  name: 'Litecoin', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ltc.png' },
    { value: 'sol',       label: 'SOL',  name: 'Solana',   img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/sol.png' },
    { value: 'usdttrc20', label: 'USDT', name: 'Tether',   img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdt.png' },
    { value: 'usdc',      label: 'USDC', name: 'USD Coin', img: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdc.png' },
  ];

  return (
    <div style={{
      minHeight: 'calc(100dvh - 4rem)',
      background: 'transparent',
      padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 20px)',
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
            <Wallet size={32} color="#00A3FF" />
            <h1 style={{
              color: '#C9D1E2',
              fontSize: 'clamp(18px, 6vw, 32px)',
              fontWeight: '700',
              margin: 0,
            }}>
              Add arena cash
            </h1>
          </div>
          <p style={{ color: '#8A93A6', fontSize: '16px', margin: 0 }}>
            Add arena cash with cryptocurrency
          </p>
        </div>

        {/* Pending Deposits */}
        {pendingDeposits.length > 0 && !payment && (
          <div style={{
            background: '#0C1829',
            border: '1px solid #00A3FF',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              color: '#00A3FF',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Clock size={18} />
              Pending cash adds ({pendingDeposits.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingDeposits.map((deposit) => (
                <div
                  key={deposit.payment_id}
                  style={{
                    background: 'transparent',
                    border: '1px solid #0E2040',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ color: '#C9D1E2', fontWeight: '600', marginBottom: '4px' }}>
                      ${deposit.amount} {deposit.currency.toUpperCase()}
                    </div>
                    <div style={{ color: '#8A93A6', fontSize: '12px' }}>
                      Created {new Date(deposit.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => resumePayment(deposit)}
                      style={{
                        padding: '8px 16px',
                        background: '#00A3FF',
                        color: '#091525',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <RefreshCw size={14} />
                      Resume
                    </button>
                    <button
                      onClick={() => cancelPayment(deposit.payment_id)}
                      style={{
                        padding: '8px',
                        background: '#0E2040',
                        color: '#C9D1E2',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Card */}
        <div style={{
          background: '#0C1829',
          border: '1px solid #0E2040',
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
              background: '#0C1829',
              border: '1px solid #0E2040',
              borderRadius: '12px',
              padding: 'clamp(20px, 5vw, 32px)',
            }}>
              <h3 style={{
                color: '#C9D1E2',
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
              }}>
                Set up a cash add
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
                  placeholder={`Minimum $${minimumAmount.toFixed(2)}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={minimumAmount}
                  max="10000"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: '2px solid #0E2040',
                    borderRadius: '8px',
                    color: '#C9D1E2',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00A3FF'}
                  onBlur={(e) => e.target.style.borderColor = '#0E2040'}
                />
                <div style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#8A93A6',
                }}>
                  Minimum add: ${minimumAmount.toFixed(2)} • Maximum: $10,000
                </div>
              </div>

              {/* Currency Selection */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ color: '#8A93A6', fontSize: '14px', fontWeight: '500', marginBottom: '12px', display: 'block' }}>
                  Select Cryptocurrency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {currencyOptions.map(option => {
                    const selected = selectedCurrency === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedCurrency(option.value)}
                        style={{
                          aspectRatio: '1',
                          padding: '0',
                          background: selected ? 'rgba(0,163,255,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `2px solid ${selected ? '#00A3FF' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: selected ? '0 0 16px rgba(0,163,255,0.15)' : 'none',
                        }}
                        onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                      >
                        <img
                          src={option.img}
                          alt={option.label}
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: selected ? '#00A3FF' : '#C9D1E2' }}>
                          {option.label}
                        </span>
                        <span style={{ fontSize: '10px', color: '#4B5563', marginTop: '-4px' }}>
                          {option.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={createDeposit}
                disabled={loading || !amount || parseFloat(amount) < minimumAmount}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading || !amount || parseFloat(amount) < minimumAmount ? '#0E2040' : '#00A3FF',
                  color: loading || !amount || parseFloat(amount) < minimumAmount ? '#8A93A6' : '#091525',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !amount || parseFloat(amount) < minimumAmount ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading && amount && parseFloat(amount) >= minimumAmount) {
                    e.currentTarget.style.background = '#0090E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && amount && parseFloat(amount) >= minimumAmount) {
                    e.currentTarget.style.background = '#00A3FF';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Preparing payment...
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    Add arena cash
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{
              background: '#0C1829',
              border: '1px solid #FF4F58',
              borderRadius: '12px',
              padding: 'clamp(20px, 5vw, 32px)',
              textAlign: 'center',
            }}>
              <AlertCircle size={48} color="#FF4F58" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#C9D1E2', fontSize: '20px', marginBottom: '8px' }}>
                Cash add unavailable
              </h3>
              <p style={{ color: '#8A93A6', margin: 0 }}>
                The crypto payment rail is not configured yet. Call the Pit Crew for help.
              </p>
            </div>
          )
        ) : (
          // Payment Display
          <div style={{
            background: '#0C1829',
            border: '1px solid #0E2040',
            borderRadius: '12px',
            padding: 'clamp(20px, 5vw, 32px)',
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
              <Clock size={24} color="#00A3FF" />
              Send payment
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
                Payment address
              </label>
              <div style={{
                background: 'transparent',
                border: '1px solid #0E2040',
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
                    background: copied ? '#28C76F' : '#0E2040',
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
                Amount to send
              </label>
              <div style={{
                background: 'transparent',
                border: '2px solid #00A3FF',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{
                  color: '#00A3FF',
                  fontSize: 'clamp(18px, 6vw, 28px)',
                  fontWeight: '700',
                  wordBreak: 'break-word',
                }}>
                  {payment.pay_amount} {payment.pay_currency.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{
              background: 'rgba(0, 163, 255, 0.1)',
              border: '1px solid #00A3FF',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <Loader2 size={20} color="#00A3FF" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#00A3FF', fontWeight: '600', marginBottom: '4px' }}>
                  Waiting on the payment...
                </div>
                <div style={{ color: '#8A93A6', fontSize: '14px' }}>
                  You can close this page and return later. This payment stays on the board for 24 hours.
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => cancelPayment()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0E2040',
                color: '#C9D1E2',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <X size={16} />
              Back to cash menu
            </button>
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
