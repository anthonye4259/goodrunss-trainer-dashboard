# GIA Backend Features Summary

This document provides a comprehensive overview of the three AI-powered backend features built for the GoodRunss Trainer Dashboard.

---

## 📋 Table of Contents

1. [Feature 1: AI Session Plan Generator](#feature-1-ai-session-plan-generator)
2. [Feature 2: Auto CRM Document Parser](#feature-2-auto-crm-document-parser)
3. [Feature 3: Client Lead Matching System](#feature-3-client-lead-matching-system)
4. [Environment Variables](#environment-variables-required)
5. [Database Schema](#database-schema-overview)
6. [Deployment Checklist](#deployment-checklist)
7. [Testing Guide](#testing-guide)

---

## Feature 1: AI Session Plan Generator

### Overview
Generate complete, personalized training session plans in under 20 seconds using Claude 3.5 Sonnet.

### API Endpoint
```
POST /api/gia/generate-session-plan
```

### What It Does
- **Input:** Client name, age, level, sport/activity
- **Output:**
  - 45-minute session breakdown (warmup, drills, cooldown)
  - Coaching notes & progressions
  - Video playlist (YouTube)
  - Instagram post template
  - Client message
  - Downloadable PDF

### Key Files
- 📄 `app/api/gia/generate-session-plan/route.ts` - API endpoint
- 📄 `lib/services/gia-session-generator.ts` - AI service
- 📄 `lib/types/gia-session-plan.ts` - TypeScript types
- 📄 `app/dashboard/session-planner/page.tsx` - Frontend UI
- 📄 `docs/GIA_SESSION_PLAN_GENERATOR.md` - Full documentation

### Database Models
- `GiaSessionPlan` - Stores generated session plans

### AI Model
- **Claude 3.5 Sonnet** (via Anthropic API)
- ~4000 tokens per request
- Average response time: 5-8 seconds

### Example Request
```json
POST /api/gia/generate-session-plan
{
  "trainerId": "clx123...",
  "clientName": "Alex Johnson",
  "clientAge": 32,
  "clientLevel": "intermediate",
  "sport": "basketball",
  "sessionDuration": 60
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "id": "plan_123",
    "warmup": {
      "exercises": [...],
      "duration": 5
    },
    "drills": [...],
    "cooldown": {...},
    "videoPlaylist": {...},
    "instagramContent": {...},
    "messageToClient": "...",
    "pdfUrl": "https://firebase.../plan.pdf"
  },
  "generationTime": 7234
}
```

---

## Feature 2: Auto CRM Document Parser

### Overview
Upload client documents (intake forms, medical history, workout logs, photos) and automatically extract structured data using AI vision.

### API Endpoints
```
POST /api/gia/process-documents  # Upload & parse
GET  /api/gia/process-documents  # Retrieve extracted data
```

### What It Does
- **Input:** PDF/image files (intake forms, medical forms, workout logs)
- **Output:**
  - Client profiles (name, age, contact, medical history)
  - Goals (with categories, priorities, target dates)
  - Progress tracking (measurements, assessments)
  - AI-generated training recommendations

### Key Files
- 📄 `app/api/gia/process-documents/route.ts` - API endpoint
- 📄 `lib/services/document-parser.ts` - Claude Vision parser
- 📄 `lib/types/auto-crm.ts` - TypeScript types
- 📄 `docs/AUTO_CRM_DOCUMENT_PARSER.md` - Full documentation

### Database Models
- `CrmDocument` - Document metadata
- `ExtractedClientProfile` - Client information
- `ExtractedGoal` - Fitness goals
- `ExtractedProgress` - Progress tracking
- `RecommendedSession` - AI recommendations
- `AutoReminder` - Automated follow-ups
- `FollowUpMessage` - AI-generated messages

### AI Model
- **Claude 3.5 Sonnet with Vision** (via Anthropic API)
- Processes images and PDFs
- OCR + semantic understanding
- Confidence scoring (0-1)

### Example Request
```typescript
const formData = new FormData()
formData.append('trainerId', 'clx123...')
formData.append('clientName', 'Sarah Johnson')
formData.append('files', file1) // intake-form.pdf
formData.append('files', file2) // medical-history.jpg

const response = await fetch('/api/gia/process-documents', {
  method: 'POST',
  body: formData,
})
```

### Example Response
```json
{
  "success": true,
  "data": {
    "documents": [{
      "id": "doc_123",
      "storagePath": "crm-documents/...",
      "status": "completed"
    }],
    "extractedProfiles": [{
      "clientName": "Sarah Johnson",
      "clientAge": 32,
      "medicalHistory": ["Asthma", "Knee surgery 2020"],
      "confidence": 0.95
    }],
    "extractedGoals": [{
      "goalDescription": "Run 5K under 30 minutes",
      "goalCategory": "endurance",
      "priority": "high"
    }],
    "recommendations": [{
      "recommendationText": "Start with low-impact cardio..."
    }]
  },
  "processingTime": 5234
}
```

---

## Feature 3: Client Lead Matching System

### Overview
Intelligently match incoming client leads with the best-fit trainers using AI-powered multi-factor analysis.

### API Endpoints
```
POST /api/gia/match-leads  # Submit lead & get matches
GET  /api/gia/match-leads  # Retrieve leads/matches
PUT  /api/gia/match-leads  # Trainer responds
```

### What It Does
- **Input:** Client lead (name, email, goals, location, budget, preferences)
- **Output:**
  - Top 5 trainer matches (ranked by score)
  - Match scores (0-100) for each factor
  - AI-generated match reasons
  - Potential concerns
  - Suggested action (auto-assign / manual review / needs more info)

### Matching Factors
1. **Specialization (30%)** - Does trainer's expertise match client goals?
2. **Location (25%)** - How close are client and trainer?
3. **Availability (20%)** - Do their schedules align?
4. **Budget (15%)** - Does trainer's rate fit client's budget?
5. **Experience (5%)** - Does trainer meet experience requirements?
6. **Preferences (5%)** - Gender, language, certifications

### Key Files
- 📄 `app/api/gia/match-leads/route.ts` - API endpoint
- 📄 `lib/services/lead-matcher.ts` - Matching algorithm
- 📄 `lib/types/lead-matching.ts` - TypeScript types
- 📄 `docs/CLIENT_LEAD_MATCHING.md` - Full documentation

### Database Models
- `ClientLead` - Incoming client leads
- `LeadMatch` - Match records with scores

### AI Model
- **Claude 3.5 Sonnet** (via Anthropic API)
- Generates human-readable match reasons
- Identifies potential concerns
- Provides overall match summary

### Example Request
```json
POST /api/gia/match-leads
{
  "name": "Sarah Thompson",
  "email": "sarah@example.com",
  "location": {
    "city": "Los Angeles",
    "state": "CA"
  },
  "fitnessGoals": ["weight_loss", "strength_training"],
  "experienceLevel": "intermediate",
  "preferredSport": "tennis",
  "availability": {
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "timeOfDay": ["morning"]
  },
  "budgetRange": {
    "min": 60,
    "max": 100,
    "currency": "USD"
  }
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "lead_123",
      "status": "new",
      "aiSummary": "Strong match found with 3 trainers..."
    },
    "matchResult": {
      "topMatches": [
        {
          "trainerId": "trainer-1",
          "trainerName": "Sarah Johnson",
          "overallScore": 92.5,
          "scores": {
            "specialization": 95.0,
            "location": 100.0,
            "availability": 100.0,
            "budget": 87.5,
            "experience": 100.0,
            "preferences": 100.0
          },
          "matchReasons": [
            "Sarah Johnson specializes in weight loss and strength training",
            "Perfect location match - both in Los Angeles, CA",
            "Available on all your preferred days",
            "Session rate ($80) is within your budget range"
          ],
          "trainer": {
            "name": "Sarah Johnson",
            "pricing": { "sessionRate": 80 },
            ...
          }
        },
        ...
      ],
      "suggestedAction": "auto_assign"
    }
  }
}
```

---

## Environment Variables Required

Add these to your `.env.local` file and Vercel environment variables:

```bash
# ===========================
# ANTHROPIC (All 3 Features)
# ===========================
ANTHROPIC_API_KEY=sk-ant-...

# ===========================
# DATABASE (All 3 Features)
# ===========================
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/db?sslmode=require

# ===========================
# FIREBASE (Features 1 & 2)
# ===========================
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc...
```

---

## Database Schema Overview

### Feature 1 Models
```prisma
model GiaSessionPlan {
  id               String    @id @default(uuid())
  trainerId        String
  clientName       String
  clientAge        Int?
  clientLevel      String
  sport            String
  sessionDuration  Int       @default(45)
  warmup           Json
  drills           Json
  cooldown         Json
  notes            String?
  progressions     String?
  videoPlaylist    Json?
  instagramContent Json?
  messageToClient  String?
  pdfUrl           String?
  pdfGeneratedAt   DateTime?
  aiModel          String    @default("claude-3-5-sonnet")
  promptTokens     Int?
  completionTokens Int?
  generationTime   Int?
  status           String    @default("generated")
  downloadCount    Int       @default(0)
  shareCount       Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([trainerId])
  @@index([sport])
  @@index([status])
  @@map("gia_session_plans")
}
```

### Feature 2 Models
```prisma
model CrmDocument {
  id               String    @id @default(uuid())
  trainerId        String
  originalFileName String
  storagePath      String
  downloadUrl      String?
  fileType         String
  fileSize         Int
  status           String    @default("pending")
  processedAt      DateTime?
  aiModel          String?
  processingTime   Int?
  errorMessage     String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  extractedProfiles ExtractedClientProfile[]
  extractedGoals    ExtractedGoal[]
  extractedProgress ExtractedProgress[]

  @@index([trainerId])
  @@index([status])
  @@map("crm_documents")
}

model ExtractedClientProfile {
  id                           String    @id @default(uuid())
  crmDocumentId                String
  trainerId                    String
  clientName                   String
  clientAge                    Int?
  clientEmail                  String?
  clientPhone                  String?
  emergencyContactName         String?
  emergencyContactPhone        String?
  emergencyContactRelationship String?
  medicalHistory               String[]
  injuries                     String[]
  medications                  String[]
  allergies                    String[]
  confidence                   Float
  createdAt                    DateTime  @default(now())
  updatedAt                    DateTime  @updatedAt

  crmDocument          CrmDocument          @relation(fields: [crmDocumentId], references: [id])
  goals                ExtractedGoal[]
  progress             ExtractedProgress[]
  recommendedSessions  RecommendedSession[]

  @@index([trainerId])
  @@index([clientEmail])
  @@map("extracted_client_profiles")
}

model ExtractedGoal {
  id                        String    @id @default(uuid())
  crmDocumentId             String
  extractedClientProfileId  String?
  trainerId                 String
  goalDescription           String
  goalCategory              String
  targetDate                DateTime?
  priority                  String
  currentMetric             String?
  targetMetric              String?
  unit                      String?
  status                    String    @default("active")
  confidence                Float
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  crmDocument CrmDocument             @relation(fields: [crmDocumentId], references: [id])
  profile     ExtractedClientProfile? @relation(fields: [extractedClientProfileId], references: [id])

  @@index([trainerId])
  @@index([status])
  @@map("extracted_goals")
}

model ExtractedProgress {
  id                        String    @id @default(uuid())
  crmDocumentId             String
  extractedClientProfileId  String?
  trainerId                 String
  progressDate              DateTime
  progressType              String
  description               String
  metrics                   Json?
  notes                     String?
  confidence                Float
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  crmDocument CrmDocument             @relation(fields: [crmDocumentId], references: [id])
  profile     ExtractedClientProfile? @relation(fields: [extractedClientProfileId], references: [id])

  @@index([trainerId])
  @@index([progressDate])
  @@map("extracted_progress")
}

model RecommendedSession {
  id                        String    @id @default(uuid())
  extractedClientProfileId  String
  extractedGoalId           String?
  trainerId                 String
  recommendationText        String
  suggestedDuration         Int
  suggestedExercises        String[]
  suggestedIntensity        String?
  reasoning                 String?
  aiModel                   String
  confidence                Float
  status                    String    @default("suggested")
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  profile ExtractedClientProfile @relation(fields: [extractedClientProfileId], references: [id])

  @@index([trainerId])
  @@index([status])
  @@map("recommended_sessions")
}

model AutoReminder {
  id                        String    @id @default(uuid())
  extractedClientProfileId  String
  trainerId                 String
  reminderType              String
  reminderText              String
  scheduledFor              DateTime
  sentAt                    DateTime?
  status                    String    @default("pending")
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  @@index([trainerId])
  @@index([scheduledFor])
  @@index([status])
  @@map("auto_reminders")
}

model FollowUpMessage {
  id                        String    @id @default(uuid())
  extractedClientProfileId  String
  trainerId                 String
  messageText               String
  messageType               String
  sentAt                    DateTime?
  status                    String    @default("draft")
  aiGenerated               Boolean   @default(true)
  aiModel                   String?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  @@index([trainerId])
  @@index([status])
  @@map("follow_up_messages")
}
```

### Feature 3 Models
```prisma
model ClientLead {
  id                      String    @id @default(uuid())
  name                    String
  email                   String
  phone                   String?
  city                    String?
  state                   String?
  zipCode                 String?
  country                 String?
  fitnessGoals            String[]
  experienceLevel         String?
  preferredSport          String?
  availableDays           String[]
  availableTimes          String[]
  sessionsPerWeek         Int?
  preferredGender         String?
  preferredLanguages      String[]
  preferredCertifications String[]
  minYearsExperience      Int?
  budgetMin               Float?
  budgetMax               Float?
  budgetCurrency          String?
  additionalNotes         String?
  howDidYouHear           String?
  source                  String?
  referredBy              String?
  status                  String    @default("new")
  aiProcessed             Boolean   @default(false)
  aiProcessedAt           DateTime?
  aiModel                 String?
  aiSummary               String?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  matches LeadMatch[]

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("client_leads")
}

model LeadMatch {
  id                  String    @id @default(uuid())
  clientLeadId        String
  trainerId           String
  overallScore        Float
  specializationScore Float
  locationScore       Float
  availabilityScore   Float
  budgetScore         Float
  experienceScore     Float
  preferencesScore    Float
  matchReasons        String[]
  potentialConcerns   String[]
  confidence          Float
  status              String    @default("suggested")
  sentAt              DateTime?
  respondedAt         DateTime?
  trainerResponse     String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  lead ClientLead @relation(fields: [clientLeadId], references: [id])

  @@index([clientLeadId])
  @@index([trainerId])
  @@index([status])
  @@index([overallScore])
  @@map("lead_matches")
}
```

---

## Deployment Checklist

### 1. Environment Variables
- [ ] Set `ANTHROPIC_API_KEY` in Vercel
- [ ] Set `DATABASE_URL` and `DIRECT_URL` in Vercel
- [ ] Set Firebase variables (`NEXT_PUBLIC_FIREBASE_*`) in Vercel

### 2. Database
- [ ] Run `npx prisma db push` to create tables
- [ ] Verify all models are created in database
- [ ] (Optional) Seed with test data

### 3. Firebase
- [ ] Enable Firebase Storage
- [ ] Set up storage security rules
- [ ] Create `crm-documents` and `gia-session-plans` folders

### 4. Vercel Settings
- [ ] Set Install Command: `npm install --legacy-peer-deps`
- [ ] Set Build Command: `npm run build`
- [ ] Enable automatic deployments from `main` branch

### 5. Testing
- [ ] Test Feature 1: Generate session plan
- [ ] Test Feature 2: Upload document
- [ ] Test Feature 3: Submit lead

---

## Testing Guide

### Feature 1: Session Plan Generator

```bash
curl -X POST https://your-app.vercel.app/api/gia/generate-session-plan \
  -H "Content-Type: application/json" \
  -d '{
    "trainerId": "test-trainer-id",
    "clientName": "Test Client",
    "clientLevel": "intermediate",
    "sport": "tennis"
  }'
```

### Feature 2: Document Parser

```bash
curl -X POST https://your-app.vercel.app/api/gia/process-documents \
  -F "trainerId=test-trainer-id" \
  -F "clientName=Test Client" \
  -F "files=@/path/to/intake-form.pdf"
```

### Feature 3: Lead Matching

```bash
curl -X POST https://your-app.vercel.app/api/gia/match-leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "location": { "city": "Los Angeles", "state": "CA" },
    "fitnessGoals": ["weight_loss"],
    "experienceLevel": "beginner"
  }'
```

---

## Cost Estimates (Anthropic API)

### Feature 1: Session Plan Generator
- ~4,000 tokens per request
- Cost: ~$0.012 per session plan
- 100 plans/day = ~$1.20/day

### Feature 2: Document Parser
- ~2,000-6,000 tokens per document (depends on document size)
- Cost: ~$0.006-$0.018 per document
- 50 documents/day = ~$0.30-$0.90/day

### Feature 3: Lead Matching
- ~500 tokens per lead (for match reasons)
- ~5 AI calls per lead (1 summary + up to 5 match reasons)
- Cost: ~$0.015 per lead
- 20 leads/day = ~$0.30/day

**Total estimated cost: ~$2-3/day for moderate usage**

---

## Next Steps

### Immediate (Production Ready)
1. Deploy to Vercel
2. Run database migrations
3. Set environment variables
4. Test all three features
5. Monitor logs and errors

### Short Term (Frontend Integration)
1. Build frontend UI for Feature 2 (Document Upload)
2. Build frontend UI for Feature 3 (Lead Matching Dashboard)
3. Add authentication/authorization
4. Implement trainer profiles (for Feature 3)
5. Add email notifications

### Long Term (Enhancements)
1. PDF generation optimization (Feature 1)
2. Batch document processing (Feature 2)
3. Real-time notifications (Feature 3)
4. Analytics dashboards
5. A/B testing for matching algorithms
6. ML model training on conversion data

---

## Support & Documentation

- **Feature 1:** See `docs/GIA_SESSION_PLAN_GENERATOR.md`
- **Feature 2:** See `docs/AUTO_CRM_DOCUMENT_PARSER.md`
- **Feature 3:** See `docs/CLIENT_LEAD_MATCHING.md`

For questions or issues, contact the development team.

---

## Version History

- **v1.0.0** (2025-11-16): Initial release
  - Feature 1: AI Session Plan Generator ✅
  - Feature 2: Auto CRM Document Parser ✅
  - Feature 3: Client Lead Matching System ✅

---

**Built with ❤️ for GoodRunss Trainer Dashboard**




