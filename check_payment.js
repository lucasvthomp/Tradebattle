// Quick script to check NOWPayments status and credit account if confirmed
import fetch from 'node-fetch';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const paymentId = '5653033856';

async function checkPayment() {
  try {
    console.log(`Checking payment ${paymentId}...`);
    
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('Payment data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPayment();
