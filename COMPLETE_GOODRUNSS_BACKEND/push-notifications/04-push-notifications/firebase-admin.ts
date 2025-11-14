/**
 * Firebase Admin SDK for Server-Side Operations
 * 
 * Used for:
 * - Sending push notifications
 * - Verifying ID tokens
 * - Managing user accounts
 * - Accessing Firestore from backend
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const firebaseAdmin = admin;
export const messaging = admin.messaging();
export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();

// Send push notification
export async function sendPushNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
    imageUrl?: string;
  }
) {
  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Push notification sent:', response);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

// Send push to multiple devices
export async function sendBatchPushNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
    imageUrl?: string;
  }
) {
  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(
      `Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`
    );
    return response;
  } catch (error: any) {
    console.error('Error sending batch push notifications:', error);
    throw error;
  }
}

// Send to topic
export async function sendTopicNotification(
  topic: string,
  notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
    imageUrl?: string;
  }
) {
  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
    };

    const response = await messaging.send(message);
    console.log('Topic notification sent:', response);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Error sending topic notification:', error);
    throw error;
  }
}

