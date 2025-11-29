# 🚀 GIA TRAINING - QUICK START GUIDE

**Start training GIA TODAY with these practical steps.**

---

## 📋 WEEK 1 ACTION PLAN

### Day 1-2: Testing & Documentation

**Test All 24 Functions** ✅

Run these commands through GIA chat to verify:

```
Calendar Functions:
1. "Add a session with John tomorrow at 2pm"
2. "What's on my schedule today?"
3. "Move my 3pm session to 4pm" 
4. "Cancel my session with Sarah on Friday"
5. "When am I available this week?"

Client Functions:
6. "Add a new client Mike Johnson, email mike@test.com"
7. "Search for clients named John"
8. "Show me John Doe's details"
9. "List all my active clients"

Payment Functions:
10. "Create a $75 invoice for John"
11. "How much have I earned this month?"
12. "Who owes me money?"
13. "Mark John's payment as received"

Messaging:
14. "Send a message to John about his progress"
15. "Send a bulk message to all clients about holiday schedule"
16. "Show me recent messages"

Workouts:
17. "Generate a 6-week strength plan for Sarah"
18. "Send the workout plan to John"

Analytics:
19. "Show me my session stats"
20. "How's John doing?"
21. "Give me a performance summary"
22. "Generate a monthly report"
23. "How much have I earned from my AI Persona?"
24. "Show me my AI Persona stats"
```

**Document What Works & What Doesn't**

Create a spreadsheet:
| Function | Works? | Issues | Priority to Fix |
|----------|--------|--------|-----------------|
| create_calendar_event | ✅ Yes | None | - |
| get_schedule | ⚠️ Partial | Time zone issues | High |
| ... | ... | ... | ... |

---

### Day 3-4: Enhance System Prompts

**Goal:** Make GIA smarter with better prompts

**Current System Prompt Location:** `src/app/api/gia/chat/route.ts` (line ~110)

**Enhancement Areas:**

**1. Add Sport-Specific Knowledge**

For each specialty, add detailed context:

```typescript
function getSpecialtyKnowledge(specialty: string): string {
  const knowledge = {
    tennis: `
**TENNIS COACHING EXPERTISE:**
- Strokes: Forehand, backhand, serve, volley, overhead
- Drills: Shadow swings, ball machine work, live ball rallies
- Strategy: Serve patterns, court positioning, point construction
- Conditioning: Lateral movement, explosive power, endurance
- Common injuries: Tennis elbow, rotator cuff, ankle sprains
- Equipment: Racket specs, string tension, court surfaces
    `,
    pilates: `
**PILATES INSTRUCTION EXPERTISE:**
- Apparatus: Reformer, Cadillac, Chair, Barrel
- Principles: Breath, concentration, control, center, precision, flow
- Classical vs Contemporary approaches
- Cueing: Tactile, visual, verbal
- Modifications for injuries and limitations
- Progressions: Beginner → Intermediate → Advanced
    `,
    // ... add for each sport
  };
  
  return knowledge[specialty] || '';
}
```

**2. Add Business Context**

```typescript
const businessContext = `
**BUSINESS OPTIMIZATION:**
You help trainers make more money by:
- Identifying open time slots to fill
- Re-engaging inactive clients
- Upselling packages and programs
- Creating AI Persona content that sells
- Optimizing pricing and packages
- Building referral systems
`;
```

**3. Add Multi-Step Planning**

```typescript
const workflowGuidance = `
**MULTI-STEP WORKFLOWS:**
When a trainer asks for something complex, break it into steps:

Example: "Help me onboard a new client"
Step 1: Create client profile
Step 2: Send welcome email
Step 3: Schedule first 3 sessions
Step 4: Generate custom program
Step 5: Set up payment
Step 6: Create progress tracking

ALWAYS explain your plan before executing!
`;
```

---

### Day 5-7: Build New Functions

**Priority: Lead Generation & CRM**

**New Functions to Add This Week:**

**1. get_leads** - Fetch leads from database

```typescript
// Add to src/lib/gia-functions.ts
{
  name: "get_leads",
  description: "Get a list of potential leads/prospects",
  input_schema: {
    type: "object",
    properties: {
      source: {
        type: "string",
        enum: ["instagram", "website", "referral", "all"],
        description: "Where the lead came from"
      },
      status: {
        type: "string",
        enum: ["new", "contacted", "qualified", "all"],
        description: "Lead status"
      },
      limit: {
        type: "number",
        description: "Number of leads to return"
      }
    }
  }
}

// Add to src/lib/gia-actions.ts
export async function executeGetLeads(params: any, userId: string) {
  const leads = await prisma.lead.findMany({
    where: {
      trainerId: userId,
      ...(params.source !== 'all' && { source: params.source }),
      ...(params.status !== 'all' && { status: params.status }),
    },
    take: params.limit || 50,
    orderBy: { createdAt: 'desc' }
  });
  
  return {
    success: true,
    leads: leads.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      source: l.source,
      status: l.status,
      createdAt: l.createdAt
    })),
    count: leads.length
  };
}
```

