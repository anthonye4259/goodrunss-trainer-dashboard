# 🔄 Referral System Flow Diagram

Visual representation of how the GoodRunss referral system works.

---

## 📊 User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER LANDS ON /waitlist                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Has Referral Code in URL?   │
         │   (?ref=GOODRUNSS-ALEX-K8M2)  │
         └────────┬──────────────┬────────┘
                  │              │
            YES   │              │   NO
                  │              │
                  ▼              ▼
    ┌─────────────────┐    ┌──────────────┐
    │ Show "Invited   │    │   Standard   │
    │  by" message    │    │  Sign up     │
    └────────┬────────┘    └──────┬───────┘
             │                    │
             └──────────┬─────────┘
                        │
                        ▼
         ┌────────────────────────────┐
         │   User Fills Form:         │
         │   - Email (required)       │
         │   - Name (optional)        │
         │   - Type (player/trainer)  │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  POST /api/waitlist/signup │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Generate Unique Code      │
         │  GOODRUNSS-NAME-XXXX       │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Save to Database          │
         │  - Create WaitlistSignup   │
         │  - Link to Referrer        │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Send Welcome Email 📧     │
         │  (via Resend)              │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Show Success Screen       │
         │  - Your referral code      │
         │  - Share buttons           │
         │  - Current tier/rewards    │
         └────────────────────────────┘
```

---

## 🎁 Referral Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              USER A (Referrer) Signs Up                         │
│              Gets Code: GOODRUNSS-ALICE-X7K2                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   User A Shares Their Code    │
         │   via Social/Email/Copy       │
         └────────┬──────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────────────┐
    │  POST /api/waitlist/share               │
    │  - Track share event                    │
    │  - Increment shareCount                 │
    └─────────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  User B Clicks Link        │
         │  /waitlist?ref=GOODRUNSS-  │
         │  ALICE-X7K2                │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  User B Signs Up           │
         │  With referredBy field     │
         └────────────┬───────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────┐
    │  Database Updates:                      │
    │  1. Create User B with referredBy       │
    │  2. Increment User A's referralCount    │
    │  3. Create ReferralEvent                │
    └─────────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Calculate User A's Tier   │
         │  Based on referralCount    │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Did User A Reach New Tier?│
         └────────┬────────────┬──────┘
                  │            │
            YES   │            │   NO
                  │            │
                  ▼            ▼
    ┌───────────────────┐    Done
    │  Send Milestone   │
    │  Email 🎉         │
    │  "Congrats! Gold" │
    └───────────────────┘
```

---

## 📧 Email Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Email Triggers                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  1. WELCOME EMAIL               │
        │  Trigger: User signs up         │
        │  Template: welcomeEmailTemplate │
        │  Contains:                      │
        │  - Their referral code          │
        │  - Reward tiers explanation     │
        │  - Share buttons                │
        └─────────────────┬───────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  2. REFERRAL INVITE EMAIL       │
        │  Trigger: User sends invites    │
        │  Template: referralInviteTemplate│
        │  Contains:                      │
        │  - Who invited them             │
        │  - Referral code                │
        │  - What GoodRunss is            │
        │  - Join button                  │
        └─────────────────┬───────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  3. MILESTONE EMAIL             │
        │  Trigger: User reaches new tier │
        │  Template: milestoneEmailTemplate│
        │  Contains:                      │
        │  - Congratulations message      │
        │  - Current rewards earned       │
        │  - Progress to next tier        │
        │  - Share buttons                │
        └─────────────────────────────────┘

All emails sent via Resend API
↓
Delivery tracked in EmailLog table
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │   Landing     │  │   Admin          │  │   Components    │ │
│  │   Page        │  │   Dashboard      │  │   - ShareButtons│ │
│  │   /waitlist   │  │   /admin/waitlist│  │   - Stats       │ │
│  └───────┬───────┘  └────────┬─────────┘  └────────┬────────┘ │
│          │                   │                      │          │
└──────────┼───────────────────┼──────────────────────┼──────────┘
           │                   │                      │
           │                   │                      │
┌──────────▼───────────────────▼──────────────────────▼──────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  /api/waitlist │  │  /api/admin │  │  Email Service     │  │
│  │  - signup      │  │  - waitlist │  │  - sendWelcome     │  │
│  │  - stats       │  │  - export   │  │  - sendInvite      │  │
│  │  - share       │  │             │  │  - sendMilestone   │  │
│  │  - send-invites│  │             │  │                    │  │
│  └────────┬───────┘  └──────┬──────┘  └─────────┬──────────┘  │
│           │                 │                    │             │
└───────────┼─────────────────┼────────────────────┼─────────────┘
            │                 │                    │
            │                 │                    │
