# 🎨 V0 Prompts - AI Automation Features

Copy these prompts into v0.dev to generate the frontend components.

---

## 🏋️ PROMPT 1: Workout Plan Generator Page

```
Create a modern workout plan generator page for a fitness trainer dashboard. 

LAYOUT:
- Full page with sidebar navigation (use shadcn/ui)
- Header: "Generate AI Workout Plan" with subtitle "Create personalized plans in 30 seconds"
- Two-column layout: Form on left (60%), Preview on right (40%)

LEFT COLUMN - GENERATION FORM:

1. Client Selection (required)
   - Searchable dropdown with avatar + name
   - Placeholder: "Select a client..."
   - Shows 5 recent clients by default

2. Fitness Goal (required)
   - Pills/chips layout in a grid
   - Options: "Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Sport Specific"
   - Single select, colorful hover states
   - Use icons: 🔥 Weight Loss, 💪 Muscle Gain, 🏃 Endurance, 🧘 Flexibility, ⚽ Sport

3. Fitness Level (required)
   - Radio button group horizontal
   - Options: "Beginner", "Intermediate", "Advanced"
   - Visual indicators (1 star, 2 stars, 3 stars)

4. Plan Duration
   - Slider from 4 to 12 weeks
   - Shows number value dynamically
   - Label: "X weeks" below slider

5. Sessions Per Week
   - Number buttons 2, 3, 4, 5 (selectable pills)
   - Default: 3 selected

6. Time Per Session
   - Slider from 30 to 90 minutes
   - Shows "X minutes" dynamically
   - Step: 15 minutes

7. Available Equipment (optional)
   - Multi-select checkboxes in 2 columns
   - Options: Dumbbells, Barbell, Resistance Bands, Bodyweight, Kettlebells, Pull-up Bar, Full Gym
   - "Select All" / "None" quick actions

8. Injuries/Limitations (optional)
   - Multi-select dropdown
   - Options: Lower Back, Knee, Shoulder, Wrist, Ankle, Hip, None
   - Can type to add custom

9. Generate Button
   - Large primary button at bottom
   - Text: "Generate Workout Plan"
   - Icon: sparkles ✨
   - Disabled if required fields missing

RIGHT COLUMN - PREVIEW/INFO:

- Empty state: Shows benefits card
  • "AI analyzes client profile"
  • "Creates personalized exercises"
  • "Progressive difficulty"
  • "Typically takes 20-30 seconds"

- After generation: Shows mini preview (we'll add this in next prompt)

DESIGN SYSTEM:
- Use shadcn/ui components (Card, Button, Select, Slider, Checkbox, Label)
- Color scheme: Purple accent for AI features (#8B5CF6)
- Clean, modern, lots of white space
- Smooth animations on interactions
- Mobile responsive

STATE MANAGEMENT:
- Form validation (show errors for required fields)
- Loading state for Generate button
- Success/error toast notifications

Make it beautiful, modern, and easy to use. Use Tailwind CSS.
```

---

## 🔄 PROMPT 2: Workout Plan Generation Modal & Preview

```
Create a workout plan generation modal that appears after clicking "Generate Workout Plan".

MODAL STRUCTURE:

PHASE 1 - LOADING (20-30 seconds):
- Full-screen modal with blur backdrop
- Center content with animation
- Show progress steps:
  1. "Analyzing client profile..." (3 sec) ✓
  2. "Selecting exercises..." (5 sec) ✓
  3. "Building weekly progression..." (8 sec) ✓
  4. "Finalizing workout plan..." (5 sec) ✓
- Each step shows checkmark when complete
- Pulsing animation on active step
- Loading spinner at bottom
- "This takes 20-30 seconds" caption

PHASE 2 - PREVIEW (after generation):
- Transform into full preview modal
- Header: "✨ AI Generated Workout Plan"
- Plan title: "8-Week Muscle Gain Program"
- Meta info bar: Duration | Sessions | Equipment

PREVIEW CONTENT (Scrollable):

1. Overview Card
   - Goal badge (colored)
   - Description paragraph
   - Quick stats: Total sessions, Estimated completion, Difficulty

2. Week-by-Week Accordion
   - Expandable weeks (Week 1, Week 2, etc.)
   - Each week shows:
     • Week focus/theme
     • Number of workouts that week
     • Expand to see individual workouts

3. Workout Cards (inside weeks)
   - Day badge (Monday, Wednesday, Friday)
   - Workout name ("Upper Body Push")
   - Duration estimate
   - Exercise count ("8 exercises")
   - Click to expand full details

4. Exercise Details (when expanded)
   - Exercise name
   - Sets x Reps (e.g., "4 × 8")
   - Rest time
   - Notes/form tips
   - Muscle groups (small badges)

5. Additional Info Tabs
   - Progression Notes (how to progress)
   - Nutrition Tips
   - Recovery Advice

FOOTER ACTIONS:
- Secondary: "Regenerate Plan" (ghost button)
- Secondary: "Edit Manually" (outline button)
- Primary: "Approve & Activate" (large, prominent)

After "Approve":
- Success animation (confetti 🎉)
- Toast: "Plan activated for [Client Name]!"
- Close modal → Navigate to plan details page

DESIGN:
- Use shadcn/ui Dialog, Accordion, Badge, Tabs
- Smooth expand/collapse animations
- Green checkmarks for completed steps
- Purple accent for AI elements
- Professional, clean, trustworthy look
```

