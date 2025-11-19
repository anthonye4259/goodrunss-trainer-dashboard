# Auto CRM Document Parser API

This feature allows trainers to upload client documents (intake forms, medical history, workout logs, photos) and automatically extract structured data using AI. The system uses Claude 3.5 Sonnet with Vision to parse documents and create client profiles with goals, progress tracking, and AI-generated recommendations.

## Feature Overview

- **Upload Any Document:** PDFs, images (JPEG, PNG), handwritten forms
- **Auto Extract:** Client info, medical history, goals, progress, workout logs
- **AI Analysis:** Claude Vision reads and interprets documents with confidence scoring
- **Smart Recommendations:** AI generates personalized training suggestions
- **Firebase Storage:** Secure document storage with download URLs
- **Database Integration:** Structured data stored in PostgreSQL via Prisma

## API Endpoints

### 1. Upload and Process Documents

`POST /api/gia/process-documents`

#### Request

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `trainerId` (string, required): ID of the trainer uploading documents
- `clientName` (string, optional): Name of the client (if known)
- `files` (File[], required): Array of document files

#### Example (Frontend)

```typescript
const formData = new FormData()
formData.append('trainerId', 'clx123...')
formData.append('clientName', 'Sarah Johnson') // optional
formData.append('files', file1)
formData.append('files', file2)
formData.append('files', file3)

const response = await fetch('/api/gia/process-documents', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
```

#### Response (Success - Status 200)

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_123",
        "trainerId": "clx123...",
        "originalFileName": "intake-form.pdf",
        "storagePath": "crm-documents/clx123.../1234567890-intake-form.pdf",
        "downloadUrl": "https://firebasestorage.googleapis.com/...",
        "fileType": "application/pdf",
        "fileSize": 245678,
        "uploadedAt": "2025-11-16T12:00:00Z",
        "processedAt": "2025-11-16T12:00:05Z",
        "status": "completed",
        "aiModel": "claude-3-5-sonnet",
        "processingTime": 5234
      }
    ],
    "extractedProfiles": [
      {
        "id": "profile_456",
        "crmDocumentId": "doc_123",
        "trainerId": "clx123...",
        "clientName": "Sarah Johnson",
        "clientAge": 32,
        "clientEmail": "sarah@example.com",
        "clientPhone": "+1-555-0123",
        "emergencyContactName": "Mike Johnson",
        "emergencyContactPhone": "+1-555-0124",
        "emergencyContactRelationship": "Spouse",
        "medicalHistory": ["Asthma", "Previous knee surgery (2020)"],
        "injuries": ["Left knee ACL repair"],
        "medications": ["Albuterol inhaler"],
        "allergies": ["Latex"],
        "confidence": 0.95,
        "createdAt": "2025-11-16T12:00:05Z",
        "updatedAt": "2025-11-16T12:00:05Z"
      }
    ],
    "extractedGoals": [
      {
        "id": "goal_789",
        "crmDocumentId": "doc_123",
        "extractedClientProfileId": "profile_456",
        "trainerId": "clx123...",
        "goalDescription": "Run a 5K under 30 minutes",
        "goalCategory": "endurance",
        "targetDate": "2025-12-31T00:00:00Z",
        "priority": "high",
        "currentMetric": "37 minutes",
        "targetMetric": "29 minutes",
        "unit": "minutes",
        "status": "active",
        "confidence": 0.92,
        "createdAt": "2025-11-16T12:00:05Z",
        "updatedAt": "2025-11-16T12:00:05Z"
      }
    ],
    "extractedProgress": [
      {
        "id": "progress_101",
        "crmDocumentId": "doc_123",
        "extractedClientProfileId": "profile_456",
        "trainerId": "clx123...",
        "progressDate": "2025-11-10T00:00:00Z",
        "progressType": "measurement",
        "description": "Body composition assessment",
        "metrics": {
          "weight": 165,
          "bodyFat": 22,
          "muscleMass": 128
        },
        "notes": "Baseline measurements taken",
        "confidence": 0.88,
        "createdAt": "2025-11-16T12:00:05Z",
        "updatedAt": "2025-11-16T12:00:05Z"
      }
    ],
    "recommendations": [
      {
        "id": "rec_202",
        "extractedClientProfileId": "profile_456",
        "trainerId": "clx123...",
        "recommendationText": "Start with low-impact cardio (cycling, swimming) to protect the knee while building endurance base",
        "suggestedDuration": 45,
        "aiModel": "claude-3-5-sonnet",
        "confidence": 0.9,
        "status": "suggested",
        "createdAt": "2025-11-16T12:00:05Z",
        "updatedAt": "2025-11-16T12:00:05Z"
      }
    ]
  },
  "processingTime": 5234
}
```

#### Error Responses

- **400 Bad Request:** Missing `trainerId` or no files uploaded
- **500 Internal Server Error:** AI processing failed, Firebase upload failed, or database error

---

### 2. Retrieve Extracted CRM Data

`GET /api/gia/process-documents`

#### Query Parameters

- `trainerId` (string, required): ID of the trainer
- `profileId` (string, optional): Get data for a specific client profile

#### Example

```typescript
// Get all CRM data for a trainer
const response = await fetch('/api/gia/process-documents?trainerId=clx123...')

