# 🔧 Update Google OAuth to Include Calendar Scope

Your existing Google OAuth credentials need the **Calendar API scope** enabled.

## Steps:

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Select Your Project
The one with Client ID: `987935232835-jcmsmq2r4ss0kak9m84fhhqsfuugd6l4`

### 3. Enable Google Calendar API
1. Go to **"APIs & Services"** > **"Library"**
2. Search for **"Google Calendar API"**
3. Click **"Enable"**

### 4. Update OAuth Consent Screen
1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Click **"Edit App"**
3. Scroll to **"Scopes"**
4. Click **"Add or Remove Scopes"**
5. Search for: `https://www.googleapis.com/auth/calendar`
6. Check the box
7. Click **"Update"**
8. Click **"Save and Continue"**

### 5. Add Calendar Redirect URI (if needed)
1. Go to **"APIs & Services"** > **"Credentials"**
2. Click on your OAuth Client ID
3. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:3000/api/integrations/google-calendar/callback`
   - `http://localhost:3001/api/integrations/google-calendar/callback` (port 3001 since 3000 is in use)
4. Click **"Save"**

---

## ✅ Done!

Your existing Google credentials will now work for Calendar sync.

No need to create new credentials — just add the Calendar scope to your existing OAuth app.

