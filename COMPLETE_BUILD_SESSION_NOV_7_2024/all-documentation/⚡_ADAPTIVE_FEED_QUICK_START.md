# ⚡ ADAPTIVE FEED - QUICK START

## **1️⃣ SETUP (5 minutes)**

### **Push Database Changes:**
```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma db push
npx prisma generate
```

### **Verify Tables Created:**
```bash
npx prisma studio
# Check for: user_interactions, user_preferences, content_features, recommendation_scores, feed_sessions
```

---

## **2️⃣ CONSUMER APP INTEGRATION**

### **Install in Consumer App:**
```typescript
// src/hooks/useFeedAlgorithm.ts
import { useState, useEffect } from 'react';

export function useFeedAlgorithm(userId: string) {
  const [feed, setFeed] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  // Start session
  useEffect(() => {
    startSession();
  }, [userId]);

  const startSession = async () => {
    const response = await fetch('YOUR_API_URL/api/feed/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        deviceType: 'mobile',
        appVersion: '1.0.0',
      }),
    });
    const data = await response.json();
    setSessionId(data.session.id);
  };

  const loadFeed = async (refresh = false) => {
    setLoading(true);
    const currentOffset = refresh ? 0 : offset;
    
    const response = await fetch(
      `YOUR_API_URL/api/feed/personalized?userId=${userId}&limit=20&offset=${currentOffset}`
    );
    const data = await response.json();
    
    if (refresh) {
      setFeed(data.feed);
      setOffset(20);
    } else {
      setFeed(prev => [...prev, ...data.feed]);
      setOffset(prev => prev + 20);
    }
    
    setLoading(false);
  };

  const logInteraction = async (contentType, contentId, action, actionValue = null) => {
    await fetch('YOUR_API_URL/api/feed/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        contentType,
        contentId,
        action,
        actionValue,
        sessionId,
        deviceType: 'mobile',
      }),
    });
  };

  return { feed, loading, loadFeed, logInteraction, sessionId };
}
```

### **Use in Your Screen:**
```typescript
// src/screens/FeedScreen.tsx
import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useFeedAlgorithm } from '../hooks/useFeedAlgorithm';
import TrainerCard from '../components/TrainerCard';

export default function FeedScreen({ userId }) {
  const { feed, loading, loadFeed, logInteraction } = useFeedAlgorithm(userId);

  useEffect(() => {
    loadFeed(true); // Initial load
  }, []);

  return (
    <FlatList
      data={feed}
      renderItem={({ item }) => (
        <TrainerCard
          trainer={item}
          onView={() => logInteraction(item.contentType, item.contentId, 'view')}
          onLike={() => logInteraction(item.contentType, item.contentId, 'like')}
          onSkip={() => logInteraction(item.contentType, item.contentId, 'skip')}
          onBook={() => logInteraction(item.contentType, item.contentId, 'book')}
        />
      )}
      onEndReached={() => loadFeed()} // Infinite scroll
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={() => loadFeed(true)}
    />
  );
}
```

---

## **3️⃣ INDEX EXISTING CONTENT**

### **Option A: Manual API Calls**
```bash
# Index a trainer
curl -X POST http://localhost:3000/api/feed/content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "trainer",
    "contentId": "trainer_123",
    "workoutType": "strength",
    "intensity": "advanced",
    "duration": 60,
    "specialty": ["muscle_gain", "weight_loss"],
    "equipment": ["dumbbells"],
    "trainerId": "trainer_123",
    "trainerStyle": "motivational",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "publishedAt": "2025-01-01T00:00:00Z",
    "tags": ["strength", "advanced"]
  }'
```

### **Option B: Bulk Index Script**
```typescript
// scripts/indexExistingContent.ts
import { prisma } from '../src/lib/prisma';

async function indexAllTrainers() {
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
  });

  for (const trainer of trainers) {
    await fetch('http://localhost:3000/api/feed/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'trainer',
        contentId: trainer.id,
        workoutType: trainer.specialties?.[0] || 'general',
        intensity: 'medium',
        duration: 60,
        specialty: trainer.specialties || [],
        trainerId: trainer.id,
        trainerStyle: 'motivational',
        location: {
          lat: trainer.latitude,
          lng: trainer.longitude,
        },
        publishedAt: trainer.createdAt,
        tags: trainer.specialties || [],
      }),
    });
    console.log(`✅ Indexed trainer: ${trainer.name}`);
  }
}

indexAllTrainers();
```

---

## **4️⃣ TEST THE FEED**

### **Test Personalized Feed:**
```bash
# Get feed for user
curl "http://localhost:3000/api/feed/personalized?userId=test_user&limit=10"
```

### **Test Interaction Logging:**
```bash
# Log a like
curl -X POST http://localhost:3000/api/feed/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "contentType": "trainer",
    "contentId": "trainer_123",
    "action": "like",
    "sessionId": "session_xyz",
    "deviceType": "mobile"
  }'
```

