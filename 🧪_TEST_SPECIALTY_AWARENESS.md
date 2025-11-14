# 🧪 TEST SPECIALTY-AWARE AI SYSTEM

Quick testing guide to verify specialty-awareness works correctly.

---

## 🚀 QUICK START

### Step 1: Update Your Trainer Profile

Go to **Settings → Profile** and set your specialty:

```
Specialties: ["basketball"] // or yoga, pilates, tennis, etc.
```

**OR** update directly in database:
```sql
UPDATE users 
SET specialties = ARRAY['basketball']::text[]
WHERE id = 'your-user-id';
```

---

## 🏀 TEST 1: BASKETBALL COACH

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['basketball']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Go to `/dashboard/gia` → **Chat** tab
2. Type: "Create a workout plan for my player"
3. **Expected Result:**
   - Should mention: court drills, vertical jump, defensive slides
   - Should say "practice" not "workout"
   - Should say "player" not "client"
   - Should include basketball-specific exercises

### Test Content Generation
1. Go to `/dashboard/gia` → **Generate** tab
2. Select: Content Type = "Social Post"
3. Prompt: "Post about today's intense training"
4. **Expected Result:**
   - Basketball terminology (court, drills, hoops)
   - Hashtags: #basketball #hoopers #courtwork
   - No generic gym language

### Test Voice Commands
1. Go to `/dashboard/gia` → **Voice** tab
2. Say: "What should I focus on in today's practice?"
3. **Expected Result:**
   - Basketball-specific suggestions
   - Uses term "practice" not "workout"

### Test Proactive Suggestions
1. Go to `/dashboard/gia` → **Suggestions** tab
2. Click "Refresh"
3. **Expected Result:**
   - Suggestions say "practices" not "sessions"
   - Mentions "players" not "clients"

---

## 🧘‍♀️ TEST 2: YOGA INSTRUCTOR

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['yoga']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Type: "Create a class plan for beginners"
2. **Expected Result:**
   - Yoga pose names (Downward Dog, Warrior, etc.)
   - Mentions: pranayama, vinyasa, flow
   - Says "class" not "workout"
   - Says "students" not "clients"
   - Includes breath cues

### Test Content Generation
1. Content Type: "Email"
2. Prompt: "Welcome email for new students"
3. **Expected Result:**
   - Spiritual/mindful language
   - Yoga terminology
   - Mentions: mat, props, modifications
   - Hashtags: #yoga #namaste #mindfulness

---

## 🤸‍♀️ TEST 3: PILATES INSTRUCTOR

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['pilates']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Type: "Generate a 30-minute mat routine"
2. **Expected Result:**
   - Pilates exercises: The Hundred, Roll-up, Single Leg Stretch
   - Mentions: breath coordination, control, reformer
   - Says "class" not "workout"
   - Says "movement" not "exercise"
   - Includes breath counts

### Test Content Generation
1. Content Type: "Workout Tip"
2. Prompt: "Tips for better core engagement"
3. **Expected Result:**
   - Pilates-specific language
   - Mentions: transverse abdominis, neutral spine
   - Focus on precision and control

---

## 🏃‍♀️ TEST 4: RUNNING COACH

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['running']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Type: "Create a speed workout"
2. **Expected Result:**
   - Running terminology: intervals, tempo, fartlek
   - Says "run" not "workout"
   - Mentions: pace, cadence, distance
   - Includes: 400m repeats, hill sprints, tempo runs

---

## 🥊 TEST 5: BOXING COACH

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['boxing']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Type: "Plan today's training session"
2. **Expected Result:**
   - Boxing terminology: rounds, combinations, pad work
   - Says "training session" not "workout"
   - Says "fighters" not "clients"
   - Includes: 1-2 combo, hook-uppercut, footwork drills

---

## ⛳ TEST 6: GOLF INSTRUCTOR

### Setup
```sql
UPDATE users 
SET specialties = ARRAY['golf']::text[]
WHERE id = 'your-user-id';
```

### Test GIA Chat
1. Type: "Create a practice routine"
2. **Expected Result:**
   - Golf terminology: swing mechanics, short game, putting
   - Says "lesson" or "practice" not "workout"
   - Says "golfers" not "clients"
   - Includes: driver, irons, wedges, putting drills

---

## ✅ VERIFICATION CHECKLIST

For each specialty test:

### GIA Chat
- [ ] Response uses specialty-specific exercises
- [ ] Uses correct terminology (practice vs workout, etc.)
- [ ] Uses correct client term (player, student, golfer, etc.)
- [ ] Mentions specialty-specific equipment
- [ ] No generic gym language

### Content Generation
- [ ] Content matches specialty style
- [ ] Hashtags are specialty-specific
- [ ] Language and tone appropriate for specialty
- [ ] Equipment mentions are correct

