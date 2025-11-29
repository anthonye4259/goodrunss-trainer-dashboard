# 🎯 Frontend Build Guide - 6 New Features

## ✅ What's Already Built (Backend Complete)

All backend infrastructure is **production-ready** with:
- ✅ Prisma schema models
- ✅ Full CRUD API routes
- ✅ TypeScript types
- ✅ Error handling
- ✅ Authentication guards

---

## 🎨 What You Need to Build (Frontend)

### 1. 📦 Package/Membership Sales
**Route:** `/dashboard/packages`

**API Endpoints:**
```typescript
GET    /api/packages        // List trainer's packages
POST   /api/packages        // Create new package
PATCH  /api/packages        // Update package
DELETE /api/packages        // Delete package
GET    /api/packages/purchases  // View client purchases
```

**UI Components Needed:**
- Package list/grid view
- Create/Edit package modal
- Package card with price, sessions, type
- Purchase history table
- Package analytics (total revenue, active memberships)

**Key Fields:**
```typescript
{
  name: string
  description: string
  price: number
  type: "SESSION_PACK" | "MEMBERSHIP" | "PROGRAM"
  sessions?: number  // for session packs
  duration?: number  // for memberships (e.g., 30 days)
  isRecurring: boolean
  status: "ACTIVE" | "ARCHIVED"
}
```

---

### 2. 📋 Waitlist Management
**Route:** `/dashboard/waitlist`

**API Endpoints:**
```typescript
GET    /api/waitlist        // List all waitlist entries
POST   /api/waitlist        // Add client to waitlist
PATCH  /api/waitlist        // Update status/position
DELETE /api/waitlist        // Remove from waitlist
POST   /api/waitlist/notify // Send notification to next in line
```

**UI Components Needed:**
- Waitlist queue with position numbers
- Client info cards (name, reason, date added)
- "Notify Next" button
- Status badges (PENDING, NOTIFIED, BOOKED, REMOVED)
- Bulk notify actions

**Key Fields:**
```typescript
{
  clientId: string
  reason?: string  // "Full class", "Trainer unavailable"
  status: "PENDING" | "NOTIFIED" | "BOOKED" | "REMOVED"
  position?: number
  notifiedAt?: Date
}
```

---

### 3. ✅ Automated Check-ins
**Route:** `/dashboard/check-ins`

**API Endpoints:**
```typescript
GET    /api/check-ins/templates    // List templates
POST   /api/check-ins/templates    // Create template
GET    /api/check-ins              // List check-in responses
POST   /api/check-ins              // Schedule check-in for client
PATCH  /api/check-ins/:id/notes    // Add trainer notes
```

**UI Components Needed:**
- Template builder (drag-drop questions)
- Question types: text, number, select, rating
- Check-in calendar/schedule view
- Response viewer with client answers
- Trainer notes section
- Analytics: completion rate, missed check-ins

**Key Fields (Template):**
```typescript
{
  name: string
  description?: string
  questions: Array<{
    type: "text" | "number" | "select" | "rating"
    label: string
    options?: string[]  // for select type
  }>
  frequency?: "daily" | "weekly" | "monthly"
  isActive: boolean
}
```

**Key Fields (Check-in):**
```typescript
{
  templateId: string
  clientId: string
  scheduledFor: Date
  submittedAt?: Date
  responses?: Array<{ questionId: string, answer: any }>
  status: "PENDING" | "SUBMITTED" | "MISSED"
  notes?: string  // trainer's notes
}
```

---

### 4. 🎥 Video Exercise Library
**Route:** `/dashboard/videos`

**API Endpoints:**
```typescript
GET    /api/videos              // List trainer's videos
POST   /api/videos              // Upload new video
PATCH  /api/videos/:id          // Update video details
DELETE /api/videos/:id          // Delete video
POST   /api/videos/:id/share    // Share with specific client
```

**UI Components Needed:**
- Video grid with thumbnails
- Upload modal (file upload + metadata)
- Video player preview
- Share modal (select clients)
- Category filter (Warm-up, Legs, Yoga Flow, etc.)
- Specialty tags (basketball, yoga, pilates)
- Public/private toggle

**Key Fields:**
```typescript
{
  title: string
  description?: string
  url: string  // S3/Cloudinary URL after upload
  thumbnailUrl?: string
  category?: string  // "Warm-up", "Legs", "Cardio"
  specialties: string[]  // ["basketball", "strength"]
  difficulty?: "beginner" | "intermediate" | "advanced"
  isPublic: boolean  // visible to all clients or only shared
}
```

**File Upload:**
- Use `@uploadthing/react` or direct S3 upload
- Generate thumbnail on upload
- Store URL in database

---

### 5. 🏋️ Group Class Management
**Route:** `/dashboard/group-classes`

**API Endpoints:**
```typescript
GET    /api/group-classes           // List classes
POST   /api/group-classes           // Create class
PATCH  /api/group-classes/:id       // Update class
DELETE /api/group-classes/:id       // Cancel class
GET    /api/group-classes/:id/attendees  // List attendees
POST   /api/group-classes/:id/book       // Book client
```

**UI Components Needed:**
- Calendar view of classes
- Create/Edit class modal
- Class card with capacity bar (5/10 spots filled)
- Attendee list
- Virtual meeting link field
- Recurring class toggle
- Status badges (SCHEDULED, CANCELLED, COMPLETED)

