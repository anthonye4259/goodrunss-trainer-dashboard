# 📱 Frontend Spec - AI Automation Features

## 🎯 What We Built (Backend)

Two AI-powered automation systems that save trainers 12-17 hours/week:

### 1. **AI Workout Plan Generator** 💪
Trainer inputs client info → AI generates complete personalized workout plan in 30 seconds

### 2. **Smart Auto-Rescheduling** 📅
System detects scheduling conflicts → AI suggests alternatives → Auto-reschedules with client approval

---

## 🔌 API Endpoints (Backend Complete)

### Feature 1: AI Workout Plan Generator

#### **POST `/api/workouts/generate`**
Generate a complete workout plan for a client

**Request:**
```typescript
{
  clientId: string;           // Required
  clientName: string;         // Required
  goal: string;               // "weight_loss" | "muscle_gain" | "endurance" | "flexibility" | "sport_specific"
  fitnessLevel: string;       // "beginner" | "intermediate" | "advanced"
  duration: number;           // Weeks (4-12 recommended)
  sessionsPerWeek: number;    // 2-5 sessions
  availableTime: number;      // Minutes per session (30-90)
  equipment?: string[];       // ["dumbbells", "barbell", "bodyweight", etc.]
  injuries?: string[];        // ["lower_back", "knee", etc.]
  preferences?: {             // Optional preferences
    favoriteExercises?: string[];
    avoidExercises?: string[];
  };
}
```

**Response:**
```typescript
{
  success: true,
  plan: {
    id: "plan_123",
    name: "8-Week Muscle Gain Program",
    description: "Progressive strength training...",
    duration: 8,
    totalSessions: 32,
    goal: "muscle_gain",
    status: "draft",          // Can be: draft, active, completed
    workouts: [
      {
        id: "workout_1",
        week: 1,
        dayOfWeek: 1,          // 0=Sunday, 1=Monday, etc.
        name: "Upper Body Push",
        type: "strength",
        estimatedDuration: 45,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 8,
            rest: "90s",
            notes: "Control the descent",
            muscleGroups: ["chest", "triceps", "shoulders"]
          },
          // ... more exercises
        ],
        warmup: [
          { exercise: "Arm circles", duration: "2 min" }
        ],
        cooldown: [
          { exercise: "Chest stretch", duration: "1 min" }
        ]
      },
      // ... more workouts (32 total for 8 weeks)
    ]
  },
  metadata: {
    progressionNotes: "Increase weight by 5% each week...",
    nutritionTips: "Aim for 1g protein per lb bodyweight...",
    recoveryAdvice: "Get 7-8 hours sleep..."
  },
  message: "Generated 8-week plan with 32 sessions"
}
```

#### **GET `/api/workouts/generate?clientId=xxx`**
Get all workout plans for a client

**Response:**
```typescript
{
  plans: [
    {
      id: "plan_123",
      name: "8-Week Muscle Gain",
      status: "active",
      currentWeek: 3,
      completionRate: 0.72,
      adherenceScore: 0.85,
      workouts: [...],  // First 5 sessions
      _count: {
        workouts: 32,
        progressUpdates: 5
      }
    }
  ]
}
```

#### **POST `/api/workouts/adjust`**
AI auto-adjusts plan based on client feedback

**Request:**
```typescript
{
  planId: string;
  trigger: "client_feedback" | "missed_sessions" | "progress_data" | "injury";
  reason: string;
  clientFeedback?: {
    difficultyRating: number;  // 1-5 (1=too easy, 5=too hard)
    notes: string;
  };
  progressData?: {
    weight?: number;
    bodyFat?: number;
    // ... other metrics
  };
}
```

**Response:**
```typescript
{
  success: true,
  adjustment: {
    adjustmentType: "difficulty" | "volume" | "frequency" | "exercise_swap",
    summary: "Reduced volume by 20% based on feedback",
    madeBy: "ai",
    before: { /* snapshot */ },
    after: { /* changes */ }
  },
  recommendations: "Continue monitoring recovery...",
  message: "Plan adjusted: Reduced intensity"
}
```

---

### Feature 2: Smart Auto-Rescheduling

#### **POST `/api/scheduling/conflicts/detect`**
Detect scheduling conflicts for a trainer

