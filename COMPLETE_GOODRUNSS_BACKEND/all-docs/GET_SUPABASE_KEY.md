# 🔑 Get Your Supabase Service Role Key

## Quick Steps:

1. Go to: https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/settings/api

2. Scroll down to **"Project API keys"**

3. Copy the **`service_role`** key (the long one, NOT the `anon` key)

4. Update `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
   ```

5. Restart server:
   ```bash
   npm run dev
   ```

---

## ✅ After You Add It:

Your Google Calendar sync will work instantly because:
- ✅ Google OAuth credentials already configured (lines 20-21 in `.env.local`)
- ✅ All code already written
- ✅ Database tables already created
- ✅ Just needs Supabase key to save/read integration data

---

## 🚀 Test It:

```bash
# Connect your Google Calendar
http://localhost:3001/api/integrations/google-calendar/connect?facilityId=test_123

# Then sync
curl -X POST http://localhost:3001/api/integrations/google-calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"facilityId": "test_123"}'
```

---

That's it! One key and you're done.

