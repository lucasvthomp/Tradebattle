import crypto from 'crypto';

/**
 * NOWPayments Crypto Payment Service
 * Complete rebuild - Production ready
 */

// Environment configuration
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_ENVIRONMENT = process.env.NOWPAYMENTS_ENVIRONMENT || 'production';

// API base URL
const API_BASE_URL = NOWPAYMENTS_ENVIRONMENT === 'sandbox'
  ? 'https://api-sandbox.nowpayments.io/v1'
  : 'https://api.nowpayments.io/v1';

// Initialization logging
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 NOWPayments Service Initialized');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Environment: ${NOWPAYMENTS_ENVIRONMENT.toUpperCase()}`);
console.log(`API Base: ${API_BASE_URL}`);
console.log(`API Key Set: ${NOWPAYMENTS_API_KEY ? '✅ YES' : '❌ NO'}`);
console.log(`IPN Secret Set: ${NOWPAYMENTS_IPN_SECRET ? '✅ YES' : '❌ NO'}`);
if (NOWPAYMENTS_API_KEY) {
  console.log(`API Key Preview: ${NOWPAYMENTS_API_KEY.substring(0, 8)}...${NOWPAYMENTS_API_KEY.substring(NOWPAYMENTS_API_KEY.length - 4)}`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

/**
 * Make authenticated request to NOWPayments API
 */
async function makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPayments API key is not configured');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
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

  console.log(`[NOWPayments] ${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`[NOWPayments] ❌ Error ${response.status}:`, data);
      const errorMessage = data.message || data.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log(`[NOWPayments] ✅ Success ${method} ${endpoint}`);
    return data;
  } catch (error: any) {
    console.error(`[NOWPayments] 💥 Request failed:`, error.message);
    throw error;
  }
}

/**
 * Check API status
 */
export async function checkStatus() {
  try {
    const result = await makeRequest('/status');
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all available currencies
 */
export async function getAvailableCurrencies() {
  const result = await makeRequest('/currencies');
  return result.currencies || [];
}

/**
 * Get minimum payment amount for a currency pair
 */
export async function getMinimumAmount(currencyFrom: string, currencyTo: string = 'usd') {
  return await makeRequest(`/min-amount?currency_from=${currencyFrom.toLowerCase()}&currency_to=${currencyTo.toLowerCase()}`);
}

/**
 * Get price estimate
 */
export async function getEstimate(amount: number, currencyFrom: string, currencyTo: string) {
  return await makeRequest('/estimate', 'POST', {
    amount,
    currency_from: currencyFrom.toLowerCase(),
    currency_to: currencyTo.toLowerCase(),
  });
}

/**
 * Create a payment
 * This is the main function for creating crypto deposits
 */
export async function createPayment(params: {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  ipnCallbackUrl: string;
  orderId: string;
  orderDescription: string;
}) {
  const payload = {
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency.toLowerCase(),
    pay_currency: params.payCurrency.toLowerCase(),
    ipn_callback_url: params.ipnCallbackUrl,
    order_id: params.orderId,
    order_description: params.orderDescription,
  };

  console.log('[NOWPayments] Creating payment:', {
    amount: `$${params.priceAmount}`,
    currency: params.payCurrency.toUpperCase(),
    orderId: params.orderId,
  });

  return await makeRequest('/payment', 'POST', payload);
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string) {
  return await makeRequest(`/payment/${paymentId}`);
}

/**
 * Verify IPN signature
 */
export function verifyIPNSignature(signature: string, rawBody: string): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.error('[NOWPayments] ⚠️  IPN Secret not configured - cannot verify signature');
    return false;
  }

  const hmac = crypto
    .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
    .update(rawBody)
    .digest('hex');

  const isValid = hmac === signature;
  console.log(`[NOWPayments] IPN Signature: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
  return isValid;
}

/**
 * Create payout (withdrawal)
 */
export async function createPayout(params: {
  address: string;
  amount: number;
  currency: string;
}) {
  const payload = {
    withdrawals: [
      {
        address: params.address,
        amount: params.amount,
        currency: params.currency.toLowerCase(),
      },
    ],
  };

  console.log('[NOWPayments] Creating payout:', {
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    address: `${params.address.substring(0, 10)}...${params.address.substring(params.address.length - 6)}`,
  });

  return await makeRequest('/payout', 'POST', payload);
}

/**
 * Get payout status
 */
export async function getPayoutStatus(payoutId: string) {
  return await makeRequest(`/payout/${payoutId}`);
}

/**
 * Get recommended currencies (curated list)
 */
export function getRecommendedCurrencies() {
  return [
    {
      code: 'usdttrc20',
      name: 'USDT (TRC20)',
      network: 'Tron',
      estimatedFee: '$0.01',
      confirmationTime: '1-2 min',
    },
    {
      code: 'usdterc20',
      name: 'USDT (ERC20)',
      network: 'Ethereum',
      estimatedFee: '$1-5',
      confirmationTime: '2-5 min',
    },
    {
      code: 'usdc',
      name: 'USDC',
      network: 'Ethereum',
      estimatedFee: '$1-5',
      confirmationTime: '2-5 min',
    },
    {
      code: 'btc',
      name: 'Bitcoin',
      network: 'Bitcoin',
      estimatedFee: '$0.50-2',
      confirmationTime: '10-30 min',
    },
    {
      code: 'eth',
      name: 'Ethereum',
      network: 'Ethereum',
      estimatedFee: '$1-5',
      confirmationTime: '2-5 min',
    },
    {
      code: 'ltc',
      name: 'Litecoin',
      network: 'Litecoin',
      estimatedFee: '$0.01-0.10',
      confirmationTime: '5-15 min',
    },
  ];
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    console.log('[NOWPayments] Testing API connection...');

    // Test 1: Status endpoint
    const statusResult = await checkStatus();
    if (!statusResult.success) {
      return {
        success: false,
        error: `Status check failed: ${statusResult.error}`,
      };
    }

    // Test 2: Get currencies
    const currencies = await getAvailableCurrencies();
    if (!currencies || currencies.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch currencies',
      };
    }

    console.log(`[NOWPayments] ✅ Connection test passed - ${currencies.length} currencies available`);
    return {
      success: true,
      currencyCount: currencies.length,
    };
  } catch (error: any) {
    console.error('[NOWPayments] ❌ Connection test failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