**Request:**
```typescript
{
  trainerId: string;
  startDate?: string;  // ISO date, defaults to today
  endDate?: string;    // ISO date, defaults to +30 days
  sessionId?: string;  // Optional: check specific session
}
```

**Response:**
```typescript
{
  success: true,
  conflictsDetected: 3,
  conflicts: [
    {
      id: "conflict_1",
      sessionId: "session_123",
      trainerId: "trainer_456",
      clientId: "client_789",
      originalTime: "2024-11-10T14:00:00Z",
      conflictType: "double_booking" | "overlapping" | "trainer_unavailable" | "calendar_sync",
      severity: "low" | "medium" | "high" | "critical",
      conflictReason: "Double booked with session_124",
      status: "pending" | "resolving" | "resolved" | "failed",
      detectedAt: "2024-11-07T10:00:00Z"
    }
  ],
  sessionsScanned: 45
}
```

#### **GET `/api/scheduling/conflicts/detect?trainerId=xxx&status=pending`**
Get existing conflicts

**Response:**
```typescript
{
  conflicts: [ /* same as above */ ]
}
```

#### **POST `/api/scheduling/conflicts/resolve`**
AI auto-resolves conflict with smart suggestions

**Request:**
```typescript
{
  conflictId: string;
}
```

**Response (Auto-Resolved):**
```typescript
{
  success: true,
  autoResolved: true,
  newTime: "2024-11-10T15:30:00Z",
  message: "Conflict auto-resolved with high confidence"
}
```

**Response (Manual Approval Needed):**
```typescript
{
  success: true,
  autoResolved: false,
  suggestions: [
    {
      datetime: "2024-11-10T15:30:00Z",
      confidence: 0.95,
      reasoning: "Same day of week, afternoon slot, no conflicts",
      pros: ["Same day of week", "Within preferred hours"],
      cons: ["30 minutes later than original"]
    },
    // ... 2 more suggestions
  ],
  recommendation: "Best option is 3:30 PM same day - high client acceptance probability",
  message: "Suggestions generated - awaiting trainer approval"
}
```

---

## 🎨 Frontend Components Needed

### Page 1: Workout Plan Generator (`/dashboard/workouts/generate`)

**UI Components:**

1. **Client Selection Dropdown**
   - Fetch clients from existing API
   - Show: Name, Avatar, Current plan status

2. **Plan Configuration Form**
   ```tsx
   - Goal Selection (Pills/Chips)
     • Weight Loss
     • Muscle Gain
     • Endurance
     • Flexibility
     • Sport Specific
   
   - Fitness Level (Radio buttons)
     • Beginner
     • Intermediate
     • Advanced
   
   - Duration Slider (4-12 weeks)
   - Sessions Per Week Selector (2-5)
   - Minutes Per Session Slider (30-90)
   
   - Equipment Checklist
     [ ] Dumbbells
     [ ] Barbell
     [ ] Resistance Bands
     [ ] Bodyweight Only
     [ ] Full Gym Access
   
   - Injuries/Limitations (Multi-select)
   
   - Preferences (Optional)
     • Favorite Exercises
     • Exercises to Avoid
   ```

3. **Generate Button**
   - Shows loading state (20-30 seconds)
   - Progress indicator: "AI is analyzing..." → "Creating workout plan..." → "Done!"

4. **Plan Preview Modal**
   - Shows generated plan
   - Expandable weeks/workouts
   - Exercise details on hover
   - Actions: "Approve & Activate" | "Edit" | "Regenerate"

5. **Active Plans List**
   - Card grid of all active plans
   - Shows: Client name, Plan name, Progress bar, Current week
   - Quick actions: View, Adjust, Archive

---

### Page 2: Conflict Manager (`/dashboard/scheduling/conflicts`)

**UI Components:**

1. **Auto-Scan Button**
   - "Scan Next 30 Days"
   - Shows: Last scan time, Conflicts found

2. **Conflicts Table**
   ```tsx
   Columns:
   - Date/Time
   - Client Name
   - Conflict Type (Badge with color)
   - Severity (Icon + color)
   - Status
   - Actions
   ```

3. **Conflict Detail Modal**
   - Shows original session details
   - Conflict explanation
   - AI suggestions (if resolved)
   - Timeline of resolution attempts

