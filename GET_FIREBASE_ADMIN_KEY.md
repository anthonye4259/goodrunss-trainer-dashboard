# 🔐 GET FIREBASE ADMIN CREDENTIALS

Follow these steps to get your Firebase Admin SDK credentials:

---

## 📝 STEPS

### **1. Go to Firebase Console**

Open: https://console.firebase.google.com/project/goodrunss-ai

### **2. Go to Project Settings**

Click the ⚙️ gear icon → **Project settings**

### **3. Go to Service Accounts Tab**

Click the **Service accounts** tab

### **4. Generate New Private Key**

Click the **"Generate new private key"** button

### **5. Download JSON File**

A file named `goodrunss-ai-firebase-adminsdk-xxxxx.json` will download

### **6. Open the JSON File**

Open it in a text editor and copy these 3 values:

```json
{
  "project_id": "goodrunss-ai",              ← Copy this
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",  ← Copy this
  "client_email": "firebase-adminsdk-xxxxx@goodrunss-ai.iam.gserviceaccount.com"  ← Copy this
}
```

---

## ✅ WHAT TO DO NEXT

Once you have those 3 values, I'll add them to your `.env` file!

Just paste them here and I'll update the file.