**Key Fields:**
```typescript
{
  name: string
  description?: string
  startTime: Date
  endTime: Date
  maxCapacity: number
  currentAttendees: number  // auto-calculated
  location?: string  // physical address
  meetingLink?: string  // Zoom/Google Meet
  price: number
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED"
  isRecurring: boolean
  recurringPattern?: "daily" | "weekly" | "monthly"
}
```

---

### 6. 🚨 Client Retention & Health
**Route:** `/dashboard/retention`

**API Endpoints:**
```typescript
GET    /api/retention/alerts     // List active alerts
GET    /api/retention/metrics    // Client health scores
PATCH  /api/retention/:id/resolve // Mark alert as resolved
POST   /api/retention/:id/action  // Log action taken
```

**UI Components Needed:**
- Alert dashboard (urgent → low priority)
- Client health score cards
- Alert type badges:
  - 🔴 No booking in 2+ weeks
  - 🟡 Low attendance rate
  - 🟠 Overdue payment
  - 🔵 Engagement drop
- Action modal (send message, offer discount, schedule call)
- Resolution tracker

**Key Fields (Alert):**
```typescript
{
  clientId: string
  alertType: "no_booking_2_weeks" | "low_attendance" | "overdue_payment" | "engagement_drop"
  message: string  // e.g., "John hasn't booked in 3 weeks"
  status: "ACTIVE" | "RESOLVED" | "DISMISSED"
  triggeredAt: Date
  resolvedAt?: Date
  actionTaken?: string  // "sent_message", "offered_discount"
}
```

**Key Fields (Health Metric):**
```typescript
{
  clientId: string
  metricType: "engagement_score" | "attendance_rate" | "last_session_days"
  value: number  // e.g., 85 (out of 100), or 7 (days since last session)
  timestamp: Date
}
```

---

## 🎨 Design System

**Use existing components:**
- `Card`, `Button`, `Input`, `Textarea` from `@/components/ui`
- `EmptyStates` from `@/components/empty-states`
- `Badge`, `Alert`, `Dialog` for modals
- `Calendar` from `react-day-picker` (already installed)

**Color Palette (from existing design):**
- Primary: Green accent (`#22c55e`)
- Background: Dark (`#0a0a0a`)
- Card: Glass effect with border
- Text: White for headers, muted for secondary

**Page Layout:**
```tsx
<div className="flex-1 p-6 md:p-8 space-y-6 ml-0 md:ml-20">
  {/* Header with title + action button */}
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">Page Title</h1>
    <Button>+ Add New</Button>
  </div>

  {/* Stats cards (optional) */}
  <div className="grid gap-4 md:grid-cols-3">
    <Card>...</Card>
  </div>

  {/* Main content */}
  <Card>
    {/* Table, grid, or list */}
  </Card>
</div>
```

---

## 📦 Database Migration

**Before testing APIs, run:**
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma db push
```

This will create all new tables:
- `packages`
- `package_purchases`
- `waitlists`
- `check_in_templates`
- `client_check_ins`
- `videos`
- `video_shares`
- `group_classes`
- `group_class_attendees`
- `client_health_metrics`
- `client_retention_alerts`

---

## 🧪 Testing APIs

Use the dashboard's built-in API tester or cURL:

```bash
# Example: Create a package
curl -X POST http://localhost:3000/api/packages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "10 Session Pack",
    "price": 500,
    "type": "SESSION_PACK",
    "sessions": 10
  }'

# Example: List packages
curl http://localhost:3000/api/packages
```

---

## 🚀 Integration with Existing Features

### GIA Integration
All new features can be accessed via GIA commands:
- "Show me my packages"
- "Add Sarah to the waitlist"
- "Schedule check-in for John"
- "Upload workout video"
- "Create a group class for Saturday"
- "Show retention alerts"

### Navigation
Add links to `src/components/sidebar.tsx`:
```tsx
{ name: "Packages", href: "/dashboard/packages", icon: Package },
{ name: "Waitlist", href: "/dashboard/waitlist", icon: Clock },
{ name: "Check-ins", href: "/dashboard/check-ins", icon: CheckCircle },
{ name: "Videos", href: "/dashboard/videos", icon: Video },
{ name: "Group Classes", href: "/dashboard/group-classes", icon: Users },
{ name: "Retention", href: "/dashboard/retention", icon: TrendingUp },
```

---

## 📚 Reference Files

- **Full API docs:** `🎉_6_NEW_FEATURES_COMPLETE.md`
- **Prisma schema:** `prisma/schema.prisma`
- **API routes:** `src/app/api/packages/`, `src/app/api/waitlist/`, etc.
- **Example page:** `src/app/dashboard/clients/page.tsx`
- **Empty states:** `src/components/empty-states.tsx`

---

## ✅ Checklist

- [ ] Run `npx prisma db push` to create tables
- [ ] Test each API endpoint with sample data
- [ ] Build 6 UI pages (packages, waitlist, check-ins, videos, group-classes, retention)
- [ ] Add navigation links to sidebar
- [ ] Integrate empty states
- [ ] Test full user flows
- [ ] Add GIA command shortcuts (optional)

---

## 🎯 Priority Order (Suggested)

1. **Packages** (highest revenue impact)
2. **Group Classes** (high revenue + engagement)
3. **Retention Alerts** (prevents churn)
4. **Video Library** (client value)
5. **Waitlist** (demand management)
6. **Check-ins** (engagement tracking)

---

**Need help?** All API routes are fully documented with TypeScript types and error handling. Just `console.log()` the responses to see the data structure.

Good luck building! 🚀













