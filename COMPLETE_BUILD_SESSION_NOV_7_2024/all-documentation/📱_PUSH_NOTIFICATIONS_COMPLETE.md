# 📱 PUSH NOTIFICATIONS SYSTEM - COMPLETE!

## **✅ WHAT WAS BUILT**

Complete **push notification system** with:
- Send individual notifications
- Send batch notifications
- Schedule notifications
- Recurring notifications
- User preferences
- Notification templates
- Firebase Cloud Messaging integration

---

## **🔌 API ENDPOINTS (3 main routes)**

### **1. Send Notification**
```typescript
POST /api/notifications/send

// Single user
{
  "userId": "user_123",
  "title": "Session Reminder",
  "body": "Your session starts in 1 hour",
  "type": "booking_reminder",
  "data": {
    "action": "open_booking",
    "bookingId": "booking_123"
  },
  "imageUrl": "https://..."
}

// Batch send
{
  "userIds": ["user_123", "user_456", "user_789"],
  "title": "New Feature!",
  "body": "Check out our new AI trainers"
}

// Response
{
  "success": true,
  "messageId": "projects/goodrunss-ai/messages/0:1234567890",
  "message": "Notification sent successfully"
}

// Batch response
{
  "success": true,
  "successCount": 3,
  "failureCount": 0,
  "message": "Sent to 3/3 devices"
}
```

### **2. Schedule Notification**
```typescript
POST /api/notifications/schedule
{
  "userId": "user_123",
  "title": "Session Tomorrow",
  "body": "Your session with Sarah is tomorrow at 10am",
  "scheduledFor": "2025-11-09T09:00:00Z",
  "type": "booking_reminder",
  "recurring": null  // or 'daily', 'weekly'
}

// Response
{
  "id": "scheduled_123",
  "status": "scheduled",
  "scheduledFor": "2025-11-09T09:00:00Z",
  "message": "Notification scheduled successfully"
}

// Get scheduled notifications
GET /api/notifications/schedule?userId=user_123&status=scheduled

// Response
{
  "notifications": [...],
  "count": 5
}

// Cancel scheduled notification
DELETE /api/notifications/schedule?id=scheduled_123
```

### **3. Notification Preferences**
```typescript
// Get preferences
GET /api/notifications/preferences?userId=user_123

// Response
{
  "preferences": {
    "booking_confirmed": true,
    "booking_reminder_24h": true,
    "booking_reminder_1h": true,
    "booking_cancelled": true,
    "new_message": true,
    "waitlist_available": true,
    "payment_confirmed": true,
    "review_received": true,
    "trainer_response": true,
    "promotional": false
  }
}

// Update preferences
PUT /api/notifications/preferences
{
  "userId": "user_123",
  "preferences": {
    "promotional": true,
    "booking_reminder_24h": false
  }
}
```

---

## **📱 NOTIFICATION TEMPLATES**

Pre-built templates in `/src/lib/notification-templates.ts`:

```typescript
// Booking
bookingConfirmed(trainerName, date, time)
bookingReminder24h(trainerName, time)
bookingReminder1h(trainerName, time)
bookingCancelled(trainerName, date)

// Waitlist
waitlistAvailable(trainerName, date, time)

// Messages
newMessage(senderName, preview)

// Payments
paymentConfirmed(amount)
paymentRefunded(amount)

// Reviews
newReview(clientName, rating)
trainerResponse(trainerName)

// AI Personas
aiPersonaReady(personaName)

// General
welcome(userName)
```

### **Usage Example:**
```typescript
import { bookingConfirmed } from '@/lib/notification-templates';

const notification = bookingConfirmed('Sarah Johnson', 'Nov 10', '10:00 AM');

await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user_123',
    ...notification,
  }),
});
```

---

## **🔧 SETUP INSTRUCTIONS**

### **1. Add Firebase Admin Credentials to .env**
```bash
# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=goodrunss-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@goodrunss-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### **2. Install Dependencies**
```bash
npm install firebase-admin
```

### **3. Frontend Setup (Consumer App)**
```bash
# Already installed in your consumer app!
# Just need to:
# 1. Request notification permissions
# 2. Get FCM token
# 3. Save token to Firestore
```

### **4. Request Permissions (Consumer App)**
```typescript
// In your mobile app
import messaging from '@react-native-firebase/messaging';