### Voice Commands
- [ ] Voice responses are specialty-aware
- [ ] Uses correct terminology in spoken responses

### Proactive Suggestions
- [ ] Suggestions use specialty terminology
- [ ] "Sessions" renamed appropriately (practices, classes, etc.)
- [ ] "Clients" renamed appropriately (players, students, etc.)

---

## 🐛 TROUBLESHOOTING

### Issue: Still getting generic responses

**Check:**
1. Verify user specialty is set in database:
```sql
SELECT id, name, specialties FROM users WHERE id = 'your-user-id';
```

2. Clear any cached data (restart dev server)

3. Check console logs for specialty detection:
```javascript
console.log('Trainer specialty:', primarySpecialty);
```

### Issue: Wrong terminology

**Check:**
1. Verify specialty name matches expected format:
   - ✅ "basketball", "yoga", "pilates"
   - ❌ "Basketball", "YOGA", "pilates-instructor"

2. Check `normalizedSpecialty` in code:
```typescript
const normalizedSpecialty = specialty
  .toLowerCase()
  .replace(/[_\s-]+/g, '_');
```

### Issue: Specialty not recognized

**Add to specialty mapping:**

Edit files:
1. `/api/gia/generate/route.ts` → `getSpecialtyContext()`
2. `/lib/gia-actions.ts` → `getWorkoutFormat()`
3. `/api/gia/chat/route.ts` → `getSpecialtyGuidance()`
4. `/lib/gia-proactive.ts` → `getSpecialtyTerminology()`

---

## 📊 TEST RESULTS TEMPLATE

```
TEST DATE: [Date]
TESTER: [Name]

SPECIALTY: Basketball
✅ GIA Chat - Basketball drills detected
✅ Content Gen - Basketball hashtags used
✅ Voice - Correct terminology
✅ Suggestions - Says "practices" not "sessions"

SPECIALTY: Yoga
✅ GIA Chat - Yoga poses included
✅ Content Gen - Spiritual language
✅ Voice - Says "class" not "workout"
✅ Suggestions - Says "students" not "clients"

SPECIALTY: Pilates
✅ GIA Chat - Pilates exercises (Hundred, Roll-up)
✅ Content Gen - Mentions reformer and breath
✅ Voice - Uses "movement" not "exercise"
✅ Suggestions - Says "classes"

ISSUES FOUND:
- [None / List any issues]

OVERALL STATUS: ✅ PASS / ❌ FAIL
```

---

## 🎯 DEMO TESTING SCRIPT

### For Demo with Real Trainer

1. **Before demo starts:**
   - Set trainer's specialty in database
   - Verify specialty is correct
   - Test one GIA chat message to confirm

2. **During demo:**
   - Show GIA generating specialty-specific content
   - Point out terminology differences
   - Show proactive suggestions using correct terms

3. **If something goes wrong:**
   - Fallback: "The AI adapts to your specialty - right now it's detecting [specialty]"
   - Show documentation with examples
   - Offer to demo a different feature

---

## 🚀 SPECIALTY SUPPORT STATUS

### ✅ Fully Supported (23 specialties)

- Basketball 🏀
- Pickleball 🏓
- Tennis 🎾
- Volleyball 🏐
- Yoga 🧘‍♀️
- Pilates 🤸‍♀️
- Barre 💃
- Strength Training 💪
- HIIT ⚡
- CrossFit 🏋️‍♀️
- Running 🏃‍♀️
- Cycling 🚴‍♀️
- Swimming 🏊‍♀️
- Martial Arts 🥋
- Boxing 🥊
- Soccer ⚽
- Dance 💃
- Golf ⛳
- Nutrition 🥗
- Wellness 🌿
- Fitness (generic) 💪

### ➕ To Add New Specialty

1. Add to `getSpecialtyContext()` in `/api/gia/generate/route.ts`
2. Add to `getWorkoutFormat()` in `/lib/gia-actions.ts`
3. Add to `getSpecialtyGuidance()` in `/api/gia/chat/route.ts`
4. Add to `getSpecialtyTerminology()` in `/lib/gia-proactive.ts`
5. Test with real trainer input

---

## ✅ FINAL VERIFICATION

Before demo/launch:

- [ ] Tested 3+ different specialties
- [ ] All GIA features work (chat, generate, voice, suggestions)
- [ ] Terminology correct for each specialty
- [ ] No generic gym language bleeding through
- [ ] Hashtags appropriate for each specialty
- [ ] Voice commands work
- [ ] Proactive suggestions use correct terms
- [ ] Documentation complete
- [ ] Team trained on feature

---

**Status:** ✅ READY FOR DEMO
**Last Updated:** November 11, 2025
**Tested By:** [Your Name]