4. **Resolution Suggestions Card**
   ```tsx
   For each suggestion:
   - New date/time (large, prominent)
   - Confidence score (progress bar)
   - Pros/Cons list
   - "Accept" | "Decline" buttons
   ```

5. **Auto-Resolution Settings**
   - Toggle: "Auto-resolve high-confidence conflicts"
   - Confidence threshold slider
   - Notification preferences

---

### Page 3: Client Workout Dashboard (`/dashboard/clients/[id]/workouts`)

**UI Components:**

1. **Current Plan Card**
   - Plan name
   - Progress: Week 3 of 8
   - Completion rate: 72%
   - Adherence score: 85%

2. **This Week's Workouts**
   - Calendar view
   - Each day shows workout name
   - Completed checkmark
   - Click to see details

3. **Client Feedback Section**
   - "How was your last workout?"
   - Difficulty rating (1-5 stars)
   - Notes textarea
   - "Submit Feedback" → Triggers auto-adjustment

4. **Progress Tracking**
   - Weight graph
   - Body measurements
   - Progress photos
   - Performance metrics (PRs, endurance)

5. **Auto-Adjustment History**
   - Timeline of AI adjustments
   - Shows: Date, Reason, What changed
   - Client feedback that triggered it

---

### Component 4: Settings Page (`/dashboard/settings/automation`)

**UI Components:**

1. **Rescheduling Rules**
   ```tsx
   - Toggle: Auto-reschedule conflicts
   - Toggle: Require my approval first
   - Max attempts: 3
   - Max days to search ahead: 14
   
   - Preferred Days (Checkboxes)
     [ ] Monday
     [ ] Tuesday
     ...
   
   - Preferred Time Blocks
     + Add Time Block
     - Morning: 9:00 AM - 12:00 PM
     - Afternoon: 2:00 PM - 6:00 PM
   
   - Buffer between sessions: 30 minutes
   ```

2. **Availability Windows**
   ```tsx
   - Weekly calendar grid
   - Click to add/edit availability
   - Color-coded by capacity
   - "Max sessions per block" setting
   ```

3. **Plan Adjustment Settings**
   ```tsx
   - Toggle: Auto-adjust workout plans
   - Adjustment triggers (Checkboxes)
     [ ] Low adherence (<60%)
     [ ] Low completion (<70%)
     [ ] Client feedback (difficulty rating)
     [ ] Missed sessions (3+ in a row)
   ```

---

## 📊 Dashboard Widgets to Add

### Widget 1: Automation Stats Card
```tsx
<Card>
  <Title>AI Automation Impact</Title>
  <Stat label="Time Saved This Week" value="8.5 hours" />
  <Stat label="Plans Generated" value="12" />
  <Stat label="Conflicts Auto-Resolved" value="5" />
  <Stat label="Plans Auto-Adjusted" value="3" />
</Card>
```

### Widget 2: Recent Activity Feed
```tsx
<ActivityFeed>
  - "AI generated plan for John Doe" (2 min ago)
  - "Auto-resolved conflict for Jane Smith" (15 min ago)
  - "Adjusted difficulty for Mike's plan" (1 hour ago)
</ActivityFeed>
```

### Widget 3: Pending Actions
```tsx
<AlertCard>
  - 2 conflicts need manual approval
  - 1 plan waiting for your review
  - 3 clients need progress updates
</AlertCard>
```

---

## 🎬 User Flows

### Flow 1: Generate Workout Plan

```
1. Trainer clicks "Generate Workout Plan"
2. Selects client from dropdown
3. Fills out form (goal, level, duration, etc.)
4. Clicks "Generate" button
5. Loading modal shows (20-30 sec)
   - "AI is analyzing client profile..."
   - "Creating personalized exercises..."
   - "Building 8-week progression..."
6. Plan preview appears
7. Trainer reviews workouts (can expand weeks)
8. Clicks "Approve & Activate"
9. Plan becomes active
10. Client gets notification with first week
```

### Flow 2: Auto-Resolve Conflict

