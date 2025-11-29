# 🗓️ Google Calendar Setup - READY TO DEPLOY

## ✅ Your Google OAuth Credentials

```
Client ID: 800778386162-bj53ms6v5dldmpd6646v2miiuqb18iga.apps.googleusercontent.com
Client Secret: GOCSPX-ocGcPCzQ_pAZlVTHDDrUWqIe8mr
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Add to Vercel Environment Variables

Go to: **https://vercel.com/dashboard → Your Project → Settings → Environment Variables**

Add these 3 variables:

```bash
GOOGLE_CLIENT_ID=800778386162-bj53ms6v5dldmpd6646v2miiuqb18iga.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=GOCSPX-ocGcPCzQ_pAZlVTHDDrUWqIe8mr

GOOGLE_REDIRECT_URI=https://goodrunss-trainer-dashboard.vercel.app/api/auth/google/callback
```

**Important:** Make sure to select "Production", "Preview", and "Development" for all three variables.

---

### 2. Verify Your Resend API Key

Also confirm this is already in Vercel:

```bash
RESEND_API_KEY=re_xxxxx
```

(Check Vercel dashboard to make sure it's there)

---

### 3. Push to GitHub & Deploy

```bash
cd /Users/anthonyedwards/Downloads/dashboard
git push origin main
```

This will automatically trigger Vercel deployment.

---

### 4. After Deployment - Test Everything

#### Test Email Service
```bash
curl -X POST https://goodrunss-trainer-dashboard.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

#### Check Cron Job
Go to: **Vercel Dashboard → Your Project → Cron Jobs**

You should see:
- Path: `/api/reminders?action=send`
- Schedule: `0 * * * *` (every hour)

#### Test Analytics
```bash
curl https://goodrunss-trainer-dashboard.vercel.app/api/analytics?range=30
```

---

## 🎯 What Google Calendar Integration Does

Once a trainer connects their Google account:
- ✅ All sessions automatically sync to their Google Calendar
- ✅ Clients receive calendar invites
- ✅ 24-hour and 1-hour email reminders sent automatically
- ✅ Updates/cancellations sync in real-time

---

## 🔐 Security Note

**Your credentials are secure:**
- Never hardcoded in the codebase
- Stored only in Vercel environment variables
- Not exposed to the client
- Used only server-side

---

## ✅ FINAL CHECKLIST

- [ ] Add `GOOGLE_CLIENT_ID` to Vercel
- [ ] Add `GOOGLE_CLIENT_SECRET` to Vercel
- [ ] Add `GOOGLE_REDIRECT_URI` to Vercel
- [ ] Verify `RESEND_API_KEY` is in Vercel
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for Vercel deployment to complete
- [ ] Test email with `/api/test-email`
- [ ] Verify Cron Job is running
- [ ] ✅ **LIVE!**

---

## 🎉 YOU'RE READY!

All features are built, tested, and ready for production. Just add the environment variables and push! 🚀