---

## 📅 PROMPT 3: Session Reschedule Modal (Trainer-Initiated)

```
Create a session reschedule modal for trainers to manually reschedule client sessions.

TRIGGER: 
- "Reschedule" button on any session card
- Opens modal

MODAL LAYOUT:

HEADER:
- Title: "Reschedule Session"
- Subtitle: Current session details
  • Client name with avatar
  • Current date/time (large, prominent)
  • Session type badge
- Close button (X)

TWO TABS:

TAB 1 - "AI Suggest Times" (default):

1. Reason Input (optional)
   - Textarea: "Why are you rescheduling? (optional)"
   - Placeholder: "e.g., Personal appointment, schedule consolidation"

2. "Get Suggestions" Button
   - Primary button
   - Icon: sparkles ✨
   - Text: "Find Best Times"

3. Loading State (5 seconds)
   - "AI is analyzing your schedule..."
   - Spinner animation

4. Suggestions List (after loading)
   - 5 suggestion cards in vertical list
   - Each card shows:
     
     LEFT SIDE:
     • New date/time (large, bold)
     • Days difference badge (+1 day, +2 days)
     • Time difference (+1 hour, same time)
     
     CENTER:
     • Confidence bar (0-100%, color-coded)
       - 90-100%: Green
       - 75-89%: Blue
       - 60-74%: Yellow
     • AI reasoning text (1-2 sentences)
     
     RIGHT SIDE:
     • Pros list (green checks)
       ✓ Same day of week
       ✓ Morning slot
       ✓ No conflicts
     • Cons list (orange warnings)
       ⚠ One day later
     
     ACTIONS:
     • "Accept This Time" button (primary)
     • Hover shows preview

5. After Accept:
   - Confirmation dialog: "Confirm reschedule to [new time]?"
   - "Yes, Reschedule" / "Cancel"
   - Success toast
   - Modal closes

TAB 2 - "Pick Time Manually":

1. Date Picker
   - Calendar component (next 30 days enabled)
   - Highlights trainer's available days
   - Shows red dots on fully booked days

2. Time Picker
   - Time slots grid (30-min intervals)
   - Shows availability:
     • Green: Available
     • Yellow: Near another session
     • Red: Conflict (disabled)
     • Gray: Outside availability window

3. Conflict Warning (if conflict detected)
   - Alert box (yellow/orange)
   - "⚠️ Conflict detected at this time"
   - Shows conflicting session details
   - "Try these nearby times:" + 3 suggestions

4. Reason Input
   - Same as Tab 1

5. "Confirm Reschedule" Button
   - Large primary button
   - Disabled if conflict

FOOTER:
- "Notify client via email/SMS" checkbox (checked by default)
- Cancel button
- Confirm button (only shows after selection)

DESIGN:
- Use shadcn/ui Dialog, Tabs, Calendar, Alert
- Smooth transitions between tabs
- Color-coded confidence/availability
- Professional, trustworthy
- Mobile responsive
```

---

## 🚨 PROMPT 4: Conflicts Dashboard Page

