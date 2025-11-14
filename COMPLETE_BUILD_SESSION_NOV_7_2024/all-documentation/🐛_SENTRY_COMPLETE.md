# 🐛 ERROR TRACKING WITH SENTRY - COMPLETE!

## **✅ WHAT WAS BUILT**

Complete **error tracking system** with:
- Sentry integration for Next.js
- Client-side error tracking
- Server-side error tracking
- Edge runtime error tracking
- Performance monitoring
- Session replay
- User context
- Breadcrumbs
- Error filtering

---

## **🔧 SETUP INSTRUCTIONS**

### **1. Create Sentry Account**
```bash
# Go to: https://sentry.io
# Sign up for free (5k errors/month, 1 project)
```

### **2. Create New Project**
```bash
# Dashboard > Projects > Create Project
# Select: Next.js
# Copy your DSN
```

### **3. Add DSN to .env**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7891011
```

### **4. Install Sentry**
```bash
npm install --save @sentry/nextjs
```

### **5. Update next.config.js**
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Your existing config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true,
    org: 'your-org',
    project: 'goodrunss-dashboard',
  },
  {
    // Upload source maps
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

---

## **📱 USAGE**

### **Automatic Error Tracking**
Sentry automatically captures:
- ✅ Unhandled exceptions
- ✅ Unhandled promise rejections
- ✅ API route errors
- ✅ Server-side errors
- ✅ Client-side errors

### **Manual Error Tracking**
```typescript
import { captureError, captureMessage, setUser, addBreadcrumb } from '@/lib/sentry';

// Capture error
try {
  await riskyOperation();
} catch (error) {
  captureError(error as Error, {
    userId: 'user_123',
    operation: 'riskyOperation',
  });
}

// Capture message
captureMessage('User completed onboarding', 'info');

// Set user context (do this on login)
setUser({
  id: 'user_123',
  email: 'user@example.com',
  username: 'johndoe',
});

// Add breadcrumb (track user actions)
addBreadcrumb('User clicked button', 'ui', {
  buttonId: 'submit-form',
  page: '/dashboard',
});
```

### **Wrap API Routes**
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withSentry, setUser, addBreadcrumb } from '@/lib/sentry';

export const POST = withSentry(async (req: NextRequest) => {
  const { userId, data } = await req.json();
  
  // Set user context
  setUser({ id: userId });
  
  // Add breadcrumb
  addBreadcrumb('Processing request', 'api', { data });
  
  // Your logic
  const result = await processData(data);
  
  return NextResponse.json(result);
}, { name: 'POST /api/example' });
```

### **Performance Monitoring**
```typescript
import { startTransaction } from '@/lib/sentry';

const transaction = startTransaction('Process Payment', 'payment');

try {
  await createPaymentIntent();
  await confirmPayment();
  await updateDatabase();
  
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

---

## **🎯 FEATURES**

### **Error Tracking**
- ✅ Automatic error capture
- ✅ Stack traces with source maps
- ✅ Error grouping
- ✅ Error frequency tracking
- ✅ Custom error context

### **Performance Monitoring**
- ✅ Transaction tracking
- ✅ Slow API route detection
- ✅ Database query performance
- ✅ External API latency

### **Session Replay**
- ✅ Video-like replay of user sessions
- ✅ Automatic on errors (100%)
- ✅ Random sampling (10%)
- ✅ Privacy controls (mask text/media)

### **User Context**
- ✅ Track which users hit errors
- ✅ See user journey
- ✅ Breadcrumbs (user actions)
- ✅ Custom tags

### **Alerts**
- ✅ Email alerts on new errors
- ✅ Slack integration
- ✅ PagerDuty integration
- ✅ Custom alert rules

---

## **🔒 PRIVACY & SECURITY**

### **Automatically Filtered:**
- ✅ Authorization headers
- ✅ Cookies
- ✅ Passwords
- ✅ API keys
- ✅ Tokens

### **Session Replay Privacy:**
- ✅ All text masked by default
- ✅ All media blocked by default
- ✅ Can customize what's captured

### **Development:**
- ✅ Errors NOT sent in development (logged to console)
- ✅ Only production errors tracked

---

## **📊 SENTRY DASHBOARD**

### **View Errors:**
1. Go to https://sentry.io
2. Select your project
3. View Issues tab
4. See all errors grouped

### **Error Details:**
- Stack trace
- User info
- Breadcrumbs (user actions)
- Session replay (if available)
- Environment
- Release version
- Tags

### **Performance:**
1. Go to Performance tab
2. See slow transactions
3. Identify bottlenecks

---

## **🚀 PRODUCTION CHECKLIST**

- ✅ Set `NEXT_PUBLIC_SENTRY_DSN` in production
- ✅ Enable source maps upload
- ✅ Set up Slack/email alerts
- ✅ Test error reporting
- ✅ Configure alert rules
- ✅ Set up release tracking

---

## **💰 PRICING**

**Sentry Pricing:**
- **Developer:** Free - 5k errors/month, 1 project
- **Team:** $26/month - 50k errors/month, unlimited projects
- **Business:** $80/month - 150k errors/month, advanced features

**Perfect for:**
- Testing: Free tier
- Launch: Developer or Team
- Scale: Team or Business

---

## **✅ TESTING**

### **Test Error Tracking:**
```typescript
// Trigger test error
throw new Error('Test error from Sentry');

// Or use button in dev:
<button onClick={() => {
  throw new Error('Sentry test error');
}}>
  Test Sentry
</button>
```

### **Check Sentry Dashboard:**
1. Go to https://sentry.io
2. Select project
3. See the test error appear
4. View stack trace, breadcrumbs

---

## **📚 COMMON USE CASES**

### **1. Track Payment Failures**
```typescript
try {
  await stripe.paymentIntents.create({ ... });
} catch (error) {
  captureError(error as Error, {
    userId,
    amount,
    paymentMethod: 'card',
  });
  throw error;
}
```

### **2. Track API Errors**
```typescript
export const POST = withSentry(async (req) => {
  // Automatically tracked
  const result = await fetch('external-api.com');
  return NextResponse.json(result);
}, { name: 'POST /api/external' });
```

### **3. Track User Actions**
```typescript
function BookingScreen() {
  const handleBook = async () => {
    addBreadcrumb('User clicked book button', 'ui', {
      trainerId,
      date: selectedDate,
    });
    
    try {
      await bookSession();
    } catch (error) {
      captureError(error as Error);
    }
  };
}
```

---

## **🎉 ERROR TRACKING READY!**

You'll now **know instantly when things break** and can **fix them fast**! 🐛

**Next: Building Safety & Moderation Features...** 🔒

