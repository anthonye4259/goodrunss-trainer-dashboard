# 🤖 AI PERSONA API - Quick Reference

## **TRAINER DASHBOARD APIs** (Authenticated)

### **1. Get Trainer's Persona**
```http
GET /api/ai-persona
Authorization: Bearer {CLERK_TOKEN}
```

**Response:**
```json
{
  "persona": {
    "id": "persona_123",
    "trainerId": "trainer_456",
    "name": "Coach John",
    "tagline": "Your AI Strength Coach",
    "bio": "15 years of experience",
    "isActive": true,
    "totalSessions": 150,
    "totalEarnings": "45.00",
    "averageRating": "4.8"
  }
}
```

---

### **2. Create Persona**
```http
POST /api/ai-persona
Authorization: Bearer {CLERK_TOKEN}
Content-Type: application/json

{
  "name": "Coach John",
  "tagline": "Your AI Strength Coach",
  "bio": "15 years of experience in strength training",
  "avatarUrl": "https://...",
  "voiceFileUrl": "https://...",
  "voiceSampleText": "Sample text trainer recorded",
  "videoUrl": "https://...",
  "teachingStyle": "motivational",
  "personality": {
    "motivational": 9,
    "empathetic": 7,
    "technical": 8,
    "humorous": 6
  },
  "specialties": ["strength_training", "powerlifting"],
  "certifications": ["NASM", "ACE"],
  "isDiscoverable": true
}
```

---

### **3. Update Persona**
```http
PUT /api/ai-persona
Authorization: Bearer {CLERK_TOKEN}
Content-Type: application/json

{
  "name": "Coach John Pro",
  "bio": "Updated bio",
  "isActive": true
}
```

---

### **4. Delete Persona**
```http
DELETE /api/ai-persona
Authorization: Bearer {CLERK_TOKEN}
```

---

### **5. Get Analytics**
```http
GET /api/ai-persona/analytics?days=30
Authorization: Bearer {CLERK_TOKEN}
```

**Response:**
```json
{
  "summary": {
    "totalSessions": 150,
    "totalEarnings": "45.00",
    "totalDuration": 1800,
    "totalMessages": 2250,
    "averageRating": "4.8",
    "totalFeedback": 120,
    "pendingPayout": "15.00",
    "totalPaid": "30.00"
  },
  "dailyStats": [
    {
      "date": "2025-01-01",
      "sessions": 5,
      "earnings": 1.50,
      "duration": 60,
      "messages": 75
    }
  ],
  "recentSessions": [...],
  "recentFeedback": [...]
}
```

---

### **6. Get Payout Summary**
```http
GET /api/ai-persona/payout
Authorization: Bearer {CLERK_TOKEN}
```

**Response:**
```json
{
  "summary": {
    "pendingTotal": "15.00",
    "processingTotal": "0.00",
    "paidTotal": "30.00",
    "totalEarnings": "45.00",
    "minimumPayout": "10.00",
    "canRequestPayout": true
  },
  "pendingEarnings": [...],
  "processingEarnings": [],
  "paidEarnings": [...]
}
```

---

### **7. Request Payout**
```http
POST /api/ai-persona/payout
Authorization: Bearer {CLERK_TOKEN}
```

**Response:**
```json
{
  "message": "Payout initiated successfully",
  "payoutId": "po_1234567890",
  "amount": "15.00",
  "earningsCount": 50
}
```

---

## **CONSUMER APP APIs** (Public/API Key)

### **8. Browse Marketplace**
```http
GET /api/ai-persona/marketplace?search=strength&specialty=strength_training&minRating=4.0&limit=20&offset=0
```

**Query Parameters:**
- `search` (optional) - Search by name, bio, tagline
- `specialty` (optional) - Filter by specialty
- `teachingStyle` (optional) - Filter by style
- `minRating` (optional) - Minimum rating (0-5)
- `limit` (optional) - Results per page (default: 20)
- `offset` (optional) - Pagination offset

