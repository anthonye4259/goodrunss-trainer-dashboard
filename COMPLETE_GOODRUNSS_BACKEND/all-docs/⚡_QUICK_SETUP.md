# ⚡ QUICK SETUP GUIDE

## ✅ WHAT'S DONE:
- ✅ Dependencies installed
- ✅ Database schema pushed
- ✅ Environment variables template added

---

## 🔧 WHAT YOU NEED TO DO:

### **1. Get Stripe API Keys** 💳
```bash
# Go to: https://dashboard.stripe.com/apikeys
# Sign up/login
# Copy your keys and update in .env:

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### **2. Setup Stripe Webhooks**
```bash
# Go to: https://dashboard.stripe.com/webhooks
# Click "Add endpoint"
# URL: http://localhost:3000/api/stripe/webhooks (for testing)
# Events to listen for:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - account.updated
  - charge.refunded
  - charge.dispute.created
# Copy webhook secret:

STRIPE_WEBHOOK_SECRET=whsec_...
```

### **3. Get Firebase Admin Key** 🔥
```bash
# You already have Firebase setup! Just need to add the private key:
# Go to: https://console.firebase.google.com/project/goodrunss-ai/settings/serviceaccounts/adminsdk
# Click "Generate new private key"
# Copy the private key and update in .env:

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### **4. Get Sentry DSN** 🐛
```bash
# Go to: https://sentry.io
# Sign up for free
# Create new project: "GoodRunss"
# Platform: Next.js
# Copy DSN and update in .env:

NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### **5. Verify Resend (Already Setup!)** ✅
```bash
# You already have Resend configured!
RESEND_API_KEY=re_f7VW2cJV_JiCGHj6RaJRH6n6QqZgHBGSz

# Just verify it works by sending a test email later
```

---

## 🚀 START THE SERVER:

```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev
```

**Server will run at:** http://localhost:3000

---

## 📱 CONNECT CONSUMER APP:

Update your consumer app's API client:

```typescript
// goodrunss-consumer-app/src/api/client.ts

const API_BASE_URL = 'http://localhost:3000/api'; // For testing
// const API_BASE_URL = 'https://api.goodrunss.com/api'; // For production

// Then all your API calls work:
const trainers = await fetch(`${API_BASE_URL}/search?query=yoga`);
const payment = await fetch(`${API_BASE_URL}/payments/create-intent`, {...});
const message = await fetch(`${API_BASE_URL}/messages/send`, {...});
```

---

## 🧪 TEST THE APIS:

### **Test Search:**
```bash
curl "http://localhost:3000/api/search?query=yoga&type=trainer"
```

### **Test Stripe (after adding keys):**
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "trainerId": "trainer_456",
    "amount": 50.00,
    "currency": "USD"
  }'
```

### **Test Email (after verifying Resend):**
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": {
      "name": "Test User"
    }
  }'
```

---

## 🎯 PRIORITY ORDER:

1. **Start Server** - Test that it runs ✅
2. **Add Stripe Keys** - For payments 💳
3. **Test APIs** - Make sure they work 🧪
4. **Connect Frontend** - Hook up consumer app 📱
5. **Add Sentry** - For error tracking 🐛
6. **Deploy!** - Go live! 🚀

---

## 📚 FULL DOCUMENTATION:

Each system has complete docs:
- `💳_PAYMENTS_COMPLETE.md`
- `🔍_SEARCH_COMPLETE.md`
- `⭐_REVIEWS_COMPLETE.md`
- `📱_PUSH_NOTIFICATIONS_COMPLETE.md`
- `💬_MESSAGING_COMPLETE.md`
- `📧_EMAIL_COMPLETE.md`
- `🐛_SENTRY_COMPLETE.md`
- `🔒_SAFETY_COMPLETE.md`

---

## 🎉 YOU'RE READY TO GO!

Just add those API keys and you can start testing! 🚀