// Get data for a specific client profile
const response = await fetch('/api/gia/process-documents?trainerId=clx123...&profileId=profile_456')
```

#### Response (Success - Status 200)

```json
{
  "success": true,
  "data": {
    "profiles": [...],
    "progress": [...],
    "goals": [...],
    "recommendations": [...]
  }
}
```

---

## Environment Variables Required

Ensure these are set in your `.env.local` file and on Vercel:

```bash
# Anthropic (for Claude Vision)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Firebase (for document storage)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## Supported Document Types

- **PDFs:** Multi-page intake forms, medical history, workout logs
- **Images:** JPEG, PNG (photos of handwritten forms, progress photos)
- **Common Use Cases:**
  - Fitness intake forms
  - Medical history forms
  - Workout tracking sheets
  - Progress photos with measurements
  - Assessment forms
  - Goal-setting worksheets

---

## AI Extraction Details

Claude 3.5 Sonnet extracts:

1. **Client Information**
   - Name, age, contact details
   - Emergency contact
   - Medical history
   - Injuries
   - Medications
   - Allergies

2. **Goals**
   - Goal descriptions
   - Categories (strength, endurance, flexibility, weight loss, etc.)
   - Target dates and metrics
   - Priority levels

3. **Progress Tracking**
   - Workout logs
   - Measurements
   - Assessments
   - Milestones

4. **AI Recommendations**
   - Personalized training suggestions
   - Considers medical history and injuries
   - Tailored to client goals
   - Confidence-scored

---

## Database Schema

See `prisma/schema.prisma` for full schema:

- `CrmDocument` - Uploaded document metadata
- `ExtractedClientProfile` - Client information
- `ExtractedGoal` - Fitness goals
- `ExtractedProgress` - Progress tracking
- `RecommendedSession` - AI-generated recommendations
- `AutoReminder` - Automated follow-ups
- `FollowUpMessage` - AI-generated messages

---

## Usage Tips

1. **Batch Upload:** Upload multiple documents at once for faster processing
2. **Clear Documents:** Higher quality scans = higher confidence scores
3. **Review Extractions:** Always review AI-extracted data for accuracy
4. **Combine Sources:** Upload intake forms + workout logs for complete profiles
5. **Regular Updates:** Upload progress documents to track client evolution

---

## Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Use a tool like Postman or create a simple upload form:
   ```tsx
   <form action="/api/gia/process-documents" method="POST" encType="multipart/form-data">
     <input type="hidden" name="trainerId" value="test-trainer-id" />
     <input type="file" name="files" multiple accept="image/*,application/pdf" />
     <button type="submit">Upload & Process</button>
   </form>
   ```

3. Check the console for detailed processing logs

---

## Performance

- **Average processing time:** 3-8 seconds per document
- **Supports batch upload:** Process multiple documents in one request
- **Confidence scoring:** AI provides confidence levels (0-1) for each extraction
- **Parallel processing:** Multiple documents processed sequentially (can be optimized for parallel in future)

---

## Future Enhancements

- [ ] Parallel document processing
- [ ] Progress tracking dashboards
- [ ] Automated reminders based on extracted goals
- [ ] Integration with session planner (Feature 1)
- [ ] OCR for low-quality scans
- [ ] Multi-language support



