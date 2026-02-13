# NOWPayments Crypto Payment Integration - Setup Guide

## Overview

Tradebattle now supports **crypto deposits** and **crypto withdrawals** via NOWPayments integration. This document explains how to set up and configure the system.

---

## Environment Variables Required

Add these to your `.env` file (and Railway environment variables):

```env
# NOWPayments API Configuration
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# Existing variables (keep these)
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_session_secret
```

---

## How to Get NOWPayments Credentials

### 1. Sign Up for NOWPayments

1. Go to [https://nowpayments.io](https://nowpayments.io)
2. Click "Sign Up" and create an account
3. Verify your email address

### 2. Get API Key

1. Log into your NOWPayments dashboard
2. Navigate to **Settings → API Keys**
3. Click "Generate API Key"
4. Copy the API key and add to `.env` as `NOWPAYMENTS_API_KEY`

### 3. Get IPN Secret Key

1. In the NOWPayments dashboard, go to **Settings → IPN (Instant Payment Notifications)**
2. Enable IPN callbacks
3. Set your IPN callback URL: `https://yourdomain.com/api/crypto/ipn`
4. Copy the IPN secret key and add to `.env` as `NOWPAYMENTS_IPN_SECRET`
5. Click "Save"

### 4. Test Mode (Sandbox)

- NOWPayments offers a sandbox environment for testing
- Sandbox API URL: `https://api-sandbox.nowpayments.io/v1`
- Get sandbox API key from **Settings → Sandbox**
- Update `server/services/nowPayments.ts` line 6 to use sandbox URL during testing

---

## Database Schema Updates

The following tables were added to the database (already defined in `shared/schema.ts`):

### 1. `crypto_charges` Table

Tracks NOWPayments deposit charges.

```sql
CREATE TABLE crypto_charges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  pay_address TEXT,
  pay_currency VARCHAR(10) NOT NULL,
  pay_amount VARCHAR(78) NOT NULL,
  price_amount NUMERIC(15,2) NOT NULL,
  price_currency VARCHAR(10) DEFAULT 'usd' NOT NULL,
  actually_paid VARCHAR(78),
  payment_status VARCHAR(50) DEFAULT 'waiting' NOT NULL,
  outcome_amount NUMERIC(15,2),
  network_fee VARCHAR(78),
  ipn_callback_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP,
  confirmed_at TIMESTAMP
);
```

### 2. `withdrawal_requests` Table

Tracks crypto withdrawal requests (manual admin approval).

```sql
CREATE TABLE withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  gross_amount NUMERIC(15,2) NOT NULL,
  site_fee NUMERIC(15,2) NOT NULL,
  transaction_fee NUMERIC(15,2) NOT NULL,
  net_amount NUMERIC(15,2) NOT NULL,
  withdrawal_method VARCHAR(20) NOT NULL,
  destination_address VARCHAR(255),
  destination_currency VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending_admin_approval' NOT NULL,
  transaction_hash VARCHAR(255),
  admin_note TEXT,
  rejection_reason TEXT,
  processed_by INTEGER REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 3. `stripe_payments` Table (for future Stripe integration)

```sql
CREATE TABLE stripe_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd' NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  last4 VARCHAR(4),
  card_brand VARCHAR(50),
  receipt_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  succeeded_at TIMESTAMP
);
```

**To apply schema changes:**

```bash
npm run db:push
```

---

## How It Works

### Deposit Flow

1. **User initiates deposit:**
   - User navigates to `/deposit`
   - Selects cryptocurrency (BTC, ETH, USDT TRC20, etc.)
   - Enters USD amount ($1 - $10,000)

2. **Payment creation:**
   - Frontend calls `POST /api/crypto/create-payment`
   - Server creates NOWPayments charge
   - Returns unique deposit address + QR code

3. **User sends crypto:**
   - User sends crypto to provided address
   - Payment status polls every 10 seconds via `GET /api/crypto/payment/:paymentId`

4. **Webhook confirmation:**
   - NOWPayments sends webhook to `POST /api/crypto/ipn`
   - Server verifies HMAC signature
   - Credits user's `siteCash` balance
   - Creates transaction log

5. **Balance updated:**
   - User sees confirmation toast
   - Page refreshes to show new balance

### Withdrawal Flow

1. **User requests withdrawal:**
   - User navigates to `/withdraw`
   - Enters amount, wallet address, and cryptocurrency
   - System calculates fees (25% site + 3% transaction = 28% total)

2. **Request submission:**
   - Frontend calls `POST /api/crypto/withdraw`
   - Server deducts full amount from user balance immediately
   - Creates `withdrawal_requests` record with status `pending_admin_approval`

3. **Admin reviews request:**
   - Admin views pending withdrawals (future admin panel)
   - Reviews destination address, amount, user account
   - Approves or rejects request

4. **Payout execution (manual):**
   - Admin manually sends crypto from hot wallet
   - Updates request status to `completed`
   - Records transaction hash

5. **User sees status:**
   - User views withdrawal history on `/withdraw` page
   - Shows status badges (Pending, Processing, Completed, Rejected)

---

## API Endpoints

### Deposit Endpoints

- `GET /api/crypto/currencies` - Get supported cryptocurrencies
- `POST /api/crypto/create-payment` - Create deposit payment
- `GET /api/crypto/payment/:paymentId` - Check payment status
- `POST /api/crypto/ipn` - NOWPayments webhook (internal)
- `GET /api/crypto/deposits` - User's deposit history

### Withdrawal Endpoints

- `POST /api/crypto/withdraw` - Request crypto withdrawal
- `GET /api/crypto/withdrawals` - User's withdrawal history

---

## Supported Cryptocurrencies

The system supports the following cryptocurrencies (configurable in `server/services/nowPayments.ts`):

| Currency | Network | Estimated Fee | Confirmation Time |
|----------|---------|---------------|-------------------|
| USDT (TRC20) | Tron | ~$0.01 | 1-2 min |
| USDT (ERC20) | Ethereum | $1-5 | 2-5 min |
| USDC | Ethereum | $1-5 | 2-5 min |
| Bitcoin | Bitcoin | $0.50-2 | 10-30 min |
| Ethereum | Ethereum | $1-5 | 2-5 min |
| Litecoin | Litecoin | $0.01-0.10 | 5-15 min |

**Recommended for users:** USDT TRC20 (lowest fees, fastest)

---

## Fee Structure

### Deposits

- **User pays:** $0 (Tradebattle absorbs fees)
- **NOWPayments fee:** 0.5% single-currency
- **Network fee:** ~$0.01 (USDT TRC20) to $1.50 (Ethereum)
- **Example:** User deposits $100 → NOWPayments charges $0.50 → User receives $99.50 in account

### Withdrawals

- **Site fee:** 25% of withdrawal amount
- **Transaction fee:** 3% of withdrawal amount
- **Total fees:** 28%
- **Example:** User withdraws $100 → Fees = $28 → User receives $72 in crypto

---

## Security Features

### Webhook Verification

- All IPN callbacks verify HMAC SHA-512 signature
- Prevents replay attacks and spoofed webhooks
- Signature verification in `verifyIPNSignature()`

### Balance Protection

- Withdrawal amount deducted immediately (prevents double-spending)
- Deposit fraud protection via blockchain confirmations
- User balance checks before withdrawal requests

### Admin Controls

- Manual approval required for all withdrawals
- Withdrawal limits enforced (`depositFrozen`, `withdrawalFrozen` user flags)
- Admin notes and rejection reasons tracked

---

## Testing Checklist

### Deposit Testing

- [ ] Create payment with valid amount
- [ ] QR code displays correctly
- [ ] Payment address is unique per transaction
- [ ] Status polling updates correctly
- [ ] Webhook signature verification passes
- [ ] Balance credited after webhook confirmation
- [ ] Transaction logged in database

### Withdrawal Testing

- [ ] Request withdrawal with valid wallet address
- [ ] Fee calculation correct (28% total)
- [ ] Balance deducted immediately
- [ ] Request appears in withdrawal history
- [ ] Status badge displays correctly
- [ ] Cannot overdraft balance

### Error Handling

- [ ] Invalid amounts rejected ($0, negative, > balance)
- [ ] Missing wallet address caught
- [ ] Invalid cryptocurrency selection caught
- [ ] Webhook signature mismatch returns 401
- [ ] Deposits frozen flag prevents deposits
- [ ] Withdrawals frozen flag prevents withdrawals

---

## Production Deployment

### Railway Setup

1. **Add environment variables:**
   - Go to Railway project settings
   - Add `NOWPAYMENTS_API_KEY`
   - Add `NOWPAYMENTS_IPN_SECRET`

2. **Database migration:**
   - Schema changes auto-apply via Drizzle on build
   - Verify tables exist: `crypto_charges`, `withdrawal_requests`, `stripe_payments`

3. **Webhook URL:**
   - Set IPN callback in NOWPayments dashboard
   - URL: `https://yourdomain.railway.app/api/crypto/ipn`
   - Ensure webhook is publicly accessible (no auth required)

