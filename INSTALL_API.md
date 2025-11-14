# 🔑 Install GoodRunss Public API

## Step 1: Run Database Migration

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Run Prisma migration
npx prisma db push
```

This will create these tables:
- `api_keys` - Store API keys
- `api_request_logs` - Log all requests
- `api_usage_stats` - Daily usage statistics
- `webhooks` - Webhook configurations
- `webhook_events` - Webhook delivery log

---

## Step 2: Access Developer Dashboard

1. Start your server:
```bash
npm run dev
```

2. Go to: **http://localhost:3000/dashboard/developer**

3. Click "Create New API Key"

4. Fill in:
   - **Name**: "My API Key"
   - **Environment**: Sandbox (for testing) or Production
   - **Permissions**: Select what this key can access

5. **SAVE THE KEY** - You'll only see it once!

---

## Step 3: Test Your API

```bash
# Replace YOUR_API_KEY with the key you just created
curl -X GET http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer grsk_test_YOUR_API_KEY"
```

---

## API Endpoints Available:

- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/trainers` - Search trainers  
- `GET /api/v1/facilities` - Search facilities

---

## Rate Limits:

- 60 requests/minute
- 1,000 requests/hour
- 10,000 requests/day

---

## Give Keys to Partners:

1. Create a key in the dashboard
2. Send them:
   - The API key
   - Documentation: `/openapi.json`
   - Base URL: `https://goodrunss.com/api/v1`

3. They integrate using standard HTTP:
```javascript
fetch('https://goodrunss.com/api/v1/bookings', {
  headers: {
    'Authorization': 'Bearer grsk_live_their_key'
  }
})
```

---

## Done!

✅ Run migration
✅ Create key in dashboard
✅ Test endpoint
✅ Share with partners

Your platform now has its own API! 🚀

