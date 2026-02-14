// Test script to check actual NOWPayments minimums
// Run this on Railway where API keys are set

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_BASE = 'https://api.nowpayments.io/v1';

async function testMinimum(currency) {
  try {
    const response = await fetch(`${API_BASE}/min-amount?currency_from=usd&currency_to=${currency}`, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    const data = await response.json();
    console.log(`${currency.toUpperCase()}: $${data.min_amount || 'ERROR'}`);
    return data;
  } catch (error) {
    console.error(`${currency}: Error -`, error.message);
  }
}

async function main() {
  console.log('\n=== NOWPayments Minimum Amounts ===\n');

  await testMinimum('usdttrc20');
  await testMinimum('btc');
  await testMinimum('eth');
  await testMinimum('usdterc20');
  await testMinimum('ltc');

  console.log('\n');
}

main();
