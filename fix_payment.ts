// Script to check NOWPayments status and manually credit muri's account
import { db } from './server/db.js';
import { users, adminLogs } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const paymentId = '5653033856';
const username = 'muri';
const depositAmount = 20; // $20 BTC deposit

async function checkAndCreditPayment() {
  try {
    // 1. Check payment status with NOWPayments
    console.log(`\n[1/4] Checking payment ${paymentId} with NOWPayments...`);

    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY!,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.status}`);
    }

    const paymentData = await response.json();
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));

    // 2. Get user from database
    console.log(`\n[2/4] Looking up user "${username}"...`);
    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
      throw new Error(`User "${username}" not found`);
    }

    console.log(`Found user: ID=${user.id}, Current balance=$${user.siteCash}`);

    // 3. Calculate new balance
    const currentBalance = parseFloat(user.siteCash?.toString() || '0');
    const newBalance = currentBalance + depositAmount;

    console.log(`\n[3/4] Updating balance: $${currentBalance} → $${newBalance}`);

    // 4. Update user balance
    await db.update(users)
      .set({ siteCash: newBalance.toString() })
      .where(eq(users.id, user.id));

    // 5. Create admin log
    await db.insert(adminLogs).values({
      adminUserId: user.id,
      targetUserId: user.id,
      action: 'balance_deposit',
      oldValue: currentBalance.toString(),
      newValue: newBalance.toString(),
      notes: `Manual crypto deposit credit - Payment ID: ${paymentId} - Status: ${paymentData.payment_status} - Amount: $${depositAmount}`,
      createdAt: new Date(),
    });

    console.log(`\n[4/4] ✅ SUCCESS! Credited $${depositAmount} to ${username}'s account`);
    console.log(`Payment status from NOWPayments: ${paymentData.payment_status}`);
    console.log(`New balance: $${newBalance}`);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  }
}

// Run the script
checkAndCreditPayment()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
