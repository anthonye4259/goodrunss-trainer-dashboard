# 🗺️ SCRAPE ALL FACILITIES FROM OPENSTREETMAP (FREE!)

## 🎯 **WHAT YOU'LL GET:**

### **Outdoor Sports (Excellent Coverage):**
- ✅ Tennis courts: ~500k globally
- ✅ Basketball courts: ~300k globally
- ✅ Pickleball courts: ~50k globally
- ✅ Golf courses: ~40k globally
- ✅ Soccer fields: ~200k globally
- ✅ Volleyball courts: ~100k globally
- ✅ Baseball fields: ~80k globally
- ✅ American football fields: ~30k globally
- ✅ Track & field: ~50k globally
- ✅ Outdoor swimming pools: ~100k globally
- ✅ Skate parks: ~20k globally

**Total: ~1.5 MILLION outdoor facilities worldwide!** 🌍

### **Indoor Facilities (Limited but Free!):**
- ⚠️ Gyms/rec centers: ~10-20k (missing most)
- ⚠️ Yoga studios: ~1k (missing most)
- ⚠️ Pilates studios: ~500 (missing most)
- BUT: Better than nothing! FREE!

---

## 🚀 **HOW TO SCRAPE EVERYTHING:**

### **Step 1: Start your server**
```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev
```

### **Step 2: In a NEW terminal, run these commands:**

#### **🏀 Outdoor Sports You DON'T Have Yet:**

```bash
# Volleyball
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "volleyball", "region": "worldwide"}'

# Soccer
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "soccer", "region": "worldwide"}'

# Baseball
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "baseball", "region": "worldwide"}'

# American Football
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "american_football", "region": "worldwide"}'

# Track & Field
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "running", "region": "worldwide"}'

# Swimming pools (outdoor)
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "swimming", "region": "worldwide"}'

# Skate parks
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "skateboard", "region": "worldwide"}'
```

#### **🏋️ Indoor Facilities (Whatever Exists):**

```bash
# Gyms & fitness centers
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "fitness", "region": "worldwide"}'

# Recreation centers
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "multi-sport", "region": "worldwide"}'

# Indoor swimming pools
curl -X POST http://localhost:3000/api/scraper/osm \
  -H "Content-Type: application/json" \
  -d '{"sport": "swimming_indoor", "region": "worldwide"}'
```

---

## ⏱️ **ESTIMATED TIME:**

| Sport | Facilities | Time |
|-------|-----------|------|
| Volleyball | ~100k | 1-2 hours |
| Soccer | ~200k | 2-3 hours |
| Baseball | ~80k | 1-2 hours |
| Football | ~30k | 30-60 min |
| Track | ~50k | 1 hour |
| Swimming | ~100k | 1-2 hours |
| Skate parks | ~20k | 30 min |
| Gyms/Rec | ~20k | 30 min |
| **TOTAL** | **~600k** | **8-12 hours** |

**Combined with your existing 77k = ~680,000 total facilities!** 🎉

---

## 📊 **CHECK PROGRESS:**

```bash
# See how many facilities you have
curl http://localhost:3000/api/facilities/stats
```

---

## 💡 **FOR INDOOR STUDIOS (Yoga, Pilates, Barre):**

OSM won't get you much. Your options:

### **Option A: User-Generated (Recommended)**
- Let Court Captains add missing facilities
- Reward them $5 per verified facility
- FREE + builds community!

### **Option B: Foursquare API (~$100-200)**
- Cheaper than Google
- Good studio coverage
- Use for targeted scraping (just major cities)

### **Option C: Manual Import**
- Download studio directories
- Import CSV files
- One-time effort

---

## 🎯 **RECOMMENDED STRATEGY:**

1. ✅ **TODAY:** Run all OSM scrapers (FREE, gets 680k facilities)
2. ✅ **THIS WEEK:** Launch with OSM data, let users report missing facilities
3. ✅ **MONTH 1:** Court Captains fill gaps (FREE + engagement!)
4. ⏸️ **LATER:** Consider Foursquare for remaining indoor studios ($100-200)

---

## 🚀 **READY?**

Run the commands above and let them scrape overnight!

Your laptop needs to stay awake:
```bash
caffeinate -d
```

Or just keep the lid open and plugged in! 🔌

