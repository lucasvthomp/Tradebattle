# 🚀 QUICK START - Enable Crypto Deposits

## ⚠️ CRITICAL: Environment Variables NOT Set!

Your crypto deposit system is deployed but **NOT WORKING** because you haven't added the API keys yet.

---

## 🔑 Step 1: Add Environment Variables to Railway (5 minutes)

### **Go to Railway Dashboard:**

1. Visit: https://railway.app/dashboard
2. Click on your **Tradebattle** project
3. Click on your service name
4. Click the **"Variables"** tab

### **Add These Two Variables:**

Click **"Add Variable"** button and add:

```
NOWPAYMENTS_API_KEY
<paste your API key here>

NOWPAYMENTS_IPN_SECRET
<paste your IPN secret here>
```

### **Click "Deploy" Button:**
- Railway will restart your app with the new variables
- Takes 2-3 minutes

---

## 🔐 Step 2: Get NOWPayments API Keys (5 minutes)

### **Sign Up for NOWPayments:**

1. Go to: https://nowpayments.io
2. Click **"Sign Up"** (top right)
3. Enter email and create password
4. Verify your email

### **Get API Key:**

1. Log into NOWPayments dashboard
2. Click **"Settings"** in left sidebar
3. Click **"API Keys"**
4. Click **"Generate API Key"** button
5. Copy the key that appears
6. Paste into Railway as `NOWPAYMENTS_API_KEY`

### **Get IPN Secret:**

1. In NOWPayments dashboard, go to **"Settings"**
2. Click **"IPN"** (Instant Payment Notifications)
3. Toggle **"Enable IPN"** to ON
4. In **"IPN Callback URL"** field, enter:
   ```
   https://tradebattle-production.up.railway.app/api/crypto/ipn
   ```
   ⚠️ **IMPORTANT:** Replace `tradebattle-production.up.railway.app` with your actual Railway domain!

5. Copy the **"IPN Secret Key"** shown below
6. Paste into Railway as `NOWPAYMENTS_IPN_SECRET`
7. Click **"Save"** button in NOWPayments

---

## ✅ Step 3: Verify It Works (2 minutes)

### **Test the API:**

Once Railway has redeployed (2-3 min), test:

```bash
curl https://yourdomain.railway.app/api/crypto/currencies
```

**Should return:**
```json
{
  "currencies": [
    {"code":"usdttrc20", "name":"USDT (TRC20)", ...},
    ...
  ]
}
```

### **Test the Deposit Page:**

1. Go to: `https://yourdomain.railway.app/deposit`
2. You should see:
   - 6 cryptocurrency options ✅
   - Button says "Create Deposit & Get QR Code" ✅
3. Enter amount: `$10`
4. Select: **USDT (TRC20)**
5. Click **"Create Deposit & Get QR Code"**
6. Should see:
   - QR code ✅
   - Deposit address ✅
   - Exact USDT amount ✅

---

## 🐛 Troubleshooting

### **"Crypto Deposits Unavailable" button:**
- Environment variables not set in Railway
- Railway hasn't restarted yet (wait 2-3 min)

### **"Payment system not configured" error:**
- `NOWPAYMENTS_API_KEY` is wrong or missing
- Copy the key again from NOWPayments dashboard
- Make sure no extra spaces when pasting

### **Deposit created but balance never updates:**
- `NOWPAYMENTS_IPN_SECRET` is wrong
- IPN Callback URL is incorrect
- Check Railway logs for webhook errors

### **"Amount too small" error:**
- Some cryptos have minimum amounts (e.g., Bitcoin ~$2.50)
- Try USDT (TRC20) - lowest minimum (~$1)
- Or increase your deposit amount

---

## 📋 What You're Seeing Now vs. After Setup

### **BEFORE (Now - No Env Vars):**
```
Go to /deposit
→ Button says "Crypto Deposits Unavailable"
→ Error: "Payment system not configured"
```

### **AFTER (With Env Vars):**
```
Go to /deposit
→ See 6 cryptocurrency options
→ Enter $10, select USDT
→ Click "Create Deposit & Get QR Code"
→ See QR code + address
→ Send crypto → Balance updates automatically
```

---

## ⏱️ Total Time: ~10 Minutes

- 5 min: Sign up for NOWPayments + get keys
- 2 min: Add keys to Railway + redeploy
- 3 min: Test deposit flow

---

## 🎯 Why It's Not Working Now

**The errors you're seeing:**
- "Below minimum" → NOWPayments API not responding (no API key)
- No QR code → Payment creation failing (no API key)
- Generic errors → Backend can't connect to NOWPayments (no API key)

**Once you add the keys:**
- ✅ API calls will work
- ✅ QR codes will generate
- ✅ Deposits will process
- ✅ Balances will update

---

## 📞 Still Having Issues?

### **Check Railway Logs:**
1. Railway dashboard → Your service
2. Click "Deployments" tab
3. Click latest deployment
4. Look for errors like:
   - `NOWPayments API request failed: Invalid API key` ← API key wrong/missing
   - `Invalid IPN signature` ← IPN secret wrong
   - `Payment not found` ← Database issue

### **Verify Environment Variables:**
1. Railway dashboard → Variables tab
2. Should see:
   - `NOWPAYMENTS_API_KEY` = `NPM_xxxxx...`
   - `NOWPAYMENTS_IPN_SECRET` = `xxxxxx...`
3. If missing → Add them!
4. If present but not working → Check for typos/extra spaces

---

## 🚨 CRITICAL: Do This NOW

**Your crypto payment system is deployed and ready, but won't work until you:**

1. ✅ Add `NOWPAYMENTS_API_KEY` to Railway
2. ✅ Add `NOWPAYMENTS_IPN_SECRET` to Railway
3. ✅ Click "Deploy" to restart
4. ✅ Test with $10 USDT deposit

**That's it! Takes 10 minutes total.**

---

## 💬 What About the UI?

I just improved the UI in the latest update:

**New UI improvements:**
- ✅ Bigger preset amount buttons (easier to click)
- ✅ Larger input fields (better visibility)
- ✅ Better currency cards (shows checkmark when selected)
- ✅ Clearer error messages (tells you what's wrong)
- ✅ Bigger "Create Deposit" button (shows what will happen)
- ✅ Loading state for currencies (shows if not configured)

**Deploying UI fixes now...**
