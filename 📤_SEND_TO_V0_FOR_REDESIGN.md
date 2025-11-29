# 📤 COMPONENTS TO SEND TO V0 FOR REDESIGN

These are custom components I built that could benefit from v0's design polish.

---

## 1. ONBOARDING WIZARD (Priority #1)

**Current File:** `/src/app/onboarding/page.tsx`  
**What it does:** 4-step wizard for new trainer setup  
**What to improve:** Polish animations, better mobile UX, smoother transitions

**Prompt for v0:**
```
Create a beautiful 4-step onboarding wizard for a fitness trainer dashboard:

Step 1: Specialty Selection
- Dropdown with 22 fitness specialties (basketball, yoga, pilates, running, etc.)
- Each has an emoji icon
- Show live preview of benefits when selected
- Can't proceed without selecting

Step 2: Preferences
- Timezone selector (EST, CST, MST, PST, UTC)
- Language selector (English, Spanish, French, Portuguese, Arabic, Chinese)

Step 3: Profile
- First Name input
- Last Name input
- Optional, can skip

Step 4: Complete
- Success screen with "You're All Set! 🎉"
- Show 3 feature cards: AI Assistant, Client Management, Marketing Tools
- "Launch Dashboard" button

Features needed:
- Progress bar (0-100%)
- Step counter (Step X of 4)
- Back/Continue buttons
- Skip button at bottom
- Glass morphism cards
- Gradient backgrounds (green primary color)
- Smooth step transitions
- Mobile responsive

Design style: Modern, dark theme, glass morphism, v0 aesthetic
```

---

## 2. EMPTY STATE COMPONENTS (Priority #2)

**Current File:** `/src/components/empty-states.tsx`  
**What it does:** 10 pre-built empty states for various sections  
**What to improve:** Better illustrations, more engaging CTAs

**Prompt for v0:**
```
Create a reusable EmptyState component for a fitness trainer dashboard:

Component should accept:
- Icon (20x20)
- Title (heading)
- Description (paragraph)
- Primary action button (optional)
- Secondary action button (optional)

Pre-configured variants needed:
1. NoClientsState - "No Clients Yet" + "Add First Client" button
2. NoSessionsState - "No Sessions Scheduled" + "Schedule Session" button
3. NoWorkoutsState - "No Workouts Created" + "Create Workout" button
4. NoPaymentsState - "No Payments Yet" + "Create Invoice" button
5. NoMessagesState - "No Messages" (informational only)

Design:
- Glass card with gradient icon container
- Centered layout
- Generous spacing
- Two-button action system
- Green primary color
- Dark theme, v0 aesthetic
```

---

## 3. SPECIALTY BADGE COMPONENT (Priority #3)

**Current usage:** Dashboard, GIA page  
**What it does:** Shows trainer's specialty with emoji  
**What to improve:** Make it a reusable component with variants

**Prompt for v0:**
```
Create a SpecialtyBadge component for a fitness trainer dashboard:

Props:
- specialty: string (e.g., "basketball", "yoga", "pilates")
- variant: "default" | "large" | "compact"

Component should:
- Show emoji for specialty (🏀 for basketball, 🧘‍♀️ for yoga, etc.)
- Show formatted name ("Basketball Coach", "Yoga Instructor")
- Have rounded pill shape
- Green primary color with 10% opacity background
- Border with 20% opacity

Specialty emoji mappings:
- basketball: 🏀
- yoga: 🧘‍♀️
- pilates: 🤸‍♀️
- running: 🏃‍♀️
- cycling: 🚴‍♀️
- swimming: 🏊‍♀️
- boxing: 🥊
- tennis: 🎾
- soccer: ⚽
- golf: ⛳
(and 12 more)

Design: Dark theme, glass morphism, v0 aesthetic
```

---

## 4. GIA SPECIALTY ALERT (Priority #4)

**Current usage:** GIA page  
**What it does:** Prompts user to set specialty if not set  
**What to improve:** Better visual hierarchy, clearer CTA

**Prompt for v0:**
```
Create an alert banner for when a user hasn't set their specialty:

Content:
- Icon: Warning/Alert icon
- Title: "Set Your Specialty First"
- Description: "GIA needs to know your specialty to generate content that matches your sport. For example, basketball coaches get court drills, yoga teachers get flow sequences."
- Two buttons:
  1. Primary: "Go to Settings" (navigates to settings)
  2. Secondary: "I'll do this later" (dismisses alert)

Design:
- Gradient background (primary → accent)
- Glass morphism with backdrop blur
- Alert icon in rounded square
- Bold title
- Descriptive text
- Two action buttons side by side
- Dismissible
- Green primary color
- Dark theme, v0 aesthetic
```

