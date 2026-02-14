import crypto from 'crypto';

// NOWPayments API configuration
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_ENVIRONMENT = process.env.NOWPAYMENTS_ENVIRONMENT || 'sandbox';

// API base URL - sandbox by default, production when env var is set
const NOWPAYMENTS_API_BASE = NOWPAYMENTS_ENVIRONMENT === 'production'
  ? 'https://api.nowpayments.io/v1'
  : 'https://api-sandbox.nowpayments.io/v1';

console.log(`[NOWPayments] Initializing in ${NOWPAYMENTS_ENVIRONMENT} mode`);
console.log(`[NOWPayments] API Base: ${NOWPAYMENTS_API_BASE}`);
console.log(`[NOWPayments] API Key configured: ${!!NOWPAYMENTS_API_KEY}`);
console.log(`[NOWPayments] IPN Secret configured: ${!!NOWPAYMENTS_IPN_SECRET}`);

// API request wrapper with error handling
async function nowPaymentsRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
) {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPAYMENTS_API_KEY is not configured. Please set it in your environment variables.');
  }

  const url = `${NOWPAYMENTS_API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'x-api-key': NOWPAYMENTS_API_KEY,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`[NOWPayments] ${method} ${endpoint}`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`[NOWPayments] API Error ${response.status}:`, data);
      throw new Error(data.message || `NOWPayments API error: ${response.status}`);
    }

    console.log(`[NOWPayments] ${method} ${endpoint} - Success`);
    return data;
  } catch (error: any) {
    console.error('[NOWPayments] Request failed:', error.message);
    throw error;
  }
}

/**
 * Get API status
 * Returns {message: "OK"} if API is working
 */
export async function getApiStatus(): Promise<{ message: string }> {
  return await nowPaymentsRequest('/status');
}

/**
 * Get available cryptocurrencies
 * Returns list of all supported currencies
 */
export async function getAvailableCurrencies(): Promise<{ currencies: string[] }> {
  return await nowPaymentsRequest('/currencies');
}

/**
 * Get minimum payment amount for a specific currency
 * @param currency - Crypto currency code (e.g., 'btc', 'eth', 'usdttrc20')
 */
export async function getMinimumAmount(currency: string): Promise<{ currency_from: string; currency_to: string; min_amount: number }> {
  return await nowPaymentsRequest(`/min-amount?currency_from=${currency.toLowerCase()}&currency_to=usd`);
}

/**
 * Get estimated price for crypto payment
 * @param amountUSD - USD amount to convert
 * @param currency - Target crypto currency
 */
export async function getEstimatedPrice(amountUSD: number, currency: string) {
  return await nowPaymentsRequest('/estimate', 'POST', {
    amount: amountUSD,
    currency_from: 'usd',
    currency_to: currency.toLowerCase(),
  });
}

/**
 * Create a crypto payment
 * @param userId - User ID for tracking
 * @param amountUSD - USD amount to charge
 * @param currency - Crypto currency to accept
 * @param ipnCallbackUrl - IPN webhook URL
 */
export async function createPayment(
  userId: number,
  amountUSD: number,
  currency: string,
  ipnCallbackUrl: string
) {
  return await nowPaymentsRequest('/payment', 'POST', {
    price_amount: amountUSD,
    price_currency: 'usd',
    pay_currency: currency.toLowerCase(),
    ipn_callback_url: ipnCallbackUrl,
    order_id: `user_${userId}_${Date.now()}`, // Unique order ID
    order_description: `Tradebattle deposit for user ${userId}`,
  });
}

/**
 * Get payment status
 * @param paymentId - NOWPayments payment ID
 */
export async function getPaymentStatus(paymentId: string) {
  return await nowPaymentsRequest(`/payment/${paymentId}`);
}

/**
 * Verify IPN callback signature
 * Ensures webhook requests are authentic
 * @param ipnSignature - HMAC signature from x-nowpayments-sig header
 * @param requestBody - Raw request body as string
 */
export function verifyIPNSignature(ipnSignature: string, requestBody: string): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.error('[NOWPayments] IPN Secret not configured, cannot verify signature');
    return false;
  }

  const hmac = crypto
    .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
    .update(requestBody)
    .digest('hex');

  return hmac === ipnSignature;
}

/**
 * Create a payout (withdrawal)
 * @param address - Destination crypto wallet address
 * @param amount - Amount in crypto currency
 * @param currency - Crypto currency code
 */
export async function createPayout(
  address: string,
  amount: number,
  currency: string
) {
  return await nowPaymentsRequest('/payout', 'POST', {
    withdrawals: [
      {
        address,
        amount,
        currency: currency.toLowerCase(),
      },
    ],
  });
}

/**
 * Get payout status
 * @param withdrawalId - NOWPayments withdrawal ID
 */
export async function getPayoutStatus(withdrawalId: string) {
  return await nowPaymentsRequest(`/payout/${withdrawalId}`);
}

/**
 * Get popular/recommended cryptocurrencies for deposits
 * Returns currencies with lowest fees and fastest confirmation
 */
export function getRecommendedCurrencies() {
  return [
    { code: 'usdttrc20', name: 'USDT (TRC20)', network: 'Tron', estimatedFee: '$0.01', confirmationTime: '1-2 min' },
    { code: 'usdterc20', name: 'USDT (ERC20)', network: 'Ethereum', estimatedFee: '$1-5', confirmationTime: '2-5 min' },
    { code: 'usdc', name: 'USDC', network: 'Ethereum', estimatedFee: '$1-5', confirmationTime: '2-5 min' },
    { code: 'btc', name: 'Bitcoin', network: 'Bitcoin', estimatedFee: '$0.50-2', confirmationTime: '10-30 min' },
    { code: 'eth', name: 'Ethereum', network: 'Ethereum', estimatedFee: '$1-5', confirmationTime: '2-5 min' },
    { code: 'ltc', name: 'Litecoin', network: 'Litecoin', estimatedFee: '$0.01-0.10', confirmationTime: '5-15 min' },
  ];
}
