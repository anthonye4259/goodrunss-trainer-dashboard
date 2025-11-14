# ⚡ Quick Start Guide - GoodRunss Referral System

**Get up and running in 5 minutes!**

---

## 🚀 3-Step Setup

### Step 1: Add Your Resend API Key

Open your `.env` file and add:

```bash
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

RESEND_FROM_EMAIL=GoodRunss <noreply@goodrunss.com>
RESEND_REPLY_TO_EMAIL=hello@goodrunss.com

# For development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, change to:
# NEXT_PUBLIC_APP_URL=https://goodrunss.com
```

**Don't have a Resend account?**
1. Go to https://resend.com
2. Sign up (free tier is generous)
3. Verify your email domain
4. Create an API key
5. Paste it above

---

### Step 2: Run Setup Script

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard

# Make script executable
chmod +x SETUP_REFERRAL_SYSTEM.sh

# Run setup
./SETUP_REFERRAL_SYSTEM.sh
```

This will:
- ✅ Install dependencies
- ✅ Run database migration
- ✅ Generate Prisma client
- ✅ Check your environment setup

---

### Step 3: Start Development Server

```bash
npm run dev
```

---

## 🎯 Access Your Pages

Once the server is running:

### 🌐 **Landing Page** (Public)
```
http://localhost:3000/waitlist
```
- Beautiful signup form
- Referral code display
- Social sharing buttons
- Mobile responsive

### 📊 **Admin Dashboard** (Protected*)
```
http://localhost:3000/admin/waitlist
```
- Real-time analytics
- Top referrers leaderboard
- CSV export
- Filter and sort

*Note: Add authentication before deploying to production!

---

## 📧 Email Setup (Resend)

### Why Resend?
- **Easy to use** - Simple API
- **Generous free tier** - 100 emails/day free forever
- **Great deliverability** - High inbox rates
- **Beautiful templates** - Your emails will look professional

### Get Your API Key:

1. **Sign up**: https://resend.com
2. **Verify domain**: Settings → Domains → Add your domain
3. **Create API key**: API Keys → Create API Key
4. **Copy to .env**: Paste in `RESEND_API_KEY`

### Free Tier Includes:
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ Full API access
- ✅ Email logs
- ✅ Webhooks

**Perfect for pre-launch!** Upgrade when you scale.

---

## 🎁 How It Works

### For Users:

1. **Visit** `/waitlist`
2. **Enter email** and sign up
3. **Get unique code** (e.g., `GOODRUNSS-ALEX-K8M2`)
4. **Share code** via social media or email
5. **Earn rewards** as friends join

### For You:

1. **Share** your waitlist page
2. **Watch signups** roll in
3. **Monitor progress** in admin dashboard
4. **Export emails** when ready to launch
5. **Reward top referrers** with promised perks

---

## 🎖️ Reward Tiers

| Tier | Referrals | Reward |
|------|-----------|--------|
| 🥉 Bronze | 0-2 | Early access |
| 🥈 Silver | 3-9 | **+1 month free** |
| 🥇 Gold | 10-24 | **+3 months free** |
| 💎 Platinum | 25+ | **+1 year free + VIP** |

---

## 📱 Share Your Waitlist

Once live, share your waitlist page everywhere:

```
https://goodrunss.com/waitlist
```

### Channels:
- 🐦 Twitter/X
- 📘 Facebook
- 💼 LinkedIn
- 📸 Instagram (link in bio)
- 🎥 TikTok (link in bio)
- 💬 WhatsApp groups
- ✉️ Email newsletter
- 💬 Discord/Slack communities
- 📝 Blog posts
- 🎙️ Podcast mentions

---

## 🧪 Test It Out

### 1. Test Signup
```bash
curl -X POST http://localhost:3000/api/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "userType": "player"
  }'
```

### 2. Test with Referral
Visit in browser:
```
http://localhost:3000/waitlist?ref=GOODRUNSS-TEST-X7K2
```

### 3. Check Stats
```bash
curl http://localhost:3000/api/waitlist/stats?code=YOUR_CODE_HERE
```

### 4. View Admin Dashboard
```
http://localhost:3000/admin/waitlist
```

---

## 🔧 Customize

### Change Reward Tiers

Edit `src/lib/referral-utils.ts`:

```typescript
export const REWARD_TIERS: ReferralTier[] = [
  {
    name: 'bronze',
    minReferrals: 0,
    maxReferrals: 2,
    freeMonths: 0,  // ← Change this
    // ... other settings
  },
  // ... add more tiers
];
```

### Customize Emails

Edit `src/lib/email/referral-email-templates.ts` to change:
- Colors
- Text/copy
- Layout
- Branding

### Change Landing Page

Edit `src/app/waitlist/page.tsx` to customize:
- Hero text
- Colors/design
- Form fields
- Benefits section

---

## 📊 Track Your Growth

### Key Metrics to Watch:

1. **Total Signups** - How many people joined
2. **Referral Rate** - Average referrals per user
3. **Viral Coefficient** - How fast you're growing
4. **Top Referrers** - Your biggest advocates
5. **Tier Distribution** - User engagement level

All visible in `/admin/waitlist`!

---

## 🚨 Before Going Live

### Production Checklist:

- [ ] Add Resend API key to production `.env`
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Verify email domain in Resend
- [ ] Test email sending in production
- [ ] Add authentication to admin dashboard
- [ ] Set up database backups
- [ ] Test landing page on mobile devices
- [ ] Verify all social share links work
- [ ] Set up monitoring/alerts

---

## 📖 Full Documentation

For detailed information:

- **📘 Complete Guide**: `🎉_REFERRAL_SYSTEM_COMPLETE.md`
- **🔌 API Reference**: `REFERRAL_API_REFERENCE.md`
- **🔄 Flow Diagrams**: `REFERRAL_SYSTEM_FLOW.md`
- **📦 File List**: `📦_FILES_CREATED_SUMMARY.md`

---

## 💡 Pro Tips

### 1. **Create Urgency**
- "Join 10,000+ people on the waitlist"
- "Launching in 30 days"
- "Limited spots available"

### 2. **Showcase Benefits**
- Show what users will get
- Highlight the problem you solve
- Use testimonials (if you have them)

### 3. **Make Sharing Easy**
- One-click social sharing
- Pre-written message templates
- Show progress to next reward tier

### 4. **Reward Top Referrers**
- Give extra perks to platinum tier
- Feature them on your site
- Early product feedback access

### 5. **Build Anticipation**
- Send progress updates
- Share behind-the-scenes
- Tease features

---

## 🎉 You're Ready!

Your complete pre-launch referral system is ready to help you:

✅ Build hype before launch  
✅ Grow your email list virally  
✅ Identify your biggest advocates  
✅ Create FOMO and urgency  
✅ Gather market validation  

**Now go share your waitlist and watch it grow! 🚀**

---

## 🆘 Need Help?

- Review the documentation files
- Check the code comments
- Email implementation details are in `/src/lib/email/`
- API routes are in `/src/app/api/waitlist/`

---

**Made with ❤️ for GoodRunss** 🏃‍♂️

*Train Smarter. Connect Better.*









