# 🔑 Manual API Setup Instructions

Terminal commands aren't working, so here's the manual setup:

## Step 1: Run SQL in Supabase

1. Go to: **https://supabase.com/dashboard**

2. Select your project: **goodrunss-ai** (or your project name)

3. Click **SQL Editor** in the left sidebar

4. Click **New Query**

5. Open the file: **`RUN_THIS_IN_SUPABASE.sql`**

6. Copy ALL the SQL code

7. Paste it into the Supabase SQL Editor

8. Click **Run** (or press Cmd+Enter)

9. You should see: ✅ "Success. No rows returned"

---

## Step 2: Verify Tables Were Created

In Supabase, go to **Table Editor** and you should see these new tables:
- ✅ `api_keys`
- ✅ `api_request_logs`
- ✅ `api_usage_stats`
- ✅ `webhooks`
- ✅ `webhook_events`

---

## Step 3: Restart Your Dashboard

In terminal:
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Stop the server (Ctrl+C if running)

# Start it again
npm run dev
```

---

## Step 4: Create Your First API Key

1. Open: **http://localhost:3000/dashboard/developer**

2. You'll see the "Create New API Key" form

3. Fill in:
   - **Name**: "GoodRunss Main API Key"
   - **Environment**: Production (or Sandbox for testing)
   - **Permissions**: Check all boxes

4. Click **"Create API Key"**

5. **COPY THE KEY IMMEDIATELY** - You won't see it again!
   - It will look like: `grsk_live_abc123...` or `grsk_test_abc123...`

---

## Step 5: Test Your API

In terminal:
```bash
# Replace YOUR_KEY with the key you just copied
curl -X GET http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer grsk_test_YOUR_KEY"
```

You should see a JSON response with bookings (or an empty array if none exist).

---

## ✅ You're Done!

Now you can:
- Create more API keys in the dashboard
- Give keys to facilities/studios
- They can integrate with your platform!

---

## 🆘 Troubleshooting

**Problem**: SQL query fails in Supabase
- **Solution**: Make sure you copied ALL the SQL (scroll to the bottom of the file)

**Problem**: `/dashboard/developer` shows error
- **Solution**: Make sure server is restarted after running SQL

**Problem**: API test returns 401 Unauthorized
- **Solution**: Check that you copied the full API key (starts with `grsk_`)

---

## 📖 Full Documentation

See: `✅_API_SETUP_READY.md`

