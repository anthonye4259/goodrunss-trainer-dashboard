# 🚀 SETUP PUSH NOTIFICATIONS - ACTION STEPS

**Complete setup guide for push notifications (Steps 1, 2, 3)**

---

## ✅ STEP 1: ADD FIREBASE ADMIN CREDENTIALS

### **🔑 Get Your Credentials:**

1. Go to: https://console.firebase.google.com/project/goodrunss-ai
2. Click ⚙️ → **Project settings**
3. Go to **Service accounts** tab
4. Click **"Generate new private key"**
5. Download the JSON file

### **📋 Copy These 3 Values from the JSON:**

```json
{
  "project_id": "goodrunss-ai",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-xxxxx@goodrunss-ai.iam.gserviceaccount.com"
}
```

### **✏️ Add to Trainer Dashboard `.env`:**

Open: `/Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard/.env`

Add these 3 lines at the end:

```bash
# Firebase Admin SDK (for push notifications)
FIREBASE_PROJECT_ID=goodrunss-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@goodrunss-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
xxxxx your full private key here xxxxx
-----END PRIVATE KEY-----"
```

**⚠️ Important:** Keep the `FIREBASE_PRIVATE_KEY` on one line, but include the `\n` characters in the string.

**✅ Step 1 Complete!**

---

## ✅ STEP 2: RUN DATABASE MIGRATION

### **🗄️ Apply Migration:**

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Apply migration
npx prisma db push
```

**Expected output:**
```
Your database is now in sync with your Prisma schema. Done in XXXms
```

### **🔍 Verify:**

```bash
# Open Prisma Studio to verify
npx prisma studio
```

Check:
- ✅ `users` table has `fcmTokens` column
- ✅ `notification_preferences` table exists

**✅ Step 2 Complete!**

---

## ✅ STEP 3: SETUP CONSUMER APP

### **📦 Install Packages:**

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-consumer-app

# Install notification packages
expo install expo-notifications expo-device expo-constants
```

### **✅ Files Already Created:**

1. ✅ `services/notifications.ts` - Complete notification service
2. ✅ `SETUP_NOTIFICATIONS.md` - Integration guide

### **🔧 Integrate in Your App:**

**Option A: Quick Setup (Minimal)**

Add to your main app file:

```typescript
// app/_layout.tsx or wherever your auth logic is
import { useEffect } from 'react';
import { registerForPushNotifications, setupNotificationListeners } from './services/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Setup notifications when app loads
    const initNotifications = async () => {
      const userId = 'your_user_id_here'; // Get from your auth state
      
      if (userId) {
        // Register for push notifications
        await registerForPushNotifications(userId);
      }
    };

    initNotifications();

    // Setup listeners for incoming notifications
    const cleanup = setupNotificationListeners(navigation);
    
    return cleanup;
  }, []);

  return (
    // Your app content
  );
}
```

**Option B: Full Setup (Recommended)**

See: `/goodrunss-consumer-app/SETUP_NOTIFICATIONS.md`

**✅ Step 3 Complete!**

---

## 🧪 TEST END-TO-END

### **Test 1: Start Both Apps**

```bash
# Terminal 1: Start trainer dashboard
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev

# Terminal 2: Start consumer app
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-consumer-app
expo start
```

### **Test 2: Register Token**

1. Open consumer app on **physical device** (not simulator)
2. Grant notification permissions when prompted
3. Check console for: `FCM Token: ExponentPushToken[...]`
4. Token automatically registers with backend

### **Test 3: Send Test Notification**

From trainer dashboard or curl:

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "clientId": "test_user_id",
    "type": "trainerNote",
    "params": {
      "trainerName": "Test Trainer",
      "note": "Hello! This is a test notification 🔔"
    }
  }'