---

## 5. SPECIALTY SELECTOR (Settings)

**Current usage:** Settings page, Profile tab  
**What it does:** Dropdown to select trainer's specialty  
**What to improve:** Better mobile UX, searchable dropdown

**Prompt for v0:**
```
Create a specialty selector dropdown for trainer settings:

Features:
- Label: "Your Specialties"
- Helper text: "Select your primary training focus. This helps GIA generate content specific to your sport."
- Dropdown with 22 options, each with emoji:
  - 🏀 Basketball Coach
  - 🏓 Pickleball Instructor
  - 🎾 Tennis Instructor
  - 🏐 Volleyball Coach
  - 🧘‍♀️ Yoga Instructor
  - 🤸‍♀️ Pilates Instructor
  - 💃 Barre Instructor
  - 💪 Strength & Conditioning
  - ⚡ HIIT Trainer
  - 🏋️‍♀️ CrossFit Coach
  - 🏃‍♀️ Running Coach
  - 🚴‍♀️ Cycling Coach
  - 🏊‍♀️ Swimming Coach
  - 🥋 Martial Arts Instructor
  - 🥊 Boxing Coach
  - 💃 Dance Instructor
  - ⚽ Soccer Coach
  - ⛳ Golf Instructor
  - 🥗 Nutrition Coach
  - 🌿 Wellness Coach
  - 🎯 Sports Performance
  - 💪 General Fitness Trainer

- Bottom note with sparkles icon: "✨ This affects all AI-generated content, workouts, and suggestions"

Design:
- Searchable dropdown (filter by typing)
- Max height with scroll
- Green primary color
- Dark theme, v0 aesthetic
```

---

## 6. LOADING STATE SKELETON

**Current usage:** Empty states file  
**What it does:** Shows while data is loading  
**What to improve:** Better animation, more realistic skeleton

**Prompt for v0:**
```
Create a LoadingState skeleton component for cards:

Should show:
- Animated pulsing skeleton
- Icon placeholder (20x20 circle)
- Title placeholder (3/4 width bar)
- Description placeholders (2 lines, full and 5/6 width)
- Button placeholders (2 buttons, 32px height)

Design:
- Glass card
- Smooth pulse animation
- Green shimmer effect
- Dark theme, v0 aesthetic
```

---

## 7. SPECIALTY BENEFITS CARD

**Current usage:** Onboarding Step 1 (when specialty selected)  
**What it does:** Shows what AI will do with selected specialty  
**What to improve:** Better icon system, clearer benefits

**Prompt for v0:**
```
Create a benefits preview card that shows when user selects a specialty:

Header: "✨ What this means for you:"

Benefits (3 items with checkmarks):
1. "AI-generated content matches your sport's terminology"
2. "Workout plans include sport-specific exercises and drills"
3. "Social media posts use relevant hashtags and language"

Design:
- Rounded card
- Light background (primary/5 opacity)
- Border (primary/10 opacity)
- Check icons (green, 16px)
- List items with left alignment
- Green primary color
- Dark theme, v0 aesthetic
```

---

## SUMMARY FOR V0 REDESIGN

**Priority Order:**
1. ✅ Onboarding Wizard (300 lines)
2. ✅ Empty State Components (280 lines)  
3. ✅ Specialty Badge Component (50 lines)
4. ✅ GIA Specialty Alert (80 lines)
5. ✅ Specialty Selector (100 lines)
6. ✅ Loading State Skeleton (40 lines)
7. ✅ Benefits Card (60 lines)

**Total:** ~910 lines of custom UI code

**Design System:**
- Primary Color: Green (#22c55e)
- Accent: Teal/Cyan
- Theme: Dark
- Style: Glass morphism, gradients, v0 aesthetic
- Icons: Lucide React
- Animations: Smooth, subtle

**What to tell v0:**
> "I need these components redesigned with your design system. They're functional but need that v0 polish - better animations, smoother transitions, more engaging visuals, and mobile-first responsive design. Keep the same functionality, just make them beautiful."

---

**Note:** All components already have backend integration working. v0 just needs to redesign the UI/UX, then copy the updated code back.