4. **Test with small deposit:**
   - Make $1 USDT TRC20 deposit
   - Verify webhook received and balance updated
   - Check Railway logs for confirmation

---

## Hot/Cold Wallet Strategy (Future Implementation)

### Recommended Setup

- **Hot Wallet:** NOWPayments wallet (daily operations, < $10K balance)
- **Cold Wallet:** Hardware wallet (Ledger) for excess funds (> $10K)
- **Transfer Schedule:** Weekly sweep when hot > $10K

### Security Best Practices

1. Never store private keys in database
2. Use multi-sig for large withdrawals (> $1,000)
3. Enable IP whitelisting in NOWPayments dashboard
4. Rotate API keys quarterly
5. Monitor wallet balance alerts

---

## Cost Analysis

### Annual Projections (1,000 users, $100/month avg deposits)

- **Monthly deposits:** $100,000
- **NOWPayments fees (0.5%):** $500/month = $6,000/year
- **Network fees:** ~$100/month = $1,200/year
- **Total deposit costs:** $7,200/year

- **Monthly withdrawals:** ~$30,000 (30% withdrawal rate)
- **Withdrawal profit (28% fee):** $8,400/month = $100,800/year
- **NOWPayments payout fees (0.5%):** $150/month = $1,800/year

**Net annual profit:** $91,800 from payment fees alone