┌───────────▼─────────────────▼────────────────────▼─────────────┐
│                      DATABASE (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ WaitlistSignup   │  │ ReferralEvent  │  │ EmailLog       │ │
│  │ - email          │  │ - signupId     │  │ - emailType    │ │
│  │ - referralCode   │  │ - eventType    │  │ - status       │ │
│  │ - referralCount  │  │ - platform     │  │ - sentAt       │ │
│  │ - tier           │  │ - createdAt    │  │                │ │
│  └──────────────────┘  └────────────────┘  └────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
            │
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Resend API   │  │  Social Media   │  │  Analytics      │  │
│  │  Email Sending│  │  Share Links    │  │  (Future)       │  │
│  └───────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Reward Tier Progression

```
        START
          │
          ▼
    ┌──────────┐
    │  BRONZE  │  0-2 Referrals
    │    🥉    │  Early Access
    └────┬─────┘
         │ Refer 3 people
         ▼
    ┌──────────┐
    │  SILVER  │  3-9 Referrals
    │    🥈    │  + 1 Month Free
    └────┬─────┘
         │ Refer 10 people
         ▼
    ┌──────────┐
    │   GOLD   │  10-24 Referrals
    │    🥇    │  + 3 Months Free
    └────┬─────┘
         │ Refer 25 people
         ▼
    ┌──────────┐
    │ PLATINUM │  25+ Referrals
    │    💎    │  + 1 Year Free
    │          │  + VIP Status
    └──────────┘
```

---

## 📱 Social Sharing Flow

```
User clicks "Share" button
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Generate Share URLs with code      │
    │  - Email: mailto: link              │
    │  - Twitter: twitter.com/intent/tweet│
    │  - Facebook: facebook.com/sharer    │
    │  - LinkedIn: linkedin.com/sharing   │
    │  - WhatsApp: wa.me/?text=...        │
    │  - Copy: navigator.clipboard.write  │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  POST /api/waitlist/share           │
    │  - Track platform used              │
    │  - Increment shareCount             │
    │  - Create ReferralEvent             │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  Open share window / Copy to        │
    │  clipboard / Send email             │
    └─────────────────────────────────────┘
```

---

## 🔐 Data Flow & Security

```
┌─────────────────────────────────────────┐
│  User Input (Email, Name, etc.)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Validation Layer                       │
│  - Email format check                   │
│  - Duplicate email check                │
│  - Referral code validation             │
│  - Input sanitization                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Business Logic                         │
│  - Generate unique referral code        │
│  - Calculate tier and rewards           │
│  - Track referrer relationship          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Database (via Prisma ORM)              │
│  - SQL injection protection             │
│  - Transaction management               │
│  - Relationship integrity               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Response to User                       │
│  - Success: Return referral code        │
│  - Error: Return error message          │
└─────────────────────────────────────────┘
```

---

## 📊 Admin Analytics Flow

```
Admin visits /admin/waitlist
         │
         ▼
GET /api/admin/waitlist
         │
         ▼
┌────────────────────────────────────────┐
│  Aggregate Queries:                    │
│  - Total signups by user type          │
│  - Referral counts and sums            │
│  - Tier distribution                   │
│  - Daily signup trends                 │
│  - Top referrers ranking               │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  Format Data for Dashboard:            │
│  - Stats cards                         │
│  - Charts and graphs                   │
│  - Tables with pagination              │
│  - Export functionality                │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  Render Admin Dashboard                │
│  - Real-time stats                     │
│  - Filter and sort options             │
│  - Export CSV button                   │
└────────────────────────────────────────┘
```

---

## 🚀 Deployment Flow

```
┌─────────────────────────────────────────┐
│  1. Set Environment Variables           │
│     - RESEND_API_KEY                    │
│     - DATABASE_URL                      │
│     - NEXT_PUBLIC_APP_URL               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Run Database Migration              │
│     npx prisma migrate deploy           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Generate Prisma Client              │
│     npx prisma generate                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Build Next.js App                   │
│     npm run build                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Deploy to Production                │
│     - Vercel / Netlify / Custom         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  6. Test Production                     │
│     - Sign up flow                      │
│     - Email sending                     │
│     - Share functionality               │
│     - Admin dashboard                   │
└─────────────────────────────────────────┘
```

---

Made with ❤️ for GoodRunss 🏃‍♂️

