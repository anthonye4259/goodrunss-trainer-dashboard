# ⚡ GUEST MODE - QUICK IMPLEMENTATION GUIDE

## **🎯 GOAL: ChatGPT-Style Instant Access**

Users open app → Get value in 30 seconds (NO signup required)

---

## **1️⃣ APP INITIALIZATION (First Launch)**

```typescript
// App.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

async function initApp() {
  const sessionToken = await AsyncStorage.getItem('sessionToken');
  const userId = await AsyncStorage.getItem('userId');

  if (!sessionToken && !userId) {
    // 🆕 First time user - create anonymous session
    const response = await fetch('YOUR_API/api/guest/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        deviceType: 'mobile',
      }),
    });
    
    const { session } = await response.json();
    await AsyncStorage.setItem('sessionToken', session.sessionToken);
    
    // Show quick onboarding (15 seconds)
    navigation.navigate('Onboarding');
  } else if (sessionToken) {
    // 🔄 Returning anonymous user
    navigation.navigate('Feed');
  } else {
    // ✅ Authenticated user
    navigation.navigate('Feed');
  }
}
```

---

## **2️⃣ QUICK ONBOARDING (15 seconds)**

```typescript
// OnboardingScreen.tsx
const QUESTIONS = [
  {
    title: "What are your fitness goals?",
    type: "multi",
    options: [
      { value: "weight_loss", label: "Lose Weight" },
      { value: "muscle_gain", label: "Build Muscle" },
      { value: "flexibility", label: "Get Flexible" },
      { value: "endurance", label: "Build Endurance" },
    ],
  },
  {
    title: "What's your experience level?",
    type: "single",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    title: "Preferred workout types?",
    type: "multi",
    options: [
      { value: "strength", label: "Strength" },
      { value: "cardio", label: "Cardio" },
      { value: "yoga", label: "Yoga" },
      { value: "hiit", label: "HIIT" },
    ],
  },
];

function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const saveAndContinue = async () => {
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    
    await fetch('YOUR_API/api/guest/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        fitnessGoals: answers.goals,
        experience: answers.experience,
        workoutTypes: answers.workouts,
        step: 'complete',
      }),
    });
    
    navigation.navigate('Feed');
  };

  return (
    <View>
      <ProgressBar current={step + 1} total={3} />
      <Question
        {...QUESTIONS[step]}
        onAnswer={(value) => setAnswers({ ...answers, [step]: value })}
        onNext={() => step === 2 ? saveAndContinue() : setStep(step + 1)}
      />
      <Button title="Skip for now" onPress={() => navigation.navigate('Feed')} />
    </View>
  );
}
```

---

## **3️⃣ FEED SCREEN (Works for Both)**

```typescript
// FeedScreen.tsx
function FeedScreen() {
  const [feed, setFeed] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [identifier, setIdentifier] = useState(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    // Get identifier (userId or sessionToken)
    const userId = await AsyncStorage.getItem('userId');
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    
    const id = userId || sessionToken;
    const paramName = userId ? 'userId' : 'sessionToken';
    
    setIdentifier(id);
    setIsAnonymous(!userId);
    
    // Get personalized feed
    const response = await fetch(
      `YOUR_API/api/feed/personalized?${paramName}=${id}&limit=20`
    );
    
    const data = await response.json();
    setFeed(data.feed);
  };

  const logInteraction = async (contentType, contentId, action) => {
    const userId = await AsyncStorage.getItem('userId');
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    
    await fetch('YOUR_API/api/feed/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionToken,
        contentType,
        contentId,
        action,
      }),
    });
  };

  return (
    <FlatList
      data={feed}
      renderItem={({ item }) => (
        <TrainerCard
          trainer={item}
          isAnonymous={isAnonymous}
          onView={() => logInteraction(item.contentType, item.contentId, 'view')}
          onLike={() => logInteraction(item.contentType, item.contentId, 'like')}
        />
      )}
      onEndReached={loadFeed}
    />
  );
}
```

---

## **4️⃣ AUTHENTICATION GATES**

```typescript
// TrainerCard.tsx or any component
function TrainerCard({ trainer, isAnonymous }) {
  const handleBooking = async () => {
    if (isAnonymous) {
      // User hits gate - need to sign up
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      
      // Log the gate
      await fetch('YOUR_API/api/guest/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          gateType: 'booking',
          gateTrigger: 'book_session',
          gateLocation: 'TrainerCard',
          contentType: 'trainer',
          contentId: trainer.id,
        }),
      });
      
      // Show signup modal
      showModal({
        title: "Sign up to book",
        message: `Create account to book with ${trainer.name}`,
        primaryButton: "Sign Up",
        onPrimary: () => navigation.navigate('Signup', {
          returnTo: 'booking',
          trainerId: trainer.id,
        }),
      });
    } else {
      // User is authenticated - proceed
      navigation.navigate('BookingFlow', { trainerId: trainer.id });
    }
  };

  return (
    <Card>
      <Image source={{ uri: trainer.image }} />
      <Text>{trainer.name}</Text>
      <Text>{trainer.specialties.join(', ')}</Text>
      <Button title="Book Session" onPress={handleBooking} />
    </Card>
  );
}
```

---

## **5️⃣ SIGNUP & CONVERSION**

```typescript
// SignupScreen.tsx
async function handleSignupSuccess(userId) {
  const sessionToken = await AsyncStorage.getItem('sessionToken');
  
  if (sessionToken) {
    // Convert anonymous session to real user
    const response = await fetch('YOUR_API/api/guest/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        userId,
        conversionTrigger: 'booking', // or whatever triggered signup
      }),
    });
    
    const data = await response.json();
    console.log(`Migrated ${data.migratedInteractions} interactions`);
    
    // Clear session token, store userId
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.setItem('userId', userId);
  }
  
  // Continue with original action
  const returnTo = navigation.getParam('returnTo');
  if (returnTo === 'booking') {
    const trainerId = navigation.getParam('trainerId');
    navigation.navigate('BookingFlow', { trainerId });
  } else {
    navigation.navigate('Feed');
  }
}
```