```
Create a scheduling conflicts dashboard for trainers to manage and resolve conflicts.

PAGE LAYOUT:

HEADER:
- Title: "Schedule Conflicts"
- Subtitle: "AI-powered conflict detection and resolution"
- Right side: 
  • "Scan Schedule" button (with refresh icon)
  • Last scan time: "2 minutes ago"

STATS CARDS ROW (4 cards):
1. Total Conflicts
   - Number (large)
   - Icon: warning triangle
   - Color: Orange

2. Auto-Resolved
   - Number (large)
   - Percentage of total
   - Icon: check circle
   - Color: Green

3. Pending Review
   - Number (large)
   - Icon: clock
   - Color: Yellow

4. Time Saved
   - Hours saved this month
   - Icon: sparkles
   - Color: Purple

FILTERS ROW:
- Status dropdown: All, Pending, Resolving, Resolved
- Severity: All, Critical, High, Medium, Low
- Date range picker
- Search by client name

CONFLICTS TABLE:

Columns:
1. Severity (icon badge)
   - 🔴 Critical
   - 🟠 High
   - 🟡 Medium
   - 🟢 Low

2. Client Name & Avatar
   - Click to view client profile

3. Session Details
   - Date/Time
   - Session type badge
   - Duration

4. Conflict Type (badge)
   - Double Booking
   - Overlapping
   - Outside Availability
   - Calendar Sync

5. Status (colored badge)
   - Pending (yellow)
   - Resolving (blue)
   - Resolved (green)
   - Failed (red)

6. Detected
   - Time ago ("2 hours ago")

7. Actions
   - "View Details" button
   - "Resolve" button (if pending)

EMPTY STATE:
- Icon: check circle with sparkles
- "No conflicts detected! ✨"
- "Your schedule is conflict-free"
- Last scanned: X minutes ago
- "Scan Again" button

ROW CLICK:
- Opens conflict detail modal (see next prompt)

DESIGN:
- Use shadcn/ui Table, Badge, Button, Card
- Color-coded severity badges
- Hover effects on rows
- Smooth animations
- Responsive table (horizontal scroll on mobile)
```

---

## 🔍 PROMPT 5: Conflict Resolution Detail Modal

```
Create a detailed conflict resolution modal that opens when clicking a conflict from the table.

MODAL STRUCTURE:

HEADER:
- Severity badge (colored)
- "Scheduling Conflict"
- Close button

SECTION 1 - CONFLICT DETAILS:

Problem Card (red/orange background):
- Icon: warning triangle
- Conflict type: "Double Booking"
- Description: "Two sessions scheduled at the same time"
- Detected: "2 hours ago by System"

Current Session Card:
- Client name + avatar
- Date/Time (large)
- Session type
- Duration
- Location (if applicable)

Conflicting Session Card (if applicable):
- Same format as above
- Shows the other session causing conflict

SECTION 2 - AI RESOLUTION STATUS:

If "Pending":
- "AI is analyzing your schedule..."
- "Generate Solutions" button

If "Resolving":
- Progress indicator
- "AI found 3 alternative time slots"

If "Resolved":
- Success banner (green)
- "✓ Automatically resolved"
- Shows accepted solution
- Resolution time

SECTION 3 - AI SUGGESTIONS:

Title: "Recommended Solutions"
Subtitle: "AI analyzed your schedule and found these options"

Suggestion Cards (vertical list, 3 cards):

Each card:
TOP ROW:
- New Date/Time (large, bold)
- Confidence score badge (with percentage)
  • 90-100%: "Excellent Match" (green)
  • 75-89%: "Good Match" (blue)
  • 60-74%: "Fair Match" (yellow)

MIDDLE SECTION:
- AI Reasoning paragraph
  "This time works because it's the same day of week, maintains your morning routine, and has no conflicts within your 30-minute buffer zone."

BOTTOM SECTION:
- Two columns:
  
  LEFT - Pros (green checks):
  ✓ Same day of week
  ✓ Within preferred hours
  ✓ No conflicts
  
  RIGHT - Cons (orange warnings):
  ⚠ 30 minutes later
  ⚠ Near end of day

- Comparison badges:
  • Time diff: "+30 min"
  • Days diff: "Same day"

ACTIONS PER CARD:
- Primary: "Accept This Time"
- Secondary: "See Calendar" (shows in context)

SECTION 4 - ALTERNATIVE ACTIONS:

If no suggestion works:
- "Pick Time Manually" button → Opens calendar picker
- "Cancel Session" button (destructive)
- "Contact Client" button → Opens messaging

FOOTER:
- "Mark as Reviewed" (if just checking)
- "Resolve Later" (snooze)
- Main action changes based on selection

AFTER ACCEPTING:
- Loading: "Rescheduling session..."
- Success: "✓ Session rescheduled!"
- Shows: Old time → New time
- "Notifying client via email & SMS"
- Auto-close after 2 seconds

DESIGN:
- Use shadcn/ui Dialog, Card, Badge, Alert
- Green for pros, orange for cons
- Color-coded confidence
- Smooth animations
- Professional, trustworthy
```

