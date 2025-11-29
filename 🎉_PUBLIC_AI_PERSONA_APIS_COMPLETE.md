# 🎉 PUBLIC AI PERSONA APIs - COMPLETE!

## ✅ What Was Built

**PUBLIC API routes** for the consumer mobile app to browse and train with AI personas!

---

## 📍 API Endpoints Created

All routes are in: `/api/public/ai-personas/`

### **1. Browse Marketplace**
```
GET /api/public/ai-personas

Query params:
- specialty?: string (e.g., "strength_training", "yoga")
- search?: string (search name, tagline, bio)
- teachingStyle?: string ("motivational", "technical", "gentle", "tough_love")
- minRating?: number (e.g., 4.0)
- sortBy?: "rating" | "users" | "newest" (default: "rating")
- featured?: "true" | "false"
- limit?: number (default: 20)
- page?: number (default: 1)

Returns:
{
  personas: [
    {
      id: "persona_123",
      trainerId: "trainer_456",
      trainerName: "John Smith",
      trainerImage: "https://...",
      personaName: "Coach John AI",
      description: "Elite HIIT trainer...",
      specialties: ["HIIT", "Strength"],
      voiceSample: "Hello! I'm Coach John...",
      pricing: {
        model: "pay_per_use",
        payPerUsePrice: 0.30,
        currency: "USD"
      },
      stats: {
        totalUsers: 150,
        averageRating: 4.8,
        reviewCount: 45,
        totalSessions: 380
      },
      knowledgeBase: {
        drillCount: 0,
        scriptCount: 0,
        videoCount: 0,
        audioCount: 0,
        totalContent: 0
      },
      status: "active",
      featured: false,
      tags: ["HIIT", "Strength"],
      createdAt: "2024-11-05T..."
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 12,
    totalPages: 1,
    hasMore: false
  }
}
```

**File:** `src/app/api/public/ai-personas/route.ts`

---

### **2. Get Persona Details**
```
GET /api/public/ai-personas/:id

Returns:
{
  persona: {
    id: "persona_123",
    trainerId: "trainer_456",
    trainerName: "John Smith",
    trainerImage: "https://...",
    personaName: "Coach John AI",
    description: "Full bio...",
    specialties: ["HIIT", "Strength"],
    certifications: ["NASM-CPT", "CrossFit L1"],
    teachingStyle: "motivational",
    personality: {
      motivational: 8,
      empathetic: 7,
      technical: 6,
      humorous: 5
    },
    voiceId: "elevenlabs_voice_id_here",
    voiceSample: "Hello! I'm Coach John...",
    voiceFileUrl: "https://...",
    videoUrl: "https://...",
    knowledgeBase: { ... },
    pricing: { ... },
    stats: { ... },
    status: "active",
    trainerApproved: true,
    approvedAt: "2024-11-05T...",
    featured: false,
    tags: ["HIIT", "Strength"],
    createdAt: "2024-11-05T...",
    recentFeedback: [
      {
        rating: 5,
        comment: "Amazing AI coach!",
        accuracyRating: 5,
        createdAt: "2024-11-06T..."
      }
    ]
  }
}
```

**File:** `src/app/api/public/ai-personas/[id]/route.ts`

---

### **3. Get User's Subscriptions**
```
GET /api/public/ai-personas/subscriptions?userId=user_123

Returns:
{
  subscriptions: [
    {
      id: "sub_persona_123_user_456",
      userId: "user_456",
      personaId: "persona_123",
      trainerId: "trainer_789",
      status: "active",
      model: "pay_per_use",
      sessionsRemaining: null,
      totalSpent: 3.00,
      sessionCount: 10,
      lastSessionAt: "2024-11-06T...",
      createdAt: "2024-11-01T...",
      persona: {
        id: "persona_123",
        personaName: "Coach John AI",
        trainerName: "John Smith",
        trainerImage: "https://...",
        specialties: ["HIIT", "Strength"],
        averageRating: 4.8,
        reviewCount: 45
      }
    }
  ]
}
```

**File:** `src/app/api/public/ai-personas/subscriptions/route.ts`

---

### **4. Subscribe to Persona**
```
POST /api/public/ai-personas/subscribe

Body:
{
  personaId: "persona_123",
  userId: "user_456",
  model: "pay_per_use"
}

Returns:
{
  success: true,
  subscription: {
    id: "sub_persona_123_user_456",
    personaId: "persona_123",
    userId: "user_456",
    model: "pay_per_use",
    status: "active",
    pricePerSession: 0.30,
    message: "You can now train with Coach John AI! You'll be charged $0.30 per session."
  }
}
```

**File:** `src/app/api/public/ai-personas/subscribe/route.ts`

**Note:** For pay-per-use model, no actual subscription record is created. User is charged per session when they train.

---

