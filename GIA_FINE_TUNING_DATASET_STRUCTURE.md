# 🎯 GIA FINE-TUNING DATASET STRUCTURE

**How to create training data to make GIA smarter for each sport.**

---

## 📊 DATASET FORMAT

### Anthropic Claude Fine-Tuning Format

```json
{
  "system": "You are GIA, an AI assistant for tennis coaches...",
  "messages": [
    {
      "role": "user",
      "content": "Add a session with John tomorrow at 2pm"
    },
    {
      "role": "assistant",
      "content": "I'll create that session for you.",
      "tool_calls": [
        {
          "name": "create_calendar_event",
          "input": {
            "clientName": "John",
            "date": "2025-11-30",
            "time": "14:00",
            "duration": 60
          }
        }
      ]
    },
    {
      "role": "user",
      "content": "[tool_result] {\"success\": true, \"eventId\": \"evt_123\"}"
    },
    {
      "role": "assistant",
      "content": "✅ Done! Created a 60-minute session with John tomorrow at 2pm. I've added it to your calendar and sent him a confirmation."
    }
  ]
}
```

---

## 🏗️ DATA COLLECTION STRATEGY

### 1. Real User Conversations (Best Quality)

**Source:** Actual GIA conversations from the platform

**Collection Method:**
```sql
-- Export anonymized conversations
SELECT 
  c.id,
  u.specialties[1] as specialty,
  json_agg(
    json_build_object(
      'role', m.role,
      'content', m.content,
      'timestamp', m.created_at
    ) ORDER BY m.created_at
  ) as messages
FROM ai_conversations c
JOIN ai_messages m ON m.conversation_id = c.id
JOIN users u ON u.id = c.user_id
WHERE m.created_at > NOW() - INTERVAL '30 days'
GROUP BY c.id, u.specialties;
```

**Filtering & Quality:**
- Only use conversations that completed successfully
- Remove conversations with errors
- Annotate function calls that were made
- Remove PII (names, emails, phone numbers)

---

### 2. Synthetic Data Generation (Scale)

**Use GPT-4/Claude to generate training examples**

**Template:**

```python
import anthropic

client = anthropic.Anthropic(api_key="...")

def generate_training_example(sport: str, scenario: str):
    prompt = f"""
Generate a realistic conversation between a {sport} coach and GIA (their AI assistant).

Scenario: {scenario}

Requirements:
- Natural, conversational language
- Specific to {sport} terminology
- Include function calls where appropriate
- Show GIA being helpful and proactive

Format as JSON with system, messages array
"""
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )
    
    return response.content[0].text

# Generate 1000 examples per sport
sports = ["tennis", "pilates", "yoga", "strength", "basketball"]
scenarios = [
    "scheduling a new client",
    "generating a workout plan",
    "analyzing client progress",
    "sending payment reminder",
    "creating marketing content",
    # ... 50+ more scenarios
]

dataset = []
for sport in sports:
    for scenario in scenarios:
        for i in range(20):  # 20 variations of each
            example = generate_training_example(sport, scenario)
            dataset.append(example)

# Total: 5 sports × 50 scenarios × 20 variations = 5,000 examples
```

---

### 3. Expert-Curated Examples (Highest Quality)

**Partner with domain experts to create gold-standard examples**

**Process:**
1. Interview top coaches in each sport
2. Record their actual conversations with clients
3. Translate into GIA-format conversations
4. Have experts review and approve

**Example Partnership:**

```
Tennis Pro Partnership:
- Partner with 5 elite tennis coaches
- Record 100 client sessions each (with consent)
- Extract 500 coaching interactions
- Convert to GIA training data
- Review and annotate

Result: 500 expert-curated tennis examples
```

---

## 📁 FILE STRUCTURE

```
gia-training-data/
├── base/
│   ├── calendar-management.jsonl
│   ├── client-management.jsonl
│   ├── payment-tracking.jsonl
│   ├── messaging.jsonl
│   ├── workout-planning.jsonl
│   └── analytics.jsonl
│
├── sports/
│   ├── tennis/
│   │   ├── scheduling.jsonl
│   │   ├── drills-and-technique.jsonl
│   │   ├── program-design.jsonl
│   │   ├── business-and-marketing.jsonl
│   │   └── client-conversations.jsonl
│   │
│   ├── pilates/
│   │   ├── scheduling.jsonl
│   │   ├── exercises-and-sequencing.jsonl
│   │   ├── program-design.jsonl
│   │   ├── studio-management.jsonl
│   │   └── client-conversations.jsonl
│   │
│   ├── strength/
│   │   └── ...
│   │
│   ├── yoga/
│   │   └── ...
│   │
│   └── basketball/
│       └── ...
│
├── workflows/
│   ├── lead-conversion.jsonl
│   ├── client-onboarding.jsonl
│   ├── performance-analysis.jsonl
│   └── revenue-optimization.jsonl
│
├── edge-cases/
│   ├── error-handling.jsonl
│   ├── ambiguous-requests.jsonl
│   ├── conflicting-information.jsonl
│   └── multi-client-scenarios.jsonl
│
└── metadata/
    ├── statistics.json
    ├── quality-scores.json
    └── validation-results.json
```

