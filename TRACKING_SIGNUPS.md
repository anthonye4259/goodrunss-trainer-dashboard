# How to Track Signups

## 1. Clerk Dashboard (Easiest)

**View All Signups:**
https://dashboard.clerk.com/

- Go to **Users** tab
- See total count, recent signups
- Filter by date, search by email
- Export to CSV

**Analytics:**
- Go to **Analytics** (if available in your plan)
- View signup trends over time

---

## 2. Stripe Dashboard

**View Trial Signups:**
https://dashboard.stripe.com/subscriptions

- Shows all subscriptions (including trials)
- Filter by status: `trialing`, `active`, `canceled`
- See revenue, churn, MRR

**View Customers:**
https://dashboard.stripe.com/customers

- Total paying customers
- Revenue per customer
- Payment history

---

## 3. Database Queries (Most Detailed)

### Connect to Supabase:
https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql

### Useful Queries:

```sql
-- Total user count
SELECT COUNT(*) as total_users FROM users;

-- Signups today
SELECT COUNT(*) as signups_today 
FROM users 
WHERE DATE("createdAt") = CURRENT_DATE;

-- Signups this week
SELECT COUNT(*) as signups_this_week 
FROM users 
WHERE "createdAt" >= NOW() - INTERVAL '7 days';

-- Signups by date (last 30 days)
SELECT 
  DATE("createdAt") as signup_date,
  COUNT(*) as signups
FROM users
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE("createdAt")
ORDER BY signup_date DESC;

-- Latest 10 signups
SELECT 
  email, 
  name, 
  "createdAt"
FROM users
ORDER BY "createdAt" DESC
LIMIT 10;

-- Users by role
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role;
```

---

## 4. Admin Dashboard (Built-in)

**Your Admin Portal:**
https://goodrunss-trainer-dashboard.vercel.app/admin

Features:
- Total user count (already built)
- List of all users
- Sync from Clerk button
- User details

---

## 5. Add Signup Tracking (Future Enhancement)

### Option A: Add Webhook Listener

**Clerk Webhook** (already set up in middleware):
- Triggers on `user.created` event
- Can log to database/analytics
- Real-time tracking

**Stripe Webhook** (already exists):
- Tracks `checkout.session.completed`
- Knows when users pay

### Option B: Google Analytics / Mixpanel

Add tracking to signup page:
```typescript
// In app/signup/page.tsx
const handleAccountCreation = async (e: React.FormEvent) => {
  // ... existing code ...
  
  // Track signup event
  gtag('event', 'sign_up', {
    method: 'email'
  })
}
```

---

## 6. Quick Check Commands

### Clerk User Count:
Go to Clerk Dashboard → Users → Total count at top

### Stripe Customer Count:
Go to Stripe Dashboard → Customers → Total count

### Database User Count:
Run SQL: `SELECT COUNT(*) FROM users;`

---

## Recommended Tracking Setup:

1. **Daily Check**: Clerk Dashboard (total users)
2. **Weekly Analysis**: Stripe Dashboard (revenue, trials)
3. **Monthly Deep Dive**: Database queries (conversion, retention)
4. **Admin Portal**: Quick overview anytime

---

## Want Me To Build Better Analytics?

I can add:
- Real-time signup counter in Admin Dashboard
- Signup charts (daily/weekly/monthly)
- Conversion tracking (signup → trial → paid)
- Email list export
- Automated reports

Let me know if you want this! 📊

