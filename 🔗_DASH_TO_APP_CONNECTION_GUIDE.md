# 🔗 DASHBOARD ↔ APP CONNECTION GUIDE

**Question:** Will trainer accounts from the dashboard carry over to the app?

**Answer:** YES - if you set it up correctly. Here's how:

---

## 🏗️ CURRENT ARCHITECTURE

### Dashboard (Launching Tonight):
- **Auth:** Clerk (trainer sign up)
- **Database:** PostgreSQL + Prisma
- **User Model:** Has `role: "TRAINER"`
- **Primary Use:** Trainers manage their business

### Consumer App (Launching in 1 Week):
- **Auth:** Clerk (client sign up)
- **Database:** Same PostgreSQL + Prisma
- **User Model:** Same User table
- **Primary Use:** Clients book sessions, view workouts

---

## ✅ RECOMMENDED SETUP: SINGLE CLERK INSTANCE

**This is the simplest and best approach.**

### How It Works:

```typescript
// Both apps use SAME Clerk publishable key
// Dashboard .env:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

// App .env:
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  // SAME KEY!
```

### User Journey:

#### Scenario 1: Trainer Signs Up in Dashboard First
```
1. Trainer goes to dashboard.goodrunss.com
2. Signs up with email: alex@example.com
3. Clerk creates account
4. Dashboard creates user in Postgres:
   {
     id: "user_123",
     email: "alex@example.com",
     name: "Alex Coach",
     role: "TRAINER",
     specialties: ["basketball"]
   }

--- 1 WEEK LATER ---

5. Trainer downloads mobile app
6. Signs in with alex@example.com
7. Clerk recognizes: "This email already has an account!"
8. App queries Postgres: "SELECT * FROM users WHERE email = 'alex@example.com'"
9. App sees: role = "TRAINER"
10. App shows TRAINER VIEW (not client view)
11. Trainer can:
    - View their clients
    - Manage sessions
    - Send notifications
    - Everything from mobile
```

#### Scenario 2: Client Signs Up in App First
```
1. Client downloads app
2. Signs up with email: sarah@example.com
3. Clerk creates account
4. App creates user in Postgres:
   {
     id: "user_456",
     email: "sarah@example.com",
     name: "Sarah Smith",
     role: "CLIENT",
     specialties: []
   }

5. Client books sessions, uses app normally
6. Client NEVER sees dashboard (no access)
```

#### Scenario 3: Someone Uses Both
```
User: alex@example.com
Role: TRAINER

Dashboard (Desktop):
- Full trainer features
- Calendar management
- Client tracking
- GIA AI assistant
- Analytics

Mobile App:
- Same user, same data
- Mobile-optimized trainer view
- Notifications
- Quick session management
- On-the-go features
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Verify Clerk Configuration

**In Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Select your project
3. Copy the **Publishable Key**
4. Use THIS SAME KEY in both apps

**Dashboard .env:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
```

**App .env:**
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here  # SAME KEY!
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here              # SAME KEY!
```

---

### Step 2: Update User Creation Logic

**Dashboard - When Trainer Signs Up:**

```typescript
// /api/user/onboarding/route.ts (ALREADY EXISTS)
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: userEmail,
      name: fullName,
      role: "TRAINER",  // ✅ Mark as trainer
      specialties: [specialty]
    }
  })
}
```

**App - When Client Signs Up:**

```typescript
// app/api/signup/route.ts (CREATE THIS)
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: userEmail,
      name: fullName,
      role: "CLIENT",  // ✅ Mark as client
      specialties: []
    }
  })
}
```

---

### Step 3: Create Role-Based Routing

**In Mobile App:**

```typescript
// app/(auth)/index.tsx
import { useUser } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { router } from 'expo-router'

export default function AuthIndex() {
  const { user, isLoaded } = useUser()
  
  useEffect(() => {
    async function checkUserRole() {
      if (!isLoaded || !user) return
      
      // Fetch user from database
      const response = await fetch(`${API_URL}/api/user/profile`)
      const data = await response.json()
      
      if (data.user.role === 'TRAINER') {
        // Redirect to trainer view
        router.replace('/(trainer)/dashboard')
      } else {
        // Redirect to client view
        router.replace('/(client)/home')
      }
    }
    
    checkUserRole()
  }, [isLoaded, user])
  
  return <LoadingScreen />
}
```

---

### Step 4: Create Trainer View in App

**App Folder Structure:**
```
app/
├── (auth)/
│   └── sign-in.tsx
├── (client)/        // Client screens
│   ├── home.tsx
│   ├── book.tsx
│   └── profile.tsx
└── (trainer)/       // Trainer screens (NEW!)
    ├── dashboard.tsx
    ├── clients.tsx
    ├── calendar.tsx
    └── notifications.tsx
