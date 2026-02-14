import crypto from 'crypto';

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const API_BASE = 'https://api.nowpayments.io/v1';

// Simple fetch wrapper
async function apiCall(endpoint: string, method = 'GET', body?: any) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Check if API keys are set
export function hasApiKeys() {
  return !!(API_KEY && IPN_SECRET);
}

// Get available currencies
export async function getCurrencies() {
  const data = await apiCall('/currencies');
  return data.currencies || [];
}

// Get minimum payment amount for a currency
export async function getMinimumAmount(currency: string) {
  try {
    const data = await apiCall(`/min-amount?currency_from=usd&currency_to=${currency.toLowerCase()}`);
    console.log(`[NOWPayments] Minimum for ${currency}:`, data);

    // NOWPayments API can return very high minimums (e.g. $19.58)
    // This happens because they calculate based on network fees + volatility
    // For better UX, we'll use a fixed minimum of $5 for common currencies
    // and let NOWPayments reject if it's truly too low

    const fixedMinimums: Record<string, number> = {
      'usdttrc20': 5,  // USDT on Tron (low fees)
      'usdterc20': 10, // USDT on Ethereum (higher fees)
      'btc': 5,        // Bitcoin
      'eth': 10,       // Ethereum
      'ltc': 5,        // Litecoin (lower fees)
    };

    const fixedMin = fixedMinimums[currency.toLowerCase()];

    if (fixedMin) {
      console.log(`[NOWPayments] Using fixed minimum $${fixedMin} for ${currency} (API returned $${data.min_amount})`);
      return fixedMin;
    }

    // For other currencies, use API minimum or $5 default
    return data.min_amount || 5;
  } catch (error) {
    console.error(`Failed to get minimum for ${currency}:`, error);
    return 5;
  }
}

// Create payment
export async function createPayment(params: {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  orderId: string;
  ipnCallbackUrl: string;
}) {
  return await apiCall('/payment', 'POST', {
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency.toLowerCase(),
    pay_currency: params.payCurrency.toLowerCase(),
    ipn_callback_url: params.ipnCallbackUrl,
    order_id: params.orderId,
    order_description: `Tradebattle deposit`,
  });
}

// Get payment status
export async function getPaymentStatus(paymentId: string) {
  return await apiCall(`/payment/${paymentId}`);
}

// Verify IPN signature
export function verifyIPN(signature: string, rawBody: string): boolean {
  if (!IPN_SECRET) return false;

  const hmac = crypto
    .createHmac('sha512', IPN_SECRET)
    .update(rawBody)
    .digest('hex');

  return hmac === signature;
}
