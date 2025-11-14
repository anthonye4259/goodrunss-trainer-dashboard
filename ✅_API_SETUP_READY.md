# ✅ GoodRunss Public API - Setup Complete!

## 🎉 You Now Have Your Own API!

### ✅ What's Been Created:

1. **API Key System**
   - Generate keys with `grsk_test_*` (sandbox) or `grsk_live_*` (production)
   - Automatic rate limiting per key
   - Scope-based permissions

2. **Developer Dashboard** - NEW!
   - Visual UI at `/dashboard/developer`
   - Create/revoke keys with one click
   - View usage statistics
   - Copy keys easily

3. **Public API Endpoints**
   - `GET /api/v1/bookings`
   - `POST /api/v1/bookings`
   - `GET /api/v1/trainers`
   - `GET /api/v1/facilities`

4. **Sidebar Link** - Added "API Keys" to dashboard navigation

---

## 🚀 To Use It Now:

### Step 1: Run Migration (Terminal)

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma db push
```

This creates the database tables for API keys.

### Step 2: Restart Server

```bash
npm run dev
```

### Step 3: Go to Developer Dashboard

Open: **http://localhost:3000/dashboard/developer**

You'll see:
- "Create New API Key" form
- List of your existing keys
- Usage statistics
- API documentation

### Step 4: Create Your First Key

1. Fill in name: "GoodRunss Main Key"
2. Select environment: Production or Sandbox
3. Choose permissions: Read/Write bookings, Read trainers, etc.
4. Click "Create API Key"
5. **COPY THE KEY** - you won't see it again!

### Step 5: Test It

```bash
curl -X GET http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer grsk_test_YOUR_KEY_HERE"
```

---

## 💼 Give Keys to Partners

### For Facilities/Studios:

1. Create a production key (`grsk_live_*`) in the dashboard
2. Send them:
   - The API key
   - Base URL: `https://goodrunss.com/api/v1`
   - Docs: `/openapi.json`

3. They integrate:
```javascript
fetch('https://goodrunss.com/api/v1/bookings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer grsk_live_their_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trainerId: 'trainer_123',
    clientEmail: 'client@example.com',
    scheduledAt: '2025-02-01T10:00:00Z',
    duration: 60,
    type: 'ONE_ON_ONE'
  })
})
```

---

## 📊 Features:

### Rate Limiting (Automatic)
- 60 requests/minute
- 1,000 requests/hour
- 10,000 requests/day

### Scopes (Permissions)
- `read:bookings` - View bookings
- `write:bookings` - Create bookings
- `read:trainers` - Search trainers
- `read:facilities` - Search facilities

### Security
- Bearer token authentication
- Key revocation
- IP whitelist support (optional)
- Request logging
- Usage analytics

---

## 📖 API Endpoints:

### List Bookings
```bash
GET /api/v1/bookings?limit=20&status=SCHEDULED
Authorization: Bearer YOUR_KEY
```

### Create Booking
```bash
POST /api/v1/bookings
Authorization: Bearer YOUR_KEY
Content-Type: application/json

{
  "trainerId": "trainer_123",
  "clientEmail": "client@example.com",
  "scheduledAt": "2025-02-01T10:00:00Z",
  "duration": 60,
  "type": "ONE_ON_ONE"
}
```

### Search Trainers
```bash
GET /api/v1/trainers?city=New%20York&available=true
Authorization: Bearer YOUR_KEY
```

### Search Facilities
```bash
GET /api/v1/facilities?lat=40.7128&lng=-74.0060&radius=10
Authorization: Bearer YOUR_KEY
```

---

## 🎯 Next Steps:

1. ✅ **Run `npx prisma db push`** (creates tables)
2. ✅ **Go to `/dashboard/developer`** (create keys)
3. ✅ **Test with curl** (verify it works)
4. ✅ **Share with partners** (give them keys)

---

## 📁 Files Created:

- ✅ `src/app/dashboard/developer/page.tsx` - UI for managing keys
- ✅ `src/lib/api-auth.ts` - Auth & rate limiting
- ✅ `src/app/api/v1/bookings/route.ts` - Bookings API
- ✅ `src/app/api/v1/trainers/route.ts` - Trainers API
- ✅ `src/app/api/v1/facilities/route.ts` - Facilities API
- ✅ `src/app/api/developer/keys/route.ts` - Key management
- ✅ `src/app/api/developer/stats/route.ts` - Usage stats
- ✅ `src/components/sidebar.tsx` - Added "API Keys" link
- ✅ `prisma/migrations/*_api_keys_system.sql` - Database schema

---

## 🎉 Done!

Your platform now has:
- ✅ Its own API with keys
- ✅ Visual dashboard to manage keys
- ✅ Rate limiting & security
- ✅ Partner integration ready

**Just run the migration and restart the server!** 🚀

