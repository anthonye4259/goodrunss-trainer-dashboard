# Client Lead Matching System API

This feature provides AI-powered matching of incoming client leads with the best-fit trainers based on multiple factors including specialization, location, availability, budget, and personal preferences. The system uses Claude 3.5 Sonnet to intelligently score and match leads with trainers.

## Feature Overview

- **Intelligent Matching:** AI analyzes multiple factors to find the best trainer-client matches
- **Multi-Factor Scoring:** Specialization, location, availability, budget, experience, preferences
- **Weighted Algorithm:** Customizable weights for different matching criteria
- **AI Explanations:** Human-readable reasons for why each match was suggested
- **Top 5 Matches:** Returns the best 5 trainers for each lead, ranked by match score
- **Trainer Response System:** Trainers can accept/decline lead matches
- **Lead Management:** Track lead status through the entire conversion funnel

## API Endpoints

### 1. Submit New Lead & Get Matches

`POST /api/gia/match-leads`

#### Request Body

```json
{
  "name": "Sarah Thompson",
  "email": "sarah@example.com",
  "phone": "+1-555-0123",
  "location": {
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  },
  "fitnessGoals": ["weight_loss", "strength_training"],
  "experienceLevel": "intermediate",
  "preferredSport": "tennis",
  "availability": {
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "timeOfDay": ["morning", "afternoon"],
    "sessionsPerWeek": 3
  },
  "trainerPreferences": {
    "gender": "female",
    "language": ["English", "Spanish"],
    "certifications": ["NASM-CPT"],
    "minYearsExperience": 5
  },
  "budgetRange": {
    "min": 60,
    "max": 100,
    "currency": "USD"
  },
  "additionalNotes": "Looking for a trainer who specializes in post-injury recovery",
  "howDidYouHear": "Google search",
  "source": "website",
  "referredBy": null
}
```

#### Required Fields

- `name` (string)
- `email` (string)

All other fields are optional but improve matching accuracy.

#### Response (Success - Status 200)

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "lead_123",
      "name": "Sarah Thompson",
      "email": "sarah@example.com",
      "status": "new",
      "aiProcessed": true,
      "aiSummary": "Strong match found with 3 trainers specializing in weight loss and tennis. Top recommendation: Sarah Johnson (92% match).",
      "createdAt": "2025-11-16T12:00:00Z",
      ...
    },
    "matchResult": {
      "leadId": "lead_123",
      "topMatches": [
        {
          "trainerId": "trainer-1",
          "trainerName": "Sarah Johnson",
          "overallScore": 92.5,
          "confidence": 0.925,
          "scores": {
            "specialization": 95.0,
            "location": 100.0,
            "availability": 100.0,
            "budget": 87.5,
            "experience": 100.0,
            "preferences": 100.0
          },
          "matchReasons": [
            "Sarah Johnson specializes in weight loss and strength training, matching 100% of your goals",
            "Perfect location match - both in Los Angeles, CA",
            "Available on all your preferred days (Monday, Wednesday, Friday)",
            "Session rate ($80) is within your budget range ($60-$100)",
            "Speaks both English and Spanish as requested"
          ],
          "potentialConcerns": [],
          "trainer": {
            "id": "trainer-1",
            "name": "Sarah Johnson",
            "email": "sarah@example.com",
            "location": {
              "city": "Los Angeles",
              "state": "CA",
              "country": "USA"
            },
            "specializations": ["weight_loss", "strength_training", "cardio"],
            "sports": ["running", "cycling"],
            "yearsOfExperience": 8,
            "pricing": {
              "sessionRate": 80,
              "currency": "USD"
            },
            ...
          }
        },
        {
          "trainerId": "trainer-2",
          "trainerName": "Mike Chen",
          "overallScore": 78.3,
          ...
        },
        ...
      ],
      "aiSummary": "Found 5 excellent matches. Sarah Johnson is the top recommendation with a 92% match score.",
      "suggestedAction": "auto_assign",
      "processingTime": 3456
    }
  },
  "processingTime": 3456
}
```

#### Matching Scores Explained

**Overall Score (0-100):**
Weighted combination of all factors:
- Specialization: 30%
- Location: 25%
- Availability: 20%
- Budget: 15%
- Experience: 5%
- Preferences: 5%

**Individual Scores (0-100):**
- **Specialization:** How well trainer's specializations match client's goals
- **Location:** Proximity between client and trainer
- **Availability:** Overlap in available days/times
- **Budget:** How well trainer's rates fit client's budget
- **Experience:** Does trainer meet minimum experience requirements
- **Preferences:** Match on gender, language, certifications

#### Suggested Actions

- `auto_assign` - Top match is excellent (score ≥ 85%), can auto-assign
- `manual_review` - Good matches but require human review (score 50-84%)
- `needs_more_info` - Weak matches (score < 50%), need more client/trainer info

---

### 2. Get Leads & Matches

`GET /api/gia/match-leads`

#### Query Parameters

- `leadId` (string, optional): Get specific lead and its matches
- `trainerId` (string, optional): Get all matches for a specific trainer
- `status` (string, optional): Filter matches by status (with trainerId)

#### Examples

```typescript
// Get specific lead and its matches
const response = await fetch('/api/gia/match-leads?leadId=lead_123')