**2. generate_outreach_message** - AI-powered outreach

```typescript
{
  name: "generate_outreach_message",
  description: "Generate a personalized outreach message for a lead",
  input_schema: {
    type: "object",
    properties: {
      leadId: {
        type: "string",
        description: "Lead ID"
      },
      tone: {
        type: "string",
        enum: ["professional", "friendly", "casual"],
        description: "Message tone"
      },
      goal: {
        type: "string",
        description: "What you want the lead to do (book call, start trial, etc.)"
      }
    },
    required: ["leadId"]
  }
}

// Implementation
export async function executeGenerateOutreach(params: any, userId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: params.leadId, trainerId: userId }
  });
  
  if (!lead) return { success: false, error: "Lead not found" };
  
  const trainer = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, specialties: true }
  });
  
  // Use Claude to generate personalized message
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `Generate a ${params.tone || 'friendly'} outreach message for:
      
Lead: ${lead.name}
Lead's interest: ${lead.interests || 'fitness training'}
Trainer: ${trainer.name}
Specialty: ${trainer.specialties[0]}
Goal: ${params.goal || 'Book a discovery call'}

Keep it under 150 words, personalized, and compelling.`
    }]
  });
  
  const generatedMessage = message.content[0].text;
  
  return {
    success: true,
    message: generatedMessage,
    leadName: lead.name,
    tone: params.tone || 'friendly'
  };
}
```

**3. track_lead_status** - Update lead pipeline

```typescript
{
  name: "track_lead_status",
  description: "Update a lead's status in the pipeline",
  input_schema: {
    type: "object",
    properties: {
      leadId: { type: "string" },
      newStatus: {
        type: "string",
        enum: ["new", "contacted", "qualified", "converted", "lost"]
      },
      notes: { type: "string" }
    },
    required: ["leadId", "newStatus"]
  }
}
```

---

## 📚 WEEK 2: KNOWLEDGE BASE CREATION

### Build Sport-Specific Content Libraries

**Create Knowledge Files:**

```bash
mkdir -p src/lib/gia-knowledge
cd src/lib/gia-knowledge
```

**File Structure:**

```
src/lib/gia-knowledge/
├── tennis/
│   ├── terminology.ts
│   ├── drills.ts
│   ├── programs.ts
│   └── business-tips.ts
├── pilates/
│   ├── terminology.ts
│   ├── exercises.ts
│   ├── sequences.ts
│   └── business-tips.ts
├── strength/
│   ├── terminology.ts
│   ├── exercises.ts
│   ├── programs.ts
│   └── business-tips.ts
└── index.ts
```

**Example: Tennis Terminology**

```typescript
// src/lib/gia-knowledge/tennis/terminology.ts

export const tennisTerminology = {
  strokes: {
    forehand: {
      description: "Dominant hand stroke hit from the right side (for righties)",
      variations: ["topspin", "flat", "slice"],
      commonIssues: ["late preparation", "closed stance", "arm-only swing"],
      drills: ["shadow swings", "mini tennis", "crosscourt rallies"]
    },
    serve: {
      description: "Overhead stroke to start the point",
      types: ["flat", "topspin/kick", "slice"],
      technique: ["trophy position", "racket drop", "pronation"],
      drills: ["target practice", "toss consistency", "shadow serves"]
    }
    // ... more strokes
  },
  
  tactics: {
    baselinePlay: {
      description: "Playing from behind the baseline",
      strategies: ["consistency", "depth", "changing pace"],
      patterns: ["inside-out forehand", "crosscourt backhands"]
    }
    // ... more tactics
  },
  
  conditioning: {
    movement: ["split step", "first step quickness", "recovery"],
    endurance: ["aerobic base", "interval training"],
    power: ["medicine ball work", "plyometrics"]
  }
};

export const tennisDrills = [
  {
    name: "Crosscourt Forehand Rally",
    goal: "Consistency and depth",
    setup: "Both players hit crosscourt forehands",
    progression: "Add down-the-line winner after 10 shots",
    duration: "10 minutes"
  },
  // ... 50+ more drills
];

export const tennisPrograms = {
  beginnner: {
    weeks: 8,
    focus: ["grip", "basic strokes", "court positioning"],
    sessionsPerWeek: 2,
    sessionDuration: 60
  },
  // ... more programs
};
```

