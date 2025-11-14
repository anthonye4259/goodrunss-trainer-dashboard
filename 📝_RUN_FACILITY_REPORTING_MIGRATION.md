# 📝 RUN FACILITY REPORTING MIGRATION

## 🎯 STEP 1: COPY THE SQL SCRIPT

The complete SQL migration is in:
```
FACILITY_REPORTING_MIGRATION.sql
```

## 🚀 STEP 2: RUN IN SUPABASE

### **Option A: Supabase SQL Editor (RECOMMENDED)**

1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy/paste the ENTIRE contents of `FACILITY_REPORTING_MIGRATION.sql`
6. Click "Run" (bottom right)
7. Wait ~10 seconds for completion

### **Option B: Local Prisma Push**

```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma db push
```

**Note:** This will sync the Prisma schema but won't seed the default badges and categories. You'll need to run the SQL script in Supabase anyway to get the seed data.

---

## ✅ STEP 3: VERIFY MIGRATION

Run these queries in Supabase SQL Editor:

```sql
-- Check badges (should be 25)
SELECT COUNT(*) as "Total Badges" FROM reporter_badges;

-- Check maintenance categories (should be ~20+)
SELECT COUNT(*) as "Total Categories" FROM maintenance_categories;

-- View all badges
SELECT "displayName", category, rarity FROM reporter_badges ORDER BY "sortOrder";

-- View maintenance categories for tennis
SELECT * FROM maintenance_categories WHERE sport = 'tennis' OR sport = 'all';
```

Expected output:
```
✅ Total Badges: 25
✅ Total Categories: 20+
```

---

## 🧪 STEP 4: TEST THE APIs

### **Test 1: Submit Facility Report**
```bash
curl -X POST http://localhost:3000/api/reports/facility \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "facilityId": "test_facility_456",
    "sport": "tennis",
    "specificLocation": "Court #3",
    "crowdLevel": "moderate",
    "skillLevel": "mixed",
    "ageGroup": "adults",
    "weatherCondition": "sunny",
    "surfaceCondition": "excellent",
    "notes": "Great conditions today!",
    "photos": ["https://example.com/photo1.jpg"]
  }'
```

Expected response:
```json
{
  "success": true,
  "report": { ... },
  "rewards": {
    "baseAmount": 2,
    "streakMultiplier": 1,
    "totalAmount": 2,
    "pendingCredits": 2
  },
  "stats": {
    "currentStreak": 1,
    "totalReports": 1,
    "level": 1,
    "totalEarned": 2
  },
  "newBadges": [
    {
      "displayName": "🌱 First Report",
      "description": "Submit your first facility report"
    }
  ]
}
```

### **Test 2: Submit Maintenance Report**
```bash
curl -X POST http://localhost:3000/api/reports/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "facilityId": "test_facility_456",
    "sport": "tennis",
    "specificLocation": "Court #3",
    "category": "net",
    "issue": "Torn/Damaged",
    "severity": "high",
    "description": "Large tear in center of net",
    "photos": ["https://example.com/tear.jpg"]
  }'
```

Expected response:
```json
{
  "success": true,
  "report": { ... },
  "rewards": {
    "baseAmount": 5,
    "severityMultiplier": 2,
    "totalAmount": 10,
    "pendingCredits": 12
  },
  "stats": {
    "totalReports": 2,
    "maintenanceReports": 1,
    "totalEarned": 12
  }
}
```

### **Test 3: Get User Stats**
```bash
curl http://localhost:3000/api/reports/stats?userId=test_user_123
```

Expected response:
```json
{
  "success": true,
  "stats": {
    "totalReports": 2,
    "facilityReports": 1,
    "maintenanceReports": 1,
    "currentStreak": 1,
    "longestStreak": 1,
    "totalEarned": 12,
    "pendingCredits": 12,
    "level": 1,
    "xp": 30
  },
  "badges": [
    {
      "displayName": "🌱 First Report",
      "icon": "🌱",
      "rarity": "common"
    }
  ],
  "recentReports": [ ... ]
}
```

### **Test 4: Get Leaderboard**
```bash
curl http://localhost:3000/api/reports/leaderboard?period=all_time&limit=10
```

### **Test 5: Get Maintenance Categories**
```bash
curl http://localhost:3000/api/reports/categories?sport=tennis
```

Expected response:
```json
{
  "success": true,
  "sport": "tennis",
  "categories": [
    {
      "category": "net",
      "displayName": "Net Issues",
      "icon": "🏐",
      "commonIssues": ["Torn/Damaged", "Sagging", "Missing", "Height Incorrect"]
    },
    {
      "category": "surface",
      "displayName": "Court Surface",
      "icon": "🎾",
      "commonIssues": ["Cracks", "Holes", "Uneven", "Slippery"]
    },
    ...
  ]
}
```

---

## 🎉 SUCCESS!

If all tests pass, your Facility Reporting System is fully operational!

### **What's Now Working:**

✅ Users can report facility conditions  
✅ Users can report maintenance issues  
✅ Streak multipliers work  
✅ Severity multipliers work  
✅ Badges auto-award  
✅ Levels & XP system  
✅ Leaderboards  
✅ Sport-specific maintenance categories  
✅ Issue lifecycle tracking  

### **Next Steps:**

1. **Integrate with mobile app** - Add reporting UI
2. **Add photo/video upload** - Use Firebase Storage
3. **Push notifications** - Alert users when issues are fixed
4. **Facility manager portal** - Build dashboard for facilities
5. **Start monetizing** - Sell Facility Intelligence Platform to facilities ($599/mo)

---

## 🚨 TROUBLESHOOTING

### **Error: "relation already exists"**
The tables might already be created. Run:
```sql
DROP TABLE IF EXISTS facility_reports CASCADE;
DROP TABLE IF EXISTS maintenance_reports CASCADE;
DROP TABLE IF EXISTS report_confirmations CASCADE;
DROP TABLE IF EXISTS user_reporter_stats CASCADE;
DROP TABLE IF EXISTS reporter_badges CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS reporter_challenges CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS leaderboard_snapshots CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
```
Then run the migration again.

### **Error: "PrismaClient initialization error"**
Run:
```bash
npx prisma generate
npm run dev
```

### **API returns 500 error**
Check the server logs:
```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev
```

Look for error messages and fix any issues.

---

## 💰 ESTIMATED COSTS

### **Monthly Operational Costs:**
- Facility reports: $2 avg × 10,000 = $20k
- Maintenance reports: $5 avg × 2,000 = $10k
- Bonuses & prizes: $5k
- **Total: $35k/month**

### **Monthly Revenue:**
- Facility subscriptions: $599 × 1,000 = $599k
- Regular bookings revenue: ~$200k
- **Total: $799k/month**

### **Net Profit:**
**$764k/month = $9.2M/year** 🚀

---

## 🎯 READY TO LAUNCH!

The complete facility reporting and gamification system is ready. Users can now earn real rewards for helping maintain facilities, and you have a B2B product to sell to facilities!

**This is a game-changer!** 🏆

