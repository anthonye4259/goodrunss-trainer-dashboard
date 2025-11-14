// Push Notifications Service for Consumer App
// Handles FCM token registration and notification handling

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// ═══════════════════════════════════════════════════════════════
// CONFIGURE NOTIFICATION BEHAVIOR
// ═══════════════════════════════════════════════════════════════

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ═══════════════════════════════════════════════════════════════
// REGISTER FOR PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    // Check if physical device
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'goodrunss-ai', // Your Expo project ID
    });
    const token = tokenData.data;

    console.log('FCM Token:', token);

    // Register token with backend
    const response = await fetch(`${API_URL}/api/notifications/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify({
        userId,
        token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register token with backend');
    }

    const result = await response.json();
    console.log('Token registered:', result);

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('goodrunss_notifications', {
        name: 'GoodRunss Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// REMOVE FCM TOKEN (on logout)
// ═══════════════════════════════════════════════════════════════

export async function unregisterPushNotifications(userId: string, token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/notifications/tokens`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify({
        userId,
        token,
      }),
    });

    console.log('Token unregistered');
  } catch (error) {
    console.error('Error unregistering token:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// SETUP NOTIFICATION LISTENERS
// ═══════════════════════════════════════════════════════════════

export function setupNotificationListeners(navigation: any) {
  // Notification received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      
      const { title, body } = notification.request.content;
      const data = notification.request.content.data;

      // You can show a custom in-app notification here
      // Or update UI state
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);
    }
  );

  // Notification tapped (app was in background or closed)
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      const actionUrl = data.actionUrl as string;

      // Navigate to appropriate screen based on actionUrl
      if (actionUrl && navigation) {
        handleNotificationNavigation(actionUrl, navigation, data);
      }
    }
  );

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

// ═══════════════════════════════════════════════════════════════
// HANDLE NOTIFICATION NAVIGATION
// ═══════════════════════════════════════════════════════════════

function handleNotificationNavigation(
  actionUrl: string,
  navigation: any,
  data: Record<string, any>
) {
  try {
    switch (actionUrl) {
      case '/bookings':
        navigation.navigate('Bookings');
        break;
      
      case '/messages':
        navigation.navigate('Messages');
        break;
      
      case '/workouts':
        navigation.navigate('Workouts');
        break;
      
      case '/payments':
        navigation.navigate('Payments');
        break;
      
      case '/progress':
        navigation.navigate('Progress');
        break;
      
      case '/offers':
        navigation.navigate('Offers');
        break;
      
      default:
        // Default to home or parse custom URLs
        navigation.navigate('Home');
        break;
    }
  } catch (error) {
    console.error('Error navigating from notification:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// GET NOTIFICATION PREFERENCES
// ═══════════════════════════════════════════════════════════════

export async function getNotificationPreferences(userId: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/preferences?userId=${userId}`,
      {
        headers: {
          'x-api-key': API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get preferences');
    }

    const result = await response.json();
    return result.preferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE NOTIFICATION PREFERENCES
// ═══════════════════════════════════════════════════════════════

export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, boolean>
) {
  try {
    const response = await fetch(`${API_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify({
        userId,
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    const result = await response.json();
    return result.preferences;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// GET BADGE COUNT
// ═══════════════════════════════════════════════════════════════

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// ═══════════════════════════════════════════════════════════════
// SET BADGE COUNT
// ═══════════════════════════════════════════════════════════════

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// ═══════════════════════════════════════════════════════════════
// CLEAR ALL NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await setBadgeCount(0);
}