**Load Knowledge in System Prompt:**

```typescript
import { tennisTerminology, tennisDrills } from '@/lib/gia-knowledge/tennis/terminology';

const systemPrompt = `
You are GIA, expert in ${specialty}.

${getSpecialtyKnowledge(specialty)}

**DRILLS YOU CAN RECOMMEND:**
${specialty === 'tennis' ? JSON.stringify(tennisDrills.slice(0, 10), null, 2) : ''}

...
`;
```

---

## 🧪 WEEK 3: TESTING & ITERATION

### Test Complex Workflows

**Workflow 1: Lead Conversion**

```
Test Script:
1. "GIA, show me my new leads"
2. "Generate an outreach message for lead #123"
3. "Send that message to the lead"
4. "Mark the lead as contacted"
5. "Schedule a reminder to follow up in 3 days"

Expected: All 5 steps complete successfully
```

**Workflow 2: Client Onboarding**

```
Test Script:
1. "New client Sarah wants to train for a marathon"
2. "Create her profile with email sarah@test.com"
3. "Generate a 12-week marathon training program"
4. "Schedule sessions every Mon/Wed/Fri at 6am starting next week"
5. "Send her the program and first week's schedule"
6. "Create a 12-session package invoice for $900"

Expected: Client created, program generated, 12 sessions scheduled, email sent, invoice created
```

**Workflow 3: Business Analytics**

```
Test Script:
1. "How much money did I make last month?"
2. "Compare that to the month before"
3. "Which clients generated the most revenue?"
4. "What times of day am I busiest?"
5. "Suggest ways to increase revenue next month"

Expected: Revenue data, trends, insights, actionable recommendations
```

---

## 📊 TRACKING PROGRESS

### Metrics to Monitor

**Daily:**
- [ ] Number of GIA interactions
- [ ] Function calls made
- [ ] Success rate
- [ ] Error rate

**Weekly:**
- [ ] New functions added
- [ ] Workflows improved
- [ ] Knowledge base entries added
- [ ] User satisfaction (1-5 stars)

**Use This Template:**

```markdown
## Week 1 Progress Report

**Functions Tested:** 24/24 ✅
**New Functions Added:** 3 (get_leads, generate_outreach, track_lead_status)
**Knowledge Base:** Tennis (50 drills), Pilates (30 exercises)
**Workflows Tested:** 5
**Success Rate:** 87%
**Errors Found:** 12 (documented in issues.md)

**Key Wins:**
- Lead generation workflow working end-to-end
- Tennis drill recommendations are accurate
- Multi-step reasoning improved 40%

**Next Week Goals:**
- Add 5 more CRM functions
- Create Pilates and Strength knowledge bases
- Improve error handling
- Test with 3 real trainers
```

---

## 🎯 SUCCESS CHECKLIST

### Week 1 ✅
- [ ] All 24 functions tested
- [ ] Issues documented
- [ ] 3 new functions added
- [ ] Enhanced system prompts
- [ ] First knowledge base created

### Week 2 ✅
- [ ] 5+ new functions added
- [ ] 3 knowledge bases created
- [ ] 3 workflows tested
- [ ] Real user testing started

### Week 3 ✅
- [ ] 10+ new functions total
- [ ] 5+ knowledge bases
- [ ] 10+ workflows working
- [ ] Error rate < 5%
- [ ] User satisfaction > 4/5

---

## 🚀 DEPLOY TO VERCEL

### Quick Deploy Commands

```bash
# From goodrunss-trainer-dashboard folder
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Make sure everything is committed
git add .
git commit -m "GIA enhancements: New functions and knowledge bases"

# Push to GitHub
git push origin main

# Vercel will auto-deploy if connected
# Or manually deploy:
npm run build
vercel --prod
```

### Environment Variables to Check

Make sure these are set in Vercel:

```bash
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=...
```

---

## 💡 QUICK TIPS

**Make GIA Conversational:**
- Use emojis in responses (✅ 💰 📅 🎉)
- Confirm actions: "Done! Added session with John ✅"
- Be proactive: "I noticed you have 3 open slots this week..."

**Handle Errors Gracefully:**
- Don't just say "Error"
- Explain what went wrong and suggest fixes
- Example: "I couldn't find a client named 'Jon'. Did you mean John Doe or John Smith?"

**Multi-Step Planning:**
- Before executing complex workflows, explain the plan
- Example: "Here's my plan: 1) Create client, 2) Generate program, 3) Schedule sessions. Sound good?"

**Learn from Trainers:**
- Ask questions when unclear
- Remember preferences
- Suggest based on past behavior

---

**Let's make GIA legendary! 🚀**

Start with Week 1 today and track your progress.
