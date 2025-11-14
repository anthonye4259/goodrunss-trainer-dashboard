# 🧪 PUSH NOTIFICATIONS - TESTING GUIDE

Quick guide to test the push notification system end-to-end.

---

## 🎯 PREREQUISITES

Before testing, ensure:

1. ✅ Firebase Admin credentials added to `.env`
2. ✅ Database migration applied (`npx prisma db push`)
3. ✅ Trainer dashboard running (`npm run dev`)
4. ✅ Consumer app has FCM token registered

---

## 📝 TEST SCENARIOS

### **Test 1: Register FCM Token**

Simulate consumer app registering a token:

```bash
curl -X POST http://localhost:3000/api/notifications/tokens \
  -H "Content-Type: application/json" \
  -H "x-api-key: gr_f3cbd6d09d4359531cf742739008e3c9b5866ee2ef3bf81a300dd7eaca9694ed" \
  -d '{
    "userId": "test_user_123",
    "token": "ExponentPushToken[test_token_abc123]"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

---

### **Test 2: Send Single Notification**

Send a test notification from trainer dashboard:

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \  # Must be logged in as trainer
  -d '{
    "clientId": "test_user_123",
    "type": "trainerNote",
    "params": {
      "trainerName": "John Doe",
      "note": "This is a test notification!"
    }
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "messageId": "0:1234567890...",
  "message": "Notification sent successfully"
}
```

**On Device:**
```
📱 Notification appears:
   📝 Note from John Doe
   This is a test notification!
```

---

### **Test 3: Check User Preferences**

Get notification preferences:

```bash
curl -X GET "http://localhost:3000/api/notifications/preferences?userId=test_user_123" \
  -H "x-api-key: gr_f3cbd6d09d4359531cf742739008e3c9b5866ee2ef3bf81a300dd7eaca9694ed"
```

**Expected Result:**
```json
{
  "success": true,
  "preferences": {
    "userId": "test_user_123",
    "bookingConfirmedEnabled": true,
    "bookingReminderEnabled": true,
    "messageReceivedEnabled": true,
    ...
  }
}
```

---

### **Test 4: Update Preferences**

Disable message notifications:

```bash
curl -X PUT http://localhost:3000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "x-api-key: gr_f3cbd6d09d4359531cf742739008e3c9b5866ee2ef3bf81a300dd7eaca9694ed" \
  -d '{
    "userId": "test_user_123",
    "preferences": {
      "messageReceivedEnabled": false
    }
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "preferences": {
    "messageReceivedEnabled": false,
    ...
  }
}
```

---

### **Test 5: Send Bulk Notification**

Send to all active clients:

```bash
curl -X POST http://localhost:3000/api/notifications/bulk \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "recipientType": "active",
    "type": "trainerNote",
    "params": {
      "trainerName": "John Doe",
      "note": "Don'\''t forget your water bottles this week!"
    }
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "successCount": 12,
  "failureCount": 0,
  "totalSent": 12
}
```

---

### **Test 6: Test All Notification Types**

Test each notification template:

```bash
# Booking Confirmed
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "clientId": "test_user_123",
    "type": "bookingConfirmed",
    "params": {
      "trainerName": "John Doe",
      "date": "Nov 11, 2025",
      "time": "2:00 PM",
      "location": "LA Tennis Center"
    }
  }'

# Booking Reminder
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "clientId": "test_user_123",
    "type": "bookingReminder",
    "params": {
      "trainerName": "John Doe",
      "time": "2:00 PM",
      "location": "LA Tennis Center"
    }
  }'

# Session Completed
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "clientId": "test_user_123",
    "type": "sessionCompleted",
    "params": {
      "trainerName": "John Doe",
      "sessionType": "Tennis"
    }
  }'

# Payment Received
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "clientId": "test_user_123",
    "type": "paymentReceived",
    "params": {
      "amount": 75,
      "sessionType": "Tennis"
    }
  }'
```

---

## 🔍 VERIFICATION CHECKLIST

After testing, verify:

- [ ] Notification appears on device
- [ ] Notification has correct title and body
- [ ] Notification sound plays
- [ ] Badge count increments
- [ ] Tapping notification navigates to correct screen
- [ ] Preferences are respected (disabled types don't send)
- [ ] Invalid tokens are cleaned up
- [ ] Multiple devices receive notifications
- [ ] Bulk sending works for multiple users
- [ ] Database stores notification history

---

## 🐛 TROUBLESHOOTING

### **No notification received:**

1. Check FCM token is registered in database
2. Verify Firebase Admin credentials in `.env`
3. Check user hasn't disabled notification type
4. Look for errors in server logs
5. Verify device has internet connection

### **"Invalid token" error:**

1. FCM tokens expire - re-register from consumer app
2. Check token format is correct (starts with `ExponentPushToken[` for Expo)

### **"Permission denied" error:**

1. Verify Firebase Admin credentials
2. Check service account has FCM permissions
3. Verify Firebase project ID matches

---

## ✅ SUCCESS CRITERIA

All tests pass when:

- ✅ Tokens registered successfully
- ✅ Single notifications send
- ✅ Bulk notifications send
- ✅ Preferences respected
- ✅ All 11 notification types work
- ✅ Devices receive notifications
- ✅ Action URLs navigate correctly

---

## 🎉 READY FOR PRODUCTION

Once all tests pass:

1. Deploy trainer dashboard
2. Deploy consumer app
3. Update production URLs
4. Monitor notification delivery rates
5. Set up alerts for failures

---

**Testing Status:** Ready to test  
**Estimated Time:** 30-45 minutes  
**Required:** Real device with consumer app installed

