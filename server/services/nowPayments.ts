import crypto from 'crypto';

// NOWPayments API configuration
// Hardcoded temporarily to bypass Railway env var issues
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'SBCN5M7-VXMM732-NARR69B-JN8E0BQ';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'MFCEpLwGnb36wKjKGG2LEyFo7P8CJubZ';
const NOWPAYMENTS_API_BASE = 'https://api.nowpayments.io/v1';

// API request wrapper with error handling
async function nowPaymentsRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
) {
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
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `NOWPayments API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('NOWPayments API request failed:', error);
    throw error;
  }
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
export async function getMinimumAmount(currency: string): Promise<{ currency: string; min_amount: number }> {
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
