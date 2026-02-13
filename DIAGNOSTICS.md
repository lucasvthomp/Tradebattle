# 🔍 Crypto Payment System Diagnostics

## New Diagnostic Tools Deployed

I've just deployed improved diagnostic tools to help figure out why deposits aren't working, even though you added the API keys.

---

## How to Check System Status

### Option 1: Visit Deposit Page
1. Go to `https://yourdomain.railway.app/deposit`
2. Look at the top of the page - you'll see one of these alerts:

**🟢 Green Alert:**
```
✅ Payment system is operational and ready to accept deposits.
```
→ Everything is working! API keys are valid.

**🟡 Yellow Alert:**
```
⚠️ Payment System Not Configured
The administrator needs to add NOWPayments API keys to enable deposits.
Missing: NOWPAYMENTS_API_KEY
Missing: NOWPAYMENTS_IPN_SECRET
```
→ API keys are not set in Railway environment variables.

**🔴 Red Alert:**
```
❌ Invalid API Configuration
The NOWPayments API key is invalid or expired.
```
→ API keys are set but don't work (wrong key, typo, or expired).

### Option 2: API Call (Browser Console)
1. Go to your site
2. Open browser console (F12)
3. Run this command:
```javascript
fetch('/api/crypto/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('System Status:', d))
```

**Example Response (Working):**
```json
{
  "configured": true,
  "hasApiKey": true,
  "hasIpnSecret": true,
  "apiKeyValid": true,
  "apiError": null,
  "message": "NOWPayments configured and operational"
}
```

**Example Response (Not Configured):**
```json
{
  "configured": false,
  "hasApiKey": false,
  "hasIpnSecret": false,
  "apiKeyValid": false,
  "message": "NOWPayments API keys not configured in environment variables"
}
```

**Example Response (Invalid Key):**
```json
{
  "configured": true,
  "hasApiKey": true,
  "hasIpnSecret": true,
  "apiKeyValid": false,
  "apiError": "NOWPayments API error: 401",
  "message": "API key configured but invalid: NOWPayments API error: 401"
}
```

---

## Common Issues & Fixes

### Issue 1: "API keys not configured"
**Cause:** Environment variables not set in Railway

**Fix:**
1. Go to Railway dashboard → Your project → Variables tab
2. Check if these variables exist:
   - `NOWPAYMENTS_API_KEY`
   - `NOWPAYMENTS_IPN_SECRET`
3. If missing, add them:
   - Click "Add Variable"
   - Name: `NOWPAYMENTS_API_KEY`, Value: `<your key>`
   - Name: `NOWPAYMENTS_IPN_SECRET`, Value: `<your secret>`
4. Click "Deploy" to restart with new variables
5. Wait 2-3 minutes, then refresh deposit page

### Issue 2: "Invalid API Configuration"
**Cause:** API key is wrong, has typo, or is expired

**Possible Problems:**
1. **Wrong API Key Format**
   - NOWPayments API key format: Starts with letters/numbers, usually 32+ characters
   - Example: `abcd1234efgh5678ijkl9012mnop3456`
   - Make sure no spaces before/after when pasting

2. **Using Sandbox Key in Production**
   - NOWPayments has separate keys for sandbox vs production
   - Make sure you're using the PRODUCTION key

3. **Copied Wrong Key**
   - Go back to NOWPayments dashboard
   - Settings → API Keys
   - Copy the key again (click "Show" then copy)
   - Paste into Railway (replace existing value)

4. **Key Expired or Revoked**
   - Check NOWPayments dashboard
   - Generate a new API key
   - Update in Railway

**Fix Steps:**
1. Log into NOWPayments: https://nowpayments.io
2. Go to Settings → API Keys
3. Click "Show" on your API key
4. Copy it carefully (no extra spaces)
5. Go to Railway → Variables
6. Click on `NOWPAYMENTS_API_KEY` variable
7. Replace value with the new copy
8. Click "Deploy"
9. Wait 2-3 minutes
10. Check `/deposit` page - should show green alert now

### Issue 3: "Payment creation fails"
**Cause:** IPN secret is wrong