---

## **6️⃣ HELPER HOOK (Optional)**

```typescript
// hooks/useGuestMode.ts
export function useGuestMode() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    
    setIsAnonymous(!userId);
    setIdentifier(userId || sessionToken);
  };

  const requireAuth = async (action: string, callback: () => void) => {
    if (isAnonymous) {
      // Log gate
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      await fetch('YOUR_API/api/guest/gate', {
        method: 'POST',
        body: JSON.stringify({
          sessionToken,
          gateType: action,
          gateTrigger: action,
          gateLocation: 'current_screen',
        }),
      });
      
      // Show signup
      showSignupModal({ onSuccess: callback });
    } else {
      callback();
    }
  };

  return { isAnonymous, identifier, requireAuth };
}

// Usage:
function SomeScreen() {
  const { isAnonymous, requireAuth } = useGuestMode();

  const handleBook = () => {
    requireAuth('booking', () => {
      // Actually book the session
      bookSession();
    });
  };
}
```

---

## **🚦 AUTHENTICATION GATES**

### **What Requires Login:**
```typescript
const GATED_ACTIONS = {
  booking: "Create account to book sessions",
  message: "Create account to message trainers",
  save: "Create account to save workouts",
  follow: "Create account to follow trainers",
  review: "Create account to leave reviews",
  waitlist: "Create account to join waitlist",
};
```

### **What Works Without Login:**
```typescript
const FREE_ACTIONS = [
  'browse',      // Browse all trainers/facilities
  'view',        // View profiles
  'watch',       // Watch workout videos
  'like',        // Like content (tracked)
  'search',      // Search everything
  'explore',     // Explore facilities
  'ai_preview',  // Preview AI personas
];
```

---

## **📊 ANALYTICS & OPTIMIZATION**

### **Track Conversion Funnels:**
```typescript
// In your analytics service
analytics.track('guest_session_created', { deviceType: 'mobile' });
analytics.track('onboarding_started');
analytics.track('onboarding_completed', { duration: 15 });
analytics.track('gate_encountered', { gateType: 'booking' });
analytics.track('signup_completed', { trigger: 'booking' });
analytics.track('conversion_completed', { migratedInteractions: 42 });
```

### **Monitor Conversion Rates:**
```typescript
// GET /api/guest/convert/stats?days=30
const stats = await fetch('YOUR_API/api/guest/convert/stats?days=30');
// Shows:
// - Total anonymous sessions
// - Conversion rate
// - Which gates convert best
// - Average time to conversion
```

---

## **🎯 BEST PRACTICES**

### **1. Delay Gates:**
```typescript
// ❌ Bad: Show gate immediately
user opens app → signup wall

// ✅ Good: Let them browse first
user opens app → browse 5 trainers → find perfect one → book → gate
```

### **2. Contextualize Gates:**
```typescript
// ❌ Generic
"Sign up to continue"

// ✅ Specific
"Sign up to book with Coach Sarah"
"Create account to save this workout"
```

### **3. Preserve Context:**
```typescript
// When user signs up, complete their original action
signup → auto-proceed to booking
signup → auto-save the workout they wanted
signup → auto-send the message they typed
```

### **4. Track Everything:**
```typescript
// Track where users drop off
- How many complete onboarding?
- How many hit gates?
- Which gates convert?
- What triggers signup?
```

---

## **✅ IMPLEMENTATION CHECKLIST**

- [ ] Database migrated (`npx prisma db push`)
- [ ] Anonymous session on app launch
- [ ] 15-second onboarding flow
- [ ] Feed works for anonymous users
- [ ] Interactions logged for anonymous
- [ ] Authentication gates implemented
- [ ] Signup conversion flow
- [ ] Data migration on signup
- [ ] Analytics tracking
- [ ] Test full guest → user flow

---

## **🚀 TESTING**

```bash
# 1. Create anonymous session
curl -X POST http://localhost:3000/api/guest/session \
  -H "Content-Type: application/json" \
  -d '{"deviceType":"mobile"}'

# 2. Save onboarding
curl -X POST http://localhost:3000/api/guest/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "anon_abc123...",
    "fitnessGoals": ["weight_loss"],
    "experience": "intermediate",
    "workoutTypes": ["strength", "hiit"],
    "step": "complete"
  }'

# 3. Get personalized feed (anonymous)
curl "http://localhost:3000/api/feed/personalized?sessionToken=anon_abc123...&limit=10"

# 4. Log interaction
curl -X POST http://localhost:3000/api/feed/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "anon_abc123...",
    "contentType": "trainer",
    "contentId": "trainer_456",
    "action": "like"
  }'

# 5. Convert to real user
curl -X POST http://localhost:3000/api/guest/convert \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "anon_abc123...",
    "userId": "real_user_456",
    "conversionTrigger": "booking"
  }'
```

---

## **🎉 DONE!**

Your app now has **ChatGPT-style instant access**:
1. ✅ Users get value in 30 seconds (no signup)
2. ✅ Personalized experience from day 1
3. ✅ Only require signup when necessary
4. ✅ Seamless conversion preserves all data
5. ✅ Maximum growth, minimum friction

**Let users fall in love before asking for commitment! 💚**

---

**Built with 💡 for GoodRunss**  
**Train Smarter • Train Safer • Train Better**