---

## 📊 PROMPT 6: Active Workout Plans Dashboard

```
Create a dashboard page showing all active workout plans for a trainer's clients.

PAGE LAYOUT:

HEADER:
- Title: "Workout Plans"
- Right side:
  • Filter dropdown: All, Active, Draft, Completed
  • "+ Generate Plan" button (primary)

VIEW TOGGLE:
- Grid view (default)
- List view
- Icons for each

GRID VIEW (3 columns on desktop, 1 on mobile):

Each Plan Card:

CARD HEADER:
- Client avatar + name
- Plan status badge:
  • Draft (gray)
  • Active (green)
  • Completed (blue)
  • Archived (gray outline)

CARD BODY:
- Plan name (large, bold)
  "8-Week Muscle Gain Program"
- Goal badge (colored chip)

Progress Section:
- Progress bar (visual, colored)
- Text: "Week 3 of 8"
- Percentage: "72% complete"

Stats Row (3 columns):
1. Sessions
   - "23/32 completed"
   - Icon: calendar
2. Adherence
   - "85%" (color: green if >70%, yellow if 50-70%, red if <50%)
   - Icon: check circle
3. Last Workout
   - "2 days ago"
   - Icon: clock

Quick Actions (icon buttons):
- View Details (eye icon)
- Adjust Plan (settings icon)
- Progress Report (chart icon)
- More menu (3 dots)

HOVER STATE:
- Card lifts up
- Shows "Quick View" overlay with:
  • This week's workouts (3-4)
  • Client feedback (if recent)
  • Next workout date

EMPTY STATE:
- Icon: workout dumbbell
- "No active workout plans"
- "Generate your first AI-powered plan in 30 seconds"
- "Generate Plan" button

FILTERS & SORTING:
- Filter by: Status, Goal, Client
- Sort by: Recently updated, Progress, Adherence, Client name

LIST VIEW (Alternative):
- Table format
- Columns: Client, Plan Name, Goal, Progress, Adherence, Status, Actions
- More detailed stats
- Bulk actions checkbox

DESIGN:
- Use shadcn/ui Card, Badge, Progress, Button
- Color-coded progress (green >70%, yellow 50-70%, red <50%)
- Smooth hover animations
- Professional, data-focused
```

---

## 🎯 PROMPT 7: Workout Plan Detail View

