# 🚀 AI PERSONA - QUICK TEST GUIDE

## ⚡ Test Your AI Persona APIs Right Now!

---

## 🎯 Prerequisites

1. ✅ Database migration ran: `RUN_THIS_MIGRATION_AI_PERSONA.sql`
2. ✅ Dev server running: `npm run dev`
3. ✅ At least one AI persona created (use trainer dashboard)

---

## 🧪 Quick Test Commands

### 1. Browse Marketplace (Public)
```bash
curl "http://localhost:3000/api/public/ai-personas?limit=10"
```

**Expected:** List of active AI personas

---

### 2. Get Specific Persona (Public)
```bash
# Replace PERSONA_ID with actual ID from step 1
curl "http://localhost:3000/api/public/ai-personas/PERSONA_ID"
```

**Expected:** Full persona details with trainer info

---

### 3. Get Voice Sample (Public)
```bash
curl "http://localhost:3000/api/public/ai-personas/voice-sample?personaId=PERSONA_ID"
```

**Expected:** Voice sample text + voice ID

---

### 4. Subscribe to Persona (Public)
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "PERSONA_ID",
    "userId": "test_user_123",
    "model": "pay_per_use"
  }'
```

**Expected:** Success message with subscription info

---

### 5. Start Training Session (Public)
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "PERSONA_ID",
    "userId": "test_user_123"
  }'
```

**Expected:** Session ID + startedAt timestamp

**SAVE THE SESSION ID!**

---

### 6. Chat with AI Persona (Public)
```bash
curl -X POST http://localhost:3000/api/gia \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a good HIIT workout for beginners?",
    "userId": "test_user_123",
    "userRole": "CLIENT",
    "personaId": "PERSONA_ID"
  }'
```

**Expected:** AI response in trainer's style and personality

**Try multiple messages to test conversation!**

---

### 7. End Session & Submit Rating (Public)
```bash
curl -X POST http://localhost:3000/api/public/ai-personas/session/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_FROM_STEP_5",
    "rating": 5,
    "feedback": "Amazing AI coach! Felt like talking to a real trainer.",
    "stripePaymentId": "pi_test_123456"
  }'
```

**Expected:** Session finalized, payment recorded, earnings created

---

### 8. View User's Subscriptions (Public)
```bash
curl "http://localhost:3000/api/public/ai-personas/subscriptions?userId=test_user_123"
```

**Expected:** List of all personas user has trained with + stats

---

## 🎯 Complete Test Flow

```bash
# 1. Browse
PERSONAS=$(curl -s "http://localhost:3000/api/public/ai-personas?limit=1")
echo $PERSONAS

# 2. Extract first persona ID (requires jq)
PERSONA_ID=$(echo $PERSONAS | jq -r '.personas[0].id')
echo "Testing with Persona ID: $PERSONA_ID"

# 3. Subscribe
curl -X POST http://localhost:3000/api/public/ai-personas/subscribe \
  -H "Content-Type: application/json" \
  -d "{\"personaId\": \"$PERSONA_ID\", \"userId\": \"test_user_123\", \"model\": \"pay_per_use\"}"

# 4. Start session
SESSION=$(curl -s -X POST http://localhost:3000/api/public/ai-personas/session/start \
  -H "Content-Type: application/json" \
  -d "{\"personaId\": \"$PERSONA_ID\", \"userId\": \"test_user_123\"}")
echo $SESSION

# 5. Extract session ID
SESSION_ID=$(echo $SESSION | jq -r '.session.id')
echo "Session ID: $SESSION_ID"

# 6. Chat with AI
curl -X POST http://localhost:3000/api/gia \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"What's a good HIIT workout?\", \"userId\": \"test_user_123\", \"userRole\": \"CLIENT\", \"personaId\": \"$PERSONA_ID\"}"

# 7. End session
curl -X POST http://localhost:3000/api/public/ai-personas/session/end \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"rating\": 5, \"feedback\": \"Great!\", \"stripePaymentId\": \"pi_test_123\"}"

# 8. View subscriptions
curl "http://localhost:3000/api/public/ai-personas/subscriptions?userId=test_user_123"
```

---

## 🔍 Check Database After Test

```sql
-- Check session was created
SELECT * FROM ai_persona_sessions ORDER BY "createdAt" DESC LIMIT 5;

-- Check earnings recorded
SELECT * FROM ai_persona_earnings ORDER BY "createdAt" DESC LIMIT 5;

-- Check feedback saved
SELECT * FROM ai_persona_feedback ORDER BY "createdAt" DESC LIMIT 5;

-- Check persona stats updated
SELECT 
  name,
  "totalSessions",
  "totalEarnings",
  "averageRating",
  "totalRatings"
FROM ai_personas;
```

---

## ✅ Success Criteria

After running all tests, you should see:

1. ✅ **Marketplace returns personas** with trainer info
2. ✅ **Persona details load** with full profile
3. ✅ **Voice sample returns** text + voice ID
4. ✅ **Subscribe succeeds** with success message
5. ✅ **Session starts** with session ID
6. ✅ **AI responds** in trainer's personality and style
7. ✅ **Session ends** with payment recorded
8. ✅ **Subscriptions show** user's training history
9. ✅ **Database updated** with session, earnings, feedback
10. ✅ **Persona stats incremented** (totalSessions, totalEarnings, averageRating)

---

## 🐛 Troubleshooting

### "AI persona not found"
- Check persona exists: `SELECT * FROM ai_personas WHERE "isActive" = true;`
- Verify PERSONA_ID is correct

### "Session not found"
- Check session was created: `SELECT * FROM ai_persona_sessions ORDER BY "createdAt" DESC LIMIT 1;`
- Verify SESSION_ID is correct

### GIA not responding in persona style
- Check personaId is included in request body
- Verify persona has teachingStyle and personality set

### No earnings recorded
- Check stripePaymentId was included in /session/end
- Verify paymentStatus changed to "COMPLETED"
- Check: `SELECT * FROM ai_persona_earnings;`

---

## 📊 Monitor Real-Time

Watch the logs while testing:

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch database
# Use Supabase dashboard or pgAdmin

# Terminal 3: Run test commands
curl ...
```

---

## 🎉 All Tests Pass?

**Congratulations!** Your AI Persona backend is working perfectly!

Now connect your **v0 frontend** to these APIs! 🚀

---

## 📚 Next Steps

1. ✅ **Backend complete** - All APIs working
2. 🔲 **Connect v0 frontend** - Use these API endpoints
3. 🔲 **Add Stripe payments** - Replace test payment IDs
4. 🔲 **Test end-to-end** - Full user journey
5. 🔲 **Deploy to production** - Launch! 🚀

---

**Built with 💚 for GoodRunss**