**Fix:**
1. NOWPayments dashboard → Settings → IPN
2. Make sure IPN is enabled (toggle ON)
3. Set callback URL: `https://yourdomain.railway.app/api/crypto/ipn`
4. Copy the IPN Secret Key
5. Railway → Variables → `NOWPAYMENTS_IPN_SECRET`
6. Update value
7. Deploy

---

## Testing After Fix

Once you see the **GREEN alert** on the deposit page:

1. **Test Currencies Loading:**
   - You should see 6 cryptocurrencies:
     - USDT (TRC20) ⭐ Recommended
     - USDT (ERC20)
     - USDC
     - Bitcoin
     - Ethereum
     - Litecoin

2. **Test Payment Creation:**
   - Enter amount: `$10`
   - Select: USDT (TRC20)
   - Click "Create Deposit & Get QR Code"
   - Should see:
     - QR code image ✅
     - Deposit address (starts with `T`) ✅
     - Amount in USDT ✅
     - Status: "Awaiting Payment" ✅

3. **Test Real Deposit (Optional):**
   - Send $1-5 USDT (TRC20) from your wallet
   - Watch status change:
     - "Awaiting Payment" → "Confirming..." → "Confirmed!"
   - Balance should update automatically

---

## Check Railway Logs

To see what's happening on the server:

1. Railway dashboard → Your service
2. Click "Deployments" tab
3. Click on latest deployment
4. View logs

**Look for these messages:**

**✅ Good Signs:**
```
Creating payment: User 123, Amount $10, Currency usdttrc20
Payment created successfully: NPM_abc123
```

**❌ Bad Signs:**
```
NOWPayments API request failed: Invalid API key
NOWPayments API error: 401
Error creating crypto payment
```

---

## Still Not Working?

If you've:
- ✅ Added API keys to Railway
- ✅ Verified keys are correct (no typos)
- ✅ Deployed and waited 3+ minutes
- ✅ Still see yellow/red alert

**Check these:**

1. **Railway Variables Tab Screenshot**
   - Take screenshot showing:
     - `NOWPAYMENTS_API_KEY` exists (don't show value)
     - `NOWPAYMENTS_IPN_SECRET` exists (don't show value)
   - Check if values are masked (they should be)

2. **NOWPayments Account Status**
   - Log into NOWPayments
   - Check if account is verified/active
   - Check if API key is enabled (not disabled/revoked)

3. **Railway Deployment Status**
   - Make sure latest deployment succeeded
   - Check if deployment is "Live" not "Building" or "Failed"

4. **Browser Console**
   - Go to deposit page
   - Open console (F12)
   - Look for errors
   - Share any red error messages

---

## Quick Verification Checklist

Run through this checklist:

- [ ] Railway Variables tab has `NOWPAYMENTS_API_KEY`
- [ ] Railway Variables tab has `NOWPAYMENTS_IPN_SECRET`
- [ ] Latest deployment is "Live" (not building/failed)
- [ ] Waited 3+ minutes after adding variables
- [ ] API key copied from NOWPayments production (not sandbox)
- [ ] No extra spaces when pasting keys
- [ ] IPN is enabled in NOWPayments dashboard
- [ ] IPN callback URL set to: `https://yourdomain.railway.app/api/crypto/ipn`
- [ ] Refreshed deposit page (Ctrl+F5 or Cmd+Shift+R)
- [ ] Logged out and logged back in

If all checked and still not working, **share screenshot of:**
1. Railway Variables tab (hide values)
2. Deposit page with the colored alert
3. Browser console errors (F12)

---

## What Changed (Just Deployed)

**New Features:**
1. ✅ `/api/crypto/status` endpoint - checks if API is configured
2. ✅ Color-coded alerts on deposit page (green/yellow/red)
3. ✅ Better error messages explaining specific issues
4. ✅ Console logging for debugging
5. ✅ Automatic API key validation on page load

**Now you'll know IMMEDIATELY:**
- Are API keys set? (Yellow alert if not)
- Are API keys valid? (Red alert if invalid)
- Is system ready? (Green alert if working)

No more guessing! 🎯