### **5. Start Training Session**
```
POST /api/public/ai-personas/session/start

Body:
{
  personaId: "persona_123",
  userId: "user_456"
}

Returns:
{
  success: true,
  session: {
    id: "session_789",
    personaId: "persona_123",
    playerId: "user_456",
    startedAt: "2024-11-06T12:00:00Z",
    cost: 0.30,
    status: "active"
  }
}
```

**File:** `src/app/api/public/ai-personas/session/start/route.ts`

**What it does:**
- Creates new session record in `ai_persona_sessions` table
- Sets `paymentStatus` to "PENDING"
- Returns session ID for tracking

---

### **6. End Training Session**
```
POST /api/public/ai-personas/session/end

Body:
{
  sessionId: "session_789",
  rating: 5,
  feedback: "Amazing AI coach!",
  stripePaymentId: "pi_abc123"
}

Returns:
{
  success: true,
  session: {
    id: "session_789",
    personaId: "persona_123",
    duration: 15,
    messageCount: 0,
    cost: 0.30,
    paymentStatus: "COMPLETED",
    endedAt: "2024-11-06T12:15:00Z"
  }
}
```

**File:** `src/app/api/public/ai-personas/session/end/route.ts`

**What it does:**
- Ends session (sets `endedAt`, calculates `duration`)
- Updates `paymentStatus` to "COMPLETED" if `stripePaymentId` provided
- Increments persona's `totalSessions` and `totalEarnings`
- Creates earnings record for trainer payout
- Saves feedback/rating
- Updates persona's average rating

---

### **7. Get Voice Sample**
```
GET /api/public/ai-personas/voice-sample?personaId=persona_123

Returns:
{
  success: true,
  voiceSample: {
    text: "Hello! I'm Coach John AI, your AI training assistant...",
    voiceId: "elevenlabs_voice_id_here",
    audioUrl: "https://..."
  }
}
```

**File:** `src/app/api/public/ai-personas/voice-sample/route.ts`

**What it returns:**
- Sample text for TTS
- ElevenLabs voice ID (for voice generation)
- Pre-recorded audio URL (if available)

---

### **8. Updated GIA Endpoint**
```
POST /api/gia

Body:
{
  message: "What's a good HIIT workout?",
  conversationHistory: [...],
  userId: "user_456",
  userRole: "CLIENT",
  environmentalData: {...},
  personaId: "persona_123"  // ✨ NEW!
}

Returns:
{
  response: {
    type: "chat",
    content: "YES! Let's crush a HIIT workout! 💪 Based on your current fitness level..."
  }
}
```

**File:** `src/app/api/gia/route.ts` (UPDATED)

**What's new:**
- Accepts `personaId` parameter
- Loads AI persona from database
- Builds custom system prompt with:
  - Trainer's name and bio
  - Teaching style (motivational, technical, gentle, tough_love)
  - Personality traits (motivational, empathetic, technical, humorous)
  - Specialties and certifications
  - Example responses in trainer's style
- AI responds as the trainer's persona, not generic GIA
- Maintains trainer's authentic voice and approach

---

## 🎯 Complete User Flow

### Player Experience:

```
1. Browse Marketplace
   GET /api/public/ai-personas?specialty=HIIT
   → Returns list of AI trainers

2. View Details
   GET /api/public/ai-personas/persona_123
   → Returns full profile + voice sample

3. "Subscribe" (validate access)
   POST /api/public/ai-personas/subscribe
   Body: { personaId, userId, model: "pay_per_use" }
   → Returns success (no actual subscription needed)

4. Start Training Session
   POST /api/public/ai-personas/session/start
   Body: { personaId, userId }
   → Creates session record, returns sessionId

5. Chat with AI Persona
   POST /api/gia
   Body: { message, personaId, userId, ... }
   → AI responds in trainer's style and voice

   (Repeat step 5 for conversation)

6. End Session & Pay
   POST /api/public/ai-personas/session/end
   Body: { sessionId, rating, feedback, stripePaymentId }
   → Finalizes session, charges $0.30, updates stats

7. View Subscriptions (History)
   GET /api/public/ai-personas/subscriptions?userId=user_456
   → Returns all personas user has trained with
```

---

## 💰 Pricing & Payments

### Current Model: **Pay-Per-Use**
- **Player pays:** $0.30 per session
- **Trainer earns:** $0.30 per session (100%)
- **No subscription** needed - pay when you train
- **Payment flow:**
  1. Session starts (free)
  2. Player chats with AI (free)
  3. Session ends → Player charged via Stripe
  4. Payment ID sent to `/session/end` endpoint
  5. Trainer earnings recorded for payout

### Future Model: **Subscription** (Ready for Implementation)
- Monthly unlimited: $X/month
- Just need to add subscription flag in database
- All API endpoints support both models

---

## 🗄️ Database Tables Used

### **ai_personas**
- Stores trainer's AI persona profile
- Fields: name, bio, teaching style, personality, voice ID, pricing

