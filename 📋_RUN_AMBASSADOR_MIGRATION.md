# 📋 RUN AMBASSADOR PROGRAM MIGRATION

## 🚀 **QUICK START**

### **Step 1: Open Supabase**
1. Go to: https://console.firebase.google.com/project/goodrunss-ai
2. Wait... wrong one! 😅
3. Go to: https://supabase.com (your Supabase dashboard)
4. Select your GoodRunss project
5. Click **"SQL Editor"** in left sidebar

### **Step 2: Copy Migration**
1. Open file: `MIGRATION_AMBASSADOR_PROGRAM.sql`
2. Select ALL (Cmd+A)
3. Copy (Cmd+C)

### **Step 3: Run Migration**
1. In Supabase SQL Editor, paste the SQL
2. Click **"Run"** (or press Cmd+Enter)
3. Wait for completion (5-10 seconds)

### **Step 4: Verify Success**
You should see:
```
✅ Ambassador Program Database Created!
3 roles
9 tiers
```

---

## ✅ **WHAT GOT CREATED:**

### **8 Core Tables:**
- `program_roles` (3 roles)
- `role_tiers` (9 tiers)
- `ambassador_applications` (application system)
- `program_members` (active members)
- `program_activity` (tracking)
- `program_rewards` (earnings)

### **Court Captain Tables:**
- `court_captains` (facility assignments)

### **UGC Creator Tables:**
- `ugc_creators` (creator profiles)
- `ugc_content` (submitted content)

### **Ambassador Tables:**
- `ambassadors` (ambassador profiles)
- `ambassador_referrals` (tracked referrals)
- `ambassador_events` (hosted events)

**Total: 12 tables**

---

## 🎯 **SEED DATA INCLUDED:**

✅ **3 Program Roles:**
- Court Captain 🎾
- UGC Creator 📸
- Ambassador 🌟

✅ **9 Role Tiers:**
- Court Captain: Bronze, Silver, Gold
- UGC Creator: Bronze, Silver, Gold
- Ambassador: Bronze, Silver, Gold

Each tier has predefined requirements and perks!

---

## 🧪 **TEST IT:**

### **1. Check Roles:**
```sql
SELECT * FROM program_roles;
```

Should return 3 roles.

### **2. Check Tiers:**
```sql
SELECT * FROM role_tiers ORDER BY role_id, tier_level;
```

Should return 9 tiers (3 per role).

### **3. Test Application:**
```bash
curl -X POST http://localhost:3000/api/ambassador-program/apply \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "roleId": "court-captain",
    "motivation": "I want to help monitor my local courts!"
  }'
```

---

## ❌ **TROUBLESHOOTING:**

### **Error: "relation already exists"**
Tables already created! You're good to go. ✅

### **Error: "permission denied"**
Make sure you're using the SQL Editor in Supabase (not a SQL client).

### **Error: "syntax error"**
Copy the ENTIRE file, including all comments.

---

## 📞 **NEXT STEPS:**

1. ✅ Migration complete
2. 🧪 Test APIs (see 🌟_AMBASSADOR_PROGRAM_COMPLETE.md)
3. 📱 Build frontend in consumer app
4. 🚀 Launch program!

---

**Ready to build your community! 🎉**

