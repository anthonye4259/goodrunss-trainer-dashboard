# 📱 CONSUMER APP - PUSH NOTIFICATIONS SETUP

Quick guide to integrate push notifications in the consumer app.

---

## 📦 INSTALL PACKAGES

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-consumer-app

# Install required packages
expo install expo-notifications expo-device expo-constants
```

---

## 🔧 SETUP IN APP

### **1. In your main App component or Auth flow:**

```typescript
// app/_layout.tsx or app/index.tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { registerForPushNotifications, setupNotificationListeners } from './services/notifications';

export default function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // When user logs in, register for notifications
    const initNotifications = async () => {
      const userId = 'current_user_id'; // Get from your auth state
      
      if (userId) {
        await registerForPushNotifications(userId);
      }
    };

    initNotifications();

    // Setup notification listeners
    const cleanup = setupNotificationListeners(navigation);

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    // Your app content
  );
}
```

---

### **2. On Login:**

```typescript
// After successful login
import { registerForPushNotifications } from '@/services/notifications';

async function handleLogin(userId: string) {
  // ... your login logic
  
  // Register for notifications
  await registerForPushNotifications(userId);
}
```

---

### **3. On Logout:**

```typescript
// Before logging out
import { unregisterPushNotifications } from '@/services/notifications';

async function handleLogout() {
  const userId = currentUser.id;
  const token = await getStoredToken(); // Get stored FCM token
  
  // Unregister token
  if (token) {
    await unregisterPushNotifications(userId, token);
  }
  
  // ... rest of logout logic
}
```

---

### **4. Notification Settings Screen (Optional):**

```typescript
// app/settings/notifications.tsx
import { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '@/services/notifications';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    bookingConfirmedEnabled: true,
    bookingReminderEnabled: true,
    messageReceivedEnabled: true,
    // ... other preferences
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const userId = 'current_user_id';
    const prefs = await getNotificationPreferences(userId);
    if (prefs) {
      setPreferences(prefs);
    }
  }

  async function togglePreference(key: string, value: boolean) {
    const userId = 'current_user_id';
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    await updateNotificationPreferences(userId, { [key]: value });
  }

  return (
    <View>
      <Text>Notification Preferences</Text>
      
      <View>
        <Text>Booking Confirmations</Text>
        <Switch
          value={preferences.bookingConfirmedEnabled}
          onValueChange={(val) => togglePreference('bookingConfirmedEnabled', val)}
        />
      </View>

      <View>
        <Text>Booking Reminders</Text>
        <Switch
          value={preferences.bookingReminderEnabled}
          onValueChange={(val) => togglePreference('bookingReminderEnabled', val)}
        />
      </View>

      <View>
        <Text>Messages</Text>
        <Switch
          value={preferences.messageReceivedEnabled}
          onValueChange={(val) => togglePreference('messageReceivedEnabled', val)}
        />
      </View>

      {/* Add more preferences */}
    </View>
  );
}
```

---

## 🔔 CONFIGURE app.json

Add notification configuration to `app.json`:

```json
{
  "expo": {
    "name": "GoodRunss",
    "slug": "goodrunss-consumer",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

---

## 📝 TESTING

### **Test on Physical Device:**

1. Build and install app on device:
```bash
expo run:ios
# or
expo run:android
```

2. Grant notification permissions when prompted

3. Check console for FCM token:
```
FCM Token: ExponentPushToken[xxxxx]
```

4. Send test notification from trainer dashboard or curl:
```bash
curl -X POST http://your-server/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your_user_id",
    "type": "trainerNote",
    "params": {
      "trainerName": "Test Trainer",
      "note": "Test notification!"
    }
  }'
```

5. Notification should appear on device! 📱

---

## 🎯 NAVIGATION ROUTES

Make sure these routes exist in your app:

- `/bookings` → Bookings screen
- `/messages` → Messages screen
- `/workouts` → Workouts screen
- `/payments` → Payments screen
- `/progress` → Progress screen
- `/offers` → Offers/Promotions screen

Update `handleNotificationNavigation()` in `services/notifications.ts` to match your actual route names.

---

## ✅ CHECKLIST

- [ ] Install expo-notifications packages
- [ ] Create `services/notifications.ts` file
- [ ] Call `registerForPushNotifications()` on login
- [ ] Call `setupNotificationListeners()` in main app
- [ ] Call `unregisterPushNotifications()` on logout
- [ ] Configure app.json for notifications
- [ ] Test on physical device
- [ ] Verify navigation from notifications works
- [ ] (Optional) Create notification settings screen

---

## 🎉 DONE!

Your consumer app is now ready to receive push notifications from the trainer dashboard!

**Status:** ✅ Ready to test

