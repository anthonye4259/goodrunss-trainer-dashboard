# 🧠 GIA MEMORY SYSTEM - TESTING GUIDE

**Created:** November 29, 2025
**Status:** ✅ IMPLEMENTED & READY TO TEST

---

## 🎯 WHAT WAS IMPLEMENTED

### 1. Database Table ✅
- **Table:** `gia_memory`
- **Location:** `prisma/migrations/add_gia_memory/migration.sql`
- **Status:** SQL file created (needs to be run in Supabase)

### 2. Memory Functions ✅
- **File:** `src/lib/gia-memory.ts`
- **Functions:**
  - `saveMemory()` - Save any memory
  - `loadMemories()` - Load top 30 memories
  - `formatMemoriesForPrompt()` - Format for system prompt
  - `extractAndSaveMemories()` - Auto-extract from conversations
  - Helper functions: `savePreference()`, `saveClientFact()`, etc.

### 3. Chat Route Integration ✅
- **File:** `src/app/api/gia/chat/route.ts`
- **Changes:**
  - ✅ Imports memory functions
  - ✅ Loads memories when conversation starts
  - ✅ Adds memories to system prompt
  - ✅ Extracts & saves memories after each message

---

## 🚀 HOW TO ACTIVATE

### Step 1: Run Database Migration

**Go to your Supabase Dashboard:**
1. Open https://supabase.com/dashboard
2. Select your GoodRunss project
3. Go to SQL Editor
4. Copy and paste this SQL:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "gia_memory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "source" TEXT NOT NULL DEFAULT 'conversation',
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "useCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gia_memory_userId_idx" ON "gia_memory"("userId");
CREATE INDEX IF NOT EXISTS "gia_memory_userId_importance_idx" ON "gia_memory"("userId", "importance");
CREATE INDEX IF NOT EXISTS "gia_memory_userId_memoryType_idx" ON "gia_memory"("userId", "memoryType");
CREATE UNIQUE INDEX IF NOT EXISTS "gia_memory_userId_memoryType_category_key_key" ON "gia_memory"("userId", "memoryType", "category", "key");
```

5. Click "Run"
6. ✅ Table created!

### Step 2: Generate Prisma Client

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma generate
```

### Step 3: Deploy to Vercel

```bash
git add .
git commit -m "Add GIA memory system - now remembers across conversations!"
git push origin main
```

Vercel will auto-deploy.

---

## 🧪 TESTING MEMORY

### Test 1: Save a Preference

**Chat with GIA:**
```
You: "I prefer to communicate in a casual, friendly tone"
GIA: [responds]
```

**Check if saved:**
```sql
SELECT * FROM gia_memory WHERE "memoryType" = 'preference' ORDER BY "createdAt" DESC LIMIT 5;
```

You should see:
```
memoryType: preference
category: communication
key: communication_preference  
value: communicate in a casual, friendly tone
```

---

### Test 2: Save Client Facts

**Chat with GIA:**
```
You: "John has a bad left knee and can't do lunges"
GIA: [responds]
```

**Check if saved:**
```sql
SELECT * FROM gia_memory WHERE "memoryType" = 'client_fact' ORDER BY "createdAt" DESC LIMIT 5;
```

You should see:
```
memoryType: client_fact
category: john
key: john_injury
value: bad left knee...
```

---

### Test 3: Memory Persistence

**First conversation:**
```
You: "I prefer casual communication"
GIA: "Got it! I'll keep that in mind."
```

**New conversation (close and reopen GIA):**
```
You: "How's it going?"
GIA: "Hey! Going great! How can I help you today?" (casual tone!)
```

**GIA should remember your preference from the first conversation!**

---

### Test 4: Business Facts

**Chat with GIA:**
```
You: "Create an invoice for John for $75"
GIA: [creates invoice]
```

**Check if saved:**
```sql
SELECT * FROM gia_memory WHERE "memoryType" = 'business_fact' AND "category" = 'pricing' LIMIT 5;
```

You should see:
```
memoryType: business_fact
category: pricing
key: typical_session_price
value: $75
```

---

## 🔍 WHAT GIA REMEMBERS

### Memory Types

**1. Preferences** (importance: 7-8)
- Communication style
- Scheduling preferences
- Time preferences
- Your usual workflows

**2. Client Facts** (importance: 9-10)
- Injuries and limitations
- Goals and aspirations
- Special notes
- Communication preferences