### **Recompute Preferences:**
```bash
# After 50+ interactions
curl -X POST http://localhost:3000/api/feed/preferences/compute \
  -H "Content-Type: application/json" \
  -d '{ "userId": "test_user" }'
```

### **Check Preferences:**
```bash
curl "http://localhost:3000/api/feed/preferences?userId=test_user"
```

---

## **5️⃣ TRAINER DASHBOARD INTEGRATION**

### **Auto-index when trainer creates profile:**
```typescript
// src/app/api/trainers/route.ts
export async function POST(req: NextRequest) {
  // ... create trainer ...
  
  // Index for feed algorithm
  await fetch('http://localhost:3000/api/feed/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType: 'trainer',
      contentId: trainer.id,
      workoutType: trainer.specialties[0],
      intensity: 'medium',
      trainerId: trainer.id,
      trainerStyle: 'motivational',
      specialty: trainer.specialties,
      publishedAt: new Date(),
    }),
  });
}
```

### **Update metrics periodically:**
```typescript
// Cron job or webhook
async function syncTrainerMetrics() {
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    include: {
      _count: {
        select: {
          trainerSessions: true,
          reviews: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });

  for (const trainer of trainers) {
    const avgRating = trainer.reviews.reduce((sum, r) => sum + r.rating, 0) / trainer.reviews.length;
    
    await fetch('http://localhost:3000/api/feed/content', {
      method: 'PUT',
      body: JSON.stringify({
        contentType: 'trainer',
        contentId: trainer.id,
        viewCount: trainer._count.trainerSessions * 10, // Estimate
        bookingCount: trainer._count.trainerSessions,
        rating: avgRating,
      }),
    });
  }
}
```

---

## **6️⃣ COMMON ACTIONS TO LOG**

### **Essential Actions:**
```typescript
// ✅ Always log these
logInteraction('trainer', trainerId, 'view');     // User views profile
logInteraction('trainer', trainerId, 'like');     // User likes/hearts
logInteraction('trainer', trainerId, 'skip');     // User swipes away
logInteraction('trainer', trainerId, 'book');     // User books session
logInteraction('trainer', trainerId, 'share');    // User shares profile
```

### **Advanced Actions:**
```typescript
// 📹 Video watching
logInteraction('video', videoId, 'watch', watchDuration);

// 📖 Content completion
logInteraction('workout', workoutId, 'complete', completionPercentage);

// 🔖 Bookmarking
logInteraction('trainer', trainerId, 'bookmark');

// 💬 Messaging
logInteraction('trainer', trainerId, 'message');
```

---

## **7️⃣ MONITORING**

### **Track Algorithm Performance:**
```bash
# Get session analytics
curl "http://localhost:3000/api/feed/session/analytics?userId=test_user&days=30"
```

### **Key Metrics to Watch:**
- **Skip Rate:** Should be < 20%
- **Engagement Rate:** Should be > 20%
- **Booking Rate:** Should be > 5%
- **Avg Time Per Item:** Should be > 30 seconds

### **A/B Testing:**
- Test different weight formulas
- Test diversity window size
- Test recency decay rate
- Compare algorithm versions

---

## **8️⃣ OPTIMIZATION TIPS**

### **Performance:**
1. Cache recommendations for 1 hour
2. Batch interaction logs (don't block UI)
3. Index content immediately, update metrics async
4. Use pagination (limit=20, offset=0)

### **Accuracy:**
1. Recompute preferences every 50 interactions
2. Heavy penalty for skipped content (-2.0 weight)
3. Big boost for bookings (+5.0 weight)
4. Diversity filter prevents repetition

### **Cold Start (New Users):**
1. Show popular content first
2. Ask for preferences in onboarding
3. Learn quickly from first 10 interactions
4. Switch to personalized after 20 interactions

---

## **✅ CHECKLIST**

- [ ] Database migrated (`npx prisma db push`)
- [ ] Prisma client regenerated (`npx prisma generate`)
- [ ] Existing content indexed
- [ ] Consumer app hook installed
- [ ] Interaction logging working
- [ ] Personalized feed loading
- [ ] Trainer dashboard auto-indexing
- [ ] Monitoring setup

---

## **🎯 EXPECTED BEHAVIOR**

### **Day 1 (New User):**
- Shows popular/trending content
- Balanced mix of workout types
- Location-aware recommendations

### **Day 7 (50+ interactions):**
- Mostly personalized (80%)
- Some exploration (20%)
- Strong preferences forming

### **Day 30 (200+ interactions):**
- Highly personalized (90%)
- Rare exploration (10%)
- Smart diversity filtering

---

## **🚀 YOU'RE READY!**

Your adaptive feed will:
1. ✅ Learn from every swipe/like/skip
2. ✅ Get smarter over time
3. ✅ Show diverse content
4. ✅ Prioritize quality & recency
5. ✅ Work like TikTok's algorithm

**Start logging interactions and watch the magic happen!** 🎉

---

**Built with 🧠 for GoodRunss**  
**Train Smarter • Train Safer • Train Better**

