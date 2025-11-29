# ⚡ Quick Integration Guide - 3 New Pages

**Time Required:** 15-30 minutes  
**Difficulty:** Easy (copy/paste)

---

## 📦 STEP 1: Install Sonner (1 minute)

```bash
npm install sonner
```

---

## 🎨 STEP 2: Add Toaster to Layout (2 minutes)

**File:** `app/layout.tsx`

Add this import at the top:
```tsx
import { Toaster } from 'sonner'
```

Add `<Toaster />` before closing `</body>` tag:
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster 
          position="top-right"
          theme="dark"
          richColors
        />
      </body>
    </html>
  )
}
```

---

## 📄 STEP 3: Create Page Files (10 minutes)

### Page 1: GIA Content Generator

1. Create folder: `app/dashboard/gia/`
2. Create file: `app/dashboard/gia/page.tsx`
3. Open `NEW_PAGES_FOR_V0.md`
4. Copy **Section 1** (lines 17-500)
5. Paste into `page.tsx`
6. Save

### Page 2: AI Persona Studio

1. Create folder: `app/dashboard/ai-persona/`
2. Create file: `app/dashboard/ai-persona/page.tsx`
3. Open `NEW_PAGES_FOR_V0.md`
4. Copy **Section 2** (lines 508-1000)
5. Paste into `page.tsx`
6. Save

### Page 3: Billing & Subscriptions

1. Create folder: `app/dashboard/billing/`
2. Create file: `app/dashboard/billing/page.tsx`
3. Open `NEW_PAGES_FOR_V0.md`
4. Copy **Section 3** (lines 1008-end)
5. Paste into `page.tsx`
6. Save

---

## ✅ STEP 4: Test Locally (5 minutes)

```bash
npm run dev
```

Visit:
- http://localhost:3000/dashboard/gia
- http://localhost:3000/dashboard/ai-persona
- http://localhost:3000/dashboard/billing

Check:
- ✅ Pages load without errors
- ✅ Design matches existing dashboard
- ✅ All buttons/interactions work
- ✅ Toast notifications appear

---

## 🔧 TROUBLESHOOTING

### Error: "Module not found: @/contexts/language-context"
**Fix:** Make sure `contexts/language-context.tsx` exists in your project

### Error: "Module not found: @/components/ui/[component]"
**Fix:** Install missing shadcn component:
```bash
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add tabs
# etc.
```

### Error: "cn is not defined"
**Fix:** Make sure `lib/utils.ts` exists with the `cn` function:
```tsx
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### API Errors (404)
**Fix:** Backend API routes already exist. Check:
- Backend is running
- Environment variables are set
- Database is connected

---

## 📱 STEP 5: Update Navigation (Optional)

Your sidebar already has these links! Check `components/sidebar.tsx`:
```tsx
{ name: t("gia"), href: "/dashboard/gia", icon: MessageSquare },
{ name: t("aiPersona"), href: "/dashboard/ai-persona", icon: Zap },
{ name: t("billing"), href: "/dashboard/billing", icon: CreditCard },
```

If missing, add them to the `navigation` array.

---

## 🚀 DONE!

Your 3 new pages are now integrated and working!

**Next Steps:**
1. Set up Stripe products (see `🎯_PROJECT_STATUS_FINAL.md`)
2. Run database migration (`npx prisma db push`)
3. Deploy to Vercel
4. Launch! 🎉

---

## 📋 CHECKLIST

- [ ] Installed sonner
- [ ] Added Toaster to layout
- [ ] Created `app/dashboard/gia/page.tsx`
- [ ] Created `app/dashboard/ai-persona/page.tsx`
- [ ] Created `app/dashboard/billing/page.tsx`
- [ ] Tested all 3 pages locally
- [ ] Fixed any errors
- [ ] Ready to deploy!

---

## 💡 WHAT EACH PAGE DOES

### GIA Content Generator
- Generates AI-powered content (social posts, emails, blogs)
- 7 content types with 10+ templates each
- Save to library, copy to clipboard
- Usage tracking per subscription tier

### AI Persona Studio
- Create AI clones of trainers
- Voice training & customization
- Analytics dashboard
- $0.30/session royalty tracking

### Billing & Subscriptions
- View current plan (Free/Starter/Pro/Elite)
- Upgrade/downgrade subscription
- Usage meters (GIA queries, AI personas, workouts)
- Payment history
- Manage billing via Stripe

---

**Questions?** Check `🎯_PROJECT_STATUS_FINAL.md` for full documentation.

