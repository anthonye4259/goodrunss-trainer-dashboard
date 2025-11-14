# 🎨 v0 Instructions - Public Booking Page

## What to Build: Client-Facing Booking Page

**URL Pattern:** `/book/[trainerId]`

Users who click a trainer's booking link should be able to:
1. See trainer profile
2. Select session type
3. Pick available time
4. Pay with Stripe
5. Get confirmation

---

## Copy This to v0.dev:

```
Build a modern, mobile-first booking page for sports trainers.

STRUCTURE:

1. HEADER - Trainer Profile
   - Large circular profile photo (80px)
   - Trainer name (bold, 24px)
   - Bio/tagline (16px, gray)
   - Specialties as colored badges (Basketball, Yoga, etc.)
   - Rating stars + total sessions completed

2. SESSION TYPE SELECTOR
   - Title: "Choose Your Session"
   - Large cards for each session type:
     * Session name (bold)
     * Duration + Price (60 min • $75)
     * Short description
     * Included features as checkmarks
   - Selected card has blue border
   - Hover effect with shadow

3. DATE & TIME PICKER
   - Title: "Pick Your Time"
   - Week view with dates as tabs
   - Available time slots as pill buttons
   - Disabled/unavailable slots are grayed out
   - Shows timezone

4. CLIENT INFO FORM
   - Name (required)
   - Email (required)
   - Phone (optional)
   - Notes (optional textarea)

5. PAYMENT
   - Large "Continue to Payment" button
   - Shows total price
   - "Secured by Stripe" badge
   - Trust indicators

SIDEBAR (Desktop only, collapses on mobile):
   - Sticky booking summary card
   - Shows selected session
   - Date & time
   - Price
   - "What's included" list

COLORS:
   - Primary: #3B82F6 (blue)
   - Success: #10B981 (green)
   - Background: #F9FAFB
   - Text: #111827

MOBILE:
   - Stack everything vertically
   - Fixed bottom CTA button
   - Easy touch targets (44px+)
   - Summary collapses into expandable sheet

Use shadcn/ui components (Card, Button, Badge, Input, etc.)
Make it feel premium and trustworthy!
```

---

## API Endpoints (Already Built)

Your v0 page will call these:

### 1. Get Trainer Info
```typescript
GET /api/book/[slug]/info
Response: {
  trainer: { name, bio, image, specialties, rating },
  sessionTypes: [{ id, name, duration, price, description }],
  settings: { minNoticeHours, advanceBookingDays }
}
```

### 2. Get Available Time Slots
```typescript
GET /api/book/[slug]/slots?sessionTypeId=xxx&startDate=2025-11-15&endDate=2025-11-22
Response: {
  slots: [{ startTime: "2025-11-15T09:00:00Z", endTime: "2025-11-15T10:00:00Z", available: true }]
}
```

### 3. Create Booking
```typescript
POST /api/book/[slug]/book
Body: {
  clientName: "John Doe",
  clientEmail: "john@example.com",
  clientPhone: "+1234567890",
  sessionTypeId: "1on1",
  startTime: "2025-11-15T09:00:00Z",
  notes: "First session"
}
Response: {
  booking: { id, checkoutUrl } // Redirect to checkoutUrl for payment
}
```

---

## Example Flow

```typescript
// 1. Page loads - fetch trainer info
const { trainer, sessionTypes } = await fetch(`/api/book/${slug}/info`).then(r => r.json())

// 2. User selects session type - fetch available slots
const { slots } = await fetch(`/api/book/${slug}/slots?sessionTypeId=1on1`).then(r => r.json())

// 3. User picks time + enters info - create booking
const { booking } = await fetch(`/api/book/${slug}/book`, {
  method: 'POST',
  body: JSON.stringify({ clientName, clientEmail, sessionTypeId, startTime })
}).then(r => r.json())

// 4. Redirect to Stripe
window.location.href = booking.checkoutUrl
```

---

## Success Page

After payment, Stripe redirects to: `/book/[slug]/success?session_id=xxx`

Show:
- ✅ Booking confirmed!
- Check your email
- Session details
- "Book Another" button

---

## Mobile Requirements

- **Touch targets:** 44px minimum
- **Calendar:** Horizontal scroll for dates
- **Time slots:** Large buttons, 2-3 per row
- **Form:** Large inputs with good spacing
- **CTA:** Fixed bottom button on mobile
- **Loading states:** Show spinner during API calls

---

## Design Inspiration

Reference these for UI patterns:
- **Calendly** - Time slot picker
- **OpenTable** - Date selector
- **Stripe Checkout** - Trust badges
- **Airbnb** - Booking summary card

---

## Key Components Needed

From shadcn/ui:
- Card
- Button
- Input
- Textarea
- Badge
- Select
- Dialog (for mobile summary)
- Avatar
- Skeleton (loading states)

Icons from Lucide:
- Calendar
- Clock
- User
- Mail
- Phone
- CheckCircle
- Shield (for security badge)

---

## Copy to v0 Prompt:

"Create a mobile-responsive booking page at `/book/[slug]/page.tsx`. 

User flow: View trainer → Pick session type → Select time slot → Enter details → Pay.

Include:
1. Trainer profile header with photo, name, bio, specialties
2. Session type selector (cards with pricing)
3. Week view calendar with available time slots
4. Client info form (name, email, phone, notes)
5. Sticky booking summary sidebar (desktop) / bottom sheet (mobile)
6. Large CTA button 'Continue to Payment'

Fetch data from:
- /api/book/[slug]/info
- /api/book/[slug]/slots?sessionTypeId=xxx
- POST to /api/book/[slug]/book

After POST, redirect to booking.checkoutUrl for Stripe payment.

Use shadcn/ui components, make it premium and trustworthy!"

---

## That's It!

Backend is done. Just need v0 to build the pretty UI that calls these APIs.




