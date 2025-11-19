# Gia Floating Chatbot - Deployment Guide

## ✅ What Was Built

1. **Floating Gia Chatbot**
   - Beautiful Intercom-style floating chat widget
   - Bottom-right corner on all dashboard pages
   - Minimizable and closable
   - Smooth animations and modern UI

2. **Google Gemini Integration**
   - Chat powered by Google Gemini AI
   - Context-aware responses for training questions
   - Can help generate session plans, answer questions, and provide coaching tips

3. **Removed Mock Data**
   - Cleaned up all mock data from dashboard pages
   - Calendar, Clients, Payments, Conflicts, Reminders, Exercises, Workouts, Programs
   - All pages now ready to connect to real database

4. **Removed GIA Intelligence Agents Page**
   - Deleted `/dashboard/gia` page
   - Removed from sidebar navigation
   - Replaced by floating chatbot

---

## 🚀 Deployment Steps

### Step 1: Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy your API key (starts with `AIza...`)

### Step 2: Add Environment Variable to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your **goodrunss-trainer-dashboard** project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: (paste your API key from Step 1)
   - **Apply to**: All environments (Production, Preview, Development)
5. Click **Save**

### Step 3: Push Changes to GitHub

```bash
cd /Users/anthonyedwards/Downloads/dashboard

# Stage all changes
git add -A

# Commit with a descriptive message
git commit -m "Add Gia floating chatbot, remove mock data, clean up GIA page"

# Push to GitHub
git push origin main
```

### Step 4: Deploy to Vercel

Option A: **Automatic** (if auto-deploy is enabled)
- Vercel will automatically deploy when you push to GitHub
- Check https://vercel.com/dashboard for deployment status

Option B: **Manual**
1. Go to Vercel Dashboard
2. Click your project
3. Click **"Deploy"** button
4. Wait for deployment to complete

---

## 🧪 Testing the Chatbot

Once deployed:

1. Visit your dashboard: https://goodrunss-trainer-dashboard.vercel.app/dashboard
2. Look for the **glowing purple/yellow sparkle button** in the bottom-right corner
3. Click it to open Gia
4. Try asking:
   - "Help me create a session plan for a beginner tennis player"
   - "What are some good drills for basketball?"
   - "How can I improve client retention?"

---

## 📁 Files Changed

### New Files Created:
- `components/gia-chatbot.tsx` - Floating chatbot component
- `app/api/gia/chat/route.ts` - Gemini AI chat endpoint
- `GIA_CHATBOT_DEPLOYMENT.md` - This file

### Files Modified:
- `app/client-layout.tsx` - Added `<GiaChatbot />` component
- `components/sidebar.tsx` - Removed GIA link
- `.env` - Added `GOOGLE_GEMINI_API_KEY` placeholder

### Files Deleted:
- `app/dashboard/gia/page.tsx` - Old GIA Intelligence Agents page

### Mock Data Cleaned:
- `app/dashboard/calendar/page.tsx`
- `app/dashboard/clients/page.tsx`
- `app/dashboard/clients/[id]/page.tsx`
- `app/dashboard/payments/page.tsx`
- `app/dashboard/conflicts/page.tsx`
- `app/dashboard/reminders/page.tsx`
- `app/dashboard/exercises/page.tsx`
- `app/dashboard/workouts/page.tsx`
- `app/dashboard/programs/page.tsx`

---

## 💬 Chatbot Features

Gia can help trainers with:
- ✅ Generate training session plans
- ✅ Answer coaching questions
- ✅ Provide exercise recommendations
- ✅ Offer business growth tips
- ✅ Explain platform features
- ✅ Create content ideas

---

## 🎨 Customization (Optional)

### Change Chatbot Position
Edit `components/gia-chatbot.tsx`:
```tsx
// Change bottom-6 right-6 to your preferred position
className="fixed bottom-6 right-6 ..."
```

### Change AI Model
Edit `app/api/gia/chat/route.ts`:
```typescript
// Current: gemini-pro
// Options: gemini-pro, gemini-1.5-pro, gemini-1.5-flash
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
```

### Customize System Prompt
Edit `app/api/gia/chat/route.ts` line ~27:
```typescript
const systemPrompt = `You are Gia, an AI assistant for trainers...`
```

---

## 🐛 Troubleshooting

### Chatbot doesn't appear
- Check browser console for errors
- Verify `<GiaChatbot />` is in `app/client-layout.tsx`
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### "Failed to process message" error
- Check `GOOGLE_GEMINI_API_KEY` is set in Vercel
- Verify API key is valid at https://makersuite.google.com/app/apikey
- Check Vercel function logs for errors

### Chatbot button looks wrong
- Check Tailwind CSS is building correctly
- Verify `tailwind.config.js` includes `/components/**/*.tsx`

---

## 📊 Next Steps

1. **Connect Real Data**: Replace empty mock arrays with Prisma queries
2. **Add Clerk Auth**: Enable user-specific data in API routes
3. **Enhanced Features**: Add voice chat, file uploads, or session plan generation directly in chat
4. **Analytics**: Track chatbot usage and popular questions

---

## 🎉 You're Done!

The floating Gia chatbot is now live on your dashboard. Trainers can click the sparkle button anytime to get AI-powered help!

**Questions?** Just ask Gia! 😊