// Get all matches for a trainer
const response = await fetch('/api/gia/match-leads?trainerId=trainer-1')

// Get all accepted matches for a trainer
const response = await fetch('/api/gia/match-leads?trainerId=trainer-1&status=accepted')

// Get all recent leads
const response = await fetch('/api/gia/match-leads')
```

#### Response (Success - Status 200)

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "match_456",
        "clientLeadId": "lead_123",
        "trainerId": "trainer-1",
        "overallScore": 92.5,
        "matchReasons": ["..."],
        "status": "suggested",
        "createdAt": "2025-11-16T12:00:00Z",
        "lead": {
          "id": "lead_123",
          "name": "Sarah Thompson",
          ...
        },
        "trainer": {
          "id": "trainer-1",
          "name": "Sarah Johnson",
          ...
        }
      },
      ...
    ],
    "total": 15
  }
}
```

---

### 3. Trainer Responds to Lead

`PUT /api/gia/match-leads`

#### Request Body

```json
{
  "leadMatchId": "match_456",
  "trainerId": "trainer-1",
  "action": "accept",
  "message": "Hi Sarah! I'd love to work with you on your fitness goals. Let's schedule a call."
}
```

#### Required Fields

- `leadMatchId` (string)
- `trainerId` (string)
- `action` (`"accept"` | `"decline"`)
- `message` (string, optional)

#### Response (Success - Status 200)

```json
{
  "success": true,
  "data": {
    "match": {
      "id": "match_456",
      "status": "accepted",
      "respondedAt": "2025-11-16T12:05:00Z",
      "trainerResponse": "Hi Sarah! I'd love to work with you...",
      ...
    }
  }
}
```

---

## Database Schema

See `prisma/schema.prisma` for full schema:

### `ClientLead` Model

Stores incoming client leads with all their preferences and requirements.

**Key Fields:**
- Basic info: name, email, phone
- Location: city, state, zipCode, country
- Fitness: fitnessGoals, experienceLevel, preferredSport
- Availability: availableDays, availableTimes, sessionsPerWeek
- Preferences: preferredGender, preferredLanguages, preferredCertifications
- Budget: budgetMin, budgetMax, budgetCurrency
- Tracking: source, howDidYouHear, referredBy
- AI: aiProcessed, aiSummary, aiModel
- Status: new → matched → contacted → converted/lost

### `LeadMatch` Model

Stores AI-generated matches between leads and trainers with detailed scoring.

**Key Fields:**
- IDs: clientLeadId, trainerId
- Scores: overallScore, specializationScore, locationScore, availabilityScore, budgetScore, experienceScore, preferencesScore
- AI Analysis: matchReasons, potentialConcerns, confidence
- Status: suggested → sent_to_trainer → accepted/declined/expired
- Response: sentAt, respondedAt, trainerResponse

---

## Environment Variables Required