**Response:**
```json
{
  "personas": [
    {
      "id": "persona_123",
      "name": "Coach John",
      "tagline": "Your AI Strength Coach",
      "bio": "15 years of experience",
      "avatarUrl": "https://...",
      "teachingStyle": "motivational",
      "specialties": ["strength_training", "powerlifting"],
      "certifications": ["NASM", "ACE"],
      "pricePerSession": "0.30",
      "totalSessions": 150,
      "averageRating": "4.8",
      "totalRatings": 120
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### **9. Get Persona Details**
```http
GET /api/ai-persona/persona_123
```

**Response:**
```json
{
  "persona": {
    "id": "persona_123",
    "name": "Coach John",
    "tagline": "Your AI Strength Coach",
    "bio": "15 years of experience",
    "avatarUrl": "https://...",
    "videoUrl": "https://...",
    "teachingStyle": "motivational",
    "personality": {
      "motivational": 9,
      "empathetic": 7,
      "technical": 8,
      "humorous": 6
    },
    "specialties": ["strength_training"],
    "certifications": ["NASM", "ACE"],
    "pricePerSession": "0.30",
    "isActive": true,
    "totalSessions": 150,
    "averageRating": "4.8",
    "totalRatings": 120
  }
}
```

---

### **10. Start Session**
```http
POST /api/ai-persona/session
Content-Type: application/json

{
  "personaId": "persona_123",
  "playerId": "user_456",
  "apiKey": "grsk_live_xyz123"
}
```

**Response:**
```json
{
  "session": {
    "id": "session_789",
    "personaId": "persona_123",
    "playerId": "user_456",
    "cost": "0.30",
    "trainerEarnings": "0.30",
    "paymentStatus": "pending",
    "startedAt": "2025-01-15T10:00:00Z"
  },
  "sessionId": "session_789",
  "message": "AI Persona session started"
}
```

---

### **11. Update Session**
```http
PUT /api/ai-persona/session
Content-Type: application/json

{
  "sessionId": "session_789",
  "messageCount": 15,
  "duration": 10
}
```

---

### **12. Complete Session**
```http
POST /api/ai-persona/session/complete
Content-Type: application/json

{
  "sessionId": "session_789",
  "stripePaymentId": "pi_xyz123",
  "duration": 12,
  "messageCount": 18,
  "conversationData": {
    "messages": [...]
  }
}
```

**Response:**
```json
{
  "session": {
    "id": "session_789",
    "endedAt": "2025-01-15T10:12:00Z",
    "duration": 12,
    "messageCount": 18,
    "paymentStatus": "completed"
  },
  "message": "Session completed successfully",
  "earnings": "0.30"
}
```

---

### **13. Submit Feedback**
```http
POST /api/ai-persona/feedback
Content-Type: application/json

{
  "personaId": "persona_123",
  "playerId": "user_456",
  "sessionId": "session_789",
  "rating": 5,
  "comment": "Great AI coach! Very helpful.",
  "isHelpful": true,
  "accuracyRating": 5
}
```

**Response:**
```json
{
  "feedback": {
    "id": "feedback_111",
    "rating": 5,
    "comment": "Great AI coach!",
    "createdAt": "2025-01-15T10:15:00Z"
  },
  "message": "Feedback submitted successfully"
}
```

---

## **TEACHING STYLES**

- `motivational` - Energetic and encouraging
- `technical` - Detailed and analytical
- `gentle` - Calm and supportive
- `tough_love` - Direct and challenging

---

## **PAYMENT STATUS**

- `pending` - Session created, not yet paid
- `completed` - Payment successful
- `failed` - Payment failed

---

## **PAYOUT STATUS**

- `pending` - Earnings not yet paid out
- `processing` - Payout in progress
- `paid` - Successfully paid to trainer

---

## **ERROR RESPONSES**

```json
{
  "error": "Unauthorized"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## **RATE LIMITS**

- Authenticated endpoints: 100 requests/minute
- Public marketplace: 60 requests/minute
- Session tracking: Unlimited

---

## **TESTING**

```bash
# Get persona (authenticated)
curl http://localhost:3000/api/ai-persona \
  -H "Authorization: Bearer {CLERK_TOKEN}"

# Browse marketplace (public)
curl "http://localhost:3000/api/ai-persona/marketplace?limit=10"

# Start session
curl -X POST http://localhost:3000/api/ai-persona/session \
  -H "Content-Type: application/json" \
  -d '{"personaId":"persona_123","playerId":"user_456","apiKey":"test"}'
```

---

**Ready to integrate! 🚀**