```
Create a detailed workout plan view page for trainers to see a client's complete plan.

PAGE LAYOUT:

HEADER SECTION:
- Back button ("← Back to Plans")
- Client info:
  • Avatar (large)
  • Name (large)
  • Contact buttons (email, message)

PLAN TITLE SECTION:
- Plan name: "8-Week Muscle Gain Program"
- Status badge
- Action menu (3 dots):
  • Edit Plan
  • Adjust Difficulty
  • Archive Plan
  • Download PDF

TABS (Main navigation):
1. Overview
2. Workouts
3. Progress
4. Adjustments

--- TAB 1: OVERVIEW ---

Stats Cards Row (4 cards):
1. Current Week
   - "Week 3 of 8"
   - Progress ring visual

2. Completion Rate
   - "72%"
   - Trend arrow (up/down)

3. Adherence Score
   - "85%"
   - Color-coded

4. Next Workout
   - "Tomorrow, 2:00 PM"
   - Countdown

Plan Details Card:
- Goal, Duration, Sessions/week, Difficulty
- Equipment list
- Injuries/limitations (if any)
- Generated date & AI model used

AI Insights Card:
- "💡 AI Recommendations"
- Current suggestions:
  • "Client progressing well, consider increasing weight"
  • "High adherence suggests ready for progression"
- "Adjust Plan" button

Recent Activity Timeline:
- "Completed: Upper Body Push"
- "Skipped: Leg Day (injury)"
- "Adjusted: Reduced volume by 15%"
- "Feedback: 'Too difficult'" (rating: 5/5)

--- TAB 2: WORKOUTS ---

Week Selector:
- Pills: Week 1, Week 2, ... Week 8
- Current week highlighted

Weekly Calendar View:
- 7 days horizontal
- Each day shows:
  • Workout card (if scheduled)
  • Rest day badge (if rest)
  
Workout Card (in calendar):
- Workout name
- Status indicator:
  • Scheduled (blue outline)
  • Completed (green check)
  • Skipped (red X)
  • Today (pulsing border)
- Click to expand

Expanded Workout Modal:
- Full workout details
- Exercises list with sets/reps
- Warmup/cooldown
- Client notes (if completed)
- Difficulty rating (if submitted)
- "Mark Complete" button (if trainer marking)

--- TAB 3: PROGRESS ---

Progress Tracking:

Measurements Chart:
- Line graph
- Weight, body fat, muscle mass over time
- Interactive (hover for values)

Performance Metrics:
- Exercise PRs (personal records)
- Cards showing top exercises:
  • "Bench Press: 185 lbs (↑ 10 lbs)"
  • "Squat: 225 lbs (↑ 15 lbs)"

Progress Photos Gallery:
- Before/after comparison slider
- Weekly photos grid
- Upload new photo button

Weekly Check-ins:
- List of weekly summaries
- Each shows:
  • Week number
  • Measurements
  • Energy, motivation, soreness ratings (1-10)
  • Notes from client
  • AI insights

--- TAB 4: ADJUSTMENTS ---

Adjustment History Timeline:
- Chronological list of AI adjustments
- Each entry:
  • Date/time
  • Trigger (client feedback, missed sessions, etc.)
  • What changed (before/after comparison)
  • AI reasoning
  • Outcome (successful/reverted)

"Manual Adjust" Button:
- Opens adjustment wizard

DESIGN:
- Use shadcn/ui Tabs, Card, Chart (recharts), Badge
- Interactive charts
- Color-coded stats
- Professional, data-rich
```

---

## ⚙️ PROMPT 8: Settings - Automation Configuration

