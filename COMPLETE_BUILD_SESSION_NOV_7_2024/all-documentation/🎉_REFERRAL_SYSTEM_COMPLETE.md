# 🎉 Pre-Launch Referral System - Complete!

## Overview

Your complete pre-launch referral system is ready! This includes automated code generation, email invitations, social sharing, reward tracking, and an admin dashboard.

---

## 📁 What Was Built

### 1. **Database Models** (Prisma Schema)
- `WaitlistSignup` - Store emails, referral codes, and tracking data
- `ReferralRewardTier` - Configurable reward tiers
- `ReferralEvent` - Track all referral activities

### 2. **API Endpoints**
- `POST /api/waitlist/signup` - Join waitlist with referral code
- `GET /api/waitlist/stats?code=XXX` - Get referral stats
- `POST /api/waitlist/share` - Track social shares
- `POST /api/waitlist/send-invites` - Send email invitations
- `GET /api/admin/waitlist` - Admin dashboard data
- `POST /api/admin/waitlist` - Export CSV

### 3. **Pages**
- `/waitlist` - Beautiful landing page with signup form
- `/admin/waitlist` - Admin dashboard with full analytics

### 4. **Components**
- `ShareButtons` - Social media sharing component
- `ReferralStats` - Display referral progress and rewards

### 5. **Utilities**
- Automatic referral code generation
- Tier calculation and rewards
- Social share URL generation

### 6. **Email Templates**
- Welcome email with referral code
- Referral invite email
- Milestone achievement email

---

## 🚀 Quick Start

### 1. Set Up Environment Variables

Add to your `.env` file:

```bash
# Resend API (for emails)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=GoodRunss <noreply@goodrunss.com>
RESEND_REPLY_TO_EMAIL=hello@goodrunss.com

# App URL
NEXT_PUBLIC_APP_URL=https://goodrunss.com
```

### 2. Run Database Migration

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma migrate dev --name add_waitlist_referral_system
npx prisma generate
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Access the Pages

- **Landing Page**: http://localhost:3000/waitlist
- **Admin Dashboard**: http://localhost:3000/admin/waitlist

---

## 🎁 Reward Tiers

The system has 4 default tiers (fully customizable):

| Tier | Referrals | Rewards |
|------|-----------|---------|
| 🥉 **Bronze** | 0-2 | Early access |
| 🥈 **Silver** | 3-9 | 1 month free + early access |
| 🥇 **Gold** | 10-24 | 3 months free + early access |
| 💎 **Platinum** | 25+ | 1 year free + VIP status |

---

## 📧 Email Integration

The system uses **Resend** to send:

1. **Welcome Email** - Sent automatically on signup with referral code
2. **Referral Invites** - Users can invite friends via email
3. **Milestone Emails** - Sent when users reach new tiers

All emails are professionally branded with your GoodRunss design.

---

## 🔗 How It Works

### For Users:

1. **Sign Up** → Visit `/waitlist` and enter email
2. **Get Code** → Receive unique code (e.g., `GOODRUNSS-ALEX-K8M2`)
3. **Share** → Share via email, Twitter, Facebook, WhatsApp, LinkedIn
4. **Earn Rewards** → Get free months based on referral count

### For You (Admin):

1. **View Stats** → Go to `/admin/waitlist`
2. **Track Growth** → See signups, referrals, top performers
3. **Export Data** → Download CSV of all emails
4. **Monitor Tiers** → See how users are progressing

---

## 📊 Admin Dashboard Features

- **Real-time Stats** - Total signups, referrals, user types
- **Top Referrers Leaderboard** - See who's referring the most
- **Filter & Sort** - Filter by user type (player/trainer/facility)
- **Export CSV** - Download complete waitlist with one click
- **Trend Analytics** - Daily signup graphs (last 30 days)

---

## 🌐 Social Sharing

Users can share their referral code on:

- ✉️ **Email** (pre-filled template)
- 🐦 **Twitter/X**
- 📘 **Facebook**
- 💼 **LinkedIn**
- 💬 **WhatsApp**
- 📋 **Copy Link** (one-click copy)

Every share is tracked for analytics.

---

## 🛠️ Customization

### Change Reward Tiers

Edit `/src/lib/referral-utils.ts`:

```typescript
export const REWARD_TIERS: ReferralTier[] = [
  {
    name: 'bronze',
    minReferrals: 0,
    maxReferrals: 2,
    freeMonths: 0,
    // ... customize here
  },
  // ... add more tiers
];
```

### Customize Email Templates

Edit `/src/lib/email/referral-email-templates.ts` to change:
- Colors
- Copy/messaging
- Layout
- Branding

### Add Authentication to Admin

Add auth middleware in `/src/app/api/admin/waitlist/route.ts`:

```typescript
// Check if user is admin
const session = await getServerSession();
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 📈 Tracking & Analytics

### What Gets Tracked:

- Every signup (with source, UTM params, IP, user agent)
- Every referral conversion
- Every social share (platform + URL)
- Email opens (via Resend webhooks)
- Tier progressions
- User engagement metrics

### Access Analytics:

All data is stored in PostgreSQL and accessible via:
- Admin dashboard UI
- Direct database queries
- CSV exports

---

## 🎨 Landing Page Features

The `/waitlist` page includes:

- ✅ Clean, modern design with gradients
- ✅ Mobile responsive
- ✅ Real-time referral code display
- ✅ Progress bars showing tier advancement
- ✅ Social sharing buttons
- ✅ Success state with full dashboard
- ✅ Referral code pre-fill from URL params

---

## 🔑 API Usage Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/api/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "player",
    "referredBy": "GOODRUNSS-ALEX-K8M2"
  }'
```

### Get Stats

```bash
curl http://localhost:3000/api/waitlist/stats?code=GOODRUNSS-ALEX-K8M2
```

### Track Share

```bash
curl -X POST http://localhost:3000/api/waitlist/share \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "GOODRUNSS-ALEX-K8M2",
    "platform": "twitter"
  }'
```

---

## 🚨 Before Going Live

### 1. Add Your Resend API Key
Get it from: https://resend.com/api-keys

### 2. Configure Email Domain
Verify your domain in Resend dashboard

### 3. Add Admin Authentication
Protect `/admin/waitlist` with auth middleware

### 4. Update App URL
Set `NEXT_PUBLIC_APP_URL` to your production domain

### 5. Test Email Sending
Send test emails to ensure Resend is working

### 6. Set Up Database Backups
Important for production data safety

---

## 🎯 Next Steps

1. **Run the migration** (see Quick Start above)
2. **Add your Resend API key** to `.env`
3. **Test the landing page** at `/waitlist`
4. **Share the waitlist URL** on social media
5. **Monitor the admin dashboard** at `/admin/waitlist`

---

## 📞 Support

If you need help:
- Check the `/src/lib/referral-utils.ts` for all utility functions
- Email templates are in `/src/lib/email/`
- API routes are in `/src/app/api/waitlist/`

---

## ✨ Features Summary

✅ Automated unique referral codes  
✅ Email integration with Resend  
✅ Beautiful landing page  
✅ Social media sharing (6 platforms)  
✅ Reward tier system  
✅ Admin dashboard with analytics  
✅ CSV export functionality  
✅ Real-time tracking  
✅ Mobile responsive  
✅ Professional email templates  

---

## 🎉 You're Ready to Launch!

Your pre-launch referral system is complete and ready to help you build hype and grow your waitlist virally!

**Share your waitlist page and watch the referrals come in!** 🚀

