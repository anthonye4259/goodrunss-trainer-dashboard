# 📋 RUN THIS MIGRATION IN SUPABASE

## 🚀 **STEPS:**

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `MIGRATION_FACILITY_REPORTS.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success!" message

---

## ✅ **WHAT THIS CREATES:**

### **Tables:**
- `facility_reports` - Condition reports (crowd, skill, etc.)
- `maintenance_reports` - Repair reports
- `report_confirmations` - User verifications
- `user_reporter_stats` - User stats, streaks, earnings
- `reporter_badges` - Badge definitions
- `user_badges` - User's earned badges
- `reporter_challenges` - Active challenges
- `user_challenges` - User progress
- `leaderboard_snapshots` - Historical rankings
- `maintenance_categories` - Predefined categories by sport

### **Seed Data:**
- **15 badges** (milestone, maintenance, streak, quality)
- **25+ maintenance categories** for all sports:
  - Tennis (6 categories)
  - Pickleball (4 categories)
  - Basketball (3 categories)
  - Golf (5 categories)
  - Yoga/Pilates/Barre (7 categories)

---

## 🎯 **AFTER RUNNING:**

Check the results at the bottom of the SQL editor:
```
✅ Facility reporting system tables created successfully!
Reporter Badges: 15
Maintenance Categories: 25
```

---

## 🧪 **TEST THE APIs:**

```bash
# Make sure your server is running
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev

# Test facility report
curl -X POST http://localhost:3000/api/facility-reports/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","facilityId":"fac123","sport":"tennis","crowdLevel":"moderate"}'

# Test maintenance report
curl -X POST http://localhost:3000/api/facility-reports/maintenance \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","facilityId":"fac123","sport":"tennis","category":"net","issue":"Net torn","severity":"high","photos":["photo1.jpg"]}'

# Get user stats
curl http://localhost:3000/api/facility-reports/stats?userId=test123

# Get leaderboard
curl http://localhost:3000/api/facility-reports/leaderboard?period=weekly
```

---

## 📱 **READY FOR MOBILE APP INTEGRATION!**

All APIs are live and ready to use in your React Native consumer app!

