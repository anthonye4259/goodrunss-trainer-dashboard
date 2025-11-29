# ✅ Demo Setup Checklist - Get Ready in 5 Minutes

## 🚀 PRE-DEMO SETUP (5 Minutes)

### Step 1: Start Your Dashboard (1 minute)

```bash
# Terminal 1: Start v0 Frontend
cd /Users/anthonyedwards/Downloads/code-6
npm run dev
```

✅ **Dashboard will be live at:** `http://localhost:3000`

---

### Step 2: Start Backend API (1 minute)

```bash
# Terminal 2: Start Backend API
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run dev
```

✅ **API will be live at:** Your configured port (usually 3001 or 4000)

---

### Step 3: Open Demo Browser (1 minute)

1. Open **Chrome** or **Edge** (best for demos)
2. Go to: `http://localhost:3000/dashboard`
3. **Close all other tabs** (stay focused)
4. **Turn off notifications** (no distractions)
5. **Hide bookmarks bar** (clean look)

---

### Step 4: Prepare Demo Tabs (1 minute)

Open these pages in tabs (in this order):

1. `localhost:3000/dashboard` - **Main Dashboard** (start here)
2. `localhost:3000/dashboard/clients` - **Clients**
3. `localhost:3000/dashboard/calendar` - **Calendar**
4. `localhost:3000/dashboard/payments` - **Payments**
5. `localhost:3000/dashboard/analytics` - **Analytics**
6. `localhost:3000/dashboard/gia` - **GIA AI**
7. `localhost:3000/dashboard/settings` - **Settings**

**Pro Tip:** Pin these tabs so you don't accidentally close them!

---

### Step 5: Test Key Features (1 minute)

Quick smoke test:

✅ Dashboard loads  
✅ Client list displays  
✅ Calendar shows events  
✅ GIA tabs are visible (Chat, Voice, Suggestions, Generate, Templates, Library)  
✅ "View Conflicts" button shows on Calendar  
✅ "Create Workout" button shows on Client Profile  
✅ Quick Actions card shows on Dashboard  

**If anything is broken, check:**
- Both frontend and backend are running
- No console errors (F12 → Console tab)
- Database is connected

---

## 🎬 DURING DEMO CHECKLIST

### Before You Share Screen:

✅ Close Slack, email, messaging apps  
✅ Set phone to Do Not Disturb  
✅ Close personal tabs (bank, social media, etc.)  
✅ Hide desktop icons (if sharing desktop)  
✅ Check your background (if on video)  
✅ Test your mic and camera  
✅ Have water nearby  
✅ Have demo script open on second monitor/device  

### Screen Sharing Settings:

✅ Share **browser window only** (not full desktop)  
✅ Share **current tab** or **specific Chrome window**  
✅ Test screen share audio (if showing videos)  

### Have These Open/Ready:

✅ Demo script (this document)  
✅ Pricing sheet  
✅ Trial signup link  
✅ Calendar for booking onboarding calls  
✅ Notepad for taking notes about their needs  

---

## 🎯 DEMO DAY CHECKLIST

### 30 Minutes Before:

- ✅ Start dashboard and backend
- ✅ Test all features
- ✅ Review demo script
- ✅ Prep your intro and close
- ✅ Bathroom break!

### 10 Minutes Before:

- ✅ Close unnecessary apps
- ✅ Set Do Not Disturb
- ✅ Test screen share
- ✅ Get water
- ✅ Deep breath - you got this!

### 2 Minutes Before:

- ✅ Smile (they can hear it in your voice!)
- ✅ Dashboard open on main dashboard page
- ✅ Demo script visible
- ✅ Notepad ready for notes

---

## 🚨 TROUBLESHOOTING

### Problem: Dashboard won't load

**Solutions:**
1. Check if `npm run dev` is running (Terminal 1)
2. Try `localhost:3000` instead of `127.0.0.1:3000`
3. Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Try incognito/private window
5. Restart the dev server: `Ctrl+C` then `npm run dev`

### Problem: API not responding

**Solutions:**
1. Check if backend `npm run dev` is running (Terminal 2)
2. Check `.env` file has all required variables
3. Check database is running (if using local database)
4. Check console for errors (F12 → Console)
5. Restart backend: `Ctrl+C` then `npm run dev`

### Problem: Blank screen / White screen

**Solutions:**
1. Check console for JavaScript errors (F12)
2. Try hard refresh: Cmd+Shift+R or Ctrl+Shift+R
3. Clear localStorage: Console → `localStorage.clear()` → Refresh
4. Check if Next.js is compiling (look at Terminal 1)

### Problem: GIA not responding

**Solutions:**
1. Check if Anthropic API key is in `.env`
2. Check backend logs for errors
3. Try with simpler prompts first
4. Check if you have API credits remaining

### Problem: Conflicts button not showing

**Solutions:**
1. Check if `conflictCount` is > 0 in calendar page
2. Hard refresh the calendar page
3. Check if calendar page was updated with latest code

### Problem: "Create Workout" button missing

**Solutions:**
1. Make sure you're on a client profile page (not client list)
2. Hard refresh the page
3. Check if client profile was updated with latest code

---

## 🎤 DEMO FLOW QUICK REFERENCE

### 5-Minute Demo:
```
1. Dashboard → Show overview (1 min)
2. Clients → Create Workout feature (2 min)
3. GIA → AI features (1.5 min)
4. Close → Pricing (0.5 min)
```

