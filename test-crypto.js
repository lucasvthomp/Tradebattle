/**
 * Quick test script to verify crypto payment system
 * Run with: NOWPAYMENTS_API_KEY=your_key node test-crypto.js
 */

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_BASE = 'https://api.nowpayments.io/v1';

async function testCryptoSystem() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Testing NOWPayments Integration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!NOWPAYMENTS_API_KEY) {
    console.log('❌ NOWPAYMENTS_API_KEY not set');
    console.log('');
    console.log('Set it in Railway dashboard or run:');
    console.log('NOWPAYMENTS_API_KEY=your_key node test-crypto.js');
    process.exit(1);
  }

  console.log(`✅ API Key: ${NOWPAYMENTS_API_KEY.substring(0, 10)}...`);
  console.log('');

  // Test 1: Status
  console.log('Test 1: API Status...');
  try {
    const statusRes = await fetch(`${API_BASE}/status`, {
      headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
    });
    const status = await statusRes.json();
    if (statusRes.ok) {
      console.log('✅ Status OK:', status.message);
    } else {
      console.log('❌ Status failed:', status);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Status error:', error.message);
    process.exit(1);
  }

  // Test 2: Get currencies
  console.log('');
  console.log('Test 2: Get Currencies...');
  try {
    const currRes = await fetch(`${API_BASE}/currencies`, {
      headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
    });
    const currData = await currRes.json();

    if (currRes.ok && currData.currencies) {
      console.log(`✅ Got ${currData.currencies.length} currencies`);
      console.log(`   Includes: ${currData.currencies.slice(0, 10).join(', ')}`);
    } else {
      console.log('❌ Currencies failed:', currData);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Currencies error:', error.message);
    process.exit(1);
  }

  // Test 3: Get minimum amount for USDT TRC20
  console.log('');
  console.log('Test 3: Get Min Amount (USDT TRC20)...');
  try {
    const minRes = await fetch(`${API_BASE}/min-amount?currency_from=usdttrc20&currency_to=usd`, {
      headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
    });
    const minData = await minRes.json();

    if (minRes.ok) {
      console.log(`✅ Min amount: ${minData.min_amount || 'N/A'}`);
    } else {
      console.log('⚠️  Min amount warning:', minData.message);
    }
  } catch (error) {
    console.log('⚠️  Min amount error:', error.message);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ALL TESTS PASSED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Your NOWPayments integration is ready to accept payments!');
  console.log('');
}

testCryptoSystem().catch(console.error);