```

### **Expected Result:**

📱 **Notification appears on device:**
```
📝 Note from Test Trainer
Hello! This is a test notification 🔔
```

**✅ Success! Push notifications working!** 🎉

---

## 📊 VERIFICATION CHECKLIST

Check all these:

### **Step 1: Firebase Admin**
- [ ] Downloaded service account JSON
- [ ] Added `FIREBASE_PROJECT_ID` to `.env`
- [ ] Added `FIREBASE_CLIENT_EMAIL` to `.env`
- [ ] Added `FIREBASE_PRIVATE_KEY` to `.env`
- [ ] Restarted trainer dashboard server

### **Step 2: Database**
- [ ] Ran `npx prisma db push`
- [ ] No errors in console
- [ ] `fcmTokens` column exists in `users` table
- [ ] `notification_preferences` table exists

### **Step 3: Consumer App**
- [ ] Installed expo-notifications packages
- [ ] Created `services/notifications.ts` file
- [ ] Called `registerForPushNotifications()` on app start
- [ ] Called `setupNotificationListeners()`
- [ ] Tested on physical device
- [ ] Notification received successfully

---

## 🐛 TROUBLESHOOTING

### **"No notification received"**

**Checklist:**
1. ✅ Using physical device (not simulator)
2. ✅ Notification permissions granted
3. ✅ FCM token registered in database
4. ✅ Firebase Admin credentials in `.env`
5. ✅ Trainer dashboard server running
6. ✅ Consumer app has internet connection

**Debug:**
```bash
# Check if token is in database
npx prisma studio
# Look in users table for fcmTokens column
```

### **"Firebase Admin Error"**

**Check:**
1. `FIREBASE_PRIVATE_KEY` is complete (starts with `-----BEGIN`, ends with `-----END`)
2. Private key includes `\n` characters
3. No extra spaces or line breaks
4. All 3 environment variables are set

### **"Database migration failed"**

**Fix:**
```bash
# Reset and try again
npx prisma db push --force-reset
```

---

## 📁 FILES CREATED/UPDATED

### **Trainer Dashboard:**
- ✅ `src/lib/firebase-messaging.ts`
- ✅ `src/app/api/notifications/send/route.ts`
- ✅ `src/app/api/notifications/bulk/route.ts`
- ✅ `src/app/api/notifications/preferences/route.ts`
- ✅ `src/app/api/notifications/tokens/route.ts`
- ✅ `prisma/migrations/add_push_notifications.sql`
- ✅ `.env` (add Firebase Admin credentials)

### **Consumer App:**
- ✅ `services/notifications.ts`
- ✅ `SETUP_NOTIFICATIONS.md`
- ✅ Install: `expo-notifications`, `expo-device`, `expo-constants`

---

## 🎯 CURRENT STATUS

| Task | Status |
|------|--------|
| Backend code | ✅ Complete |
| Database migration | ✅ Ready |
| Consumer app service | ✅ Complete |
| Firebase credentials | ⏳ **NEEDS YOUR INPUT** |
| Apply migration | ⏳ **RUN COMMAND** |
| Test notifications | ⏳ **READY TO TEST** |

---

## 🚀 NEXT ACTIONS

### **RIGHT NOW:**

1. **Get Firebase Admin credentials** (Step 1)
   - Download service account JSON
   - Copy 3 values to trainer dashboard `.env`

2. **Run database migration** (Step 2)
   - `npx prisma db push`

3. **Install consumer app packages** (Step 3)
   - `expo install expo-notifications expo-device expo-constants`
   - Integrate notification service

4. **Test on physical device**
   - Send test notification
   - Verify it appears

### **AFTER TESTING:**

5. Integrate notifications in booking flow
6. Set up automatic booking reminders (cron job)
7. Add notification preferences screen
8. Monitor delivery rates
9. Deploy to production

---

## 🎉 YOU'RE ALMOST DONE!

**Just need:**
1. Firebase Admin credentials (2 minutes)
2. Run one command (30 seconds)
3. Install packages (1 minute)
4. Test (2 minutes)

**Total time:** ~6 minutes to complete setup! ⚡

---

**Ready? Let's do this!** 🚀

**Need help with any step? Just let me know!**