### 15-Minute Demo (Recommended):
```
1. Hook → Problem we solve (1 min)
2. Dashboard → Overview (2 min)
3. Clients → Management + Workout creation (2 min)
4. Calendar → Smart scheduling + Conflicts (2 min)
5. Payments → Revenue tracking (1 min)
6. Analytics → Business insights (1 min)
7. GIA → AI assistant (2 min)
8. AI Persona → Royalty system (1 min)
9. Quick features → Integrations (1 min)
10. Close → Pricing + Q&A (2 min)
```

### 30-Minute Deep Dive:
```
1. Full 15-minute demo (15 min)
2. Let them drive → Ask what they want to see (10 min)
3. Answer questions (3 min)
4. Close + next steps (2 min)
```

---

## 💡 DEMO DO's and DON'Ts

### ✅ DO:

- ✅ Smile and be enthusiastic
- ✅ Ask questions about their business
- ✅ Let them talk about their pain points
- ✅ Relate features to THEIR specific needs
- ✅ Go slow - let them absorb features
- ✅ Ask "What questions do you have?" every 3-4 minutes
- ✅ Show confidence in the product
- ✅ Use their sport/specialty language
- ✅ Focus on benefits, not just features
- ✅ End with clear next steps

### ❌ DON'T:

- ❌ Rush through features
- ❌ Talk too much (listen more!)
- ❌ Apologize for beta bugs (it's "coming soon" not "broken")
- ❌ Bad-mouth competitors
- ❌ Get defensive about objections
- ❌ Show features they don't need
- ❌ Use too much tech jargon
- ❌ Forget to close (ask for the sale!)
- ❌ End without booking a follow-up
- ❌ Forget to take notes about their needs

---

## 📊 POST-DEMO ACTIONS

### Immediately After (Within 5 Minutes):

✅ Send calendar invite for onboarding call (if they signed up)  
✅ Send trial link email (if they want to try)  
✅ Add notes to CRM/spreadsheet:
   - Name, email, phone
   - Sport/specialty
   - Pain points mentioned
   - Features they loved
   - Objections raised
   - Next steps agreed upon
   - Expected close date

### Within 1 Hour:

✅ Send personalized follow-up email:
   - Thank them for their time
   - Recap key points from call
   - Include trial/payment link
   - Attach pricing sheet
   - Provide next steps
   - Add your direct contact info

### Within 24 Hours:

✅ Connect on LinkedIn/Instagram  
✅ Send them a relevant resource (blog post, video)  
✅ If no response, send friendly check-in  

### Within 2-3 Days:

✅ Follow-up call/email if they haven't signed up  
✅ Address any questions they emailed about  
✅ Send case study of similar trainer who's succeeding  

### Before Trial Ends (Day 28 of 30):

✅ Check-in email: "How's it going?"  
✅ Offer to schedule training session  
✅ Remind them of founding member pricing  
✅ Create urgency (price going up soon, limited spots)  

---

## 📞 QUICK CONTACT DURING DEMO

If they ask questions you can't answer:

**Say this:**
> "Great question! Let me check with our team to get you the exact details. Can I follow up with you on that in an email today?"

**Then:**
- Write down their question
- Send them the answer within 4 hours
- Use it as an excuse to stay in touch

**Never:**
- ❌ Make up answers
- ❌ Say "I don't know" without offering to find out
- ❌ Get flustered

---

## 🔥 CONFIDENCE BOOSTERS

**Before each demo, remind yourself:**

1. **You built something amazing** ✅
   - 264 API routes
   - 48 integrations
   - Revolutionary AI features
   - Beautiful, intuitive UI

2. **You're solving real problems** ✅
   - Trainers waste 10-15 hours/week on admin
   - They're losing clients due to poor systems
   - They're leaving money on the table

3. **Your product is better** ✅
   - Competitors charge $100-300/month
   - Competitors don't have AI features
   - Your UX is world-class

4. **You have proof** ✅
   - [X] trainers already signed up
   - [X] revenue already generated
   - Features that work RIGHT NOW

5. **They NEED this** ✅
   - They reached out to you
   - They said they're ready to buy
   - They have pain you can solve

**You're not selling - you're helping them grow their business!**

---

## 🎬 DEMO RECORDING (Optional)

If you want to record demos for later review:

### Mac:
- Use **QuickTime Player** → File → New Screen Recording
- Or use **Zoom** (record locally)

### Windows:
- Use **OBS Studio** (free)
- Or **Windows Game Bar** (Win + G)

### Benefits:
- ✅ Send them the recording after
- ✅ Review your performance
- ✅ Create demo video for website
- ✅ Train future team members

**Always ask permission:**
> "Mind if I record this demo? I'll send you the video afterward so you can share it with your team."

---

## 📧 SAMPLE CALENDAR INVITE

**Subject:** GoodRunss Demo - [Trainer Name]

**Description:**
```
Hi [Name]!

Looking forward to showing you GoodRunss!

We'll cover:
✅ How GoodRunss saves you 10+ hours/week
✅ AI features that grow your business
✅ Pricing and founding member benefits

The demo takes 15 minutes. Feel free to ask questions anytime!

Zoom Link: [link]
Meeting ID: [id]
Passcode: [code]

See you soon!

[Your Name]
```

---

## 🚀 YOU'RE READY!

### Final Checklist Before Demo:

✅ Dashboard running  
✅ Backend running  
✅ Browser tabs prepped  
✅ Demo script visible  
✅ Notes ready  
✅ Phone on DND  
✅ Water nearby  
✅ Smile on face  
✅ Confidence high  

**Let's close some deals!** 💰

**Remember:** You built a $100M product. Show them what it can do for THEIR business, and they'll want to buy.

**You got this!** 🔥