---

## 📝 EXAMPLE TRAINING DATA

### Base Calendar Management

```jsonl
{"system": "You are GIA, an AI assistant helping trainers manage their business.", "messages": [{"role": "user", "content": "Add a session with John tomorrow at 2pm"}, {"role": "assistant", "content": "I'll schedule that for you.", "tool_calls": [{"name": "create_calendar_event", "input": {"clientName": "John", "date": "2025-11-30", "time": "14:00", "duration": 60}}]}, {"role": "user", "content": "[tool_result] {\"success\": true, \"eventId\": \"evt_123\"}"}, {"role": "assistant", "content": "✅ Done! Created a 60-minute session with John tomorrow (Nov 30) at 2pm. Calendar updated and confirmation sent."}]}

{"system": "You are GIA, an AI assistant helping trainers manage their business.", "messages": [{"role": "user", "content": "What's on my schedule today?"}, {"role": "assistant", "content": "Let me check your schedule for today.", "tool_calls": [{"name": "get_schedule", "input": {"startDate": "2025-11-29"}}]}, {"role": "user", "content": "[tool_result] {\"success\": true, \"events\": [{\"time\": \"10:00\", \"client\": \"Sarah\", \"type\": \"Tennis\"}, {\"time\": \"14:00\", \"client\": \"Mike\", \"type\": \"Fitness\"}]}"}, {"role": "assistant", "content": "📅 Here's your schedule for today:\n\n1. 10:00 AM - Tennis session with Sarah\n2. 2:00 PM - Fitness session with Mike\n\nYou have 2 sessions today. Looking good! 💪"}]}
```

### Tennis-Specific

```jsonl
{"system": "You are GIA, an AI assistant expert in tennis coaching, helping tennis coaches manage their business and create training programs.", "messages": [{"role": "user", "content": "My client wants to improve their serve. What drills should I use?"}, {"role": "assistant", "content": "Great! Here are my top 5 serve development drills for your client:\n\n1. **Target Practice** (15 min)\n   - Set up targets in service boxes\n   - Focus on placement over power\n   - Track accuracy percentage\n\n2. **Shadow Serves** (10 min)\n   - Practice motion without hitting\n   - Focus on: trophy position, racket drop, pronation\n   - Use video for feedback\n\n3. **Toss Consistency** (10 min)\n   - Practice toss placement\n   - Should land in front and slightly right (for righties)\n   - Do 20 reps with perfect form\n\n4. **Progressive Power** (15 min)\n   - Start at 50% power, work up to 90%\n   - Maintain technique at each level\n   - Don't sacrifice form for speed\n\n5. **Match Serve Simulation** (10 min)\n   - Practice serve patterns (wide, body, T)\n   - Include first and second serves\n   - Pressure situations\n\n**Progression:** Do these 2-3x/week for 4-6 weeks. Want me to create a detailed 6-week serve improvement program?"}]}

{"system": "You are GIA, an AI assistant expert in tennis coaching, helping tennis coaches manage their business and create training programs.", "messages": [{"role": "user", "content": "Generate a 8-week program for intermediate player focusing on forehand consistency"}, {"role": "assistant", "content": "I'll create that tennis program for you.", "tool_calls": [{"name": "generate_workout_plan", "input": {"clientLevel": "intermediate", "focus": "forehand consistency", "duration": 8, "sport": "tennis"}}]}, {"role": "user", "content": "[tool_result] {\"success\": true, \"programId\": \"prog_456\"}"}, {"role": "assistant", "content": "✅ Created an 8-week forehand development program!\n\n**Program Overview:**\n\n**Weeks 1-2: Foundation**\n- Grip check and adjustment\n- Shadow swings (100/day)\n- Mini tennis crosscourt\n- Focus: proper contact point\n\n**Weeks 3-4: Consistency**\n- Crosscourt rally drills\n- Target: 20+ ball rallies\n- Add topspin emphasis\n- Footwork patterns\n\n**Weeks 5-6: Depth & Power**\n- Baseline consistency drills\n- Progressive power (60% → 85%)\n- Court positioning\n- Inside-out forehand patterns\n\n**Weeks 7-8: Match Application**\n- Point play scenarios\n- Forehand as primary weapon\n- Pattern recognition\n- Pressure situations\n\n**Sessions:** 2-3x/week, 60-90 minutes\n**Drills included:** 30+ specific drills\n\nWant me to send this to your client?"}]}
```