async function requestPermissions() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    // Get FCM token
    const token = await messaging().getToken();
    
    // Save to Firestore
    await firestore()
      .collection('users')
      .doc(userId)
      .update({ fcmToken: token });
  }
}
```

---

## **📱 FRONTEND INTEGRATION**

### **Example: Handle Notifications**
```typescript
// NotificationHandler.tsx
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';

function NotificationHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    // Foreground notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // Show in-app notification
      showInAppNotification(remoteMessage);
    });

    // Background/quit state - notification tapped
    messaging().onNotificationOpenedApp((remoteMessage) => {
      handleNotificationNavigation(remoteMessage);
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handleNotificationNavigation(remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  const handleNotificationNavigation = (message) => {
    const { action, bookingId, messageId } = message.data;

    switch (action) {
      case 'open_booking':
        navigation.navigate('BookingDetails', { bookingId });
        break;
      case 'open_messages':
        navigation.navigate('Messages', { messageId });
        break;
      case 'open_home':
        navigation.navigate('Home');
        break;
    }
  };

  return null;
}
```

### **Example: Settings Screen**
```typescript
// NotificationSettings.tsx
function NotificationSettings({ userId }) {
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const response = await fetch(
      `YOUR_API/api/notifications/preferences?userId=${userId}`
    );
    const data = await response.json();
    setPreferences(data.preferences);
  };

  const updatePreference = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    await fetch('YOUR_API/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        preferences: newPrefs,
      }),
    });
  };

  return (
    <View>
      <Switch
        label="Booking Confirmations"
        value={preferences.booking_confirmed}
        onValueChange={(v) => updatePreference('booking_confirmed', v)}
      />
      <Switch
        label="Session Reminders (24h)"
        value={preferences.booking_reminder_24h}
        onValueChange={(v) => updatePreference('booking_reminder_24h', v)}
      />
      <Switch
        label="Session Reminders (1h)"
        value={preferences.booking_reminder_1h}
        onValueChange={(v) => updatePreference('booking_reminder_1h', v)}
      />
      <Switch
        label="New Messages"
        value={preferences.new_message}
        onValueChange={(v) => updatePreference('new_message', v)}
      />
      <Switch
        label="Promotional"
        value={preferences.promotional}
        onValueChange={(v) => updatePreference('promotional', v)}
      />
    </View>
  );
}
```

---

## **🤖 AUTOMATIC NOTIFICATIONS**

Create background jobs (using cron or Cloud Functions) to send automated notifications:

### **Example: Session Reminders**
```typescript
// jobs/sessionReminders.ts
import { firestoreAdmin } from '@/lib/firebase-admin';
import { bookingReminder24h, bookingReminder1h } from '@/lib/notification-templates';

// Run every hour
export async function sendSessionReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);

  // Get sessions starting in 24 hours
  const sessions24h = await prisma.trainerSession.findMany({
    where: {
      scheduledAt: {
        gte: in24h,
        lte: new Date(in24h.getTime() + 60 * 60 * 1000), // 1h window
      },
      status: 'CONFIRMED',
    },
    include: { trainer: true },
  });

  // Send 24h reminders
  for (const session of sessions24h) {
    const notification = bookingReminder24h(
      session.trainer.name,
      formatTime(session.scheduledAt)
    );
    
    await fetch('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify({
        userId: session.clientId,
        ...notification,
      }),
    });
  }

  // Repeat for 1h reminders...
}
```

---

## **🎯 NOTIFICATION TYPES**

- ✅ **Booking confirmed**
- ⏰ **Session reminders** (24h, 1h)
- ❌ **Booking cancelled**
- 🎉 **Waitlist spot available**
- 💬 **New message**
- 💳 **Payment confirmed**
- 💰 **Refund processed**
- ⭐ **New review**
- 💬 **Trainer response**
- 🤖 **AI persona ready**
- 👋 **Welcome message**

---

## **✅ TESTING**

```bash
# Send test notification
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "title": "Test Notification",
    "body": "This is a test",
    "type": "test"
  }'

# Schedule notification
curl -X POST http://localhost:3000/api/notifications/schedule \
  -d '{
    "userId": "user_123",
    "title": "Scheduled Test",
    "body": "This will send in 1 hour",
    "scheduledFor": "2025-11-08T15:00:00Z"
  }'

# Update preferences
curl -X PUT http://localhost:3000/api/notifications/preferences \
  -d '{
    "userId": "user_123",
    "preferences": {"promotional": false}
  }'
```

---

## **🎉 PUSH NOTIFICATIONS READY!**

Users will now **stay engaged** with timely notifications! 📱

**Next: Building In-App Messaging...** 💬