```
Create a settings page for trainers to configure AI automation preferences.

PAGE: /settings/automation

LAYOUT:

HEADER:
- Title: "AI Automation Settings"
- Subtitle: "Configure how AI helps manage your schedule and plans"

TABS:
1. Rescheduling Rules
2. Workout Plan Defaults
3. Notifications

--- TAB 1: RESCHEDULING RULES ---

Section 1: Auto-Resolution Settings

Toggle Card:
- "Enable Auto-Reschedule"
- Description: "AI automatically resolves scheduling conflicts without your approval"
- Toggle switch (large, prominent)

Confidence Threshold (if enabled):
- Slider: 60% to 100%
- Label: "Auto-resolve only if confidence >"
- Current value displayed
- Helper: "Higher = fewer auto-resolves, but more accurate"

Approval Settings:
- Radio options:
  • "Auto-resolve immediately" (if confidence met)
  • "Send suggestions for approval"
  • "Never auto-resolve, always ask"

Section 2: Time Preferences

Preferred Days:
- Checkbox grid (7 days)
- Monday, Tuesday, ... Sunday
- "Select All" / "Weekdays Only" / "Weekends Only" quick actions

Preferred Time Blocks:
- List of time ranges
- Each block:
  • Day: Dropdown
  • Start time: Time picker
  • End time: Time picker
  • Delete button
- "+ Add Time Block" button

Buffer Settings:
- Number input: "Minutes between sessions"
- Default: 30
- Range: 0-60 with stepper buttons

Availability Search:
- "Search up to X days ahead"
- Slider: 7-30 days
- Default: 14

Section 3: Fallback Actions

Checkboxes:
- ☐ Add client to waitlist if no good time found
- ☐ Offer virtual session as alternative
- ☐ Allow reschedule outside preferred hours (emergency)

Save Button (sticky footer)

--- TAB 2: WORKOUT PLAN DEFAULTS ---

Section 1: Default Preferences

Default Duration:
- Slider: 4-12 weeks
- Default: 8

Default Sessions Per Week:
- Pills: 2, 3, 4, 5
- Default: 3 selected

Default Time Per Session:
- Slider: 30-90 minutes
- Default: 45

Auto-Adjustment Settings:
Toggle: "Enable AI Auto-Adjust"

Adjustment Triggers (if enabled):
- Checkboxes:
  • ☑ Low adherence (<60%)
  • ☑ Low completion rate (<70%)
  • ☑ Client feedback (difficulty ratings)
  • ☑ Missed sessions (3+ in a row)
  • ☐ Progress plateaus (no improvement)

Section 2: Exercise Library Preferences

Favorite Exercises:
- Multi-select with search
- Shows most used exercises
- Can add custom

Equipment Available:
- Checkbox list
- Dumbbells, Barbell, etc.
- Saves as default for new plans

Save Button

--- TAB 3: NOTIFICATIONS ---

Email Notifications:

For Trainers:
- ☑ Conflict detected
- ☑ Plan adjustment made
- ☑ Client feedback received
- ☐ Daily summary
- ☑ Weekly report

For Clients (when you reschedule):
- ☑ Session rescheduled
- ☑ New workout plan available
- ☑ Weekly workout reminder
- ☐ Workout completion congratulations

SMS Notifications:

For Trainers:
- ☑ Critical conflicts only
- ☐ All conflicts
- ☐ Client cancellations

For Clients:
- ☑ Session reminders (24hr before)
- ☑ Rescheduling confirmations
- ☐ Workout reminders

Push Notifications:
- Toggle: Enable push notifications
- Frequency: Immediate, Hourly digest, Daily digest

Save Button

DESIGN:
- Use shadcn/ui Tabs, Card, Toggle, Slider, Checkbox
- Clear section headers
- Helper text for each setting
- Save confirmation toast
- Professional, settings-focused
```

---

## 🎨 DESIGN SYSTEM FOR ALL COMPONENTS

```
Use these consistently across all components:

COLORS:
- Primary: Purple #8B5CF6 (AI features, CTAs)
- Success: Green #10B981 (completed, high confidence)
- Warning: Orange #F59E0B (medium confidence, alerts)
- Error: Red #EF4444 (conflicts, critical)
- Info: Blue #3B82F6 (pending, resolving)

SEVERITY BADGES:
- Critical: Red background, white text
- High: Orange background, white text
- Medium: Yellow background, dark text
- Low: Green background, white text

STATUS BADGES:
- Active: Green
- Pending: Yellow
- Completed: Blue
- Draft: Gray
- Failed: Red
- Resolved: Green

CONFIDENCE INDICATORS:
- 90-100%: Green with "Excellent Match"
- 75-89%: Blue with "Good Match"
- 60-74%: Yellow with "Fair Match"
- <60%: Orange with "Low Confidence"

TYPOGRAPHY:
- Headings: Inter or Geist (system font)
- Body: Same as headings
- Code/API: Mono font

SPACING:
- Consistent use of Tailwind spacing scale
- Cards: p-6
- Sections: gap-6
- Content: space-y-4

ANIMATIONS:
- All transitions: duration-200 ease-in-out
- Hover: scale-[1.02] or brightness-110
- Loading: animate-spin or animate-pulse
- Success: confetti or check animation

COMPONENTS:
Always use shadcn/ui:
- Button
- Card
- Dialog/Modal
- Badge
- Input
- Select
- Slider
- Checkbox
- Tabs
- Progress
- Alert
- Calendar
- Table

Make everything mobile-responsive with Tailwind breakpoints.
```

---

## 📋 SUMMARY: What to Build in v0

1. ✅ **Workout Plan Generator** - Form + Loading + Preview
2. ✅ **Active Plans Dashboard** - Grid of plans with stats
3. ✅ **Plan Detail View** - Full plan with tabs
4. ✅ **Reschedule Modal** - AI suggestions + Manual picker
5. ✅ **Conflicts Dashboard** - Table of conflicts
6. ✅ **Conflict Detail Modal** - Resolution interface
7. ✅ **Settings Page** - Automation configuration

Copy each prompt into v0.dev separately and combine the generated components! 🚀