```

**Trainer Dashboard (Mobile):**
```typescript
// app/(trainer)/dashboard.tsx
export default function TrainerDashboard() {
  const [clients, setClients] = useState([])
  const [sessions, setSessions] = useState([])
  
  return (
    <View>
      <Text>Trainer Dashboard</Text>
      
      {/* Quick Stats */}
      <View>
        <StatCard label="Clients" value={clients.length} />
        <StatCard label="Today's Sessions" value={sessions.length} />
      </View>
      
      {/* Upcoming Sessions */}
      <SessionList sessions={sessions} />
      
      {/* Quick Actions */}
      <Button onPress={() => router.push('/clients')}>
        View All Clients
      </Button>
    </View>
  )
}
```

---

## 🗄️ DATABASE SCHEMA (ALREADY PERFECT)

**Your Prisma schema already supports this!**

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  role           UserRole  @default(CLIENT)  // ✅ TRAINER or CLIENT
  
  // Trainer-specific (null for clients)
  bio            String?
  specialties    String[]
  certifications String[]
  hourlyRate     Float?
  
  // Relations work for both
  trainerSessions   TrainerSession[] @relation("TrainerSessions")
  clientBookings    TrainerSession[] @relation("ClientBookings")
  
  @@map("users")
}

enum UserRole {
  TRAINER
  CLIENT
  ADMIN
}
```

**Key Points:**
1. ✅ Single `users` table for both trainers and clients
2. ✅ `role` field determines access
3. ✅ Trainer-specific fields (bio, specialties) are optional
4. ✅ Relations support both roles
5. ✅ Already implemented, no migration needed!

---

## 📱 DATA FLOW EXAMPLES

### Example 1: Trainer Books Session (from Dashboard)

```typescript
// Dashboard (Next.js)
const createSession = async () => {
  await fetch('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      trainerId: currentUser.id,      // From Clerk auth
      clientId: selectedClient.id,
      scheduledAt: selectedTime,
      type: 'ONE_ON_ONE'
    })
  })
}

// Saved to PostgreSQL
// Push notification sent to client's phone via FCM
// Client sees it in mobile app immediately
```

### Example 2: Client Books Session (from App)

```typescript
// App (React Native)
const bookSession = async () => {
  await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    body: JSON.stringify({
      trainerId: selectedTrainer.id,
      clientId: currentUser.id,        // From Clerk auth
      scheduledAt: selectedTime,
      type: 'ONE_ON_ONE'
    })
  })
}

// Saved to PostgreSQL
// Push notification sent to trainer's phone
// Trainer sees it in dashboard immediately
```

### Example 3: Trainer Sends Message (from App)

```typescript
// App (React Native) - Trainer logged in
const sendMessage = async () => {
  await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    body: JSON.stringify({
      senderId: currentUser.id,        // Trainer ID
      receiverId: selectedClient.id,
      message: "Great job today!"
    })
  })
}

// Saved to PostgreSQL
// Client gets push notification
// Client sees message in app
```

---

## 🔐 SECURITY & PERMISSIONS

### API Endpoint Protection:

```typescript
// /api/sessions/route.ts
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  // Check role
  if (user.role !== 'TRAINER') {
    return NextResponse.json(
      { error: "Only trainers can create sessions" },
      { status: 403 }
    )
  }
  
  // Proceed with session creation
}
```

### Mobile App Protection:

```typescript
// app/(trainer)/dashboard.tsx
import { useUser } from '@clerk/clerk-expo'

export default function TrainerDashboard() {
  const { user } = useUser()
  const [userRole, setUserRole] = useState(null)
  
  useEffect(() => {
    async function checkRole() {
      const response = await fetch(`${API_URL}/api/user/profile`)
      const data = await response.json()
      setUserRole(data.user.role)
    }
    checkRole()
  }, [])
  
  if (userRole !== 'TRAINER') {
    return <Text>Access Denied: Trainer account required</Text>
  }
  
  return <TrainerDashboardContent />
}
```

---

## ✅ TESTING CHECKLIST

### Test 1: Trainer Account Persistence

