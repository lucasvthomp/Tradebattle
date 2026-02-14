import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QRCodeSVG } from 'qrcode.react';

export default function Deposit() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usdttrc20');

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

  // Create payment
  async function createDeposit() {
    setLoading(true);
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
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      setPayment(data);

      // Start polling for status
      pollPaymentStatus(data.payment_id);
    } catch (error: any) {
      alert(error.message);
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
          alert('Payment received! Refreshing balance...');
          window.location.reload();
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          clearInterval(interval);
          alert('Payment failed or expired. Please try again.');
          setPayment(null);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  // Simple UI
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#C9D1E2', marginBottom: '20px' }}>Deposit Funds</h1>

      {/* Status Card */}
      <div style={{
        background: '#1E2D3F',
        border: '1px solid #2B3A4C',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#C9D1E2', marginBottom: '10px' }}>System Status</h3>
        <p style={{ color: status?.apiKeysSet ? '#28C76F' : '#FF4F58' }}>
          API Keys: {status?.apiKeysSet ? '✅ SET' : '❌ NOT SET'}
        </p>
        <p style={{ color: '#8A93A6' }}>
          Environment: {status?.environment}
        </p>
        {currencies.length > 0 && (
          <p style={{ color: '#8A93A6' }}>
            Available currencies: {currencies.length}
          </p>
        )}
      </div>

      {/* Deposit Form */}
      {!payment && status?.apiKeysSet && (
        <div style={{
          background: '#1E2D3F',
          border: '1px solid #2B3A4C',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ color: '#C9D1E2', marginBottom: '15px' }}>Create Deposit</h3>

          <input
            type="number"
            placeholder="Amount (USD)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              background: '#06121F',
              border: '1px solid #2B3A4C',
              borderRadius: '4px',
              color: '#C9D1E2',
            }}
          />

          <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              background: '#06121F',
              border: '1px solid #2B3A4C',
              borderRadius: '4px',
              color: '#C9D1E2',
            }}
          >
            <option value="usdttrc20">USDT (TRC20)</option>
            <option value="btc">Bitcoin</option>
            <option value="eth">Ethereum</option>
          </select>

          <button
            onClick={createDeposit}
            disabled={loading || !amount}
            style={{
              width: '100%',
              padding: '12px',
              background: '#E3B341',
              color: '#06121F',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading || !amount ? 'not-allowed' : 'pointer',
              opacity: loading || !amount ? 0.5 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Deposit'}
          </button>
        </div>
      )}

      {/* Payment Display */}
      {payment && (
        <div style={{
          background: '#1E2D3F',
          border: '1px solid #2B3A4C',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ color: '#C9D1E2', marginBottom: '15px' }}>Send Payment</h3>

          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <QRCodeSVG value={payment.pay_address} size={200} />
          </div>

          <p style={{ color: '#8A93A6', marginBottom: '5px' }}>Address:</p>
          <p style={{
            color: '#C9D1E2',
            wordBreak: 'break-all',
            background: '#06121F',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
          }}>
            {payment.pay_address}
          </p>

          <p style={{ color: '#8A93A6', marginBottom: '5px' }}>Amount:</p>
          <p style={{ color: '#C9D1E2', fontSize: '20px', marginBottom: '15px' }}>
            {payment.pay_amount} {payment.pay_currency.toUpperCase()}
          </p>

          <p style={{ color: '#E3B341', textAlign: 'center' }}>
            ⏳ Waiting for payment... (checking every 5 seconds)
          </p>
        </div>
      )}
    </div>
  );
}