**3. Business Facts** (importance: 6-7)
- Pricing structure
- Busy times
- Package offerings
- Revenue patterns

**4. Workflows** (importance: 8)
- Your custom processes
- Standard responses
- Email templates

**5. Patterns** (importance: 7)
- Observed behaviors
- Trends in your business
- Client patterns

---

## 🎨 HOW IT LOOKS

### Before Memory:
```
[New conversation]
You: "Schedule John for tomorrow at 2pm"
GIA: "Done! Session created."
```

### After Memory:
```
[New conversation - GIA loads memories]
You: "Schedule John for tomorrow at 2pm"  
GIA: "Done! That's John's 3rd session this week - he's on fire! 🔥
     BTW, I remember he has that left knee issue, so I added a note 
     to avoid lunges. Session created for tomorrow at 2pm."
```

**GIA remembers John's injury from a previous conversation!**

---

## 📊 VIEW ALL MEMORIES

### SQL Queries

**See all your memories:**
```sql
SELECT * FROM gia_memory 
WHERE "userId" = 'your-user-id' 
ORDER BY "importance" DESC, "lastUsed" DESC;
```

**See most important memories:**
```sql
SELECT "memoryType", "key", "value", "importance", "useCount" 
FROM gia_memory 
WHERE "userId" = 'your-user-id' AND "importance" >= 8
ORDER BY "importance" DESC;
```

**See most used memories:**
```sql
SELECT "memoryType", "key", "value", "useCount" 
FROM gia_memory 
WHERE "userId" = 'your-user-id' 
ORDER BY "useCount" DESC 
LIMIT 10;
```

---

## 💡 AUTO-EXTRACTION EXAMPLES

GIA automatically extracts and saves memories from your conversations:

### Pattern: "I prefer..."
```
You: "I prefer to work with clients in the morning"
→ Saves: preference / scheduling / preferred_time = "morning"
```

### Pattern: "I like to..."
```
You: "I like to send check-ins every Friday"
→ Saves: preference / communication / usual_behavior = "send check-ins every Friday"
```

### Pattern: "[Client] has [injury/problem]"
```
You: "Sarah has a bad right shoulder"
→ Saves: client_fact / sarah / sarah_injury = "bad right shoulder"
```

### Pattern: "[Client] wants to [goal]"
```
You: "Mike wants to run a marathon"
→ Saves: client_fact / mike / mike_goal = "run a marathon"
```

### Pattern: Price mentions
```
You: "Invoice John for $100"
→ Saves: business_fact / pricing / typical_session_price = "$100"
```

---

## 🔧 MANUAL MEMORY SAVING

You can also manually save memories in your code:

```typescript
import { saveMemory, saveClientFact, savePreference } from '@/lib/gia-memory';

// Save a preference
await savePreference(userId, 'communication_style', 'casual and friendly', 8);

// Save client fact
await saveClientFact(userId, 'john', 'injury', 'bad left knee, avoid lunges');

// Save business fact
await saveMemory({
  userId,
  memoryType: 'business_fact',
  category: 'pricing',
  key: 'package_12_sessions',
  value: '$900 (12 sessions at $75 each)',
  importance: 7
});
```

---

## ✅ SUCCESS CHECKLIST

- [ ] SQL migration run in Supabase
- [ ] `gia_memory` table exists
- [ ] Prisma client regenerated
- [ ] Code deployed to Vercel
- [ ] Tested: GIA saves preferences
- [ ] Tested: GIA saves client facts
- [ ] Tested: GIA remembers across conversations
- [ ] Tested: Memory appears in system prompt

---

## 🎉 EXPECTED RESULTS

**After implementing memory, GIA will:**

1. ✅ **Remember your preferences** across all conversations
2. ✅ **Know your clients** - injuries, goals, history
3. ✅ **Learn your business** - pricing, scheduling, patterns
4. ✅ **Feel personal** - like talking to someone who knows you
5. ✅ **Get smarter over time** - the more you talk, the more it learns

**Cost:** $0 (uses existing database)

**Time to implement:** Already done! Just run the SQL migration.

---

## 🚀 NEXT STEPS

1. **Run the SQL migration** (5 minutes)
2. **Test with a few conversations** (10 minutes)
3. **Check what memories were saved** (SQL queries above)
4. **Enjoy GIA remembering everything!** 🎉

---

**GIA now has a memory like ChatGPT!** 🧠

Every conversation makes it smarter.
