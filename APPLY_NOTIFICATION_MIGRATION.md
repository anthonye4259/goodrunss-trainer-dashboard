# 🗄️ APPLY PUSH NOTIFICATIONS DATABASE MIGRATION

Quick guide to apply the database migration for push notifications.

---

## 🎯 WHAT THIS MIGRATION DOES

Adds to your database:
1. ✅ `fcmTokens` column to `users` table (stores device tokens)
2. ✅ `notification_preferences` table (user notification settings)
3. ✅ `deliveryStatus` column to `notifications` table (if it exists)

---

## 📝 METHOD 1: AUTOMATIC (RECOMMENDED)

Use Prisma to apply the migration:

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Apply migration
npx prisma db push
```

**That's it!** ✅

---

## 📝 METHOD 2: MANUAL SQL

If you prefer to run SQL directly:

```bash
# Connect to database
psql postgresql://postgres:Galagay1%24@db.akxwxsjoahopnplynzzb.supabase.co:5432/postgres

# Run migration
\i prisma/migrations/add_push_notifications.sql

# Exit
\q
```

---

## ✅ VERIFY MIGRATION

Check that everything was created:

```bash
npx prisma studio
```

Then verify:
- ✅ `users` table has `fcmTokens` column
- ✅ `notification_preferences` table exists with 11 boolean columns
- ✅ `notifications` table has `deliveryStatus` column

---

## 🧪 TEST MIGRATION

Quick test:

```bash
# In psql or Prisma Studio, run:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'fcmTokens';

# Should return: fcmTokens
```

---

## 🐛 TROUBLESHOOTING

### **"Can't reach database server"**

- Check Supabase is running
- Verify DATABASE_URL in `.env` is correct
- Check internet connection

### **"Table already exists"**

- Migration already applied! ✅
- Skip this step and continue

### **"Permission denied"**

- Check database user has CREATE TABLE permissions
- Verify you're using the correct database URL

---

## ✅ SUCCESS CRITERIA

Migration is successful when:
- ✅ No errors in console
- ✅ `fcmTokens` column exists in `users`
- ✅ `notification_preferences` table exists
- ✅ Can see new structures in Prisma Studio

---

**Status:** Ready to apply  
**Time:** ~30 seconds  
**Next Step:** Add Firebase Admin credentials to `.env`

