# 🏃‍♂️ GoodRunss .G0 - Trainer Dashboard

**Foundation Model** | The complete, all-in-one trainer dashboard for managing clients, sessions, payments, and growing your training business.

> **Version**: GoodRunss .G0 (Foundation Model)  
> Similar to GPT-3/4/5 or Claude 1/2/3, .G0 represents our first-generation platform with core features and AI capabilities.

## 🎯 What This Is

This is the **official GoodRunss .G0 Trainer Dashboard** - built with Next.js 15, featuring:

- ✅ **Modern v0 UI** - Clean, professional dark theme
- ✅ **Complete Backend** - Full database schema, API routes, Firebase integration
- ✅ **AI-Powered** - GIA assistant, AI personas, workout plan generation
- ✅ **Payment Ready** - Stripe Connect integration for trainers
- ✅ **Real-Time** - Firebase for messaging, notifications, live updates
- ✅ **Optimized** - Fast Vercel deployments, standalone output

---

## 📁 Project Structure

```
goodrunss-trainer-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/           # Clerk auth
│   │   └── sign-up/           # Clerk auth
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard home (stats, overview)
│   │   ├── calendar/          # Calendar & scheduling (+ group classes)
│   │   ├── clients/           # Client management
│   │   ├── payments/          # Payments & revenue
│   │   ├── analytics/         # Business analytics
│   │   ├── gia/               # AI assistant
│   │   ├── messages/          # 🆕 Client messaging
│   │   ├── ai-persona/        # 🆕 Create AI clone
│   │   ├── referrals/         # 🆕 Referral system
│   │   ├── booking-page/      # 🆕 Public booking link
│   │   └── settings/          # Profile & settings
│   └── api/                   # All API routes
├── components/                # React components
├── lib/                       # Utilities, DB client, Firebase
├── prisma/
│   └── schema.prisma          # Complete database schema
├── hooks/                     # Custom React hooks
├── .env.local                 # Environment variables
├── package.json               # Dependencies
└── next.config.ts             # Next.js config (optimized)
```

---

## 🚀 Features

### **Core Dashboard Features**
1. **Dashboard Home** - Revenue, sessions, client activity
2. **Calendar** - 1-on-1 sessions, group classes, recurring events
3. **Client Management** - Client profiles, goals, progress tracking
4. **Payments** - Stripe integration, invoices, revenue tracking
5. **Analytics** - Business insights, growth metrics
6. **Settings** - Profile, availability, pricing

### **AI Features (GIA)**
7. **GIA AI Assistant** - Generate marketing, social posts, emails
8. **AI Personas** - Create AI clone of yourself ($0.30/session earnings)
9. **Auto Workout Plans** - AI-generated plans for clients

### **Growth & Automation**
10. **Referral System** - Share links, track referrals, earn rewards
11. **Public Booking Page** - Custom URL (goodrunss.com/book/your-name)
12. **Auto-Rescheduling** - Smart conflict detection & resolution
13. **Scheduled Notifications** - Session reminders, follow-ups
14. **Messaging** - Real-time client chat

### **Advanced Backend**
- **Stripe Connect** - Direct payouts to trainers
- **Firebase** - Real-time messaging, notifications, sync
- **Subscription Tiers** - Free/Basic/Pro/Elite plans
- **Workout Plans** - AI-generated, adaptive training programs
- **Waitlist** - Auto-notify clients when slots open
- **Reviews & Ratings** - Build reputation
- **Multi-currency** - International support
- **Safety & Moderation** - Reporting, verification

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: Clerk
- **Payments**: Stripe & Stripe Connect
- **Real-time**: Firebase (Firestore, FCM, Storage)
- **AI**: Anthropic Claude, Google Gemini
- **Email**: Resend
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Error Tracking**: Sentry

---

## 📦 Installation

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GEMINI_API_KEY="..."