```
Background (every 6 hours):
1. Cron job runs conflict detection
2. Finds double booking for tomorrow
3. AI generates 3 alternative time slots
4. If confidence >85% → Auto-reschedules
5. Sends notification to trainer & client

Trainer Dashboard:
1. Sees notification: "Conflict auto-resolved"
2. Clicks to view details
3. Sees: Old time → New time
4. Sees AI reasoning & confidence score
5. Can approve or request different time
```

### Flow 3: Client Feedback → Auto-Adjustment

```
Client Side (mobile app):
1. Completes workout
2. App asks: "How was it?" (1-5 difficulty)
3. Rates it 5 (too hard)
4. Adds note: "Couldn't finish last 2 sets"

Backend (automatic):
5. POST /api/workouts/adjust triggered
6. AI analyzes feedback + progress data
7. Reduces volume by 15%
8. Swaps 2 advanced exercises for easier ones

Trainer Dashboard:
9. Sees notification: "Plan adjusted for John"
10. Reviews changes
11. Sees before/after comparison
12. Approves or reverts
```

---

## 🎨 Design Tokens for v0

### Colors
```css
--conflict-critical: #EF4444  /* Red */
--conflict-high: #F59E0B      /* Orange */
--conflict-medium: #EAB308    /* Yellow */
--conflict-low: #10B981       /* Green */

--ai-accent: #8B5CF6          /* Purple - AI features */
--success: #10B981            /* Green */
--warning: #F59E0B            /* Orange */
```

### Status Badges
```tsx
- Draft: Gray
- Active: Green
- Completed: Blue
- Pending: Yellow
- Resolved: Green
- Failed: Red
```

---

## 📝 Copy/Messaging

### Empty States
```
No workout plans yet
"Generate your first AI-powered workout plan in 30 seconds"
[Generate Plan Button]

No conflicts detected
"Your schedule is conflict-free! ✨"
Last scanned: 2 minutes ago
```

### Success Messages
```
✓ Workout plan generated successfully!
✓ Conflict resolved automatically
✓ Plan adjusted based on client feedback
✓ Settings saved
```

### Loading States
```
Generating workout plan...
AI is creating personalized exercises for John Doe
This takes 20-30 seconds

Resolving conflict...
AI is analyzing available time slots
Finding the best match for your client
```

---

## 🔔 Notifications Needed

### Toast Notifications
- "Plan generated! Click to review"
- "Conflict auto-resolved"
- "2 new conflicts detected"
- "Plan adjusted automatically"

### Email Notifications (to trainer)
- "Your workout plan is ready"
- "Scheduling conflict needs attention"
- "Client feedback received - plan adjusted"

### Email Notifications (to client)
- "Your new workout plan is ready!"
- "Your session has been rescheduled"
- "Week 2 workouts are now available"

---

## 🧪 Test Data for v0

```typescript
// Mock workout plan
const mockPlan = {
  id: "plan_123",
  name: "8-Week Muscle Gain Program",
  clientName: "John Doe",
  goal: "muscle_gain",
  status: "active",
  currentWeek: 3,
  duration: 8,
  completionRate: 0.72,
  adherenceScore: 0.85,
  totalSessions: 32,
  completedSessions: 23
};

// Mock conflict
const mockConflict = {
  id: "conflict_1",
  clientName: "Jane Smith",
  sessionType: "Personal Training",
  originalTime: "2024-11-10T14:00:00Z",
  conflictType: "double_booking",
  severity: "critical",
  status: "pending",
  suggestions: [
    {
      datetime: "2024-11-10T15:30:00Z",
      confidence: 0.95,
      reasoning: "Same day, afternoon slot"
    }
  ]
};
```

---

## 🚀 Implementation Priority

### Phase 1 (MVP):
1. ✅ Workout Plan Generator Form
2. ✅ Plan Preview & Approval
3. ✅ Active Plans List
4. ✅ Basic conflict detection display

### Phase 2:
5. Auto-adjustment UI
6. Conflict resolution interface
7. Settings page
8. Client feedback flow

### Phase 3:
9. Advanced analytics
10. Progress tracking
11. Dashboard widgets
12. Mobile optimization

---

## 📞 Questions for v0?

Need me to clarify:
- Specific component layouts?
- State management approach?
- Form validation rules?
- API error handling?
- Loading states?

I can generate exact v0 prompts for each component! 🎨

