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
    const normalizedCurrency = currency.toLowerCase().trim();
    const data = await apiCall(
      `/min-amount?currency_from=usd&currency_to=${encodeURIComponent(normalizedCurrency)}&fiat_equivalent=usd`
    );
    console.log(`[NOWPayments] Minimum for ${normalizedCurrency}:`, data);

    // The API's min_amount is denominated in the source currency. Since the
    // product collects USD, prefer the explicit USD equivalent and keep a
    // small buffer for exchange-rate movement between this check and payment
    // creation.
    const fiatEquivalent = Number(data.fiat_equivalent);
    if (Number.isFinite(fiatEquivalent) && fiatEquivalent > 0) {
      return Math.max(Math.ceil(fiatEquivalent * 1.02 * 100) / 100, 5);
    }

    // Fallback for accounts/API versions that omit fiat_equivalent.
    const cryptoMinimum = Number(data.min_amount);
    if (Number.isFinite(cryptoMinimum) && cryptoMinimum > 0) {
      const estimate = await apiCall(
        `/estimate?amount=${cryptoMinimum}&currency_from=${encodeURIComponent(normalizedCurrency)}&currency_to=usd`
      );
      const estimatedUsd = Number(estimate.estimated_amount);
      if (Number.isFinite(estimatedUsd) && estimatedUsd > 0) {
        return Math.max(Math.ceil(estimatedUsd * 1.02 * 100) / 100, 5);
      }
    }

    return 5;
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

// Create payout (withdrawal) to user's wallet
export async function createPayout(params: {
  withdrawalId: string;
  address: string;
  currency: string;
  amount: number;
  ipnCallbackUrl?: string;
}) {
  console.log('[NOWPayments] Creating payout:', params);

  return await apiCall('/payout', 'POST', {
    withdrawals: [{
      address: params.address,
      currency: params.currency.toLowerCase(),
      amount: params.amount,
      ipn_callback_url: params.ipnCallbackUrl,
      unique_external_id: params.withdrawalId,
    }]
  });
}

// Get payout status
export async function getPayoutStatus(payoutId: string) {
  return await apiCall(`/payout/${payoutId}`);
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
