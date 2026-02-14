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

    // Set minimums to ABSOLUTE LOWEST possible
    // Ignore network fees and confirmation times
    // Let NOWPayments reject if truly too low - we'll show their error
    // Goal: Make deposits as accessible as possible

    const fixedMinimums: Record<string, number> = {
      'usdttrc20': 1,   // USDT on Tron - try $1
      'usdterc20': 1,   // USDT on Ethereum - try $1
      'btc': 1,         // Bitcoin - try $1
      'eth': 1,         // Ethereum - try $1
      'ltc': 1,         // Litecoin - try $1
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
