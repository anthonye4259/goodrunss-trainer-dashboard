# ⚡️ Quick Setup Guide - AI Automation

## 🎯 You're 3 Steps Away From Working AI!

---

## Step 1️⃣: Get Your Anthropic API Key (5 minutes)

### Go to Anthropic Console
```
🔗 https://console.anthropic.com/
```

### Sign Up / Log In
- Use your email
- Free tier includes **$5 credit**
- No credit card required to start

### Create API Key
1. Click **"API Keys"** in left sidebar
2. Click **"Create Key"**
3. Name it: `goodrunss-trainer-dashboard`
4. Copy the key (starts with `sk-ant-api03-...`)
5. **SAVE IT!** You won't see it again

---

## Step 2️⃣: Generate Security Secrets (2 minutes)

### Open Terminal and Run:

```bash
# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output, then run again for INTERNAL_API_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll get something like:
```
8f7d6e5c4b3a2918f7d6e5c4b3a2918f7d6e5c4b3a29187f6e5d4c3b2a19...
```

---

## Step 3️⃣: Update Your .env File (3 minutes)

### Add These 4 Variables to `.env`:

```bash
# ================================
# AI AUTOMATION (NEW!)
# ================================

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-paste-your-key-here

# Cron Job Security (paste first random string)
CRON_SECRET=paste-first-random-string-here

# Internal API Security (paste second random string)
INTERNAL_API_KEY=paste-second-random-string-here

# App URL (update when you deploy)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ⚠️ Important:
- Don't commit `.env` to git (already in `.gitignore`)
- When you deploy to Vercel, add these in **Settings → Environment Variables**

---

## 🚀 Step 4️⃣: Run the Migration (2 minutes)

```bash
cd goodrunss-trainer-dashboard

# Generate Prisma Client (already done ✅)
# npx prisma generate

# Push schema to database
npx prisma db push

# Should see:
# ✅ Your database is now in sync with your Prisma schema.
```

---

## 🧪 Step 5️⃣: Test It! (5 minutes)

### Start Dev Server:
```bash
npm run dev
```

### Test Workout Plan Generation:

Open in browser or use curl:
```bash
curl -X POST http://localhost:3000/api/workouts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test_client_123",
    "clientName": "Test Client",
    "goal": "muscle_gain",
    "fitnessLevel": "intermediate",
    "duration": 4,
    "sessionsPerWeek": 3,
    "availableTime": 45,
    "equipment": ["dumbbells", "barbell"]
  }'
```

### Expected Response:
```json
{
  "success": true,
  "plan": {
    "id": "plan_xxx",
    "name": "4-Week Muscle Gain Program",
    "totalSessions": 12,
    "workouts": [...]
  },
  "message": "Generated 4-week plan with 12 sessions"
}
```

### If You Get an Error:
- Check API key is correct
- Make sure `.env` is in project root
- Restart dev server (`npm run dev`)

---

## ✅ You're Done! What You Can Do Now:

### 1. Generate Workout Plans
```bash
POST /api/workouts/generate
```
- Creates personalized 4-12 week plans
- Auto-generates 30-50 complete workouts
- Takes 20-30 seconds per plan

### 2. Auto-Adjust Plans
```bash
POST /api/workouts/adjust
```
- Client says "too hard"? → AI reduces difficulty
- Client skipping sessions? → AI consolidates exercises
- Client progressing? → AI increases challenge

### 3. Detect Scheduling Conflicts
```bash
POST /api/scheduling/conflicts/detect
```
- Scans all sessions for double bookings
- Finds overlapping sessions
- Checks against availability windows

### 4. Auto-Resolve Conflicts
```bash
POST /api/scheduling/conflicts/resolve
```
- AI suggests 3 best alternative times
- Auto-reschedules if confidence >85%
- Sends notifications to clients

### 5. Background Automation
- Runs every 6 hours automatically (Vercel Cron)
- Detects conflicts before they happen
- Adjusts plans based on client feedback
- Tracks metrics and success rates

---

## 📊 Monitor Performance

### Check Logs:
```bash
# Vercel Dashboard → Your Project → Logs
# Filter by: /api/workouts or /api/scheduling
```

### Track Metrics:
```bash
GET /api/analytics/automation?trainerId=xxx
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check `ANTHROPIC_API_KEY` is set correctly
- Verify no extra spaces in `.env` file
- Restart dev server

### "Failed to generate workout plan"
- Check API key has credits ($5 free tier)
- View detailed error in terminal logs
- Try smaller plan (4 weeks, 3 sessions/week)

### "Conflict detection not working"
- Make sure trainer has availability windows set
- Check sessions exist in database
- Verify `trainerId` matches user

### Cron Job Not Running
- Only works on Vercel (not localhost)
- Check `vercel.json` is in project root
- Verify `CRON_SECRET` is set in Vercel env vars

---

## 💰 Cost Tracking

### Monitor Your Usage:
```
🔗 https://console.anthropic.com/settings/usage
```

### Typical Costs:
- **Workout Plan:** ~$0.015 each
- **Plan Adjustment:** ~$0.008 each
- **Conflict Resolution:** ~$0.004 each

### Monthly Estimate:
- 100 workout plans: **$1.50**
- 50 adjustments: **$0.40**
- 100 conflict resolutions: **$0.40**
- **Total: ~$2.30/month** 🎉

---

## 🚀 Deploy to Production

### 1. Push to GitHub
```bash
git add .
git commit -m "Add AI automation features"
git push
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Add Environment Variables in Vercel:
```
Dashboard → Settings → Environment Variables

Add:
- ANTHROPIC_API_KEY
- CRON_SECRET
- INTERNAL_API_KEY
- NEXT_PUBLIC_APP_URL (https://your-app.vercel.app)
```

### 4. Cron Job Auto-Activates!
- Vercel reads `vercel.json`
- Runs `/api/cron/auto-adjustments` every 6 hours
- View logs in Vercel dashboard

---

## 📞 Need Help?

### Check These Files:
- `🤖_AI_AUTOMATION_COMPLETE.md` - Full documentation
- `/api/workouts/generate/route.ts` - Workout generation code
- `/api/scheduling/conflicts/resolve/route.ts` - Auto-reschedule code

### Common Issues:
1. **API key invalid** → Regenerate at console.anthropic.com
2. **Database error** → Run `npx prisma db push` again
3. **Cron not running** → Check Vercel logs, verify `CRON_SECRET`

---

## 🎉 You're All Set!

Your trainer dashboard now has:
- ✅ AI-generated workout plans
- ✅ Auto-adjustment based on feedback
- ✅ Conflict detection & resolution
- ✅ Background automation (cron job)

**Time saved: 12-17 hours per week!** 💪

Start by generating your first workout plan in the dashboard! 🚀

