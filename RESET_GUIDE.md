# How to Reset Everything & Start Fresh

## Option 1: Delete Your Test Accounts (Recommended)

### Delete from Clerk Dashboard:
1. Go to: https://dashboard.clerk.com/
2. Navigate to **Users** in the left sidebar
3. Find your test accounts
4. Click the **⋮** (3 dots) next to each user → **Delete**
5. Confirm deletion

### Delete from Database (if needed):
```sql
-- Connect to Supabase SQL Editor
-- https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql

-- View all users
SELECT id, email, name FROM users;

-- Delete specific test users (replace with actual IDs)
DELETE FROM users WHERE email IN (
  'test@example.com',
  'anthony@test.com'
);

-- OR delete ALL users (nuclear option - be careful!)
-- TRUNCATE TABLE users CASCADE;
```

---

## Option 2: Full Database Reset (Nuclear Option)

### Reset Entire Database:
```sql
-- Connect to Supabase SQL Editor

-- Delete all data from all tables
TRUNCATE TABLE 
  users,
  clients,
  trainer_sessions,
  training_plans,
  ai_conversations,
  ai_insights,
  notifications,
  messages,
  reviews,
  user_activity
CASCADE;
```

---

## Option 3: Clear Browser Cache (Quick Test Reset)

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data**
4. Or use Incognito mode for clean test

---

## After Reset - Test Signup Flow:

1. **Signup**: `/signup`
   - Enter name, email, password
   - Account created via Clerk
   
2. **Payment**: Choose plan (1/3/6 months)
   - Redirects to Stripe
   - Enter test card: `4242 4242 4242 4242`
   
3. **Onboarding**: Business info, goals, timezone
   
4. **Dashboard**: Full access

---

## Important Notes:

- **Clerk** = Source of truth for authentication
- **Supabase** = Stores additional user data
- Deleting from Clerk doesn't auto-delete from Supabase (and vice versa)
- For complete reset, delete from both

---

## Quick Commands:

**View Clerk Users:**
https://dashboard.clerk.com/apps/app_2qVZqH8z3Ib3dTYuPFqkB4XMYXS/instances/ins_2qVZqHPeZhRj9CDvA8A1wBKCE6J/users

**View Supabase Users:**
https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/editor

**Stripe Test Customers:**
https://dashboard.stripe.com/test/customers