---

## Admin Tasks (Manual for Now)

### Daily Tasks

1. Check pending withdrawal requests
2. Verify user wallet addresses (not blacklisted)
3. Send crypto from hot wallet
4. Update request status to `completed`

### Weekly Tasks

1. Review deposit fraud (high-value, suspicious patterns)
2. Sweep excess funds to cold wallet
3. Reconcile NOWPayments balance vs database

### Monthly Tasks

1. Financial audit (deposits vs withdrawals)
2. Review user accounts with high transaction volume
3. Update supported cryptocurrencies if needed

---

## Future Enhancements

### Admin Panel (Task #5)

- View pending withdrawal requests
- Approve/reject with one click
- Auto-payout via NOWPayments API (optional)
- Transaction history dashboard

### Automated Withdrawals

- Set daily/weekly withdrawal limits per user
- Auto-approve small withdrawals (< $100)
- Manual review for large withdrawals (> $1,000)

### Additional Payment Methods

- Stripe card payments (already scaffolded)
- Bank transfers (ACH/wire)
- PayPal integration

---

## Support & Troubleshooting

### Common Issues

**Webhook not received:**
- Check Railway logs for incoming requests
- Verify IPN URL in NOWPayments dashboard
- Ensure NOWPAYMENTS_IPN_SECRET matches dashboard

**Signature verification fails:**
- Double-check IPN secret key in `.env`
- Verify raw body is used in signature check
- Check for trailing whitespace in secret key

**Balance not credited:**
- Check `crypto_charges` table for payment status
- Look for webhook in Railway logs
- Manually trigger payment status check: `GET /api/crypto/payment/:paymentId`

**Deposit expired:**
- NOWPayments payments expire after ~1 hour
- User must create new payment
- Old payment won't be credited even if paid

### Contact NOWPayments Support

- Email: support@nowpayments.io
- Live chat: Available on dashboard
- Response time: Usually within 24 hours

---

## Summary

✅ **Completed:**
- NOWPayments API integration
- Crypto deposit flow with QR codes
- Webhook IPN handling with signature verification
- Crypto withdrawal request system
- User deposit/withdrawal history
- Database schema with 3 new tables
- Fee calculation (28% withdrawal fee)
- Security controls (frozen accounts, balance checks)

⏳ **Pending (Future Tasks):**
- Admin panel for withdrawal approval (Task #5)
- Rate limiting on endpoints (Task #5)
- Hot/cold wallet management automation (Task #6)
- Stripe card payment integration (skipped per user request)
- Automated withdrawal execution

---

## Questions or Issues?

Contact the development team or refer to:
- NOWPayments API Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
- NOWPayments Dashboard: https://account.nowpayments.io
- Tradebattle GitHub: (your repo URL)
