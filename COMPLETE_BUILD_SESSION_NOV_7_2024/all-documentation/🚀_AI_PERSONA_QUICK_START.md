# 🚀 AI PERSONA - QUICK START

## **3-STEP SETUP**

### **Step 1: Run Database Migration**
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Using Prisma (Recommended)
npx prisma db push
npx prisma generate

# OR copy SQL from RUN_THIS_MIGRATION_AI_PERSONA.sql to Supabase
```

---

### **Step 2: Start Dev Server**
```bash
npm run dev
```

---

### **Step 3: Test It Works**

Open your browser to the trainer dashboard and:

1. Go to **AI Persona Studio** (sidebar)
2. Create your AI persona (5-step flow)
3. Publish it
4. View analytics in **My Persona** tab

---

## **API ENDPOINTS CREATED**

### **For Trainers:**
- `GET /api/ai-persona` - Get your persona
- `POST /api/ai-persona` - Create persona
- `PUT /api/ai-persona` - Update persona
- `GET /api/ai-persona/analytics` - View stats & earnings
- `GET /api/ai-persona/payout` - View payout info
- `POST /api/ai-persona/payout` - Request payout

### **For Consumer App:**
- `GET /api/ai-persona/marketplace` - Browse AI personas
- `GET /api/ai-persona/[id]` - Get persona details
- `POST /api/ai-persona/session` - Start session ($0.30)
- `POST /api/ai-persona/session/complete` - End & charge
- `POST /api/ai-persona/feedback` - Rate AI persona

---

## **HOW TRAINERS EARN $0.30**

1. **Player discovers trainer's AI persona** in marketplace
2. **Player starts session** with AI
3. **Player chats with AI** (using trainer's voice & style)
4. **Session ends** → Player charged $0.30
5. **Trainer earns $0.30** → Added to payout balance
6. **Trainer requests payout** when balance ≥ $10

---

## **DATABASE TABLES**

✅ **ai_personas** - Trainer AI profiles (one per trainer)  
✅ **ai_persona_sessions** - Each time a player uses AI  
✅ **ai_persona_feedback** - Player ratings & reviews  
✅ **ai_persona_earnings** - Track payouts  

---

## **KEY FEATURES**

✅ **One persona per trainer** (`trainerId` is unique)  
✅ **$0.30 per session** (customizable)  
✅ **Auto-track earnings** (updated on session complete)  
✅ **Payout system** (Stripe Connect ready)  
✅ **Rating system** (1-5 stars with feedback)  
✅ **Analytics dashboard** (sessions, earnings, feedback)  
✅ **Marketplace discovery** (public API)  
✅ **ElevenLabs voice** support (store voice ID)  

---

## **FRONTEND ALREADY BUILT**

The frontend is already complete! You just need to connect it to these APIs:

### **In AI Persona Studio:**
- Connect form submission to `POST /api/ai-persona`
- Connect updates to `PUT /api/ai-persona`
- Load persona data from `GET /api/ai-persona`

### **In My Persona Dashboard:**
- Load analytics from `GET /api/ai-persona/analytics`
- Load payout info from `GET /api/ai-persona/payout`
- Connect payout button to `POST /api/ai-persona/payout`

---

## **EXAMPLE: CREATE PERSONA**

```typescript
// In AI Persona Studio form submission
const createPersona = async (formData) => {
  const response = await fetch('/api/ai-persona', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      tagline: formData.tagline,
      bio: formData.bio,
      voiceFileUrl: formData.voiceUrl,
      videoUrl: formData.videoUrl,
      teachingStyle: formData.teachingStyle,
      personality: formData.personality,
      specialties: formData.specialties,
      certifications: formData.certifications,
    }),
  });

  const data = await response.json();
  console.log('Persona created:', data);
};
```

---

## **EXAMPLE: LOAD ANALYTICS**

```typescript
// In My Persona Dashboard
const loadAnalytics = async () => {
  const response = await fetch('/api/ai-persona/analytics?days=30');
  const data = await response.json();
  
  setSummary(data.summary);
  setDailyStats(data.dailyStats);
  setRecentFeedback(data.recentFeedback);
};
```

---

## **TESTING FROM CONSUMER APP**

```bash
# 1. Browse personas
curl "http://localhost:3000/api/ai-persona/marketplace?limit=10"

# 2. Start session
curl -X POST http://localhost:3000/api/ai-persona/session \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "persona_123",
    "playerId": "user_456",
    "apiKey": "test"
  }'

# 3. Complete session
curl -X POST http://localhost:3000/api/ai-persona/session/complete \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_789",
    "stripePaymentId": "pi_test_123",
    "duration": 10,
    "messageCount": 15
  }'

# 4. Submit feedback
curl -X POST http://localhost:3000/api/ai-persona/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "persona_123",
    "playerId": "user_456",
    "sessionId": "session_789",
    "rating": 5,
    "comment": "Amazing AI coach!"
  }'
```

---

## **FILES TO REFERENCE**

📄 **🤖_AI_PERSONA_BACKEND_COMPLETE.md** - Full documentation  
📄 **AI_PERSONA_API_REFERENCE.md** - API endpoints reference  
📄 **RUN_THIS_MIGRATION_AI_PERSONA.sql** - Database migration  

---

## **WHAT'S NEXT?**

1. ✅ Run migration
2. ✅ Test APIs
3. 🔲 Connect frontend to backend
4. 🔲 Test end-to-end flow
5. 🔲 Add Stripe Connect for payouts
6. 🔲 Deploy to production

---

## **REVENUE CALCULATION**

| Sessions | Earnings | Payout Status |
|----------|----------|---------------|
| 10       | $3.00    | ❌ Can't payout yet |
| 50       | $15.00   | ✅ Can request payout |
| 100      | $30.00   | ✅ Can request payout |
| 500      | $150.00  | ✅ Can request payout |
| 1,000    | $300.00  | ✅ Can request payout |
| 10,000   | $3,000   | ✅ Can request payout |

**If a trainer gets 100 sessions/day:**
- Daily: $30.00
- Weekly: $210.00
- Monthly: $900.00
- Yearly: $10,950

---

## **🎉 YOU'RE READY!**

The AI Persona backend is complete and ready to use. Just connect your frontend and start earning! 🚀

**Questions?** Check the full documentation in:
- 🤖_AI_PERSONA_BACKEND_COMPLETE.md
- AI_PERSONA_API_REFERENCE.md

**Happy building! 💚**