# Email
RESEND_API_KEY="re_..."
```

### 3. Set Up Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deployment

### Deploy to Vercel

1. **Connect Repo** to Vercel
2. **Add Environment Variables** (from `.env.local`)
3. **Deploy**

Vercel will automatically:
- Build with `output: 'standalone'` for fast deploys
- Optimize images and packages
- Deploy Sentry source maps (production only)

---

## 🗄️ Database Models

The Prisma schema includes **50+ models** for:

- **Users** - Trainers, clients, admin roles
- **Sessions** - Training sessions, group classes
- **Payments** - Stripe payments, refunds, payouts
- **Clients** - Client profiles, goals, notes
- **Analytics** - Revenue, sessions, growth metrics
- **Reviews** - Ratings & feedback
- **Messages** - Real-time trainer-client chat
- **AI Personas** - Trainer AI clones
- **Workout Plans** - AI-generated training programs
- **Referrals** - Viral growth tracking
- **Subscriptions** - Free/Pro/Elite tiers
- **Notifications** - Scheduled reminders
- **Public Bookings** - Pre-app booking system
- **Waitlist** - Auto-notify when available
- **Auto-Rescheduling** - Smart conflict resolution
- **Internationalization** - Multi-language, multi-currency
- **Safety & Moderation** - Reports, bans, verification

---

## 🔑 Key Features Explained

### **1. Calendar with Group Classes**
- Create 1-on-1 sessions
- **Group fitness classes** (NEW!)
- Recurring sessions
- Drag-and-drop rescheduling
- Conflict detection
- Google Calendar sync

### **2. AI Persona (Trainer AI Clone)**
Trainers can create an AI version of themselves:
- Upload voice sample (ElevenLabs integration)
- Set personality traits
- Earn $0.30 per AI session
- Players chat with your AI when you're busy

### **3. GIA (AI Assistant)**
Generate content instantly:
- Marketing copy
- Social media posts
- Client emails
- Workout plans
- Business advice

### **4. Auto-Rescheduling**
AI detects scheduling conflicts and:
- Suggests alternative time slots
- Notifies clients automatically
- Respects trainer & client preferences
- Tracks success metrics

### **5. Public Booking Page**
Each trainer gets a custom URL:
```
goodrunss.com/book/your-name
```
- Clients book without signing up
- Payment collected upfront
- Auto-confirmation
- Embeddable widget for your website

### **6. Referral System**
- Generate referral links
- Track conversions
- Earn rewards
- Viral sharing to social media

---

## 📊 API Routes

### **Payments**
- `/api/stripe/connect` - Stripe Connect onboarding
- `/api/stripe/webhook` - Stripe webhook handler
- `/api/payments` - Payment CRUD

### **Sessions**
- `/api/sessions` - Session CRUD
- `/api/sessions/[id]` - Get/Update session

### **Clients**
- `/api/clients` - Client CRUD

### **AI**
- `/api/gia` - GIA AI assistant
- `/api/ai-persona` - Create/manage AI persona
- `/api/workout-plans` - Generate plans

### **Referrals**
- `/api/referrals/create` - Create referral
- `/api/referrals/track` - Track conversion

### **Public Booking**
- `/api/public/book` - Accept public bookings
- `/api/public/availability` - Check availability

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 Environment Setup Checklist

- [ ] Supabase project created
- [ ] Clerk app configured
- [ ] Stripe Connect enabled
- [ ] Firebase project created (with Firestore, Storage, FCM)
- [ ] Anthropic API key obtained
- [ ] Resend account set up
- [ ] Environment variables added to `.env.local`
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Vercel project connected

---

## 🆘 Common Issues

### **Issue: Vercel deployment slow**
✅ **Fixed**: Using `output: 'standalone'` and `.vercelignore`

### **Issue: Clerk hydration errors**
✅ **Fixed**: Auth pages use `'use client'` and `dynamic = 'force-dynamic'`

### **Issue: npm install fails**
✅ **Fix**: Use `npm install --legacy-peer-deps`

---

## 🎨 Design System

Built with **shadcn/ui** components:
- Dark theme by default
- Consistent spacing & typography
- Accessible (WCAG AA)
- Mobile-responsive
- Modern animations

---

## 📈 Roadmap

### **Completed** ✅
- Dashboard Home
- Calendar (basic)
- Clients
- Payments
- Analytics
- GIA AI
- Settings
- Database schema
- Clerk auth
- Stripe integration
- Firebase setup

### **In Progress** 🚧
- Group classes in calendar
- Messaging page
- AI Persona page
- Referrals page
- Public booking page

### **Upcoming** 📅
- Mobile app sync
- Multi-language support
- Advanced analytics
- Team management (facilities)
- White-label options

---

## 💡 Tips for Trainers

1. **Set up Stripe Connect first** - Required for payments
2. **Create your public booking page** - Share on Instagram/TikTok
3. **Try GIA for content** - Generate social posts in seconds
4. **Build your AI persona** - Earn passive income ($0.30/session)
5. **Enable auto-rescheduling** - Save hours per week
6. **Use referral system** - Grow faster with incentives

---

## 🔒 Security

- **Authentication**: Clerk (industry-standard)
- **Database**: Row-level security via Prisma
- **API Routes**: Server-side validation
- **Payments**: PCI-compliant via Stripe
- **Firebase**: Security rules deployed
- **Environment Variables**: Never committed to git

---

## 📞 Support

- **Trainer Support**: support@goodrunss.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **Documentation**: [goodrunss.com/docs](https://goodrunss.com/docs)

---

## 📄 License

Proprietary - GoodRunss Inc. © 2025

---

**Built for trainers, by trainers.** 🏃‍♂️💪

# Force fresh deploy
# Force rebuild
