# 🔧 RUN SUBSCRIPTION MIGRATION

## ✅ **EASIEST METHOD: Supabase SQL Editor**

### **Step 1: Open Supabase SQL Editor**
👉 **Click here**: https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql

### **Step 2: Open the SQL File**
Open the file: `MIGRATION_SUBSCRIPTIONS.sql` in this folder

### **Step 3: Copy All SQL**
- Select all (Cmd+A or Ctrl+A)
- Copy (Cmd+C or Ctrl+C)

### **Step 4: Paste in Supabase**
- Paste into the SQL Editor
- Click the green **"RUN"** button

### **Step 5: Verify Success**
You should see output like:
```
SUCCESS
message: "Subscription system tables created successfully!"
Total Plans: 4
```

---

## ✅ **WHAT THIS MIGRATION DOES**

### **Creates 4 Tables:**
1. ✅ `subscription_plans` - Free, Basic, Pro, Elite plans
2. ✅ `user_subscriptions` - User subscription records
3. ✅ `subscription_usage` - Feature usage tracking
4. ✅ `subscription_history` - Analytics & events

### **Seeds 4 Plans:**
- 🆓 **Free** - 3 G.I.A. queries/day
- 💰 **Basic ($4.99/mo)** - Unlimited G.I.A. + 1 AI persona/day
- 🌟 **Pro ($14.99/mo)** - Unlimited AI + 10% off bookings
- 👑 **Elite ($29.99/mo)** - Everything + 20% off + concierge

### **Creates Indexes:**
- Optimized for fast lookups
- Efficient usage queries

---

## 📋 **AFTER MIGRATION**

Once the migration succeeds, test it:

```bash
# Test the API
curl http://localhost:3000/api/subscriptions/plans
```

You should see all 4 plans returned!

---

## 💡 **NEXT STEPS AFTER MIGRATION**

1. ✅ **Migration complete** ← You're here!
2. 📦 **Create Stripe products** (Basic, Pro, Elite)
3. 🔗 **Update plans with Stripe price IDs**
4. 🧪 **Test subscription flow**

---

## 🆘 **TROUBLESHOOTING**

### **If you see "relation already exists"**
✅ **This is fine!** It means the tables were already created. The migration is safe to run multiple times.

### **If you see other errors**
Check that:
- You're connected to the correct database
- You have proper permissions
- The SQL syntax is valid

---

## 🚀 **READY?**

**Click here to open SQL Editor**: https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql

Then copy-paste `MIGRATION_SUBSCRIPTIONS.sql` and hit **RUN**! 🎉