### Pilates-Specific

```jsonl
{"system": "You are GIA, an AI assistant expert in Pilates instruction, helping Pilates instructors manage their studios and create class sequences.", "messages": [{"role": "user", "content": "I need a 45-minute reformer sequence for intermediate clients focusing on core"}, {"role": "assistant", "content": "I'll create a core-focused reformer sequence for you.\n\n**45-Minute Reformer Flow - Core Intensive**\n\n**Warm-Up (5 min)**\n- Footwork series (parallel, V, heels, toes)\n- Springs: 3 reds\n- Reps: 10 each\n\n**Core Series (25 min)**\n\n1. **Hundred** (3 min)\n   - Springs: 1 red\n   - 10 breaths, 100 pumps\n   - Cue: Scoop abs, reach long\n\n2. **Short Box Series** (8 min)\n   - Round back, flat back, side bends, twist\n   - Springs: 2-3 reds\n   - Focus: Spinal articulation\n\n3. **Long Stretch Series** (7 min)\n   - Long stretch, down stretch, up stretch\n   - Springs: 2 reds + 1 blue\n   - Challenge: Control the carriage\n\n4. **Coordination** (3 min)\n   - Springs: 1-2 reds\n   - Reps: 8-10\n   - Advanced: Add scissors\n\n5. **Teaser Prep** (4 min)\n   - Roll up with straps\n   - Springs: 1 red\n   - Progress to full teaser\n\n**Cool Down (5 min)**\n- Mermaid stretch\n- Hip flexor stretch\n- Spinal twist\n\n**Class Flow (10 min)**\n- Pace: Moderate\n- Music: 120-130 BPM\n- Transitions: Minimal equipment changes\n\n**Modifications ready for:**\n- Tight hip flexors\n- Lower back sensitivity\n- Shoulder limitations\n\nWant me to save this sequence and create variations?"}]}
```

### Multi-Step Workflow

```jsonl
{"system": "You are GIA, an AI assistant helping trainers grow their business.", "messages": [{"role": "user", "content": "I have 5 new Instagram leads. Help me convert them."}, {"role": "assistant", "content": "Great! Let me help you convert those leads. Here's my plan:\n\n1. Get the lead details\n2. Analyze each lead's interests\n3. Generate personalized outreach for each\n4. Send the messages\n5. Set up follow-up reminders\n\nLet's start! First, let me get your leads.", "tool_calls": [{"name": "get_leads", "input": {"source": "instagram", "status": "new", "limit": 5}}]}, {"role": "user", "content": "[tool_result] {\"success\": true, \"leads\": [{\"id\": \"lead_1\", \"name\": \"Sarah J\", \"interests\": \"weight loss, HIIT\"}, {\"id\": \"lead_2\", \"name\": \"Mike T\", \"interests\": \"strength training\"}, {\"id\": \"lead_3\", \"name\": \"Jenny L\", \"interests\": \"yoga, flexibility\"}, {\"id\": \"lead_4\", \"name\": \"David K\", \"interests\": \"marathon training\"}, {\"id\": \"lead_5\", \"name\": \"Emma R\", \"interests\": \"general fitness\"}]}"}, {"role": "assistant", "content": "Perfect! I found 5 leads:\n\n1. Sarah J - Interested in weight loss & HIIT\n2. Mike T - Wants strength training\n3. Jenny L - Into yoga & flexibility\n4. David K - Marathon training\n5. Emma R - General fitness\n\nNow generating personalized outreach for each...", "tool_calls": [{"name": "generate_outreach_message", "input": {"leadId": "lead_1", "tone": "friendly", "goal": "Book discovery call"}}, {"name": "generate_outreach_message", "input": {"leadId": "lead_2", "tone": "professional", "goal": "Book discovery call"}}, {"name": "generate_outreach_message", "input": {"leadId": "lead_3", "tone": "friendly", "goal": "Book discovery call"}}, {"name": "generate_outreach_message", "input": {"leadId": "lead_4", "tone": "professional", "goal": "Book discovery call"}}, {"name": "generate_outreach_message", "input": {"leadId": "lead_5", "tone": "friendly", "goal": "Book discovery call"}}]}, {"role": "user", "content": "[tool_result] {\"success\": true, \"messages_generated\": 5}"}, {"role": "assistant", "content": "✅ Generated personalized messages for all 5 leads!\n\n**Next step:** Want me to send these messages? I can also:\n- Schedule them to go out at optimal times\n- Set up automatic follow-ups in 3 days\n- Track response rates\n\nWhat would you like me to do?"}]}
```

