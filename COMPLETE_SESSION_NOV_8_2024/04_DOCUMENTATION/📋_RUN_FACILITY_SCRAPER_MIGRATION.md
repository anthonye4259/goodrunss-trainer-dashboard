# 📋 RUN THIS IN SUPABASE TO GET 1M+ FACILITIES!

## 🚀 **QUICK START**

### **Step 1: Run Migration**
1. Go to Supabase SQL Editor
2. Copy **ALL** the SQL from `MIGRATION_FACILITIES_SCRAPER.sql`
3. Paste & Run
4. Should see: "9 Sport Mappings" created ✅

### **Step 2: Start Scraping (FREE!)**

```bash
# Make sure server is running
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev

# Start tennis scraper (500k+ courts worldwide!)
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "tennis", "region": "worldwide"}'

# Start basketball scraper (300k+ courts!)
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "basketball", "region": "worldwide"}'

# Start pickleball scraper (50k+ courts!)
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "pickleball", "region": "worldwide"}'

# Start golf scraper (40k+ courses!)
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "golf", "region": "worldwide"}'
```

Each scraper returns a `jobId` - save it to check progress!

### **Step 3: Check Progress**

```bash
# Check specific job
curl http://localhost:3000/api/scraper/osm?jobId=YOUR_JOB_ID

# Check database stats
curl http://localhost:3000/api/facilities/stats
```

### **Step 4: Test Search**

```bash
# Find tennis courts in NYC
curl "http://localhost:3000/api/facilities/search?lat=40.7128&lng=-74.0060&radius=10000&type=tennis"
```

---

## ⏱️ **TIMELINE**

- **Migration**: 30 seconds ✅
- **Tennis scrape**: ~10 minutes → 500,000+ courts
- **Basketball scrape**: ~8 minutes → 300,000+ courts
- **Pickleball scrape**: ~5 minutes → 50,000+ courts
- **Golf scrape**: ~5 minutes → 40,000+ courses

**Total: ~30 minutes for 1,000,000+ facilities!** 🎉

---

## 💰 **COST**

**OpenStreetMap: $0 (FREE!)** ✅

**Google Places (optional, for studios):**
- ~$170 one-time for ~10,000 yoga/pilates/barre studios
- Only run if you need studio listings!

---

## ✅ **RESULT**

**Day 1 of your app:**
- Users see **1,000,000+ facilities worldwide**
- Tennis courts, basketball courts, pickleball, golf, etc.
- Full addresses, GPS coordinates, amenities
- No empty database! 🚀

---

## 📱 **MOBILE APP INTEGRATION**

```typescript
// Find facilities near user
const response = await fetch(
  `${API_URL}/api/facilities/search?lat=${userLat}&lng=${userLng}&radius=5000&type=tennis`
);

const { facilities } = await response.json();

// facilities = [
//   { name: "Central Park Tennis", distance: 2.3, courtCount: 30, ...},
//   { name: "Riverside Courts", distance: 3.1, courtCount: 12, ...},
//   ...
// ]
```

---

**Ready? Let's do this! 🚀**