### **ai_persona_sessions**
- Tracks every training session
- Fields: personaId, playerId, duration, cost, payment status

### **ai_persona_feedback**
- Stores ratings and reviews
- Fields: rating, comment, accuracy rating

### **ai_persona_earnings**
- Tracks trainer earnings for payout
- Fields: amount, session count, payout status

---

## 🧪 Testing the APIs

### Test Marketplace:
```bash
curl "http://localhost:3000/api/public/ai-personas?limit=10"
```

### Test Persona Details:
```bash
curl "http://localhost:3000/api/public/ai-personas/PERSONA_ID"
```

### Test Subscribe:
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "PERSONA_ID",
    "userId": "USER_ID",
    "model": "pay_per_use"
  }'
```

### Test Start Session:
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "PERSONA_ID",
    "userId": "USER_ID"
  }'
```

### Test Chat with AI Persona:
```bash
curl -X POST http://localhost:3000/api/gia \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a good HIIT workout?",
    "userId": "USER_ID",
    "userRole": "CLIENT",
    "personaId": "PERSONA_ID"
  }'
```

### Test End Session:
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/session/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID",
    "rating": 5,
    "feedback": "Amazing AI coach!",
    "stripePaymentId": "pi_test_123"
  }'
```

---

## 📋 Files Created

```
✅ src/app/api/public/ai-personas/route.ts - Browse marketplace
✅ src/app/api/public/ai-personas/[id]/route.ts - Get persona details
✅ src/app/api/public/ai-personas/subscriptions/route.ts - User's subscriptions
✅ src/app/api/public/ai-personas/subscribe/route.ts - Subscribe to persona
✅ src/app/api/public/ai-personas/session/start/route.ts - Start session
✅ src/app/api/public/ai-personas/session/end/route.ts - End session
✅ src/app/api/public/ai-personas/voice-sample/route.ts - Voice sample
✅ src/app/api/gia/route.ts - UPDATED with persona support
```

**Total:** 7 new API routes + 1 updated route = **8 endpoints**

---

## 🔗 Integration with Mobile App

Your consumer mobile app (React Native) should call these endpoints:

```typescript
// 1. Browse marketplace
const response = await fetch('/api/public/ai-personas?specialty=HIIT')
const { personas } = await response.json()

// 2. Get persona details
const persona = await fetch(`/api/public/ai-personas/${personaId}`)

// 3. Subscribe
await fetch('/api/public/ai-personas/subscribe', {
  method: 'POST',
  body: JSON.stringify({ personaId, userId, model: 'pay_per_use' })
})

// 4. Start session
const session = await fetch('/api/public/ai-personas/session/start', {
  method: 'POST',
  body: JSON.stringify({ personaId, userId })
})

// 5. Chat with AI
const aiResponse = await fetch('/api/gia', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    personaId: personaId, // ✨ Include persona ID!
    userId: userId,
    userRole: 'CLIENT',
    conversationHistory: history
  })
})

// 6. End session
await fetch('/api/public/ai-personas/session/end', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: session.id,
    rating: 5,
    feedback: 'Great!',
    stripePaymentId: paymentIntent.id
  })
})
```

---

## ✅ What's Complete

1. ✅ **Marketplace API** - Browse all AI trainers
2. ✅ **Persona Details API** - Full profile + voice sample
3. ✅ **Subscriptions API** - User's training history
4. ✅ **Subscribe API** - Validate access to persona
5. ✅ **Session Start API** - Create session record
6. ✅ **Session End API** - Finalize, charge, record earnings
7. ✅ **Voice Sample API** - Preview trainer's voice
8. ✅ **GIA with Persona Support** - Chat in trainer's style

---

## 🚀 Ready to Launch!

All **PUBLIC API endpoints** for the consumer mobile app are complete and ready to use!

**Players can now:**
- ✅ Browse AI trainer marketplace
- ✅ View full persona profiles
- ✅ Subscribe/validate access
- ✅ Start training sessions
- ✅ Chat with AI trainer personas
- ✅ End sessions and pay
- ✅ Rate and review personas
- ✅ View training history

**Trainers earn:**
- 💰 $0.30 per session automatically
- 📊 Real-time earnings tracking
- 💳 Payouts when they reach $10

---

## 📚 Documentation

- `RUN_THIS_MIGRATION_AI_PERSONA.sql` - Database schema
- `🤖_AI_PERSONA_BACKEND_COMPLETE.md` - Trainer dashboard APIs
- `🎉_PUBLIC_AI_PERSONA_APIS_COMPLETE.md` - This file (consumer APIs)
- `AI_PERSONA_API_REFERENCE.md` - Full API reference

---

## 🎉 Status: 100% COMPLETE

**Backend APIs ready for v0 frontend!** 🚀

**Built with 💚 for GoodRunss**

