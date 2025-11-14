# 📅 Google Calendar Auto-Sync Setup

## ✅ What's Built:

### 4 API Endpoints:
1. **`/api/integrations/google-calendar/connect`** - Start OAuth flow
2. **`/api/integrations/google-calendar/callback`** - Handle OAuth callback
3. **`/api/integrations/google-calendar/sync`** - Pull events FROM Google Calendar
4. **`/api/integrations/google-calendar/push`** - Push bookings TO Google Calendar

### Google Calendar Library:
- OAuth2 authentication
- Token management (access + refresh)
- Pull events (read from Google Calendar)
- Push bookings (write to Google Calendar)
- Delete events

---

## 🔧 Setup Steps:

### Step 1: Get Google Calendar API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search "Google Calendar API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/integrations/google-calendar/callback` (dev)
     - `https://yourdomain.com/api/integrations/google-calendar/callback` (prod)
   - Copy the **Client ID** and **Client Secret**

### Step 2: Update `.env.local`

Replace these values in your `.env.local`:

```bash
# Google Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google-calendar/callback

# Supabase Service Role Key (needed for sync)
SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

**To get Supabase Service Role Key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the `service_role` key (NOT the `anon` key)

### Step 3: Restart Your Server

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev
```

---

## 🚀 How to Use:

### For Facilities to Connect:

1. Facility owner clicks "Connect Google Calendar" in their dashboard
2. They get redirected to:
   ```
   http://localhost:3000/api/integrations/google-calendar/connect?facilityId=123
   ```
3. Google asks for permission
4. After approval, they're redirected back with tokens stored in DB

### Auto-Sync (Bi-Directional):

**Pull from Google Calendar (every hour):**
```bash
curl -X POST http://localhost:3000/api/integrations/google-calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"facilityId": "123"}'
```

**Push to Google Calendar (when booking is created):**
```bash
curl -X POST http://localhost:3000/api/integrations/google-calendar/push \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "456"}'
```

---

## 🔄 How Sync Works:

### 1. **Pull (Google Calendar → GoodRunss)**
- Every hour (via cron job or Next.js cron)
- Pulls events from Google Calendar for next 30 days
- Creates bookings in GoodRunss DB
- Tracks `external_id` to avoid duplicates

### 2. **Push (GoodRunss → Google Calendar)**
- When a new booking is created in GoodRunss
- Pushes the booking to Google Calendar
- Stores Google event ID in `bookings.external_id`

### 3. **Conflict Resolution**
- If event exists in both: Google Calendar wins (last write wins)
- If booking is deleted in GoodRunss: deletes from Google Calendar
- If event is deleted in Google Calendar: marks booking as cancelled

---

## 📊 Database Tables (Already Created):

### `facility_integrations`
```sql
- facility_id (FK)
- integration_type ('google_calendar')
- access_token
- refresh_token
- token_expiry
- is_active
- last_sync_at
```

### `sync_logs`
```sql
- facility_id (FK)
- integration_type
- sync_type ('pull' | 'push' | 'oauth_connect')
- status ('success' | 'failed')
- records_synced
- error_message
- synced_at
```

### `bookings` (Extended)
```sql
- external_id (Google Calendar event ID)
- external_source ('google_calendar')
```

---

## 🎯 Next Steps:

1. ✅ Get Google OAuth credentials
2. ✅ Update `.env.local` with real keys
3. ✅ Restart server
4. ✅ Test OAuth flow (connect a facility)
5. ✅ Test pull sync (read events from Google Calendar)
6. ✅ Test push sync (create booking → push to Google)
7. ⏰ Set up cron job to auto-sync every hour

---

## 🔥 Cron Job (Auto-Sync Every Hour):

You can use:
- **Vercel Cron** (if deployed on Vercel)
- **Next.js API route + cron service**
- **External cron (like EasyCron or cron-job.org)**

Example Vercel cron (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/sync-google-calendar",
    "schedule": "0 * * * *"
  }]
}
```

Create `/api/cron/sync-google-calendar/route.ts`:
```typescript
export async function GET() {
  // Get all facilities with active Google Calendar integrations
  const { data: integrations } = await supabase
    .from('facility_integrations')
    .select('facility_id')
    .eq('integration_type', 'google_calendar')
    .eq('is_active', true);
  
  // Sync each facility
  for (const integration of integrations || []) {
    await fetch('http://localhost:3000/api/integrations/google-calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId: integration.facility_id })
    });
  }
  
  return new Response('Sync complete', { status: 200 });
}
```

---

## 🎉 You're Ready!

Google Calendar auto-sync is now fully built and ready to use once you add your credentials.

