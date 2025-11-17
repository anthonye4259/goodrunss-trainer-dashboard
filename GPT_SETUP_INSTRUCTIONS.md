# ChatGPT GPT Setup Instructions

## Step 1: Generate API Key

First, you need to set an API key in your Vercel environment:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add a new variable:
   - **Name**: `GPT_API_KEY`
   - **Value**: Generate a secure random string (e.g., `gpt_sk_your_random_secure_key_here`)
   - Save it

3. Redeploy your app for the env var to take effect

**Save this API key** - you'll need it when creating the GPT!

---

## Step 2: Create the GPT in ChatGPT

1. Go to https://chatgpt.com/gpts/editor
2. Click "Create a GPT"
3. Switch to "Configure" tab

### **Name**
```
Gia - GoodRunss Trainer Assistant
```

### **Description**
```
AI assistant for trainers on GoodRunss. Manage clients, create session plans, and grow your training business.
```

### **Instructions**
```
You are Gia, an AI assistant for trainers and instructors on the GoodRunss platform. Your role is to help trainers manage their training business efficiently.

Core capabilities:
- Generate personalized training session plans for clients
- Retrieve and display client lists and information
- View upcoming bookings and available time slots
- Provide business insights and recommendations

When trainers ask you to:
1. "Create a session plan" → Use generateSessionPlan with client details
2. "Show my clients" → Use getClients to display their client list
3. "What's my schedule?" → Use getSchedule to show upcoming bookings

Always:
- Be encouraging and professional
- Ask for missing information (clientName, sport, level, trainerId)
- Confirm details before taking actions
- Format session plans in a clear, easy-to-read way
- Highlight key information like client goals and upcoming sessions

The trainerId is: "demo-trainer" (use this for now - in production, trainers will authenticate)

When generating session plans:
- Include warm-up, main drills, and cooldown
- Provide rep counts and timing
- Add coaching tips in the notes
- Generate a ready-to-post Instagram caption
- Create a personalized message for the client

Be conversational, helpful, and treat trainers like business partners. You're here to save them time and help them deliver amazing training experiences.
```

### **Conversation Starters**
```
1. "Create a tennis session plan for a beginner client"
2. "Show me my client list"
3. "What's on my schedule this week?"
4. "Generate a session plan for an intermediate basketball player"
```

### **Actions**

1. Click "Create new action"
2. Click "Import from URL"
3. Enter: `https://goodrunss-trainer-dashboard.vercel.app/gpt-openapi.json`
4. Click "Import"

### **Authentication**

1. After importing the schema, go to "Authentication"
2. Select "API Key"
3. Auth Type: **Custom**
4. Custom Header Name: `x-api-key`
5. API Key: **[Paste your GPT_API_KEY from Step 1]**

### **Privacy**
- Set to "Only you" for now (testing)
- Later, change to "Anyone with a link" when ready to share

---

## Step 3: Test the GPT

Once created, test these commands:

1. **"Create a tennis session plan for Sarah, a beginner"**
   - Should call generateSessionPlan
   - Return a full session plan with drills

2. **"Show my clients"**
   - Should call getClients
   - Display client list

3. **"What's my schedule this week?"**
   - Should call getSchedule
   - Show upcoming bookings

---

## Step 4: Update trainerId Logic (Later)

Currently using "demo-trainer" as hardcoded trainerId.

**For production:**
1. Add Clerk authentication to the GPT endpoints
2. Have trainers authenticate via OAuth
3. Pass their real trainerId in requests
4. Each trainer gets their own data

---

## Troubleshooting

**"Unauthorized" errors:**
- Check that GPT_API_KEY is set in Vercel env vars
- Verify the API key in GPT settings matches exactly
- Redeploy the app after adding env vars

**"Actions not working":**
- Verify the OpenAPI schema imported successfully
- Check that the base URL is: `https://goodrunss-trainer-dashboard.vercel.app`
- Test the endpoints directly with curl first

**Test endpoint manually:**
```bash
curl -X POST https://goodrunss-trainer-dashboard.vercel.app/api/gpt/session-plan \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "clientName": "Test Client",
    "clientLevel": "beginner",
    "sport": "tennis",
    "trainerId": "demo-trainer"
  }'
```

---

## Next Steps

Once the GPT is working:

1. **Share with beta testers**
   - Change privacy to "Anyone with a link"
   - Give link to early access trainers

2. **Add to your Framer site**
   - "Chat with Gia" button
   - Links to the GPT

3. **Expand capabilities**
   - Add booking creation
   - Add client messaging
   - Add analytics queries

4. **Production auth**
   - Implement OAuth flow
   - Real trainerId per user
   - Secure API keys per trainer

---

## Marketing Copy for Your Site

**"Manage Your Training Business from ChatGPT"**

With Gia in ChatGPT, you can:
- Generate session plans in seconds: "Create a tennis plan for Sarah"
- Check your schedule: "What's my week look like?"
- View client info: "Show me all my intermediate clients"
- Get business insights: "How's my client retention?"

All without leaving ChatGPT. [Try Gia Now →]

---

🎉 **Your ChatGPT GPT is ready to build!**

Follow these steps and you'll have Gia live in ChatGPT within 15 minutes.