```bash
# Anthropic (for AI matching logic)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## Matching Algorithm Details

### 1. Specialization Score (Weight: 30%)

- Compares client's `fitnessGoals` with trainer's `specializations`
- Compares client's `preferredSport` with trainer's `sports`
- Perfect match = 100, No match = 0-50

### 2. Location Score (Weight: 25%)

- Exact city + state match = 100
- Same state = 70
- Different state = 30
- Future: integrate real distance calculation (geocoding)

### 3. Availability Score (Weight: 20%)

- Calculates overlap in available days of week
- Calculates overlap in time of day preferences
- Perfect overlap = 100, No overlap = 0

### 4. Budget Score (Weight: 15%)

- Trainer rate within budget range = 100
- Slightly below min (≥80% of min) = 80
- Slightly above max (≤120% of max) = 70
- Way off = 20-30

### 5. Experience Score (Weight: 5%)

- Meets/exceeds minimum years = 100+
- Falls short = proportional penalty

### 6. Preferences Score (Weight: 5%)

- Gender match (if specified)
- Language overlap
- Certification match

### AI Enhancements

Claude 3.5 Sonnet generates:
- **Match Reasons:** Human-readable explanations for why a trainer is a good fit
- **Potential Concerns:** Any issues to be aware of (e.g., "Budget might be slightly high")
- **Overall Summary:** High-level analysis of all matches
- **Suggested Action:** Recommendation on how to proceed

---

## Usage Examples

### Example 1: Submit Lead from Website Form

```typescript
async function submitLead(formData: any) {
  const response = await fetch('/api/gia/match-leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: {
        city: formData.city,
        state: formData.state,
      },
      fitnessGoals: formData.goals, // ["weight_loss", "strength_training"]
      experienceLevel: formData.level, // "beginner"
      budgetRange: {
        max: formData.maxBudget,
        currency: 'USD',
      },
    }),
  })

  const result = await response.json()

  if (result.success) {
    console.log('Top match:', result.data.matchResult.topMatches[0])
    // Show top matches to client or auto-assign
  }
}
```

### Example 2: Trainer Views Their Matches

```typescript
async function getMyMatches(trainerId: string) {
  const response = await fetch(`/api/gia/match-leads?trainerId=${trainerId}`)
  const result = await response.json()

  if (result.success) {
    result.data.matches.forEach(match => {
      console.log(`${match.lead.name} - ${match.overallScore}% match`)
      console.log('Reasons:', match.matchReasons)
    })
  }
}
```

### Example 3: Trainer Accepts a Lead

```typescript
async function acceptLead(matchId: string, trainerId: string) {
  const response = await fetch('/api/gia/match-leads', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      leadMatchId: matchId,
      trainerId: trainerId,
      action: 'accept',
      message: 'Hi! I would love to help you reach your goals. When can we chat?',
    }),
  })

  const result = await response.json()
  if (result.success) {
    console.log('Lead accepted!')
  }
}
```

---

## Lead Status Flow

```
new
  ↓
matched (when trainer accepts)
  ↓
contacted (when trainer reaches out)
  ↓
converted (client signs up)
  OR
lost (client doesn't respond/chooses another trainer)
```

## Match Status Flow

```
suggested (AI creates match)
  ↓
sent_to_trainer (match notification sent)
  ↓
accepted (trainer accepts) / declined (trainer declines) / expired (no response after X days)
```

---

## Performance

- **Average processing time:** 3-8 seconds per lead
- **Concurrent matching:** Supports multiple leads simultaneously
- **AI calls:** 1 per lead + 1 per top candidate (top 5 max)
- **Scalability:** Can match against hundreds of trainers

---

## Future Enhancements

- [ ] Real-time notifications to trainers when matched with a lead
- [ ] Automated lead nurturing sequences
- [ ] Integration with calendaring (auto-schedule intro calls)
- [ ] ML model to improve matching over time based on conversion rates
- [ ] Geocoding for accurate distance-based location scoring
- [ ] Trainer capacity management (don't match with full trainers)
- [ ] Lead scoring (qualify leads before matching)
- [ ] A/B testing different matching algorithms

---

## Testing

### Mock Trainers

The API currently includes 3 mock trainers for testing. In production:
1. Replace `fetchAvailableTrainers()` with actual database query
2. Fetch from your `users` or `trainers` table
3. Filter by `isActive`, `acceptingClients`, etc.

### Test Lead

```json
{
  "name": "Test Client",
  "email": "test@example.com",
  "location": {
    "city": "Los Angeles",
    "state": "CA"
  },
  "fitnessGoals": ["weight_loss"],
  "experienceLevel": "beginner",
  "budgetRange": {
    "max": 80,
    "currency": "USD"
  }
}
```

Expected result: Should match well with Sarah Johnson (80/session, weight loss specialist).

---

## Troubleshooting

**Issue:** All match scores are low (<50%)

**Solution:** Check if trainer data is populated correctly. Ensure trainers have:
- Specializations that match common client goals
- Availability data
- Pricing information

**Issue:** AI reasons not generating

**Solution:** Check `ANTHROPIC_API_KEY` environment variable. The system will fall back to generic reasons if AI fails.

**Issue:** No trainers returned

**Solution:** Implement `fetchAvailableTrainers()` to pull from your actual trainers database.