```
1. Create trainer account in dashboard:
   - Email: test-trainer@example.com
   - Specialty: Basketball
   
2. Verify in database:
   SELECT * FROM users WHERE email = 'test-trainer@example.com'
   → Should see role = 'TRAINER', specialties = ['basketball']
   
3. Open mobile app
4. Sign in with test-trainer@example.com
5. App should:
   ✓ Recognize existing account
   ✓ Load user data from database
   ✓ Show trainer dashboard (not client view)
   ✓ Display same specialty
```

### Test 2: Client Account Isolation

```
1. Create client account in app:
   - Email: test-client@example.com
   
2. Verify in database:
   SELECT * FROM users WHERE email = 'test-client@example.com'
   → Should see role = 'CLIENT'
   
3. Try to access dashboard at dashboard.goodrunss.com
4. Dashboard should:
   ✗ Block access (not a trainer)
   OR
   ✓ Show different view (client-only features)
```

### Test 3: Cross-Platform Data Sync

```
1. Trainer creates client in dashboard
2. Client should appear in mobile app trainer view
3. Trainer schedules session in app
4. Session should appear in dashboard calendar
5. Trainer changes specialty in dashboard
6. Specialty should update in app profile
```

---

## 🚀 LAUNCH STRATEGY

### Week 1 (THIS WEEK): Dashboard Only
```
- Trainers sign up in dashboard
- Trainers use desktop/web version
- All data saved to PostgreSQL
- Trainer accounts ready to go
```

### Week 2: App Launch
```
- App goes live
- Trainers download app
- Sign in with SAME EMAIL
- Clerk recognizes account
- Data syncs automatically
- Trainers can use both!
```

### Trainer Experience:
```
Desktop (Work):
- Dashboard at goodrunss.com
- Full features
- Large screen real estate
- Calendar management
- Analytics

Mobile (On-the-Go):
- App on phone
- Quick actions
- Notifications
- Session check-ins
- Client messages

SAME ACCOUNT, SAME DATA! ✅
```

---

## 💡 KEY INSIGHTS

### ✅ What Works Automatically:

1. **Authentication** - Same Clerk account works in both
2. **Database** - Shared PostgreSQL, all data accessible
3. **Push Notifications** - FCM works across platforms
4. **User Profile** - Same user record, syncs instantly
5. **Sessions** - Created in either place, visible in both

### ⚠️ What Needs Configuration:

1. **Clerk Keys** - Must use SAME publishable key
2. **Role-Based Routing** - App needs to check user.role
3. **API Endpoints** - Must be accessible from mobile
4. **Permission Checks** - Verify role in sensitive endpoints

### 🔧 What Needs Building (For App):

1. **Trainer Dashboard (Mobile)** - Simplified version of web dash
2. **Role Detection** - Check if user is trainer vs client
3. **Conditional Routing** - Show trainer view or client view
4. **Trainer-Specific Features** - Mobile-optimized trainer tools

---

## 📊 FINAL ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│                    CLERK AUTH                        │
│  Single Clerk Instance - Same Publishable Key       │
│  Handles auth for both dashboard and app            │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                     │
│  users table with role field (TRAINER/CLIENT)       │
│  All data stored here, accessible by both apps      │
└─────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                     ↓
┌──────────────────┐              ┌──────────────────┐
│   DASHBOARD      │              │   MOBILE APP     │
│   (Next.js)      │              │  (React Native)  │
│                  │              │                  │
│ Trainers create  │              │ Checks role:     │
│ accounts here    │              │ - TRAINER view   │
│                  │              │ - CLIENT view    │
│ Role: TRAINER    │              │                  │
└──────────────────┘              └──────────────────┘

SAME USER → SAME DATA → DIFFERENT INTERFACES ✅
```

---

## ✅ SUMMARY

**Question:** Will trainer accounts carry over?  
**Answer:** YES! 100%

**How:**
1. Use same Clerk publishable key in both apps
2. Same PostgreSQL database
3. role field determines access
4. Trainer signs in with same email in both
5. Data syncs automatically

**What You Need to Do:**
1. ✅ Dashboard already configured (launching tonight)
2. ⏳ App: Add role detection (when building app)
3. ⏳ App: Create trainer view (when building app)
4. ⏳ App: Use same Clerk key (when building app)

**Timeline:**
- Tonight: Dashboard launches, trainers sign up
- Next Week: App launches, trainers sign in with same email
- Result: Seamless experience across platforms

**Status:** ARCHITECTURE READY ✅

---

**Created:** November 11, 2025  
**Status:** Dash-to-App connection explained and architected  
**Ready:** YES - Both systems designed to work together