---

## 🎯 QUALITY METRICS

### Data Quality Checklist

For each training example:

- [ ] Natural, conversational language
- [ ] Appropriate for the sport/specialty
- [ ] Correct terminology used
- [ ] Function calls are valid
- [ ] Tool results are realistic
- [ ] Assistant response is helpful
- [ ] Tone matches GIA's personality
- [ ] No PII included
- [ ] Grammatically correct
- [ ] Follows the scenario logically

### Validation Script

```python
def validate_training_example(example):
    checks = {
        "has_system": "system" in example,
        "has_messages": "messages" in example and len(example["messages"]) > 0,
        "alternating_roles": check_alternating_roles(example["messages"]),
        "valid_tool_calls": check_tool_calls(example["messages"]),
        "no_pii": not contains_pii(example),
        "natural_language": check_naturalness(example),
        "sport_appropriate": check_terminology(example)
    }
    
    score = sum(checks.values()) / len(checks)
    return score >= 0.9  # 90% pass rate

# Run on full dataset
valid_examples = [ex for ex in dataset if validate_training_example(ex)]
print(f"Valid: {len(valid_examples)}/{len(dataset)} ({len(valid_examples)/len(dataset)*100:.1f}%)")
```

---

## 📈 TARGET DATASET SIZE

### Minimum Viable Dataset (MVP)

- **Base functions:** 5,000 examples
- **Per sport:** 2,000 examples each × 5 sports = 10,000
- **Workflows:** 1,000 examples
- **Edge cases:** 500 examples
- **Total:** ~16,500 examples

### Production-Ready Dataset

- **Base functions:** 20,000 examples
- **Per sport:** 10,000 examples each × 5 sports = 50,000
- **Workflows:** 5,000 examples
- **Edge cases:** 2,000 examples
- **Total:** ~77,000 examples

### Optimal Dataset (Gold Standard)

- **Base functions:** 50,000 examples
- **Per sport:** 20,000 examples each × 10 sports = 200,000
- **Workflows:** 20,000 examples
- **Edge cases:** 10,000 examples
- **Total:** ~280,000 examples

---

## 🚀 DATASET GENERATION SCRIPT

```python
# generate_training_data.py

import anthropic
import json
from typing import List, Dict

client = anthropic.Anthropic(api_key="your-key")

SPORTS = ["tennis", "pilates", "yoga", "strength", "basketball"]

SCENARIOS = [
    "scheduling a new client",
    "rescheduling a session",
    "canceling a session",
    "finding available time slots",
    "adding a new client",
    "searching for a client",
    "viewing client details",
    "creating an invoice",
    "checking revenue",
    "sending a message to client",
    "generating a workout plan",
    "analyzing client progress",
    # ... 50+ more
]

def generate_example(sport: str, scenario: str) -> Dict:
    prompt = f"""
Generate a realistic training conversation for an AI assistant called GIA.

Context:
- Sport: {sport}
- Scenario: {scenario}
- GIA helps coaches manage their business and training

Format as JSON with:
- "system": System prompt for GIA
- "messages": Array of conversation messages

Include function calls where appropriate.
Make it natural and conversational.
Use {sport}-specific terminology.
"""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return json.loads(response.content[0].text)

def generate_dataset(output_file: str, examples_per_scenario: int = 20):
    dataset = []
    
    for sport in SPORTS:
        print(f"\nGenerating {sport} examples...")
        for scenario in SCENARIOS:
            print(f"  - {scenario}")
            for i in range(examples_per_scenario):
                try:
                    example = generate_example(sport, scenario)
                    dataset.append(example)
                except Exception as e:
                    print(f"    Error: {e}")
    
    # Write to JSONL
    with open(output_file, 'w') as f:
        for example in dataset:
            f.write(json.dumps(example) + '\n')
    
    print(f"\n✅ Generated {len(dataset)} examples")
    print(f"📁 Saved to {output_file}")

if __name__ == "__main__":
    generate_dataset("gia-training-data.jsonl", examples_per_scenario=20)
    # Total: 5 sports × 50 scenarios × 20 examples = 5,000 examples
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Feedback Loop

```
1. Deploy GIA with base model
2. Collect real conversations
3. Identify errors and gaps
4. Generate training data for weak areas
5. Fine-tune model
6. Deploy improved GIA
7. Repeat
```

### Monitoring

Track these metrics:
- Function calling accuracy
- Response quality ratings (1-5 stars)
- Completion rate for multi-step workflows
- User satisfaction scores
- Sport-specific terminology accuracy

---

**Start generating your dataset today!** 🚀

Begin with 100 examples per sport, test the fine-tuned model, then scale up.
